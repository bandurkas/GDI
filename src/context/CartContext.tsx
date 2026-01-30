
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Toaster, toast } from 'sonner';
import { useSession } from "next-auth/react";

interface CartContextType {
    itemsCount: number;
    refreshCart: () => Promise<void>;
    addToCart: (productId: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [itemsCount, setItemsCount] = useState(0);

    const refreshCart = async () => {
        if (status === "authenticated") {
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
        } else if (status === "unauthenticated") {
            const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
            const count = localCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setItemsCount(count);
        }
    };

    const addToCart = async (productId: string) => {
        if (status === "authenticated") {
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
                }
                toast.error('Failed to add to cart');
                return false;
            } catch (error) {
                console.error("Add to cart error:", error);
                toast.error('Error adding to cart');
                return false;
            }
        } else {
            // Guest mode
            const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
            const existingItem = localCart.find((item: any) => item.productId === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                localCart.push({ productId, quantity: 1 });
            }

            localStorage.setItem("guest_cart", JSON.stringify(localCart));
            await refreshCart();
            toast.success('Added to cart (guest)!');
            return true;
        }
    };

    // Auto refresh on auth change
    useEffect(() => {
        if (status !== "loading") {
            refreshCart();
        }
    }, [status]);

    return (
        <CartContext.Provider value={{ itemsCount, refreshCart, addToCart }}>
            {children}
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
