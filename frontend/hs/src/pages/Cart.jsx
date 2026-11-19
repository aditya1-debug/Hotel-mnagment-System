import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

function Cart() {
    const { restaurantId, items, updateQuantity, removeItem, clearCart, total } = useCart();
    const navigate = useNavigate();

    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/orders', {
                restaurantId,
                items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
                deliveryAddress,
                paymentMethod,
            });
            clearCart();
            navigate(`/orders/${res.data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="page">
                <h1>Your Cart</h1>
                <p>Your cart is empty.</p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Your Cart</h1>

            {items.map((item) => (
                <div className="cart-row" key={item.menuItemId}>
                    <span>{item.name}</span>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.menuItemId, Number(e.target.value))}
                    />
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.menuItemId)}>Remove</button>
                </div>
            ))}

            <h2>Total: ₹{total.toFixed(2)}</h2>

            <form className="checkout-form" onSubmit={handlePlaceOrder}>
                {error && <p className="error-text">{error}</p>}
                <textarea
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                />
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cod">Cash on Delivery</option>
                    <option value="mock_online">Online Payment (Mock)</option>
                </select>
                <button type="submit" disabled={loading}>
                    {loading ? 'Placing order...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
}

export default Cart;
