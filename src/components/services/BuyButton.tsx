"use client";

import { useState } from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

/** Adds a package to the cart (existing bank-transfer checkout flow). Shows the auth modal if not logged in. */
export function BuyButton({ productId, label, className }: { productId: string; label: string; className?: string }) {
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(false);
    const onClick = async () => {
        setLoading(true);
        try { await addToCart(productId); } finally { setLoading(false); }
    };
    return (
        <button type="button" onClick={onClick} disabled={loading} className={className} data-package={productId}>
            {loading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><ShoppingCart size={16} /> {label} <ArrowRight size={16} /></>}
        </button>
    );
}
