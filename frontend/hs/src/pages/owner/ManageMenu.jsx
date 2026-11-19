import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

function ManageMenu() {
    const { restaurantId } = useParams();
    const [menuItems, setMenuItems] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });
    const [error, setError] = useState('');

    const fetchMenu = async () => {
        try {
            const res = await api.get(`/menu/restaurant/${restaurantId}`);
            setMenuItems(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load menu');
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [restaurantId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/menu', { ...form, price: Number(form.price), restaurantId });
            setForm({ name: '', description: '', price: '', category: '' });
            fetchMenu();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add item');
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Remove this menu item?')) return;
        try {
            await api.delete(`/menu/${itemId}`);
            fetchMenu();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete item');
        }
    };

    return (
        <div className="page">
            <h1>Manage Menu</h1>
            {error && <p className="error-text">{error}</p>}

            <form className="auth-form" onSubmit={handleAdd}>
                <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} required />
                <input name="category" placeholder="Category (e.g. Pizza)" value={form.category} onChange={handleChange} />
                <input name="price" type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
                <button type="submit">Add Item</button>
            </form>

            <div className="card-grid">
                {menuItems.map((item) => (
                    <div className="card" key={item._id}>
                        <h3>{item.name}</h3>
                        <p className="muted">{item.category}</p>
                        <p className="price">₹{item.price}</p>
                        <button onClick={() => handleDelete(item._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManageMenu;
