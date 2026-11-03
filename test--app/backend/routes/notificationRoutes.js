const express = require("express");
const router = express.Router();

const {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
} = require("../controllers/notificationController");

const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getNotifications);
router.post("/", verifyToken, createNotification);
router.put("/read-all", verifyToken, markAllAsRead);
router.put("/:id/read", verifyToken, markAsRead);

module.exports = router;