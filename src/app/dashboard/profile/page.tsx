
"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { User, Mail, Wallet, Send, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { dictionary } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        usdtWallet: "",
        telegram: "",
    });

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    usdtWallet: data.usdtWallet || "",
                    telegram: data.telegram || "",
                });
            }
        } catch (error) {
            toast.error(dictionary.dashboard.updateError);
        } finally {
            setLoading(false);
        }
    }, [dictionary.dashboard.updateError]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(dictionary.dashboard.updateSuccess);
            } else {
                toast.error(data.error || dictionary.dashboard.updateError);
            }
        } catch (error) {
            toast.error(dictionary.dashboard.updateError);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {dictionary.dashboard.profileTitle}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {dictionary.dashboard.profileSubtitle}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {dictionary.dashboard.personalInfo}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                {dictionary.dashboard.nameLabel}
                            </label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={dictionary.dashboard.namePlaceholder}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-white font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                {dictionary.auth.emailLabel}
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-14 pr-5 transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-white font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Payout Settings */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Wallet size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                            {dictionary.dashboard.payoutSettings}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                {dictionary.dashboard.walletLabel}
                            </label>
                            <div className="relative">
                                <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.usdtWallet}
                                    onChange={(e) => setFormData({ ...formData, usdtWallet: e.target.value })}
                                    placeholder={dictionary.dashboard.walletPlaceholder}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-14 pr-5 transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-white font-mono font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                                {dictionary.dashboard.telegramLabel}
                            </label>
                            <div className="relative">
                                <Send className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.telegram}
                                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                                    placeholder={dictionary.dashboard.telegramPlaceholder}
                                    className="w-full h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl pl-14 pr-5 transition-all focus:border-sky-500 focus:bg-white dark:focus:bg-slate-950 outline-none text-slate-800 dark:text-white font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="h-14 px-10 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center gap-3"
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <CheckCircle size={20} />
                        )}
                        {dictionary.common.save}
                    </button>
                </div>
            </form>
        </div>
    );
}
