'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EXAMPLES = [
  'Luna and Spark go on an alphabet adventure and learn every letter from A to Z with fun words and facts',
  'A brave girl named Zara discovers a baby dragon hiding in her school bag and they go on a magical quest',
  'Nova the astronaut and her robot companion Bolt crash-land on a forbidden planet and discover the last alien',
  'A girl named Marina dives into the ocean with her dolphin friend Pearl to save the dying coral reef',
  'A clever boy named Kai and his cat Rumi find a hidden door that leads to a city of stolen memories',
]

export default function Home() {
  const router  = useRouter()
  const [prompt,  setPrompt]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function generate() {
    if (prompt.trim().length < 10) { setError('Write at least 10 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Generation failed')
        return
      }
      router.push(`/film/${data.id}?auto=1`)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 7 === 0 ? 3 : 2,
              height: i % 7 === 0 ? 3 : 2,
              top: `${(i * 37) % 100}%`,
              left: `${(i * 61 + 13) % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-5 py-16">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl font-bold text-white mb-3">Cartoon Generator</h1>
          <p className="text-white/60 text-lg">
            Type a story idea → get a full 5-minute animated cartoon
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-white/40">
            <span>✓ 30 scenes</span>
            <span>✓ Voice acting</span>
            <span>✓ Background music</span>
            <span>✓ Auto-downloads</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="p-6">
            <label className="block text-white/70 text-sm font-medium mb-3">
              Your story idea
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
              }}
              placeholder="Describe your cartoon story... include character names, setting, and what happens."
              rows={4}
              className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-base leading-relaxed"
            />
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs mb-2">Examples:</p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-left text-xs text-white/40 hover:text-indigo-400 transition-colors"
                  >
                    → {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-4 bg-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="px-6 pb-6">
            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-4 rounded-2xl transition-colors text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </>
              ) : (
                <>🎬 Generate &amp; Download cartoon</>
              )}
            </button>
            <p className="text-center text-white/30 text-xs mt-3">
              30 scenes · ~5 min · voices + music · downloads automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
