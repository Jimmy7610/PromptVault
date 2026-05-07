import { UpdateCheckResult, UpdateInstallResult } from '@/types'

export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const res = await fetch('/api/system/update/check')
    const data = await res.json()
    return data as UpdateCheckResult
  } catch (err) {
    return {
      ok: false,
      errors: [err instanceof Error ? err.message : 'Network error checking for updates.'],
      warnings: [],
    }
  }
}

export async function installUpdate(): Promise<UpdateInstallResult> {
  try {
    const res = await fetch('/api/system/update/install', { method: 'POST' })
    const data = await res.json()
    return data as UpdateInstallResult
  } catch (err) {
    return {
      ok: false,
      success: false,
      logs: [],
      errors: [err instanceof Error ? err.message : 'Network error during install.'],
      restartRequired: false,
    }
  }
}
