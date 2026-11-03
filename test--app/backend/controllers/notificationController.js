
const pool = require("../config/db");

// Get all notifications for the logged-in user
const getNotifications = async (req, res) => {
    try {
        const [notifications] = await pool.query(
            `SELECT
                notification_id AS id,
                title,
                message,
                is_read AS isRead,
                created_at AS date
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            message: "Failed to retrieve notifications."
        });
    }
};

// Create a notification
const createNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                message: "Title and message are required."
            });
        }

        const [result] = await pool.query(
            `INSERT INTO notifications
                (user_id, title, message)
             VALUES (?, ?, ?)`,
            [req.user.userId, title.trim(), message.trim()]
        );

        res.status(201).json({
            message: "Notification created successfully.",
            notification: {
                id: result.insertId,
                title: title.trim(),
                message: message.trim(),
                isRead: false,
                date: new Date()
            }
        });
    } catch (error) {
        console.error("Create notification error:", error);
        res.status(500).json({
            message: "Failed to create notification."
        });
    }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
    try {
        const [result] = await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE notification_id = ? AND user_id = ?`,
            [req.params.id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Notification not found."
            });
        }

        res.status(200).json({
            message: "Notification marked as read."
        });
    } catch (error) {
        console.error("Mark notification as read error:", error);
        res.status(500).json({
            message: "Failed to update notification."
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = ? AND is_read = FALSE`,
            [req.user.userId]
        );

        res.status(200).json({
            message: "All notifications marked as read."
        });
    } catch (error) {
        console.error("Mark all notifications as read error:", error);
        res.status(500).json({
            message: "Failed to update notifications."
        });
    }
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
};
