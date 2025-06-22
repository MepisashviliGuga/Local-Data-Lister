// Keep the existing imports
import { pgTable, serial, text, timestamp, uniqueIndex, integer, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// users table remains the same
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- NEW TABLE: places ---
// This table will store a local copy of place information
export const places = pgTable('places', {
    id: serial('id').primaryKey(),
    googlePlaceId: text('google_place_id').notNull().unique(), // We'll use the location as a unique ID
    name: text('name').notNull(),
    formattedAddress: text('formatted_address'),
    websiteUri: text('website_uri'),
    types: text('types').array(),
    userRatingCount: integer('user_rating_count'),
    rating: integer('rating'),
    latitude: text('latitude'),
    longitude: text('longitude'),
}, (table) => {
    return {
        // an index for faster lookups
        googlePlaceIdIdx: uniqueIndex('google_place_id_idx').on(table.googlePlaceId),
    };
});


// --- NEW TABLE: userFavorites ---
// This is a "join table" connecting users and places.
// It will store both favorite status and the user's rating.
export const userFavorites = pgTable('user_favorites', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
    isFavorite: boolean('is_favorite').default(false),
    rating: integer('rating'), // User's personal rating (e.g., 1-5)
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        // A user can only have one entry per place
        userIdPlaceIdUnq: uniqueIndex('user_id_place_id_unq').on(table.userId, table.placeId),
    };
});

// --- NEW TABLE: comments ---
export const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    placeId: integer('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- NEW: Define relationships for Drizzle's relational queries ---
export const commentsRelations = relations(comments, ({ one }) => ({
	author: one(users, {
		fields: [comments.userId],
		references: [users.id],
	}),
}));