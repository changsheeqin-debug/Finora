
function SwitchAccount({ user, onBack, onAddAccount }) {
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
                    Choose an account to continue.
                </p>

                <div className="account-list">
                    {user && (
                        <div className="account-card current-account">
                            <div className="avatar">
                                {getInitials(user.name)}
                            </div>

                            <div className="account-card-info">
                                <strong>{user.name}</strong>
                                <small>{user.email}</small>
                            </div>

                            <span className="current-account-label">
                                Current
                            </span>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="add-account-button"
                    onClick={onAddAccount}
                >
                    + Add Account
                </button>

                <button
                    type="button"
                    className="auth-back-button"
                    onClick={onBack}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default SwitchAccount;
