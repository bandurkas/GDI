"use client";

import Link from "next/link";
import { ShoppingCart, User, Shield, Users, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface MobileMenuProps {
    session: any;
    itemsCount: number;
    dictionary: any;
    language: "id" | "en" | string;
    switchLanguage: (lang: "id" | "en") => void | Promise<void>;
    handleLogout: () => void;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({
    session,
    itemsCount,
    dictionary,
    language,
    switchLanguage,
    handleLogout,
    setIsMobileMenuOpen,
}: MobileMenuProps) {
    return (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 shadow-xl animate-in slide-in-from-top-2 duration-200 overflow-hidden z-40">
            <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Mobile Controls: Theme & Language */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Appearance</span>
                        <div className="flex items-center gap-2">
                            <ThemeToggle className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm border border-slate-200 dark:border-white/10" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Switch Theme</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Language</span>
                        <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-white/10 rounded-full p-1 border border-slate-300/50 dark:border-white/10">
                            <button
                                onClick={() => switchLanguage('en')}
                                className={`p-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                🇬🇧
                            </button>
                            <button
                                onClick={() => switchLanguage('id')}
                                className={`p-1.5 rounded-full text-xs font-bold transition-all ${language === 'id' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                            >
                                🇮🇩
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    {session ? (
                        <>
                            <div className="px-3 py-2 mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">User Account</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.user.email}</p>
                            </div>

                            <Link
                                href="/products"
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <ShoppingCart size={18} />
                                </div>
                                Products & Services
                            </Link>

                            {session.user.role !== "ADMIN" && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <User size={18} />
                                        </div>
                                        {dictionary.common.dashboard}
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            <Shield size={18} />
                                        </div>
                                        {dictionary.common.profile}
                                    </Link>
                                </>
                            )}

                            {session.user.role === "ADMIN" && (
                                <Link
                                    href="/admin"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                        <Shield size={18} />
                                    </div>
                                    {dictionary.common.adminManager}
                                </Link>
                            )}

                            {session.user.role === "SUPER_ADMIN" && (
                                <Link
                                    href="/super-admin/users"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                                        <Users size={18} />
                                    </div>
                                    Manage Users
                                </Link>
                            )}

                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors text-left"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500">
                                        <LogOut size={18} />
                                    </div>
                                    {dictionary.common.logout}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="grid gap-4 pt-2">
                            <Link
                                href="/auth/login"
                                className="flex items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {dictionary.common.login}
                            </Link>
                            <Link
                                href="/auth/register"
                                className="flex items-center justify-center p-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {dictionary.common.getStarted}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
