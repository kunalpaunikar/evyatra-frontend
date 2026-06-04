import { useNavigate } from 'react-router-dom';

function LandingPage() {

    const navigate = useNavigate();

    const features = [
        {
            icon: '⚡',
            title: 'Ultra Fast Charging',
            desc: 'DC fast charging stations across India for super quick charging.',
        },
        {
            icon: '📍',
            title: 'Live Smart Map',
            desc: 'See real-time charging stations with availability & directions.',
        },
        {
            icon: '📅',
            title: 'Easy Slot Booking',
            desc: 'Book charging slots instantly without waiting in queues.',
        },
        {
            icon: '🔒',
            title: 'Secure Platform',
            desc: 'JWT secured authentication with safe payments & bookings.',
        },
        {
            icon: '🚗',
            title: 'Road Trip Ready',
            desc: 'Travel confidently with charging support across highways.',
        },
        {
            icon: '💰',
            title: 'Affordable Rates',
            desc: 'Best EV charging prices starting from ₹10/unit.',
        },
    ];

    const stats = [
        { num: '30+', label: 'Cities' },
        { num: '100+', label: 'Stations' },
        { num: '500+', label: 'Happy Users' },
        { num: '24/7', label: 'Support' },
    ];

    const steps = [
        {
            icon: '📝',
            step: '01',
            title: 'Register',
            desc: 'Create your free EVyatra account.',
        },
        {
            icon: '📍',
            step: '02',
            title: 'Find Stations',
            desc: 'Discover nearby EV charging stations instantly.',
        },
        {
            icon: '📅',
            step: '03',
            title: 'Book Slot',
            desc: 'Reserve charging slot in one click.',
        },
        {
            icon: '⚡',
            step: '04',
            title: 'Charge EV',
            desc: 'Charge your EV without any hassle.',
        },
    ];

    return (
        <div style={styles.page}>

            {/* NAVBAR */}

            <nav style={styles.navbar}>

                <div style={styles.logoBox}>
                    <span style={styles.logoIcon}>⚡</span>
                    <span style={styles.logoText}>EVyatra</span>
                </div>

                <div style={styles.navLinks}>
                    <a href="#features" style={styles.navLink}>Features</a>
                    <a href="#how" style={styles.navLink}>How it Works</a>
                    <a href="#reviews" style={styles.navLink}>Reviews</a>

                    <button
                        style={styles.loginBtn}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>

                    <button
                        style={styles.signupBtn}
                        onClick={() => navigate('/register')}
                    >
                        Get Started
                    </button>
                </div>

            </nav>

            {/* HERO SECTION */}

            <section style={styles.hero}>

                <div style={styles.overlay}></div>

                <div style={styles.heroContent}>

                    <div style={styles.heroBadge}>
                        🇮🇳 INDIA'S SMART EV NETWORK
                    </div>

                    <h1 style={styles.heroTitle}>
                        Smart EV Charging
                        <br />
                        For The Future
                    </h1>

                    <p style={styles.heroSubtitle}>
                        Find nearby charging stations, book slots instantly,
                        and enjoy seamless electric journeys with EVyatra.
                    </p>

                    <div style={styles.heroButtons}>

                        <button
                            style={styles.primaryBtn}
                            onClick={() => navigate('/register')}
                        >
                            🚀 Start Charging
                        </button>

                        <button
                            style={styles.secondaryBtn}
                            onClick={() => navigate('/login')}
                        >
                            Explore Stations
                        </button>

                    </div>

                    <div style={styles.heroTags}>
                        <span style={styles.tag}>⚡ Fast Charging</span>
                        <span style={styles.tag}>📍 Live Map</span>
                        <span style={styles.tag}>🔋 Smart Booking</span>
                    </div>

                </div>

            </section>

            {/* STATS */}

            <section style={styles.statsSection}>

                {stats.map((item, index) => (
                    <div key={index} style={styles.statCard}>
                        <h2 style={styles.statNumber}>{item.num}</h2>
                        <p style={styles.statLabel}>{item.label}</p>
                    </div>
                ))}

            </section>

            {/* FEATURES */}

            <section id="features" style={styles.section}>

                <div style={styles.sectionHeader}>

                    <p style={styles.smallTitle}>WHY EVYATRA</p>

                    <h2 style={styles.sectionTitle}>
                        Experience Next Generation EV Charging
                    </h2>

                    <p style={styles.sectionSubtitle}>
                        Powerful features designed for modern EV drivers.
                    </p>

                </div>

                <div style={styles.featuresGrid}>

                    {features.map((feature, index) => (
                        <div key={index} style={styles.featureCard}>

                            <div style={styles.featureIcon}>
                                {feature.icon}
                            </div>

                            <h3 style={styles.featureTitle}>
                                {feature.title}
                            </h3>

                            <p style={styles.featureDesc}>
                                {feature.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </section>

            {/* HOW IT WORKS */}

            <section id="how" style={styles.howSection}>

                <div style={styles.sectionHeader}>
                    <p style={styles.smallTitleWhite}>HOW IT WORKS</p>

                    <h2 style={{
                        ...styles.sectionTitle,
                        color: 'white',
                    }}>
                        Charge Your EV In 4 Easy Steps
                    </h2>
                </div>

                <div style={styles.stepsGrid}>

                    {steps.map((step, index) => (
                        <div key={index} style={styles.stepCard}>

                            <div style={styles.stepNumber}>
                                {step.step}
                            </div>

                            <div style={styles.stepIcon}>
                                {step.icon}
                            </div>

                            <h3 style={styles.stepTitle}>
                                {step.title}
                            </h3>

                            <p style={styles.stepDesc}>
                                {step.desc}
                            </p>

                        </div>
                    ))}

                </div>

            </section>

            {/* TESTIMONIALS */}

            <section
                id="reviews"
                style={styles.testimonialSection}
            >

                <div style={styles.sectionHeader}>
                    <p style={styles.smallTitle}>USER REVIEWS</p>

                    <h2 style={styles.sectionTitle}>
                        People Love EVyatra ❤️
                    </h2>
                </div>

                <div style={styles.testimonialGrid}>

                    <div style={styles.testimonialCard}>
                        <p style={styles.reviewText}>
                            “Best EV charging experience ever.
                            The map and live stations feature is amazing.”
                        </p>

                        <h4 style={styles.reviewUser}>
                            Rahul Sharma — Pune
                        </h4>
                    </div>

                    <div style={styles.testimonialCard}>
                        <p style={styles.reviewText}>
                            “Super clean UI and booking process is very smooth.
                            Highly recommended.”
                        </p>

                        <h4 style={styles.reviewUser}>
                            Priya Mehta — Mumbai
                        </h4>
                    </div>

                    <div style={styles.testimonialCard}>
                        <p style={styles.reviewText}>
                            “Perfect app for EV road trips.
                            Charging stations are easy to find.”
                        </p>

                        <h4 style={styles.reviewUser}>
                            Arjun Patel — Ahmedabad
                        </h4>
                    </div>

                </div>

            </section>

            {/* CTA */}

            <section style={styles.ctaSection}>

                <h2 style={styles.ctaTitle}>
                    Ready To Power Your EV Journey? ⚡
                </h2>

                <p style={styles.ctaSub}>
                    Join EVyatra today and explore smart charging stations.
                </p>

                <button
                    style={styles.ctaBtn}
                    onClick={() => navigate('/register')}
                >
                    🚀 Join EVyatra
                </button>

            </section>

            {/* FOOTER */}

            <footer style={styles.footer}>

                <h2 style={styles.footerLogo}>
                    ⚡ EVyatra
                </h2>

                <p style={styles.footerText}>
                    India's Smart EV Charging Network
                </p>

                <p style={styles.footerCopy}>
                    © 2026 EVyatra — Made with ❤️ for Electric India
                </p>

            </footer>

        </div>
    );
}

const styles = {

    page: {
        margin: 0,
        padding: 0,
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#f4f7f9',
    },

    navbar: {
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 999,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 4rem',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(10px)',
        boxSizing: 'border-box',
    },

    logoBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },

    logoIcon: {
        fontSize: '2rem',
    },

    logoText: {
        color: 'white',
        fontSize: '1.8rem',
        fontWeight: 'bold',
    },

    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
    },

    navLink: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: '500',
    },

    loginBtn: {
        padding: '0.7rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid white',
        background: 'transparent',
        color: 'white',
        cursor: 'pointer',
    },

    signupBtn: {
        padding: '0.7rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        background: '#00c853',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
    },

    hero: {
        height: '100vh',
        backgroundImage:
            `url('https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=1974&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 2rem',
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
            'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4))',
    },

    heroContent: {
        position: 'relative',
        zIndex: 2,
        maxWidth: '850px',
        color: 'white',
    },

    heroBadge: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        borderRadius: '30px',
        background: 'rgba(255,255,255,0.15)',
        marginBottom: '1.5rem',
        fontWeight: 'bold',
        letterSpacing: '1px',
    },

    heroTitle: {
        fontSize: '4.5rem',
        fontWeight: '800',
        marginBottom: '1rem',
        lineHeight: 1.1,
    },

    heroSubtitle: {
        fontSize: '1.3rem',
        lineHeight: 1.7,
        color: '#f1f1f1',
        marginBottom: '2rem',
    },

    heroButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },

    primaryBtn: {
        padding: '1rem 2rem',
        background: '#00c853',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
    },

    secondaryBtn: {
        padding: '1rem 2rem',
        background: 'transparent',
        border: '1px solid white',
        borderRadius: '10px',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
    },

    heroTags: {
        marginTop: '2rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
    },

    tag: {
        background: 'rgba(255,255,255,0.15)',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
    },

    statsSection: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
        gap: '1rem',
        padding: '3rem 4rem',
        marginTop: '-60px',
        position: 'relative',
        zIndex: 5,
    },

    statCard: {
        background: 'white',
        borderRadius: '18px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    },

    statNumber: {
        color: '#00c853',
        fontSize: '2.5rem',
        margin: 0,
    },

    statLabel: {
        color: '#555',
        marginTop: '0.5rem',
    },

    section: {
        padding: '5rem 4rem',
    },

    sectionHeader: {
        textAlign: 'center',
        marginBottom: '3rem',
    },

    smallTitle: {
        color: '#00c853',
        fontWeight: 'bold',
        letterSpacing: '2px',
    },

    smallTitleWhite: {
        color: '#b9f6ca',
        fontWeight: 'bold',
        letterSpacing: '2px',
    },

    sectionTitle: {
        fontSize: '2.8rem',
        color: '#111',
        margin: '1rem 0',
    },

    sectionSubtitle: {
        color: '#666',
        fontSize: '1.1rem',
    },

    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: '2rem',
    },

    featureCard: {
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        transition: '0.3s',
    },

    featureIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },

    featureTitle: {
        fontSize: '1.3rem',
        marginBottom: '0.7rem',
        color: '#111',
    },

    featureDesc: {
        color: '#666',
        lineHeight: 1.7,
    },

    howSection: {
        background:
            'linear-gradient(135deg,#0f2027,#203a43,#2c5364)',
        padding: '5rem 4rem',
    },

    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
        gap: '2rem',
    },

    stepCard: {
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '2rem',
        textAlign: 'center',
        color: 'white',
        backdropFilter: 'blur(10px)',
    },

    stepNumber: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#00e676',
    },

    stepIcon: {
        fontSize: '2.5rem',
        margin: '1rem 0',
    },

    stepTitle: {
        fontSize: '1.3rem',
        marginBottom: '0.5rem',
    },

    stepDesc: {
        color: '#ddd',
        lineHeight: 1.7,
    },

    testimonialSection: {
        padding: '5rem 4rem',
        background: '#f7fafc',
    },

    testimonialGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: '2rem',
    },

    testimonialCard: {
        background: 'white',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
    },

    reviewText: {
        color: '#555',
        lineHeight: 1.8,
        marginBottom: '1.5rem',
    },

    reviewUser: {
        color: '#00c853',
    },

    ctaSection: {
        padding: '6rem 2rem',
        textAlign: 'center',
        background:
            'linear-gradient(135deg,#00c853,#009624)',
        color: 'white',
    },

    ctaTitle: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },

    ctaSub: {
        fontSize: '1.1rem',
        marginBottom: '2rem',
    },

    ctaBtn: {
        padding: '1rem 3rem',
        borderRadius: '10px',
        border: 'none',
        background: 'white',
        color: '#00c853',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
    },

    footer: {
        background: '#111',
        color: 'white',
        textAlign: 'center',
        padding: '3rem 2rem',
    },

    footerLogo: {
        fontSize: '2rem',
        marginBottom: '1rem',
    },

    footerText: {
        color: '#aaa',
    },

    footerCopy: {
        marginTop: '1rem',
        color: '#666',
    },

};

export default LandingPage;
