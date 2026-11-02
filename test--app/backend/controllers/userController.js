
const db = require("../config/db");

// GET user profile
const getProfile = async (req, res) => {
    try {
        const [users] = await db.execute(
            `SELECT
                user_id AS userId,
                name,
                email,
                phone,
                occupation,
                created_at AS createdAt
             FROM users
             WHERE user_id = ?`,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({
            user: users[0]
        });

    } catch (error) {
        console.error("Get profile error:", error);

        res.status(500).json({
            message: "Failed to retrieve profile."
        });
    }
};


// UPDATE user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone = null, occupation = null } = req.body || {};

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Name is required."
            });
        }

        if (
            phone !== null &&
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Phone must be a string."
            });
        }

        if (
            occupation !== null &&
            typeof occupation !== "string"
        ) {
            return res.status(400).json({
                message: "Occupation must be a string."
            });
        }

        const [result] = await db.execute(
            `UPDATE users
             SET name = ?, phone = ?, occupation = ?
             WHERE user_id = ?`,
            [
                name.trim(),
                phone ? phone.trim() : null,
                occupation ? occupation.trim() : null,
                req.user.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        res.status(200).json({
            message: "Profile updated successfully!"
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            message: "Failed to update profile."
        });
    }
};


// GET user settings
const getSettings = async (req, res) => {
    try {
        const [settings] = await db.execute(
            `SELECT
                currency,
                theme,
                transaction_notifications AS transactionNotifications,
                goal_reminders AS goalReminders,
                monthly_summary AS monthlySummary
             FROM user_settings
             WHERE user_id = ?`,
            [req.user.userId]
        );

        if (settings.length === 0) {
            return res.status(404).json({
                message: "User settings not found."
            });
        }

        res.status(200).json({
            settings: settings[0]
        });

    } catch (error) {
        console.error("Get settings error:", error);

        res.status(500).json({
            message: "Failed to retrieve settings."
        });
    }
};


// UPDATE user settings
const updateSettings = async (req, res) => {
    try {
        const {
            currency,
            theme,
            transactionNotifications,
            goalReminders,
            monthlySummary
        } = req.body || {};

        if (
            typeof currency !== "string" ||
            !/^[A-Za-z]{3}$/.test(currency)
        ) {
            return res.status(400).json({
                message: "Currency must be a valid 3-letter code."
            });
        }

        if (!["light", "dark"].includes(theme)) {
            return res.status(400).json({
                message: "Theme must be either light or dark."
            });
        }

        if (
            typeof transactionNotifications !== "boolean" ||
            typeof goalReminders !== "boolean" ||
            typeof monthlySummary !== "boolean"
        ) {
            return res.status(400).json({
                message: "Notification settings must be true or false."
            });
        }

        const [result] = await db.execute(
            `UPDATE user_settings
             SET currency = ?,
                 theme = ?,
                 transaction_notifications = ?,
                 goal_reminders = ?,
                 monthly_summary = ?
             WHERE user_id = ?`,
            [
                currency.toUpperCase(),
                theme,
                transactionNotifications,
                goalReminders,
                monthlySummary,
                req.user.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User settings not found."
            });
        }

        res.status(200).json({
            message: "Settings updated successfully!"
        });

    } catch (error) {
        console.error("Update settings error:", error);

        res.status(500).json({
            message: "Failed to update settings."
        });
    }
};


module.exports = {
    getProfile,
    updateProfile,
    getSettings,
    updateSettings
};
