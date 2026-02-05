"use client";

import { X, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CaseStudy {
    name: string;
    title: string;
    desc: string;
    problem: string;
    solution: string;
    results: { label: string; value: string }[];
    steps: { title: string; desc: string }[];
}

interface CaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    caseStudy: CaseStudy | null;
}

export default function CaseModal({ isOpen, onClose, caseStudy }: CaseModalProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!visible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col ${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-8 scale-95"}`}
            >
                {/* Close Button Mobile - Sticky Header */}
                <div className="sticky top-0 right-0 left-0 p-4 flex justify-end bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-20 border-b border-slate-100 dark:border-white/5 md:absolute md:bg-transparent md:border-none md:p-0 md:top-4 md:right-4">
                    <button
                        onClick={onClose}
                        className="p-2 bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-slate-900 dark:text-white" />
                    </button>
                </div>

                {caseStudy && (
                    <div className="relative z-0 overflow-y-auto custom-scrollbar">
                        <div className="p-6 md:p-12 pt-0 md:pt-12">

                            {/* Brand Logo */}
                            <div className="mb-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                                {/* We use basic img tags here to ensure it works even if static import issues arise,
                                    but since we saw Navbar uses Next Image, we'll try to use standard img for simplicity
                                    in this specific modal or just text if preferred.
                                    Let's use the svgs we saw in Navbar logic but with standard img tags for zero-config.
                                */}
                                <img src="/gdi-logo.svg" alt="GDI" className="h-8 w-auto block dark:hidden" />
                                <img src="/gdi-logo-dark.svg" alt="GDI" className="h-8 w-auto hidden dark:block" />
                            </div>

                            {/* Header */}
                            <div className="mb-10">
                                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                    {caseStudy.name}
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                                    {caseStudy.title}
                                </h2>
                                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl">
                                    {caseStudy.desc}
                                </p>
                            </div>

                            {/* Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">

                                {/* Left: Problem & Solution */}
                                <div className="space-y-8">
                                    <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">The Problem</h3>
                                        <p className="text-slate-900 dark:text-slate-200 font-medium leading-relaxed">
                                            {caseStudy.problem}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">The Solution</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {caseStudy.solution}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Results Cards */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                                        Key Outcomes
                                    </h3>
                                    <div className="space-y-6">
                                        {caseStudy.results.map((res, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{res.label}</span>
                                                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{res.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* How it Works Steps */}
                            <div className="mb-12">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">How it works</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {caseStudy.steps.map((step, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold rounded-lg mb-3 text-sm">
                                                {idx + 1}
                                            </div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{step.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom CTA */}
                            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 dark:bg-indigo-900 text-white p-6 rounded-2xl gap-4">
                                <div>
                                    <h4 className="font-bold text-lg">Ready to achieve similar results?</h4>
                                    <p className="text-indigo-200 text-sm">Start your transformation journey today.</p>
                                </div>
                                <Link href="/auth/register" className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm">
                                    Get Started <ArrowRight size={16} />
                                </Link>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
