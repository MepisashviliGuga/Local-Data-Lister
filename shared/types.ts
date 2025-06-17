// src/types.ts
export interface Restaurant {
  name: string;
  location: string | null; // Allow null for empty locations
  cuisine: string;
  rating: number | null;
  priceRange: string | null;
  openingHours: string;
  type: "restaurant";
}

export interface Park {
  name: string;
  location: string;
  amenities: string[];
  size: string;
  openingHours: string;
  type: "park";
}

export interface Event {
  name: string;
  location: string;
  date: string;
  time: string;
  description: string;
  category: string;
  price: number | null; // Allow null if free
  type: "event";
}