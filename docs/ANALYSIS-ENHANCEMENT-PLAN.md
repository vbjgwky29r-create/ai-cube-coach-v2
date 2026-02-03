# AI分析功能增强方案

## 当前已有功能

| 功能 | 说明 |
|------|------|
| 阶段分析 | CFOP四阶段（Cross/F2L/OLL/PLL）的效率评估 |
| 问题诊断 | 冗余动作、未使用高级公式等问题 |
| 优化建议 | 可节省步数的具体建议 |
| 学习推荐 | 推荐学���的新公式 |
| 识别的公式 | 用户解法中识别出的公式 |
| 解法验证 | 验证解法是否正确还原 |

---

## 建议新增的细致分析功能

### 1. 动作序列模式分析 ⭐⭐⭐

#### 1.1 低效模式检测
检测用户常见的低效动作模式：

```
- 重复的Sexy Move (R U R' U') 多次出现
- 往返动作 (如 R L R L)
- 可合并的连续同面动作 (R R → R2)
- 可抵消的相对动作 (R R' → 空操作)
```

#### 1.2 绕路检测
分析是否有"绕路"的情况：

```
示例：用户解法 R U F R' F'
分析：可以用更短的 R U R' 替代某些情况
```

#### 1.3 手指技巧分析
分析动作组合的手指友好度：

```typescript
interface FingerprintTip {
  moves: string[]           // 动作序列
  difficulty: 'easy' | 'medium' | 'hard'
  suggestion: string        // 执行建议
  alternative?: string      // 更友好的替代动作
}

示例：
{
  moves: ["R", "U", "R'", "U'"],
  difficulty: "easy",
  suggestion: "用食指做U和U'，无名指做R和R'"
}

{
  moves: ["R'", "U'", "R", "U"],
  difficulty: "hard",  // 需要手腕动作
  alternative: "可以用 d R' d' 替代"
}
```

---

### 2. 具体步骤定位分析 ⭐⭐⭐

#### 2.1 问题精确定位
不只是说"Cross阶段效率低"，而是指出具体哪几步有问题：

```typescript
interface StepLocation {
  stepRange: [number, number]    // 第N步到第M步
  originalMoves: string          // 原始动作
  problemType: string           // 问题类型
  optimizedMoves: string         // 优化后动作
  savings: number               // 节省步数
  reason: string                // 原因
}

示例：
{
  stepRange: [23, 26],
  originalMoves: "R U R' U' R U R' U'",
  problemType: "重复模式",
  optimizedMoves: "R U2 R' U'",
  savings: 3,
  reason: "连续的Sexy Move可以合并"
}
```

#### 2.2 可视化对比
显示用户解法与最优解的并排对比：

```
用户: R → U → R' → F → R → U' → R' → U' (8步)
最优: R → U → R' → U' → R → U2 → R'  (7步)

         👆 可以省略这部分 👆
```

---

### 3. F2L槽位详细分析 ⭐⭐

#### 3.1 四槽位效率对比
分析每个F2L槽位的还原效率：

```typescript
interface SlotAnalysis {
  slot: '1号槽' | '2号槽' | '3号槽' | '4号槽'
  steps: number
  efficiency: 'excellent' | 'good' | 'fair' | 'poor'
  usedFormula?: string        // 使用的公式
  pairingMethod: string       // 配对方式（如"标准配对"、"先角后棱"）
  rotationUsed: boolean        // 是否需要旋转
  suggestion?: string
}

示例输出：
┌────────────────────────────────────────┐
│ F2L 槽位分析                          │
├──────────┬──────┬──────────┬──────────┤
│  槽位    │ 步数 │  效率    │  建议    │
├──────────┼──────┼──────────┼──────────┤
│  1号槽   │  8   │ ✅优秀   │          │
│  2号槽   │ 12   │ 👍良好   │          │
│  3号槽   │ 18   │ ⚠️偏低   │ 考虑学习 │
│  4号槽   │ 10   │ ✅优秀   │          │
└──────────┴──────┴──────────┴──────────┘
```

#### 3.2 槽位顺序建议
分析当前的槽位还原顺序是否最优：

```typescript
interface SlotOrderSuggestion {
  currentOrder: string[]       // 当前顺序
  suggestedOrder: string[]     // 建议顺序
  reason: string               // 原因
  estimatedImprovement: number // 预计改进步数
}

示例：
{
  currentOrder: ["1号槽", "2号槽", "3号槽(需y')", "4号槽"],
  suggestedOrder: ["1号槽", "4号槽", "2号槽", "3号槽"],
  reason: "3号槽需要y'旋转，建议最后做",
  estimatedImprovement: 2
}
```

