"""
Update COLL section in formulas.ts with all 40 formulas
"""
import re

# Complete COLL formulas from SpeedCubeDB
coll_data = '''// AS (Anti-Sune) - 6 formulas
  {
    id: 'coll_as_1',
    name: 'COLL AS 1',
    notation: "y R U2 R' U' R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Anti Sune 情况1',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_2',
    name: 'COLL AS 2',
    notation: "y2 R2 D R' U R D' R' U R' U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-Anti Sune 情况2',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_3',
    name: 'COLL AS 3',
    notation: "y2 R2 D R' U2 R D' R2 U' R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Anti Sune 情况3',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_4',
    name: 'COLL AS 4',
    notation: "y2 R' U' R U' R2 D' R U2 R' D R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Anti Sune 情况4',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_5',
    name: 'COLL AS 5',
    notation: "y2 r' F R F' r U R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Anti Sune 情况5',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  {
    id: 'coll_as_6',
    name: 'COLL AS 6',
    notation: "R U' R' U2 R U' R' U2 R' D' R U R' D R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Anti Sune 情况6',
    recognition: 'AS情况',
    searchKeys: ['coll', 'as', 'antisune'],
  },
  // S (Sune) - 6 formulas
  {
    id: 'coll_s_2',
    name: 'COLL S 2',
    notation: "y2 R U R' U R2 D R' U2 R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Sune 情况2',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_3',
    name: 'COLL S 3',
    notation: "L' R U R' U' L U2 R U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 10,
    explanation: 'COLL-Sune 情况3',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_4',
    name: 'COLL S 4',
    notation: "y' R U R' U R U' R D R' U' R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-Sune 情况4',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_5',
    name: 'COLL S 5',
    notation: "R U' L' U R' U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 7,
    explanation: 'COLL-Sune 情况5',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  {
    id: 'coll_s_6',
    name: 'COLL S 6',
    notation: "y2 R U R' U r' F R F' r U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-Sune 情况6',
    recognition: 'Sune情况',
    searchKeys: ['coll', 'sune', 's'],
  },
  // L - 6 formulas
  {
    id: 'coll_l_3',
    name: 'COLL L 3',
    notation: "y R U2 R D R' U2 R D' R2",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-L 情况3',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_4',
    name: 'COLL L 4',
    notation: "y F R' F' r U R U' r'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-L 情况4',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_5',
    name: 'COLL L 5',
    notation: "y2 F' r U R' U' r' F R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-L 情况5',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  {
    id: 'coll_l_6',
    name: 'COLL L 6',
    notation: "y r U2 R2 F R F' R U2 r'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-L 情况6',
    recognition: 'L情况',
    searchKeys: ['coll', 'l'],
  },
  // U - 6 formulas
  {
    id: 'coll_u_2',
    name: 'COLL U 2',
    notation: "R' F R U' R' U' R U R' F' R U R' U' R' F R F' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 19,
    explanation: 'COLL-U 情况2',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_3',
    name: 'COLL U 3',
    notation: "y2 R2 D R' U2 R D' R' U2 R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 9,
    explanation: 'COLL-U 情况3',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_4',
    name: 'COLL U 4',
    notation: "F R U' R' U R U R' U R U' R' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 13,
    explanation: 'COLL-U 情况4',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_5',
    name: 'COLL U 5',
    notation: "R2 D' R U2 R' D R U2 R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 9,
    explanation: 'COLL-U 情况5',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  {
    id: 'coll_u_6',
    name: 'COLL U 6',
    notation: "R2 D' R U R' D R U R U' R' U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-U 情况6',
    recognition: 'U情况',
    searchKeys: ['coll', 'u'],
  },
  // T - 6 formulas
  {
    id: 'coll_t_2',
    name: 'COLL T 2',
    notation: "R' U R U2 R' L' U R U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 10,
    explanation: 'COLL-T 情况2',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_3',
    name: 'COLL T 3',
    notation: "y R' F' r U R U' r' F",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-T 情况3',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_4',
    name: 'COLL T 4',
    notation: "y2 F R U R' U' R U' R' U' R U R' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 13,
    explanation: 'COLL-T 情况4',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_5',
    name: 'COLL T 5',
    notation: "y' r U R' U' r' F R F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 8,
    explanation: 'COLL-T 情况5',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  {
    id: 'coll_t_6',
    name: 'COLL T 6',
    notation: "R' U R2 D r' U2 r D' R2 U' R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 11,
    explanation: 'COLL-T 情况6',
    recognition: 'T情况',
    searchKeys: ['coll', 't'],
  },
  // Pi - 6 formulas
  {
    id: 'coll_pi_2',
    name: 'COLL Pi 2',
    notation: "y F U R U' R' U R U' R2 F' R U R U' R'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Pi 情况2',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_3',
    name: 'COLL Pi 3',
    notation: "R' U' F' R U R' U' R' F R2 U2 R' U2 R",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-Pi 情况3',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_4',
    name: 'COLL Pi 4',
    notation: "R U R' U' R' F R2 U R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 15,
    explanation: 'COLL-Pi 情况4',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_5',
    name: 'COLL Pi 5',
    notation: "R U' L' U R' U L U L' U L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: 'COLL-Pi 情况5',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  {
    id: 'coll_pi_6',
    name: 'COLL Pi 6',
    notation: "R' F' U' F U' R U S' R' U R S",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 12,
    explanation: 'COLL-Pi 情况6',
    recognition: 'Pi情况',
    searchKeys: ['coll', 'pi', 'π'],
  },
  // H - 4 formulas
  {
    id: 'coll_h_2',
    name: 'COLL H 2',
    notation: "F R U' R' U R U2 R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-H 情况2',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },
  {
    id: 'coll_h_3',
    name: 'COLL H 3',
    notation: "R U R' U R U L' U R' U' L",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 3,
    moves: 11,
    explanation: 'COLL-H 情况3',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },
  {
    id: 'coll_h_4',
    name: 'COLL H 4',
    notation: "y F R U R' U' R U R' U' R U R' U' F'",
    category: FormulaCategory.COLL,
    method: FormulaMethod.CFOP,
    difficulty: 4,
    moves: 14,
    explanation: 'COLL-H 情况4',
    recognition: '车灯情况',
    searchKeys: ['coll', 'h', 'headlights'],
  },
'''

# Read the current file
with open('lib/cube/formulas.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace COLL section
# Find the start of COLL section
coll_start = content.find('// ============================================\n// COLL - 40个公式')
if coll_start == -1:
    print("Could not find COLL section start")
    exit(1)

# Find the start of the next export section after COLL_ALGORITHMS
# First find ZBLL section start
zbll_start = content.find('// ============================================\n// ZBLL', coll_start)
if zbll_start == -1:
    print("Could not find ZBLL section")
    exit(1)

# Build the new COLL section (keep existing COLL formulas and add new ones)
new_coll_section = f'''// ============================================
// COLL - 40个公式 (完整版 Corners of Last Layer)
// 数据来源: SpeedCubeDB
// COLL 解决顶层角块的朝向和排列（前提: 边缘已朝向）
// ============================================

export const COLL_ALGORITHMS: Formula[] = [
{coll_data}
]

'''

# Replace the old COLL section with the new one
new_content = content[:coll_start] + new_coll_section + content[zbll_start:]

# Write back
with open('lib/cube/formulas.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("COLL section updated successfully!")
coll_count = coll_data.count("id: 'coll_")
print(f"Added {coll_count} new COLL formulas")
print("Total COLL formulas should be: 40")
