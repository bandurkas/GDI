"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Shield } from "lucide-react";
import Image from "next/image";

import { useCart } from "@/context/CartContext";

export function Navbar() {
    const { data: session } = useSession();
    const { itemsCount } = useCart();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/gdi-logo.png"
                        alt="GDI Logo"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="h-14 w-auto rounded-xl"
                        style={{ width: 'auto', height: '3.5rem' }} // h-14 is 3.5rem
                    />
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        GDI
                    </Link>
                    <Link href="/products" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Products
                    </Link>

                    {session ? (
                        <>
                            {session.user.role !== "ADMIN" && (
                                <Link href="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2">
                                    <User size={18} />
                                    Dashboard
                                </Link>
                            )}

                            {session.user.role === "ADMIN" && (
                                <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-2">
                                    <Shield size={18} />
                                    Manager
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
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/auth/login" className="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                Login
                            </Link>
                            <Link
                                href="/auth/register"
                                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
