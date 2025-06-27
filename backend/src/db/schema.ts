// backend/src/db/schema.ts
import { pgTable, serial, text, timestamp, uniqueIndex, integer, boolean, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
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
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
	author: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
}));