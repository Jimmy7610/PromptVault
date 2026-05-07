import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { ollamaUrl = 'http://localhost:11434', model, prompt, system } = body

  if (!model || !prompt) {
    return NextResponse.json({ error: 'model and prompt are required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, system, stream: false }),
      signal: AbortSignal.timeout(180000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: text || `Ollama returned ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Ollama request failed: ${message}` }, { status: 503 })
  }
}
