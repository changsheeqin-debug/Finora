import { useState } from "react";
import {
    requestPasswordReset,
    resetPassword
} from "../services/api";

function ForgotPassword({ resetToken, onBackToLogin }) {
    const [mode, setMode] = useState(resetToken ? "reset" : "request");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (mode === "reset" && password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            if (mode === "reset") {
                const data = await resetPassword(resetToken, password);
                setSuccess(data.message);
                window.history.replaceState({}, "", window.location.pathname);
                setMode("complete");
            } else {
                const data = await requestPasswordReset(email);
                setSuccess(data.message);
            }
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    const isResetMode = mode === "reset";

    return (
        <div className="auth-page">
            <div className="auth-card login-card">
                <div className="auth-brand">
                    <div className="brand-mark">f.</div>
                    <span>finora</span>
                </div>

                <h1>
                    {mode === "complete"
                        ? "Password updated"
                        : isResetMode
                            ? "Choose a new password"
                            : "Forgot your password?"}
                </h1>
                <p className="auth-description">
                    {mode === "complete"
                        ? "Your password has been changed. Sign in with your new password."
                        : isResetMode
                            ? "Choose a new password for your Finora account."
                            : "Enter your email and we'll send you a link to reset your password."}
                </p>

                {mode !== "complete" && (
                    <form onSubmit={handleSubmit}>
                        {!isResetMode ? (
                            <>
                                <label htmlFor="reset-email">Email address</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor="new-password">New password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    minLength={8}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    required
                                />

                                <label htmlFor="confirm-password">Confirm new password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Re-enter your new password"
                                    minLength={8}
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                />
                            </>
                        )}

                        {error && <p className="auth-error">{error}</p>}
                        {success && <p className="auth-success">{success}</p>}

                        <button
                            type="submit"
                            className="auth-submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Please wait..."
                                : isResetMode
                                    ? "Reset Password"
                                    : "Send Reset Link"}
                        </button>
                    </form>
                )}

                {mode === "complete" ? (
                    <button
                        type="button"
                        className="auth-submit-button"
                        onClick={onBackToLogin}
                    >
                        Back to Sign In
                    </button>
                ) : (
                    <button
                        type="button"
                        className="auth-back-button"
                        onClick={onBackToLogin}
                    >
                        Back to Sign In
                    </button>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
