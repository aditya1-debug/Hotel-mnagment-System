import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function RestaurantForm() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', cuisine: '', address: '', description: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/restaurants', form);
            navigate('/owner');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create restaurant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <h1>New Restaurant</h1>
            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="error-text">{error}</p>}
                <input name="name" placeholder="Restaurant name" value={form.name} onChange={handleChange} required />
                <input name="cuisine" placeholder="Cuisine (e.g. Italian)" value={form.cuisine} onChange={handleChange} />
                <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Restaurant'}</button>
            </form>
        </div>
    );
}

export default RestaurantForm;
