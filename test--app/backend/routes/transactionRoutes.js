const express = require("express");
const router = express.Router();

const {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
} = require("../controllers/transactionController");

const verifyToken = require("../middleware/authMiddleware");

// All routes require authentication
router.get("/", verifyToken, getTransactions);
router.post("/", verifyToken, createTransaction);
router.put("/:id", verifyToken, updateTransaction);
router.delete("/:id", verifyToken, deleteTransaction);

module.exports = router;