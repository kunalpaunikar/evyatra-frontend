import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const handlePhoneChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length > 10) return;
        setForm({ ...form, phone: digits });
        setErrors({ ...errors, phone: '' });
    };

    // Validation rules
    const validate = () => {
        const newErrors = {};

        // Name
        if (!form.name.trim()) {
            newErrors.name = 'Name is require';
        }

        // Email — sirf @gmail.com
        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!form.email) {
            newErrors.email = 'Email required hai';
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = 'Only @gmail.com email is allowed';
        }

        // Password — 8-12 chars, ek number, ek letter, ek special char
        const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@*_#$!])[A-Za-z\d@*_#$!]{8,12}$/;

        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (!passRegex.test(form.password)) {
            newErrors.password = 'Password 8-12 chars, ek number + ek letter + ek special char (@*_#$!) hona chahiye';
        }

        // Phone — 10 digits only
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!form.phone) {
            newErrors.phone = 'Phone is required';
        } else if (!phoneRegex.test(form.phone)) {
            newErrors.phone = 'Phone must be 10 digits and start with 6-9';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');

        // Validate karo
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await API.post('/auth/register', form);
            setSuccess('Registration successful! Login karo.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>⚡ EVyatra Register</h2>

                {apiError && <p style={styles.error}>{apiError}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div style={styles.field}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            style={errors.name ? styles.inputError : styles.input}
                            placeholder="Apna naam daalo"
                        />
                        {errors.name && <span style={styles.fieldError}>{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div style={styles.field}>
                        <label>Email (@gmail.com only)</label>
                        <input
                            type="text"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={errors.email ? styles.inputError : styles.input}
                            placeholder="example@gmail.com"
                        />
                        {errors.email && <span style={styles.fieldError}>{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div style={styles.field}>
                        <label>Password (8-12 chars + number + special char)</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                style={errors.password ? styles.inputError : styles.inputPass}
                                placeholder="Min 8, max 12, ek number"
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

                    {/* Phone */}
                    <div style={styles.field}>
                        <label>Phone (10 digits)</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handlePhoneChange}
                            style={errors.phone ? styles.inputError : styles.input}
                            placeholder="XXXXXXXXXX"
                            maxLength={10}
                        />
                        {errors.phone && <span style={styles.fieldError}>{errors.phone}</span>}
                    </div>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Already have an account?{' '}
                <Link to="/login">Sign In</Link>
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
        maxWidth: '420px',
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
    success: { color: 'green', textAlign: 'center', marginBottom: '1rem' },
    fieldError: { color: 'red', fontSize: '0.8rem' },
};

export default Register;