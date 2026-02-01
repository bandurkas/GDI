"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { dictionary } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/auth/login?registered=true");
            } else {
                setError(dictionary.auth.errorGeneric);
                setLoading(false);
            }
        } catch (err) {
            setError("Failed to connect to server");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 p-10 shadow-xl backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{dictionary.auth.createAccountTitle}</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {dictionary.auth.or}{" "}
                        <Link href="/auth/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                            {dictionary.auth.signInLink}
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{dictionary.auth.emailLabel}</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                                placeholder={dictionary.auth.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{dictionary.auth.passwordLabel}</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all pr-10"
                                    placeholder={dictionary.auth.minChar}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-indigo-500/30"
                        >
                            {loading ? dictionary.auth.registeringButton : dictionary.auth.registerButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
