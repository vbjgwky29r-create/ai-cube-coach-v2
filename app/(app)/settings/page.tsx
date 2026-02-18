'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const [name, setName] = useState("魔方学员")
  const [email, setEmail] = useState("user@example.com")

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">管理你的基础资料与账户安全信息。</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>个人资料</CardTitle>
            <CardDescription>仅用于展示与联系，不涉及付费功能。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">昵称</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">邮箱</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={() => alert("资料已保存")}>保存资料</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户安全</CardTitle>
            <CardDescription>内测期间仅开放基础账号功能。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">修改密码</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
