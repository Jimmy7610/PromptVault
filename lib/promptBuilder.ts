import { Asset } from '@/types'

export function buildOllamaPrompt(
  asset: Asset,
  userInput: string,
  context?: string
): { system: string; prompt: string } {
  const systemParts: string[] = []

  if (asset.systemPrompt) {
    systemParts.push(`## ROLE\n${asset.systemPrompt}`)
  }

  if (asset.instructions) {
    systemParts.push(`## INSTRUCTIONS\n${asset.instructions}`)
  }

  if (asset.variables && asset.variables.length > 0) {
    const varLines = asset.variables.map((v) => `- ${v.name} = ${v.value}`).join('\n')
    systemParts.push(`## VARIABLES\n${varLines}`)
  }

  if (asset.tools.length > 0) {
    systemParts.push(`## AVAILABLE TOOLS\n${asset.tools.join(', ')}`)
  }

  if (asset.exampleOutput) {
    systemParts.push(`## EXAMPLE OUTPUT FORMAT\n${asset.exampleOutput}`)
  }

  systemParts.push(
    '## OUTPUT REQUIREMENTS\nRespond clearly and concisely. Format your output appropriately for the task.'
  )

  const promptParts: string[] = []
  promptParts.push(`## USER TASK\n${userInput}`)

  if (context?.trim()) {
    promptParts.push(`## CONTEXT\n${context.trim()}`)
  }

  return {
    system: systemParts.join('\n\n'),
    prompt: promptParts.join('\n\n'),
  }
}
