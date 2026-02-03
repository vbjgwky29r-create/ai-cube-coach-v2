/**
 * 测试魔方分析API
 * 生成100个随机打乱公式并测试分析功能
 */

const SCRAMBLES = [
  // 简单打乱 (10-15步)
  "R U R' U' R' F R F'",
  "R U R' U R U2 R'",
  "R' U' R U' R' U2 R",
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "U R U R' U R U2 R'",
  "R U2 R' U' R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",

  // 标准打乱 (20步)
  "D2 R' U' L2 U2 F2 D2 L2 B2 R2 U' F2 R B' L' U' F2 R2 D' F' L",
  "R2 D2 F2 U2 L2 B2 D2 R2 U2 F2 R U B' D' L U' F' R D' L'",
  "L2 B2 U2 F2 R2 D2 L2 F2 R2 U' R' U L' B' R F' D' U F L'",
  "F2 R2 B2 D2 L2 U2 F2 R2 B2 U' L' U R' B' D F' U' L' B R",

  // WCA打乱风格
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "U R U R' U R U2 R' U' R U R' U' R' F R F'",
  "R U R' U' R' F R2 U' R' U' R U R' F' U2",

  // 更多随机打乱
  "R' U2 R U R' U R",
  "R U R' U R U2 R'",
  "R U2 R' U' R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",
  "F R U' R' U' R U R' F'",
  "R U R' U R U2 R'",
  "R U R' U' R' F R F'",
  "R' U' R U R U2 R'",

  // 20步标准打乱 (更多)
  "L2 F2 R2 D2 B2 L2 U2 F2 R2 U2 F2 L' D B' U F L' U R2 F2",
  "B2 L2 F2 R2 D2 U2 B2 L2 F2 U2 L B D' R F' L' U' B2 R2 U'",
  "R2 L2 U2 D2 F2 B2 R2 L2 U2 D2 R' L' U' D' F' B' R L",
  "F2 B2 U2 D2 R2 L2 F2 B2 U2 D2 F' B' U' D' R' L' F B",

  // 宽层动作打乱
  "r U r' U' r' F r2 U' r' U' r U r' F'",
  "R U R' U' r U' R' U R U2 r'",

  // 中层动作打乱
  "M2 U M2 U2 M2 U M2",
  "E2 S2 R2 E2 S2",

  // 组合打乱
  "R U R' U' R' F R2 U' R' U' R U R' F' U2",
  "R U R' U R U2 R' U' R U R' U' R' F R F'",
  "F R U' R' U' R U R' F' R U R' U' R' F R F'",

  // 更多复杂打乱
  "R2 U2 F2 R2 U2 R2 F2 U2 R2",
  "R' U2 R U2 R' F R2 U' R' U' R U R' F'",
  "R U R' U' R' F R2 U' R' U' R U R' F' U2",

  // 更多测试用例
  "U R U' R' U R U' R'",
  "R U R' U' R U R'",
  "R' U' R U' R' U2 R",
  "R U2 R' U' R U' R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",
  "F R U' R' U' R U R' F'",
  "R U R' U R U2 R' U' R U R' U' R' F R F'",
  "R' U' R U' R' U2 R U R U' R' U R U2 R'",

  // 更多标准打乱
  "D' R2 U' L2 U2 F2 D' R2 U2 F2 L2 U' B L U F' R F2 R",
  "U2 R2 F2 U2 R2 D2 F2 U2 L2 B2 U' L' F' D R2 B U' L2 U'",
  "F2 U2 L2 R2 D2 F2 U2 R2 B2 U B2 L U' F2 R2 D R2 B'",
  "R2 U2 B2 D2 L2 F2 R2 U2 L2 D2 F' L U B' R D' U2 L2",

  // 旋转动作打乱
  "R U R' U' x R' U R' D2 R U' R' D2 R2",
  "R U R' U' y R U R' U' R U2 R'",

  // 更多公式测试
  "R U R' U' R' F R F'",
  "R' F R' F' R2 U2 R' U' R U R' U R",
  "F' R U R' U' R' F R2 U' R' U' R U R' F'",
  "R U R' U' R' F R2 U' R' U' R U R' F' U2",

  // OLL测试
  "R U R' U R U2 R'",
  "R U2 R2 U' R2 U' R2 U2 R",
  "R U R' U R U' R' U R U2 R'",

  // 更多混合打乱
  "R U R' U' R' F R F' U2 R' F R' F' R U R'",
  "R' U' R U R' U2 R' U' R U R' U R U'",
  "R U2 R' U' R U R' U' R U' R'",

  // 大量打乱填充到100
  "L2 U2 L2 U2 L2 U2 L2",
  "R2 U2 R2 U2 R2 U2 R2",
  "F2 U2 F2 U2 F2 U2 F2",
  "B2 U2 B2 U2 B2 U2 B2",

  "R U R' U' R U2 R' U' R U R'",
  "R' U' R U' R' U2 R U R' U' R'",
  "F R U R' U' F'",
  "R U R' U' R' F R F'",

  "R U R' U R U2 R' U' R U R'",
  "R' U' R U' R' U2 R U R' U' R'",
  "F R U' R' U' R U R' F'",
  "R U R' U' R' F R2 U' R' U' R U R' F'",

  "U R U' R' U R U' R'",
  "U' R U R' U' R U R'",
  "R' U' R U' R' U2 R U R' U' R'",
  "R U R' U R U2 R' U' R U R'",

  "F R U R' U' F' U2 F R U R' U' F'",
  "R' F R' F' R2 U2 R' U' R U R' U R U'",
  "R U R' U' R U2 R' U R U' R' U' R U2 R'",
  "R' U2 R U R' U2 R U R' U2 R U R'",

  "L' U' L U' L' U2 L U L' U' L",
  "L U L' U L U2 L' U' L U L'",
  "R' U2 R U2 R' F R2 U' R' U' R U R' F'",
  "R U2 R' U' R U2 R' U' R U2 R'",

  "F R U' R' U' R U R' F' U R U R'",
  "R U R' U' R' F R F' U' R U R'",
  "R' F R' F' R2 U2 R' U' R U R' U R",
  "F R U' R' U' R U R' F' R U2 R'",

  "U2 R U R' U R U2 R'",
  "U2 R' U' R U' R' U2 R",
  "R U2 R' U' R U' R' U2 R U R'",
  "R' U2 R U R' U R U2 R' U' R'",

  "R U R' U R U2 R' U R U' R'",
  "R' U' R U' R' U2 R U' R' U R",
  "F R U R' U' F' U R U R' U' R U2 R'",
  "R' F R' F' R2 U2 R' U' R U R' U R U'",

  "R U R' U' R U R' U' R U R' U' R",
  "R' U' R U R' U' R U R' U' R U R'",
  "F' R U R' U' R U' R' U R U R' F'",
  "R U R' U R U' R' U R U2 R' U' R U R'",

  "R U R' U' R' F R2 U' R' U' R U R' F' U2",
  "R' U2 R U R' U2 R U R' U2 R U R' U2 R",
  "F R U R' U' F' U' F' R U R' U' R U R' F",
  "R U R' U R U2 R' U R U' R' U' R U2 R' U'",

  "R U2 R' U' R U' R'",
  "R' U2 R U R' U R",
  "F R U' R' U' R U R' F' U R U R' U'",
  "R' F R' F' R2 U2 R' U' R U R' U R U R",

  "R U R' U' R U2 R' U' R U R' U' R U2 R'",
  "R' U' R U R' U2 R U R' U R U' R' U2 R",
  "F R U' R' U' R U R' F' U' F' R U R' U' F",
  "R U R' U' R' F R2 U' R' U' R U R' F' U R",

  "U R U' R' U R U' R' U R U' R'",
  "U' R U R' U' R U R' U' R U R'",
  "R U2 R' U' R U R' U' R U2 R' U' R U R'",
  "R' U2 R U R' U' R U R' U2 R U R' U' R'",

  "R U R' U' R U R' U' R U R' U' R U R'",
  "R' U' R U R' U' R U R' U' R U R' U' R'",
  "F R U' R' U' R U R' F' U2 F R U' R' F'",
  "R' F R' F' R2 U2 R' U' R U R' U R U' R",

  "R U R' U' R' F R F' U R U2 R' U' R U R'",
  "R' U' R U R U R' U' R' U R U2 R' U' R'",
  "F' R U R' U' R U' R' F R U R' U' R U2 R'",
  "R U2 R' U' R U' R' U2 R U R' U' R U R'",

  "R U R' U R U2 R' U' R U R' U' R U2 R'",
  "R' U' R U' R' U2 R U R' U R U' R' U2 R",
  "F R U R' U' F' U R U2 R' U R U' R' U",
  "R' F R' F' R2 U2 R' U' R U R' U R U2",

  "R U R' U' R U2 R' U R U' R' U' R U2 R'",
  "R' U' R U R' U2 R U' R' U R U R' U2 R",
  "F R U' R' U' R U R' F' U F R U' R' F'",
  "R' F R' F' R2 U2 R' U' R U R' U R U2",

  "R U2 R' U' R U R' U' R U2 R' U' R U R'",
  "R' U2 R U R' U' R U R' U2 R U R' U' R'",
  "F' R U R' U' R U' R' F R U R' U R U2",
  "R U R' U R U' R' U R U2 R' U R U' R'"
]

