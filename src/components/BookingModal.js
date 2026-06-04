import { useState, useEffect } from 'react';
import API from '../api/axios';
import PaymentModal from './PaymentModal';

function BookingModal({ station, onClose, onSuccess }) {
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');
    const [showPayment, setShowPayment] = useState(false);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await API.get(`/slots/station/${station.id}/available`);
                setSlots(res.data);
            } catch (err) {
                setError('Slots not loaded!');
            }
        };

        fetchSlots();
    }, [station.id]);

    const today = new Date().toISOString().split('T')[0];

    const calculateAmount = () => {
        if (!startTime || !endTime) return 0;
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        if (hours <= 0) return 0;
        return (hours * station.pricePerUnit).toFixed(2);
    };

    const handleBooking = async () => {
    if (!selectedSlot || !bookingDate || !startTime || !endTime) {
        setError('fill in all fields!');
        return;
    }
    if (startTime >= endTime) {
        setError('The end time must be later than the start time!');
        return;
    }
    setLoading(true);
    setError('');
    try {
        // Time format fix — seconds added
        const formattedStart = startTime.length === 5
            ? `${startTime}:00`
            : startTime;
        const formattedEnd = endTime.length === 5
            ? `${endTime}:00`
            : endTime;

        const res = await API.post('/bookings', {
            stationId: station.id,
            slotId: selectedSlot.id,
            bookingDate: bookingDate,      // format: 2026-05-30
            startTime: formattedStart,     // format: 10:29:00
            endTime: formattedEnd,         // format: 11:29:00
        });
        setBooking(res.data);
        setStep(2);
    } catch (err) {
        // Exact error message dikhao
        const msg = err.response?.data?.message
            || err.response?.data
            || 'Booking failed!';
        setError(msg);
        console.error('Booking error:', err.response?.data);
    } finally {
        setLoading(false);
    }
    };

    const chargerTypeLabel = (type) => {
        if (type === 'AC_SLOW') return '🔌 AC Slow';
        if (type === 'DC_FAST') return '⚡ DC Fast';
        return '🚀 Superfast';
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.modalHeader}>
                    <h2 style={styles.modalTitle}>⚡ {station.name}</h2>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Steps */}
                <div style={styles.steps}>
                    {['Slot', 'Payment', 'Done'].map((s, i) => (
                        <div key={i} style={styles.stepItem}>
                            <div style={{
                                ...styles.stepCircle,
                                backgroundColor: step > i + 1
                                    ? '#2d6a4f'
                                    : step === i + 1
                                        ? '#40916c'
                                        : '#ccc',
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={styles.stepLabel}>{s}</span>
                        </div>
                    ))}
                </div>

                {error && <p style={styles.error}>{error}</p>}

                {/* Step 1 — Slot Select */}
                {step === 1 && (
                    <div>
                        <h3 style={styles.sectionTitle}>Available Slots</h3>

                        {slots.length === 0 ? (
                            <p style={{ color: '#e63946', textAlign: 'center' }}>
                                😕 No slots available!
                            </p>
                        ) : (
                            <div style={styles.slotsGrid}>
                                {slots.map(slot => (
                                    <div
                                        key={slot.id}
                                        style={{
                                            ...styles.slotCard,
                                            border: selectedSlot?.id === slot.id
                                                ? '2px solid #2d6a4f'
                                                : '1px solid #ddd',
                                            backgroundColor: selectedSlot?.id === slot.id
                                                ? '#d8f3dc'
                                                : 'white',
                                        }}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        <p style={styles.slotNum}>
                                            {slot.slotNumber}
                                        </p>
                                        <p style={styles.slotType}>
                                            {chargerTypeLabel(slot.chargerType)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={styles.dateTimeRow}>
                            <div style={styles.field}>
                                <label>📅 Date</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={bookingDate}
                                    onChange={e => setBookingDate(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.field}>
                                <label>🕐 Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.field}>
                                <label>🕑 End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {startTime && endTime && startTime < endTime && (
                            <div style={styles.amountBox}>
                                <span>💰 Total Amount:</span>
                                <strong style={styles.amount}>
                                    ₹{calculateAmount()}
                                </strong>
                            </div>
                        )}

                        <button
                            style={styles.primaryBtn}
                            onClick={handleBooking}
                            disabled={loading || slots.length === 0}
                        >
                            {loading ? 'Booking...' : '📅 Confirm Booking'}
                        </button>
                    </div>
                )}

                {/* Step 2 — Payment */}
                {step === 2 && booking && (
                    <div style={styles.paymentStep}>
                        <div style={styles.successBox}>
                            <p style={{ fontSize: '3rem' }}>📅</p>
                            <h3 style={{ color: '#2d6a4f' }}>Booking Confirmed!</h3>
                            <p>Make the payment now and your slot will be confirmed.</p>
                            <div style={styles.bookingCard}>
                                <p>⚡ {booking.stationName}</p>
                                <p>📅 {booking.bookingDate}</p>
                                <p>🕐 {booking.startTime} - {booking.endTime}</p>
                                <p style={{ fontWeight: 'bold', color: '#2d6a4f' }}>
                                    💰 ₹{booking.totalAmount}
                                </p>
                            </div>
                            <button
                                style={styles.primaryBtn}
                                onClick={() => setShowPayment(true)}
                            >
                                💳 Proceed to Payment
                            </button>
                        </div>

                        {showPayment && (
                            <PaymentModal
                                booking={booking}
                                onClose={() => setShowPayment(false)}
                                onSuccess={() => {
                                    setShowPayment(false);
                                    setStep(3);
                                }}
                            />
                        )}
                    </div>
                )}

                {/* Step 3 — Final success */}
                {step === 3 && (
                    <div style={styles.successBox}>
                        <p style={{ fontSize: '3rem' }}>🎉</p>
                        <h2 style={{ color: '#2d6a4f' }}>All Done!</h2>
                        <p>Booking + Payment complete!</p>
                        <button
                            style={styles.primaryBtn}
                            onClick={() => { onSuccess(); onClose(); }}
                        >
                            ✓ Done
                        </button>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '90%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    modalTitle: { color: '#2d6a4f', margin: 0 },
    closeBtn: {
        backgroundColor: '#f0f2f5',
        border: 'none',
        borderRadius: '50%',
        width: '35px',
        height: '35px',
        cursor: 'pointer',
        fontSize: '1rem',
    },
    steps: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1.2rem',
        marginBottom: '1rem',
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3rem',
    },
    stepCircle: {
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    stepLabel: { fontSize: '0.75rem', color: '#666' },
    sectionTitle: { color: '#2d6a4f', marginBottom: '1rem' },
    slotsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.8rem',
        marginBottom: '1.5rem',
    },
    slotCard: {
        padding: '0.8rem',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
    },
    slotNum: { fontWeight: 'bold', margin: 0, color: '#1b4332' },
    slotType: { fontSize: '0.8rem', margin: '0.3rem 0 0', color: '#666' },
    dateTimeRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        marginBottom: '0.8rem',
    },
    input: {
        padding: '0.6rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
    },
    amountBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#d8f3dc',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
    },
    amount: { fontSize: '1.5rem', color: '#2d6a4f' },
    primaryBtn: {
        width: '100%',
        padding: '0.9rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
    },
    bookingInfo: { marginBottom: '1.5rem' },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f0f2f5',
    },
    paymentMethods: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.8rem',
        marginBottom: '1rem',
    },
    payMethodBtn: {
        padding: '0.7rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    successBox: { textAlign: 'center', padding: '1rem' },
    paymentStep: {
        textAlign: 'center',
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    bookingCard: {
        backgroundColor: '#d8f3dc',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'left',
        marginBottom: '1rem',
        lineHeight: 2,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '1rem',
        backgroundColor: '#ffe0e0',
        padding: '0.5rem',
        borderRadius: '6px',
    },
};

export default BookingModal;