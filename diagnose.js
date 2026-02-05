const Cube = require('cubejs');
const { applyScramble } = require('./lib/cube/cube-state');

// 测试打乱应用
const scramble = "U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R";

console.log('=== 测试1：cubejs 打乱 ===');
const cube1 = new Cube();
cube1.move(scramble);
console.log('打乱后是否已还原:', cube1.isSolved());
console.log('魔方状态:', cube1.asString());

console.log('\n=== 测试2：applyScramble 打乱 ===');
const state = applyScramble(scramble);
console.log('状态对象:', JSON.stringify(state).substring(0, 200));
