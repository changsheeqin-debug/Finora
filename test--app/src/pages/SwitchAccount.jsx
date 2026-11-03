
import { useState } from "react";

function SwitchAccount({
    user,
    accounts = [],
    onBack,
    onSelectAccount,
    onAddAccount,
    onRemoveAccount
}) {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const getInitials = (name = "") =>
        name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    const handleAccountClick = (account) => {
        setSelectedAccount(account);
        setPassword("");
        setError("");
    };

    const handleConfirmSwitch = async (e) => {
        e.preventDefault();

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await onSelectAccount(selectedAccount.email, password);

        } catch (error) {
            setError(error.message || "Unable to switch account.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card switch-account-card">
                <div className="auth-brand">
                    <div className="brand-mark">f.</div>
                    <span>finora</span>
                </div>

                <h1>Switch account</h1>

                <p className="auth-description">
                    Choose an account to continue.
                </p>

                {!selectedAccount ? (
                    <>
                        <div className="account-list">
                            {accounts.map((account) => {
                                const isCurrentAccount =
                                    String(account.userId) ===
                                    String(user?.userId);

                                return (
                                    <div
                                        className="account-card-wrapper"
                                        key={account.userId}
                                    >
                                        <button
                                            type="button"
                                            className={`account-card ${
                                                isCurrentAccount
                                                    ? "current-account"
                                                    : ""
                                            }`}
                                            disabled={isCurrentAccount}
                                            onClick={() =>
                                                handleAccountClick(account)
                                            }
                                        >
                                            <div className="avatar">
                                                {getInitials(account.name)}
                                            </div>

                                            <div className="account-card-info">
                                                <strong>{account.name}</strong>
                                                <small>{account.email}</small>
                                            </div>

                                            {isCurrentAccount ? (
                                                <span className="current-account-label">
                                                    Current
                                                </span>
                                            ) : (
                                                <span className="account-select-arrow">
                                                    ›
                                                </span>
                                            )}
                                        </button>

                                        {!isCurrentAccount && (
                                            <button
                                                type="button"
                                                className="remove-account-button"
                                                title="Remove account"
                                                onClick={() =>
                                                    onRemoveAccount(account.userId)
                                                }
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className="add-account-button"
                            onClick={onAddAccount}
                        >
                            + Add Account
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleConfirmSwitch}>
                        <p className="auth-description">
                            Switching to <strong>{selectedAccount.email}</strong>
                        </p>

                        <label htmlFor="switch-password">
                            Password
                        </label>

                        <input
                            id="switch-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />

                        {error && (
                            <p className="auth-error">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit-button"
                            disabled={loading}
                        >
                            {loading ? "Switching..." : "Continue"}
                        </button>

                        <button
                            type="button"
                            className="auth-back-button"
                            onClick={() => {
                                setSelectedAccount(null);
                                setPassword("");
                                setError("");
                            }}
                        >
                            Back to accounts
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    className="auth-back-button"
                    onClick={onBack}
                >
                    <span className="back-arrow">← </span>
                    Back to Dashboard 
                </button>
            </div>
        </div>
    );
}

export default SwitchAccount;
