// shared/types.ts
export interface DataItem {
    id?: number; // Our DB id is optional now
    googlePlaceId: string; // The new stable ID for routing
    name: string;
    formattedAddress?: string;
    primaryType?: string;
    types?: string[];
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    location?: {
        latitude: number;
        longitude: number;
    };
}