
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Toaster, toast } from 'sonner';
import { GuestAuthModal } from "@/components/ui/GuestAuthModal";

interface CartContextType {
    itemsCount: number;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [itemsCount, setItemsCount] = useState(0);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const refreshCart = async () => {
        try {
            const res = await fetch("/api/cart?t=" + new Date().getTime());
            if (res.ok) {
                const data = await res.json();
                const count = data.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                setItemsCount(count);
            }
        } catch (e) {
            console.error("Failed to refresh cart count", e);
        }
    };

    const addToCart = async (productId: string) => {
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity: 1 }),
            });

            if (res.ok) {
                await refreshCart();
                toast.success('Added to cart!');
                return true;
            } else if (res.status === 401) {
                setShowAuthModal(true);
                return false;
            } else {
                toast.error('Failed to add to cart');
                return false;
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error('Error adding to cart');
            return false;
        }
    };

    useEffect(() => {
        refreshCart();
    }, []);

    return (
        <CartContext.Provider value={{ itemsCount, refreshCart, addToCart }}>
            {children}
            <GuestAuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
            <Toaster position="bottom-right" richColors />
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
