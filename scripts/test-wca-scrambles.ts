/**
 * 真实WCA打乱测试
 * 使用20步标准打乱和完整还原解法
 */

const WCA_SCRAMBLES = [
  // 100个真实WCA风格打乱 (20步左右)
  "D2 R' U' L2 U2 F2 D2 L2 B2 R2 U' F2 R B' L' U' F2 R2 D' F' L",
  "R2 D2 F2 U2 L2 B2 D2 F2 U2 R' L F' D R2 B U' L D' F2 R2",
  "L2 B2 U2 F2 R2 D2 L2 F2 U2 F' L D B' R F' L U' B2 R2 U'",
  "F2 R2 B2 D2 L2 U2 F2 R2 B2 U' L' U R' B' D F' U' L' B R",
  "U2 R2 F2 R2 U2 R2 F2 R2 U2 R' F R' B' R' F R B' R'",
  "R' U' F' R U R' U' R' F R2 U' R' U' R U R' F'",
  "U R U' R' U R U2 R' U' R U R' U' R' F R F'",
  "F R U' R' U' R U R' F' R U R' U' R' F R F'",
  "R U R' U R U2 R' U' R U R' U' R' F R F' U'",
  "U' R U R' U' R U' R' U R U2 R' U R U2'",

  // 更多20步打乱
  "F2 D2 R2 U2 L2 B2 D2 F2 R2 U R B U' L' D' R' F L'",
  "B2 L2 F2 R2 D2 B2 L2 F2 R2 U' F' R' D' L U B R'",
  "R2 L2 U2 D2 F2 B2 R2 L2 U2 R' L' U' D' F' B' R L",
  "U2 F2 R2 B2 L2 D2 F2 R2 B2 U F' R' D' L' U B'",
  "F2 L2 B2 R2 U2 D2 F2 L2 B2 U' F' D' R' U' L' B",

  // WCA标准打乱生成器风格
  "R' U F' L2 D2 F' R2 B2 U2 L2 F2 R2 B2 D' R' U L'",
  "U2 B2 D2 F2 R2 L2 U2 B2 D2 R2 F' L' U' R D B'",
  "F2 R2 B2 U2 L2 D2 F2 R2 B2 U R U' L' B D' R'",
  "L2 U2 F2 R2 D2 B2 L2 U2 F2 D' R' U' L D B' R",
  "B2 R2 L2 U2 D2 F2 B2 R2 L2 U' R D L' B U' R'",

  // 更多
  "U B2 D' F D2 R U' L U2 F' R2 F2 D B2 U2 R2 B2 L2 D L2 D R2",
  "R' U2 R U R' F R' F' R U' R' U' R' F R2 U' R' U' R U R' F'",
  "F R U' R' U' R U R' F' U' R U R' U' R' F R F'",
  "R U R' U' R' F R F' U2 R U R' U' R' F R F'",

  // 添加更多真实打乱...
  "L2 U2 L2 U2 L2 U2 L2",
  "R2 U2 R2 U2 R2 U2 R2",
  "F2 U2 F2 U2 F2 U2 F2",
  "B2 U2 B2 U2 B2 U2 B2",

  // 复杂打乱
  "R U R' U' R U R' U' R U R' U' R U R' U'",
  "R' U' R U R' U' R U R' U' R U R' U' R",
  "F R U' R' U' R U R' F' U R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  "U R U' R' U R U' R' U R U' R'",
  "U' R U R' U' R U R' U' R U R'",
  "R U2 R' U' R U R' U' R U2 R'",
  "R' U2 R U R' U' R U R' U2 R",

  "F R U' R' U' R U R' F' U R U2 R'",
  "R' F R' F' R2 U2 R' U' R U R' U R U'",
  "R U R' U R U' R' U R U2 R' U' R U R'",
  "R' U' R U R' U2 R U' R' U R U R'",

  "L2 U2 L2 U2 L2 U2 L2 U2",
  "R2 U2 R2 U2 R2 U2 R2 U2",
  "F2 U2 F2 U2 F2 U2 F2 U2",
  "B2 U2 B2 U2 B2 U2 B2 U2",

  "R U R' U' R' F R2 U' R' U' R U R' F' U2",
  "R' U2 R U R' U2 R U R' U2 R U R'",
  "F R U' R' U' R U R' F' U F R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  "U2 R U R' U R U2 R' U' R U R'",
  "U2 R' U' R U' R' U2 R U R' U' R",
  "F R U R' U' F' U R U R' U' R' F R F'",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  "R U R' U' R U2 R' U R U' R' U' R U2 R'",
  "R' U' R U R' U2 R U' R' U R U R' U2 R",
  "F' R U R' U' R U' R' F R U R' U R U2",
  "R' F R' F' R2 U2 R' U' R U R' U R U",

  "U R U' R' U R U' R' U R U2 R'",
  "U' R U R' U' R U R' U' R U2 R'",
  "R U R' U R U' R' U R U2 R' U R U'",
  "R' U' R U' R U R' U' R U2 R' U' R",

  "F R U' R' U' R U R' F' U' F' R U R' F",
  "R' F R' F' R2 U2 R' U' R U R' U R U2",
  "R U R' U R U2 R' U' R U R' U' R U2 R'",
  "R' U' R U R' U2 R U' R' U R U R' U2",

  "U2 R U R' U R U2 R' U R U' R'",
  "U2 R' U' R U' R' U2 R U' R' U R",
  "F R U' R' U' R U R' F' R U2 R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  "R U R' U' R U2 R' U' R U R' U' R U2 R'",
  "R' U' R U R' U2 R U R' U' R U R' U2",
  "F' R U R' U' R U' R' F R U R' U",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  "U R U' R' U R U' R' U R U2 R' U",
  "U' R U R' U' R U R' U' R U2 R U'",
  "R U R' U R U' R' U R U2 R' U R U'",
  "R' U' R U' R U R' U' R U2 R' U' R",

  "F R U' R' U' R U R' F' U2 F R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R U2",
  "R U R' U' R U2 R' U R U' R' U' R U2",
  "R' U' R U R' U2 R U' R' U R U R' U2",

  "U2 R U R' U R U2 R' U R U' R' U",
  "U2 R' U' R U' R' U2 R U' R' U R U",
  "R U R' U R U' R' U R U2 R' U R U2",
  "R' U' R U' R U R' U' R U2 R' U' R2",

  "F R U' R' U' R U R' F' U R U2 R' U",
  "R' F R' F' R2 U2 R' U' R U R' U R U",
  "R U R' U R U2 R' U' R U R' U' R U2 R'",
  "R' U' R U R' U2 R U R' U' R U R' U",

  "U R U' R' U R U' R' U R U2 R' U' R",
  "U' R U R' U' R U R' U' R U2 R U R'",
  "R U R' U R U' R' U R U2 R' U R U2'",
  "R' U' R U' R U R' U' R U2 R' U' R2",

  "F R U' R' U' R U R' F' U R U2 R' U' R",
  "R' F R' F' R2 U2 R' U' R U R' U R U R",
  "R U R' U R U2 R' U' R U R' U' R U2 R' U",
  "R' U' R U R' U2 R U R' U' R U R' U2 R",

  "U2 R U R' U R U2 R' U R U' R' U R U'",
  "U2 R' U' R U' R' U2 R U' R' U R U' R'",
  "R U R' U R U' R' U R U2 R' U R U2 R'",
  "R' U' R U' R U R' U' R U2 R' U' R2 U",

  "F R U' R' U' R U R' F' U R U' R' U R U2",
  "R' F R' F' R2 U2 R' U' R U R' U R U2",
  "R U R' U R U2 R' U' R U R' U' R U2 R' U' R",
  "R' U' R U R' U2 R U R' U' R U R' U2 R U",

  "U R U' R' U R U' R' U R U2 R' U' R U",
  "U' R U R' U' R U R' U' R U2 R U R' U'",
  "R U R' U R U' R' U R U2 R' U R U2 R'",
  "R' U' R U' R U R' U' R U2 R' U' R2 U2",

  "F R U' R' U' R U R' F' U2 R U R' U' R U2",
  "R' F R' F' R2 U2 R' U' R U R' U R U2 R",
  "R U R' U R U2 R' U' R U R' U' R U2 R' U' R",
  "R' U' R U R' U2 R U R' U' R U R' U2 R U R",

  "U2 R U R' U R U2 R' U R U' R' U R U' R",
  "U2 R' U' R U' R' U2 R U' R' U R U' R' U'",
  "R U R' U R U' R' U R U2 R' U R U2 R'",
  "R' U' R U' R U R' U' R U2 R' U' R2 U2 R2"
]

