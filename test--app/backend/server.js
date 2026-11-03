const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const savingsGoalRoutes = require("./routes/savingsGoalRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/savings-goals", savingsGoalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Finora API!"
    });
});

// Start server and test database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const connection = await db.getConnection();

        console.log("MySQL database connected successfully!");

        connection.release();

        app.listen(PORT, () => {
            console.log(`Finora server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
};

startServer();