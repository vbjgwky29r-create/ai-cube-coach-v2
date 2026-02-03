# 魔方公式OCR识别功能备份

## 功能说明

从截图（魔方星球、CSTimer等APP）自动识别打乱公式和解法公式。

## 文件结构

```
backup-ocr-feature/
├── ocr/                    # API路由
│   └── route.ts           # 百度OCR后端API
├── ocr.ts                 # 前端OCR工具库
└── README.md             # 本文档
```

## 环境变量配置

在 `.env.local` 中添加百度OCR密钥：

```bash
# 百度OCR配置
BAIDU_OCR_API_KEY=你的API_KEY
BAIDU_OCR_SECRET_KEY=你的SECRET_KEY
```

### 获取百度OCR密钥

1. 访问 [百度AI开放平台](https://ai.baidu.com/tech/ocr)
2. 注册/登录账号
3. 创建应用，选择"通用文字识别"
4. 获取 API Key 和 Secret Key

免费额度：每天500次调用

## 增强的后处理修复

### 1. 过滤垃圾内容
跳过包含以下特征的行：
- 连续4+重复字符（如 LLLLL）
- 包含"录像"、"CROSS"、"F2L"、"OLL"、"PLL"、"CFOP"等非公式内容

### 2. 增强单引号修复
- 检测连续相同字母（如 FF）→ 推断为 F' F
- 原有的 `, ,, . → ' 修复

## 安装依赖

```bash
npm install tesseract.js
```

## API使用

### POST /api/ocr

请求：
```json
{
  "image": "base64编码的图片（不含前缀）"
}
```

响应：
```json
{
  "text": "识别出的完整文本",
  "wordsResult": [
    { "words": "R U R' U'" },
    { "words": "打乱公式" }
  ]
}
```

## 前端调用示例

```typescript
import { recognizeCubeFormulas } from '@/lib/utils/ocr'

const result = await recognizeCubeFormulas(imageFile)
console.log(result.scramble)   // 打乱公式
console.log(result.solution)   // 解法公式
console.log(result.confidence)  // 置信度
```

## 识别逻辑

1. 优先使用百度云端OCR（高精度）
2. 回退到Tesseract.js（本地，无需网络）
3. 智能提取打乱和解法公式：
   - 通过关键词识别区域（"打乱"、"复原公式"）
   - 按步数判断（打乱15-25步，解法通常更长）
4. OCR错误修复：
   - 修正单引号识别错误
   - 修复空格缺失
   - 过滤垃圾内容

## 已知问题

1. 单引号识别可能不准确，需要用户手动修正
2. 复杂截图可能识别失败
3. 手写公式不支持

## 改进建议

如果识别效果不够理想：
1. 使用更高精度的付费OCR服务（阿里云OCR、腾讯OCR）
2. 针对魔方公式做专门的训练模型
3. 添加用户手动修正的功能

## 恢复方法

将文件复制回原位置：
```bash
cp -r backup-ocr-feature/ocr app/api/
cp backup-ocr-feature/ocr.ts lib/utils/
```