---

### 4. OLL/PLL情况识别与推荐 ⭐⭐⭐

#### 4.1 顶层情况精确识别
识别具体的OLL和PLL情况：

```typescript
interface OLLRecognition {
  case: string                 // 具体情况名称（如 "Sune", "Anti-Sune", "H"）
  caseNumber: string           // 标准编号（OLL 1-57）
  edgesOriented: boolean       // 棱块是否朝向
  cornersOriented: boolean     // 角块是否朝向
  pattern: string              // 顶面图案描述
  userSteps: number            // 用户使用的步数
  optimalSteps: number         // 该情况的最优步数
  recommendedAlgorithm: FormulaRecommendation
}

interface PLLRecognition {
  case: string                 // 具体情况（如 "T-Perm", "U-Perm", "Y-Perm"）
  caseNumber: string           // 标准编号
  permutation: string          // 排列类型描述
  userSteps: number
  optimalSteps: number
  recommendedAlgorithm: FormulaRecommendation
}
```

#### 4.2 情况可视化
显示OLL/PLL情况的图案描述，帮助用户识别：

```
OLL情况：OLL #21 - Cross (十字)
┌─────────────────────────────────────┐
│       🟨 🟨 🟨                      │  顶面已形成十字
│       🟦 🟦 🟦                      │  但角块未朝向
│    🟦 🟦 🟦 🟦 🟦 🟦               │  推荐学习：Sune系列
│    🟦 🟦 🟦 🟦 🟦 🟦               │
└─────────────────────────────────────┘
```

---

### 5. 时间分解与瓶颈分析 ⭐⭐

#### 5.1 各阶段时间占比
基于标准TPS计算各阶段预估时间：

```typescript
interface TimeBreakdown {
  stage: string
  steps: number
  estimatedTime: number       // 预估秒数
  percentage: number          // 时间占比
  bottleneck: boolean         // 是否为瓶颈
}

示例输出：
┌─────────────┬──────┬────────┬──────────┬────────┐
│   阶段      │ 步数 │ 时间(s) │  占比    │ 瓶颈  │
├─────────────┼──────┼────────┼──────────┼────────┤
│  Cross      │   8  │  2.8s  │   5%     │        │
│  F2L        │  35  │ 12.3s  │  60% ⭐  │  是    │
│  OLL        │  12  │  4.2s  │  20%     │        │
│  PLL        │  10  │  3.5s  │  15%     │        │
├─────────────┼──────┼────────┼──────────┼────────┤
│  总计       │  65  │ 22.8s  │  100%    │        │
└─────────────┴──────┴────────┴──────────┴────────┘

💡 建议：F2L占据了60%的时间，是主要优化方向
```

#### 5.2 TPS估算与对比
计算用户的TPS（Turns Per Second）并与标准对比：

```typescript
interface TPSAnalysis {
  userTPS: number               // 用户TPS
  beginnerTPS: 2                // 初学者标准
  intermediateTPS: 4            // 中级标准
  advancedTPS: 6                // 高级标准
  worldClassTPS: 10             // 世界级标准
  level: string
  suggestion: string
}

示例：
{
  userTPS: 2.8,
  level: "初级 → 中级之间",
  suggestion: "提高TPS的关键是练习公式连贯性"
}
```

---

### 6. 与高级玩家对比 ⭐⭐

#### 6.1 各阶段对比
将用户数据与"标准高级玩家"对比：

```typescript
interface ComparisonWithAdvanced {
  stage: string
  userSteps: number
  userTime: number
  advancedSteps: number        // 高级玩家步数
  advancedTime: number         // 高级玩家时间
  improvementPotential: number // 提升空间百分比
}

示例输出：
┌──────────┬───────────┬───────────────┬─────────────┐
│  阶段    │  你的步数 │ 高级玩家步数 │ 提升空间   │
├──────────┼───────────┼───────────────┼─────────────┤
│  Cross   │    10     │      6       │   +40%     │
│  F2L     │    38     │      28      │   +26%     │
│  OLL     │    15     │      10      │   +33%     │
│  PLL     │    12     │      12      │    0% ✅   │
└──────────┴───────────┴───────────────┴────────��────┘
```

---

### 7. 手指技巧专项建议 ⭐

