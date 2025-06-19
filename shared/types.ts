// src/types.ts

export interface Restaurant {
    name: string;
    location?: string | null;
    cuisine?: string;
    rating?: number | null;
    priceRange?: string | null;
    openingHours?: string;
    type: string; // Change from z.literal('restaurant') to generic string
}

export interface Park {
    name: string;
    location?: string;
    amenities?: string[];
    size?: string;
    openingHours?: string;
    type: string;
}

export interface Event {
    name: string;
    location?: string;
    date?: string;
    time?: string;
    description?: string;
    category?: string;
    price?: number | null;
    type: string;
}

export type DataItem = Restaurant | Park | Event;