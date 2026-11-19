import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/mine');
                setOrders(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load orders');
            }
        };
        fetchOrders();
    }, []);

    return (
        <div className="page">
            <h1>My Orders</h1>
            {error && <p className="error-text">{error}</p>}

            {orders.map((order) => (
                <Link to={`/orders/${order._id}`} key={order._id} className="card order-row">
                    <div>
                        <strong>{order.restaurant?.name}</strong>
                        <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className={`status status-${order.status}`}>{order.status.replace(/_/g, ' ')}</p>
                        <p>₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                </Link>
            ))}

            {orders.length === 0 && <p>You haven't placed any orders yet.</p>}
        </div>
    );
}

export default MyOrders;
