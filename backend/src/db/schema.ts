// backend/src/db/schema.ts
import { pgTable, serial, text, timestamp, uniqueIndex, integer, boolean, real, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
 
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
 
export const places = pgTable('places', {
    id: serial('id').primaryKey(),
    googlePlaceId: text('google_place_id').notNull().unique(),
    name: text('name').notNull(),
    formattedAddress: text('formatted_address'),
    websiteUri: text('website_uri'),
    types: text('types').array(),
    userRatingCount: integer('user_rating_count'),
    rating: real('rating'),
    latitude: text('latitude'),
    longitude: text('longitude'),
}, (table) => {
    return {
        googlePlaceIdIdx: uniqueIndex('google_place_id_idx').on(table.googlePlaceId),
    };
});
 
export const userFavorites = pgTable('user_favorites', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
    isFavorite: boolean('is_favorite').default(false),
    rating: integer('rating'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        userIdPlaceIdUnq: uniqueIndex('user_id_place_id_unq').on(table.userId, table.placeId),
    };
});
 
export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
    parentId: integer('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
 
// === NEW commentVotes TABLE ===
export const commentVotes = pgTable('comment_votes', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(), // 1 for upvote, -1 for downvote
}, (table) => {
    return {
        pk: primaryKey({ columns: [table.userId, table.commentId] }),
    };
});
 
export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
    place: one(places, {
        fields: [comments.placeId],
        references: [places.id],
    }),
    replies: many(comments, { relationName: 'comment_replies' }),
    // === NEW RELATION ===
    votes: many(commentVotes),
}));
 
// === NEW RELATION ===
export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
    comment: one(comments, {
        fields: [commentVotes.commentId],
        references: [comments.id],
    }),
    user: one(users, {
        fields: [commentVotes.userId],
        references: [users.id],
    }),
}));
 
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    recipientId: integer('recipient_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    commentId: integer('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // e.g., 'REPLY'
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
 
export const notificationsRelations = relations(notifications, ({ one }) => ({
    sender: one(users, {
        fields: [notifications.senderId],
        references: [users.id],
    }),
    comment: one(comments, {
        fields: [notifications.commentId],
        references: [comments.id],
    }),
}));