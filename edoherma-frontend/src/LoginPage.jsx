import React, { useState } from "react";

const API_BASE = "https://edoherma-compliancewatch-1.onrender.com";

const theme = {
    bg: "#F3F6FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#0F172A",
    muted: "#64748B",
    primary: "#1D4ED8",
    primarySoft: "#DBEAFE",
    dangerBg: "#FEE2E2",
    dangerText: "#991B1B",
};

const DEFAULT_ADMIN = {
    email: "admin@edoherma.com",
    password: "Admin@12345",
};

const DEFAULT_PERSONNEL = {
    email: "osagie@edoherma.com",
    password: "Password123!",
};

export default function LoginPage({ onLoginSuccess }) {
    const [loginType, setLoginType] = useState("admin");
    const [email, setEmail] = useState(DEFAULT_ADMIN.email);
    const [password, setPassword] = useState(DEFAULT_ADMIN.password);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = loginType === "admin";

    function switchToAdmin() {
        setLoginType("admin");
        setEmail(DEFAULT_ADMIN.email);
        setPassword(DEFAULT_ADMIN.password);
        setError("");
    }

    function switchToPersonnel() {
        setLoginType("personnel");
        setEmail(DEFAULT_PERSONNEL.email);
        setPassword(DEFAULT_PERSONNEL.password);
        setError("");
    }

    async function parseErrorResponse(response) {
        const text = await response.text();

        if (!text) {
            return "Request failed";
        }

        try {
            const data = JSON.parse(text);
            if (typeof data.detail === "string") return data.detail;
            if (Array.isArray(data.detail)) return JSON.stringify(data.detail, null, 2);
            if (typeof data.message === "string") return data.message;
            return text;
        } catch {
            return text;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            let loginEndpoint = "";
            let loginOptions = {};

            if (loginType === "admin") {
                loginEndpoint = "/api/admin/login";

                const formData = new URLSearchParams();
                formData.append("username", email.trim());
                formData.append("password", password);

                loginOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: formData.toString(),
                };
            } else {
                loginEndpoint = "/api/personnel/login";

                loginOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                };
            }

            const loginResponse = await fetch(`${API_BASE}${loginEndpoint}`, loginOptions);

            if (!loginResponse.ok) {
                const message = await parseErrorResponse(loginResponse);
                throw new Error(message || "Login failed");
            }

            const loginData = await loginResponse.json();
            const accessToken = loginData.access_token;

            if (!accessToken) {
                throw new Error("No access token returned from server");
            }

            onLoginSuccess(
                accessToken,
                {
                    email: email.trim(),
                    role: loginType,
                },
                loginType
            );
        } catch (err) {
            console.error("Login error:", err);
            setError(err?.message || "Unable to sign in");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.wrapper}>
                <div style={styles.brandBlock}>
                    <div style={styles.pill}>EdoHERMA ComplianceWatch</div>
                    <h1 style={styles.heroTitle}>Compliance monitoring made clearer.</h1>
                    <p style={styles.heroText}>
                        Sign in as an administrator or personnel user to access the live
                        compliance dashboard and profile portal.
                    </p>

                    <div style={styles.infoList}>
                        <div style={styles.infoItem}>Admin dashboard with compliance overview</div>
                        <div style={styles.infoItem}>Personnel profile and license visibility</div>
                        <div style={styles.infoItem}>Search, filters, and export-ready records</div>
                    </div>
                </div>

                <form style={styles.card} onSubmit={handleSubmit}>
                    <div style={styles.switchWrap}>
                        <button
                            type="button"
                            onClick={switchToAdmin}
                            style={{
                                ...styles.switchButton,
                                ...(isAdmin ? styles.switchButtonActive : {}),
                            }}
                        >
                            Admin Login
                        </button>

                        <button
                            type="button"
                            onClick={switchToPersonnel}
                            style={{
                                ...styles.switchButton,
                                ...(!isAdmin ? styles.switchButtonActive : {}),
                            }}
                        >
                            Personnel Login
                        </button>
                    </div>

                    <div style={styles.modeBadge}>
                        {isAdmin ? "Admin Access" : "Personnel Access"}
                    </div>

                    <h2 style={styles.title}>Welcome back</h2>

                    <p style={styles.subtitle}>
                        {isAdmin
                            ? "Sign in as an authorized admin or compliance officer to access the dashboard."
                            : "Sign in as registered personnel to view your compliance profile."}
                    </p>

                    <label style={styles.label}>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        placeholder="Enter email address"
                    />

                    <label style={styles.label}>Password</label>
                    <input
                        style={styles.input}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="Enter password"
                    />

                    {error ? <div style={styles.error}>{error}</div> : null}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading
                            ? "Signing in..."
                            : isAdmin
                                ? "Sign In as Admin"
                                : "Sign In as Personnel"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: theme.bg,
        padding: 20,
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    wrapper: {
        width: "100%",
        maxWidth: 1180,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 520px)",
        gap: 28,
        alignItems: "center",
    },
    brandBlock: {
        padding: "12px 8px",
    },
    pill: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: theme.primarySoft,
        color: theme.primary,
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 16,
    },
    heroTitle: {
        margin: 0,
        fontSize: "clamp(32px, 6vw, 48px)",
        lineHeight: 1.05,
        fontWeight: 800,
        color: theme.text,
        letterSpacing: "-1px",
        maxWidth: 560,
    },
    heroText: {
        marginTop: 16,
        marginBottom: 0,
        color: theme.muted,
        fontSize: 17,
        lineHeight: 1.6,
        maxWidth: 540,
    },
    infoList: {
        marginTop: 24,
        display: "grid",
        gap: 12,
        maxWidth: 520,
    },
    infoItem: {
        background: "#FFFFFF",
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        color: "#334155",
        fontSize: 15,
        fontWeight: 600,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
    },
    card: {
        width: "100%",
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        boxSizing: "border-box",
    },
    switchWrap: {
        display: "flex",
        gap: 12,
        marginBottom: 20,
        flexWrap: "wrap",
    },
    switchButton: {
        flex: 1,
        minWidth: 140,
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        background: "#FFFFFF",
        color: "#334155",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
    },
    switchButtonActive: {
        background: theme.primarySoft,
        color: theme.primary,
        border: "1px solid #93C5FD",
    },
    modeBadge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: theme.primarySoft,
        color: theme.primary,
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 16,
    },
    title: {
        margin: 0,
        fontSize: 30,
        fontWeight: 800,
        color: theme.text,
        lineHeight: 1.1,
    },
    subtitle: {
        color: theme.muted,
        fontSize: 16,
        marginTop: 12,
        marginBottom: 24,
        lineHeight: 1.5,
    },
    label: {
        display: "block",
        marginBottom: 8,
        marginTop: 14,
        fontSize: 14,
        fontWeight: 700,
        color: "#334155",
    },
    input: {
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        fontSize: 16,
        boxSizing: "border-box",
        outline: "none",
        background: "#FFFFFF",
    },
    button: {
        width: "100%",
        marginTop: 22,
        padding: "14px 18px",
        borderRadius: 14,
        border: "none",
        background: theme.primary,
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
    },
    error: {
        marginTop: 16,
        background: theme.dangerBg,
        color: theme.dangerText,
        border: "1px solid #FECACA",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "pre-wrap",
    },
};