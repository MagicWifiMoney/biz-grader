'use client'

import { useState, FormEvent } from 'react'
import type { ScanResult } from '@/lib/types'
import { gradeColor } from '@/lib/types'

export default function HeroSection() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleScan(e: FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Scan failed')
      }
      const data: ScanResult = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-16 flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-2xl mb-12">
        <div className="inline-block bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-white/50 px-4 py-1.5 rounded-full mb-6">
          Free Website Report
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Grade Your Business Website<br />
          <span className="text-indigo-400">In 60 Seconds</span>
        </h1>
        <p className="text-white/50 text-lg">
          SEO · Speed · Mobile · Local Presence — all scored instantly.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleScan} className="w-full max-w-xl mb-10">
        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
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

      {/* Results */}
      {result && (
        <div className="w-full max-w-2xl glass rounded-2xl p-8">
          {/* Overall grade */}
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

          {/* Score breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'SEO', value: result.scores.seo },
              { label: 'Speed', value: result.scores.speed },
              { label: 'Mobile', value: result.scores.mobile },
              { label: 'Local', value: result.scores.local },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick wins */}
          {result.quickWins.length > 0 && (
            <div>
              <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
                Top Quick Wins
              </h3>
              <ul className="space-y-2">
                {result.quickWins.slice(0, 4).map(win => (
                  <li key={win.id} className="flex items-start gap-3 text-sm text-white/70">
                    <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${win.impact === 'high' ? 'bg-green-400' : win.impact === 'medium' ? 'bg-yellow-400' : 'bg-white/30'}`} />
                    <span>{win.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
