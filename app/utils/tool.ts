import type { getToolName } from 'ai'

export interface Source {
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

export function getSources(part: ToolPart): Source[] {
  const output = part.output
  if (!output) return []

  // Anthropic: array of { url, title }
  if (Array.isArray(output)) {
    return output.filter((s: Source) => s.url).map((s: Source) => ({ url: s.url, title: s.title }))
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

export function sourceToInlineMdc(url: string, title?: string): string {
  // Google grounding links go through a redirect, the title holds the site's domain
  const domain = title && getDomain(url) === 'vertexaisearch.cloud.google.com' ? title : getDomain(url)
  const favicon = getFaviconUrl(`https://${domain}`)
  const safeUrl = url.replace(/"/g, '&quot;')
  const safeFavicon = favicon.replace(/"/g, '&quot;')

  return ` :source-link{url="${safeUrl}" favicon="${safeFavicon}" label="${domain}"}`
}
