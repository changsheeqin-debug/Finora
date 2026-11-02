const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// Protected route - get current logged-in user
//GET	/api/auth/me

router.get("/me", verifyToken, (req, res) => {
    res.status(200).json({
        message: "Authentication successful!",
        user: req.user
    });
});

module.exports = router;