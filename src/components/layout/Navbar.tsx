"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
    const { data: session } = useSession();
    const { itemsCount } = useCart();
    const { dictionary, language, switchLanguage } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, []);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <div className="relative">
                        <Image
                            src="/gdi-logo.svg"
                            alt="GDI Logo"
                            width={200}
                            height={56}
                            className="h-10 w-auto md:h-14 block dark:hidden"
                            priority={true}
                        />
                        <Image
                            src="/gdi-logo-dark.svg"
                            alt="GDI Logo"
                            width={200}
                            height={56}
                            className="h-10 w-auto md:h-14 hidden dark:block"
                            priority={true}
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Theme Toggle (Desktop) */}
                    <div className="hidden md:block">
                        <ThemeToggle />
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            GDI
                        </Link>
                        <Link href="/products" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            {dictionary.common.products}
                        </Link>
                    </div>

                    {/* Mobile: Products Link (Always Visible) */}
                    <Link href="/products" className="md:hidden text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {dictionary.common.products}
                    </Link>

                    {/* Language Switcher (Always Visible) */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 rounded-full p-1 border border-slate-200 dark:border-white/10 shrink-0">
                        <button
                            onClick={() => switchLanguage('en')}
                            className={`p-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇬🇧
                        </button>
                        <button
                            onClick={() => switchLanguage('id')}
                            className={`p-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${language === 'id' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇮🇩
                        </button>
                    </div>

                    {/* Cart Icon (Always Visible) */}
                    {session && (
                        <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
                            {itemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {itemsCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Desktop Menu Items */}
                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <>
                                {session.user.role !== "ADMIN" && (
                                    <>
                                        <Link href="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                                            <User size={18} />
                                            {dictionary.common.dashboard}
                                        </Link>
                                        <Link href="/dashboard/profile" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                                            <Shield size={18} />
                                            {dictionary.common.profile}
                                        </Link>
                                    </>
                                )}

                                {session.user.role === "ADMIN" && (
                                    <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2">
                                        <Shield size={18} />
                                        {dictionary.common.adminManager}
                                    </Link>
                                )}

                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-2"
                                >
                                    <LogOut size={18} />
                                    {dictionary.common.logout}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    {dictionary.common.login}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40"
                                >
                                    {dictionary.common.getStarted}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="container mx-auto px-4 py-4 space-y-4">
                        {session ? (
                            <>
                                <div className="px-2 py-2 border-b border-slate-100 dark:border-white/5 mb-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session.user.email}</p>
                                </div>
                                <Link
                                    href="/products"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    GDI Products
                                </Link>
                                {session.user.role !== "ADMIN" && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User size={18} />
                                            {dictionary.common.dashboard}
                                        </Link>
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Shield size={18} />
                                            {dictionary.common.profile}
                                        </Link>
                                    </>
                                )}
                                {session.user.role === "ADMIN" && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 text-amber-600 font-medium"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Shield size={18} />
                                        {dictionary.common.adminManager}
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        signOut();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 font-medium text-left"
                                >
                                    <LogOut size={18} />
                                    {dictionary.common.logout}
                                </button>
                            </>
                        ) : (
                            <div className="grid gap-3 pt-2">
                                <Link
                                    href="/auth/login"
                                    className="flex items-center justify-center p-3 rounded-lg border border-slate-200 text-slate-700 font-medium"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {dictionary.common.login}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="flex items-center justify-center p-3 rounded-lg bg-indigo-600 text-white font-medium shadow-md"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {dictionary.common.getStarted}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
