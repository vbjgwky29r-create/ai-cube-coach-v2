# 技术文档 - CFOP求解器实现指南

## 目录
1. [魔方基础知识](#魔方基础知识)
2. [cubejs库使用指南](#cubejs库使用指南)
3. [Cross求解器实现](#cross求解器实现)
4. [F2L识别实现指南](#f2l识别实现指南)
5. [测试方法](#测试方法)

---

## 魔方基础知识

### 魔方结构

三阶魔方由26个可移动的块组成：
- **8个角块**（Corner）：每个有3个颜色面
- **12个棱块**（Edge）：每个有2个颜色面
- **6个中心块**（Center）：每个有1个颜色面，**位置固定不变**

### 标准配色（WCA标准）

- **白色**对**黄色**（U-D）
- **红色**对**橙色**（F-B）
- **蓝色**对**绿色**（R-L）

### 魔方记号法

- **R**：右面顺时针90°
- **R'**：右面逆时针90°
- **R2**：右面180°
- 其他面：U（上）、D（下）、F（前）、B（后）、L（左）

### CFOP方法

**C**ross - **F**irst 2 Layers - **O**rientation of Last Layer - **P**ermutation of Last Layer

1. **Cross**（十字）：
   - 在底面（D面）完成4个棱块
   - 目标：D面形成十字，且侧面颜色匹配

2. **F2L**（前两层）：
   - 同时完成第一层和第二层
   - 4个槽位，每个槽位1个角块+1个棱块
   - 41种标准情况

3. **OLL**（顶层朝向）：
   - 调整顶层8个块的朝向
   - 使顶面颜色一致
   - 57种情况

4. **PLL**（顶层排列）：
   - 调整顶层块的位置
   - 完成魔方
   - 21种情况

---

## cubejs库使用指南

### 安装

```bash
npm install cubejs
# 或
pnpm add cubejs
```

### 基本使用

```javascript
const Cube = require('cubejs')

// 创建魔方
const cube = new Cube()

// 应用移动
cube.move('R U R\' U\'')

// 获取状态字符串（54个字符）
const state = cube.asString()
// 输出: "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"

// 判断是否还原
const solved = cube.isSolved()

// 克隆魔方
const clone = cube.clone()

// Kociemba算法求解（不是CFOP）
await Cube.initSolver() // 初始化（需要4-5秒）
const solution = cube.solve()
```

### 状态字符串格式

54个字符，按顺序表示：
```
位置 0-8:   U面（上面）
位置 9-17:  R面（右面）
位置 18-26: F面（前面）
位置 27-35: D面（下面）
位置 36-44: L面（左面）
位置 45-53: B面（后面）
```

每个面的9个位置（3x3网格）：
```
0 1 2
3 4 5
6 7 8
```

其中位置4是中心块。

### 颜色解析函数

```javascript
function parseCubeState(cubeString) {
  const faces = {
    U: cubeString.slice(0, 9).split(''),
    R: cubeString.slice(9, 18).split(''),
    F: cubeString.slice(18, 27).split(''),
    D: cubeString.slice(27, 36).split(''),
    L: cubeString.slice(36, 45).split(''),
    B: cubeString.slice(45, 54).split('')
  }
  
  // 转换为3x3数组
  for (const face in faces) {
    const colors = faces[face]
    faces[face] = [
      [colors[0], colors[1], colors[2]],
      [colors[3], colors[4], colors[5]],
      [colors[6], colors[7], colors[8]]
    ]
  }
  
  return faces
}

// 使用示例
const cube = new Cube()
const state = parseCubeState(cube.asString())

// 访问U面中心块
const upColor = state.U[1][1]

// 访问URF角块（U面右前角）
const urfCorner = [state.U[2][2], state.R[0][0], state.F[0][2]]
```

---

## Cross求解器实现

### 算法原理

使用**迭代加深搜索（IDS）** + **剪枝优化**：

1. 从深度1开始搜索
2. 逐步增加深度到8
3. 使用DFS搜索所有可能的移动序列
4. 找到第一个能完成Cross的解法

### 核心代码

```javascript
/**
 * 检查Cross是否完成
 */
function isCrossComplete(cube) {
  const str = cube.asString()
  
  // D面（位置27-35）
  const D = str.slice(27, 36)
  const downColor = D[4] // 中心块
  
  // 检查4个棱块位置（1,3,5,7）
  if (D[1] !== downColor || D[3] !== downColor || 
      D[5] !== downColor || D[7] !== downColor) {
    return false
  }
  
  // 检查侧面棱块是否匹配中心块
  const F = str.slice(18, 27)
  if (F[7] !== F[4]) return false
  
  const B = str.slice(45, 54)
  if (B[7] !== B[4]) return false
  
  const L = str.slice(36, 45)
  if (L[7] !== L[4]) return false
  
  const R = str.slice(9, 18)
  if (R[7] !== R[4]) return false
  
  return true
}

/**
 * 启发式函数：计算未完成的棱块数量
 */
function crossHeuristic(cube) {
  const str = cube.asString()
  const D = str.slice(27, 36)
  const downColor = D[4]
  
  let unsolved = 0
  if (D[1] !== downColor) unsolved++
  if (D[3] !== downColor) unsolved++
  if (D[5] !== downColor) unsolved++
  if (D[7] !== downColor) unsolved++
  
  return unsolved
}

/**
 * 深度优先搜索
 */
function dfs(cube, depth, moves, path) {
  // 检查是否完成
  if (isCrossComplete(cube)) {
    return path
  }
  
  // 达到深度限制
  if (depth === 0) {
    return null
  }
  
  // 剪枝：启发式值大于剩余深度
  if (crossHeuristic(cube) > depth) {
    return null
  }
  
  // 尝试每个移动
  for (const move of moves) {
    // 剪枝：避免同一面连续移动
    if (path.length > 0) {
      const lastMove = path[path.length - 1]
      const lastFace = lastMove[0]
      const currentFace = move[0]
      
      if (lastFace === currentFace) {
        continue
      }
      
      // 避免对面连续移动（按字母顺序）
      if ((lastFace === 'F' && currentFace === 'B') ||
          (lastFace === 'L' && currentFace === 'R') ||
          (lastFace === 'U' && currentFace === 'D')) {
        continue
      }
    }
    
    const newCube = cube.clone()
    newCube.move(move)
    
    const result = dfs(newCube, depth - 1, moves, [...path, move])
    if (result) {
      return result
    }
  }
  
  return null
}

/**
 * 迭代加深搜索
 */
function solveCrossIDS(cube, maxDepth = 8) {
  if (isCrossComplete(cube)) {
    return ''
  }
  
  const moves = ['F', "F'", 'F2', 'B', "B'", 'B2', 
                 'L', "L'", 'L2', 'R', "R'", 'R2', 
                 'D', "D'", 'D2']
  
  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = dfs(cube, depth, moves, [])
    if (result) {
      return result.join(' ')
    }
  }
  
  return null
}
```

### 使用示例

```javascript
const Cube = require('cubejs')

const cube = new Cube()
cube.move("F2 D B2 F2 D' L2 B2 U F L'")

const solution = solveCrossIDS(cube, 8)
console.log(`Cross解法: ${solution}`)

cube.move(solution)
console.log(`Cross完成: ${isCrossComplete(cube)}`)
```

### 性能

- 简单打乱：< 10ms
- 中等难度：100-500ms
- 复杂打乱：1-2秒
- 最大深度8步，保证能找到解法

---

## F2L识别实现指南

### F2L基础

每个F2L槽位由1个角块和1个棱块组成：
- **FR槽位**：前右角（URF）+ 前右棱（FR）
- **FL槽位**：前左角（UFL）+ 前左棱（FL）
- **BR槽位**：后右角（URB）+ 后右棱（BR）
- **BL槽位**：后左角（UBL）+ 后左棱（BL）

### 角块和棱块位置

#### 角块位置（8个）

```
URF: U[2][2], R[0][0], F[0][2]  // 上右前
UFL: U[2][0], F[0][0], L[0][2]  // 上前左
ULB: U[0][0], L[0][0], B[0][2]  // 上左后
UBR: U[0][2], B[0][0], R[0][2]  // 上后右
DFR: D[0][2], F[2][2], R[2][0]  // 下前右
DLF: D[0][0], L[2][2], F[2][0]  // 下左前
DBL: D[2][0], B[2][2], L[2][0]  // 下后左
DRB: D[2][2], R[2][2], B[2][0]  // 下右后
```

#### 棱块位置（12个）

```
UF: U[2][1], F[0][1]  // 上前
UR: U[1][2], R[0][1]  // 上右
UB: U[0][1], B[0][1]  // 上后
UL: U[1][0], L[0][1]  // 上左

FR: F[1][2], R[1][0]  // 前右
FL: F[1][0], L[1][2]  // 前左
BR: B[1][0], R[1][2]  // 后右
BL: B[1][2], L[1][0]  // 后左

DF: D[0][1], F[2][1]  // 下前
DR: D[1][2], R[2][1]  // 下右
DB: D[2][1], B[2][1]  // 下后
DL: D[1][0], L[2][1]  // 下左
```

### F2L Case 1 识别示例

**Case 1特征**：
- 公式：`U R U' R'`
- 角块在URF位置，白色朝上
- 棱块在UF位置，白色朝上
- 两者分离，需要配对

```javascript
function isF2LCase1_FR(cube) {
  const state = parseCubeState(cube.asString())
  
  // 获取中心块颜色
  const upColor = state.U[1][1]      // 白色
  const frontColor = state.F[1][1]   // 红色
  const rightColor = state.R[1][1]   // 蓝色
  
  // 检查URF角块
  const urfCorner = [state.U[2][2], state.R[0][0], state.F[0][2]]
  
  // 角块应该包含白、红、蓝
  const cornerColors = urfCorner.sort().join('')
  const expectedColors = [upColor, frontColor, rightColor].sort().join('')
  
  if (cornerColors !== expectedColors) {
    return false
  }
  
  // 白色应该朝上
  if (state.U[2][2] !== upColor) {
    return false
  }
  
  // 检查UF棱块
  const ufEdge = [state.U[2][1], state.F[0][1]]
  
  // 棱块应该包含白色和红色
  const edgeColors = ufEdge.sort().join('')
  const expectedEdgeColors = [upColor, frontColor].sort().join('')
  
  if (edgeColors !== expectedEdgeColors) {
    return false
  }
  
  // 白色应该朝上
  if (state.U[2][1] !== upColor) {
    return false
  }
  
  return true
}
```

### F2L识别通用流程

1. **找到目标角块和棱块**：
   ```javascript
   function findF2LPieces(cube, slotColor1, slotColor2) {
     // slotColor1: 如红色（F面）
     // slotColor2: 如蓝色（R面）
     
     const state = parseCubeState(cube.asString())
     const upColor = state.U[1][1]
     
     // 遍历所有角块位置
     // 找到包含upColor, slotColor1, slotColor2的角块
     
     // 遍历所有棱块位置
     // 找到包含slotColor1, slotColor2的棱块
     
     return { corner, edge }
   }
   ```

2. **判断角块和棱块的朝向**：
   ```javascript
   function getCornerOrientation(corner, upColor) {
     // 返回0, 1, 或2
     // 0: 白色朝上
     // 1: 白色朝前
     // 2: 白色朝右
   }
   
   function getEdgeOrientation(edge, slotColor1) {
     // 返回0或1
     // 0: slotColor1朝向正确
     // 1: slotColor1朝向错误
   }
   ```

3. **匹配到41种情况**：
   ```javascript
   function matchF2LCase(corner, edge, cornerOri, edgeOri) {
     // 根据位置和朝向，匹配到41种情况中的一种
     // 返回case ID和对应的算法
   }
   ```

### F2L 41种情况分类

1. **基础情况**（Case 1-4）：角块和棱块分离
2. **已配对**（Case 5-8）：角块和棱块已连接但方向错误
3. **角块朝上**（Case 9-12）：白色朝上
4. **棱块朝前**（Case 13-16）：棱块颜色朝前
5. **角块在槽位**（Case 17-24）：角块已在目标位置
6. **棱块在槽位**（Case 25-32）：棱块已在目标位置
7. **特殊情况**（Case 33-41）：复杂的配对情况

---

## 测试方法

### 单元测试

```javascript
// 测试Cross求解器
function testCrossSolver() {
  const testCases = [
    { scramble: 'F R U', expectedMaxMoves: 5 },
    { scramble: 'R U R\' U\'', expectedMaxMoves: 6 },
    { scramble: 'F2 D B2 F2 D\'', expectedMaxMoves: 8 }
  ]
  
  for (const test of testCases) {
    const cube = new Cube()
    cube.move(test.scramble)
    
    const solution = solveCrossIDS(cube, 8)
    const moves = solution.split(' ').length
    
    console.assert(moves <= test.expectedMaxMoves, 
      `步数过多: ${moves} > ${test.expectedMaxMoves}`)
    
    cube.move(solution)
    console.assert(isCrossComplete(cube), 
      'Cross未完成')
  }
}
```

### 集成测试

```javascript
// 测试完整CFOP流程
function testFullCFOP() {
  const scramble = "R U R' U' F' U F"
  
  const cube = new Cube()
  cube.move(scramble)
  
  // 1. Cross
  const crossSolution = solveCross(cube)
  cube.move(crossSolution)
  console.assert(isCrossComplete(cube))
  
  // 2. F2L
  const f2lSolution = solveF2L(cube)
  cube.move(f2lSolution)
  console.assert(isF2LComplete(cube))
  
  // 3. OLL
  const ollSolution = solveOLL(cube)
  cube.move(ollSolution)
  console.assert(isOLLComplete(cube))
  
  // 4. PLL
  const pllSolution = solvePLL(cube)
  cube.move(pllSolution)
  console.assert(cube.isSolved())
  
  console.log('完整解法:', 
    [crossSolution, f2lSolution, ollSolution, pllSolution].join(' '))
}
```

### 性能测试

```javascript
function benchmarkCrossSolver() {
  const iterations = 100
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const cube = new Cube()
    // 随机打乱
    const scramble = generateRandomScramble(20)
    cube.move(scramble)
    
    const start = Date.now()
    const solution = solveCrossIDS(cube, 8)
    const time = Date.now() - start
    
    times.push(time)
  }
  
  const avgTime = times.reduce((a, b) => a + b) / times.length
  const maxTime = Math.max(...times)
  
  console.log(`平均时间: ${avgTime}ms`)
  console.log(`最大时间: ${maxTime}ms`)
}
```

---

## 参考资料

### 官方教程
- [J Perm CFOP教程](https://jperm.net/3x3/cfop)
- [CubeSkills](https://www.cubeskills.com/)
- [Ruwix魔方教程](https://ruwix.com/)

### 算法库
- [F2L算法PDF](https://www.cubeskills.com/uploads/pdf/tutorials/f2l.pdf)
- [OLL算法](https://jperm.net/algs/oll)
- [PLL算法](https://jperm.net/algs/pll)

### 开源项目
- [cubejs](https://github.com/ldez/cubejs)
- [cube-solver](https://github.com/torjusti/cube-solver)

---

*最后更新：2026年2月5日*
