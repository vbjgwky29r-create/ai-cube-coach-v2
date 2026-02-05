const Cube = require('cubejs');
const { applyScramble } = require('./.next/server/chunks/lib_cube_cube-state_ts.js');
const { isCrossComplete, getCrossCompleteness } = require('./.next/server/chunks/lib_cube_cross-checker_ts.js');

// 测试1：还原状态
console.log('=== 测试1：还原状态 ===');
const solved = applyScramble('');
console.log('Cross 完成:', isCrossComplete(solved));
console.log('完成度:', getCrossCompleteness(solved));

// 测试2：简单打乱
console.log('\n=== 测试2：简单打乱 ===');
const scrambled1 = applyScramble("R U R' U'");
console.log('Cross 完成:', isCrossComplete(scrambled1));
console.log('完成度:', getCrossCompleteness(scrambled1));

// 测试3：复杂打乱
console.log('\n=== 测试3：复杂打乱 ===');
const scrambled2 = applyScramble("U R2 F' R' U' R2 L U B' D F2 U2 R2 F2 B2 D2 F2 D2 R D2 R");
console.log('Cross 完成:', isCrossComplete(scrambled2));
console.log('完成度:', getCrossCompleteness(scrambled2));
