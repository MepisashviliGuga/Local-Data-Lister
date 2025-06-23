// frontend/src/components/ListItem.tsx
import React from 'react';
import { DataItem } from '../../../shared/types';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

interface ListItemProps {
    item: DataItem;
}

function ListItem({ item }: ListItemProps) {
    const navigate = useNavigate();

    // This function will handle the navigation when the main card is clicked.
    const handleCardClick = () => {
        // We navigate to the details page, passing the item data in the state.
        navigate(`/place/${encodeURIComponent(item.googlePlaceId)}`, { state: { place: item } });
    };

    // This function handles clicks on the website link ONLY.
    // It prevents the card's click handler from firing.
    const handleWebsiteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.stopPropagation(); 
    };

    return (
        // The main element is now a div with an onClick handler.
        // It's styled to look clickable.
        <div className="list-item" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <h3 className="item-name">{item.name}</h3>
            <p>Address: {item.formattedAddress}</p>
            <p>Rating: {item.rating} ⭐ ({item.userRatingCount} reviews)</p>
            <p>Types: {item.types?.join(', ')}</p>
            {item.websiteUri && (
                <p>
                    Website: 
                    {/* This is now the ONLY `a` tag. Its click is stopped from propagating. */}
                    <a 
                      href={item.websiteUri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={handleWebsiteClick}
                    >
                      {item.websiteUri}
                    </a>
                </p>
            )}
            {item.location && <p>Location: {item.location.latitude}, {item.location.longitude}</p>}
            <hr className="divider" />
        </div>
    );
}

export default ListItem;