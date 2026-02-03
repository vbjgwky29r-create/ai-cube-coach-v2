# 百度OCR密钥配置

## 获取方式

1. 访问 https://cloud.baidu.com/product/ocr
2. 注册/登录百度智能云账号
3. 进入"管理控制台" → "人工智能" → "文字识别"
4. 点击"创建应用"
5. 填写应用名称，选择"通用文字识别（标准版）"
6. 创建完成后获取：
   - **API Key** (AppID)
   - **Secret Key**

## 配置方法

在项目根目录创建 `.env.local` 文件：

```bash
BAIDU_OCR_API_KEY=你的API_KEY
BAIDU_OCR_SECRET_KEY=你的SECRET_KEY
```

## 重要提示

⚠️ **不要将 `.env.local` 提交到Git仓库**

确保 `.gitignore` 包含：
```
.env.local
.env*.local
```

## 免费额度

- 通用文字识别：每天500次
- 有效期：1年（需要定期续期）

## 付费额度

如需更多调用次数：
- 标准版：¥0.002/次
- 高精度版：¥0.004/次

查看详情：https://cloud.baidu.com/product/ocr/pricing
