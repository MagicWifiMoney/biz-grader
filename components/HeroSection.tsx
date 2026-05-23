'use client'

import { useState, FormEvent } from 'react'
import type { ScanResult } from '@/lib/types'
import { gradeColor } from '@/lib/types'

type CaptureState = 'idle' | 'sending' | 'sent' | 'error'

export default function HeroSection() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [capture, setCapture] = useState<CaptureState>('idle')
  const [captureError, setCaptureError] = useState<string | null>(null)

  async function handleScan(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setCapture('idle')
    setCaptureError(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setResult(data as ScanResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmailReport(e: FormEvent) {
    e.preventDefault()
    if (!result || !email.trim()) return
    setCapture('sending')
    setCaptureError(null)
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          domain: result.domain,
          grade: result.grade,
          scores: result.scores,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send email')
      setCapture('sent')
    } catch (err) {
      setCapture('error')
      setCaptureError(err instanceof Error ? err.message : 'Failed to send email')
    }
  }

  return (
    <main className="min-h-screen px-4 py-16 flex flex-col items-center">
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-block bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-white/50 px-4 py-1.5 rounded-full mb-6">
          Free Website Report
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Grade Your Business Website<br />
          <span className="text-indigo-400">In 60 Seconds</span>
        </h1>
        <p className="text-white/50 text-lg">
          SEO · Speed · Mobile · Best Practices — all scored instantly.
        </p>
      </div>

      <form onSubmit={handleScan} className="w-full max-w-xl mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? 'Scanning…' : 'Get Grade'}
          </button>
        </div>
        {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
      </form>

      {loading && <ScanSkeleton />}

      {result && !loading && (
        <div className="w-full max-w-2xl glass rounded-2xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black"
              style={{ backgroundColor: gradeColor(result.grade) + '22', color: gradeColor(result.grade) }}
            >
              {result.grade}
            </div>
            <div>
              <p className="text-white font-bold text-xl">{result.domain}</p>
              <p className="text-white/50 text-sm mt-1">Overall score: {result.scores.overall}/100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'SEO', value: result.scores.seo },
              { label: 'Speed', value: result.scores.speed },
              { label: 'Mobile', value: result.scores.mobile },
              { label: 'Best Practices', value: result.scores.bestPractices },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {result.quickWins.length > 0 && (
            <div className="mb-8">
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
                Top Quick Wins
              </h3>
              <ul className="space-y-2">
                {result.quickWins.slice(0, 4).map(win => (
                  <li key={win.id} className="flex items-start gap-3 text-sm text-white/70">
                    <span className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${win.impact === 'high' ? 'bg-green-400' : win.impact === 'medium' ? 'bg-yellow-400' : 'bg-white/30'}`} />
                    <span>{win.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-white/10 pt-6">
            {capture === 'sent' ? (
              <p className="text-sm text-emerald-400">
                Sent. Check your inbox for the full report.
              </p>
            ) : (
              <form onSubmit={handleEmailReport} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@business.com"
                  disabled={capture === 'sending'}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={capture === 'sending' || !email.trim()}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-xl transition-colors whitespace-nowrap"
                >
                  {capture === 'sending' ? 'Sending…' : 'Email me the report'}
                </button>
              </form>
            )}
            {captureError && <p className="mt-2 text-red-400 text-sm">{captureError}</p>}
          </div>
        </div>
      )}
    </main>
  )
}

function ScanSkeleton() {
  return (
    <div className="w-full max-w-2xl glass rounded-2xl p-8 animate-pulse">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/5 rounded w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white/5 rounded-xl p-4 h-20" />
        ))}
      </div>
      <p className="text-center text-white/40 text-xs mt-6">
        Crunching SEO, performance, and accessibility data… this can take 30-60 seconds.
      </p>
    </div>
  )
}
