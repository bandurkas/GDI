"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const { dictionary } = useLanguage();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setIsSubmitted(true);
                toast.success(dictionary.auth.resetLinkSent);
            } else {
                const data = await res.json();
                toast.error(data.error || dictionary.auth.errorGeneric);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            toast.error(dictionary.auth.errorGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 flex flex-col justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <div className="max-w-md w-full mx-auto">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="mb-8">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6"
                        >
                            <ArrowLeft size={16} />
                            {dictionary.auth.backToSignIn}
                        </Link>

                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {dictionary.auth.forgotPasswordTitle}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {dictionary.auth.forgotPasswordSubtitle}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    {dictionary.auth.emailLabel}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder={dictionary.auth.emailPlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    dictionary.auth.sendResetLink
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mb-8">
                                {dictionary.auth.resetLinkSent}
                            </p>
                            <Link
                                href="/auth/login"
                                className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 px-8 rounded-xl transition-all hover:-translate-y-1"
                            >
                                {dictionary.auth.backToSignIn}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
