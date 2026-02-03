/**
 * 百度OCR API路由
 * 在服务器端调用百度OCR，避免API Key暴露在浏览器
 */

import { NextRequest, NextResponse } from 'next/server'

// 百度OCR配置
const BAIDU_OCR_CONFIG = {
  apiKey: process.env.BAIDU_OCR_API_KEY || '',
  secretKey: process.env.BAIDU_OCR_SECRET_KEY || '',
  apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'
}

let accessTokenCache: { token: string; expiry: number } | null = null

/**
 * 获取百度OCR访问令牌
 */
async function getAccessToken(): Promise<string> {
  if (accessTokenCache && Date.now() < accessTokenCache.expiry) {
    return accessTokenCache.token
  }

  if (!BAIDU_OCR_CONFIG.apiKey || !BAIDU_OCR_CONFIG.secretKey) {
    throw new Error('百度OCR配置缺失')
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR_CONFIG.apiKey}&client_secret=${BAIDU_OCR_CONFIG.secretKey}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.error) {
    throw new Error(`获取访问令牌失败: ${data.error_description}`)
  }

  accessTokenCache = {
    token: data.access_token,
    expiry: Date.now() + (data.expires_in - 300) * 1000
  }

  return data.access_token
}

/**
 * POST /api/ocr
 * 接收图片base64，调用百度OCR识别
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 })
    }

    // 获取访问令牌
    const accessToken = await getAccessToken()

    // 调用百度OCR API
    const formData = new URLSearchParams()
    formData.append('image', image)
    formData.append('language_type', 'CHN_ENG')
    formData.append('detect_direction', 'false')

    const response = await fetch(`${BAIDU_OCR_CONFIG.apiUrl}?access_token=${accessToken}`, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (data.error_code) {
      return NextResponse.json(
        { error: `识别失败: ${data.error_msg}` },
        { status: 500 }
      )
    }

    // 拼接识别文本
    const text = data.words_result
      ?.map((item: { words: string }) => item.words)
      .join('\n') || ''

    return NextResponse.json({
      text,
      wordsResult: data.words_result || []
    })

  } catch (error: any) {
    console.error('[OCR API] 错误:', error)
    return NextResponse.json(
      { error: error.message || 'OCR识别失败' },
      { status: 500 }
    )
  }
}
