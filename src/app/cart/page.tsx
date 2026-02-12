
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingBag, Trash2, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import Script from "next/script";
import { GuestCheckoutModal } from "@/components/cart/GuestCheckoutModal";

export default function CartPage() {
    const { data: session, status } = useSession();
    const { refreshCart } = useCart();
    const { dictionary } = useLanguage();
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
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

                    setCart({ items });
                } catch (error) {
                    console.error("Failed to hydrate guest cart:", error);
                }
            } else {
                setCart({ items: [] });
            }
        }
        setLoading(false);
    };

    const clearCart = async () => {
        if (status === "authenticated") {
            await fetch("/api/cart", { method: "DELETE" });
        } else {
            localStorage.removeItem("guest_cart");
        }
        await refreshCart();
        fetchCart();
    };

    const removeItem = async (productId: string) => {
        if (status === "authenticated") {
            try {
                const res = await fetch(`/api/cart/${productId}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to remove item");
            } catch (error) {
                console.error("Error removing item:", error);
                toast.error("Failed to remove item");
                return;
            }
        } else {
            const localCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
            const updatedCart = localCart.filter((item: any) => item.productId !== productId);
            localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        }
        await refreshCart();
        fetchCart();
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

    const totalCents = cart?.items?.reduce((acc: number, item: any) => acc + (item.product.priceCents * item.quantity), 0) || 0;

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
                        {cart.items.map((item: any) => (
                            <div key={item.productId || item.id} className="flex items-center justify-between p-6 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.product.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{dictionary.cart.quantity}: {item.quantity}</p>
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline mt-2 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400 tracking-tight tabular-nums text-lg">{formatCurrency(item.product.priceCents * item.quantity)}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{formatCurrency(item.product.priceCents)} {dictionary.cart.each}</p>
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
                                className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-200 dark:shadow-indigo-500/30 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-600 disabled:shadow-none group"
                            >
                                <CreditCard size={20} />
                                {paying ? dictionary.cart.processing : dictionary.cart.payNow}
                                {!paying && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
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
