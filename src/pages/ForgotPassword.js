
import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    // step 1 = email
    // step 2 = otp
    // step 3 = new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1 — Email submit
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            setError('Only @gmail.com email is allowed !');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/forgot-password', { email });
            setMessage('✅ OTP has been sent — please check your email!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Not Found Email !');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — OTP verify
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Enter 6 digit OTP !');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/verify-otp', { email, otp });
            setMessage('✅ OTP verified! Enter New Password Now ! ');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'OTP is Wrong ! ');
        } finally {
            setLoading(false);
        }
    };

    // Step 3 — Password reset
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,12}$/;
        if (!passRegex.test(newPassword)) {
            setError('Password should be 8-12 chars, 1 digit and atleast 1 Special Character !');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Both passwords do not match !');
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/reset-password', { email, otp, newPassword });
            setMessage('✅ Password is reset ! Now login ');
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h2 style={styles.title}>🔐 Forgot Password</h2>

                {/* Step Indicator */}
                <div style={styles.steps}>
                    {['Email', 'OTP', 'Reset'].map((s, i) => (
                        <div key={i} style={styles.stepItem}>
                            <div style={{
                                ...styles.stepCircle,
                                backgroundColor: step > i + 1
                                    ? '#2d6a4f'
                                    : step === i + 1
                                        ? '#40916c'
                                        : '#ccc'
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={styles.stepLabel}>{s}</span>
                        </div>
                    ))}
                </div>

                {message && <p style={styles.success}>{message}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {/* Step 1 — Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp}>
                        <div style={styles.field}>
                            <label>Registered Email</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : '📧 Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2 — OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <p style={styles.hint}>
                            OTP is sent : <strong>{email}</strong>
                        </p>
                        <div style={styles.field}>
                            <label>Enter 6-digit OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={styles.otpInput}
                                placeholder="_ _ _ _ _ _"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : '✅ Verify OTP'}
                        </button>
                        <button
                            type="button"
                            style={styles.resendBtn}
                            onClick={handleSendOtp}
                        >
                            🔄 Resend OTP
                        </button>
                    </form>
                )}

                {/* Step 3 — New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div style={styles.field}>
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={styles.input}
                                placeholder="8-12 chars + number"
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                placeholder="Dobara daalo"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : '🔐 Reset Password'}
                        </button>
                    </form>
                )}

                {/* Step 4 — Success */}
                {step === 4 && (
                    <div style={styles.successBox}>
                        <p style={{ fontSize: '3rem' }}>🎉</p>
                        <p>Password is successfully reset !</p>
                        <Link to="/login" style={styles.button}>
                            Login Now
                        </Link>
                    </div>
                )}

                {step < 4 && (
                    <p style={styles.backLink}>
                        <Link to="/login">← Go back to Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px',
    },
    title: {
        textAlign: 'center',
        color: '#2d6a4f',
        marginBottom: '1.5rem',
    },
    steps: {
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginBottom: '1.5rem',
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
    field: {
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    input: {
        padding: '0.7rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '1rem',
    },
    otpInput: {
        padding: '0.7rem',
        borderRadius: '6px',
        border: '2px solid #2d6a4f',
        fontSize: '1.5rem',
        textAlign: 'center',
        letterSpacing: '0.5rem',
    },
    button: {
        display: 'block',
        width: '100%',
        padding: '0.8rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
        textAlign: 'center',
        textDecoration: 'none',
        marginTop: '0.5rem',
    },
    resendBtn: {
        width: '100%',
        padding: '0.6rem',
        backgroundColor: 'transparent',
        color: '#2d6a4f',
        border: '1px solid #2d6a4f',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    hint: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem' },
    success: { color: 'green', textAlign: 'center', marginBottom: '1rem' },
    error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
    backLink: { textAlign: 'center', marginTop: '1rem' },
    successBox: { textAlign: 'center', padding: '1rem' },
};

export default ForgotPassword;