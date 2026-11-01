import { useEffect, useState } from "react";

const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills & Utilities",
    "Entertainment",
    "Health",
    "Education",
    "Personal Care",
    "Salary",
    "Other"
];

const methods = [
    "Cash",
    "CIMB",
    "Maybank",
    "Touch 'n Go eWallet",
    "Credit Card",
    "Debit Card",
    "Other"
];

function getCurrentDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000)
        .toISOString()
        .slice(0, 16);
}

function TransactionModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    currency = "MYR"
}) {
    const [formData, setFormData] = useState({
        amount: "",
        date: getCurrentDateTime(),
        type: "Expenses",
        category: "Food",
        method: "Cash",
        note: ""
    });

    // Populate the form when adding or editing
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    amount: initialData.amount,
                    date: initialData.date,
                    type: initialData.type,
                    category: initialData.category,
                    method: initialData.method,
                    note: initialData.note || ""
                });
            } else {
                setFormData({
                    amount: "",
                    date: getCurrentDateTime(),
                    type: "Expenses",
                    category: "Food",
                    method: "Cash",
                    note: ""
                });
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const transaction = {
            ...formData,
            amount: Number(formData.amount)
        };

        if (transaction.amount <= 0) {
            return;
        }

        onSave(transaction);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop open" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-head">
                    <h2>
                        {initialData ? "Edit transaction" : "Add transaction"}
                    </h2>

                    <button
                        type="button"
                        className="icon-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">

                        <div className="field">
                            <label htmlFor="txAmount">
                                    Amount ({currency === "MYR" ? "RM" : currency === "USD" ? "USD ($)" : "SGD ($)"})
                            </label>
                            <input
                                id="txAmount"
                                name="amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="txDate">Date</label>
                            <input
                                id="txDate"
                                name="date"
                                type="datetime-local"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="txType">Type</label>
                            <select
                                id="txType"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="Expenses">Expenses</option>
                                <option value="Income">Income</option>
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="txCategory">Category</label>
                            <select
                                id="txCategory"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="txMethod">Payment method</label>
                            <select
                                id="txMethod"
                                name="method"
                                value={formData.method}
                                onChange={handleChange}
                                required
                            >
                                {methods.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field full">
                            <label htmlFor="txNote">Note</label>
                            <textarea
                                id="txNote"
                                name="note"
                                maxLength="255"
                                placeholder="What was this transaction for?"
                                value={formData.note}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn primary"
                        >
                            Save transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransactionModal;
