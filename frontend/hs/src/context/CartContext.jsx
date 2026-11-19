import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'cart';

export function CartProvider({ children }) {
    const [restaurantId, setRestaurantId] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).restaurantId : null;
    });
    const [items, setItems] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored).items : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ restaurantId, items }));
    }, [restaurantId, items]);

    const addItem = (restId, item) => {
        if (restaurantId && restaurantId !== restId) {
            const confirmed = window.confirm(
                'Your cart has items from another restaurant. Clear cart and add this item instead?'
            );
            if (!confirmed) return;
            setItems([]);
        }
        setRestaurantId(restId);
        setItems((prev) => {
            const existing = prev.find((i) => i.menuItemId === item.menuItemId);
            if (existing) {
                return prev.map((i) =>
                    i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeItem = (menuItemId) => {
        setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    };

    const updateQuantity = (menuItemId, quantity) => {
        if (quantity < 1) return removeItem(menuItemId);
        setItems((prev) => prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)));
    };

    const clearCart = () => {
        setItems([]);
        setRestaurantId(null);
    };

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{ restaurantId, items, addItem, removeItem, updateQuantity, clearCart, total }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
