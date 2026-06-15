import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './drizzle/schema';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

async function seed() {
  const hash = await bcrypt.hash('password123', 10);

  // Insert users
  db.insert(schema.users).values([
    { username: 'lyra_wilde', email: 'lyra@test.com', passwordHash: hash, displayName: 'Lyra Wilde', bio: 'Singer-songwriter from Nashville', genres: 'Folk, Country', location: 'Nashville, TN', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lyra', coverUrl: 'https://picsum.photos/seed/lyra/1200/400' },
    { username: 'nox_art', email: 'nox@test.com', passwordHash: hash, displayName: 'Nox', bio: 'Digital artist exploring light and shadow', genres: 'Electronic', mediums: 'Digital Art, Photography', location: 'Berlin, Germany', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=nox', coverUrl: 'https://picsum.photos/seed/nox/1200/400' },
    { username: 'jazzmin', email: 'jazzmin@test.com', passwordHash: hash, displayName: 'Jazzmin', bio: 'Jazz vocalist & pianist', genres: 'Jazz, Blues', location: 'New Orleans, LA', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=jazzmin', coverUrl: 'https://picsum.photos/seed/jazzmin/1200/400' },
    { username: 'pixel_sage', email: 'sage@test.com', passwordHash: hash, displayName: 'Pixel Sage', bio: 'Pixel artist and illustrator', mediums: 'Digital Art, Drawing', location: 'Tokyo, Japan', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sage', coverUrl: 'https://picsum.photos/seed/sage/1200/400' },
    { username: 'rhythm_dev', email: 'dev@test.com', passwordHash: hash, displayName: 'Rhythm Dev', bio: 'Electronic music producer', genres: 'Electronic, Hip-Hop', location: 'Los Angeles, CA', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=rhythm', coverUrl: 'https://picsum.photos/seed/rhythm/1200/400' },
    { username: 'clay_and_canvas', email: 'clay@test.com', passwordHash: hash, displayName: 'Clay & Canvas', bio: 'Sculptor and painter', mediums: 'Sculpture, Painting', location: 'Florence, Italy', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=clay', coverUrl: 'https://picsum.photos/seed/clay/1200/400' },
  ]).run();

  // Insert content
  db.insert(schema.content).values([
    { artistId: 1, title: 'Wildflower', description: 'A folk ballad about growing through adversity', contentType: 'music', genre: 'Folk', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { artistId: 1, title: 'Tennessee Rain', description: 'Country track recorded live', contentType: 'music', genre: 'Country', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { artistId: 2, title: 'Neon Dreams', description: 'Digital art series', contentType: 'image', genre: 'Electronic', medium: 'Digital Art', fileUrl: 'https://picsum.photos/seed/neon/800/600' },
    { artistId: 2, title: 'Shadow Play', description: 'Photography collection', contentType: 'image', medium: 'Photography', fileUrl: 'https://picsum.photos/seed/shadow/800/600' },
    { artistId: 3, title: 'Midnight in NOLA', description: 'Live jazz recording', contentType: 'music', genre: 'Jazz', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { artistId: 3, title: 'Blue Monday', description: 'Blues improvisation', contentType: 'music', genre: 'Blues', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { artistId: 4, title: 'Cyberpunk Alley', description: 'Pixel art scene', contentType: 'image', medium: 'Digital Art', fileUrl: 'https://picsum.photos/seed/cyber/800/600' },
    { artistId: 4, title: 'Dragon Study', description: 'Ink drawing', contentType: 'image', medium: 'Drawing', fileUrl: 'https://picsum.photos/seed/dragon/800/600' },
    { artistId: 5, title: 'Bass Drop', description: 'Heavy electronic track', contentType: 'music', genre: 'Electronic', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { artistId: 5, title: 'Beats & Bars', description: 'Hip-hop instrumental', contentType: 'music', genre: 'Hip-Hop', fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { artistId: 6, title: 'Marble & Stone', description: 'Sculpture time-lapse', contentType: 'video', medium: 'Sculpture', fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { artistId: 6, title: 'Sunset Palette', description: 'Oil painting demo', contentType: 'image', medium: 'Painting', fileUrl: 'https://picsum.photos/seed/palette/800/600' },
  ]).run();

  // Insert follows
  db.insert(schema.follows).values([
    { followerId: 1, followingId: 2 }, { followerId: 1, followingId: 3 },
    { followerId: 2, followingId: 1 }, { followerId: 2, followingId: 4 },
    { followerId: 3, followingId: 1 }, { followerId: 3, followingId: 5 },
    { followerId: 4, followingId: 2 }, { followerId: 4, followingId: 6 },
    { followerId: 5, followingId: 3 }, { followerId: 5, followingId: 1 },
    { followerId: 6, followingId: 4 }, { followerId: 6, followingId: 2 },
  ]).run();

  // Insert likes
  db.insert(schema.likes).values([
    { userId: 1, contentId: 3 }, { userId: 1, contentId: 5 },
    { userId: 2, contentId: 1 }, { userId: 2, contentId: 7 },
    { userId: 3, contentId: 2 }, { userId: 3, contentId: 9 },
    { userId: 4, contentId: 1 }, { userId: 4, contentId: 10 },
    { userId: 5, contentId: 4 }, { userId: 5, contentId: 6 },
    { userId: 6, contentId: 3 }, { userId: 6, contentId: 5 },
  ]).run();

  // Insert comments
  db.insert(schema.comments).values([
    { userId: 2, contentId: 1, body: 'Love this track! Your voice is amazing.' },
    { userId: 3, contentId: 1, body: 'Beautiful song, Lyra!' },
    { userId: 1, contentId: 3, body: 'The neon aesthetic is incredible!' },
    { userId: 4, contentId: 3, body: 'Great use of color and light.' },
    { userId: 5, contentId: 5, body: 'Swinging jazz, love it.' },
    { userId: 1, contentId: 7, body: 'Cyberpunk vibes! So detailed.' },
  ]).run();

  // Insert messages
  db.insert(schema.messages).values([
    { senderId: 1, receiverId: 2, body: 'Hey Nox, love your digital art! Would you be interested in a collaboration?' },
    { senderId: 2, receiverId: 1, body: 'Thanks Lyra! Id love to collaborate. Your music is beautiful.' },
    { senderId: 3, receiverId: 1, body: 'Hey Lyra! Great set at the Bluebird last night.' },
    { senderId: 1, receiverId: 3, body: 'Thanks Jazzmin! You should join me next time.' },
  ]).run();

  console.log('Seed complete! Users (password: password123):');
  console.log('  lyra@test.com    - Lyra Wilde (id: 1)');
  console.log('  nox@test.com     - Nox (id: 2)');
  console.log('  jazzmin@test.com - Jazzmin (id: 3)');
  console.log('  sage@test.com    - Pixel Sage (id: 4)');
  console.log('  dev@test.com     - Rhythm Dev (id: 5)');
  console.log('  clay@test.com    - Clay & Canvas (id: 6)');
}

seed().catch(console.error);
