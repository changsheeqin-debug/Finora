const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

module.exports = {
    registerUser,
    loginUser
};