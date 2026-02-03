'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '魔方爱好者',
    email: 'user@example.com',
    level: 'INTERMEDIATE',
  })

  const [subscription, setSubscription] = useState({
    tier: 'PRO',
    status: 'active',
    currentPeriodEnd: '2025-03-02',
    cancelAtPeriodEnd: false,
  })

  const [apiKey, setApiKey] = useState('pk_live_demo_key_placeholder')
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSaveProfile = () => {
    alert('资料已保存')
  }

  const handleCancelSubscription = () => {
    if (confirm('确定要取消订阅吗？取消后你可以使用到当前周期结束。')) {
      setSubscription({ ...subscription, cancelAtPeriodEnd: true })
      alert('订阅已设置为到期取消')
    }
  }

  const handleReinstateSubscription = () => {
    setSubscription({ ...subscription, cancelAtPeriodEnd: false })
    alert('订阅已恢复')
  }

  const handleGenerateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiKey(newKey)
  }

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">
          管理你的账号、订阅和API密钥
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">个人资料</TabsTrigger>
          <TabsTrigger value="subscription">订阅管理</TabsTrigger>
          <TabsTrigger value="api">API密钥</TabsTrigger>
          <TabsTrigger value="danger">危险操作</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>个人资料</CardTitle>
              <CardDescription>
                更新你的个人信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">昵称</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">邮箱</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">当前等级</label>
                <Input value={profile.level === 'INTERMEDIATE' ? '进阶' : '初学者'} disabled />
              </div>
              <Button onClick={handleSaveProfile}>保存更改</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>订阅管理</CardTitle>
              <CardDescription>
                管理你的Pro订阅
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">当前计划: Pro 版</p>
                  <p className="text-sm text-muted-foreground">
                    状态: {subscription.status === 'active' ? '活跃' : '已取消'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    到期日: {subscription.currentPeriodEnd}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">¥29/月</p>
                </div>
              </div>

              {/* Actions */}
              {subscription.cancelAtPeriodEnd ? (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <p className="font-medium mb-2">订阅将在到期后取消</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    你可以继续使用到 {subscription.currentPeriodEnd}
                  </p>
                  <Button onClick={handleReinstateSubscription} variant="outline">
                    恢复订阅
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button variant="outline" asChild>
                      <a href="/pricing">升级计划</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="mailto:support@example.com">联系客服</a>
                    </Button>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      不再需要Pro订阅？
                    </p>
                    <Button onClick={handleCancelSubscription} variant="destructive">
                      取消订阅
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">支付方式</p>
                <p className="text-sm text-muted-foreground">
                  微信支付 (**** 1234)
                </p>
                <Button variant="link" className="p-0 h-auto text-sm">
                  更换支付方式
                </Button>
              </div>

              {/* Invoice */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">账单历史</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-muted rounded">
                    <span>2025年2月 - Pro版月付</span>
                    <span>¥29.00</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-muted rounded">
                    <span>2025年1月 - Pro版月付</span>
                    <span>¥29.00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API密钥</CardTitle>
              <CardDescription>
                使用API密钥将魔方分析功能集成到你自己的应用中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.tier !== 'LIFETIME' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">ℹ️ 注意:</span>
                    API访问是终身版专属功能。
                    <Button variant="link" className="p-0 h-auto text-sm ml-2" asChild>
                      <a href="/pricing">升级到终身版</a>
                    </Button>
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">你的API密钥</label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? '隐藏' : '显示'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey)
                      alert('已复制到剪贴板')
                    }}
                  >
                    复制
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button onClick={handleGenerateApiKey} variant="outline">
                  重新生成密钥
                </Button>
              </div>

              {/* API Docs Link */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">API文档</p>
                <p className="text-sm text-muted-foreground mb-3">
                  查看完整的API文档，了解如何使用
                </p>
                <Button variant="outline" asChild>
                  <a href="/api/docs">查看文档</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">危险操作</CardTitle>
              <CardDescription>
                这些操作不可逆，请谨慎操作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="font-medium mb-2">导出数据</p>
                <p className="text-sm text-muted-foreground mb-3">
                  下载你的所有数据，包括分析记录和公式掌握情况
                </p>
                <Button variant="outline">导出数据</Button>
              </div>

              <div className="border-t pt-6">
                <p className="font-medium mb-2 text-destructive">删除账号</p>
                <p className="text-sm text-muted-foreground mb-3">
                  永久删除你的账号和所有数据，此操作不可逆
                </p>
                <Button variant="destructive">删除账号</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
