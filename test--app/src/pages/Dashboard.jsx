
import { useMemo, useState } from "react";
import CategoryChart from "../components/charts/CategoryChart";
import PaymentMethodChart from "../components/charts/PaymentMethodChart";
import { formatMoney } from "../utils/formatMoney";

function Dashboard({
    transactions,
    goals,
    currency,
    notifications,
    onAddTransaction,
    onNavigate,
    user
}) {
    const [dashPeriod, setDashPeriod] = useState("month");
    const [selectedMonth, setSelectedMonth] = useState("");

    // Get available months from transaction records.
    const availableMonths = useMemo(() => {
        return [
            ...new Set(
                transactions.map((transaction) =>
                    transaction.date.slice(0, 7)
                )
            )
        ].sort().reverse();
    }, [transactions]);

    // Default to the latest month containing transactions.
    const activeMonth = selectedMonth || availableMonths[0] || "";

    // Filter transactions according to the selected period.
    const selectedTransactions = useMemo(() => {
        if (dashPeriod === "all") {
            return transactions;
        }

        if (!activeMonth) {
            return [];
        }

        return transactions.filter((transaction) =>
            transaction.date.startsWith(activeMonth)
        );
    }, [transactions, dashPeriod, activeMonth]);

    // Get expense transactions.
    const expenses = selectedTransactions.filter(
        (transaction) =>
            ["expense", "expenses"].includes(
                transaction.type?.toLowerCase()
            )
    );

    // Calculate total spending.
    const totalSpent = expenses.reduce(
        (total, transaction) =>
            total + Number(transaction.amount || 0),
        0
    );

    // Calculate spending by category.
    const categoryTotals = expenses.reduce((result, transaction) => {
        const category = transaction.category;

        result[category] =
            (result[category] || 0) + Number(transaction.amount || 0);

        return result;
    }, {});

    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

    const topCategory = sortedCategories[0];

    // Calculate spending by payment method.
    const methodTotals = expenses.reduce((result, transaction) => {
        const method = transaction.method;

        result[method] =
            (result[method] || 0) + Number(transaction.amount || 0);

        return result;
    }, {});

    const sortedMethods = Object.entries(methodTotals)
        .sort((a, b) => b[1] - a[1]);

    const primaryMethod = sortedMethods[0];

    // Format transaction date.
    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short"
        });

    // Get the five most recent transactions.
    const recentTransactions = [...selectedTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <section className="page" id="dashboard">
            <div className="topbar">
                <div>
                    <div className="crumb">Workspace / Overview</div>
                    <h1>Good evening, {user.name.split(" ")[0]}</h1>
                    <div className="subtitle">
                        Here's what's happening with your money.
                    </div>
                </div>

                <div className="actions">
                    <select
                        value={dashPeriod === "all" ? "all" : activeMonth}
                        onChange={(e) => {
                            if (e.target.value === "all") {
                                setDashPeriod("all");
                            } else {
                                setDashPeriod("month");
                                setSelectedMonth(e.target.value);
                            }
                        }}
                    >
                        {availableMonths.map((month) => {
                            const [year, monthNumber] = month.split("-");

                            const label = new Date(
                                Number(year),
                                Number(monthNumber) - 1
                            ).toLocaleDateString("en-MY", {
                                month: "long",
                                year: "numeric"
                            });

                            return (
                                <option key={month} value={month}>
                                    {label}
                                </option>
                            );
                        })}

                        <option value="all">All time</option>
                    </select>

                    <button
                        className="btn primary"
                        onClick={onAddTransaction}
                    >
                        ＋ Add transaction
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid stats">
                <div className="card">
                    <div className="stat-head">
                        Total spent <span className="stat-icon">↗</span>
                    </div>

                    <div className="stat-value">
                        {formatMoney(totalSpent, currency)}
                    </div>

                    <div className="stat-foot">
                        For selected period
                    </div>
                </div>

                <div className="card">
                    <div className="stat-head">
                        Top category <span className="stat-icon">◈</span>
                    </div>

                    <div className="stat-value">
                        {topCategory ? topCategory[0] : "No data"}
                    </div>

                    <div className="stat-foot">
                        {topCategory
                            ? formatMoney(topCategory[1], currency)
                            : "No expenses recorded"}
                    </div>
                </div>

                <div className="card">
                    <div className="stat-head">
                        Primary payment method <span className="stat-icon">▤</span>
                    </div>

                    <div className="stat-value">
                        {primaryMethod ? primaryMethod[0] : "No data"}
                    </div>

                    <div className="stat-foot">
                        {primaryMethod && totalSpent > 0
                            ? `${((primaryMethod[1] / totalSpent) * 100).toFixed(1)}% of spending`
                            : "No expenses recorded"}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid two-col">
                <CategoryChart 
                transactions={transactions}
                currency={currency} 
                />

                <PaymentMethodChart
                    transactions={selectedTransactions}
                    period={dashPeriod}
                />
            </div>

            {/* Recent transactions and savings goals */}
            <div className="grid bottom-grid">
                <div className="card">
                    <div className="card-title">
                        <div>
                            <h2>Recent transactions</h2>
                            <p>Your latest money movements</p>
                        </div>

                        <button
                            className="text-link"
                            onClick={() =>
                                onNavigate && onNavigate("transactions")
                            }
                        >
                            View all →
                        </button>
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: "right" }}>
                                        Amount
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.note}</td>
                                            <td>{transaction.category}</td>
                                            <td>
                                                {formatDate(transaction.date)}
                                            </td>
                                            <td className="amount">
                                                {transaction.type?.toLowerCase() === "income"
                                                    ? "+"
                                                    : "-"}
                                                {formatMoney(Number(transaction.amount), currency)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">
                        <div>
                            <h2>Savings goals</h2>
                            <p>You're making progress</p>
                        </div>

                        <button
                            className="text-link"
                            onClick={() => onNavigate && onNavigate("goals")}
                        >
                            View all →
                        </button>
                    </div>

                    {goals && goals.length > 0 ? (
                        <div className="dashboard-goals">
                            {goals.slice(0, 3).map((goal) => {
                                const percentage = goal.targetAmount > 0
                                    ? Math.min(
                                        (goal.currentSaved / goal.targetAmount) * 100,
                                        100
                                    )
                                    : 0;

                                return (
                                    <div className="dashboard-goal" key={goal.id}>
                                        <div className="dashboard-goal-info">
                                            <strong>{goal.name}</strong>
                                            <span>{percentage.toFixed(0)}%</span>
                                        </div>

                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>

                                        <div className="dashboard-goal-amount">
                                            <span>
                                                {formatMoney(goal.currentSaved, currency)}
                                            </span>
                                            <span>
                                                of {formatMoney(goal.targetAmount, currency)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty">
                            No savings goals yet. Start by creating your first goal!
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Dashboard;
