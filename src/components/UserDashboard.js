import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookingCount, setBookingCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await API.get('/bookings/my');
            setBookingCount(res.data.length);
            setConfirmedCount(
                res.data.filter(b => b.status === 'CONFIRMED').length
            );
        } catch (err) {
            console.error('Bookings load nahi hue!');
        }
    };

    const actions = [
        { icon: '🔍', label: 'Find Stations', path: '/stations' },
        { icon: '📅', label: 'My Bookings', path: '/bookings' },
        { icon: '👤', label: 'My Profile', path: '/profile' },
    ];

    return (
        <div style={styles.container}>

            {/* Banner */}
            <div style={styles.banner}>
                <h1 style={styles.bannerTitle}>
                    ⚡ Welcome, {user?.name}!
                </h1>
                <p style={styles.bannerSub}>
                    Find and book EV charging stations near you
                </p>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div
                    style={styles.statCard}
                    onClick={() => navigate('/bookings')}
                >
                    <span style={styles.icon}>🔋</span>
                    <h3 style={styles.statLabel}>My Bookings</h3>
                    <p style={styles.statNum}>{bookingCount}</p>
                </div>
                <div
                    style={styles.statCard}
                    onClick={() => navigate('/stations')}
                >
                    <span style={styles.icon}>📍</span>
                    <h3 style={styles.statLabel}>Stations</h3>
                    <p style={styles.statNum}>30+</p>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.icon}>✅</span>
                    <h3 style={styles.statLabel}>Confirmed</h3>
                    <p style={styles.statNum}>{confirmedCount}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🚀 Quick Actions</h2>
                <div style={styles.actionRow}>
                    {actions.map((action, i) => (
                        <div
                            key={i}
                            style={styles.actionCard}
                            onClick={() => navigate(action.path)}
                        >
                            <span style={styles.actionIcon}>
                                {action.icon}
                            </span>
                            <p style={styles.actionLabel}>{action.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div style={styles.infoBox}>
                <p>⚡ <strong>EVyatra</strong> — India ka best EV charging network!</p>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Stations dhundho, slot book karo, aur charge karo! 🔋
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    banner: {
        background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
        color: 'white',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)',
        textAlign: 'center',
    },
    bannerTitle: {
        fontSize: 'clamp(1.3rem, 4vw, 2rem)',
        marginBottom: '0.5rem',
    },
    bannerSub: { fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', opacity: 0.9 },
    statsRow: {
        display: 'flex',
        gap: '1rem',
        padding: 'clamp(1rem, 3vw, 2rem)',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.5rem, 4vw, 2rem)',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minWidth: 'clamp(100px, 25vw, 150px)',
        cursor: 'pointer',
        flex: '1',
        maxWidth: '200px',
    },
    icon: { fontSize: 'clamp(1.5rem, 4vw, 2rem)' },
    statLabel: {
        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
        margin: '0.3rem 0',
        color: '#555',
    },
    statNum: {
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: 'bold',
        color: '#2d6a4f',
        margin: 0,
    },
    section: {
        padding: 'clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem) 2rem',
    },
    sectionTitle: {
        color: '#2d6a4f',
        marginBottom: '1rem',
        fontSize: 'clamp(1rem, 3vw, 1.3rem)',
    },
    actionRow: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        flex: '1',
        minWidth: 'clamp(80px, 20vw, 140px)',
    },
    actionIcon: { fontSize: 'clamp(1.5rem, 4vw, 2rem)' },
    actionLabel: {
        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
        margin: '0.5rem 0 0',
        color: '#333',
    },
    infoBox: {
        margin: '0 clamp(1rem, 3vw, 2rem) 2rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #2d6a4f',
        textAlign: 'center',
        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
    },
};

export default UserDashboard;