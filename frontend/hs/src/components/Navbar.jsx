import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">FoodOrder</Link>

            <div className="nav-links">
                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

                {user?.role === 'customer' && (
                    <>
                        <Link to="/my-orders">My Orders</Link>
                        <Link to="/cart">Cart ({items.length})</Link>
                    </>
                )}

                {user?.role === 'owner' && <Link to="/owner">Owner Dashboard</Link>}
                {user?.role === 'delivery' && <Link to="/delivery">Deliveries</Link>}
                {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}

                {user && (
                    <>
                        <span className="user-chip">{user.name} ({user.role})</span>
                        <button onClick={handleLogout} className="btn-link">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
