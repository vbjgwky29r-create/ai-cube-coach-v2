'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function ReviewPage() {
  // 模拟待复习公式
  const [reviewQueue, setReviewQueue] = useState([
    {
      id: '1',
      name: 'Sune (鱼形)',
      notation: 'R U R\' U R U2 R\'',
      category: 'OLL',
      dueDate: '今天',
      urgency: 'high',
      lastReviewed: '5天前',
      mastery: 75,
    },
    {
      id: '2',
      name: 'T-Perm',
      notation: 'R U R\' U\' R\' F R2 U\' R\' U\' R U R\' F\'',
      category: 'PLL',
      dueDate: '今天',
      urgency: 'medium',
      lastReviewed: '1周前',
      mastery: 60,
    },
    {
      id: '3',
      name: 'OLL Edge - L',
      notation: 'f R U R\' U\' f\'',
      category: 'OLL',
      dueDate: '明天',
      urgency: 'low',
      lastReviewed: '2周前',
      mastery: 50,
    },
    {
      id: '4',
      name: 'U-Perm (a)',
      notation: 'R U\' R U R U R U\' R\' U\' R2',
      category: 'PLL',
      dueDate: '后天',
      urgency: 'low',
      lastReviewed: '3天前',
      mastery: 70,
    },
  ])

  const [currentReview, setCurrentReview] = useState<typeof reviewQueue[0] | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  const startReview = (formula: typeof reviewQueue[0]) => {
    setCurrentReview(formula)
  }

  const completeReview = (quality: number) => {
    // quality: 1-5, 用户对记忆质量的评分（待实现）
    // 实际应用中，这会影响下次复习时间
    console.log(`Review quality: ${quality}`) // TODO: 实现间隔重复算法

    setCompletedCount(prev => prev + 1)
    setReviewQueue(prev => prev.filter(f => f.id !== currentReview?.id))
    setCurrentReview(null)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return '需要复习'
      case 'medium': return '即将到期'
      default: return '按计划'
    }
  }

  // 复习模式
  if (currentReview) {
    return (
      <div className="container py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>正在复习: {currentReview.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setCurrentReview(null)}>
                跳过
              </Button>
            </div>
            <CardDescription>
              已完成 {completedCount} 个公式复习
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 公式显示 */}
            <div className="bg-muted p-6 rounded-lg text-center">
              <code className="text-2xl font-mono break-all">
                {currentReview.notation}
              </code>
            </div>

            {/* 公式信息 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">分类</p>
                <p className="font-semibold">{currentReview.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">上次复习</p>
                <p className="font-semibold">{currentReview.lastReviewed}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">当前掌握</p>
                <p className="font-semibold">{currentReview.mastery}%</p>
              </div>
            </div>

            {/* 掌握进度 */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">当前掌握度</p>
              <Progress value={currentReview.mastery} className="h-3" />
            </div>

            {/* 说明 */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold">💡 提示：</span>
                回忆一下这个公式的做法，然后根据你的记忆质量选择下面的选项
              </p>
            </div>

            {/* 评分按钮 */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-center mb-3">
                你对这个公式的记忆有多清晰？
              </p>
              <div className="grid grid-cols-5 gap-2">
                <Button
                  variant="outline"
                  onClick={() => completeReview(1)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-2xl">😰</span>
                  <span className="text-xs">完全忘记</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => completeReview(2)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-2xl">😕</span>
                  <span className="text-xs">有点模糊</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => completeReview(3)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-2xl">🤔</span>
                  <span className="text-xs">勉强记得</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => completeReview(4)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-2xl">😊</span>
                  <span className="text-xs">比较清晰</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => completeReview(5)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-2xl">🤩</span>
                  <span className="text-xs">完全掌握</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 复习列表
  return (
    <div className="container py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">复习系统</h1>
        <p className="text-muted-foreground">
          基于遗忘曲线的智能复习，确保你掌握的公式不会遗忘
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">待复习</p>
            <p className="text-3xl font-bold text-orange-500">{reviewQueue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">已完成</p>
            <p className="text-3xl font-bold text-green-500">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">连续天数</p>
            <p className="text-3xl font-bold">7</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      {reviewQueue.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>今日复习计划</CardTitle>
            <CardDescription>
              {reviewQueue.filter(f => f.dueDate === '今天').length} 个公式需要今天复习
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewQueue.map((formula) => (
                <div
                  key={formula.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{formula.name}</h4>
                      <span className="text-xs bg-primary/10 px-2 py-0.5 rounded">
                        {formula.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded text-white ${getUrgencyColor(formula.urgency)}`}>
                        {getUrgencyLabel(formula.urgency)}
                      </span>
                    </div>
                    <code className="text-sm text-muted-foreground">
                      {formula.notation}
                    </code>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right w-24">
                      <p className="text-xs text-muted-foreground">掌握度</p>
                      <p className="font-semibold">{formula.mastery}%</p>
                    </div>
                    <Button onClick={() => startReview(formula)}>
                      开始
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">太棒了！</h3>
            <p className="text-muted-foreground mb-6">
              你已经完成了所有待复习的公式
            </p>
            <Button asChild>
              <a href="/analyze">去分析新解法</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>复习原理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📚 遗忘曲线</h4>
              <p className="text-muted-foreground">
                根据艾宾浩斯遗忘曲线，记忆会随时间衰减。
                我们在即将遗忘的临界点提醒你复习，效率最高。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⏰ 间隔重复</h4>
              <p className="text-muted-foreground">
                每次复习后，下次复习时间会根据你的掌握度动态调整。
                记得越牢，间隔越长。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🎯 个性化</h4>
              <p className="text-muted-foreground">
                每个人的记忆曲线不同。系统会根据你的实际表现
                个性化调整复习计划。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📊 长期记忆</h4>
              <p className="text-muted-foreground">
                通过科学复习，将短期记忆转化为长期记忆，
                让公式真正成为你的肌肉记忆。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
