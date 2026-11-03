import { formatMoney } from "../utils/formatMoney";
import { toast } from "react-toastify";
function SavingsGoals({
    goals,
    currency = "MYR",
    onAddGoal,
    onEditGoal,
    onDeleteGoal
}) {

    const activeGoals = goals.filter(
        (goal) => Number(goal.currentSaved) < Number(goal.targetAmount)
    );

    const totalSaved = activeGoals.reduce(
        (total, goal) => total + Number(goal.currentSaved || 0),
        0
    );

    const remainingAmount = activeGoals.reduce(
        (total, goal) =>
            total + Math.max(
                Number(goal.targetAmount) - Number(goal.currentSaved),
                0
            ),
        0
    );

    const handleDelete = (id) => {
        toast.info(
            <div className="delete-confirm-toast">
                <p>Are you sure you want to delete this goal?</p>

                <div className="delete-confirm-actions">
                    <button
                        className="delete-confirm-btn"
                        onClick={() => {
                            toast.dismiss();
                            onDeleteGoal(id);
                        }}
                    >
                        Delete
                    </button>

                    <button
                        className="delete-cancel-btn"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false
            }
        );
    };

    return (
        <section className="page" id="goals">
            <div className="topbar">
                <div>
                    <div className="crumb">Workspace / Planning</div>
                    <h1>Savings goals</h1>
                    <div className="subtitle">
                        Small steps today, bigger milestones tomorrow.
                    </div>
                </div>

                <div className="actions">
                    <button
                        className="btn primary"
                        onClick={onAddGoal}
                    >
                        ＋ New goal
                    </button>
                </div>
            </div>

            <div className="grid stats">
                <div className="card">
                    <div className="stat-head">Total saved</div>
                    <div className="stat-value">
                        {formatMoney(totalSaved, currency)}
                    </div>
                    <div className="stat-foot">
                        Across all active goals
                    </div>
                </div>

                <div className="card">
                    <div className="stat-head">Active goals</div>
                    <div className="stat-value">
                        {activeGoals.length}
                    </div>
                    <div className="stat-foot">
                        You're building good habits
                    </div>
                </div>

                <div className="card">
                    <div className="stat-head">Remaining to target</div>
                    <div className="stat-value">
                        {formatMoney(remainingAmount, currency)}
                    </div>
                    <div className="stat-foot">
                        Across active goals
                    </div>
                </div>
            </div>

            <div className="grid goal-grid">
                {goals.length === 0 ? (
                    <div className="card">
                        <h3>No savings goals yet</h3>
                        <p className="subtitle">
                            Create your first goal and start tracking your savings.
                        </p>
                        <button
                            className="btn primary"
                            onClick={onAddGoal}
                        >
                            ＋ Create your first goal
                        </button>
                    </div>
                ) : (
                    goals.map((goal) => {
                        const target = Number(goal.targetAmount || 0);
                        const saved = Number(goal.currentSaved || 0);

                        const progress = target > 0
                            ? Math.min((saved / target) * 100, 100)
                            : 0;

                        const remaining = Math.max(target - saved, 0);
                        const isCompleted = saved >= target;

                        return (
                            <div className="card goal-card" key={goal.id}>
                                <div className="goal-card-header">
                                    <div>
                                        <h3>{goal.name}</h3>
                                        <div className="stat-foot">
                                            {isCompleted ? "Goal completed" : "In progress"}
                                        </div>
                                    </div>

                                    <div className="actions">
                                        <button
                                            className="btn"
                                            onClick={() => onEditGoal(goal)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="goal-amount">
                                    <strong>{formatMoney(saved, currency)}</strong>
                                    <span> of {formatMoney(target, currency)}</span>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>

                                <div className="goal-progress-info">
                                    <span>{progress.toFixed(1)}% completed</span>
                                    <span>
                                        {isCompleted
                                            ? "Target reached!"
                                            : `${formatMoney(remaining, currency)} left`}
                                    </span>
                                </div>

                                <div className="goal-footer">
                                    <span>Target date</span>
                                    <strong>
                                        {goal.targetDate
                                            ? new Date(goal.targetDate).toLocaleDateString(
                                                "en-MY",
                                                {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                }
                                            )
                                            : "Not set"}
                                    </strong>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}

export default SavingsGoals;