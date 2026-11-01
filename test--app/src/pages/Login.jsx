
import { useState } from "react";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            return;
        }

        onLogin(email);
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

                    <button type="submit" className="auth-submit-button">
                        Sign In
                    </button>
                </form>

                <small className="auth-note">
                    Demo sign-in only. Authentication will be connected later.
                </small>
            </div>
        </div>
    );
}

export default Login;
