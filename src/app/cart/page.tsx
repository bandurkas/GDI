"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingBag, Trash2, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
    const { data: session, status } = useSession();
    const { refreshCart } = useCart();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }
        if (status === "authenticated") {
            fetchCart();
            refreshCart(); // Ensure badge is in sync on load
        }
    }, [status]);

    const fetchCart = async () => {
        const res = await fetch("/api/cart");
        const data = await res.json();
        setCart(data);
        setLoading(false);
    };

    const clearCart = async () => {
        await fetch("/api/cart", { method: "DELETE" });
        await fetchCart();
        await refreshCart(); // Update badge
    };

    const handlePay = async () => {
        setPaying(true);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentMethod: "TEST" }),
            });

            if (res.ok) {
                router.push("/dashboard?success=true");
            } else {
                const data = await res.json();
                alert(data.error || "Payment failed");
            }
        } catch (err) {
            alert("Payment failed");
        } finally {
            setPaying(false);
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    const totalCents = cart?.items?.reduce((acc: number, item: any) => acc + (item.product.priceCents * item.quantity), 0) || 0;

    // Get cashback percentage from session, default to 80% if not set
    const userPercentage = session?.user?.cashbackPercentage ?? 80.0;
    const cashbackCents = Math.floor(totalCents * (userPercentage / 100));



    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <ShoppingBag className="text-indigo-600 dark:text-indigo-400" />
                    Your Shopping Cart
                </h1>
                {cart?.items?.length > 0 && (
                    <button onClick={clearCart} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors flex items-center gap-2">
                        <Trash2 size={16} />
                        Empty Cart
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
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">Looks like you haven't added any AI solutions to your cart yet.</p>
                        <Link href="/products" className="inline-flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-500/30 hover:scale-105 active:scale-95">
                            Start Shopping
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.product.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums text-lg">{formatCurrency((item.product.priceCents * item.quantity) * 100)}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{formatCurrency(item.product.priceCents * 100)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl border border-indigo-100 dark:border-indigo-500/10 bg-indigo-50/50 dark:bg-slate-900/80 backdrop-blur-md shadow-lg shadow-indigo-50 dark:shadow-none">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">{formatCurrency(totalCents * 100)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-sm font-medium">
                                    <span>Tax</span>
                                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">{formatCurrency(0)}</span>
                                </div>
                                <div className="pt-4 border-t border-indigo-100 dark:border-white/10 flex justify-between items-baseline">
                                    <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl tracking-tighter tabular-nums">{formatCurrency(totalCents * 100)}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Estimated Cashback:</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">{formatCurrency(cashbackCents * 100)}</span>
                                </div>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-widest font-bold">{userPercentage}% INSTANT REWARD</p>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={paying}
                                className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-500/30 disabled:bg-slate-400 group"
                            >
                                <CreditCard size={20} />
                                {paying ? "Processing..." : "Pay Now"}
                                {!paying && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
