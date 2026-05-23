import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const FROM_ADDRESS = process.env.RESEND_FROM || 'BizGrader <onboarding@resend.dev>'
const STRATEGY_CALL_URL = process.env.STRATEGY_CALL_URL || 'https://quietcoyotemn.com'
const BRAND_NAME = process.env.BRAND_NAME || 'Quiet Coyote'

const ALLOWED_GRADES = new Set(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeScore(n: unknown): string {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v)) return '—'
  return String(Math.max(0, Math.min(100, Math.round(v))))
}

function safeDomain(d: unknown): string | null {
  if (typeof d !== 'string') return null
  const trimmed = d.trim().slice(0, 253)
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)) return null
  return trimmed.toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const { email, domain, grade, scores } = await req.json()

    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const safeDom = safeDomain(domain)
    if (!safeDom || typeof grade !== 'string' || !ALLOWED_GRADES.has(grade) || !scores || typeof scores !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid scan data' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json({ error: 'Email service is not configured' }, { status: 500 })
    }

    const s = scores as Record<string, unknown>
    const safeStrategyUrl = /^https?:\/\//i.test(STRATEGY_CALL_URL) ? STRATEGY_CALL_URL : 'https://quietcoyotemn.com'
    const eDomain = esc(safeDom)
    const eGrade = esc(grade)
    const eBrand = esc(BRAND_NAME)
    const eUrl = esc(safeStrategyUrl)

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email.trim(),
      subject: `Your Website Grade: ${grade} - ${safeDom}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #080810; color: #f0f0ff; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .grade-badge { display: inline-block; width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #2563eb); line-height: 80px; text-align: center; font-size: 40px; font-weight: 900; color: white; margin: 20px auto; }
  .score-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
  h1 { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: rgba(255,255,255,0.4); }
</style></head>
<body>
<div class="container">
  <h1>Your Website Report</h1>
  <p style="color:rgba(255,255,255,0.6)">Here's your score breakdown for <strong style="color:#a78bfa">${eDomain}</strong></p>

  <div style="text-align:center; padding: 30px 0;">
    <div class="grade-badge">${eGrade}</div>
    <p style="font-size:48px; font-weight:900; margin:0; color:white">${safeScore(s.overall)}</p>
    <p style="color:rgba(255,255,255,0.5); margin:4px 0">Overall Score</p>
  </div>

  <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin:20px 0">
    <div class="score-row"><span>SEO</span><strong>${safeScore(s.seo)}/100</strong></div>
    <div class="score-row"><span>Page Speed</span><strong>${safeScore(s.speed)}/100</strong></div>
    <div class="score-row"><span>Mobile</span><strong>${safeScore(s.mobile)}/100</strong></div>
    <div class="score-row" style="border:none"><span>Best Practices</span><strong>${safeScore(s.bestPractices)}/100</strong></div>
  </div>

  <p style="color:rgba(255,255,255,0.6)">Want help fixing these? Book a free 30-minute strategy call and we'll walk you through the highest-impact wins for your site.</p>
  <div style="text-align:center">
    <a href="${eUrl}" class="btn">Book Free Strategy Call</a>
  </div>

  <div class="footer">
    <p>Powered by <a href="${eUrl}" style="color:#a78bfa">${eBrand}</a> · You're receiving this because you requested a report for ${eDomain}</p>
  </div>
</div>
</body>
</html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Capture error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
