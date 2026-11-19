import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function OrderDetail() {
    const { id } = useParams();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewMsg, setReviewMsg] = useState('');

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load order');
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleReview = async (e) => {
        e.preventDefault();
        setReviewMsg('');
        try {
            await api.post('/reviews', { orderId: id, rating: Number(rating), comment });
            setReviewMsg('Review submitted. Thank you!');
        } catch (err) {
            setReviewMsg(err.response?.data?.message || 'Failed to submit review');
        }
    };

    if (error) return <div className="page"><p className="error-text">{error}</p></div>;
    if (!order) return <div className="page"><p>Loading...</p></div>;

    const stepIndex = STATUS_STEPS.indexOf(order.status);

    return (
        <div className="page">
            <h1>Order #{order._id.slice(-6)}</h1>
            <p className="muted">{order.restaurant?.name} · {new Date(order.createdAt).toLocaleString()}</p>

            {order.status !== 'cancelled' ? (
                <div className="tracker">
                    {STATUS_STEPS.map((step, i) => (
                        <div key={step} className={`tracker-step ${i <= stepIndex ? 'done' : ''}`}>
                            {step.replace(/_/g, ' ')}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="status status-cancelled">Cancelled</p>
            )}

            <h2>Items</h2>
            <ul>
                {order.items.map((item) => (
                    <li key={item.menuItem}>{item.name} × {item.quantity} — ₹{(item.price * item.quantity).toFixed(2)}</li>
                ))}
            </ul>
            <p><strong>Total: ₹{order.totalAmount.toFixed(2)}</strong></p>
            <p>Payment: {order.paymentMethod} ({order.paymentStatus})</p>
            <p>Delivery address: {order.deliveryAddress}</p>
            {order.deliveryPartner && <p>Delivery partner: {order.deliveryPartner.name} ({order.deliveryPartner.phone})</p>}

            {user?.role === 'customer' && order.status === 'delivered' && (
                <div className="review-form">
                    <h2>Leave a Review</h2>
                    {reviewMsg && <p>{reviewMsg}</p>}
                    <form onSubmit={handleReview}>
                        <select value={rating} onChange={(e) => setRating(e.target.value)}>
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <button type="submit">Submit Review</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default OrderDetail;
