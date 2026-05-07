'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateId } from '@/lib/utils'

interface CopyEvent {
  id: string
  assetId?: string
  label?: string
  copiedAt: string // ISO timestamp — no prompt content stored
}

interface CopyState {
  copyEvents: CopyEvent[]
  recordCopy: (assetId?: string, label?: string) => void
}

const PRUNE_DAYS = 90

export const useCopyStore = create<CopyState>()(
  persist(
    (set) => ({
      copyEvents: [],

      recordCopy: (assetId, label) => {
        const now = new Date()
        const cutoff = new Date(now)
        cutoff.setDate(cutoff.getDate() - PRUNE_DAYS)

        const event: CopyEvent = {
          id: generateId(),
          assetId,
          label,
          copiedAt: now.toISOString(),
        }

        set((state) => ({
          copyEvents: [
            ...state.copyEvents.filter((e) => new Date(e.copiedAt) > cutoff),
            event,
          ],
        }))
      },
    }),
    {
      name: 'promptvault-copy-events',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      }),
    }
  )
)
