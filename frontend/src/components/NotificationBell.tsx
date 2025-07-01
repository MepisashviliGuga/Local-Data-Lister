// frontend/src/components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Mail, ThumbsUp } from 'lucide-react'; // <-- Import ThumbsUp icon
import { useAuth } from '../context/AuthContext';
import * as notificationService from '../services/notificationService';
import { Notification } from '@shared/types';
import { Link } from 'react-router-dom';
import './NotificationBell.css';
 
function NotificationBell() {
    const { isLoggedIn, user } = useAuth(); // <-- Get user object
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
 
    useEffect(() => {
        if (!isLoggedIn) return;
 
        const fetchNotifications = async () => {
            try {
                const data = await notificationService.getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
 
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
 
        return () => clearInterval(interval);
    }, [isLoggedIn]);
 
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
 
    const unreadCount = notifications.filter(n => !n.isRead).length;
 
    const handleBellClick = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen && unreadCount > 0) {
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            notificationService.markNotificationsAsRead(unreadIds).then(() => {
                setNotifications(notifications.map(n => unreadIds.includes(n.id) ? { ...n, isRead: true } : n));
            });
        }
    };
    // --- RENDER LOGIC FOR NOTIFICATION ITEMS ---
    const renderNotificationItem = (notif: Notification) => {
        const senderName = notif.sender.name || 'A user';
        const placeName = notif.comment.place.name;
 
        let icon = <Mail size={16} />;
        let message;
 
        switch(notif.type) {
            case 'REPLY':
                icon = <Mail size={16} />;
                message = <><strong>{senderName}</strong> replied to your comment on <strong>{placeName}</strong>.</>;
                break;
            case 'UPVOTE':
                icon = <ThumbsUp size={16} style={{ color: 'var(--success-color)' }} />;
                message = <><strong>{senderName}</strong> liked your comment on <strong>{placeName}</strong>.</>;
                break;
            case 'DOWNVOTE':
                // Optional: You might not want to show downvote notifications.
                // If you do, you could use a different icon or message.
                // For now, we will filter them out from being displayed.
                return null;
            default:
                message = <>You have a new notification.</>;
                break;
        }
 
        return (
<Link 
                key={notif.id}
                to={`/place/${notif.comment.place.googlePlaceId}`} 
                className="notification-item"
                onClick={() => setIsOpen(false)}
>
                {icon}
<p>{message}</p>
</Link>
        );
    };
 
    if (!isLoggedIn) return null;
    // Filter out notifications you don't want to show (like downvotes)
    const displayableNotifications = notifications.filter(n => n.type !== 'DOWNVOTE' && n.sender.id !== user?.id);
 
    return (
<div className="notification-bell-container" ref={containerRef}>
<button onClick={handleBellClick} className="notification-bell-button">
<Bell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
</button>
            {isOpen && (
<div className="notification-dropdown">
                    {displayableNotifications.length === 0 ? (
<div className="notification-item">No new notifications.</div>
                    ) : (
                        displayableNotifications.map(renderNotificationItem)
                    )}
</div>
            )}
</div>
    );
}
 
export default NotificationBell;