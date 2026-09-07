"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { ServicesContent } from "@/lib/services/content";
import { BUDGET_BANDS, PACKAGE_NAMES, SERVICE_INTERESTS, SERVICE_PACKAGES, TIMELINE_OPTIONS, type ServiceInterest } from "@/lib/services/config";

const inputCls = "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5";

function getUtm() {
    if (typeof window === "undefined") return {};
    const p = new URLSearchParams(window.location.search);
    return { utm_source: p.get("utm_source") || undefined, utm_medium: p.get("utm_medium") || undefined, utm_campaign: p.get("utm_campaign") || undefined };
}

export function ServiceLeadForm({ content, defaultInterest = "custom-ai" }: { content: ServicesContent; defaultInterest?: ServiceInterest }) {
    const L = content.lead;
    const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", interest: defaultInterest as string, packageId: "", budget: "", timeline: "", message: "", website: "" });
    const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.company || !form.email || !form.phone || !form.interest) { setError(L.required); return; }
        setError(null);
        setState("sending");
        try {
            const res = await fetch("/api/leads/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, pageUrl: window.location.href, ...getUtm() }),
            });
            if (!res.ok) throw new Error("failed");
            setState("done");
        } catch { setState("error"); }
    };

    if (state === "done") {
        return (
            <div className="p-10 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-5"><CheckCircle2 size={28} /></div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{L.success}</p>
            </div>
        );
    }

    return (
        <form id="request" onSubmit={submit} className="scroll-mt-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelCls} htmlFor="sl-name">{L.fields.name} *</label><input id="sl-name" required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></div>
                <div><label className={labelCls} htmlFor="sl-company">{L.fields.company} *</label><input id="sl-company" required className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" /></div>
                <div><label className={labelCls} htmlFor="sl-email">{L.fields.email} *</label><input id="sl-email" type="email" required className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></div>
                <div><label className={labelCls} htmlFor="sl-phone">{L.fields.phone} *</label><input id="sl-phone" type="tel" required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+62" /></div>
                <div>
                    <label className={labelCls} htmlFor="sl-interest">{L.fields.interest} *</label>
                    <select id="sl-interest" className={inputCls} value={form.interest} onChange={(e) => set("interest", e.target.value)}>
                        {SERVICE_INTERESTS.map((k) => <option key={k} value={k}>{L.interests[k]}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls} htmlFor="sl-package">{L.fields.package}</label>
                    <select id="sl-package" className={inputCls} value={form.packageId} onChange={(e) => set("packageId", e.target.value)}>
                        <option value="">{L.none}</option>
                        {SERVICE_PACKAGES.map((p) => <option key={p.id} value={p.id}>{PACKAGE_NAMES[p.id]}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls} htmlFor="sl-budget">{L.fields.budget}</label>
                    <select id="sl-budget" className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)}>
                        <option value="">{L.none}</option>
                        {BUDGET_BANDS.map((k) => <option key={k} value={k}>{L.budgets[k]}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls} htmlFor="sl-timeline">{L.fields.timeline}</label>
                    <select id="sl-timeline" className={inputCls} value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
                        <option value="">{L.none}</option>
                        {TIMELINE_OPTIONS.map((k) => <option key={k} value={k}>{L.timelines[k]}</option>)}
                    </select>
                </div>
            </div>
            <div><label className={labelCls} htmlFor="sl-message">{L.fields.message}</label><textarea id="sl-message" rows={4} className={`${inputCls} resize-none`} value={form.message} onChange={(e) => set("message", e.target.value)} /></div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden="true" />
            {(error || state === "error") && <p className="text-sm font-bold text-red-600 dark:text-red-400">{error || L.error}</p>}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                <button type="submit" disabled={state === "sending"} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-500 text-white font-bold rounded-full shadow-lg transition-all disabled:opacity-60">
                    <Send size={16} /> {state === "sending" ? L.sending : L.submit}
                </button>
                <p className="text-[11px] text-slate-400 leading-snug">{L.privacy}</p>
            </div>
        </form>
    );
}
