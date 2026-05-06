import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "https://edoherma-compliancewatch-1.onrender.com";

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

const cardStyle = {
    background: theme.card,
    border: `1px solid ${theme.border}`,
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
};

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
}

function MetricCard({ title, value, tone = "default" }) {
    const accentStyles = {
        default: { borderLeft: `5px solid ${theme.primary}` },
        success: { borderLeft: `5px solid ${theme.successText}` },
        warning: { borderLeft: `5px solid ${theme.warningText}` },
        danger: { borderLeft: `5px solid ${theme.dangerText}` },
    };

    return (
        <div style={{ ...styles.metricCard, ...accentStyles[tone] }}>
            <div style={styles.metricTitle}>{title}</div>
            <div style={styles.metricValue}>{value ?? 0}</div>
        </div>
    );
}

function MiniBar({ label, value, total }) {
    const safeValue = Number(value || 0);
    const safeTotal = Number(total || 0);

    const width =
        safeTotal > 0
            ? `${Math.max((safeValue / safeTotal) * 100, safeValue > 0 ? 8 : 0)}%`
            : "0%";

    return (
        <div style={styles.miniBarWrap}>
            <div style={styles.miniBarHeader}>
                <span>{label}</span>
                <span style={styles.miniBarValue}>{safeValue}</span>
            </div>
            <div style={styles.miniBarTrack}>
                <div style={{ ...styles.miniBarFill, width }} />
            </div>
        </div>
    );
}

function StatusBadge({ value }) {
    const normalized = (value || "").toLowerCase();

    const style = {
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        display: "inline-block",
        whiteSpace: "nowrap",
    };

    if (normalized === "active") {
        style.background = theme.successBg;
        style.color = theme.successText;
    } else if (normalized === "expired") {
        style.background = theme.dangerBg;
        style.color = theme.dangerText;
    } else {
        style.background = theme.warningBg;
        style.color = theme.warningText;
    }

    return <span style={style}>{value || "Unknown"}</span>;
}

