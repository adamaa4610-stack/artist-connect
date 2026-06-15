import { db, schema } from './db';
import { like, or, eq, and, desc, gte, lte } from 'drizzle-orm';

export interface SearchParams {
  q?: string;
  type?: string;
  genre?: string;
  medium?: string;
  location?: string;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function searchArtists(params: SearchParams) {
  const conditions = [];
  if (params.q) {
    conditions.push(
      or(
        like(schema.users.displayName, `%${params.q}%`),
        like(schema.users.bio, `%${params.q}%`),
        like(schema.users.genres, `%${params.q}%`),
        like(schema.users.mediums, `%${params.q}%`),
        like(schema.users.location, `%${params.q}%`),
      )
    );
  }
  if (params.genre) conditions.push(like(schema.users.genres, `%${params.genre}%`));
  if (params.medium) conditions.push(like(schema.users.mediums, `%${params.medium}%`));
  if (params.location) conditions.push(like(schema.users.location, `%${params.location}%`));

  const orderBy = params.sort === 'newest' ? desc(schema.users.createdAt) : desc(schema.users.displayName);
  const offset = ((params.page || 1) - 1) * (params.limit || 20);

  const results = await db.query.users.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
    limit: params.limit || 20,
    offset,
  });
  return results.map(({ passwordHash: _, ...u }) => u);
}

export async function searchContent(params: SearchParams) {
  const conditions = [];
  if (params.q) {
    conditions.push(
      or(
        like(schema.content.title, `%${params.q}%`),
        like(schema.content.description, `%${params.q}%`),
        like(schema.content.tags, `%${params.q}%`),
        like(schema.content.genre, `%${params.q}%`),
      )
    );
  }
  if (params.type) conditions.push(eq(schema.content.contentType, params.type));
  if (params.genre) conditions.push(eq(schema.content.genre, params.genre));
  if (params.medium) conditions.push(eq(schema.content.medium, params.medium));
  if (params.dateFrom) conditions.push(gte(schema.content.createdAt, params.dateFrom));
  if (params.dateTo) conditions.push(lte(schema.content.createdAt, params.dateTo));

  const orderBy = params.sort === 'oldest'
    ? schema.content.createdAt
    : params.sort === 'popular'
    ? desc(schema.content.likeCount)
    : desc(schema.content.createdAt);
  const offset = ((params.page || 1) - 1) * (params.limit || 20);

  const results = await db.query.content.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy,
    limit: params.limit || 20,
    offset,
  });
  return results;
}

export async function searchAll(params: SearchParams) {
  const [artists, contentResults] = await Promise.all([
    searchArtists({ ...params, limit: 10 }),
    searchContent({ ...params, limit: 10 }),
  ]);
  return { artists, content: contentResults };
}
