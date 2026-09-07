"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PRESET_EVENT } from "./Calculator";

/** Scrolls to the calculator and pre-selects a preset (used by category / pricing cards). */
export function PresetLink({ presetId, className, children }: { presetId?: string; className?: string; children: React.ReactNode }) {
    const go = () => {
        if (presetId) window.dispatchEvent(new CustomEvent(PRESET_EVENT, { detail: presetId }));
        document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    return <button type="button" onClick={go} className={className}>{children}</button>;
}

export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <div className="divide-y divide-slate-200 dark:divide-white/10 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden">
            {items.map((it, i) => (
                <div key={i}>
                    <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        {it.q}
                        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
                    </button>
                    {open === i && <p className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{it.a}</p>}
                </div>
            ))}
        </div>
    );
}
