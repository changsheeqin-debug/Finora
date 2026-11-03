const db = require("../config/db");
const { randomUUID } = require("crypto");
const { createUserNotification } = require("../utils/notificationHelper");

const formatTransactionDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

// Get all transactions belonging to the logged-in user
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [transactions] = await db.execute(
            `SELECT
                transaction_id,
                user_id,
                amount,
                type,
                category,
                payment_method,
                DATE_FORMAT(transaction_date, '%Y-%m-%d') AS transaction_date,
                note,
                created_at,
                updated_at
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

        const notificationTitle = type === "Income"
            ? "Income Transaction Added"
            : "Expense Transaction Added";

        const notificationMessage =
            `${type} of RM${Number(amount).toFixed(2)} has been recorded under ${category} ` +
            `using ${paymentMethod} on ${formatTransactionDate(date)}.` +
            (note ? ` Note: ${note}` : "");

        await createUserNotification(
            userId,
            notificationTitle,
            notificationMessage,
            "transaction_notifications"
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

        const notificationMessage =
            `Your ${type.toLowerCase()} transaction of RM${Number(amount).toFixed(2)} ` +
            `under ${category}, paid through ${paymentMethod} on ${formatTransactionDate(date)}, ` +
            `has been updated.` +
            (note ? ` Note: ${note}` : "");

        await createUserNotification(
            userId,
            "Transaction Updated",
            notificationMessage,
            "transaction_notifications"
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

    const [transactions] = await db.execute(
        `SELECT amount, type, category, payment_method, transaction_date, note
        FROM transactions
        WHERE transaction_id = ? AND user_id = ?`,
        [id, userId]
    );

    if (transactions.length === 0) {
        return res.status(404).json({
            message: "Transaction not found."
        });
    }

    const transaction = transactions[0];

    const [result] = await db.execute(
        "DELETE FROM transactions WHERE transaction_id = ? AND user_id = ?",
        [id, userId]
    );

    await createUserNotification(
        userId,
        "Transaction Deleted",
        `Your ${transaction.type.toLowerCase()} of RM${Number(transaction.amount).toFixed(2)} ` +
        `under ${transaction.category}, paid through ${transaction.payment_method} ` +
        `on ${formatTransactionDate(transaction.transaction_date.toISOString().slice(0, 10))}, ` +
        `has been deleted.` +
        (transaction.note ? ` Note: ${transaction.note}` : ""),
        "transaction_notifications"
    );
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