import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url') || 'http://localhost:11434'

  try {
    const res = await fetch(`${url}/api/tags`, {
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `HTTP ${res.status}` })
    }
    const data = await res.json()
    const modelCount: number = data.models?.length ?? 0
    return NextResponse.json({ ok: true, modelCount })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message })
  }
}
