import { useState } from 'react';
import { jsPDF } from 'jspdf';
import API from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';

function PaymentModal({ booking, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    // 1=method select, 2=details, 3=processing, 4=success
    const [paymentMethod, setPaymentMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [error, setError] = useState('');
    const [receipt, setReceipt] = useState(null);
    const [processing, setProcessing] = useState(false);
    // UPI QR string — standard format
    const upiString = `upi://pay?pa=evyatra@upi&pn=EVyatra&am=${booking.totalAmount}&cu=INR&tn=EV Charging Booking ${booking.bookingId}`;

    const handlePayment = async () => {
        setProcessing(true);
        setStep(3); // Processing screen

        try {
            // Fake processing delay — realistic feel
            await new Promise(resolve => setTimeout(resolve, 2500));

            const res = await API.post('/payments/pay', {
                bookingId: booking.bookingId,
                paymentMethod,
                upiId: upiId || 'demo@upi',
            });

            setReceipt(res.data);
            setStep(4); // Success
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed!');
            setStep(2);
        } finally {
            setProcessing(false);
        }
    };

    const downloadReceipt = () => {
        if (!receipt) return;

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const margin = 40;
        let y = 60;

        doc.setFontSize(18);
        doc.text('EVyatra Payment Receipt', margin, y);

        y += 28;
        doc.setFontSize(12);
        doc.setTextColor('#2d6a4f');
        doc.text(`Transaction ID: ${receipt.transactionId}`, margin, y);
        y += 20;
        doc.setTextColor('#333');
        doc.text(`Station: ${receipt.stationName}`, margin, y);
        y += 20;
        doc.text(`Booking ID: #${receipt.bookingId}`, margin, y);
        y += 20;
        doc.text(`Payment Method: ${receipt.paymentMethod}`, margin, y);
        y += 20;
        doc.text(`Status: SUCCESS`, margin, y);
        y += 20;
        doc.text(`Date & Time: ${new Date().toLocaleString('en-IN')}`, margin, y);
        y += 20;
        doc.setFontSize(14);
        doc.setTextColor('#2d6a4f');
        doc.text(`Amount Paid: ₹${receipt.amount}`, margin, y);

        y += 40;
        doc.setFontSize(10);
        doc.setTextColor('#666');
        doc.text('Thank you for choosing EVyatra!', margin, y);

        doc.save(`evyatra-receipt-${receipt.transactionId || receipt.bookingId || Date.now()}.pdf`);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <span style={styles.logo}>⚡</span>
                        <div>
                            <h3 style={styles.headerTitle}>EVyatra Pay</h3>
                            <p style={styles.headerSub}>Secure Payment Gateway</p>
                        </div>
                    </div>
                    {step !== 3 && (
                        <button onClick={onClose} style={styles.closeBtn}>✕</button>
                    )}
                </div>

                {/* Amount Banner */}
                {step !== 4 && (
                    <div style={styles.amountBanner}>
                        <p style={styles.amountLabel}>Amount to Pay</p>
                        <h2 style={styles.amountValue}>₹{booking.totalAmount}</h2>
                        <p style={styles.amountSub}>
                            ⚡ {booking.stationName} • Slot {booking.slotNumber}
                        </p>
                    </div>
                )}

                {error && <p style={styles.error}>{error}</p>}

                {/* Step 1 — Method Select */}
                {step === 1 && (
                    <div style={styles.content}>
                        <h3 style={styles.sectionTitle}>
                            Choose Payment Method
                        </h3>
                        <div style={styles.methodsGrid}>
                            {[
                                {
                                    key: 'UPI',
                                    icon: '📱',
                                    label: 'UPI',
                                    sub: 'GPay, PhonePe, Paytm',
                                    color: '#4CAF50',
                                },
                                {
                                    key: 'CARD',
                                    icon: '💳',
                                    label: 'Card',
                                    sub: 'Credit / Debit Card',
                                    color: '#1a73e8',
                                },
                                {
                                    key: 'NETBANKING',
                                    icon: '🏦',
                                    label: 'Net Banking',
                                    sub: 'All major banks',
                                    color: '#9c27b0',
                                },
                                {
                                    key: 'WALLET',
                                    icon: '👛',
                                    label: 'Wallet',
                                    sub: 'Paytm, Amazon Pay',
                                    color: '#ff9800',
                                },
                            ].map(m => (
                                <div
                                    key={m.key}
                                    style={{
                                        ...styles.methodCard,
                                        border: paymentMethod === m.key
                                            ? `2px solid ${m.color}`
                                            : '1px solid #eee',
                                        backgroundColor: paymentMethod === m.key
                                            ? `${m.color}10`
                                            : 'white',
                                    }}
                                    onClick={() => setPaymentMethod(m.key)}
                                >
                                    <span style={styles.methodIcon}>{m.icon}</span>
                                    <p style={{
                                        ...styles.methodLabel,
                                        color: paymentMethod === m.key
                                            ? m.color : '#333',
                                    }}>
                                        {m.label}
                                    </p>
                                    <p style={styles.methodSub}>{m.sub}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            style={{
                                ...styles.proceedBtn,
                                opacity: paymentMethod ? 1 : 0.5,
                            }}
                            onClick={() => paymentMethod && setStep(2)}
                            disabled={!paymentMethod}
                        >
                            Proceed →
                        </button>
                    </div>
                )}

                {/* Step 2 — Payment Details */}
                {step === 2 && (
                    <div style={styles.content}>

                        {paymentMethod === 'UPI' && (
                            <div>
                                <h3 style={styles.sectionTitle}>UPI Payment</h3>

                                <div style={styles.qrBox}>
                                    {/* QR Code for payment */}
                                    <div style={styles.qrWrapper}>
                                        <QRCodeSVG
                                            value={upiString}
                                            size={180}
                                            bgColor="white"
                                            fgColor="#1b4332"
                                            level="H"
                                            includeMargin={true}
                                        />
                                        <div style={styles.qrOverlay}>
                                            <span style={styles.qrLogo}>⚡</span>
                                        </div>
                                    </div>

                                    <p style={styles.qrAmount}>₹{booking.totalAmount}</p>
                                    <p style={styles.qrLabel}>
                                        Scan karo GPay / PhonePe / Paytm se
                                    </p>
                                    <p style={styles.qrNote}>
                                        ⚠️ Demo mode — actual payment nahi hoga
                                    </p>

                                    <div style={styles.upiApps}>
                                        {['G Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                            <span key={app} style={styles.upiApp}>{app}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={styles.orDivider}><span>OR Enter UPI ID</span></div>

                                <div style={styles.field}>
                                    <div style={styles.upiInputRow}>
                                        <input
                                            type="text"
                                            placeholder="yourname@upi"
                                            value={upiId}
                                            onChange={e => setUpiId(e.target.value)}
                                            style={styles.input}
                                        />
                                        <button style={styles.verifyBtn}>Verify</button>
                                    </div>
                                    <p style={styles.demoNote}>
                                        💡 Demo: Type anything like <strong>test@upi</strong>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Card Payment */}
                        {paymentMethod === 'CARD' && (
                            <div>
                                <h3 style={styles.sectionTitle}>
                                    💳 Card Payment
                                </h3>
                                <div style={styles.cardPreview}>
                                    <div style={styles.cardChip}>▣</div>
                                    <p style={styles.cardNumber}>
                                        **** **** **** ****
                                    </p>
                                    <p style={styles.cardName}>DEMO CARD</p>
                                </div>
                                {[
                                    { label: 'Card Number', placeholder: '4111 1111 1111 1111' },
                                    { label: 'Card Holder Name', placeholder: 'Your Name' },
                                ].map((f, i) => (
                                    <div key={i} style={styles.field}>
                                        <label>{f.label}</label>
                                        <input
                                            type="text"
                                            placeholder={f.placeholder}
                                            style={styles.input}
                                        />
                                    </div>
                                ))}
                                <div style={styles.cardRow}>
                                    <div style={styles.field}>
                                        <label>Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.field}>
                                        <label>CVV</label>
                                        <input
                                            type="password"
                                            placeholder="***"
                                            style={styles.input}
                                            maxLength={3}
                                        />
                                    </div>
                                </div>
                                <p style={styles.demoNote}>
                                    💡 Demo: Use any card details
                                </p>
                            </div>
                        )}

                        {/* NetBanking */}
                        {paymentMethod === 'NETBANKING' && (
                            <div>
                                <h3 style={styles.sectionTitle}>
                                    🏦 Select Bank
                                </h3>
                                <div style={styles.banksGrid}>
                                    {[
                                        'SBI', 'HDFC', 'ICICI', 'Axis',
                                        'Kotak', 'PNB', 'BOB', 'Canara',
                                    ].map(bank => (
                                        <div
                                            key={bank}
                                            style={styles.bankCard}
                                            onClick={() => setUpiId(bank)}
                                        >
                                            <span style={styles.bankIcon}>🏦</span>
                                            <p style={styles.bankName}>{bank}</p>
                                        </div>
                                    ))}
                                </div>
                                <p style={styles.demoNote}>
                                    💡 Demo: Select any bank
                                </p>
                            </div>
                        )}

                        {/* Wallet */}
                        {paymentMethod === 'WALLET' && (
                            <div>
                                <h3 style={styles.sectionTitle}>
                                    👛 Select Wallet
                                </h3>
                                <div style={styles.walletsGrid}>
                                    {[
                                        { name: 'Paytm', icon: '💙' },
                                        { name: 'Amazon Pay', icon: '🛒' },
                                        { name: 'Mobikwik', icon: '💜' },
                                        { name: 'Freecharge', icon: '💚' },
                                    ].map(w => (
                                        <div
                                            key={w.name}
                                            style={styles.walletCard}
                                            onClick={() => setUpiId(w.name)}
                                        >
                                            <span style={{ fontSize: '2rem' }}>
                                                {w.icon}
                                            </span>
                                            <p style={styles.bankName}>
                                                {w.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <p style={styles.demoNote}>
                                    💡 Demo: Select any wallet
                                </p>
                            </div>
                        )}

                        <div style={styles.secureRow}>
                            <span>🔒 100% Secure Payment</span>
                            <span>SSL Encrypted</span>
                        </div>

                        <button
                            style={styles.payBtn}
                            onClick={handlePayment}
                            disabled={processing}
                        >
                            💳 Pay ₹{booking.totalAmount}
                        </button>

                        <button
                            style={styles.backBtn}
                            onClick={() => setStep(1)}
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* Step 3 — Processing */}
                {step === 3 && (
                    <div style={styles.processingBox}>
                        <div style={styles.spinner}>⚡</div>
                        <h3 style={styles.processingTitle}>
                            Processing Payment...
                        </h3>
                        <p style={styles.processingSteps}>
                            🔒 Connecting to bank...
                        </p>
                        <div style={styles.progressBar}>
                            <div style={styles.progressFill} />
                        </div>
                        <p style={styles.processingNote}>
                            Please wait, do not close this window
                        </p>
                    </div>
                )}

                {/* Step 4 — Success + Receipt */}
                {step === 4 && receipt && (
                    <div style={styles.receiptBox} id="receipt">

                        {/* Success Banner */}
                        <div style={styles.successBanner}>
                            <div style={styles.successIcon}>✅</div>
                            <h2 style={styles.successTitle}>
                                Payment Successful!
                            </h2>
                            <p style={styles.successAmount}>
                                ₹{receipt.amount}
                            </p>
                        </div>

                        {/* Receipt */}
                        <div style={styles.receipt}>
                            <div style={styles.receiptHeader}>
                                <span style={styles.receiptLogo}>⚡ EVyatra</span>
                                <span style={styles.receiptTitle}>
                                    Payment Receipt
                                </span>
                            </div>

                            <div style={styles.receiptDivider} />

                            {[
                                {
                                    label: 'Transaction ID',
                                    val: receipt.transactionId,
                                    bold: true,
                                },
                                {
                                    label: 'Station',
                                    val: receipt.stationName,
                                },
                                {
                                    label: 'Booking ID',
                                    val: `#${receipt.bookingId}`,
                                },
                                {
                                    label: 'Payment Method',
                                    val: receipt.paymentMethod,
                                },
                                {
                                    label: 'Status',
                                    val: '✅ SUCCESS',
                                    color: 'green',
                                },
                                {
                                    label: 'Date & Time',
                                    val: new Date().toLocaleString('en-IN'),
                                },
                                {
                                    label: 'Amount Paid',
                                    val: `₹${receipt.amount}`,
                                    bold: true,
                                    color: '#2d6a4f',
                                    large: true,
                                },
                            ].map((row, i) => (
                                <div key={i} style={styles.receiptRow}>
                                    <span style={styles.receiptLabel}>
                                        {row.label}
                                    </span>
                                    <span style={{
                                        ...styles.receiptVal,
                                        fontWeight: row.bold ? 'bold' : 'normal',
                                        color: row.color || '#333',
                                        fontSize: row.large ? '1.2rem' : '0.9rem',
                                    }}>
                                        {row.val}
                                    </span>
                                </div>
                            ))}

                            <div style={styles.receiptDivider} />

                            <p style={styles.receiptNote}>
                                ⚡ Thank you for choosing EVyatra!
                                This is a demo payment receipt.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div style={styles.receiptActions}>
                            <button
                                style={styles.printBtn}
                                onClick={downloadReceipt}
                            >
                                📥 Download Receipt
                            </button>
                            <button
                                style={styles.doneBtn}
                                onClick={() => {
                                    onSuccess();
                                    onClose();
                                }}
                            >
                                ✓ Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #f0f2f5',
        backgroundColor: '#1b4332',
        borderRadius: '16px 16px 0 0',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
    logo: { fontSize: '1.8rem' },
    headerTitle: { color: 'white', margin: 0, fontSize: '1.1rem' },
    headerSub: { color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.75rem' },
    closeBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    amountBanner: {
        backgroundColor: '#f8f9fa',
        padding: '1.2rem',
        textAlign: 'center',
        borderBottom: '1px solid #eee',
    },
    amountLabel: { color: '#666', margin: 0, fontSize: '0.85rem' },
    amountValue: {
        color: '#2d6a4f',
        fontSize: '2.2rem',
        fontWeight: 'bold',
        margin: '0.3rem 0',
    },
    amountSub: { color: '#888', margin: 0, fontSize: '0.85rem' },
    content: { padding: '1.5rem' },
    sectionTitle: { color: '#1b4332', marginBottom: '1rem' },
    methodsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.8rem',
        marginBottom: '1.5rem',
    },
    methodCard: {
        padding: '1rem',
        borderRadius: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    methodIcon: { fontSize: '2rem' },
    methodLabel: { fontWeight: 'bold', margin: '0.3rem 0 0', fontSize: '0.9rem' },
    methodSub: { color: '#888', fontSize: '0.75rem', margin: 0 },
    proceedBtn: {
        width: '100%',
        padding: '0.9rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    qrBox: { textAlign: 'center', marginBottom: '1rem' },
    qrWrapper: {
        position: 'relative',
        display: 'inline-block',
        margin: '0 auto',
    },
    qrOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '4px',
        borderRadius: '4px',
    },
    qrLogo: { fontSize: '1.2rem' },
    qrAmount: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#2d6a4f',
        margin: '0.5rem 0 0.2rem',
    },
    qrNote: {
        color: '#e63946',
        fontSize: '0.75rem',
        backgroundColor: '#fff0f0',
        padding: '0.3rem 0.6rem',
        borderRadius: '4px',
        margin: '0.3rem 0',
    },
    qrCode: {
        width: '160px',
        height: '160px',
        border: '3px solid #2d6a4f',
        borderRadius: '12px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        padding: '10px',
        position: 'relative',
        overflow: 'hidden',
    },
    qrInner: { textAlign: 'center', zIndex: 1 },
    qrText: { fontSize: '2rem', margin: 0 },
    qrSub: { fontSize: '0.75rem', color: '#666', margin: 0 },
    qrPattern: {
        position: 'absolute',
        top: 0, left: 0,
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        opacity: 0.1,
    },
    qrLabel: { color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' },
    upiApps: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: '0.5rem',
    },
    upiApp: {
        backgroundColor: '#e8f5e9',
        color: '#2d6a4f',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: 'bold',
    },
    orDivider: {
        textAlign: 'center',
        color: '#999',
        margin: '1rem 0',
        position: 'relative',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginBottom: '0.8rem',
    },
    upiInputRow: { display: 'flex', gap: '0.5rem' },
    input: {
        flex: 1,
        padding: '0.7rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '1rem',
    },
    verifyBtn: {
        padding: '0.7rem 1rem',
        backgroundColor: '#1a73e8',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    demoNote: {
        color: '#888',
        fontSize: '0.8rem',
        backgroundColor: '#fff3cd',
        padding: '0.4rem 0.8rem',
        borderRadius: '6px',
        marginTop: '0.5rem',
    },
    cardPreview: {
        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        color: 'white',
    },
    cardChip: { fontSize: '1.5rem', marginBottom: '0.8rem' },
    cardNumber: { letterSpacing: '3px', fontWeight: 'bold', margin: '0 0 0.5rem' },
    cardName: { opacity: 0.8, fontSize: '0.85rem', margin: 0 },
    cardRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    banksGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    bankCard: {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '0.8rem 0.3rem',
        textAlign: 'center',
        cursor: 'pointer',
    },
    bankIcon: { fontSize: '1.5rem' },
    bankName: { fontSize: '0.75rem', margin: '0.3rem 0 0', color: '#333' },
    walletsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.8rem',
        marginBottom: '1rem',
    },
    walletCard: {
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        cursor: 'pointer',
    },
    secureRow: {
        display: 'flex',
        justifyContent: 'space-between',
        color: '#888',
        fontSize: '0.8rem',
        backgroundColor: '#f8f9fa',
        padding: '0.5rem 0.8rem',
        borderRadius: '6px',
        marginBottom: '1rem',
    },
    payBtn: {
        width: '100%',
        padding: '0.9rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginBottom: '0.5rem',
    },
    backBtn: {
        width: '100%',
        padding: '0.6rem',
        backgroundColor: 'transparent',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    processingBox: {
        padding: '3rem 2rem',
        textAlign: 'center',
    },
    spinner: {
        fontSize: '3rem',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
    },
    processingTitle: { color: '#1b4332', marginTop: '1rem' },
    processingSteps: { color: '#666', fontSize: '0.9rem' },
    progressBar: {
        height: '6px',
        backgroundColor: '#e0e0e0',
        borderRadius: '3px',
        margin: '1rem 0',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#2d6a4f',
        borderRadius: '3px',
        width: '100%',
        animation: 'progress 2.5s ease-in-out',
    },
    processingNote: { color: '#999', fontSize: '0.8rem' },
    receiptBox: { padding: '0' },
    successBanner: {
        background: 'linear-gradient(135deg, #2d6a4f, #52b788)',
        padding: '2rem',
        textAlign: 'center',
        color: 'white',
    },
    successIcon: { fontSize: '3rem' },
    successTitle: { margin: '0.5rem 0' },
    successAmount: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: 0,
    },
    receipt: {
        padding: '1.5rem',
        backgroundColor: '#fafafa',
    },
    receiptHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    receiptLogo: { fontWeight: 'bold', color: '#2d6a4f', fontSize: '1.1rem' },
    receiptTitle: { color: '#666', fontSize: '0.85rem' },
    receiptDivider: {
        borderTop: '1px dashed #ddd',
        margin: '0.8rem 0',
    },
    receiptRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.4rem 0',
        borderBottom: '1px solid #f0f0f0',
    },
    receiptLabel: { color: '#888', fontSize: '0.85rem' },
    receiptVal: { fontSize: '0.9rem', maxWidth: '55%', textAlign: 'right' },
    receiptNote: {
        textAlign: 'center',
        color: '#888',
        fontSize: '0.8rem',
        marginTop: '1rem',
    },
    receiptActions: {
        display: 'flex',
        gap: '0.8rem',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #eee',
    },
    printBtn: {
        flex: 1,
        padding: '0.7rem',
        backgroundColor: '#f0f2f5',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    doneBtn: {
        flex: 1,
        padding: '0.7rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        backgroundColor: '#ffe0e0',
        padding: '0.5rem 1rem',
        margin: '0 1.5rem',
        borderRadius: '6px',
        fontSize: '0.9rem',
    },
};

export default PaymentModal;