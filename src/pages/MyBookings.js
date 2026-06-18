import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [reviewModal, setReviewModal] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const navigate = useNavigate();
    const [reviewedStations, setReviewedStations] = useState({});

useEffect(() => {
    fetchBookings();
}, []);

const fetchBookings = async () => {
    try {
        const res = await API.get('/bookings/my');
        setBookings(res.data);

        // Check the review status for every confirmed booking.
        const confirmedBookings = res.data.filter(b => b.status === 'CONFIRMED');
        const reviewChecks = {};

        for (const booking of confirmedBookings) {
            try {
                const checkRes = await API.get(`/reviews/check/${booking.stationId}`);
                reviewChecks[booking.stationId] = checkRes.data.hasReviewed;
            } catch (err) {
                reviewChecks[booking.stationId] = false;
            }
        }
        setReviewedStations(reviewChecks);
    } catch (err) {
        setMessage('Bookings did not load!');
    } finally {
        setLoading(false);
    }
};

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Do you want to cancel the booking?')) return;
        try {
            await API.put(`/bookings/${bookingId}/cancel`);
            setMessage('✅ The booking got cancelled! ');
            fetchBookings();
        } catch (err) {
            setMessage('❌ Not Cancelled !');
        }
    };

    const submitReview = async () => {
    if (rating === 0) {
        alert('Select a rating!');
        return;
    }
    setReviewLoading(true);
    try {
        await API.post('/reviews', {
            stationId: reviewModal.stationId,
            bookingId: reviewModal.bookingId,
            rating: rating,
            comment: comment,
        });
        setMessage('✅ Review submitted! ');
        setReviewModal(null);
        setRating(0);
        setComment('');
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'The review was not submitted!';

        if (errorMsg.includes('already')) {
            setMessage('ℹ️ You have already reviewed this station! ');
        } else {
            setMessage('❌ ' + errorMsg);
        }
        setReviewModal(null);
    } finally {
        setReviewLoading(false);
    }
};

    const getStatusStyle = (status) => {
        switch (status) {
            case 'CONFIRMED': return styles.statusConfirmed;
            case 'PENDING': return styles.statusPending;
            case 'CANCELLED': return styles.statusCancelled;
            case 'COMPLETED': return styles.statusCompleted;
            default: return styles.statusPending;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'CONFIRMED': return '✅';
            case 'PENDING': return '⏳';
            case 'CANCELLED': return '❌';
            case 'COMPLETED': return '🎉';
            default: return '⏳';
        }
    };

    if (loading) return (
        <div style={styles.loadingBox}>
            <p style={{ fontSize: '2rem' }}>⚡</p>
            <p>Loading bookings...</p>
        </div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>📅 My Bookings</h1>
                <p style={styles.headerSub}>
                    Your EV charging bookings
                </p>
            </div>

            <div style={styles.content}>

                {message && (
                    <p style={{
                        ...styles.message,
                        color: message.includes('✅') ? 'green' : 'red',
                        backgroundColor: message.includes('✅')
                            ? '#d8f3dc' : '#ffe0e0',
                    }}>
                        {message}
                    </p>
                )}

                {/* Stats */}
                <div style={styles.statsRow}>
                    {[
                        { label: 'Total', val: bookings.length, icon: '📅', color: '#1a73e8' },
                        { label: 'Confirmed', val: bookings.filter(b => b.status === 'CONFIRMED').length, icon: '✅', color: '#2d6a4f' },
                        { label: 'Pending', val: bookings.filter(b => b.status === 'PENDING').length, icon: '⏳', color: '#f4a261' },
                        { label: 'Cancelled', val: bookings.filter(b => b.status === 'CANCELLED').length, icon: '❌', color: '#e63946' },
                    ].map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <span style={styles.statIcon}>{s.icon}</span>
                            <p style={{ ...styles.statNum, color: s.color }}>{s.val}</p>
                            <p style={styles.statLabel}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Bookings */}
                {bookings.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={{ fontSize: '3rem' }}>📭</p>
                        <h3>There are no bookings! </h3>
                        <button
                            style={styles.findBtn}
                            onClick={() => navigate('/stations')}
                        >
                            🔍 Find Stations
                        </button>
                    </div>
                ) : (
                    <div style={styles.bookingsList}>
                        {bookings.map(booking => (
                            <div key={booking.bookingId} style={styles.bookingCard}>

                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={styles.stationName}>
                                            ⚡ {booking.stationName}
                                        </h3>
                                        <p style={styles.slotInfo}>
                                            🔌 Slot: {booking.slotNumber} — {booking.chargerType}
                                        </p>
                                    </div>
                                    <span style={getStatusStyle(booking.status)}>
                                        {getStatusIcon(booking.status)} {booking.status}
                                    </span>
                                </div>

                                <div style={styles.cardBody}>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>📅 Date</span>
                                            <span style={styles.infoVal}>{booking.bookingDate}</span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>🕐 Time</span>
                                            <span style={styles.infoVal}>
                                                {booking.startTime} - {booking.endTime}
                                            </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>💰 Amount</span>
                                            <span style={{
                                                ...styles.infoVal,
                                                color: '#2d6a4f',
                                                fontWeight: 'bold',
                                            }}>
                                                ₹{booking.totalAmount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    {(booking.status === 'PENDING' ||
                                        booking.status === 'CONFIRMED') && (
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() => cancelBooking(booking.bookingId)}
                                        >
                                            ❌ Cancel
                                        </button>
                                    )}

                                    {/* Review Button — CONFIRMED booking pe */}
                                    {booking.status === 'CONFIRMED' && !reviewedStations[booking.stationId] && (
                                    <button
                                    style={styles.reviewBtn}
                                    onClick={() => setReviewModal({
                                    bookingId: booking.bookingId,
                                    stationId: booking.stationId,
                                    stationName: booking.stationName,
                                    })}
                                    >
                                        ⭐ Write Review
                                    </button>
                                    )}

                                {booking.status === 'CONFIRMED' && reviewedStations[booking.stationId] && (
                                    <span style={{ color: '#888', fontSize: '0.85rem', padding: '0.5rem' }}>
                                    ✅ Reviewed
                                    </span>
                                )}

                                    <button
                                        style={styles.stationsBtn}
                                        onClick={() => navigate('/stations')}
                                    >
                                        🔍 Book Another
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ color: '#2d6a4f', margin: 0 }}>
                                ⭐ Review — {reviewModal.stationName}
                            </h3>
                            <button
                                style={styles.closeBtn}
                                onClick={() => {
                                    setReviewModal(null);
                                    setRating(0);
                                    setComment('');
                                }}
                            >✕</button>
                        </div>

                        {/* Star Rating */}
                        <div style={styles.starRow}>
                            <p style={{ color: '#555', marginBottom: '0.5rem' }}>
                                Rating do:
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        style={{
                                            fontSize: '2.5rem',
                                            cursor: 'pointer',
                                            color: star <= rating ? '#f4a261' : '#ddd',
                                            transition: 'color 0.2s',
                                        }}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p style={{ color: '#888', fontSize: '0.85rem' }}>
                                {rating === 1 ? '😞 Poor'
                                    : rating === 2 ? '😐 Fair'
                                    : rating === 3 ? '🙂 Good'
                                    : rating === 4 ? '😊 Very Good'
                                    : rating === 5 ? '🤩 Excellent!'
                                    : 'Star click karo'}
                            </p>
                        </div>

                        {/* Comment */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ color: '#555', fontWeight: 'bold' }}>
                                Comment (Optional):
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Station ke baare mein kuch batao..."
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                style={styles.textarea}
                            />
                        </div>

                        <button
                            style={styles.submitBtn}
                            onClick={submitReview}
                            disabled={reviewLoading || rating === 0}
                        >
                            {reviewLoading ? 'Submitting...' : '✅ Submit Review'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: {
        background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
    },
    headerTitle: { fontSize: '2rem', marginBottom: '0.3rem' },
    headerSub: { opacity: 0.9 },
    content: { padding: '2rem' },
    message: {
        padding: '0.8rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    statsRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.2rem 2rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        minWidth: '120px',
    },
    statIcon: { fontSize: '1.5rem' },
    statNum: { fontSize: '2rem', fontWeight: 'bold', margin: '0.3rem 0' },
    statLabel: { color: '#666', fontSize: '0.85rem', margin: 0 },
    emptyBox: {
        textAlign: 'center',
        padding: '4rem',
        backgroundColor: 'white',
        borderRadius: '16px',
    },
    findBtn: {
        marginTop: '1rem',
        padding: '0.8rem 2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    bookingsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    bookingCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    cardHeader: {
        backgroundColor: '#2d6a4f',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    stationName: { color: 'white', margin: 0, fontSize: '1.1rem' },
    slotInfo: { color: 'rgba(255,255,255,0.8)', margin: '0.2rem 0 0', fontSize: '0.85rem' },
    statusConfirmed: { backgroundColor: '#52b788', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
    statusPending: { backgroundColor: '#f4a261', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
    statusCancelled: { backgroundColor: '#e63946', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
    statusCompleted: { backgroundColor: '#1a73e8', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
    cardBody: { padding: '1.2rem 1.5rem' },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
    },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    infoLabel: { fontSize: '0.8rem', color: '#888' },
    infoVal: { fontWeight: 'bold', color: '#333' },
    cardFooter: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid #f0f2f5',
        display: 'flex',
        gap: '0.8rem',
        flexWrap: 'wrap',
    },
    cancelBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    reviewBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#f4a261',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    stationsBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    // Review Modal
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
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    closeBtn: {
        backgroundColor: '#f0f2f5',
        border: 'none',
        borderRadius: '50%',
        width: '35px',
        height: '35px',
        cursor: 'pointer',
    },
    starRow: { marginBottom: '1.5rem' },
    textarea: {
        width: '100%',
        padding: '0.7rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
        marginTop: '0.5rem',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
    submitBtn: {
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
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
};

export default MyBookings;