import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setApiError('');
    };

    const validate = () => {
        const newErrors = {};

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!form.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = 'Only @gmail.com email is allowed';
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 8 || form.password.length > 12) {
            newErrors.password = 'Password must be 8-12 characters long';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/auth/login', form);
            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg === 'Password galat hai!' || msg?.includes('password')) {
                setApiError('Wrong password. Please try again.');
            } else if (msg === 'User nahi mila!' || msg?.includes('not found')) {
                setApiError('Email is not registered.');
            } else {
                setApiError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>⚡ EVyatra Login</h2>

                {apiError && <p style={styles.error}>⚠️ {apiError}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Email</label>
                        <input
                            type="text"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={errors.email ? styles.inputError : styles.input}
                            placeholder="Enter your email"
                        />
                        {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                    </div>

                    <div style={styles.field}>
                        <label>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                style={errors.password ? styles.inputError : styles.inputPass}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                style={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {errors.password && <span style={styles.fieldError}>{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                    Never Created an Account?{' '}
                    <Link to="/register">Register here</Link>
                </p>


                <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <Link to="/forgot-password" style={{ color: '#e63946' }}>
                        Forgot Password?
                    </Link>
                </p>
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
        maxWidth: '400px',
    },
    title: {
        textAlign: 'center',
        color: '#2d6a4f',
        marginBottom: '1.5rem',
    },
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
    inputError: {
        padding: '0.7rem',
        borderRadius: '6px',
        border: '1px solid red',
        fontSize: '1rem',
    },
    passwordWrapper: {
        display: 'flex',
        border: '1px solid #ccc',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    inputPass: {
        flex: 1,
        padding: '0.7rem',
        border: 'none',
        fontSize: '1rem',
        outline: 'none',
    },
    eyeBtn: {
        padding: '0 0.8rem',
        backgroundColor: '#f0f2f5',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.1rem',
    },
    button: {
        width: '100%',
        padding: '0.8rem',
        backgroundColor: '#2d6a4f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '0.5rem',
    },
    error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
    fieldError: { color: 'red', fontSize: '0.8rem' },
};

export default Login;