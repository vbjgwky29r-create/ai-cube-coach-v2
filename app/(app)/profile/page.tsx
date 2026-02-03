'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function ProfilePage() {
  // 模拟数据 - 实际应从API获取
  const [profile] = useState({
    level: 'INTERMEDIATE',
    progress: 45,
    totalAnalyses: 28,
    masteredFormulas: 12,
    avgSteps: 67,
    avgTime: 42,
    nextGoal: '学习完整OLL和PLL，减少步数',
  })

  const [formulas] = useState([
    { id: '1', name: 'Sune (鱼形)', category: 'OLL', mastery: 85, lastPracticed: '2天前' },
    { id: '2', name: 'T-Perm', category: 'PLL', mastery: 70, lastPracticed: '5天前' },
    { id: '3', name: 'U-Perm', category: 'PLL', mastery: 60, lastPracticed: '1周前' },
    { id: '4', name: 'Sexy Move', category: '技巧', mastery: 95, lastPracticed: '今天' },
    { id: '5', name: 'OLL Edge - Line', category: 'OLL', mastery: 50, lastPracticed: '2周前' },
  ])

  const [recentAnalyses] = useState([
    { date: '今天', steps: 62, optimal: 54, efficiency: 7.5 },
    { date: '昨天', steps: 71, optimal: 56, efficiency: 6.2 },
    { date: '2天前', steps: 68, optimal: 58, efficiency: 7.0 },
    { date: '3天前', steps: 75, optimal: 55, efficiency: 5.8 },
    { date: '4天前', steps: 65, optimal: 54, efficiency: 7.2 },
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ADVANCED': return 'text-green-500'
      case 'INTERMEDIATE': return 'text-blue-500'
      default: return 'text-yellow-500'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'ADVANCED': return '高手'
      case 'INTERMEDIATE': return '进阶'
      default: return '初学者'
    }
  }

  return (
    <div className="container py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">学习档案</h1>
        <p className="text-muted-foreground">
          追踪你的学习进度，掌握每一个公式
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">总分析次数</p>
            <p className="text-3xl font-bold">{profile.totalAnalyses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">掌握公式</p>
            <p className="text-3xl font-bold">{profile.masteredFormulas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">平均步数</p>
            <p className="text-3xl font-bold">{profile.avgSteps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">平均用时</p>
            <p className="text-3xl font-bold">{profile.avgTime}s</p>
          </CardContent>
        </Card>
      </div>

      {/* Level & Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>当前水平</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`text-2xl font-bold ${getLevelColor(profile.level)}`}>
                {getLevelLabel(profile.level)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                下一个目标: {profile.nextGoal}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{profile.progress}%</p>
              <p className="text-sm text-muted-foreground">整体进度</p>
            </div>
          </div>
          <Progress value={profile.progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Mastered Formulas */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>掌握的公式</CardTitle>
              <CardDescription>
                你已经掌握了 {formulas.length} 个公式
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              全部公式
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formulas.map((formula) => (
              <div key={formula.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{formula.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                        {formula.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formula.lastPracticed}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={formula.mastery}
                    className="h-2"
                  />
                </div>
                <div className="text-right w-16">
                  <p className="text-lg font-semibold">{formula.mastery}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analyses */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>最近分析</CardTitle>
          <CardDescription>
            你最近 {recentAnalyses.length} 次解法分析记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="pb-3">日期</th>
                  <th className="pb-3">步数</th>
                  <th className="pb-3">最优</th>
                  <th className="pb-3">效率</th>
                  <th className="pb-3">评价</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((analysis, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-3">{analysis.date}</td>
                    <td className="py-3">{analysis.steps}</td>
                    <td className="py-3">{analysis.optimal}</td>
                    <td className="py-3">
                      <span className={
                        analysis.efficiency >= 7 ? 'text-green-500' :
                        analysis.efficiency >= 5 ? 'text-yellow-500' :
                        'text-red-500'
                      }>
                        {analysis.efficiency.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {analysis.efficiency >= 8 ? '优秀' :
                       analysis.efficiency >= 6 ? '良好' :
                       analysis.efficiency >= 4 ? '中等' : '需加油'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button size="lg" asChild className="flex-1">
          <a href="/analyze">开始新分析</a>
        </Button>
        <Button size="lg" variant="outline" asChild className="flex-1">
          <a href="/review">去复习</a>
        </Button>
      </div>
    </div>
  )
}
