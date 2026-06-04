import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import UserDashboard from '../components/UserDashboard';

function Home() {
    const { user } = useAuth();

    return (
        <div>
            {user?.role === 'ROLE_ADMIN' ? (
                <AdminDashboard />
            ) : (
                <UserDashboard />
            )}
        </div>
    );
}

export default Home;