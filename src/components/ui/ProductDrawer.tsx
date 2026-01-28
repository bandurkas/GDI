"use client";

import { X, Check, ArrowRight, Clock, FileText, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductDetail {
    title: string;
    details: string[];
}

interface ProductTimelineItem {
    day: string;
    activity: string;
}

interface Product {
    id: string;
    name: string;
    title: string;
    tagline: string;
    highlights: string[];
    scope: ProductDetail[];
    deliverables: string[];
    timeline: ProductTimelineItem[];
    bestFor: string[];
    value: string[];
}

interface ProductDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onBuy: (id: string) => void;
    loading: boolean;
}

export default function ProductDrawer({ isOpen, onClose, product, onBuy, loading }: ProductDrawerProps) {
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    if (!product) return null;

    const toggleAccordion = (index: number) => {
        setActiveAccordion(activeAccordion === index ? null : index);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                {/* Sticky Header */}
                <div className="absolute top-0 left-0 right-0 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-10 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{product.title}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{product.tagline}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="h-full overflow-y-auto pt-36 pb-32 px-6 space-y-10">

                    {/* 1. What You Get (Highlights) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">What You Get</h3>
                        <div className="grid gap-3">
                            {product.highlights.map((highlight: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20">
                                    <Check className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" size={18} />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{highlight}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Scope of Work (Accordion) */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scope of Work</h3>
                        <div className="space-y-2">
                            {product.scope.map((item: ProductDetail, idx: number) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => toggleAccordion(idx)}
                                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-left"
                                    >
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{item.title}</span>
                                        {activeAccordion === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    {activeAccordion === idx && (
                                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                            <ul className="space-y-2">
                                                {item.details.map((detail: string, dIdx: number) => (
                                                    <li key={dIdx} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Deliverables & Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Deliverables */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Deliverables</h3>
                            <ul className="space-y-3">
                                {product.deliverables.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <FileText size={14} className="text-slate-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Timeline</h3>
                            <div className="relative pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/30 space-y-4">
                                {product.timeline.map((item: ProductTimelineItem, idx: number) => (
                                    <div key={idx} className="relative">
                                        <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900"></span>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{item.day}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.activity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. Best For & Business Value */}
                    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Best For</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.bestFor.map((tag: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Business Value</span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {product.value.map((v: string, idx: number) => (
                                    <span key={idx} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        • {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-10">
                    <button
                        onClick={() => onBuy(product.id)}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? "Processing..." : (
                            <>
                                Buy {product.name}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-2">Secure payment via Stripe • 30-day money-back guarantee</p>
                </div>
            </div>
        </>
    );
}
