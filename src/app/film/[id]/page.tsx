'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { GeneratedFilm } from '@/lib/generator'
import { FilmPlayer } from '@/components/FilmPlayer'

export default function FilmPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const [film,   setFilm]    = useState<GeneratedFilm | null>(null)
  const [loading,setLoading] = useState(true)
  const [error,  setError]   = useState('')

  useEffect(() => {
    fetch(`/api/films/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(d => { setFilm(d.data); setLoading(false) })
      .catch(() => { setError('Film not found'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-white/60">Loading your film…</p>
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

  return <FilmPlayer film={film} onClose={() => router.push('/')}/>
}
