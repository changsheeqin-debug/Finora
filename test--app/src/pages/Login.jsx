
import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            return;
        }

        try {
            setError("");
            setLoading(true);

            // Call backend login API
            const data = await loginUser(email, password);

            // Save JWT token
            localStorage.setItem("token", data.token);

            // Pass authenticated user to App.jsx
            onLogin(data.user);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card login-card">
                <div className="auth-brand">
                    <div className="brand-mark">f.</div>
                    <span>finora</span>
                </div>

                <h1>Welcome back</h1>
                <p className="auth-description">
                    Sign in to manage your personal finances.
                </p>

                <form onSubmit={handleSubmit}>
                    <label>Email address</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <small className="auth-note">
                    Securely sign in to your Finora account.
                </small>
            </div>
        </div>
    );
}

export default Login;
