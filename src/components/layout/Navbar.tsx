"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Shield } from "lucide-react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { colocationContent } from "@/lib/colocation/content";

export function Navbar() {
    const { data: session } = useSession();
    const { itemsCount } = useCart();
    const { dictionary, language, switchLanguage } = useLanguage();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="flex items-center shrink-0 dark:bg-white dark:rounded-xl dark:px-2 dark:py-1">
                    <Image
                        src="/gdi-logo.png"
                        alt="GDI Logo"
                        width={200}
                        height={56}
                        className="h-9 sm:h-12 lg:h-14 w-auto"
                        priority={true}
                    />
                </Link>

                <div className="flex items-center gap-2 sm:gap-6 min-w-0">
                    <Link href="/" className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        GDI
                    </Link>
                    <Link href="/products" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {dictionary.common.products}
                    </Link>
                    <Link href="/services/managed-colocation" className="hidden md:inline text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {colocationContent[language].nav}
                    </Link>

                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 rounded-full p-1 border border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => switchLanguage('en')}
                            className={`p-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇬🇧
                        </button>
                        <button
                            onClick={() => switchLanguage('id')}
                            className={`p-1.5 rounded-full text-xs font-bold transition-all ${language === 'id' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇮🇩
                        </button>
                    </div>

                    {session ? (
                        <>
                            {session.user.role !== "ADMIN" && (
                                <div className="flex items-center gap-4">
                                    <Link href="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                                        <User size={18} />
                                        {dictionary.common.dashboard}
                                    </Link>
                                    <Link href="/dashboard/profile" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                                        <Shield size={18} />
                                        {dictionary.common.profile}
                                    </Link>
                                </div>
                            )}

                            {session.user.role === "ADMIN" && (
                                <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2">
                                    <Shield size={18} />
                                    {dictionary.common.adminManager}
                                </Link>
                            )}

                            <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <ShoppingCart size={22} />
                                {itemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                        {itemsCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={() => signOut()}
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={18} />
                                {dictionary.common.logout}
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link href="/auth/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {dictionary.common.login}
                            </Link>
                            <Link
                                href="/auth/register"
                                className="hidden sm:inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white whitespace-nowrap hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40"
                            >
                                {dictionary.common.getStarted}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
