
const pool = require("../config/db");

const createUserNotification = async (
    userId,
    title,
    message,
    settingColumn
) => {
    try {
        const allowedSettings = [
            "transaction_notifications",
            "goal_reminders",
            "monthly_summary"
        ];

        if (!allowedSettings.includes(settingColumn)) {
            throw new Error("Invalid notification setting.");
        }

        const [settings] = await pool.query(
            `SELECT ${settingColumn} AS enabled
             FROM user_settings
             WHERE user_id = ?`,
            [userId]
        );

        if (settings.length === 0 || !settings[0].enabled) {
            return;
        }

        await pool.query(
            `INSERT INTO notifications (user_id, title, message)
             VALUES (?, ?, ?)`,
            [userId, title, message]
        );
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};

module.exports = { createUserNotification };
