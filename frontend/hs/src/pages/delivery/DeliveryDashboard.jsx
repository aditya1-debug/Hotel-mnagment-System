import { useEffect, useState } from 'react';
import api from '../../api/axios';

function DeliveryDashboard() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/assigned');
            setOrders(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load assigned orders');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdate = async (orderId, status) => {
        try {
            await api.patch(`/orders/${orderId}/delivery-status`, { status });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update delivery status');
        }
    };

    return (
        <div className="page">
            <h1>Assigned Deliveries</h1>
            {error && <p className="error-text">{error}</p>}

            {orders.map((order) => (
                <div className="card order-row" key={order._id}>
                    <div>
                        <strong>{order.restaurant?.name}</strong> → {order.customer?.name}
                        <p className="muted">{order.deliveryAddress}</p>
                        <p className={`status status-${order.status}`}>{order.status.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="order-controls">
                        {order.status === 'confirmed' || order.status === 'preparing' ? (
                            <button onClick={() => handleUpdate(order._id, 'out_for_delivery')}>Mark Out for Delivery</button>
                        ) : null}
                        {order.status === 'out_for_delivery' && (
                            <button onClick={() => handleUpdate(order._id, 'delivered')}>Mark Delivered</button>
                        )}
                    </div>
                </div>
            ))}

            {orders.length === 0 && <p>No deliveries assigned to you yet.</p>}
        </div>
    );
}

export default DeliveryDashboard;
