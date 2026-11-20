import { useEffect, useState } from 'react';
import api from '../../api/axios';

const ROLE_OPTIONS = ['customer', 'owner', 'delivery', 'admin'];
const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function StatsPanel() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/admin/stats')
            .then((res) => setStats(res.data.data))
            .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'));
    }, []);

    if (error) return <p className="error-text">{error}</p>;
    if (!stats) return <p>Loading...</p>;

    return (
        <div className="card-grid">
            <div className="card">
                <h3>Customers</h3>
                <p className="price">{stats.usersByRole.customer || 0}</p>
            </div>
            <div className="card">
                <h3>Restaurant Owners</h3>
                <p className="price">{stats.usersByRole.owner || 0}</p>
            </div>
            <div className="card">
                <h3>Delivery Partners</h3>
                <p className="price">{stats.usersByRole.delivery || 0}</p>
            </div>
            <div className="card">
                <h3>Admins</h3>
                <p className="price">{stats.usersByRole.admin || 0}</p>
            </div>
            <div className="card">
                <h3>Restaurants</h3>
                <p className="price">{stats.totalRestaurants}</p>
            </div>
            <div className="card">
                <h3>Orders</h3>
                <p className="price">{stats.totalOrders}</p>
            </div>
            <div className="card">
                <h3>Delivered Revenue</h3>
                <p className="price">₹{stats.deliveredRevenue.toFixed(2)}</p>
            </div>
        </div>
    );
}

function UsersPanel() {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users', { params: roleFilter ? { role: roleFilter } : {} });
            setUsers(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const toggleActive = async (userId, isActive) => {
        try {
            await api.patch(`/admin/users/${userId}/active`, { isActive: !isActive });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update account status');
        }
    };

    const changeRole = async (userId, role) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        }
    };

    return (
        <div>
            {error && <p className="error-text">{error}</p>}
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All roles</option>
                {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>

            {users.map((u) => (
                <div className="card order-row" key={u._id}>
                    <div>
                        <strong>{u.name}</strong> ({u.email})
                        <p className="muted">{u.phone || 'No phone on file'}</p>
                        <p className={u.isActive ? 'status status-delivered' : 'status status-cancelled'}>
                            {u.isActive ? 'active' : 'deactivated'}
                        </p>
                    </div>
                    <div className="order-controls">
                        <select defaultValue={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <button onClick={() => toggleActive(u._id, u.isActive)}>
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </div>
                </div>
            ))}

            {users.length === 0 && <p>No users found.</p>}
        </div>
    );
}

function RestaurantsPanel() {
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState('');

    const fetchRestaurants = async () => {
        try {
            const res = await api.get('/admin/restaurants');
            setRestaurants(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load restaurants');
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const toggleActive = async (restaurantId, isActive) => {
        try {
            await api.patch(`/admin/restaurants/${restaurantId}/active`, { isActive: !isActive });
            fetchRestaurants();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update restaurant status');
        }
    };

    return (
        <div>
            {error && <p className="error-text">{error}</p>}
            {restaurants.map((r) => (
                <div className="card order-row" key={r._id}>
                    <div>
                        <strong>{r.name}</strong>
                        <p className="muted">Owner: {r.owner?.name} ({r.owner?.email})</p>
                        <p className={r.isActive ? 'status status-delivered' : 'status status-cancelled'}>
                            {r.isActive ? 'active' : 'deactivated'}
                        </p>
                    </div>
                    <div className="order-controls">
                        <button onClick={() => toggleActive(r._id, r.isActive)}>
                            {r.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                    </div>
                </div>
            ))}

            {restaurants.length === 0 && <p>No restaurants found.</p>}
        </div>
    );
}

function OrdersPanel() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/admin/orders', { params: statusFilter ? { status: statusFilter } : {} });
                setOrders(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load orders');
            }
        };
        fetchOrders();
    }, [statusFilter]);

    return (
        <div>
            {error && <p className="error-text">{error}</p>}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
            </select>

            {orders.map((o) => (
                <div className="card order-row" key={o._id}>
                    <div>
                        <strong>{o.restaurant?.name}</strong> → {o.customer?.name}
                        <p className="muted">{new Date(o.createdAt).toLocaleString()}</p>
                        <p className="muted">Delivery: {o.deliveryPartner?.name || 'Not yet assigned'}</p>
                    </div>
                    <div>
                        <p className={`status status-${o.status}`}>{o.status.replace(/_/g, ' ')}</p>
                        <p>₹{o.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            ))}

            {orders.length === 0 && <p>No orders found.</p>}
        </div>
    );
}

function AdminDashboard() {
    const [tab, setTab] = useState('overview');

    const tabs = [
        ['overview', 'Overview'],
        ['users', 'Users'],
        ['restaurants', 'Restaurants'],
        ['orders', 'Orders'],
    ];

    return (
        <div className="page">
            <h1>Admin Dashboard</h1>

            <div className="search-bar">
                {tabs.map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} disabled={tab === key}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && <StatsPanel />}
            {tab === 'users' && <UsersPanel />}
            {tab === 'restaurants' && <RestaurantsPanel />}
            {tab === 'orders' && <OrdersPanel />}
        </div>
    );
}

export default AdminDashboard;
