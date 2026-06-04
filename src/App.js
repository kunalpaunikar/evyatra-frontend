import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Stations from './pages/Stations';
import ForgotPassword from './pages/ForgotPassword';
import MyBookings from './pages/MyBookings';
import MyProfile from './pages/MyProfile';

import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* Landing page — apna Navbar hai */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth pages — sirf brand dikhega */}
                    <Route path="/login" element={<><Navbar /><Login /></>} />
                    <Route path="/register" element={<><Navbar /><Register /></>} />
                    <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />

                    {/* Protected pages — Navbar ke saath */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Navbar />
                            <Home />
                        </ProtectedRoute>
                    } />

                    <Route path="/stations" element={
                        <ProtectedRoute>
                            <Navbar />
                            <Stations />
                        </ProtectedRoute>
                    } />

                    <Route path="/bookings" element={
                    <ProtectedRoute>
                    <Navbar />
                    <MyBookings />
                    </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                    <ProtectedRoute>
                    <Navbar />
                    <MyProfile />
                    </ProtectedRoute>
                    } />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;