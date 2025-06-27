// shared/types.ts
export interface DataItem {
    id?: number;
    googlePlaceId: string;
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

export interface User {
    id: number;
    name: string | null;
    email: string;
}

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    author: {
        id: number;
        email: string;
        name: string | null;
    };
    parentId: number | null;
    replies: Comment[]; // For nesting
}

export interface Notification {
    id: number;
    type: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: number;
        name: string | null;
    };
    comment: {
        id: number;
        content: string;
        place: DataItem; // Include place info for linking
    };
}