"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

import { Eye, EyeOff } from "lucide-react";
import { PASSWORD_REGEX } from "@/lib/constants";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Real-time validation state
    const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

    const router = useRouter();
    const { dictionary } = useLanguage();

    // Helper for conditional classes
    const getInputClasses = (isError: boolean = false) => {
        const base = "mt-1 block w-full rounded-lg border bg-white/50 dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 sm:text-sm transition-all";
        if (isError) {
            return `${base} border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500`;
        }
        return `${base} border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-indigo-500`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Basic Validation
        if (password !== confirmPassword) {
            setError(dictionary.auth.passwordMatchError);
            setLoading(false);
            return;
        }

        // Password Complexity
        if (!PASSWORD_REGEX.test(password)) {
            setError(dictionary.auth.passwordComplexityError);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push("/auth/login?registered=true");
            } else {
                // Try to get specific error from server, fallback to generic
                const data = await res.json().catch(() => ({}));
                setError(data.error || dictionary.auth.errorGeneric);
                setLoading(false);
            }
        } catch (err) {
            setError(dictionary.auth.errorGeneric);
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
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {dictionary.auth.emailLabel}
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className={getInputClasses()}
                                placeholder={dictionary.auth.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {dictionary.auth.passwordLabel}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    className={`${getInputClasses()} pr-10`}
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

                        {/* Confirm Password Field */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {dictionary.auth.confirmPasswordLabel}
                                </label>
                                {!passwordsMatch && (
                                    <span className="text-xs text-red-500 font-medium">
                                        {dictionary.auth.passwordMatchError}
                                    </span>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`${getInputClasses(!passwordsMatch)} pr-10`}
                                    placeholder={dictionary.auth.passwordPlaceholder}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !passwordsMatch || !email || !password || !confirmPassword}
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-lg shadow-indigo-100 dark:shadow-indigo-500/30"
                        >
                            {loading ? dictionary.auth.registeringButton : dictionary.auth.registerButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
