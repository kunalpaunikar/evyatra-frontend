import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const actions = [
        { icon: '🔍', label: 'Find Stations', path: '/stations' },
        { icon: '📅', label: 'My Bookings', path: '/bookings' },
        { icon: '👤', label: 'My Profile', path: '/profile' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.banner}>
                <h1 style={styles.bannerTitle}>⚡ Welcome, {user?.name}!</h1>
                <p style={styles.bannerSub}>Find and book EV charging stations near you</p>
            </div>

            <div style={styles.statsRow}>
                <div style={styles.statCard} onClick={() => navigate('/bookings')}>
                    <span style={styles.icon}>🔋</span>
                    <h3>My Bookings</h3>
                    <p style={styles.statNum}>0</p>
                </div>
                <div style={styles.statCard} onClick={() => navigate('/stations')}>
                    <span style={styles.icon}>📍</span>
                    <h3>Stations</h3>
                    <p style={styles.statNum}>30+</p>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.icon}>✅</span>
                    <h3>Completed</h3>
                    <p style={styles.statNum}>0</p>
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>🚀 Quick Actions</h2>
                <div style={styles.actionRow}>
                    {actions.map((action, i) => (
                        <div
                            key={i}
                            style={styles.actionCard}
                            onClick={() => navigate(action.path)}
                        >
                            <span style={styles.actionIcon}>{action.icon}</span>
                            <p>{action.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.infoBox}>
                <p>⚡ <strong>EVyatra</strong> — India ka best EV charging network!</p>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>
                    Find locations, book slots, and charge! 🔋
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
        padding: '3rem 2rem',
        textAlign: 'center',
    },
    bannerTitle: { fontSize: '2rem', marginBottom: '0.5rem' },
    bannerSub: { fontSize: '1.1rem', opacity: 0.9 },
    statsRow: {
        display: 'flex',
        gap: '1.5rem',
        padding: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minWidth: '150px',
        cursor: 'pointer',
    },
    icon: { fontSize: '2rem' },
    statNum: { fontSize: '2rem', fontWeight: 'bold', color: '#2d6a4f' },
    section: { padding: '0 2rem 2rem' },
    sectionTitle: { color: '#2d6a4f', marginBottom: '1rem' },
    actionRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    actionCard: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        minWidth: '140px',
    },
    actionIcon: { fontSize: '2rem' },
    infoBox: {
        margin: '0 2rem 2rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #2d6a4f',
        textAlign: 'center',
    },
};

export default UserDashboard;