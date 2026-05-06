import React, { useEffect, useState } from "react";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import PersonnelPage from "./PersonnelPage";

const TOKEN_KEY = "edoherma_token";
const USER_TYPE_KEY = "edoherma_user_type";
const API_BASE = "https://edoherma-compliancewatch-1.onrender.com";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
    const [userType, setUserType] = useState(localStorage.getItem(USER_TYPE_KEY) || "");
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function verifyToken() {
            if (!token || !userType) {
                if (!cancelled) {
                    setProfile(null);
                    setCheckingAuth(false);
                }
                return;
            }

            try {
                const endpoint =
                    userType === "admin"
                        ? "/api/admin/me"
                        : userType === "personnel"
                            ? "/api/personnel/me"
                            : null;

                if (!endpoint) {
                    throw new Error("Unknown user type");
                }

                const response = await fetch(`${API_BASE}${endpoint}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Invalid token for ${userType}`);
                }

                const data = await response.json();

                if (!cancelled) {
                    setProfile(data);
                    setCheckingAuth(false);
                }
            } catch (error) {
                console.error("Session verification failed:", error);

                if (!cancelled) {
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem(USER_TYPE_KEY);
                    setToken("");
                    setUserType("");
                    setProfile(null);
                    setCheckingAuth(false);
                }
            }
        }

        verifyToken();

        return () => {
            cancelled = true;
        };
    }, [token, userType]);

    const handleLoginSuccess = (accessToken, _userProfile, loginType) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_TYPE_KEY, loginType);
        setToken(accessToken);
        setUserType(loginType);
        setProfile(null);
        setCheckingAuth(true);
    };

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
        setToken("");
        setUserType("");
        setProfile(null);
        setCheckingAuth(false);
    };

    if (checkingAuth) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.loadingCard}>
                    <div style={styles.loadingPill}>EdoHERMA ComplianceWatch</div>
                    <h2 style={styles.loadingTitle}>Checking session...</h2>
                    <p style={styles.loadingText}>
                        Please wait while we verify your access and restore your workspace.
                    </p>
                </div>
            </div>
        );
    }

    if (!token || !profile || !userType) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    if (userType === "admin") {
        return (
            <DashboardPage
                token={token}
                admin={profile}
                onLogout={handleLogout}
            />
        );
    }

    if (userType === "personnel") {
        return (
            <PersonnelPage
                personnel={profile}
                onLogout={handleLogout}
            />
        );
    }

    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

const styles = {
    loadingWrap: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F3F6FB",
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        padding: 24,
    },
    loadingCard: {
        width: "100%",
        maxWidth: 560,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        textAlign: "center",
    },
    loadingPill: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "#DBEAFE",
        color: "#1D4ED8",
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 16,
    },
    loadingTitle: {
        margin: 0,
        fontSize: 28,
        fontWeight: 800,
        color: "#0F172A",
        lineHeight: 1.1,
    },
    loadingText: {
        marginTop: 12,
        marginBottom: 0,
        fontSize: 16,
        lineHeight: 1.6,
        color: "#64748B",
    },
};