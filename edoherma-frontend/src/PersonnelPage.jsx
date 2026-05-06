import React from "react";

const theme = {
    bg: "#F3F6FB",
    card: "#FFFFFF",
    border: "#E5E7EB",
    text: "#0F172A",
    muted: "#64748B",
    primary: "#1D4ED8",
    primarySoft: "#DBEAFE",
    successBg: "#DCFCE7",
    successText: "#166534",
    warningBg: "#FEF3C7",
    warningText: "#92400E",
    dangerBg: "#FEE2E2",
    dangerText: "#991B1B",
};

function formatDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function StatusBadge({ value, active }) {
    const normalized = (value || "").toLowerCase();

    let badgeStyle = {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        whiteSpace: "nowrap",
    };

    if (active === true || normalized === "active") {
        badgeStyle = {
            ...badgeStyle,
            background: theme.successBg,
            color: theme.successText,
        };
    } else if (normalized === "expired" || active === false) {
        badgeStyle = {
            ...badgeStyle,
            background: theme.dangerBg,
            color: theme.dangerText,
        };
    } else {
        badgeStyle = {
            ...badgeStyle,
            background: theme.warningBg,
            color: theme.warningText,
        };
    }

    return <span style={badgeStyle}>{value || "Unknown"}</span>;
}

function InfoCard({ label, children }) {
    return (
        <div style={styles.infoCard}>
            <div style={styles.label}>{label}</div>
            <div style={styles.value}>{children}</div>
        </div>
    );
}

export default function PersonnelPage({ personnel, onLogout }) {
    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.heroCard}>
                    <div style={styles.topBar}>
                        <div>
                            <div style={styles.badge}>Personnel Portal</div>
                            <h1 style={styles.title}>
                                Welcome, {personnel?.full_name || "Personnel"}
                            </h1>
                            <p style={styles.subtitle}>
                                Your compliance profile and account details.
                            </p>
                        </div>

                        <button onClick={onLogout} style={styles.logoutButton}>
                            Logout
                        </button>
                    </div>

                    <div style={styles.summaryRow}>
                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>License Status</div>
                            <div style={styles.summaryValue}>
                                <StatusBadge value={personnel?.status || "Unknown"} />
                            </div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Account Status</div>
                            <div style={styles.summaryValue}>
                                <StatusBadge
                                    value={personnel?.is_active ? "Active" : "Inactive"}
                                    active={personnel?.is_active}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={styles.grid}>
                        <InfoCard label="Full Name">
                            {personnel?.full_name || "-"}
                        </InfoCard>

                        <InfoCard label="Profession">
                            {personnel?.profession || "-"}
                        </InfoCard>

                        <InfoCard label="Email">
                            {personnel?.email || "-"}
                        </InfoCard>

                        <InfoCard label="License Number">
                            {personnel?.license_number || "-"}
                        </InfoCard>

                        <InfoCard label="Regulatory Body">
                            {personnel?.regulatory_body || "-"}
                        </InfoCard>

                        <InfoCard label="Facility Name">
                            {personnel?.facility_name || "-"}
                        </InfoCard>

                        <InfoCard label="LGA">
                            {personnel?.lga || "-"}
                        </InfoCard>

                        <InfoCard label="Created At">
                            {formatDateTime(personnel?.created_at)}
                        </InfoCard>
                    </div>
                </div>
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
    },
    container: {
        maxWidth: 1280,
        margin: "0 auto",
    },
    heroCard: {
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        marginBottom: 28,
        flexWrap: "wrap",
    },
    badge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: theme.primarySoft,
        color: theme.primary,
        fontWeight: 700,
        fontSize: 12,
        marginBottom: 14,
    },
    logoutButton: {
        background: theme.primary,
        color: "#fff",
        border: "none",
        padding: "12px 16px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700,
        minWidth: 110,
    },
    title: {
        margin: 0,
        fontSize: "clamp(30px, 5vw, 42px)",
        lineHeight: 1.05,
        fontWeight: 800,
        color: theme.text,
        letterSpacing: "-1px",
    },
    subtitle: {
        color: theme.muted,
        fontSize: 17,
        marginTop: 12,
        marginBottom: 0,
        lineHeight: 1.5,
    },
    summaryRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 20,
    },
    summaryCard: {
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 18,
        background: "#FFFFFF",
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: 800,
        color: theme.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 10,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 700,
        color: theme.text,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 18,
    },
    infoCard: {
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 20,
        background: "#FFFFFF",
        minHeight: 96,
    },
    label: {
        fontSize: 12,
        fontWeight: 800,
        color: theme.muted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 10,
    },
    value: {
        fontSize: 20,
        fontWeight: 700,
        color: theme.text,
        wordBreak: "break-word",
        lineHeight: 1.35,
    },
};