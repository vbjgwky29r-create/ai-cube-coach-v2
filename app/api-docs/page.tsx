import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

const codeExamples = {
  curl: `curl -X POST https://api.cubecoach.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "scramble": "R U R\\' U\\' R\\' F R2 U\\' R\\' U\\' R U R\\' F\\'",
    "solution": "R U R\\' U\\' R\\' F R F\\' U2 R U R\\' F\\'"
  }'`,

  javascript: `const response = await fetch('https://api.cubecoach.com/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scramble: "R U R' U' R' F R2 U' R' U' R U R' F'",
    solution: "R U R' U' R' F R F' U2 R U R' F'"
  })
})

const data = await response.json()
console.log(data)`,

  python: `import requests

response = requests.post(
    'https://api.cubecoach.com/v1/analyze',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'scramble': "R U R' U' R' F R2 U' R' U' R U R' F'",
        'solution': "R U R' U' R' F R F' U2 R U R' F'"
    }
)

data = response.json()
print(data)`,

  typescript: `interface AnalyzeRequest {
  scramble: string
  solution: string
}

interface AnalyzeResponse {
  summary: {
    steps: number
    optimalSteps: number
    efficiency: number
    estimatedTime: number
  }
  formulas: Array<{
    id: string
    name: string
    category: string
    method: string
  }>
  optimizations: Array<{
    from: string
    to: string
    savings: number
  }>
  validation: {
    isValid: boolean
    isSolved: boolean
  }
}

const response = await fetch('https://api.cubecoach.com/v1/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scramble: "R U R' U' R' F R2 U' R' U' R U R' F'",
    solution: "R U R' U' R' F R F' U2 R U R' F'"
  })
})

const data: AnalyzeResponse = await response.json()`
}

export default function ApiDocsPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="container py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
              v1.0
            </span>
            <span className="text-muted-foreground">REST API</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            弘弈AI魔方教练 API
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            强大的魔方分析 API，支持解法分析、公式识别、优化建议等功能。
            几行代码即可集成到你的应用中。
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/pricing">获取 API Key</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="mailto:dev@cubecoach.com">联系技术支持</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Base URL */}
      <section className="container pb-12">
        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">API 基础 URL</p>
                <code className="bg-muted px-3 py-1.5 rounded text-sm">
                  https://api.cubecoach.com/v1
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">认证方式</p>
                <code className="bg-muted px-3 py-1.5 rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Authentication */}
      <section className="container pb-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">认证</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground">
                所有 API 请求需要在 Header 中包含你的 API Key：
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxx`}</code>
              </pre>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>安全提示:</strong> 请勿在客户端代码（如浏览器JavaScript）中暴露你的API Key。
                  API Key 应该只在服务器端使用。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="container pb-12">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">API 端点</h2>

          {/* Analyze Endpoint */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-mono font-bold">
                  POST
                </span>
                <CardTitle className="text-lg">/analyze</CardTitle>
              </div>
              <p className="text-muted-foreground">
                分析魔方解法，返回优化建议和效率评分
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Request */}
              <div>
                <h3 className="font-semibold mb-3">请求参数</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">{`{
  "scramble": string,  // 打乱公式 (必填)
  "solution": string  // 用户解法 (必填)
}`}</pre>
                </div>
              </div>

              {/* Response */}
              <div>
                <h3 className="font-semibold mb-3">响应格式</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto">{`{
  "summary": {
    "steps": 14,           // 用户步数
    "optimalSteps": 12,    // 最优步数
    "efficiency": 8.5,     // 效率评分 (0-10)
    "estimatedTime": 4.9   // 预估用时(秒)
  },
  "formulas": [
    {
      "id": "pll_t',
      "name': "T-Perm',
      "category': "PLL',
      "method': "CFOP',
      "difficulty': 3
    }
  ],
  "optimizations": [
    {
      "from': "R U R' U' (多次)',
      "to': "考虑使用更直接的公式',
      "savings': 2
    }
  ],
  "validation": {
    "isValid': true,
    "isSolved': true
  }
}`}</pre>
                </div>
              </div>

              {/* Errors */}
              <div>
                <h3 className="font-semibold mb-3">错误码</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">400</code>
                    <span className="text-sm">缺少必要参数</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">401</code>
                    <span className="text-sm">API Key 无效</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">429</code>
                    <span className="text-sm">超出配额限制</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded">
                    <code className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-mono">500</code>
                    <span className="text-sm">服务器内部错误</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="container pb-20">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">代码示例</h2>

          <Tabs defaultValue="curl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            </TabsList>

            <TabsContent value="curl">
              <Card>
                <CardContent className="pt-6">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{codeExamples.curl}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="javascript">
              <Card>
                <CardContent className="pt-6">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{codeExamples.javascript}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card>
                <CardContent className="pt-6">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{codeExamples.python}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typescript">
              <Card>
                <CardContent className="pt-6">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{codeExamples.typescript}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">速率限制</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  不同套餐有不同的速率限制：
                </p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">套餐</th>
                      <th className="text-center py-3">每月调用</th>
                      <th className="text-center py-3">每分钟限制</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3">免费版</td>
                      <td className="text-center py-3">100 次</td>
                      <td className="text-center py-3">10 次/分</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Pro 版</td>
                      <td className="text-center py-3">1,000 次</td>
                      <td className="text-center py-3">60 次/分</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 font-semibold">开发者 API</td>
                      <td className="text-center py-3 font-semibold">10,000 次</td>
                      <td className="text-center py-3 font-semibold">300 次/分</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold">企业版</td>
                      <td className="text-center py-3 font-semibold">100,000 次</td>
                      <td className="text-center py-3 font-semibold">1000 次/分</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="container py-20">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Webhook 通知</h2>
          <Card>
            <CardHeader>
              <CardTitle>配置 Webhook</CardTitle>
              <p className="text-muted-foreground">
                开发者 API 和企业版支持 Webhook，当分析完成时会主动通知你的服务器。
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Webhook 请求格式:</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">{`POST https://your-domain.com/webhook
Content-Type: application/json

{
  "event": "analysis.completed",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "analysisId": "anl_xxxxxxxxxxxx",
    "scramble": "R U R' U'...",
    "result": { ... }
  }
}`}</pre>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>提示:</strong> Webhook 端点需要返回 200 状态码来确认接收。
                  如果返回非 200 状态码，我们会重试最多 3 次，间隔分别为 1 分钟、5 分钟、30 分钟。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-muted-foreground mb-8">
            获取 API Key，几行代码即可集成
          </p>
          <Button size="lg" asChild>
            <Link href="/pricing">查看定价方案</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
