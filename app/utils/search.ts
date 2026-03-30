import type { getToolName } from 'ai'

export interface SearchSource {
  url: string
  title?: string
}

interface GoogleGroundingChunk {
  web?: { uri?: string, title?: string }
}

interface SearchOutput {
  sources?: { url: string, type?: string }[]
  groundingChunks?: GoogleGroundingChunk[]
  groundingMetadata?: { groundingChunks?: GoogleGroundingChunk[] }
}

type ToolPart = Parameters<typeof getToolName>[0]

export function getSearchQuery(part: ToolPart): string | undefined {
  return (part.input as { query?: string } | undefined)?.query
}

export function getSources(part: ToolPart): SearchSource[] {
  const output = part.output
  if (!output) return []

  // Anthropic: array of { url, title }
  if (Array.isArray(output)) {
    return output.filter((s: SearchSource) => s.url).map((s: SearchSource) => ({ url: s.url, title: s.title }))
  }

  const typed = output as SearchOutput

  // OpenAI: { sources: [{ type: 'url', url }] }
  if (typed.sources) {
    return typed.sources.filter(s => s.url).map(s => ({ url: s.url }))
  }

  // Google: grounding chunks with { web: { uri, title } }
  const chunks = typed.groundingChunks ?? typed.groundingMetadata?.groundingChunks
  if (chunks) {
    return chunks.filter(c => c.web?.uri).map(c => ({ url: c.web!.uri!, title: c.web!.title }))
  }

  return []
}

export function sourceToInlineHtml(url: string): string {
  const domain = getDomain(url)
  const favicon = getFaviconUrl(url)
  const safeUrl = url.replace(/"/g, '&quot;')
  const safeFavicon = favicon.replace(/"/g, '&quot;')

  return ` :button{to="${safeUrl}" target="_blank" :avatar='{ "src": "${safeFavicon}" }' label="${domain}" trailingIcon="i-lucide-arrow-up-right" size="xs" color="neutral" variant="outline" class="rounded-full align-middle"}`
}