function SectionTable({ title, columns, rows, emptyMessage }) {
    return (
        <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>{title}</h3>
                <span style={styles.sectionCount}>{rows.length} record(s)</span>
            </div>

            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col} style={styles.th}>
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} style={styles.emptyCell}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            rows.map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                    {row.map((cell, cellIdx) => (
                                        <td key={`${rowIdx}-${cellIdx}`} style={styles.td}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function DashboardPage({ token, admin, onLogout }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [personnelFilter, setPersonnelFilter] = useState("all");
    const [facilityFilter, setFacilityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    async function parseErrorResponse(response) {
        const text = await response.text();

        if (!text) {
            return `Request failed with status ${response.status}`;
        }

        try {
            const json = JSON.parse(text);
            if (typeof json.detail === "string") return json.detail;
            if (typeof json.message === "string") return json.message;
            return text;
        } catch {
            return text;
        }
    }

    const loadDashboard = async ({ silent = false } = {}) => {
        if (!token) {
            setError("Missing admin token.");
            setLoading(false);
            return;
        }

        if (silent) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        try {
            const response = await fetch(`${API_BASE}/api/dashboard/overview`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                const message = await parseErrorResponse(response);
                throw new Error(message || `Dashboard request failed with status ${response.status}`);
            }

            const json = await response.json();
            setData(json);
        } catch (err) {
            setError(err?.message || "Unable to load dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, [token]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadDashboard({ silent: true });
        }, 20000);

        return () => clearInterval(interval);
    }, [token]);

    const allPersonnel = useMemo(() => data?.all_personnel || [], [data]);
    const allFacilities = useMemo(() => data?.all_facilities || [], [data]);
    const expiredPersonnelRaw = useMemo(() => data?.expired_personnel || [], [data]);
    const expiringPersonnelRaw = useMemo(() => data?.expiring_personnel || [], [data]);
    const expiredFacilitiesRaw = useMemo(() => data?.expired_facilities || [], [data]);
    const expiringFacilitiesRaw = useMemo(() => data?.expiring_facilities || [], [data]);

    const searchLower = appliedSearch.trim().toLowerCase();

    const professionOptions = useMemo(() => {
        return Array.from(new Set(allPersonnel.map((item) => item.profession).filter(Boolean))).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [allPersonnel]);

    const lgaOptions = useMemo(() => {
        return Array.from(new Set(allFacilities.map((item) => item.lga).filter(Boolean))).sort(
            (a, b) => a.localeCompare(b)
        );
    }, [allFacilities]);

    const filterPersonnel = (items = []) =>
        items.filter((item) => {
            const name = item.full_name?.toLowerCase() || "";
            const profession = item.profession?.toLowerCase() || "";
            const license = item.license_number?.toLowerCase() || "";
            const facilityName = item.facility_name?.toLowerCase() || "";
            const lga = item.lga?.toLowerCase() || "";
            const status = item.status?.toLowerCase() || "";

            const matchesSearch =
                !searchLower ||
                name.includes(searchLower) ||
                profession.includes(searchLower) ||
                license.includes(searchLower) ||
                facilityName.includes(searchLower) ||
                lga.includes(searchLower);

            const matchesProfession =
                personnelFilter === "all" ||
                profession === personnelFilter.toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return matchesSearch && matchesProfession && matchesStatus;
        });

    const filterFacilities = (items = []) =>
        items.filter((item) => {
            const facilityName = item.facility_name?.toLowerCase() || "";
            const facilityType = item.facility_type?.toLowerCase() || "";
            const lga = item.lga?.toLowerCase() || "";
            const license = item.license_number?.toLowerCase() || "";
            const status = item.status?.toLowerCase() || "";

            const matchesSearch =
                !searchLower ||
                facilityName.includes(searchLower) ||
                facilityType.includes(searchLower) ||
                lga.includes(searchLower) ||
                license.includes(searchLower);

            const matchesLga =
                facilityFilter === "all" ||
                lga === facilityFilter.toLowerCase();

            const matchesStatus =
                statusFilter === "all" ||
                status === statusFilter;

            return matchesSearch && matchesLga && matchesStatus;
        });

    const allFilteredPersonnel = useMemo(
        () => filterPersonnel(allPersonnel),
        [allPersonnel, appliedSearch, personnelFilter, statusFilter]
    );

    const allFilteredFacilities = useMemo(
        () => filterFacilities(allFacilities),
        [allFacilities, appliedSearch, facilityFilter, statusFilter]
    );

    const expiredPersonnel = useMemo(
        () => filterPersonnel(expiredPersonnelRaw),
        [expiredPersonnelRaw, appliedSearch, personnelFilter, statusFilter]
    );

    const expiringPersonnel = useMemo(
        () => filterPersonnel(expiringPersonnelRaw),
        [expiringPersonnelRaw, appliedSearch, personnelFilter, statusFilter]
    );

    const expiredFacilities = useMemo(
        () => filterFacilities(expiredFacilitiesRaw),
        [expiredFacilitiesRaw, appliedSearch, facilityFilter, statusFilter]
    );

    const expiringFacilities = useMemo(
        () => filterFacilities(expiringFacilitiesRaw),
        [expiringFacilitiesRaw, appliedSearch, facilityFilter, statusFilter]
    );

    const exportCsv = (filename, headers, rows) => {
        const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
        const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportJson = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "edoherma-dashboard-overview.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportAllPersonnelCsv = () => {
        exportCsv(
            "all-personnel.csv",
            ["Name", "Profession", "License No.", "Expiry Date", "Status"],
            allFilteredPersonnel.map((x) => [
                x.full_name,
                x.profession,
                x.license_number,
                x.license_expiry_date,
                x.status,
            ])
        );
    };

    const exportAllFacilitiesCsv = () => {
        exportCsv(
            "all-facilities.csv",
            ["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"],
            allFilteredFacilities.map((x) => [
                x.facility_name,
                x.facility_type,
                x.lga,
                x.license_number,
                x.license_expiry_date,
                x.status,
            ])
        );
    };

    const personnelRows = allFilteredPersonnel.map((item) => [
        item.full_name || "-",
        item.profession || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    const facilityRows = allFilteredFacilities.map((item) => [
        item.facility_name || "-",
        item.facility_type || "-",
        item.lga || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    const expiredPersonnelRows = expiredPersonnel.map((item) => [
        item.full_name || "-",
        item.profession || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    const expiringPersonnelRows = expiringPersonnel.map((item) => [
        item.full_name || "-",
        item.profession || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    const expiredFacilityRows = expiredFacilities.map((item) => [
        item.facility_name || "-",
        item.facility_type || "-",
        item.lga || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    const expiringFacilityRows = expiringFacilities.map((item) => [
        item.facility_name || "-",
        item.facility_type || "-",
        item.lga || "-",
        item.license_number || "-",
        formatDate(item.license_expiry_date),
        <StatusBadge value={item.status} />,
    ]);

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.infoBox}>Loading admin dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.container}>
                    <div style={styles.errorBox}>{error}</div>
                </div>
            </div>
        );
    }

    const summary = data?.summary || {
        total_facilities: 0,
        active_facilities: 0,
        expired_facilities: 0,
        expiring_facilities: 0,
        total_personnel: 0,
        active_personnel: 0,
        expired_personnel: 0,
        expiring_personnel: 0,
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.heroCard}>
                    <div style={styles.heroTop}>
                        <div>
                            <div style={styles.pill}>Admin Dashboard</div>
                            <h1 style={styles.title}>EdoHERMA ComplianceWatch</h1>
                            <p style={styles.subtitle}>
                                Welcome, {admin?.full_name || "Administrator"}.
                            </p>
                        </div>

                        <div style={styles.headerButtons}>
                            <button style={styles.secondaryButton} onClick={exportJson}>
                                Export JSON
                            </button>
                            <button style={styles.secondaryButton} onClick={exportAllPersonnelCsv}>
                                Export Personnel
                            </button>
                            <button style={styles.secondaryButton} onClick={exportAllFacilitiesCsv}>
                                Export Facilities
                            </button>
                            <button style={styles.secondaryButton} onClick={onLogout}>
                                Logout
                            </button>
                            <button style={styles.primaryButton} onClick={() => loadDashboard()}>
                                {refreshing ? "Refreshing..." : "Refresh Dashboard"}
                            </button>
                        </div>
                    </div>

                    <div style={styles.filterGrid}>
                        <div style={styles.filterColWide}>
                            <label style={styles.label}>Search records</label>
                            <input
                                style={styles.input}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setAppliedSearch(search);
                                    }
                                }}
                                placeholder="Search by name, profession, facility, license number, or LGA"
                            />
                        </div>

                        <div>
                            <label style={styles.label}>Personnel filter</label>
                            <select
                                style={styles.input}
                                value={personnelFilter}
                                onChange={(e) => setPersonnelFilter(e.target.value)}
                            >
                                <option value="all">All Professions</option>
                                {professionOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Facility filter</label>
                            <select
                                style={styles.input}
                                value={facilityFilter}
                                onChange={(e) => setFacilityFilter(e.target.value)}
                            >
                                <option value="all">All LGAs</option>
                                {lgaOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={styles.label}>Status filter</label>
                            <select
                                style={styles.input}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="expired">Expired</option>
                                <option value="expiring soon">Expiring Soon</option>
                            </select>
                        </div>

                        <div style={styles.actionCol}>
                            <button
                                style={styles.primaryButton}
                                onClick={() => setAppliedSearch(search)}
                            >
                                Search
                            </button>
                            <button
                                style={styles.secondaryButton}
                                onClick={() => {
                                    setSearch("");
                                    setAppliedSearch("");
                                    setPersonnelFilter("all");
                                    setFacilityFilter("all");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div style={styles.metricsGrid}>
                    <MetricCard title="Total Facilities" value={summary.total_facilities} />
                    <MetricCard title="Active Facilities" value={summary.active_facilities} tone="success" />
                    <MetricCard title="Expired Facilities" value={summary.expired_facilities} tone="danger" />
                    <MetricCard title="Expiring Facilities" value={summary.expiring_facilities} tone="warning" />
                </div>

                <div style={styles.metricsGrid}>
                    <MetricCard title="Total Personnel" value={summary.total_personnel} />
                    <MetricCard title="Active Personnel" value={summary.active_personnel} tone="success" />
                    <MetricCard title="Expired Personnel" value={summary.expired_personnel} tone="danger" />
                    <MetricCard title="Expiring Personnel" value={summary.expiring_personnel} tone="warning" />
                </div>

                <div style={styles.twoColGrid}>
                    <div style={styles.sectionCard}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>Compliance Snapshot</h3>
                        </div>

                        <MiniBar
                            label="Active Facilities"
                            value={summary.active_facilities}
                            total={summary.total_facilities}
                        />
                        <MiniBar
                            label="Expired Facilities"
                            value={summary.expired_facilities}
                            total={summary.total_facilities}
                        />
                        <MiniBar
                            label="Active Personnel"
                            value={summary.active_personnel}
                            total={summary.total_personnel}
                        />
                        <MiniBar
                            label="Expired Personnel"
                            value={summary.expired_personnel}
                            total={summary.total_personnel}
                        />
                    </div>

                    <div style={styles.sectionCard}>
                        <div style={styles.sectionHeader}>
                            <h3 style={styles.sectionTitle}>Quick Exports</h3>
                        </div>

                        <div style={styles.exportGrid}>
                            <button
                                style={styles.exportButton}
                                onClick={() =>
                                    exportCsv(
                                        "expired-personnel.csv",
                                        ["Name", "Profession", "License No.", "Expiry Date", "Status"],
                                        expiredPersonnel.map((x) => [
                                            x.full_name,
                                            x.profession,
                                            x.license_number,
                                            x.license_expiry_date,
                                            x.status,
                                        ])
                                    )
                                }
                            >
                                Export Expired Personnel
                            </button>

                            <button
                                style={styles.exportButton}
                                onClick={() =>
                                    exportCsv(
                                        "expiring-personnel.csv",
                                        ["Name", "Profession", "License No.", "Expiry Date", "Status"],
                                        expiringPersonnel.map((x) => [
                                            x.full_name,
                                            x.profession,
                                            x.license_number,
                                            x.license_expiry_date,
                                            x.status,
                                        ])
                                    )
                                }
                            >
                                Export Expiring Personnel
                            </button>

                            <button
                                style={styles.exportButton}
                                onClick={() =>
                                    exportCsv(
                                        "expired-facilities.csv",
                                        ["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"],
                                        expiredFacilities.map((x) => [
                                            x.facility_name,
                                            x.facility_type,
                                            x.lga,
                                            x.license_number,
                                            x.license_expiry_date,
                                            x.status,
                                        ])
                                    )
                                }
                            >
                                Export Expired Facilities
                            </button>

                            <button
                                style={styles.exportButton}
                                onClick={() =>
                                    exportCsv(
                                        "expiring-facilities.csv",
                                        ["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"],
                                        expiringFacilities.map((x) => [
                                            x.facility_name,
                                            x.facility_type,
                                            x.lga,
                                            x.license_number,
                                            x.license_expiry_date,
                                            x.status,
                                        ])
                                    )
                                }
                            >
                                Export Expiring Facilities
                            </button>
                        </div>
                    </div>
                </div>

                <div style={styles.tablesGrid}>
                    <SectionTable
                        title="All Personnel Search Results"
                        columns={["Name", "Profession", "License No.", "Expiry Date", "Status"]}
                        rows={personnelRows}
                        emptyMessage="No personnel matched the current search or filter."
                    />

                    <SectionTable
                        title="All Facilities Search Results"
                        columns={["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"]}
                        rows={facilityRows}
                        emptyMessage="No facilities matched the current search or filter."
                    />

                    <SectionTable
                        title="Expired Personnel"
                        columns={["Name", "Profession", "License No.", "Expiry Date", "Status"]}
                        rows={expiredPersonnelRows}
                        emptyMessage="No expired personnel records found."
                    />

                    <SectionTable
                        title="Expiring Personnel"
                        columns={["Name", "Profession", "License No.", "Expiry Date", "Status"]}
                        rows={expiringPersonnelRows}
                        emptyMessage="No personnel licenses are nearing expiry."
                    />

                    <SectionTable
                        title="Expired Facilities"
                        columns={["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"]}
                        rows={expiredFacilityRows}
                        emptyMessage="No expired facilities found."
                    />

                    <SectionTable
                        title="Expiring Facilities"
                        columns={["Facility", "Type", "LGA", "License No.", "Expiry Date", "Status"]}
                        rows={expiringFacilityRows}
                        emptyMessage="No facilities are nearing expiry."
                    />
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: theme.bg,
        padding: "20px",
        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        color: theme.text,
    },
    container: {
        maxWidth: "1440px",
        margin: "0 auto",
    },
    heroCard: {
        ...cardStyle,
        marginBottom: 18,
        padding: 24,
    },
    heroTop: {
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        alignItems: "flex-start",
        flexWrap: "wrap",
        marginBottom: "20px",
    },
    pill: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        background: theme.primarySoft,
        color: theme.primary,
        fontSize: "12px",
        fontWeight: 700,
        marginBottom: "10px",
    },
    title: {
        margin: 0,
        fontSize: "clamp(30px, 5vw, 44px)",
        lineHeight: 1.05,
        fontWeight: 800,
        color: theme.text,
        letterSpacing: "-1px",
    },
    subtitle: {
        margin: "10px 0 0",
        fontSize: "17px",
        color: theme.muted,
        lineHeight: 1.45,
    },
    headerButtons: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },
    primaryButton: {
        minWidth: "140px",
        minHeight: "44px",
        background: theme.primary,
        color: "#fff",
        border: "none",
        padding: "0 16px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "14px",
    },
    secondaryButton: {
        minWidth: "120px",
        minHeight: "44px",
        background: "#fff",
        color: theme.text,
        border: `1px solid ${theme.border}`,
        padding: "0 16px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
    },
    filterGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
        alignItems: "end",
    },
    filterColWide: {
        minWidth: 0,
        gridColumn: "span 2",
    },
    actionCol: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        alignItems: "end",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        color: theme.muted,
        fontSize: "13px",
        fontWeight: 700,
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
        fontSize: "14px",
        background: "#fff",
        color: theme.text,
        outline: "none",
        boxSizing: "border-box",
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "14px",
        marginBottom: "14px",
    },
    metricCard: {
        ...cardStyle,
        minHeight: "118px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
    },
    metricTitle: {
        color: theme.muted,
        fontSize: "14px",
        fontWeight: 600,
        marginBottom: "10px",
    },
    metricValue: {
        color: theme.text,
        fontSize: "40px",
        fontWeight: 800,
        lineHeight: 1,
    },
    twoColGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "16px",
        marginBottom: "16px",
    },
    sectionCard: {
        ...cardStyle,
        padding: "22px",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: "14px",
    },
    sectionTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 800,
        color: theme.text,
    },
    sectionCount: {
        fontSize: "13px",
        color: theme.muted,
        fontWeight: 700,
        background: "#F8FAFC",
        border: `1px solid ${theme.border}`,
        borderRadius: "999px",
        padding: "6px 10px",
    },
    miniBarWrap: {
        marginBottom: "14px",
    },
    miniBarHeader: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "6px",
        color: theme.muted,
        fontSize: "14px",
    },
    miniBarValue: {
        color: theme.text,
        fontWeight: 700,
    },
    miniBarTrack: {
        width: "100%",
        height: "10px",
        borderRadius: "999px",
        background: "#E2E8F0",
        overflow: "hidden",
    },
    miniBarFill: {
        height: "100%",
        borderRadius: "999px",
        background: theme.primary,
        transition: "width 0.3s ease",
    },
    exportGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "12px",
    },
    exportButton: {
        background: "#fff",
        border: `1px solid ${theme.border}`,
        color: theme.text,
        borderRadius: "12px",
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
        minHeight: "48px",
    },
    tablesGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        gap: "16px",
    },
    tableWrap: {
        overflowX: "auto",
        maxHeight: 360,
        overflowY: "auto",
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
    },
    table: {
        width: "100%",
        minWidth: "500px",
        borderCollapse: "collapse",
        background: "#fff",
    },
    th: {
        position: "sticky",
        top: 0,
        background: "#F8FAFC",
        textAlign: "left",
        padding: "12px 10px",
        color: theme.muted,
        fontWeight: 700,
        fontSize: "13px",
        borderBottom: `1px solid ${theme.border}`,
        zIndex: 1,
    },
    td: {
        padding: "12px 10px",
        color: "#334155",
        fontSize: "14px",
        borderBottom: "1px solid #F1F5F9",
        verticalAlign: "top",
    },
    emptyCell: {
        padding: "24px 10px",
        color: "#94A3B8",
        textAlign: "center",
    },
    infoBox: {
        ...cardStyle,
        maxWidth: "700px",
        margin: "60px auto",
        textAlign: "center",
        fontSize: "18px",
        fontWeight: 600,
        color: "#334155",
    },
    errorBox: {
        maxWidth: "700px",
        margin: "60px auto",
        background: "#FFF1F2",
        border: "1px solid #FECDD3",
        borderRadius: "20px",
        padding: "28px",
        textAlign: "center",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
        fontSize: "18px",
        fontWeight: 600,
        color: "#9F1239",
    },
};