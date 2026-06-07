import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showUsers, setShowUsers] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Users fetch karo
    const fetchUsers = async () => {
        if (showUsers) {
            setShowUsers(false);
            return;
        }
        setLoading(true);
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data);
            setShowUsers(true);
        } catch (err) {
            setMessage('❌ Users not loaded!');
        } finally {
            setLoading(false);
        }
    };

    // User delete karo
    const deleteUser = async (id, name) => {
        if (!window.confirm(`${name} want to delete this ?`)) return;
        try {
            await API.delete(`/admin/users/${id}`);
            setMessage(`✅ ${name} deleted!`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            setMessage('❌ Not Deleted!');
        }
    };

    // Login/Register page pe sirf brand dikhao
    if (location.pathname === '/login' || location.pathname === '/register') {
        return (
            <nav style={styles.nav}>
                <Link to="/" style={styles.brand}>⚡ EVyatra</Link>
            </nav>
        );
    }

    return (
        <>
            {/* Main Navbar */}
            <nav style={styles.nav}>
                <Link to="/" style={styles.brand}>⚡ EVyatra</Link>

                <div style={styles.links}>
                    {/* Admin Button — only see to Admin */}
                    {user?.role === 'ROLE_ADMIN' && (
                        <button
                            onClick={fetchUsers}
                            style={showUsers ? styles.adminBtnActive : styles.adminBtn}
                        >
                            🛡️ {loading ? 'Loading...' : showUsers ? 'Hide Users' : 'Manage Users'}
                        </button>
                    )}

                    {user && (
                    <>
                    <Link to="/stations" style={styles.navLink}>📍 Stations</Link>
                    <Link to="/bookings" style={styles.navLink}>📅 Bookings</Link>
                    <Link to="/profile" style={styles.navLink}>👤 Profile</Link>
                    <span style={styles.name}>Hi, {user.name}!</span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                    </button>
                    </>
                    )}
                </div>
            </nav>

            {/* Admin Users Panel — Navbar ke neeche slide karta hai */}
            {showUsers && user?.role === 'ROLE_ADMIN' && (
                <div style={styles.panel}>
                    <h3 style={styles.panelTitle}>👥 Registered Users</h3>

                    {message && (
                        <p style={message.includes('✅') ? styles.success : styles.error}>
                            {message}
                        </p>
                    )}

                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Name</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Phone</th>
                                    <th style={styles.th}>Role</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={styles.tr}>
                                        <td style={styles.td}>{u.id}</td>
                                        <td style={styles.td}>{u.name}</td>
                                        <td style={styles.td}>{u.email}</td>
                                        <td style={styles.td}>{u.phone || 'N/A'}</td>
                                        <td style={styles.td}>
                                            <span style={
                                                u.role === 'ROLE_ADMIN'
                                                    ? styles.badgeAdmin
                                                    : styles.badgeUser
                                            }>
                                                {u.role === 'ROLE_ADMIN' ? '🛡️ Admin' : '👤 User'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {u.role !== 'ROLE_ADMIN' ? (
                                                <button
                                                    style={styles.deleteBtn}
                                                    onClick={() => deleteUser(u.id, u.name)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            ) : (
                                                <span style={styles.protectedText}>
                                                    🔒 Protected
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem clamp(1rem, 3vw, 2rem)',
        backgroundColor: '#2d6a4f',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    brand: {
        color: 'white',
        textDecoration: 'none',
        fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
        fontWeight: 'bold',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(0.3rem, 1.5vw, 1rem)',
        flexWrap: 'wrap',
    },
    navLink: {
        color: 'rgba(255,255,255,0.9)',
        textDecoration: 'none',
        fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
        padding: '0.3rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        whiteSpace: 'nowrap',
    },
    adminBtn: {
        padding: '0.4rem 1rem',
        backgroundColor: '#f4a261',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    adminBtnActive: {
        padding: '0.4rem 1rem',
        backgroundColor: '#e76f51',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    name: {
        color: 'white',
        fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
        whiteSpace: 'nowrap',
    },
    logoutBtn: {
        padding: 'clamp(0.3rem, 1vw, 0.4rem) clamp(0.5rem, 1.5vw, 1rem)',
        backgroundColor: 'white',
        color: '#2d6a4f',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
        whiteSpace: 'nowrap',
    },
    // Panel styles
    panel: {
        backgroundColor: '#1a1a2e',
        color: 'white',
        padding: '1.5rem 2rem',
        borderBottom: '3px solid #f4a261',
    },
    panelTitle: {
        color: '#f4a261',
        marginBottom: '1rem',
    },
    tableWrapper: { overflowX: 'auto' },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#16213e',
        borderRadius: '8px',
        overflow: 'hidden',
    },
    thead: { backgroundColor: '#0f3460' },
    th: {
        padding: '0.8rem 1rem',
        textAlign: 'left',
        color: '#f4a261',
        fontWeight: 'bold',
    },
    tr: { borderBottom: '1px solid #0f3460' },
    td: { padding: '0.7rem 1rem', color: 'white' },
    badgeAdmin: {
        backgroundColor: '#f4a261',
        color: 'white',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
    },
    badgeUser: {
        backgroundColor: '#2d6a4f',
        color: 'white',
        padding: '0.2rem 0.6rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
    },
    deleteBtn: {
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        padding: '0.3rem 0.7rem',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    protectedText: { color: '#aaa', fontSize: '0.85rem' },
    success: { color: '#52b788', marginBottom: '0.5rem' },
    error: { color: '#e63946', marginBottom: '0.5rem' },
};

export default Navbar;