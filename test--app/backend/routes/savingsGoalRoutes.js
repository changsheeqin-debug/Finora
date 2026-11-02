
const express = require("express");
const router = express.Router();

const {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
} = require("../controllers/savingsGoalController");

const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, getSavingsGoals);
router.post("/", verifyToken, createSavingsGoal);
router.put("/:id", verifyToken, updateSavingsGoal);
router.delete("/:id", verifyToken, deleteSavingsGoal);

module.exports = router;
