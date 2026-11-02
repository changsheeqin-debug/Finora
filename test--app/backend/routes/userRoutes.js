
const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    getSettings,
    updateSettings
} = require("../controllers/userController");

const verifyToken = require("../middleware/authMiddleware");

// Profile routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// Settings routes
router.get("/settings", verifyToken, getSettings);
router.put("/settings", verifyToken, updateSettings);

module.exports = router;
