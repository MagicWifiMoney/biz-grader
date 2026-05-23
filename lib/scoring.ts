import type { Grade, Issue, QuickWin, ScoreBreakdown } from './types'

export function calculateGrade(score: number): { grade: Grade; color: string } {
  if (score >= 90) return { grade: 'A', color: '#10b981' }
  if (score >= 80) return { grade: 'B', color: '#3b82f6' }
  if (score >= 70) return { grade: 'C', color: '#f59e0b' }
  if (score >= 60) return { grade: 'D', color: '#f97316' }
  return { grade: 'F', color: '#ef4444' }
}

export function generateQuickWins(scores: ScoreBreakdown): QuickWin[] {
  const wins: QuickWin[] = []

  if (scores.speed < 50) {
    wins.push({ id: 'compress-images', impact: 'high', title: 'Compress and lazy-load images to boost page speed by 30-50%' })
  }
  if (scores.speed < 70) {
    wins.push({ id: 'cdn-caching', impact: 'high', title: 'Enable browser caching and use a CDN to serve assets faster' })
  }
  if (scores.mobile < 70) {
    wins.push({ id: 'mobile-tap-targets', impact: 'medium', title: 'Fix tap targets and font sizes for a better mobile experience' })
  }
  if (scores.seo < 60) {
    wins.push({ id: 'meta-descriptions', impact: 'high', title: 'Add meta descriptions to your key pages — Google shows these in search results' })
  }
  if (scores.seo < 70) {
    wins.push({ id: 'search-console', impact: 'medium', title: 'Create a Google Search Console account and submit your sitemap' })
  }
  if (scores.bestPractices < 70) {
    wins.push({ id: 'https-mixed-content', impact: 'medium', title: 'Fix mixed-content warnings and ensure every asset loads over HTTPS' })
  }
  if (scores.bestPractices < 80) {
    wins.push({ id: 'console-errors', impact: 'low', title: 'Clean up console errors and outdated browser APIs flagged by Lighthouse' })
  }
  if (scores.speed > 80 && scores.seo < 80) {
    wins.push({ id: 'content-marketing', impact: 'medium', title: 'Start a blog with 2-4 posts/month targeting local keywords' })
  }

  wins.push({ id: 'analytics', impact: 'low', title: 'Install Google Analytics 4 to understand what\'s driving traffic and conversions' })

  return wins.slice(0, 5)
}

interface PageSpeedLike {
  issues?: Issue[]
}

interface SeoLike {
  keywordsRanking?: number
}

export function buildIssuesList(pageSpeedData: PageSpeedLike, seoData: SeoLike): Issue[] {
  const issues: Issue[] = []

  if (pageSpeedData?.issues) {
    issues.push(...pageSpeedData.issues)
  }

  if (seoData?.keywordsRanking === 0) {
    issues.push({
      title: 'No keywords ranking in Google',
      severity: 'critical',
      description: 'Your site has no detectable organic search presence. This is a major opportunity.',
    })
  }

  return issues.slice(0, 10)
}
