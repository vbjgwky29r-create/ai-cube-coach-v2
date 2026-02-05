const Cube = require('cubejs');

// 测试1：简单打乱和还原
console.log('=== 测试1：基础功能 ===');
const cube1 = new Cube();
console.log('初始状态:', cube1.isSolved());

cube1.move("R U R' U'");
console.log('打乱后:', cube1.isSolved());

cube1.move("U R U' R'");
console.log('还原后:', cube1.isSolved());

// 测试2：验证我们的解法格式
console.log('\n=== 测试2：解法格式 ===');
const cube2 = new Cube();
cube2.move("R U R' U'");
try {
  cube2.move("F2 R2 B2 L2");
  console.log('Cross 公式应用成功');
} catch (e) {
  console.log('Cross 公式应用失败:', e.message);
}
