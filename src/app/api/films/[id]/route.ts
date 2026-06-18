import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const film = await db.film.findUnique({ where: { id: params.id } })
  if (!film) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...film, data: JSON.parse(film.data) })
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await db.film.delete({ where: { id: params.id } }).catch(() => {})
  return new NextResponse(null, { status: 204 })
}
