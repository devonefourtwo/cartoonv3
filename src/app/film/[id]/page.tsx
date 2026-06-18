'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import type { GeneratedFilm } from '@/lib/generator'
import { FilmPlayer }    from '@/components/FilmPlayer'
import { AutoRecorder }  from '@/components/AutoRecorder'

export default function FilmPage() {
  const { id }        = useParams<{ id: string }>()
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const autoMode      = searchParams.get('auto') === '1'

  const [film,    setFilm]    = useState<GeneratedFilm | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    fetch(`/api/films/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(d  => { setFilm(d.data); setLoading(false) })
      .catch(() => { setError('Film not found'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-white/60">Loading film…</p>
      </div>
    </div>
  )

  if (error || !film) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-white text-lg mb-4">{error || 'Film not found'}</p>
        <a href="/" className="text-indigo-400 hover:underline">← Make a new film</a>
      </div>
    </div>
  )

  // Auto-download mode: show AutoRecorder, then offer to watch
  if (autoMode && !showPlayer) {
    return (
      <AutoRecorder
        film={film}
        onDone={() => setShowPlayer(true)}
        onWatch={() => setShowPlayer(true)}
      />
    )
  }

  // Normal player mode
  return <FilmPlayer film={film} onClose={() => router.push('/')}/>
}
