const Cube = require('cubejs');

const scramble = "U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R";
const cross = "F2 R2 B2 L2";
const f2l = "R U R' R U R' R U R' R U R'";
const oll = "R U2 R' U' R U R' U' R U' R'";
const pll = "M2 U M U2 M' U M2";

const cube = new Cube();
console.log('初始状态:', cube.isSolved());

cube.move(scramble);
console.log('打乱后:', cube.isSolved());

// 逐步应用解法
console.log('\n=== 逐步应用解法 ===');
cube.move(cross);
console.log('Cross 后:', cube.isSolved());

cube.move(f2l);
console.log('F2L 后:', cube.isSolved());

cube.move(oll);
console.log('OLL 后:', cube.isSolved());

cube.move(pll);
console.log('PLL 后:', cube.isSolved());

// 打印最终状态
console.log('\n最终魔方状态:');
console.log(cube.asString());
