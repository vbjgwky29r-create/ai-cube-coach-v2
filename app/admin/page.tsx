'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, RefreshCw, Lock } from "lucide-react"

// 🔑 请修改为你自己的密码
const ADMIN_PASSWORD = "your-admin-password-2024"

// 激活码格式: ACT-XXXXX-XXXXX-XXXXX
function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去掉易混淆的字符
  const segments = 3
  const segmentLength = 5
  let code = 'ACT-'
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < segmentLength; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < segments - 1) code += '-'
  }
  return code
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [plan, setPlan] = useState('pro')
  const [activationCode, setActivationCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [savedCodes, setSavedCodes] = useState<Array<{email: string, code: string, plan: string, date: string}>>([])

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('密码错误，请重试')
    }
  }

  const generateCode = () => {
    if (!email) {
      alert('请输入用户邮箱')
      return
    }
    const newCode = generateActivationCode()
    setActivationCode(newCode)

    // 保存到列表
    setSavedCodes(prev => [...prev, {
      email,
      code: newCode,
      plan,
      date: new Date().toLocaleString('zh-CN')
    }])
  }

  const copyCode = () => {
    navigator.clipboard.writeText(activationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyEmailTemplate = () => {
    const planName = plan === 'pro' ? 'Pro 版 (¥29/月)' : '爱好者版 (¥9/月)'
    const features = plan === 'pro'
      ? '无限次解法分析 + AI深度讲解 + 智能复习系统'
      : '每天20次解法分析 + AI优化建议 + 公式库访问'

    const template = `您好，

感谢购买 弘弈AI魔方教练 会员！

您的激活码: ${activationCode}
套餐: ${planName}

激活方式:
1. 访问网站并登录账号
2. 进入个人中心
3. 输入激活码即可激活

会员权益:
${features}

激活码有效期为购买后30天，请及时激活。

如有问题请随时联系：
微信: cube-coach
邮箱: api@cubecoach.com

---
弘弈AI魔方教练 团队`

    navigator.clipboard.writeText(template)
    alert('邮件模板已复制到剪贴板')
  }

  // 登录界面
  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto py-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              管理后台登录
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>管理员密码</Label>
              <Input
                type="password"
                placeholder="输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && login()}
              />
            </div>
            <Button onClick={login} className="w-full">
              登录
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              提示: 如需修改密码，请编辑 app/admin/page.tsx 中的 ADMIN_PASSWORD
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 管理界面
  return (
    <div className="container max-w-4xl py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">会员激活码管理后台</h1>
        <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
          退出登录
        </Button>
      </div>

      {/* 生成器 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>生成新激活码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>用户邮箱</Label>
            <Input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>套餐</Label>
            <select
              className="w-full p-2 border rounded"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="hobby">爱好者版 (¥9/月)</option>
              <option value="pro">Pro 版 (¥29/月)</option>
            </select>
          </div>

          <Button onClick={generateCode} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            生成激活码
          </Button>

          {activationCode && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <Label className="text-green-800">生成的激活码</Label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 p-3 bg-white rounded text-lg font-mono text-center tracking-wider">
                  {activationCode}
                </code>
                <Button size="sm" variant="outline" onClick={copyCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={copyEmailTemplate}
              >
                复制邮件模板
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 已发放的激活码 */}
      <Card>
        <CardHeader>
          <CardTitle>已发放的激活码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">邮箱</th>
                  <th className="text-left py-2">套餐</th>
                  <th className="text-left py-2">激活码</th>
                  <th className="text-left py-2">时间</th>
                </tr>
              </thead>
              <tbody>
                {savedCodes.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.plan === 'pro' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {item.plan === 'pro' ? 'Pro版' : '爱好者版'}
                      </span>
                    </td>
                    <td className="py-2 font-mono">{item.code}</td>
                    <td className="py-2 text-muted-foreground">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {savedCodes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">暂无记录</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
