import { OllamaModel } from '@/types'
import { Asset } from '@/types'

type TaskType = 'coding' | 'writing' | 'reasoning' | 'general'

const PREFERENCES: Record<TaskType, string[]> = {
  coding: ['codellama', 'qwen2.5-coder', 'deepseek-coder', 'starcoder', 'codegemma', 'qwen-coder'],
  writing: ['llama3', 'mistral', 'gemma', 'phi3', 'llama2', 'neural-chat'],
  reasoning: ['llama3.1', 'llama3.2', 'qwen2.5', 'mixtral', 'phi3', 'llama3'],
  general: ['llama3', 'mistral', 'gemma', 'phi3', 'llama2', 'tinyllama'],
}

export function detectTaskType(asset: Pick<Asset, 'type' | 'tools' | 'systemPrompt'>): TaskType {
  const tools = asset.tools ?? []
  const prompt = (asset.systemPrompt ?? '').toLowerCase()
  const type = asset.type

  if (
    type === 'code' ||
    tools.some((t) => /code|dev|program|script/i.test(t)) ||
    /code|program|develop|script|function|class/i.test(prompt)
  ) {
    return 'coding'
  }

  if (
    tools.some((t) => /write|content|copy|blog|post/i.test(t)) ||
    /write|content|blog|post|article|copy|essay/i.test(prompt)
  ) {
    return 'writing'
  }

  if (/reason|analys|think|plan|strateg|evaluat|assess/i.test(prompt)) {
    return 'reasoning'
  }

  return 'general'
}

export function selectBestModel(models: OllamaModel[], taskType: TaskType): string | null {
  if (models.length === 0) return null
  const names = models.map((m) => m.name.toLowerCase())
  const prefs = PREFERENCES[taskType]

  for (const pref of prefs) {
    const idx = names.findIndex((n) => n.includes(pref))
    if (idx !== -1) return models[idx].name
  }

  // Fall back to the first available model
  return models[0].name
}