#### 7.1 需要特别练习的动作组合
识别用户解法中需要特殊技巧的部分：

```typescript
interface FingerprintingTip {
  moveSequence: string
  technique: 'fingertricks' | 'wristturn' | 'doubleturn' | 'rotation'
  description: string
  tutorialLink?: string
  practiceAdvice: string[]
}

示例：
{
  moveSequence: "R U R' U' R U2 R'",
  technique: "fingertricks",
  description: "Sune公式 - 食指和无名指配合",
  tutorialLink: "https://...",
  practiceAdvice: [
    "先用慢速练习，确保每个动作准确",
    "U2用食指快速拨两次",
    "最后R'用无名指或中指"
  ]
}
```

---

### 8. 进阶建议优先级 ⭐⭐⭐

#### 8.1 按影响力排序的建议
根据对整体时间的影响，给出优先级排序：

```typescript
interface PriorityRecommendation {
  priority: 1 | 2 | 3 | 4 | 5
  area: string                 // 改进领域
  currentStatus: string        // 当前状态
  targetStatus: string         // 目标状态
  estimatedImprovement: string // 预计改进
  effort: 'low' | 'medium' | 'high'  // 所需努力
  actionItems: string[]
}

示例输出：
┌──────────────────────────────────────────────┐
│ 优先级建议（按影响力排序）                    │
├──────────────────────────────────────────────┤
│ 🔥 P1: 学习完整PLL公式                       │
│     当前：2-look PLL (20步)                  │
│     目标：1-look PLL (12步)                   │
│     预计改进：-8步 (-2.8秒)                  │
│     难度：中等                                │
│     行动：[                                 │
│       - 本周学习：T-Perm, U-Perm             │
│       - 下周学习：J-Perm, Y-Perm             │
│       - 逐步替换2-look为1-look                │
│     ]                                       │
├──────────────────────────────────────────────┤
│ ⚡ P2: 优化F2L槽位顺序                       │
│     当前：按固定顺序还原                     │
│     目标：根据打乱状态灵活选择               │
│     预计改进：-3步 (-1秒)                    │
│     难度：低                                  │
│     行动：观察打乱后的F2L对情况，优先做...  │
├──────────────────────────────────────────────┤
│ 📈 P3: 提高基础TPS                          │
│     当前：2.8 TPS                             │
│     目标：4 TPS                               │
│     预计改进：-5秒                            │
│     难度：高                                  │
│     行动：[日常练习计划...]                   │
└──────────────────────────────────────────────┘
```

---

## 新增数据结构定义

```typescript
/**
 * 完整分析结果（增强版）
 */
export interface EnhancedAnalysisResult extends DetailedAnalysisResult {
  // 新增字段

  // 1. 动作模式分析
  movePatterns: {
    inefficientPatterns: PatternMatch[]
    shortcutOpportunities: ShortcutMatch[]
    fingerTips: FingerprintingTip[]
  }

  // 2. 具体步骤定位
  stepOptimizations: StepLocation[]

  // 3. F2L槽位分析
  f2lSlots: SlotAnalysis[]
  slotOrderSuggestion?: SlotOrderSuggestion

  // 4. OLL/PLL精确识别
  ollCase?: OLLRecognition
  pllCase?: PLLRecognition

  // 5. 时间分解
  timeBreakdown: TimeBreakdown[]
  tpsAnalysis: TPSAnalysis

  // 6. 对比分析
  comparison: ComparisonWithAdvanced[]

  // 7. 优先级建议
  prioritizedRecommendations: PriorityRecommendation[]

  // 8. 可视化数据
  visualization: {
    stepChart: StepChartData
    efficiencyChart: EfficiencyChartData
    comparisonChart: ComparisonChartData
  }
}
```

---

## 实现优先级建议

### 第一阶段（高价值，易实现）
1. ⭐⭐⭐ 具体步骤定位分析 - 指出第N步到第M步的问题
2. ⭐⭐⭐ 优先级建议 - 按影响力排序改进建议
3. ⭐⭐ 时间分解 - 计算各阶段时间占比

### 第二阶段（高价值，中等难度）
4. ⭐⭐⭐ OLL/PLL情况精确识别
5. ⭐⭐⭐ F2L槽位详细分析
6. ⭐⭐ 动作模式检测（重复、抵消等）

### 第三阶段（增值功能）
7. ⭐⭐ 与高级玩家对比
8. ⭐ 手指技巧建议
9. ⭐ 可视化图表

---

## 示例：完整分析报告输出

