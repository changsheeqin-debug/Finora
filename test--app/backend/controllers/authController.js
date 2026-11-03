const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    isEmailConfigured,
    sendPasswordResetEmail
} = require("../utils/passwordResetMailer");

const passwordResetMessage =
    "If an account exists for that email, a password reset link has been sent.";

// Register a new user
const registerUser = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { name, email, password } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required."
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 3. Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName) {
            return res.status(400).json({
                message: "Name cannot be empty."
            });
        }

        // 4. Check whether email already exists
        const [existingUsers] = await db.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "This email is already registered."
            });
        }

        // 5. Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // 6. Save user and default settings together
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO users (name, email, password_hash)
                 VALUES (?, ?, ?)`,
                [cleanName, cleanEmail, passwordHash]
            );

            const userId = result.insertId;

            await connection.execute(
                "INSERT INTO user_settings (user_id) VALUES (?)",
                [userId]
            );

            await connection.commit();

            // 7. Return successful registration response
            return res.status(201).json({
                message: "User registered successfully!",
                user: {
                    user_id: userId,
                    name: cleanName,
                    email: cleanEmail
                }
            });

        } catch (error) {
            await connection.rollback();

            // Handle duplicate email if another request registers it simultaneously
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "This email is already registered."
                });
            }

            throw error;

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
};

// Login an existing user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // 2. Find user by email
        const [users] = await db.execute(
            `SELECT user_id, name, email, password_hash
             FROM users
             WHERE email = ?`,
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // 3. Compare submitted password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // 5. Return successful login response
        return res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Something went wrong during login."
        });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const email = typeof req.body?.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        if (!isEmailConfigured()) {
            console.error("Password reset email is unavailable: SMTP is not configured.");
            return res.status(503).json({
                message: "Password reset is temporarily unavailable. Please try again later."
            });
        }

        const [users] = await db.execute(
            "SELECT user_id, email FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(200).json({ message: passwordResetMessage });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        await db.execute(
            `DELETE FROM password_reset_tokens
             WHERE user_id = ? OR expires_at <= NOW()`,
            [user.user_id]
        );
        await db.execute(
            `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
            [user.user_id, tokenHash]
        );

        const resetUrl = new URL(process.env.FRONTEND_URL || "http://localhost:5173");
        resetUrl.searchParams.set("resetToken", token);

        try {
            await sendPasswordResetEmail(user.email, resetUrl.toString());
        } catch (error) {
            await db.execute(
                "DELETE FROM password_reset_tokens WHERE token_hash = ?",
                [tokenHash]
            );
            throw error;
        }

        return res.status(200).json({ message: passwordResetMessage });
    } catch (error) {
        console.error("Password reset request error:", error.message);
        return res.status(500).json({
            message: "Something went wrong while requesting a password reset."
        });
    }
};

const resetPassword = async (req, res) => {
    const { token, password } = req.body || {};

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({
            message: "This password reset link is invalid or has expired."
        });
    }

    if (typeof password !== "string" || password.length < 8) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long."
        });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [tokens] = await connection.execute(
            `SELECT user_id
             FROM password_reset_tokens
             WHERE token_hash = ?
               AND expires_at > NOW()
               AND used_at IS NULL
             FOR UPDATE`,
            [tokenHash]
        );

        if (tokens.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "This password reset link is invalid or has expired."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = tokens[0].user_id;

        await connection.execute(
            "UPDATE users SET password_hash = ? WHERE user_id = ?",
            [passwordHash, userId]
        );
        await connection.execute(
            "DELETE FROM password_reset_tokens WHERE user_id = ?",
            [userId]
        );
        await connection.commit();

        return res.status(200).json({
            message: "Your password has been reset. You can now sign in."
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Password reset error:", error.message);
        return res.status(500).json({
            message: "Something went wrong while resetting your password."
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPassword
};