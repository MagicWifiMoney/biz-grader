import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getSEOData, hasDataForSEOCredentials } from '@/lib/dataforseo'
import { getPageSpeedData } from '@/lib/pagespeed'
import { calculateGrade, generateQuickWins, buildIssuesList } from '@/lib/scoring'
import type { ScanResult } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 120

function normalizeUrl(input: string): { fullUrl: string; domain: string } | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(withScheme)
  } catch {
    return null
  }
  if (!parsed.hostname.includes('.')) return null
  const domain = parsed.hostname.replace(/^www\./, '')
  return { fullUrl: parsed.toString().replace(/\/$/, ''), domain }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { url } = body as { url?: unknown }
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const normalized = normalizeUrl(url)
    if (!normalized) {
      return NextResponse.json({ error: 'That doesn\'t look like a valid website. Try something like "yourbusiness.com".' }, { status: 400 })
    }
    const { fullUrl, domain } = normalized

    const [seoData, pageSpeedData] = await Promise.all([
      getSEOData(domain),
      getPageSpeedData(fullUrl),
    ])

    if (pageSpeedData.performanceScore === 0 && pageSpeedData.bestPracticesScore === 0) {
      return NextResponse.json(
        { error: 'We couldn\'t reach that site. Double-check the URL — it may be offline or behind a firewall.' },
        { status: 422 }
      )
    }

    const dfsEnabled = hasDataForSEOCredentials()
    const seoScore = dfsEnabled ? seoData.score : pageSpeedData.seoScore

    const scores = {
      seo: Math.round(seoScore),
      speed: Math.round(pageSpeedData.performanceScore),
      mobile: Math.round(pageSpeedData.accessibilityScore * 0.5 + pageSpeedData.performanceScore * 0.5),
      bestPractices: Math.round(pageSpeedData.bestPracticesScore),
      overall: 0,
    }
    scores.overall = Math.round(
      scores.seo * 0.35 +
      scores.speed * 0.25 +
      scores.mobile * 0.20 +
      scores.bestPractices * 0.20
    )

    const { grade, color: gradeColor } = calculateGrade(scores.overall)
    const issues = buildIssuesList(pageSpeedData, seoData)
    const quickWins = generateQuickWins(scores)

    const result: ScanResult = {
      id: uuidv4(),
      url: fullUrl,
      domain,
      scanDate: new Date().toISOString(),
      scores,
      grade,
      gradeColor,
      seoData: {
        keywordsRanking: seoData.keywordsRanking,
        topKeywords: seoData.topKeywords,
        organicTrafficEstimate: seoData.organicTrafficEstimate,
      },
      pageSpeedData: {
        performanceScore: pageSpeedData.performanceScore,
        accessibilityScore: pageSpeedData.accessibilityScore,
        seoScore: pageSpeedData.seoScore,
        bestPracticesScore: pageSpeedData.bestPracticesScore,
        fcp: pageSpeedData.fcp,
        lcp: pageSpeedData.lcp,
        cls: pageSpeedData.cls,
        tbt: pageSpeedData.tbt,
      },
      issues,
      quickWins,
      competitors: seoData.competitors,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 })
  }
}
