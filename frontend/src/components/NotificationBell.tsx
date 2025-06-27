// frontend/src/components/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as notificationService from '../services/notificationService';
import { Notification } from '@shared/types';
import { Link } from 'react-router-dom';
import './NotificationBell.css';

function NotificationBell() {
    const { isLoggedIn } = useAuth();
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

    // Close dropdown if clicking outside
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
            // Mark all as read when dropdown is opened
            const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
            notificationService.markNotificationsAsRead(unreadIds).then(() => {
                setNotifications(notifications.map(n => unreadIds.includes(n.id) ? { ...n, isRead: true } : n));
            });
        }
    };

    if (!isLoggedIn) return null;

    return (
        <div className="notification-bell-container" ref={containerRef}>
            <button onClick={handleBellClick} className="notification-bell-button">
                <Bell />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="notification-dropdown">
                    {notifications.length === 0 ? (
                        <div className="notification-item">No notifications yet.</div>
                    ) : (
                        notifications.map(notif => (
                            <Link 
                                key={notif.id}
                                to={`/place/${notif.comment.place.googlePlaceId}`} 
                                className="notification-item"
                                onClick={() => setIsOpen(false)}
                            >
                                <Mail size={16} />
                                <p>
                                    <strong>{notif.sender.name || 'A user'}</strong> replied to your comment on 
                                    <strong> {notif.comment.place.name}</strong>.
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;