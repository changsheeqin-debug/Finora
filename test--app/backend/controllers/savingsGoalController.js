const { createUserNotification } = require("../utils/notificationHelper");
const db = require("../config/db");

const formatAmount = (amount) => {
    return `RM${Number(amount).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

// GET all savings goals belonging to the logged-in user
const getSavingsGoals = async (req, res) => {
    try {
        const [goals] = await db.execute(
            `SELECT
                goal_id AS id,
                goal_name AS goalName,
                target_amount AS targetAmount,
                current_saved AS currentSaved,
                target_date AS targetDate,
                status
             FROM savings_goals
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({
            goals
        });

    } catch (error) {
        console.error("Get savings goals error:", error);

        res.status(500).json({
            message: "Failed to retrieve savings goals."
        });
    }
};


// CREATE a new savings goal
const createSavingsGoal = async (req, res) => {
    try {
        const {
            goalName,
            targetAmount,
            currentSaved = 0,
            targetDate = null
        } = req.body || {};

        if (!goalName || !goalName.trim()) {
            return res.status(400).json({
                message: "Goal name is required."
            });
        }

        if (
            targetAmount === undefined ||
            targetAmount === null ||
            targetAmount === "" ||
            !Number.isFinite(Number(targetAmount)) ||
            Number(targetAmount) <= 0
        ) {
            return res.status(400).json({
                message: "Target amount must be greater than 0."
            });
        }

        if (
            !Number.isFinite(Number(currentSaved)) ||
            Number(currentSaved) < 0 ||
            Number(currentSaved) > Number(targetAmount)
        ) {
            return res.status(400).json({
                message: "Current saved amount must be between 0 and the target amount."
            });
        }

        if (
            targetDate !== null &&
            (
                typeof targetDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(targetDate) ||
                !Number.isFinite(Date.parse(`${targetDate}T00:00:00Z`)) ||
                new Date(`${targetDate}T00:00:00Z`).toISOString().slice(0, 10) !== targetDate
            )
        ) {
            return res.status(400).json({
                message: "Please provide a valid target date in YYYY-MM-DD format."
            });
        }

        const status = Number(currentSaved) >= Number(targetAmount)
            ? "Completed"
            : "Active";

        const [result] = await db.execute(
            `INSERT INTO savings_goals
                (user_id, goal_name, target_amount, current_saved, target_date, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.user.userId,
                goalName.trim(),
                targetAmount,
                currentSaved,
                targetDate,
                status
            ]
        );

        await createUserNotification(
            req.user.userId,
            "Savings Goal Created",
            `Your savings goal "${goalName.trim()}" has been created successfully. Your target is ${formatAmount(targetAmount)}, and you've already saved ${formatAmount(currentSaved)} (${((Number(currentSaved) / Number(targetAmount)) * 100).toFixed(1)}% of your goal).`,
            "goal_reminders"
        );

        res.status(201).json({
            message: "Savings goal created successfully!",
            goal: {
                id: result.insertId,
                goalName: goalName.trim(),
                targetAmount: Number(targetAmount),
                currentSaved: Number(currentSaved),
                targetDate,
                status
            }
        });

    } catch (error) {
        console.error("Create savings goal error:", error);

        res.status(500).json({
            message: "Failed to create savings goal."
        });
    }
};


// UPDATE an existing savings goal
const updateSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            goalName,
            targetAmount,
            currentSaved,
            targetDate = null
        } = req.body || {};

        if (!goalName || !goalName.trim()) {
            return res.status(400).json({
                message: "Goal name is required."
            });
        }

        if (
            targetAmount === undefined ||
            targetAmount === null ||
            targetAmount === "" ||
            !Number.isFinite(Number(targetAmount)) ||
            Number(targetAmount) <= 0
        ) {
            return res.status(400).json({
                message: "Target amount must be greater than 0."
            });
        }

        if (
            currentSaved === undefined ||
            currentSaved === null ||
            currentSaved === "" ||
            !Number.isFinite(Number(currentSaved)) ||
            Number(currentSaved) < 0 ||
            Number(currentSaved) > Number(targetAmount)
        ) {
            return res.status(400).json({
                message: "Current saved amount must be between 0 and the target amount."
            });
        }

        if (
            targetDate !== null &&
            (
                typeof targetDate !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(targetDate) ||
                !Number.isFinite(Date.parse(`${targetDate}T00:00:00Z`)) ||
                new Date(`${targetDate}T00:00:00Z`).toISOString().slice(0, 10) !== targetDate
            )
        ) {
            return res.status(400).json({
                message: "Please provide a valid target date in YYYY-MM-DD format."
            });
        }

        // Check whether this goal belongs to the logged-in user
        const [existingGoals] = await db.execute(
            `SELECT goal_id, goal_name, target_amount, current_saved
            FROM savings_goals
            WHERE goal_id = ? AND user_id = ?`,
            [id, req.user.userId]
        );

        if (existingGoals.length === 0) {
            return res.status(404).json({
                message: "Savings goal not found."
            });
        }

        const previousGoal = existingGoals[0];

        const previousProgress =
            (Number(previousGoal.current_saved) / Number(previousGoal.target_amount)) * 100;

        const currentProgress =
            (Number(currentSaved) / Number(targetAmount)) * 100;
            
        const status = Number(currentSaved) >= Number(targetAmount)
            ? "Completed"
            : "Active";

        await db.execute(
            `UPDATE savings_goals
             SET goal_name = ?,
                 target_amount = ?,
                 current_saved = ?,
                 target_date = ?,
                 status = ?
             WHERE goal_id = ? AND user_id = ?`,
            [
                goalName.trim(),
                targetAmount,
                currentSaved,
                targetDate,
                status,
                id,
                req.user.userId
            ]
        );

        // Notify user that the goal was updated
        await createUserNotification(
            req.user.userId,
            "Savings Goal Updated",
            `Your savings goal "${goalName.trim()}" has been updated. Your current savings are ${formatAmount(currentSaved)} out of ${formatAmount(targetAmount)} (${currentProgress.toFixed(1)}% completed).`,
            "goal_reminders"
        );

        // Check whether the user has reached a new milestone
        const milestones = [25, 50, 75, 100];

        for (const milestone of milestones) {
            if (
                previousProgress < milestone &&
                currentProgress >= milestone
            ) {
                await createUserNotification(
                    req.user.userId,
                    milestone === 100
                        ? "Savings Goal Completed!"
                        : `${milestone}% Savings Milestone Reached!`,
                    milestone === 100
                        ? `Congratulations! You've reached your target for "${goalName.trim()}"! You've saved ${formatAmount(currentSaved)} out of ${formatAmount(targetAmount)}. Your savings goal is now complete!`
                        : `Great progress! You've reached ${milestone}% of your "${goalName.trim()}" savings goal. You've saved ${formatAmount(currentSaved)} out of ${formatAmount(targetAmount)}. Keep going towards your target!`,
                    "goal_reminders"
                );
            }
        }
        res.status(200).json({
            message: "Savings goal updated successfully!"
        });

    } catch (error) {
        console.error("Update savings goal error:", error);

        res.status(500).json({
            message: "Failed to update savings goal."
        });
    }
};


// DELETE a savings goal
const deleteSavingsGoal = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM savings_goals WHERE goal_id = ? AND user_id = ?",
            [id, req.user.userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Savings goal not found."
            });
        }

        res.status(200).json({
            message: "Savings goal deleted successfully!"
        });

    } catch (error) {
        console.error("Delete savings goal error:", error);

        res.status(500).json({
            message: "Failed to delete savings goal."
        });
    }
};


module.exports = {
    getSavingsGoals,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal
};
