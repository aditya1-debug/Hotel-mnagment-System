import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setUser(res.data.data);
        return res.data.data;
    };

    const register = async (payload) => {
        const res = await api.post('/auth/register', payload);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        setUser(res.data.data);
        return res.data.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
