const Cube = require('cubejs');

const scramble = "U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R";
const solution = "F2 R2 B2 L2 R U R' R U R' R U R' R U R' R U2 R' U' R U R' U' R U' R' M2 U M U2 M' U M2";

const cube = new Cube();
console.log('初始状态:', cube.isSolved());

cube.move(scramble);
console.log('打乱后:', cube.isSolved());

cube.move(solution);
console.log('应用解法后:', cube.isSolved());

if (!cube.isSolved()) {
  console.log('\n❌ 解法无法还原魔方！');
  console.log('最终状态:', cube.asString());
} else {
  console.log('\n✅ 解法可以还原魔方！');
}
