import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";


export default function PublicVerifyPage({ onBack }) {
    const [licenseNumber, setLicenseNumber] = useState("MDCN-1001");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const isVerified = result && result.verified === true;

    function handlePrint() {
        window.print();
    }
    const verifyUrl = result
        ? `${window.location.origin}/?verify=${result.license_number}`
        : "";

    
    async function verifyLicense(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(
                `${API_BASE}/api/public/verify/${licenseNumber.trim()}`
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "License verification failed");
            }

            setResult(data);
        } catch (err) {
            setError(err.message || "Unable to verify license");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.badge}>Public Verification</div>
                <h1 style={styles.title}>Verify Professional License</h1>
                <p style={styles.subtitle}>
                    Search by license number to confirm personnel compliance status.
                </p>

                <form onSubmit={verifyLicense} style={styles.form}>
                    <input
                        style={styles.input}
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="Enter license number e.g. MDCN-1001"
                    />
                    <button style={styles.button} disabled={loading}>
                        {loading ? "Verifying..." : "Verify License"}
                    </button>
                </form>

                {error && <div style={styles.error}>{error}</div>}

                {result && (
                    <div className="print-area" style={styles.resultCard}>
                        <h2 style={styles.resultTitle}>License Verified</h2>

                        <p><strong>Name:</strong> {result.full_name}</p>
                        <p><strong>Profession:</strong> {result.profession}</p>
                        <p><strong>License No:</strong> {result.license_number}</p>
                        <p><strong>Regulatory Body:</strong> {result.regulatory_body}</p>
                        <p><strong>Status:</strong> {result.status}</p>
                        <p><strong>Expiry Date:</strong> {result.license_expiry_date}</p>
                        <p><strong>Facility:</strong> {result.facility_name}</p>
                        <p><strong>LGA:</strong> {result.lga}</p>
                        <p><strong>Message:</strong> {result.message}</p>

                        <div style={styles.qrBox}>
                            <QRCodeCanvas
                                value={verifyUrl}
                                size={100}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                level="H"
                            />

                            <p style={styles.qrText}>
                                Scan QR code to verify this license record.
                            </p>
                        </div>
                    </div>
                )}
                {isVerified && (
                    <button
                        className="no-print"
                        style={styles.printButton}
                        onClick={handlePrint}
                    >
                        Print Verification Certificate
                    </button>
                )}

                <button className="no-print" style={styles.backButton} onClick={onBack}>
                    Back to Login
                </button>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#F3F6FB",
        padding: "16px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
    },

    card: {
        width: "100%",
        maxWidth: 720,
        background: "#FFFFFF",
        borderRadius: 24,
        padding: "clamp(20px, 5vw, 32px)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
        border: "1px solid #E5E7EB",
        marginTop: "clamp(20px, 6vh, 60px)",
        boxSizing: "border-box",
    },

    badge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: 999,
        background: "#DBEAFE",
        color: "#1D4ED8",
        fontWeight: 700,
        marginBottom: 14,
    },

    title: {
        margin: 0,
        fontSize: "clamp(32px, 8vw, 46px)",
        lineHeight: 1.1,
        color: "#0F172A",
    },

    subtitle: {
        color: "#64748B",
        fontSize: 16,
        lineHeight: 1.6,
    },

    form: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 22,
    },

    input: {
        flex: 1,
        minWidth: 0,
        width: "100%",
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        fontSize: 16,
        boxSizing: "border-box",
    },

    button: {
        padding: "14px 18px",
        borderRadius: 14,
        border: "none",
        background: "#1D4ED8",
        color: "#FFFFFF",
        fontWeight: 700,
        cursor: "pointer",
        minWidth: 160,
    },

    error: {
        marginTop: 18,
        background: "#FEE2E2",
        color: "#991B1B",
        padding: 14,
        borderRadius: 12,
        fontWeight: 700,
    },

    resultCard: {
        marginTop: 24,
        padding: "clamp(18px, 4vw, 22px)",
        borderRadius: 18,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        color: "#334155",
        lineHeight: 1.7,
        overflowWrap: "break-word",
    },

    resultTitle: {
        marginTop: 0,
        color: "#166534",
    },

    qrBox: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        overflow: "hidden",
    },

    qrText: {
        margin: 0,
        color: "#64748B",
        fontSize: 14,
        fontWeight: 600,
    },

    printButton: {
        marginTop: 20,
        marginRight: 10,
        background: "#166534",
        color: "#FFFFFF",
        border: "none",
        borderRadius: 14,
        padding: "14px 18px",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 15,
    },

    backButton: {
        marginTop: 20,
        background: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: 14,
        padding: "12px 16px",
        cursor: "pointer",
        fontWeight: 700,
    },
};