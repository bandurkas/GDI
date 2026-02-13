
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingBag, Trash2, CreditCard, ArrowRight, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import Script from "next/script";
import { GuestCheckoutModal } from "@/components/cart/GuestCheckoutModal";
import { X } from "lucide-react";

export default function CartPage() {
    const { data: session, status } = useSession();
    const { refreshCart, addToCart } = useCart();
    const { dictionary } = useLanguage();
    const [cart, setCart] = useState<any>(null);
    const [optimisticCart, setOptimisticCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<Record<string, boolean>>({});
    const [paying, setPaying] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status !== "loading") {
            fetchCart();
            refreshCart();
        }
    }, [status]);

    const fetchCart = async () => {
        if (status === "authenticated") {
            try {
                const res = await fetch("/api/cart");
                const data = await res.json();
                setCart(data);
                setOptimisticCart(data);
            } catch (error) {
                console.error("Failed to fetch cart:", error);
            }
        } else if (status === "unauthenticated") {
            const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
            if (localCart.length > 0) {
                try {
                    const productIds = localCart.map((item: any) => item.productId);
                    const res = await fetch("/api/products/batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productIds }),
                    });
                    const products = await res.json();

                    const items = localCart.map((localItem: any) => {
                        const product = products.find((p: any) => p.id === localItem.productId);
                        return {
                            ...localItem,
                            product
                        };
                    }).filter((item: any) => item.product);

                    const cartData = { items };
                    setCart(cartData);
                    setOptimisticCart(cartData);
                } catch (error) {
                    console.error("Failed to hydrate guest cart:", error);
                }
            } else {
                setCart({ items: [] });
                setOptimisticCart({ items: [] });
            }
        }
        setLoading(false);
    };

    const clearCart = async () => {
        const previousCart = cart;
        setOptimisticCart({ items: [] });

        if (status === "authenticated") {
            await fetch("/api/cart", { method: "DELETE" });
        } else {
            localStorage.removeItem("guest_cart");
        }

        toast.success("Cart cleared", {
            action: {
                label: "Undo",
                onClick: async () => {
                    if (status === "authenticated") {
                        for (const item of previousCart.items) {
                            await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }),
                            });
                        }
                    } else {
                        localStorage.setItem("guest_cart", JSON.stringify(previousCart.items.map((i: any) => ({
                            productId: i.product.id,
                            quantity: i.quantity
                        }))));
                    }
                    fetchCart();
                    refreshCart();
                }
            }
        });

        await refreshCart();
        fetchCart();
    };

    const updateQuantity = async (productId: string, delta: number) => {
        // Optimistic Update
        const newOptimisticItems = optimisticCart.items.map((item: any) => {
            if (item.product.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter((item: any) => item.quantity > 0);

        setOptimisticCart({ ...optimisticCart, items: newOptimisticItems });

        setUpdating(prev => ({ ...prev, [productId]: true }));
        try {
            if (delta > 0) {
                // Add
                if (status === "authenticated") {
                    await fetch("/api/cart", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId, quantity: delta }),
                    });
                } else {
                    const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
                    const index = localCart.findIndex((i: any) => i.productId === productId);
                    if (index > -1) localCart[index].quantity += delta;
                    else localCart.push({ productId, quantity: delta });
                    localStorage.setItem("guest_cart", JSON.stringify(localCart));
                }
            } else {
                // Subtract
                if (status === "authenticated") {
                    const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed");
                } else {
                    const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
                    const index = localCart.findIndex((i: any) => i.productId === productId);
                    if (index > -1) {
                        localCart[index].quantity += delta;
                        if (localCart[index].quantity <= 0) localCart.splice(index, 1);
                        localStorage.setItem("guest_cart", JSON.stringify(localCart));
                    }
                }
            }
            await refreshCart();
            fetchCart();
        } catch (e) {
            toast.error("Failed to update cart");
            fetchCart(); // Rollback
        } finally {
            setUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const deleteItemCompletely = async (productId: string) => {
        const itemToDelete = optimisticCart.items.find((i: any) => i.product.id === productId);
        if (!itemToDelete) return;

        const newOptimisticItems = optimisticCart.items.filter((item: any) => item.product.id !== productId);
        setOptimisticCart({ ...optimisticCart, items: newOptimisticItems });

        try {
            if (status === "authenticated") {
                await fetch(`/api/cart/${productId}?all=true`, { method: "DELETE" });
            } else {
                const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
                const updated = localCart.filter((i: any) => i.productId !== productId);
                localStorage.setItem("guest_cart", JSON.stringify(updated));
            }

            toast.success(`${itemToDelete.product.name} removed`, {
                action: {
                    label: "Undo",
                    onClick: async () => {
                        if (status === "authenticated") {
                            await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ productId, quantity: itemToDelete.quantity }),
                            });
                        } else {
                            const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
                            localCart.push({ productId, quantity: itemToDelete.quantity });
                            localStorage.setItem("guest_cart", JSON.stringify(localCart));
                        }
                        fetchCart();
                        refreshCart();
                    }
                }
            });

            await refreshCart();
            fetchCart();
        } catch (e) {
            toast.error("Removal failed");
            fetchCart();
        }
    };

    const initiateCheckout = async (guestEmail?: string, guestName?: string) => {
        setPaying(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentMethod: "MIDTRANS",
                    guestEmail,
                    guestName,
                    items: status === "unauthenticated" ? cart.items.map((i: any) => ({ productId: i.productId, quantity: i.quantity })) : undefined
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.status === "COMPLETED") {
                    if (status === "unauthenticated") localStorage.removeItem("guest_cart");
                    router.push(`/checkout/success?orderId=${data.id}${guestEmail ? `&email=${guestEmail}` : ""}`);
                } else if (data.snapToken) {
                    // @ts-ignore
                    window.snap.pay(data.snapToken, {
                        onSuccess: function (result: any) {
                            if (status === "unauthenticated") localStorage.removeItem("guest_cart");
                            router.push(`/checkout/success?orderId=${data.id}${guestEmail ? `&email=${guestEmail}` : ""}`);
                        },
                        onPending: function (result: any) {
                            router.push("/dashboard/orders");
                        },
                        onError: function (result: any) {
                            toast.error(dictionary.cart.paymentFailed);
                            setPaying(false);
                        },
                        onClose: function () {
                            setPaying(false);
                        },
                    });
                }
            } else {
                toast.error(data.error || dictionary.cart.paymentFailed);
                setPaying(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error(dictionary.cart.paymentFailed);
            setPaying(false);
        }
    };

    const handlePay = async () => {
        if (!agreed) return;

        if (status === "unauthenticated") {
            setShowGuestModal(true);
            return;
        }

        initiateCheckout();
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    const targetCart = optimisticCart || cart;
    const totalCents = targetCart?.items?.reduce((acc: number, item: any) => acc + (item.product.priceCents * item.quantity), 0) || 0;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <Script
                src="https://app.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            />
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <ShoppingBag className="text-indigo-600 dark:text-indigo-400" />
                    {dictionary.cart.title}
                </h1>
                {cart?.items?.length > 0 && (
                    <button onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2">
                        <Trash2 size={16} />
                        {dictionary.cart.emptyCart}
                    </button>
                )}
            </div>

            {!cart?.items?.length ? (
                <div className="group relative text-center py-24 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 dark:to-black/20 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 rounded-3xl bg-white dark:bg-white/5 shadow-xl shadow-slate-200 dark:shadow-black/20 flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 group-hover:scale-110 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all duration-500">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{dictionary.cart.cartEmptyTitle}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">{dictionary.cart.cartEmptyMsg}</p>
                        <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-500/30 hover:scale-105 active:scale-95">
                            {dictionary.cart.startShopping}
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        {targetCart.items.map((item: any) => (
                            <div key={item.product.id} className="group relative flex items-center justify-between p-6 rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300">
                                <button
                                    onClick={() => deleteItemCompletely(item.product.id)}
                                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10"
                                    title="Remove item"
                                >
                                    <X size={14} />
                                </button>

                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.product.name}</h3>
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center bg-slate-100/50 dark:bg-white/5 rounded-2xl p-1 border border-slate-200/50 dark:border-white/5">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                disabled={updating[item.product.id]}
                                                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-red-500 hover:shadow-sm transition-all active:scale-90 disabled:opacity-50"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="font-black text-slate-900 dark:text-white min-w-[32px] text-center tabular-nums">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                disabled={updating[item.product.id]}
                                                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 hover:shadow-sm transition-all active:scale-90 disabled:opacity-50"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-6">
                                    <p className="font-black text-slate-900 dark:text-white tracking-tight tabular-nums text-xl">{formatCurrency(item.product.priceCents * item.quantity)}</p>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums uppercase tracking-widest">{formatCurrency(item.product.priceCents)} {dictionary.cart.each}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 bg-indigo-50/50 dark:bg-slate-900/80 backdrop-blur-md shadow-lg shadow-indigo-50 dark:shadow-none">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{dictionary.cart.summary}</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                                    <span>{dictionary.cart.subtotal}</span>
                                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">{formatCurrency(totalCents)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                                    <span>{dictionary.cart.tax}</span>
                                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</span>
                                </div>
                                <div className="pt-4 border-t border-indigo-100 dark:border-white/10 flex justify-between items-baseline">
                                    <span className="font-bold text-slate-900 dark:text-white text-lg">{dictionary.cart.total}</span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl tracking-tighter tabular-nums">{formatCurrency(totalCents)}</span>
                                </div>
                            </div>



                            <div className="flex items-start gap-3 mb-8 group/agree cursor-pointer" onClick={() => setAgreed(!agreed)}>
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${agreed ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-white/20"}`}>
                                    {agreed && <ArrowRight size={12} className="text-white" />}
                                </div>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">
                                    {dictionary.cart.agreeTo}{" "}
                                    <Link
                                        href="/refund"
                                        target="_blank"
                                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {dictionary.cart.refundPolicy}
                                        <ArrowRight size={10} />
                                    </Link>
                                </span>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={paying || !agreed}
                                className="w-full relative overflow-hidden group flex items-center justify-between bg-slate-900 dark:bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-2xl shadow-slate-200 dark:shadow-indigo-500/20 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:shadow-none"
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard size={22} className="group-hover:rotate-12 transition-transform" />
                                    <span>{paying ? dictionary.cart.processing : dictionary.cart.payNow}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md">{formatCurrency(totalCents)}</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GuestCheckoutModal
                isOpen={showGuestModal}
                onClose={() => {
                    setShowGuestModal(false);
                    setPaying(false);
                }}
                onSubmit={(email, name) => {
                    setShowGuestModal(false);
                    initiateCheckout(email, name);
                }}
            />
        </div>
    );
}
