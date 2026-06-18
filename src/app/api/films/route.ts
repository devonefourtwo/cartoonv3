import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export async function GET() {
  const films = await db.film.findMany({ orderBy: { createdAt: 'desc' }, select: { id:true, title:true, prompt:true, createdAt:true } })
  return NextResponse.json(films)
}
