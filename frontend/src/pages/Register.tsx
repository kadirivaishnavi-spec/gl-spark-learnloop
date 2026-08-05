import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/userService";
import { getErrorMessage } from "../services/api";

interface PasswordCheck {
    label: string;
    passed: boolean;
}

function getPasswordChecks(password: string): PasswordCheck[] {
    return [
        { label: "At least 8 characters", passed: password.length >= 8 },
        { label: "One uppercase letter", passed: /[A-Z]/.test(password) },
        { label: "One lowercase letter", passed: /[a-z]/.test(password) },
        { label: "One number", passed: /[0-9]/.test(password) },
        { label: "One special character", passed: /[^A-Za-z0-9]/.test(password) },
    ];
}

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const passwordChecks = getPasswordChecks(password);
    const passwordValid = passwordChecks.every((c) => c.passed);
    const nameValid = name.trim().length > 1;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }
        if (!nameValid) {
            setError("Name must be more than 1 character.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!passwordValid) {
            setError("Password does not meet all the requirements below.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await registerUser({ name: name.trim(), email: email.trim(), password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Create your LearnLoop account</h1>

                {error && <div className="error-message">{error}</div>}
                {success && (
                    <div className="success-message">
                        Account created! Redirecting to login...
                    </div>
                )}

                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading || success}
                />
                {name.length > 0 && !nameValid && (
                    <span className="field-hint field-hint-error">
            Name must be more than 1 character.
          </span>
                )}

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || success}
                />

                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    disabled={loading || success}
                />

                {(passwordFocused || password.length > 0) && (
                    <div className="password-checklist">
                        {passwordChecks.map((check) => (
                            <div
                                key={check.label}
                                className={`password-check-item ${
                                    check.passed ? "password-check-passed" : ""
                                }`}
                            >
                <span className="password-check-icon">
                  {check.passed ? "✓" : "○"}
                </span>
                                {check.label}
                            </div>
                        ))}
                    </div>
                )}

                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading || success}
                />
                {confirmPassword.length > 0 && confirmPassword !== password && (
                    <span className="field-hint field-hint-error">
            Passwords do not match.
          </span>
                )}

                <button type="submit" disabled={loading || success}>
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;