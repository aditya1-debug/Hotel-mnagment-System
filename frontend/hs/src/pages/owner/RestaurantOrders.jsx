import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function RestaurantOrders() {
    const { restaurantId } = useParams();
    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/orders/restaurant/${restaurantId}`);
            setOrders(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load orders');
        }
    };

    useEffect(() => {
        fetchOrders();
        api.get('/auth/delivery-partners').then((res) => setPartners(res.data.data)).catch(() => {});
    }, [restaurantId]);

    const handleStatusChange = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAssign = async (orderId, deliveryPartnerId) => {
        if (!deliveryPartnerId) return;
        try {
            await api.patch(`/orders/${orderId}/status`, { deliveryPartnerId });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign delivery partner');
        }
    };

    return (
        <div className="page">
            <h1>Restaurant Orders</h1>
            {error && <p className="error-text">{error}</p>}

            {orders.map((order) => (
                <div className="card order-row" key={order._id}>
                    <div>
                        <strong>{order.customer?.name}</strong> ({order.customer?.phone})
                        <p className="muted">{new Date(order.createdAt).toLocaleString()}</p>
                        <p>₹{order.totalAmount.toFixed(2)} · {order.paymentMethod} ({order.paymentStatus})</p>
                    </div>
                    <div className="order-controls">
                        <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <select defaultValue="" onChange={(e) => handleAssign(order._id, e.target.value)}>
                            <option value="" disabled>
                                {order.deliveryPartner ? `Assigned: ${order.deliveryPartner.name || 'partner'}` : 'Assign delivery partner'}
                            </option>
                            {partners.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}

            {orders.length === 0 && <p>No orders yet.</p>}
        </div>
    );
}

export default RestaurantOrders;
