
import { useMemo, useState } from "react";
import CategoryChart from "../components/charts/CategoryChart";
import PaymentMethodChart from "../components/charts/PaymentMethodChart";

function Dashboard({ transactions, onAddTransaction, onNavigate }) {
    const [dashPeriod, setDashPeriod] = useState("month");

    // Find the latest month containing transaction data.
    // This makes the sample October 2026 data visible by default.
    const availableMonths = useMemo(() => {
        return [...new Set(
            transactions.map((transaction) => transaction.date.slice(0, 7))
        )].sort().reverse();
    }, [transactions]);

const [selectedMonth, setSelectedMonth] = useState("");

const activeMonth = selectedMonth || availableMonths[0] || "";

    const previousMonth = (month) => {
        if (!month) return "";
        const date = new Date(`${month}-01T00:00:00`);
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().slice(0, 7);
    };

    // Filter transactions according to the selected period.
    const selectedTransactions = useMemo(() => {
    if (!activeMonth) return [];

    if (dashPeriod === "all") return transactions;

    return transactions.filter(
        (transaction) => transaction.date.startsWith(activeMonth)
    );
    }, [transactions, dashPeriod, activeMonth]);

    const expenses = selectedTransactions.filter(
        (transaction) => transaction.type === "Expenses"
    );

    const totalSpent = expenses.reduce(
        (total, transaction) => total + Number(transaction.amount), 0
    );

    // Calculate payment method totals.
    const methodTotals = useMemo(() => {
        return expenses.reduce((result, transaction) => {
            const method = transaction.method;
            result[method] = (result[method] || 0) + Number(transaction.amount);
            return result;
        }, {});
    }, [selectedTransactions]);

    const sortedMethods = Object.entries(methodTotals)
        .sort((a, b) => b[1] - a[1]);

    const primaryMethod = sortedMethods[0];

    const formatMoney = (amount) =>
        `RM ${amount.toLocaleString("en-MY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short"
        });

    // Recent transactions, newest first.
    const recentTransactions = [...selectedTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);


    // Prepare donut chart data.
    const circumference = 2 * Math.PI * 55;
    const donutTotal = sortedMethods.reduce((sum, item) => sum + item[1], 0);

    let donutOffset = 0;

    return (
        <section className="page" id="dashboard">
            <div className="topbar">
                <div>
                    <div className="crumb">Workspace / Overview</div>
                    <h1>Good evening, Jamie 👋</h1>
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
                                setSelectedMonth("");
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

                    <button className="btn primary" onClick={onAddTransaction}>
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
                    <div className="stat-value">{formatMoney(totalSpent)}</div>
                    <div className="stat-foot">For selected period</div>
                </div>

                <div className="card">
                    <div className="stat-head">
                        Top category <span className="stat-icon">◈</span>
                    </div>
                    <div className="stat-value">
                        {topCategory ? topCategory[0] : "No data"}
                    </div>
                    <div className="stat-foot">
                        {topCategory ? formatMoney(topCategory[1]) : "No expenses recorded"}
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
                <CategoryChart transactions={transactions} />
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
                            onClick={() => onNavigate && onNavigate("transactions")}
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
                                    <th style={{ textAlign: "right" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.note}</td>
                                            <td>{transaction.category}</td>
                                            <td>{formatDate(transaction.date)}</td>
                                            <td className="amount">
                                                {transaction.type === "Income" ? "+" : "-"}
                                                {formatMoney(transaction.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No transactions yet.</td>
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

                    <div className="empty">
                        Savings goals will appear here once connected.
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Dashboard;
