import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function OwnerDashboard() {
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMine = async () => {
            try {
                const res = await api.get('/restaurants/mine');
                setRestaurants(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load restaurants');
            }
        };
        fetchMine();
    }, []);

    return (
        <div className="page">
            <h1>Owner Dashboard</h1>
            {error && <p className="error-text">{error}</p>}

            <Link to="/owner/new-restaurant"><button>+ New Restaurant</button></Link>

            <div className="card-grid">
                {restaurants.map((r) => (
                    <div className="card" key={r._id}>
                        <h2>{r.name}</h2>
                        <p className="muted">{r.cuisine} · {r.address}</p>
                        <div className="card-actions">
                            <Link to={`/owner/restaurants/${r._id}/menu`}><button>Manage Menu</button></Link>
                            <Link to={`/owner/restaurants/${r._id}/orders`}><button>View Orders</button></Link>
                        </div>
                    </div>
                ))}
            </div>

            {restaurants.length === 0 && <p>You haven't created a restaurant yet.</p>}
        </div>
    );
}

export default OwnerDashboard;
