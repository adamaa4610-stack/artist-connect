import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq, or } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import MessagesList from '@/components/messages/MessagesList';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const userId = session.id;

  let conversations: any[] = [];
  try {
    const raw = await db.query.messages.findMany({
      where: or(eq(schema.messages.senderId, userId), eq(schema.messages.receiverId, userId)),
      orderBy: (m: any, { desc }: any) => desc(m.createdAt),
      with: { sender: true, receiver: true },
    });
    conversations = raw.map(({ sender, receiver, ...m }) => {
      const { passwordHash: _ps, ...s } = sender;
      const { passwordHash: _pr, ...r } = receiver;
      return { ...m, sender: s, receiver: r };
    });
  } catch (e) {
    console.error('Messages DB error:', e);
  }

  const unique = new Map<number, typeof conversations[0]>();
  for (const msg of conversations) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!unique.has(otherId)) unique.set(otherId, msg);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <MessagesList conversations={Array.from(unique.values())} userId={userId} />
    </div>
  );
}
