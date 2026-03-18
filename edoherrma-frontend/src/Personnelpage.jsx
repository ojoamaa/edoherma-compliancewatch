import React from "react";

export default function PersonnelPage({ personnel, onLogout }) {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.topRow}>
                    <div>
                        <div style={styles.pill}>Personnel Portal</div>
                        <h1 style={styles.title}>Welcome, {personnel?.full_name || "Personnel"}</h1>
                        <p style={styles.subtitle}>
                            Your compliance profile and account details.
                        </p>
                    </div>

                    <button onClick={onLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>

                <div style={styles.grid}>
                    <div style={styles.infoCard}>
                        <div style={styles.label}>Full Name</div>
                        <div style={styles.value}>{personnel?.full_name || "-"}</div>
                    </div>

                    <div style={styles.infoCard}>
                        <div style={styles.label}>Profession</div>
                        <div style={styles.value}>{personnel?.profession || "-"}</div>
                    </div>

                    <div style={styles.infoCard}>
                        <div style={styles.label}>Email</div>
                        <div style={styles.value}>{personnel?.email || "-"}</div>
                    </div>

                    <div style={styles.infoCard}>
                        <div style={styles.label}>Account Status</div>
                        <div style={styles.value}>
                            {personnel?.is_active ? "Active" : "Inactive"}
                        </div>
                    </div>
                </div>

                <div style={styles.noticeCard}>
                    <div style={styles.noticeTitle}>Next step</div>
                    <div style={styles.noticeText}>
                        Personnel login is now working. This page is the starting point for the
                        personnel dashboard. Next, we can expand it to show facility name, LGA,
                        license number, expiry date, and compliance status.
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F3F6FB",
        padding: 24,
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    card: {
        width: "100%",
        maxWidth: 1100,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: 28,
    },
    pill: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "#DBEAFE",
        color: "#1D4ED8",
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 16,
    },
    title: {
        margin: 0,
        fontSize: 34,
        fontWeight: 800,
        color: "#0F172A",
        lineHeight: 1.1,
    },
    subtitle: {
        color: "#64748B",
        fontSize: 16,
        marginTop: 10,
        marginBottom: 0,
    },
    logoutButton: {
        background: "#1D4ED8",
        color: "#FFFFFF",
        border: "none",
        padding: "12px 18px",
        borderRadius: 14,
        cursor: "pointer",
        fontWeight: 700,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 18,
        marginBottom: 24,
    },
    infoCard: {
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 20,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
    },
    label: {
        fontSize: 13,
        fontWeight: 700,
        color: "#64748B",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
    },
    value: {
        fontSize: 20,
        fontWeight: 700,
        color: "#0F172A",
        lineHeight: 1.4,
        wordBreak: "break-word",
    },
    noticeCard: {
        background: "#F8FAFC",
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 20,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: 800,
        color: "#0F172A",
        marginBottom: 8,
    },
    noticeText: {
        fontSize: 15,
        color: "#475569",
        lineHeight: 1.6,
    },
};
