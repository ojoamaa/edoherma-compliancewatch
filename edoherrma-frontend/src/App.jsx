import React, { useEffect, useState } from "react";
import DashboardPage from "./DashboardPage";
import LoginPage from "./LoginPage";
import PersonnelPage from "./PersonnelPage";

const TOKEN_KEY = "edohherma_token";
const USER_TYPE_KEY = "edohherma_user_type";
const API_BASE = "https://edohherrma-compliancewatch.onrender.com";

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
                    userType === "admin" ? "/api/admin/me" : "/api/personnel/me";

                const response = await fetch(`${API_BASE}${endpoint}`, {
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

    const handleLoginSuccess = (accessToken, userProfile, loginType) => {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_TYPE_KEY, loginType);
        setToken(accessToken);
        setUserType(loginType);
        setProfile(userProfile);
        setCheckingAuth(false);
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
                <div style={styles.loadingCard}>Checking session...</div>
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
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "18px",
        padding: "24px 32px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        fontSize: "18px",
        fontWeight: 600,
        color: "#334155",
        maxWidth: 520,
        lineHeight: 1.7,
    },
};