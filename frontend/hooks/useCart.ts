import { Cart, CartItem } from '@/types/product';
import { useCallback, useMemo, useState } from 'react';

export interface UseCartReturn {
    cart: Cart;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

export const useCart = (): UseCartReturn => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
        setItems((prevItems) => {
            // Always add as a new item (don't combine with existing)
            // This matches the calculator workflow where each "add" is a separate line
            const cartItem: CartItem = {
                ...newItem,
                id: `cart-${Date.now()}-${Math.random()}`,
            };
            return [...prevItems, cartItem];
        });
    }, []);

    const removeItem = useCallback((itemId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        quantity,
                        totalPrice: quantity * item.unitPrice,
                    }
                    : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0);
    }, [items]);

    const itemCount = useMemo(() => {
        return items.length;
    }, [items]);

    const cart: Cart = useMemo(
        () => ({
            items,
            totalAmount,
        }),
        [items, totalAmount]
    );

    return {
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        itemCount,
    };
};
