import { useState, useEffect } from 'react';
import API from '../api/axios';

function MyProfile() {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await API.get('/user/profile');
            setProfile(res.data);
            setForm({
                name: res.data.name,
                phone: res.data.phone || '',
            });
        } catch (err) {
            setMessage('Failed to load profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put('/user/profile', form);
            setMessage('Profile updated successfully!');
            setEditMode(false);
            fetchProfile();
        } catch (err) {
            setMessage('Failed to update profile. Please try again.');
        }
    };

    if (loading) return (
        <div style={styles.loadingBox}>
            <p style={{ fontSize: '2rem' }}>👤</p>
            <p>Loading profile...</p>
        </div>
    );

    return (
        <div style={styles.container}>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.avatarCircle}>
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h1 style={styles.headerName}>{profile?.name}</h1>
                <span style={styles.roleBadge}>
                    {profile?.role === 'ROLE_ADMIN' ? '🛡️ Admin' : '👤 User'}
                </span>
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

                {/* Profile Card */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>👤 Profile Info</h2>
                        <button
                            style={editMode ? styles.cancelBtn : styles.editBtn}
                            onClick={() => {
                                setEditMode(!editMode);
                                setMessage('');
                            }}
                        >
                            {editMode ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {!editMode ? (
                        <div style={styles.infoList}>
                            {[
                                { icon: '👤', label: 'Name', val: profile?.name },
                                { icon: '📧', label: 'Email', val: profile?.email },
                                { icon: '📱', label: 'Phone', val: profile?.phone || 'Not set' },
                                { icon: '🛡️', label: 'Role', val: profile?.role === 'ROLE_ADMIN' ? 'Admin' : 'User' },
                            ].map((item, i) => (
                                <div key={i} style={styles.infoRow}>
                                    <span style={styles.infoIcon}>{item.icon}</span>
                                    <div>
                                        <p style={styles.infoLabel}>{item.label}</p>
                                        <p style={styles.infoVal}>{item.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.fieldLabel}>Full Name</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({
                                        ...form, name: e.target.value
                                    })}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.fieldLabel}>Phone</label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={e => setForm({
                                        ...form, phone: e.target.value
                                    })}
                                    style={styles.input}
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.fieldLabel}>Email</label>
                                <input
                                    type="email"
                                    value={profile?.email}
                                    style={{
                                        ...styles.input,
                                        backgroundColor: '#f0f2f5',
                                        color: '#999',
                                    }}
                                    disabled
                                />
                                <small style={{ color: '#999' }}>
                                    Email cannot be changed
                                </small>
                            </div>
                            <button type="submit" style={styles.saveBtn}>
                                Save Changes
                            </button>
                        </form>
                    )}
                </div>

                {/* Security Card */}
                <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Security</h2>
                    <div style={styles.securityRow}>
                        <div>
                            <p style={styles.secTitle}>Password</p>
                            <p style={styles.secSub}>
                                Use Forgot Password to change your password
                            </p>
                        </div>
                        <a
                            href="/forgot-password"
                            style={styles.changePassBtn}
                        >
                            Change Password
                        </a>
                    </div>
                </div>

                {/* Account Info */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Account Information</h2>
                    <div style={styles.infoList}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoIcon}>🆔</span>
                            <div>
                                <p style={styles.infoLabel}>User ID</p>
                                <p style={styles.infoVal}>#{profile?.id}</p>
                            </div>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoIcon}>⚡</span>
                            <div>
                                <p style={styles.infoLabel}>Platform</p>
                                <p style={styles.infoVal}>EVyatra — EV Charging Network</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: {
        background: 'linear-gradient(135deg, #2d6a4f, #40916c)',
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center',
    },
    avatarCircle: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        margin: '0 auto 1rem',
        color: 'white',
    },
    headerName: { fontSize: '1.8rem', marginBottom: '0.5rem' },
    roleBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '0.3rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
    },
    content: { padding: '2rem', maxWidth: '600px', margin: '0 auto' },
    message: {
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        marginBottom: '1.5rem',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    cardTitle: { color: '#2d6a4f', margin: 0, fontSize: '1.2rem' },
    editBtn: {
        padding: '0.4rem 1rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    cancelBtn: {
        padding: '0.4rem 1rem',
        backgroundColor: '#e63946',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    infoList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f0f2f5',
    },
    infoIcon: { fontSize: '1.5rem' },
    infoLabel: { color: '#888', fontSize: '0.8rem', margin: 0 },
    infoVal: { fontWeight: 'bold', color: '#333', margin: 0 },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
    fieldLabel: { fontWeight: 'bold', color: '#555', fontSize: '0.9rem' },
    input: {
        padding: '0.7rem',
        borderRadius: '6px',
        border: '1px solid #ddd',
        fontSize: '1rem',
    },
    saveBtn: {
        padding: '0.8rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
    securityRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    secTitle: { fontWeight: 'bold', margin: 0 },
    secSub: { color: '#666', fontSize: '0.85rem', margin: '0.3rem 0 0' },
    changePassBtn: {
        padding: '0.5rem 1.2rem',
        backgroundColor: '#1a73e8',
        color: 'white',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    loadingBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
    },
};

export default MyProfile;