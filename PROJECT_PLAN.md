# AI Cube Coach - 项目核心计划

> **项目代号**: `ai-cube-coach`
> **创建日期**: 2025-02-02
> **状态**: 🚧 开发中
> **严格等级**: ⚠️ 本计划为核心指导文档，所有开发决策需与之保持一致

---

## 一、产品定位

### 1.1 核心理念

```
不是"帮我解"，而是"教我解得更好"
```

| 传统求解器 | AI Cube Coach |
|-----------|---------------|
| 给你答案 | 教你怎么解得更好 |
| 用完就走 | 持续学习追踪 |
| 无个性化 | 完全个性化分析 |
| 不跟踪进度 | 完整学习档案 |

### 1.2 目标用户

- **主要**: 魔方初学者 → 进阶者（会解但想优化）
- **次要**: 培训机构教练（教学辅助工具）
- **未来**: 竞速选手（训练工具）

---

## 二、核心功能（MVP范围）

### 2.1 功能优先级

| 优先级 | 功能 | 描述 | 状态 |
|--------|------|------|------|
| P0 | 打乱公式输入 | 用户输入标准打乱公式 | ⏳ 待开发 |
| P0 | 用户解法输入 | 用户输入自己的复原公式 | ⏳ 待开发 |
| P0 | AI解法分析 | 分析步数、效率、识别公式 | ⏳ 待开发 |
| P0 | 优化建议生成 | 对比最优解，给出优化建议 | ⏳ 待开发 |
| P0 | 知识讲解 | 解释新公式、为什么更好 | ⏳ 待开发 |
| P1 | 用户档案 | 学习记录、掌握公式列表 | ⏳ 待开发 |
| P1 | 复习系统 | 基于遗忘曲线的复习提醒 | ⏳ 待开发 |
| P2 | 3D魔方可视化 | 可视化魔方状态和公式 | ⏳ 待开发 |
| P2 | 练习模式 | 互动练习新学的公式 | ⏳ 待开发 |

### 2.2 MVP 核心流程

```
用户登录/注册
    ↓
输入打乱公式 + 自己的解法
    ↓
AI分析并返回:
- 解法质量评分
- 优化建议
- 新公式讲解
    ↓
保存到学习档案
    ↓
后续可查看档案 + 复习
```

---

## 三、技术架构

### 3.1 技术栈

```
前端:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
├── shadcn/ui (UI组件)
└── cubing.js (魔方库，后续集成)

后端:
├── Next.js API Routes
├── Prisma (ORM)
└── PostgreSQL (Supabase)

AI/算法:
├── Kociemba算法 (最优解)
├── 自研公式识别引擎
├── 对比分析算法
└── 讲解生成逻辑

支付:
├── Xorpay (微信 + 支付宝)
├── USDT直接转账
└── 待定: NowPayments
```

### 3.2 项目结构

```
ai-cube-coach/
├── app/
│   ├── (marketing)/          # 营销页面
│   ├── (app)/                # 主应用
│   │   ├── dashboard/        # 用户仪表板
│   │   ├── analyze/          # 核心功能：分析解法
│   │   ├── profile/          # 用户档案
│   │   └── review/           # 复习系统
│   ├── api/                  # API路由
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                   # shadcn/ui组件
│   ├── cube/                 # 魔方相关组件
│   ├── analyze/              # 分析功能组件
│   └── profile/              # 档案相关组件
├── lib/
│   ├── db.ts                 # Prisma客户端
│   ├── auth.ts               # 认证逻辑
│   ├── cube/                 # 魔方算法
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── PROJECT_PLAN.md           # 本文件
└── README.md
```

---

## 四、数据模型

```prisma
// 用户
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  tier          Tier      @default(FREE)
  level         Level     @default(BEGINNER)
  analyses      SolutionAnalysis[]
  mastered      MasteredFormula[]
  reviews       ReviewSchedule[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Tier {
  FREE
  PRO
  LIFETIME
}

enum Level {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

// 解法分析记录
model SolutionAnalysis {
  id              String    @id @default(cuid())
  userId          String
  scramble        String
  userSolution    String
  optimalSolution String?
  qualityScore    Float     @default(0)
  steps           Int       @default(0)
  formulasUsed    String[]
  optimizations   Json?
  newFormulas     String[]
  createdAt       DateTime  @default(now())
}

// 掌握的公式
model MasteredFormula {
  id              String    @id @default(cuid())
  userId          String
  formulaId       String
  formulaName     String
  practiceCount   Int       @default(0)
  masteryLevel    Int       @default(0)
  nextReviewAt    DateTime
  createdAt       DateTime  @default(now())
  @@unique([userId, formulaId])
}

// 公式库
model FormulaLibrary {
  id              String    @id @default(cuid())
  name            String
  notation        String
  category        FormulaCategory
  difficulty      Int       @default(1)
  explanation     String
  createdAt       DateTime  @default(now())
}

enum FormulaCategory {
  CROSS
  F2L
  OLL
  PLL
  TRICKS
}
```

---

## 五、开发阶段

### Phase 1: 基础架构 (Week 1-2)
- [x] 项目初始化
- [ ] Prisma + Supabase
- [ ] NextAuth.js
- [ ] shadcn/ui

### Phase 2: 核心功能 (Week 3-5)
- [ ] 公式解析器
- [ ] Kociemba求解器
- [ ] 公式识别引擎
- [ ] AI分析API

### Phase 3: 用户档案 (Week 6-7)
- [ ] 用户档案页面
- [ ] 复习系统

### Phase 4: 支付集成 (Week 8)
- [ ] Xorpay集成
- [ ] USDT支付

---

## 六、商业模式

| 套餐 | 价格 | 限制 |
|------|------|------|
| 免费版 | ¥0 | 每天3次分析 |
| Pro月付 | ¥29/月 | 无限分析 |
| 终身版 | ¥499 | 永久使用 |

---

> **版本**: v1.0 | **更新**: 2025-02-02
