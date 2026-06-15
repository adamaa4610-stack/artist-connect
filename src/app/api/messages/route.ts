import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let receiverId: number, body: string;
  try { const data = await req.json(); receiverId = data.receiverId; body = data.body; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!receiverId || !body?.trim()) return NextResponse.json({ error: 'receiverId and body required' }, { status: 400 });

  try {
    const [msg] = await db.insert(schema.messages).values({ senderId: session.id, receiverId, body }).returning();
    return NextResponse.json(msg, { status: 201 });
  } catch (e) {
    console.error('Messages POST error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
