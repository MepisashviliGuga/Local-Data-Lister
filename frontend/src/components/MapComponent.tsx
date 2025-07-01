// frontend/src/components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { DataItem } from '@shared/types';
import { Link } from 'react-router-dom';
 
interface MapComponentProps {
    places: DataItem[];
    center: { lat: number; lng: number };
    zoom?: number;
}
 
const MapComponent: React.FC<MapComponentProps> = ({ places, center, zoom = 13 }) => {
    const mapCenter: LatLngExpression = [center.lat, center.lng];
 
    // Filter out places that don't have a valid location
    const placesWithLocation = places.filter(place => 
        place.location && 
        typeof place.location.latitude === 'number' && 
        typeof place.location.longitude === 'number'
    );
 
    return (
<div className="map-container" style={{ height: '500px', width: '100%', borderRadius: 'var(--border-radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', marginBottom: '2rem' }}>
<MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
<TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {placesWithLocation.map(place => (
<Marker 
                        key={place.googlePlaceId} 
                        position={[place.location!.latitude, place.location!.longitude]}
>
<Popup>
<strong>{place.name}</strong><br />
                            {place.formattedAddress}<br />
<Link to={`/place/${encodeURIComponent(place.googlePlaceId)}`} state={{ place: place }}>
                                View Details
</Link>
</Popup>
</Marker>
                ))}
</MapContainer>
</div>
    );
};
 
export default MapComponent;