// frontend/src/services/placeService.ts
import { fetchWithAuth } from './apiHelper';
import { DataItem } from '@shared/types';

const API_URL = 'http://localhost:3001/api/places';

export const submitPlace = (placeData: Partial<DataItem>) => {
    return fetchWithAuth(`${API_URL}/submit`, {
        method: 'POST',
        body: JSON.stringify(placeData),
    });
};