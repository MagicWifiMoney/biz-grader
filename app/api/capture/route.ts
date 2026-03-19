import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, scanId, domain, grade, scores } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const reportUrl = `${req.headers.get('origin') || 'https://bizgrader.com'}/scan/${scanId}`

    await resend.emails.send({
      from: 'BizGrader <hello@dogbathroomart.com>',
      to: email,
      subject: `Your Website Grade: ${grade} — ${domain}`,
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
  <p style="color:rgba(255,255,255,0.6)">Here's your full score breakdown for <strong style="color:#a78bfa">${domain}</strong></p>
  
  <div style="text-align:center; padding: 30px 0;">
    <div class="grade-badge">${grade}</div>
    <p style="font-size:48px; font-weight:900; margin:0; color:white">${scores?.overall ?? '—'}</p>
    <p style="color:rgba(255,255,255,0.5); margin:4px 0">Overall Score</p>
  </div>

  <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px; margin:20px 0">
    <div class="score-row"><span>SEO</span><strong>${scores?.seo ?? '—'}/100</strong></div>
    <div class="score-row"><span>Page Speed</span><strong>${scores?.speed ?? '—'}/100</strong></div>
    <div class="score-row"><span>Mobile</span><strong>${scores?.mobile ?? '—'}/100</strong></div>
    <div class="score-row" style="border:none"><span>Local Presence</span><strong>${scores?.local ?? '—'}/100</strong></div>
  </div>

  <div style="text-align:center">
    <a href="${reportUrl}" class="btn">View Full Report →</a>
  </div>

  <p style="color:rgba(255,255,255,0.6)">Want to improve these scores? Book a free 30-minute strategy call with our team and we'll walk you through exactly what to fix first.</p>
  <a href="https://quietcoyotemn.com" class="btn" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15)">Book Free Strategy Call</a>

  <div class="footer">
    <p>Powered by <a href="https://quietcoyotemn.com" style="color:#a78bfa">Quiet Coyote</a> · You're receiving this because you requested a report for ${domain}</p>
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
