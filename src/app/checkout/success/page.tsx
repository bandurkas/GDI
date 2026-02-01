
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, UserPlus, LogIn, ShoppingBag, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useSession } from "next-auth/react";

function SuccessContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");
    const guestEmail = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || !guestEmail) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register-guest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: guestEmail, password }),
            });

            if (res.ok) {
                toast.success("Account saved! You can now log in.");
                setRegistered(true);
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to save account");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-16 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                {/* Header Section */}
                <div className="bg-emerald-500 p-12 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                        <h1 className="text-4xl font-black mb-2 tracking-tight">Payment Successful!</h1>
                        <p className="text-emerald-50 font-medium">Thanks a lot for your payment, our team will contact you soon.</p>
                    </div>
                </div>

                <div className="p-10 space-y-10">
                    {/* Order Details */}
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Order Identifier</p>
                                <p className="font-mono font-bold text-slate-900 dark:text-white">{orderId}</p>
                            </div>
                        </div>
                    </div>

                    {/* Guest Registration section */}
                    {guestEmail && !registered && (
                        <div className="relative p-8 rounded-[2rem] bg-indigo-600 overflow-hidden shadow-xl shadow-indigo-500/20">
                            {/* Decorative background */}
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 rounded-lg text-white">
                                        <UserPlus size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Save your account</h2>
                                </div>
                                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                    We've created a temporary account for <strong>{guestEmail}</strong>. Set a password now to access your dashboard and track your rewards.
                                </p>

                                <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Choose a password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder:text-indigo-200 outline-none focus:ring-2 focus:ring-white/50 transition-all font-medium pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? "Saving..." : "Save Account"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {registered && (
                        <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20 text-center animate-in fade-in zoom-in duration-500">
                            <div className="h-12 w-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400 mb-2">Registration Complete!</h3>
                            <p className="text-emerald-700 dark:text-emerald-500/70 text-sm mb-6">Your password has been set. You can now access all premium features.</p>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                            >
                                <LogIn size={18} />
                                Log In Now
                            </Link>
                        </div>
                    )}

                    {/* Navigation Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Link
                            href="/dashboard"
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3">
                                <Package size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">View Orders</span>
                        </Link>

                        <Link
                            href="/products"
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                        >
                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Continue Shopping</span>
                        </Link>
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
                    <p className="text-xs font-medium text-slate-400">Confirmation email sent to <strong>{guestEmail || session?.user?.email}</strong></p>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
