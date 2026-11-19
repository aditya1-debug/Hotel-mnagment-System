import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function RestaurantDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { addItem } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restRes, reviewRes] = await Promise.all([
                    api.get(`/restaurants/${id}`),
                    api.get(`/reviews/restaurant/${id}`),
                ]);
                setRestaurant(restRes.data.data);
                setReviews(reviewRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load restaurant');
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await api.get(`/menu/restaurant/${id}`, { params: { keyword } });
                setMenuItems(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load menu');
            }
        };
        fetchMenu();
    }, [id, keyword]);

    if (error) return <div className="page"><p className="error-text">{error}</p></div>;
    if (!restaurant) return <div className="page"><p>Loading...</p></div>;

    return (
        <div className="page">
            <h1>{restaurant.name}</h1>
            <p className="muted">{restaurant.cuisine} · {restaurant.address}</p>
            <p>⭐ {restaurant.avgRating?.toFixed(1) || 'No ratings'} ({restaurant.numReviews} reviews)</p>
            <p>{restaurant.description}</p>

            <h2>Menu</h2>
            <input
                className="search-bar"
                placeholder="Search menu items..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <div className="card-grid">
                {menuItems.map((item) => (
                    <div className="card" key={item._id}>
                        <h3>{item.name}</h3>
                        <p className="muted">{item.category}</p>
                        <p>{item.description}</p>
                        <p className="price">₹{item.price}</p>
                        {user?.role === 'customer' && (
                            <button
                                onClick={() =>
                                    addItem(restaurant._id, {
                                        menuItemId: item._id,
                                        name: item.name,
                                        price: item.price,
                                    })
                                }
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                ))}
            </div>
            {menuItems.length === 0 && <p>No menu items found.</p>}

            <h2>Reviews</h2>
            {reviews.map((r) => (
                <div className="review" key={r._id}>
                    <strong>{r.customer?.name}</strong> — ⭐ {r.rating}
                    <p>{r.comment}</p>
                </div>
            ))}
            {reviews.length === 0 && <p>No reviews yet.</p>}
        </div>
    );
}

export default RestaurantDetail;
