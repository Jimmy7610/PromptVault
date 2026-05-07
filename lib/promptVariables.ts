const PATTERN = /\{([a-zA-Z][a-zA-Z0-9_-]*)\}/g

export function extractPromptVariables(text: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const re = new RegExp(PATTERN.source, 'g')
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1])
      result.push(match[1])
    }
  }
  return result
}

export function fillPromptVariables(text: string, values: Record<string, string>): string {
  return text.replace(new RegExp(PATTERN.source, 'g'), (_, name) =>
    values[name] !== undefined && values[name] !== '' ? values[name] : `{${name}}`
  )
}

export function hasPromptVariables(text: string): boolean {
  return new RegExp(PATTERN.source).test(text)
}
