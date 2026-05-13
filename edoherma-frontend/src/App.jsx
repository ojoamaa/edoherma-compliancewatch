import React, { useEffect, useState } from "react";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import PersonnelPage from "./PersonnelPage";
import PublicVerifyPage from "./PublicVerifyPage";

const TOKEN_KEY = "edoherma_token";
const USER_TYPE_KEY = "edoherma_user_type";
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function App() {
    const [page, setPage] = useState("login");
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
                if (userType === "admin") {
                    setProfile({ full_name: "Administrator" });
                    setCheckingAuth(false);
                    setPage("dashboard");
                    return;
                }

                const endpoint = userType === "personnel" ? "/api/personnel/me" : null;

                if (!endpoint) throw new Error("Unknown user type");

                const response = await fetch(`${API_BASE}${endpoint}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error(`Invalid token for ${userType}`);

                const data = await response.json();

                if (!cancelled) {
                    setProfile(data);
                    setCheckingAuth(false);
                    setPage("dashboard");
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
                    setPage("login");
                }
            }
        }

        verifyToken();

        return () => {
            cancelled = true;
        };
    }, [token, userType]);

    const path = window.location.pathname;

    if (path.startsWith("/verify/")) {
        const licenseFromUrl = decodeURIComponent(path.replace("/verify/", ""));

        return (
            <PublicVerifyPage
                initialLicenseNumber={licenseFromUrl}
                onBack={() => {
                    window.history.pushState({}, "", "/");
                    window.location.reload();
                }}
            />
        );
    }

    const handleLoginSuccess = (accessToken, _userProfile, loginType) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_TYPE_KEY, loginType);
        setToken(accessToken);
        setUserType(loginType)
            ;
        setProfile(loginType === "admin"
            ? { full_name: "Administrator" }
            : null);

        setCheckingAuth(loginType !== "admin");
        setPage("dashboard");
    };

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_TYPE_KEY);

        setToken("");
        setUserType("");
        setProfile(null);
        setCheckingAuth(false);
        setPage("login");
    };

    if (checkingAuth) {
        return (
            <div style={styles.loadingWrap}>
                <div style={styles.loadingCard}>
                    <div style={styles.loadingPill}>
                        EdoHERMA ComplianceWatch
                    </div>

                    <h2 style={styles.loadingTitle}>
                        Checking session...
                    </h2>
                </div>
            </div>
        );
    }

    if (page === "verify") {
        return (
            <PublicVerifyPage
                onBack={() => setPage("login")}
            />
        );
    }

    if (!token || !profile || !userType) {
        return (
            <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onOpenVerify={() => setPage("verify")}
            />
        );
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

    return (
        <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onOpenVerify={() => setPage("verify")}
        />
    );
}

const styles = {
    loadingWrap: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F3F6FB",
        fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        padding: 24,
    },

    loadingCard: {
        width: "100%",
        maxWidth: 420,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 24,
        padding: 28,
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
        marginBottom: 12,
    },

    loadingTitle: {
        margin: 0,
        fontSize: 24,
        fontWeight: 800,
        color: "#0F172A",
    },
};