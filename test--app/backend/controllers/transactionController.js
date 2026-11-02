const db = require("../config/db");
const { randomUUID } = require("crypto");

// Get all transactions belonging to the logged-in user
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [transactions] = await db.execute(
            `SELECT *
             FROM transactions
             WHERE user_id = ?
             ORDER BY transaction_date DESC, created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            transactions
        });

    } catch (error) {
        console.error("Get transactions error:", error.message);

        return res.status(500).json({
            message: "Failed to retrieve transactions."
        });
    }
};


// Add a new transaction
const createTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            amount,
            type,
            category,
            paymentMethod,
            date,
            note
        } = req.body || {};

        // Validate required fields
        if (
            amount === undefined ||
            !type ||
            !category ||
            !paymentMethod ||
            !date
        ) {
            return res.status(400).json({
                message: "Amount, type, category, payment method and date are required."
            });
        }

        // Validate amount
        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be a number greater than zero."
            });
        }

        // Validate transaction type
        if (!["Income", "Expenses"].includes(type)) {
            return res.status(400).json({
                message: "Type must be Income or Expenses."
            });
        }

        // Validate text fields
        if (
            typeof category !== "string" ||
            !category.trim() ||
            typeof paymentMethod !== "string" ||
            !paymentMethod.trim()
        ) {
            return res.status(400).json({
                message: "Category and payment method cannot be empty."
            });
        }

        // Validate date format (YYYY-MM-DD)
        if (
            typeof date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
            new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                message: "Please provide a valid date in YYYY-MM-DD format."
            });
        }

        const transactionId = `txn_${randomUUID()}`;

        await db.execute(
            `INSERT INTO transactions
             (transaction_id, user_id, amount, type, category,
              payment_method, transaction_date, note)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transactionId,
                userId,
                Number(amount),
                type,
                category.trim(),
                paymentMethod.trim(),
                date,
                typeof note === "string" ? note.trim() || null : null
            ]
        );

        return res.status(201).json({
            message: "Transaction created successfully!",
            transaction: {
                transaction_id: transactionId,
                amount: Number(amount),
                type,
                category: category.trim(),
                payment_method: paymentMethod.trim(),
                transaction_date: date,
                note: typeof note === "string" ? note.trim() || null : null
            }
        });

    } catch (error) {
        console.error("Create transaction error:", error.message);

        return res.status(500).json({
            message: "Failed to create transaction."
        });
    }
};


// Update an existing transaction
const updateTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const {
            amount,
            type,
            category,
            paymentMethod,
            date,
            note
        } = req.body || {};

        // Check whether the transaction belongs to this user
        const [existingTransactions] = await db.execute(
            `SELECT transaction_id
             FROM transactions
             WHERE transaction_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (existingTransactions.length === 0) {
            return res.status(404).json({
                message: "Transaction not found."
            });
        }

        // Validate fields
        if (
            amount === undefined ||
            !type ||
            !category ||
            !paymentMethod ||
            !date
        ) {
            return res.status(400).json({
                message: "Amount, type, category, payment method and date are required."
            });
        }

        if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be a number greater than zero."
            });
        }

        if (!["Income", "Expenses"].includes(type)) {
            return res.status(400).json({
                message: "Type must be Income or Expenses."
            });
        }

        if (
            typeof category !== "string" ||
            !category.trim() ||
            typeof paymentMethod !== "string" ||
            !paymentMethod.trim()
        ) {
            return res.status(400).json({
                message: "Category and payment method cannot be empty."
            });
        }

        if (
            typeof date !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
            new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date
        ) {
            return res.status(400).json({
                message: "Please provide a valid date in YYYY-MM-DD format."
            });
        }

        await db.execute(
            `UPDATE transactions
             SET amount = ?,
                 type = ?,
                 category = ?,
                 payment_method = ?,
                 transaction_date = ?,
                 note = ?
             WHERE transaction_id = ? AND user_id = ?`,
            [
                Number(amount),
                type,
                category.trim(),
                paymentMethod.trim(),
                date,
                typeof note === "string" ? note.trim() || null : null,
                id,
                userId
            ]
        );

        return res.status(200).json({
            message: "Transaction updated successfully!"
        });

    } catch (error) {
        console.error("Update transaction error:", error.message);

        return res.status(500).json({
            message: "Failed to update transaction."
        });
    }
};


// Delete a transaction
const deleteTransaction = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const [result] = await db.execute(
            `DELETE FROM transactions
             WHERE transaction_id = ? AND user_id = ?`,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Transaction not found."
            });
        }

        return res.status(200).json({
            message: "Transaction deleted successfully!"
        });

    } catch (error) {
        console.error("Delete transaction error:", error.message);

        return res.status(500).json({
            message: "Failed to delete transaction."
        });
    }
};


module.exports = {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
};