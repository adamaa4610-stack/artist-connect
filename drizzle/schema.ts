import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  location: text('location'),
  website: text('website'),
  socialLinks: text('social_links'),
  accountType: text('account_type').notNull().default('artist'),
  genres: text('genres'),
  mediums: text('mediums'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const content = sqliteTable('content', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artistId: integer('artist_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  contentType: text('content_type').notNull(),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  tags: text('tags'),
  genre: text('genre'),
  medium: text('medium'),
  yearCreated: integer('year_created'),
  duration: integer('duration'),
  width: integer('width'),
  height: integer('height'),
  viewCount: integer('view_count').notNull().default(0),
  likeCount: integer('like_count').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const albums = sqliteTable('albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  artistId: integer('artist_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const albumContent = sqliteTable('album_content', {
  albumId: integer('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  contentId: integer('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ({
  pk: primaryKey({ columns: [t.albumId, t.contentId] }),
}));

export const follows = sqliteTable('follows', {
  followerId: integer('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: integer('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  pk: primaryKey({ columns: [t.followerId, t.followingId] }),
}));

export const likes = sqliteTable('likes', {
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: integer('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.contentId] }),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: integer('content_id').notNull().references(() => content.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: integer('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  isRead: integer('is_read').notNull().default(0),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const usersRelations = relations(users, ({ many }) => ({
  content: many(content),
  albums: many(albums),
  sentMessages: many(messages, { relationName: 'sender' }),
  receivedMessages: many(messages, { relationName: 'receiver' }),
  comments: many(comments),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  likes: many(likes),
}));

export const contentRelations = relations(content, ({ one, many }) => ({
  artist: one(users, { fields: [content.artistId], references: [users.id] }),
  likes: many(likes),
  comments: many(comments),
  albumContent: many(albumContent),
}));

export const albumRelations = relations(albums, ({ one, many }) => ({
  artist: one(users, { fields: [albums.artistId], references: [users.id] }),
  albumContent: many(albumContent),
}));

export const albumContentRelations = relations(albumContent, ({ one }) => ({
  album: one(albums, { fields: [albumContent.albumId], references: [albums.id] }),
  content: one(content, { fields: [albumContent.contentId], references: [content.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: 'follower' }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: 'following' }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  content: one(content, { fields: [likes.contentId], references: [content.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  content: one(content, { fields: [comments.contentId], references: [content.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: 'sender' }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: 'receiver' }),
}));
