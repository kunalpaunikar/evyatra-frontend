import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/my');
            setBookings(res.data);
        } catch (err) {
            setMessage('Bookings is not loaded !');
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('You want to cancel the Booking ?')) return;
        try {
            await API.put(`/bookings/${bookingId}/cancel`);
            setMessage('✅ Booking is cancel !');
            fetchBookings();
        } catch (err) {
            setMessage('❌ Not Cancel !');
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
                   Your All EV charging bookings
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

                {/* Stats Row */}
                <div style={styles.statsRow}>
                    {[
                        {
                            label: 'Total',
                            val: bookings.length,
                            icon: '📅',
                            color: '#1a73e8',
                        },
                        {
                            label: 'Confirmed',
                            val: bookings.filter(b =>
                                b.status === 'CONFIRMED').length,
                            icon: '✅',
                            color: '#2d6a4f',
                        },
                        {
                            label: 'Pending',
                            val: bookings.filter(b =>
                                b.status === 'PENDING').length,
                            icon: '⏳',
                            color: '#f4a261',
                        },
                        {
                            label: 'Cancelled',
                            val: bookings.filter(b =>
                                b.status === 'CANCELLED').length,
                            icon: '❌',
                            color: '#e63946',
                        },
                    ].map((s, i) => (
                        <div key={i} style={styles.statCard}>
                            <span style={styles.statIcon}>{s.icon}</span>
                            <p style={{
                                ...styles.statNum,
                                color: s.color,
                            }}>
                                {s.val}
                            </p>
                            <p style={styles.statLabel}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={{ fontSize: '3rem' }}>📭</p>
                        <h3>No booking right Now !</h3>
                        <p style={{ color: '#666' }}>
                            Find Station and Book the Slot ..
                        </p>
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

                                {/* Card Header */}
                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={styles.stationName}>
                                            ⚡ {booking.stationName}
                                        </h3>
                                        <p style={styles.slotInfo}>
                                            🔌 Slot: {booking.slotNumber} —{' '}
                                            {booking.chargerType === 'AC_SLOW'
                                                ? 'AC Slow'
                                                : booking.chargerType === 'DC_FAST'
                                                    ? 'DC Fast'
                                                    : 'Superfast'}
                                        </p>
                                    </div>
                                    <span style={getStatusStyle(booking.status)}>
                                        {getStatusIcon(booking.status)}{' '}
                                        {booking.status}
                                    </span>
                                </div>

                                {/* Card Body */}
                                <div style={styles.cardBody}>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>
                                                📅 Date
                                            </span>
                                            <span style={styles.infoVal}>
                                                {booking.bookingDate}
                                            </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>
                                                🕐 Time
                                            </span>
                                            <span style={styles.infoVal}>
                                                {booking.startTime} -{' '}
                                                {booking.endTime}
                                            </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>
                                                💰 Amount
                                            </span>
                                            <span style={{
                                                ...styles.infoVal,
                                                color: '#2d6a4f',
                                                fontWeight: 'bold',
                                                fontSize: '1.1rem',
                                            }}>
                                                ₹{booking.totalAmount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                {(booking.status === 'PENDING' ||
                                    booking.status === 'CONFIRMED') && (
                                    <div style={styles.cardFooter}>
                                        <button
                                            style={styles.cancelBtn}
                                            onClick={() =>
                                                cancelBooking(booking.bookingId)
                                            }
                                        >
                                            ❌ Cancel Booking
                                        </button>
                                        <button
                                            style={styles.stationsBtn}
                                            onClick={() => navigate('/stations')}
                                        >
                                            🔍 Book Another
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
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
        padding: '0.8rem 1rem',
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
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    findBtn: {
        marginTop: '1rem',
        padding: '0.8rem 2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
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
        border: '1px solid #e8f5e9',
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
    statusConfirmed: {
        backgroundColor: '#52b788',
        color: 'white',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    statusPending: {
        backgroundColor: '#f4a261',
        color: 'white',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    statusCancelled: {
        backgroundColor: '#e63946',
        color: 'white',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    statusCompleted: {
        backgroundColor: '#1a73e8',
        color: 'white',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    cardBody: { padding: '1.2rem 1.5rem' },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    infoLabel: { fontSize: '0.8rem', color: '#888' },
    infoVal: { fontWeight: 'bold', color: '#333' },
    cardFooter: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid #f0f2f5',
        display: 'flex',
        gap: '0.8rem',
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
    stationsBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
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