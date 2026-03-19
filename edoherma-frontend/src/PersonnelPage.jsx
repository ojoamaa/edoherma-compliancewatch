import React from "react";

export default function PersonnelPage({ personnel, onLogout }) {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.topBar}>
                    <div style={styles.badge}>Personnel Portal</div>
                    <button onClick={onLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>

                <h1 style={styles.title}>
                    Welcome, {personnel?.full_name || "Personnel"}
                </h1>

                <p style={styles.subtitle}>
                    Your compliance profile and account details.
                </p>

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

                <div style={styles.noteBox}>
                    <strong>Next step</strong>
                    <p style={styles.noteText}>
                        Personnel login is now working. This page is the starting point
                        for the personnel dashboard. Next, we can expand it to show
                        facility name, LGA, license number, expiry date, and compliance status.
                    </p>
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
    },
    card: {
        maxWidth: 1100,
        margin: "0 auto",
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    badge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "#DBEAFE",
        color: "#1D4ED8",
        fontWeight: 700,
        fontSize: 12,
    },
    logoutButton: {
        background: "#1D4ED8",
        color: "#fff",
        border: "none",
        padding: "12px 16px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700,
    },
    title: {
        margin: 0,
        fontSize: 28,
        fontWeight: 800,
        color: "#0F172A",
    },
    subtitle: {
        color: "#64748B",
        fontSize: 16,
        marginTop: 10,
        marginBottom: 24,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 18,
        marginBottom: 24,
    },
    infoCard: {
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 20,
        background: "#FFFFFF",
    },
    label: {
        fontSize: 12,
        fontWeight: 800,
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8,
    },
    value: {
        fontSize: 18,
        fontWeight: 700,
        color: "#0F172A",
    },
    noteBox: {
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 20,
        background: "#FFFFFF",
    },
    noteText: {
        marginTop: 10,
        color: "#475569",
        lineHeight: 1.7,
    },
};
