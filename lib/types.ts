export interface ScanResult {
  id: string
  url: string
  domain: string
  scannedAt: string
  scores: {
    seo: number
    speed: number
    mobile: number
    local: number
    overall: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: Issue[]
  quickWins: QuickWin[]
  competitors: Competitor[]
  details: {
    seo: SEODetails
    speed: SpeedDetails
  }
}

export interface Issue {
  id: string
  category: 'seo' | 'speed' | 'mobile' | 'local'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
}

export interface QuickWin {
  id: string
  title: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
  description: string
}

export interface Competitor {
  domain: string
  keyword: string
  position: number
  score: number
}

export interface SEODetails {
  keywordsRanking: number
  topKeywords: Array<{ keyword: string; position: number; url: string }>
  organicTrafficEstimate: number
}

export interface SpeedDetails {
  performanceScore: number
  lcp: number
  fid: number
  cls: number
  ttfb: number
  mobileScore: number
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

export function scoreToGrade(score: number): Grade {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
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
