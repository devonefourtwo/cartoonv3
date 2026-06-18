import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateFilm } from '@/lib/generator'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt?.trim() || prompt.trim().length < 10) {
      return NextResponse.json({ error: 'Please write at least 10 characters.' }, { status: 400 })
    }
    const film = generateFilm(prompt.trim())
    const saved = await db.film.create({
      data: { title: film.title, prompt: prompt.trim(), data: JSON.stringify(film) },
    })
    return NextResponse.json({ id: saved.id, title: film.title }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