// 测试函数
async function testAnalysis() {
  const API_URL = 'http://localhost:3002/api/cube/analyze'

  console.log(`🧪 开始测试 ${SCRAMBLES.length} 个打乱公式...\n`)

  const results = {
    total: SCRAMBLES.length,
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (let i = 0; i < SCRAMBLES.length; i++) {
    const scramble = SCRAMBLES[i]
    // 使用一个简单的解法进行测试
    const solution = "R U R' U' R' F R F'"

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scramble, solution }),
      })

      if (response.ok) {
        const data = await response.json()
        results.success++

        // 打印前5个结果的详情
        if (i < 5) {
          console.log(`✅ 测试 ${i + 1}:`)
          console.log(`   打乱: ${scramble}`)
          console.log(`   步数: ${data.summary?.steps || 'N/A'}`)
          console.log(`   最优步数: ${data.summary?.optimalSteps || 'N/A'}`)
          console.log(`   效率评分: ${data.summary?.efficiency || 'N/A'}`)
          console.log(`   验证: ${data.validation?.isValid ? '有效' : '无效'}`)
          console.log()
        }
      } else {
        results.failed++
        results.errors.push(`测试 ${i + 1}: HTTP ${response.status}`)
        console.error(`❌ 测试 ${i + 1}: HTTP ${response.status}`)
      }
    } catch (error) {
      results.failed++
      results.errors.push(`测试 ${i + 1}: ${error}`)
      console.error(`❌ 测试 ${i + 1}:`, error)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总:')
  console.log(`   总计: ${results.total}`)
  console.log(`   成功: ${results.success}`)
  console.log(`   失败: ${results.failed}`)
  console.log(`   成功率: ${((results.success / results.total) * 100).toFixed(1)}%`)

  if (results.errors.length > 0) {
    console.log('\n❌ 错误列表:')
    results.errors.forEach(err => console.log(`   ${err}`))
  }

  return results
}

// 运行测试
testAnalysis().then(results => {
  if (results.failed === 0) {
    console.log('\n🎉 所有测试通过!')
    process.exit(0)
  } else {
    console.log(`\n⚠️  有 ${results.failed} 个测试失败`)
    process.exit(1)
  }
})
