export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface ScoreBreakdown {
  seo: number
  speed: number
  mobile: number
  bestPractices: number
  overall: number
}

export interface Issue {
  title: string
  severity: 'critical' | 'warning' | 'info'
  description: string
}

export interface QuickWin {
  id: string
  title: string
  impact: 'high' | 'medium' | 'low'
}

export interface Competitor {
  domain: string
  keywordsCount: number
  position: number
  keyword: string
}

export interface ScanResult {
  id: string
  url: string
  domain: string
  scanDate: string
  scores: ScoreBreakdown
  grade: Grade
  gradeColor: string
  seoData: {
    keywordsRanking: number
    topKeywords: Array<{ keyword: string; position: number; url: string }>
    organicTrafficEstimate: number
  }
  pageSpeedData: {
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    fcp: number
    lcp: number
    cls: number
    tbt: number
  }
  issues: Issue[]
  quickWins: QuickWin[]
  competitors: Competitor[]
}

export function gradeColor(grade: Grade): string {
  switch (grade) {
    case 'A': return '#10b981'
    case 'B': return '#3b82f6'
    case 'C': return '#f59e0b'
    case 'D': return '#f97316'
    case 'F': return '#ef4444'
  }
}