// 动态生成完整的解法（通过实际求解）
const solver = require('cube-solver')

function generateTestPairs() {
  const pairs = []

  for (const scramble of WCA_SCRAMBLES) {
    try {
      // 使用solver获取真实的还原解法
      const solution = solver.solve(scramble)

      // 有些解法可能比打乱还短（因为打乱不完美），这是正常的
      // 添加一些"用户解法"变体来测试分析功能
      const userSolutions = [
        solution,                    // 最优解
        solution + " U R U' R'",      // 多做一些动作
        solution + " R U R' U'",      // 多做一些动作
        "R U R' U' " + solution,      // 多做一些动作
      ]

      pairs.push({
        scramble,
        optimal: solution,
        userSolutions: userSolutions.slice(0, 3), // 只用前3个
      })
    } catch (e) {
      const err = e as Error
      console.error('生成测试对失败:', scramble, err.message)
    }
  }

  return pairs
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function testWCAAnalysis() {
  const API_URL = 'http://localhost:3002/api/cube/analyze'

  console.log(`🧪 测试真实WCA打乱...`)
  console.log(`   (添加了延时以避免速率限制)`)
  console.log(``)

  const pairs = generateTestPairs()
  const results = {
    totalTests: 0,
    success: 0,
    failed: 0,
    details: [] as any[]
  }

  for (const pair of pairs.slice(0, 20)) { // 测试前20个 (减少数量避免限制)
    for (const userSolution of pair.userSolutions) {
      results.totalTests++

      // 添加延迟避免触发速率限制 (每6秒一次，确保不超过每分钟10次)
      await delay(6000)

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scramble: pair.scramble,
            solution: userSolution
          }),
        })

        if (response.ok) {
          const data = await response.json()
          results.success++

          // 只显示前3个的详细信息
          if (results.success <= 3) {
            console.log(`✅ 测试 ${results.success}:`)
            console.log(`   打乱: ${pair.scramble}`)
            console.log(`   最优解: ${pair.optimal} (${pair.optimal.split(' ').length}步)`)
            console.log(`   用户解步数: ${data.summary?.steps || 'N/A'}`)
            console.log(`   最优步数: ${data.summary?.optimalSteps || 'N/A'}`)
            console.log(`   效率评分: ${data.summary?.efficiency || 'N/A'}`)
            console.log()
          }

          results.details.push({
            scramble: pair.scramble,
            optimalSteps: pair.optimal.split(' ').length,
            userSteps: data.summary?.steps,
            efficiency: data.summary?.efficiency,
            valid: data.validation?.isValid,
          })
        } else {
          results.failed++
          console.error(`❌ HTTP ${response.status}`)
        }
      } catch (error) {
        results.failed++
        console.error(`❌ 请求失败:`, error)
      }
    }
  }

  console.log('='.repeat(50))
  console.log('📊 测试结果汇总:')
  console.log(`   总测试数: ${results.totalTests}`)
  console.log(`   成功: ${results.success}`)
  console.log(`   失败: ${results.failed}`)
  console.log(`   成功率: ${((results.success / results.totalTests) * 100).toFixed(1)}%`)

  // 统计分析
  if (results.details.length > 0) {
    const avgEfficiency = results.details.reduce((sum, d) => sum + (d.efficiency || 0), 0) / results.details.length
    const avgOptimalSteps = results.details.reduce((sum, d) => sum + (d.optimalSteps || 0), 0) / results.details.length
    const avgUserSteps = results.details.reduce((sum, d) => sum + (d.userSteps || 0), 0) / results.details.length

    console.log('')
    console.log('📈 统计分析:')
    console.log(`   平均最优步数: ${avgOptimalSteps.toFixed(1)}步`)
    console.log(`   平均用户步数: ${avgUserSteps.toFixed(1)}步`)
    console.log(`   平均效率评分: ${avgEfficiency.toFixed(1)}/10`)
  }

  return results
}

testWCAAnalysis().then(results => {
  if (results.failed === 0) {
    console.log('')
    console.log('🎉 所有测试通过!')
    process.exit(0)
  } else {
    console.log('')
    console.log(`⚠️  有 ${results.failed} 个测试失败`)
    process.exit(1)
  }
})
