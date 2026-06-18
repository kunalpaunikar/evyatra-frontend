import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('name');
        const role = localStorage.getItem('role');
        return token ? { token, name, role } : null;
    });

    // Check token expiry - runs every 1 minute
    useEffect(() => {
        const checkExpiry = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Decode JWT payload
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = payload.exp * 1000; // convert to milliseconds

                if (Date.now() > expiry) {
                    // Token has expired - logout now
                    logout();
                }
            } catch (e) {
                logout();
            }
        };

        checkExpiry(); // Check on page load
        const interval = setInterval(checkExpiry, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name);
        localStorage.setItem('role', data.role);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);