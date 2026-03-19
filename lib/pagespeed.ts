export interface PageSpeedData {
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  fcp: number // First Contentful Paint (ms)
  lcp: number // Largest Contentful Paint (ms)
  cls: number // Cumulative Layout Shift
  tbt: number // Total Blocking Time (ms)
  issues: Array<{ title: string; severity: 'critical' | 'warning' | 'info'; description: string }>
}

export async function getPageSpeedData(url: string): Promise<PageSpeedData> {
  try {
    const encodedUrl = encodeURIComponent(url)
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodedUrl}&strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices`

    const response = await fetch(apiUrl, { 
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(30000),
    })
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`)
    }

    const data = await response.json()
    const categories = data.lighthouseResult?.categories || {}
    const audits = data.lighthouseResult?.audits || {}

    const issues: Array<{ title: string; severity: 'critical' | 'warning' | 'info'; description: string }> = []

    // Extract key issues
    const auditChecks = [
      { id: 'render-blocking-resources', severity: 'warning' as const },
      { id: 'unused-javascript', severity: 'warning' as const },
      { id: 'unused-css-rules', severity: 'info' as const },
      { id: 'uses-optimized-images', severity: 'warning' as const },
      { id: 'uses-text-compression', severity: 'warning' as const },
      { id: 'efficient-animated-content', severity: 'info' as const },
      { id: 'meta-description', severity: 'critical' as const },
      { id: 'document-title', severity: 'critical' as const },
      { id: 'link-text', severity: 'info' as const },
      { id: 'crawlable-anchors', severity: 'warning' as const },
      { id: 'is-crawlable', severity: 'critical' as const },
      { id: 'hreflang', severity: 'info' as const },
    ]

    auditChecks.forEach(({ id, severity }) => {
      const audit = audits[id]
      if (audit && audit.score !== null && audit.score < 0.9) {
        issues.push({
          title: audit.title,
          severity: audit.score < 0.5 ? severity === 'info' ? 'warning' : 'critical' : severity,
          description: audit.description?.replace(/\[.*?\]\(.*?\)/g, '').trim() || '',
        })
      }
    })

    const fcp = audits['first-contentful-paint']?.numericValue || 0
    const lcp = audits['largest-contentful-paint']?.numericValue || 0
    const cls = audits['cumulative-layout-shift']?.numericValue || 0
    const tbt = audits['total-blocking-time']?.numericValue || 0

    // Add speed-based issues
    if (fcp > 3000) issues.unshift({ title: 'Slow First Contentful Paint', severity: 'critical', description: `Your page takes ${(fcp/1000).toFixed(1)}s to show content. Aim for under 1.8s.` })
    if (lcp > 4000) issues.unshift({ title: 'Slow Largest Contentful Paint', severity: 'critical', description: `Main content loads in ${(lcp/1000).toFixed(1)}s. Google recommends under 2.5s.` })

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      fcp: Math.round(fcp),
      lcp: Math.round(lcp),
      cls: Math.round(cls * 1000) / 1000,
      tbt: Math.round(tbt),
      issues: issues.slice(0, 8),
    }
  } catch (error) {
    console.error('PageSpeed error:', error)
    return {
      performanceScore: 0,
      accessibilityScore: 0,
      seoScore: 0,
      bestPracticesScore: 0,
      fcp: 0,
      lcp: 0,
      cls: 0,
      tbt: 0,
      issues: [{ title: 'Could not analyze page speed', severity: 'warning', description: 'The page may be behind a firewall or the URL may be incorrect.' }],
    }
  }
}
