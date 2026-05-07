'use client'
import { useUserStore } from '@/stores/useUserStore'
import { translate } from './translations'
import { AppLanguage } from '@/types'

export function useI18n() {
  // Graceful fallback: older localStorage data may not have `language` yet
  const language: AppLanguage = useUserStore((s) => s.settings?.language ?? 'en')

  const t = (key: string): string => translate(language, key)

  return { t, language }
}
