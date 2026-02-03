import { parseFormula } from '../lib/cube/parser'

const testCases = [
  { input: 'U2', expected: 'U2' },
  { input: "U2'", expected: 'U2' },
  { input: "R U2' L", expected: 'R U2 L' },
  { input: "R U R' U2' R U2 R'", expected: "R U R' U2 R U2 R'" },
]

console.log('测试 2\' 标准化:')
console.log('='.repeat(50))

let passed = 0
let failed = 0

testCases.forEach(({ input, expected }) => {
  const result = parseFormula(input)
  const actual = result.moves.map(m => m.face + m.modifier).join(' ')

  if (actual === expected) {
    console.log(`✅ "${input}" -> "${actual}"`)
    passed++
  } else {
    console.log(`❌ "${input}"`)
    console.log(`   期望: "${expected}"`)
    console.log(`   实际: "${actual}"`)
    failed++
  }
})

console.log('='.repeat(50))
console.log(`通过: ${passed}/${testCases.length}`)

if (failed > 0) {
  process.exit(1)
}
