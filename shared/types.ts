// shared/types.ts
export interface DataItem {
    name: string;
    formattedAddress?: string; //Address of the place
    primaryType?: string; // Primary type of the place
    types?: string[]; //Other types of the place
    websiteUri?: string; // The Website URL of the place
    rating?: number; // The rating of the place
    userRatingCount?: number; // How many people rated the place
    location?: {  // Keep a generic location object
        latitude: number;
        longitude: number;
    };
    // Add other common properties here based on your field mask
}