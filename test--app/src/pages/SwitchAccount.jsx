
import { useState } from "react";

function SwitchAccount({ user, onBack, onSelectAccount, onAddAccount }) {
    const [accounts] = useState([
        {
            id: 1,
            name: "Jamie Doe",
            email: "jamie@example.com"
        },
        {
            id: 2,
            name: "Alex Tan",
            email: "alex@example.com"
        }
    ]);

    const getInitials = (name) =>
        name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    return (
        <div className="auth-page">
            <div className="auth-card switch-account-card">
                <div className="auth-brand">
                    <div className="brand-mark">f.</div>
                    <span>finora</span>
                </div>

                <h1>Switch account</h1>
                <p className="auth-description">
                    Choose an account to continue to Finora.
                </p>

                <div className="account-list">
                    {accounts.map((account) => {
                        const isCurrent = account.email === user.email;

                        return (
                            <button
                                key={account.id}
                                className={`account-card ${
                                    isCurrent ? "current-account" : ""
                                }`}
                                onClick={() => onSelectAccount(account)}
                            >
                                <div className="avatar">
                                    {getInitials(account.name)}
                                </div>

                                <div className="account-card-info">
                                    <strong>{account.name}</strong>
                                    <small>{account.email}</small>
                                </div>

                                {isCurrent && (
                                    <span className="account-check">
                                        Signed In
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>


                <button
                    className="add-account-button"
                    onClick={onAddAccount}
                >
                    + Add another account
                </button>

                <button className="auth-back-button" onClick={onBack}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default SwitchAccount;
