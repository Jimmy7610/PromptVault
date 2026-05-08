import { Collection } from '@/types'

export async function loadCollectionsFromVault(): Promise<Collection[]> {
  try {
    const res = await fetch('/api/vault/collections')
    if (!res.ok) return []
    const data = await res.json()
    return data.collections ?? []
  } catch {
    return []
  }
}

export async function saveCollectionsToVault(
  collections: Collection[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/vault/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collections }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      return { ok: false, error: data.error }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
