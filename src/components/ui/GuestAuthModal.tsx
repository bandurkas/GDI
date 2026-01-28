
"use client";

import { X, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface GuestAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function GuestAuthModal({ isOpen, onClose }: GuestAuthModalProps) {
    const { dictionary } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white dark:bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 dark:hover:text-white transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="relative p-8 md:p-12 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                        <UserPlus size={32} />
                    </div>

                    <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {dictionary.auth.guestModalTitle}
                    </h2>

                    <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                        {dictionary.auth.guestModalMsg}
                    </p>

                    <div className="space-y-4">
                        <Link
                            href="/auth/register"
                            onClick={onClose}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-indigo-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-black dark:hover:bg-indigo-500 shadow-xl shadow-slate-200 dark:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {dictionary.auth.guestModalRegister}
                            <ArrowRight size={20} />
                        </Link>

                        <Link
                            href="/auth/login"
                            onClick={onClose}
                            className="block text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                        >
                            {dictionary.auth.guestModalLogin}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