```
═══════════════════════════════════════════════════════════════
                    🧊 AI 魔方解法分析报告
═══════════════════════════════════════════════════════════════

📊 基本信息
─────────────────────────────────────────────────────────────
  你的解法：58 步，预计用时 20.3 秒 (TPS: 2.8)
  最优解法：45 步，预计用时 15.8 秒
  效率评分：7.8/10
  水平判定：中级 → 高级之间

📍 问题定位
─────────────────────────────────────────────────────────────
  ⚠️ 第 23-26 步可以优化
     原：R U R' U' R U R' U' (8步)
     优化：R U2 R' U' (4步)
     节省：4步 (1.4秒)

  ⚠️ 第 38-42 步存在冗余
     原：y' U R U' R' y (需要转体)
     优化：直接使用背面公式
     节省：2步 + 转体时间

🎯 阶段详细分析
─────────────────────────────────────────────────────────────
  ┌─────────┬──────┬────────┬──────────┬──────────────┐
  │  阶段   │ 步数 │  效率  │ 时间占比 │  问题/建议   │
  ├─────────┼──────┼────────┼──────────┼──────────────┤
  │ Cross   │   8  │ ✅优秀 │  14%     │             │
  │ F2L     │  35  │ ⚠️一般 │  61% ⭐  │ 主要优化方向 │
  │ OLL     │  10  │ ✅优秀 │  17%     │             │
  │ PLL     │   5  │ ✅优秀 │   8%     │             │
  └─────────┴──────┴────────┴──────────┴──────────────┘

🎲 F2L 槽位分析
─────────────────────────────────────────────────────────────
  ┌────────┬──────┬────────┬─────────────────────────────┐
  │  槽位  │ 步数 │  效率  │           说明               │
  ├────────┼──────┼────────┼─────────────────────────────┤
  │  1号槽 │   6  │ ✅优秀 │ 直接配对完成               │
  │  2号槽 │  10  │ 👍良好 │ 用了一个标准公式           │
  │  3号槽 │  12  │ ⚠️一般 │ 3次观察才找到配对           │
  │  4号槽 │   7  │ ✅优秀 │ 快速配对                   │
  └────────┴──────┴────────┴─────────────────────────────┘
  💡 建议：先观察完4个槽位，选择最容易的开始

🔯 顶层识别
─────────────────────────────────────────────────────────────
  OLL 情况：OLL #22 - Pi (π字形)
  ├─ 你的解法：10步
  ├─ 最优解法：9步 (R U2 R2 U' R2 U2 R)
  └─ 建议：当前已很好，可学习更短的公式

  PLL 情况：PLL #1 - T-Perm
  ├─ 你的解法：14步 ✅ 使用了标准公式
  └─ 评价：完美！

⚡ 优先改进建议
─────────────────────────────────────────────────────────────
  🔥 P1: 优化F2L观察策略 (-4步, -1.5秒)
     当前：边观察边还原
     目标：先观察完4个槽位，规划还原顺序
     难度：低
     行动：练习F2L预观察，每次扫描4个槽位

  ⚡ P2: 学习3个新F2L公式 (-6步, -2秒)
     当前：部分使用基础拼接
     目标：全部使用标准公式
     难度：中等
     行动：本周学习：Case 3, Case 17, Case 21

  📈 P3: 提高TPS到3.5 (-3秒)
     当前：2.8 TPS
     目标：3.5 TPS
     难度：高
     行动：每天计时练习已学公式

🆚 与高级玩家对比
─────────────────────────────────────────────────────────────
  ┌───────────┬──────────┬────────────┬────────────┐
  │   指标    │   你的   │ 高级玩家   │ 提升空间   │
  ├───────────┼──────────┼────────────┼────────────┤
  │  总步数   │   58步   │   45步     │  +22%      │
  │  F2L步数  │   35步   │   28步     │  +20%      │
  │   TPS     │   2.8    │   4.5      │  +37%      │
  │  预估用时 │  20.3s   │   10s      │  +50%      │
  └───────────┴──────────┴────────────┴────────────┘

📚 推荐学习
─────────────────────────────────────────────────────────────
  本周重点学习：
  1. F2L Case #3 - 同色槽位配对
  2. F2L Case #17 - 分离角块配对
  3. OLL #22(Pi) 的更短版本

  学习资源：
  - JPerm.net - 公式查找
  - CubeSkills.com - 视频教程

═══════════════════════════════════════════════════════════════
```
