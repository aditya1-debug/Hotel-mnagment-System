import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRestaurants = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get('/restaurants', { params: { keyword, page, limit: 6 } });
                setRestaurants(res.data.data);
                setPages(res.data.pagination.pages || 1);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load restaurants');
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, [keyword, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setKeyword(e.target.elements.search.value);
    };

    return (
        <div className="page">
            <h1>Restaurants</h1>

            <form className="search-bar" onSubmit={handleSearch}>
                <input name="search" placeholder="Search restaurants or cuisine..." defaultValue={keyword} />
                <button type="submit">Search</button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <div className="card-grid">
                {restaurants.map((r) => (
                    <Link to={`/restaurants/${r._id}`} key={r._id} className="card">
                        <h2>{r.name}</h2>
                        <p>{r.cuisine}</p>
                        <p className="muted">{r.address}</p>
                        <p>⭐ {r.avgRating?.toFixed(1) || 'No ratings'} ({r.numReviews} reviews)</p>
                    </Link>
                ))}
            </div>

            {!loading && restaurants.length === 0 && <p>No restaurants found.</p>}

            <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
                <span>Page {page} of {pages}</span>
                <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
        </div>
    );
}

export default Home;
