import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [bookings, setBookings] = useState([]);
    const [stations, setStations] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddStation, setShowAddStation] = useState(false);
    const [stationForm, setStationForm] = useState({
        name: '', address: '', city: '', state: '',
        latitude: '', longitude: '', totalChargers: '',
        availableChargers: '', pricePerUnit: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchBookings();
        fetchStations();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await API.get('/admin/stats');
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchBookings = async () => {
        try {
            const res = await API.get('/admin/bookings');
            setBookings(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchStations = async () => {
        try {
            const res = await API.get('/stations');
            setStations(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddStation = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/admin/stations', {
                ...stationForm,
                latitude: parseFloat(stationForm.latitude),
                longitude: parseFloat(stationForm.longitude),
                totalChargers: parseInt(stationForm.totalChargers),
                availableChargers: parseInt(stationForm.availableChargers),
                pricePerUnit: parseFloat(stationForm.pricePerUnit),
            });
            setMessage('✅ station added!');
            setShowAddStation(false);
            fetchStations();
            fetchStats();
        } catch (err) {
            setMessage('❌ Station not Added!');
        } finally {
            setLoading(false);
        }
    };

    const deleteStation = async (id, name) => {
        if (!window.confirm(`"${name}" want to delete?`)) return;
        try {
            await API.delete(`/admin/stations/${id}`);
            setMessage('✅ Station Deleted!');
            fetchStations();
            fetchStats();
        } catch (err) {
            setMessage('❌ Not Delete !');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED': return '#2d6a4f';
            case 'PENDING': return '#f4a261';
            case 'CANCELLED': return '#e63946';
            case 'COMPLETED': return '#1a73e8';
            default: return '#666';
        }
    };

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.headerTitle}>🛡️ Admin Dashboard</h1>
                    <p style={styles.headerSub}>Welcome, {user?.name}!</p>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                {[
                    { icon: '👥', label: 'Total Users', val: stats.totalUsers || 0, color: '#1a73e8' },
                    { icon: '📍', label: 'Stations', val: stats.totalStations || 0, color: '#2d6a4f' },
                    { icon: '📅', label: 'Total Bookings', val: stats.totalBookings || 0, color: '#f4a261' },
                    { icon: '✅', label: 'Confirmed', val: bookings.filter(b => b.status === 'CONFIRMED').length, color: '#52b788' },
                ].map((s, i) => (
                    <div key={i} style={styles.statCard}>
                        <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                        <p style={{ ...styles.statNum, color: s.color }}>{s.val}</p>
                        <p style={styles.statLabel}>{s.label}</p>
                    </div>
                ))}
            </div>

            {message && (
                <div style={{
                    margin: '0 2rem',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    backgroundColor: message.includes('✅') ? '#d8f3dc' : '#ffe0e0',
                    color: message.includes('✅') ? '#2d6a4f' : '#e63946',
                    textAlign: 'center',
                }}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div style={styles.tabs}>
                {[
                    { key: 'overview', label: '📊 Overview' },
                    { key: 'bookings', label: '📅 All Bookings' },
                    { key: 'stations', label: '📍 Manage Stations' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        style={activeTab === tab.key ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 style={styles.sectionTitle}>📊 Recent Bookings</h2>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thead}>
                                        {['ID', 'User', 'Station', 'Date', 'Amount', 'Status'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.slice(0, 5).map(b => (
                                        <tr key={b.bookingId} style={styles.tr}>
                                            <td style={styles.td}>#{b.bookingId}</td>
                                            <td style={styles.td}>
                                                <strong>{b.userName}</strong>
                                                <br />
                                                <small style={{ color: '#888' }}>{b.userEmail}</small>
                                            </td>
                                            <td style={styles.td}>
                                                {b.stationName}
                                                <br />
                                                <small style={{ color: '#888' }}>📍 {b.city}</small>
                                            </td>
                                            <td style={styles.td}>{b.bookingDate}</td>
                                            <td style={styles.td}>
                                                <strong style={{ color: '#2d6a4f' }}>
                                                    ₹{b.amount}
                                                </strong>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    backgroundColor: getStatusColor(b.status),
                                                    color: 'white',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* All Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div>
                        <div style={styles.tabHeader}>
                            <h2 style={styles.sectionTitle}>
                                📅 All Bookings ({bookings.length})
                            </h2>
                        </div>

                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thead}>
                                        {['ID', 'User', 'Station', 'Slot', 'Date', 'Time', 'Amount', 'Status'].map(h => (
                                            <th key={h} style={styles.th}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.bookingId} style={styles.tr}>
                                            <td style={styles.td}>#{b.bookingId}</td>
                                            <td style={styles.td}>
                                                <strong>{b.userName}</strong>
                                                <br />
                                                <small style={{ color: '#888' }}>
                                                    {b.userEmail}
                                                </small>
                                            </td>
                                            <td style={styles.td}>
                                                ⚡ {b.stationName}
                                                <br />
                                                <small style={{ color: '#888' }}>
                                                    📍 {b.city}
                                                </small>
                                            </td>
                                            <td style={styles.td}>{b.slotNumber}</td>
                                            <td style={styles.td}>{b.bookingDate}</td>
                                            <td style={styles.td}>
                                                {b.startTime} - {b.endTime}
                                            </td>
                                            <td style={styles.td}>
                                                <strong style={{ color: '#2d6a4f' }}>
                                                    ₹{b.amount}
                                                </strong>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    backgroundColor: getStatusColor(b.status),
                                                    color: 'white',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Manage Stations Tab */}
                {activeTab === 'stations' && (
                    <div>
                        <div style={styles.tabHeader}>
                            <h2 style={styles.sectionTitle}>
                                📍 Stations ({stations.length})
                            </h2>
                            <button
                                style={styles.addBtn}
                                onClick={() => setShowAddStation(!showAddStation)}
                            >
                                {showAddStation ? '✕ Cancel' : '+ Add Station'}
                            </button>
                        </div>

                        {/* Add Station Form */}
                        {showAddStation && (
                            <form onSubmit={handleAddStation} style={styles.addForm}>
                                <h3 style={{ color: '#2d6a4f', marginBottom: '1rem' }}>
                                    ➕ New Station Details
                                </h3>
                                <div style={styles.formGrid}>
                                    {[
                                        { label: 'Station Name *', key: 'name', placeholder: 'Tata Power - Pune' },
                                        { label: 'Address *', key: 'address', placeholder: 'Baner Road, Baner' },
                                        { label: 'City *', key: 'city', placeholder: 'Pune' },
                                        { label: 'State *', key: 'state', placeholder: 'Maharashtra' },
                                        { label: 'Latitude *', key: 'latitude', placeholder: '18.5590' },
                                        { label: 'Longitude *', key: 'longitude', placeholder: '73.7868' },
                                        { label: 'Total Chargers *', key: 'totalChargers', placeholder: '6' },
                                        { label: 'Available Chargers *', key: 'availableChargers', placeholder: '4' },
                                        { label: 'Price/Unit (₹) *', key: 'pricePerUnit', placeholder: '12.50' },
                                    ].map(f => (
                                        <div key={f.key} style={styles.formField}>
                                            <label style={styles.formLabel}>{f.label}</label>
                                            <input
                                                type="text"
                                                placeholder={f.placeholder}
                                                value={stationForm[f.key]}
                                                onChange={e => setStationForm({
                                                    ...stationForm,
                                                    [f.key]: e.target.value,
                                                })}
                                                style={styles.formInput}
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    style={styles.submitBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : '✅ Add Station'}
                                </button>
                            </form>
                        )}

                        {/* Stations List */}
                        <div style={styles.stationsList}>
                            {stations.map(s => (
                                <div key={s.id} style={styles.stationCard}>
                                    <div style={styles.stationInfo}>
                                        <h3 style={styles.stationName}>⚡ {s.name}</h3>
                                        <p style={styles.stationAddr}>
                                            📍 {s.address}, {s.city}, {s.state}
                                        </p>
                                        <div style={styles.stationMeta}>
                                            <span style={styles.metaBadge}>
                                                🔌 {s.availableChargers}/{s.totalChargers} slots
                                            </span>
                                            <span style={styles.metaBadge}>
                                                💰 ₹{s.pricePerUnit}/unit
                                            </span>
                                            <span style={{
                                                ...styles.metaBadge,
                                                backgroundColor: s.status === 'ACTIVE'
                                                    ? '#d8f3dc' : '#ffe0e0',
                                                color: s.status === 'ACTIVE'
                                                    ? '#2d6a4f' : '#e63946',
                                            }}>
                                                {s.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.stationActions}>
                                        <button
                                            style={styles.deleteStationBtn}
                                            onClick={() => deleteStation(s.id, s.name)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: {
        background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
        color: 'white',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: '2rem', margin: 0 },
    headerSub: { opacity: 0.8, margin: '0.3rem 0 0' },
    statsRow: {
        display: 'flex',
        gap: '1rem',
        padding: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        minWidth: '140px',
    },
    statNum: { fontSize: '2.5rem', fontWeight: 'bold', margin: '0.3rem 0' },
    statLabel: { color: '#666', fontSize: '0.85rem', margin: 0 },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        padding: '0 2rem',
        borderBottom: '2px solid #eee',
    },
    tab: {
        padding: '0.8rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        color: '#666',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    tabActive: {
        padding: '0.8rem 1.5rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid #1a1a2e',
        cursor: 'pointer',
        color: '#1a1a2e',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    content: { padding: '2rem' },
    sectionTitle: { color: '#1a1a2e', margin: 0 },
    tabHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    addBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    tableWrapper: {
        overflowX: 'auto',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
    },
    thead: { backgroundColor: '#1a1a2e' },
    th: {
        padding: '1rem',
        textAlign: 'left',
        color: 'white',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },
    tr: { borderBottom: '1px solid #f0f2f5' },
    td: { padding: '0.8rem 1rem', fontSize: '0.9rem' },
    addForm: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '2px solid #2d6a4f',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
    },
    formField: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    formLabel: { fontSize: '0.85rem', fontWeight: 'bold', color: '#555' },
    formInput: {
        padding: '0.6rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '0.9rem',
    },
    submitBtn: {
        marginTop: '1rem',
        padding: '0.8rem 2rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    stationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    stationCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.2rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e8f5e9',
    },
    stationInfo: { flex: 1 },
    stationName: { color: '#1b4332', margin: '0 0 0.3rem', fontSize: '1rem' },
    stationAddr: { color: '#666', fontSize: '0.85rem', margin: '0 0 0.5rem' },
    stationMeta: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    metaBadge: {
        backgroundColor: '#f0f2f5',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
    },
    stationActions: { display: 'flex', gap: '0.5rem' },
    deleteStationBtn: {
        padding: '0.4rem 0.8rem',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
    },
};

export default AdminDashboard;