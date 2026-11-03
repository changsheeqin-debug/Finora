import { useState, useEffect, useRef } from "react";

function NotificationDropdown({
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead
}) {
    const [isOpen, setIsOpen] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="app-notification" ref={notificationRef}>
            <button
                className="notification-button"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                🔔

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <h3>Notifications</h3>

                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="mark-all-read"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="empty-notifications">
                                You're all caught up!
                            </p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${
                                        notification.isRead
                                            ? "read"
                                            : "unread"
                                    }`}
                                    onClick={() =>
                                        onMarkAsRead(notification.id)
                                    }
                                >
                                    <div className="notification-item-content">
                                        <strong>{notification.title}</strong>
                                        <p>{notification.message}</p>
                                        <small>
                                            {new Date(
                                                notification.date
                                            ).toLocaleString()}
                                        </small>
                                    </div>

                                    {!notification.isRead && (
                                        <span className="notification-dot"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationDropdown;
