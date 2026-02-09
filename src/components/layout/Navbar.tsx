"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Shield, Menu, X, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Image from "next/image";
import dynamic from "next/dynamic";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

// Lazy load Mobile Menu (client-side interactive only)
const MobileMenu = dynamic(() => import("./MobileMenu"), { ssr: false });

export function Navbar() {
    const { data: session } = useSession();
    const { itemsCount } = useCart();
    const { dictionary, language, switchLanguage } = useLanguage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        setIsMobileMenuOpen(false);
        await signOut({ redirect: false, callbackUrl: "/" });
        router.push("/");
        router.refresh();
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

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
                            sizes="(max-width: 768px) 56px, 72px"
                            className="h-14 w-auto md:h-[4.5rem] block dark:hidden"
                            // Removed priority here to let browser decide, or keep if LCP. 
                            // Reverting to priority={false} or just removing it.
                            // Actually, keeping priority is safer for Logo LCP.
                            priority
                        />
                        <Image
                            src="/gdi-logo-dark.svg"
                            alt="GDI Logo"
                            width={200}
                            height={56}
                            sizes="(max-width: 768px) 56px, 72px"
                            className="h-14 w-auto md:h-[4.5rem] hidden dark:block"
                            priority
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Theme Toggle */}
                    <ThemeToggle />

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

                    {/* Language Switcher (Desktop Only) */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/10 rounded-full p-1 border border-slate-200 dark:border-white/10 shrink-0">
                        <button
                            onClick={() => switchLanguage('en')}
                            className={`p-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇬🇧
                        </button>
                        <button
                            onClick={() => switchLanguage('id')}
                            className={`p-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all ${language === 'id' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            🇮🇩
                        </button>
                    </div>

                    {/* Cart Icon (Always Visible) */}
                    <Link href="/cart" className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
                        {itemsCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                {itemsCount}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Menu Items (Keeping Inline for Desktop Perf) */}
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

                                {session.user.role === "SUPER_ADMIN" && (
                                    <Link href="/super-admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2">
                                        <Users size={18} />
                                        Manage Users
                                    </Link>
                                )}

                                <button
                                    onClick={handleLogout}
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

            {/* Mobile Dropdown Menu (Lazy Loaded) */}
            {isMobileMenuOpen && (
                <MobileMenu
                    session={session}
                    itemsCount={itemsCount}
                    dictionary={dictionary}
                    language={language}
                    switchLanguage={switchLanguage}
                    handleLogout={handleLogout}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
            )}
        </nav>
    );
}
