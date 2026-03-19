export interface ScanResult {
  id: string
  url: string
  domain: string
  scanDate: string
  scores: {
    seo: number
    speed: number
    mobile: number
    local: number
    overall: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  gradeColor: string
  seoData: any
  pageSpeedData: any
  localData: any
  issues: Array<{ title: string; severity: 'critical' | 'warning' | 'info'; description: string }>
  quickWins: string[]
  competitors: Array<{ domain: string; position: number; keyword: string }>
}

export function calculateGrade(score: number): { grade: 'A' | 'B' | 'C' | 'D' | 'F'; color: string } {
  if (score >= 90) return { grade: 'A', color: '#10b981' }
  if (score >= 80) return { grade: 'B', color: '#3b82f6' }
  if (score >= 70) return { grade: 'C', color: '#f59e0b' }
  if (score >= 60) return { grade: 'D', color: '#f97316' }
  return { grade: 'F', color: '#ef4444' }
}

export function generateQuickWins(scores: { seo: number; speed: number; mobile: number; local: number }): string[] {
  const wins: string[] = []

  if (scores.speed < 50) wins.push('Compress and lazy-load images to boost page speed by 30-50%')
  if (scores.speed < 70) wins.push('Enable browser caching and use a CDN to serve assets faster')
  if (scores.mobile < 70) wins.push('Fix tap targets and font sizes for a better mobile experience')
  if (scores.seo < 60) wins.push('Add meta descriptions to your key pages — Google shows these in search results')
  if (scores.seo < 70) wins.push('Create Google Search Console account and submit your sitemap')
  if (scores.local < 60) wins.push('Claim and optimize your Google Business Profile — it\'s free and drives local traffic')
  if (scores.local < 80) wins.push('Get 10+ Google reviews with a simple follow-up email to past customers')
  if (scores.speed > 80 && scores.seo < 80) wins.push('Start a blog with 2-4 posts/month targeting local keywords')
  
  wins.push('Add your business to 5 local directories (Yelp, BBB, Chamber of Commerce) for citation signals')
  wins.push('Install Google Analytics 4 to understand what\'s driving traffic and conversions')

  return wins.slice(0, 5)
}

export function buildIssuesList(pageSpeedData: any, seoData: any, localScore: number) {
  const issues: Array<{ title: string; severity: 'critical' | 'warning' | 'info'; description: string }> = []

  // PageSpeed issues
  if (pageSpeedData?.issues) {
    issues.push(...pageSpeedData.issues)
  }

  // SEO issues
  if (seoData?.keywordsRanking === 0) {
    issues.push({ title: 'No keywords ranking in Google', severity: 'critical', description: 'Your site has no detectable organic search presence. This is a major opportunity.' })
  }

  // Local issues
  if (localScore < 50) {
    issues.push({ title: 'Google Business Profile not optimized', severity: 'critical', description: 'Local businesses with complete GBP profiles get 7x more clicks than incomplete ones.' })
  }

  return issues.slice(0, 10)
}
