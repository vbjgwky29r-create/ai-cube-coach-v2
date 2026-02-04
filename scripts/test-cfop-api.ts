import OpenAI from 'openai'

const client = new OpenAI()

async function testCFOP() {
  const scramble = "U' R' L U' B D' F' U' L F R2 L2 D' F2 R2 F2 R2 U2 B2 R2 F2"
  
  console.log('测试 CFOP 解法生成...')
  console.log('打乱公式:', scramble)
  
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { 
        role: 'system', 
        content: `你是魔方教练，为打乱公式生成 CFOP 解法。输出 JSON 格式：
{
  "cross": { "moves": "...", "steps": N, "description": "..." },
  "f2l": { "moves": "...", "steps": N, "pairs": ["...", "...", "...", "..."], "description": "..." },
  "oll": { "moves": "...", "steps": N, "caseName": "...", "description": "..." },
  "pll": { "moves": "...", "steps": N, "caseName": "...", "description": "..." },
  "totalSteps": N,
  "fullSolution": "...",
  "orientation": "白底绿前"
}`
      },
      { role: 'user', content: `打乱: ${scramble}\n生成 CFOP 解法，只输出 JSON` }
    ],
    temperature: 0.3,
  })
  
  console.log('\n=== AI 响应 ===')
  console.log(response.choices[0]?.message?.content)
}

testCFOP().catch(console.error)
