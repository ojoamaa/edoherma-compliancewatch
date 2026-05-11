import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";


export default function PublicVerifyPage({ onBack }) {
    const [licenseNumber, setLicenseNumber] = useState("MDCN-1001");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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
                <button
                    className="no-print"
                    style={styles.printButton}
                    onClick={handlePrint}
                >
                    Print Verification Certificate
                </button>

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
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
    },

    card: {
        width: "100%",
        maxWidth: 720,
        background: "#FFFFFF",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
        border: "1px solid #E5E7EB",
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
        fontSize: "clamp(30px, 6vw, 46px)",
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
        minWidth: 240,
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid #CBD5E1",
        fontSize: 16,
    },

    button: {
        padding: "14px 18px",
        borderRadius: 14,
        border: "none",
        background: "#1D4ED8",
        color: "#FFFFFF",
        fontWeight: 700,
        cursor: "pointer",
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
        padding: 22,
        borderRadius: 18,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        color: "#334155",
        lineHeight: 1.7,
    },

    resultTitle: {
        marginTop: 0,
        color: "#166534",
    },

    qrBox: {
        marginTop: 20,
        padding: 18,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
    },

       qrText: {
        margin: 0,
        color: "#64748B",
        fontSize: 14,
        fontWeight: 600,
    },

    printButton: {
        marginTop: 20,
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
        marginTop: 22,
        background: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: 14,
        padding: "12px 16px",
        cursor: "pointer",
        fontWeight: 700,
    },
};

const printStyle = document.createElement("style");
printStyle.innerHTML = `
@media print {
  html, body {
    width: 210mm;
    height: 297mm;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: white !important;
  }

  body * {
    visibility: hidden !important;
  }

  .print-area, .print-area * {
    visibility: visible !important;
  }

  .print-area {
    position: fixed !important;
    left: 12mm !important;
    top: 12mm !important;
    width: 186mm !important;
    max-height: 260mm !important;
    overflow: hidden !important;
    background: white !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .no-print {
    display: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 0;
  }
}
`;
document.head.appendChild(printStyle);