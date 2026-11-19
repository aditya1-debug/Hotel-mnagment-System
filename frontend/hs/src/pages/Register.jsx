import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'customer',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h1>Register</h1>
                {error && <p className="error-text">{error}</p>}
                <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
                <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
                <select name="role" value={form.role} onChange={handleChange}>
                    <option value="customer">Customer</option>
                    <option value="owner">Restaurant Owner</option>
                    <option value="delivery">Delivery Partner</option>
                </select>
                <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
                <p>Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
}

export default Register;
