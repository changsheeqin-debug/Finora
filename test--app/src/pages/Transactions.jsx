
import { useState } from "react";
import { formatMoney } from "../utils/formatMoney";

const categories = [
    "Food", "Transport", "Shopping", "Bills & Utilities",
    "Entertainment", "Health", "Education", "Personal Care",
    "Salary", "Other"
];

const methods = [
    "Cash", "CIMB", "Maybank", "Touch 'n Go eWallet",
    "Credit Card", "Debit Card", "Other"
];

function Transactions({
    transactions,
    currency = "MYR",
    onAddTransaction,
    onEditTransaction,
    onDeleteTransaction
}) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [method, setMethod] = useState("");
    const [type, setType] = useState("");
    const [month, setMonth] = useState("");

    // Apply all selected filters
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.note.toLowerCase().includes(search.toLowerCase()) ||
            transaction.category.toLowerCase().includes(search.toLowerCase()) ||
            transaction.method.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !category || transaction.category === category;
        const matchesMethod = !method || transaction.method === method;
        const matchesType = !type || transaction.type === type;
        const matchesMonth = !month || transaction.date.startsWith(month);

        return matchesSearch && matchesCategory && matchesMethod &&
            matchesType && matchesMonth;
    });

    // Calculate summary amounts using filtered records
    const totalExpenses = filteredTransactions
        .filter((transaction) => transaction.type === "Expenses")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const totalIncome = filteredTransactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((total, transaction) => total + Number(transaction.amount), 0);

    const netCashFlow = totalIncome - totalExpenses;

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setMethod("");
        setType("");
        setMonth("");
    };

    const handleDelete = (transaction) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (confirmed) {
            onDeleteTransaction(transaction.id);
        }
    };

    return (
        <section className="page" id="transactions">
            <div className="topbar">
                <div>
                    <div className="crumb">Workspace / Finance</div>
                    <h1>Transactions</h1>
                    <div className="subtitle">
                        Keep track of every ringgit coming in and going out.
                    </div>
                </div>
                <div className="actions">
                    <button
                        className="btn primary"
                        onClick={onAddTransaction}
                    >
                        ＋ Add transaction<span></span>
                    </button>
                </div>
            </div>

            <div className="grid stats">
                <div className="card">
                    <div className="stat-head">Total expenses</div>
                    <div className="stat-value">{formatMoney(totalExpenses, currency)}</div>
                    <div className="stat-foot">For selected records</div>
                </div>

                <div className="card">
                    <div className="stat-head">Total income</div>
                    <div className="stat-value">{formatMoney(totalIncome, currency)}</div>
                    <div className="stat-foot">For selected records</div>
                </div>

                <div className="card">
                    <div className="stat-head">Net cash flow</div>
                    <div className="stat-value">{formatMoney(netCashFlow, currency)}</div>
                    <div className="stat-foot">Income minus expenses</div>
                </div>
            </div>

            <div className="toolbar">
                <div className="search">
                    <span>⌕</span>
                    <input
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>

                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option value="">All payment methods</option>
                    {methods.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>

                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="">All types</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Income">Income</option>
                </select>

                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">All dates</option>
                    <option value="2026-10">October 2026</option>
                    <option value="2026-09">September 2026</option>
                </select>
            </div>

            <div className="card table-card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Payment method</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th style={{ textAlign: "right" }}>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions
                                    .slice()
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{transaction.note}</td>
                                            <td>{transaction.category}</td>
                                            <td>{transaction.method}</td>
                                            <td>{formatDate(transaction.date)}</td>
                                            <td>{transaction.type}</td>
                                            <td style={{ textAlign: "right" }}>
                                                {formatMoney(transaction.amount, currency)}
                                            </td>
                                            <td>
                                                <button
                                                    className="text-link"
                                                    onClick={() => onEditTransaction(transaction)}
                                                >
                                                    Edit
                                                </button>
                                                {" "}
                                                <button
                                                    className="text-link"
                                                    onClick={() => handleDelete(transaction)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <span>
                        Showing {filteredTransactions.length} transactions
                    </span>
                    <button className="text-link" onClick={clearFilters}>
                        Clear filters
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Transactions;
