import { OllamaModel } from '@/types'

export async function fetchOllamaModels(baseUrl: string): Promise<OllamaModel[]> {
  const res = await fetch('/api/ollama/tags', {
    headers: { 'x-ollama-url': baseUrl },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? `HTTP ${res.status}`)
  }
  const data = await res.json()
  return (data.models ?? []) as OllamaModel[]
}

export async function testOllamaConnection(
  baseUrl: string
): Promise<{ ok: boolean; modelCount?: number; error?: string }> {
  const res = await fetch(`/api/ollama/test?url=${encodeURIComponent(baseUrl)}`)
  return res.json()
}

export async function generateWithOllama(params: {
  ollamaUrl: string
  model: string
  prompt: string
  system?: string
}): Promise<string> {
  const res = await fetch('/api/ollama/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Ollama error ${res.status}`)
  }
  return (data.response as string) ?? ''
}
