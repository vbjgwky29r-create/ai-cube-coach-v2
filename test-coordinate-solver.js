const { solveCFOPWithCoordinates } = require('./lib/cube/cfop-solver-coordinate')

const scramble = "R U R' U'"

console.log('Testing coordinate-based CFOP solver...')
console.log('Scramble:', scramble)

try {
  const result = solveCFOPWithCoordinates(scramble)
  console.log('\nResult:')
  console.log('Cross:', result.cross)
  console.log('F2L:', result.f2l)
  console.log('OLL:', result.oll)
  console.log('PLL:', result.pll)
  console.log('Verified:', result.verified)
} catch (e) {
  console.error('Error:', e.message)
}
