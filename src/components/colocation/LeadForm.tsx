"use client";

import { useState } from "react";
import { X, CheckCircle2, ChevronDown, Send } from "lucide-react";
import type { ColocationContent } from "@/lib/colocation/content";
import type { CalcInput, CalcResult } from "@/lib/colocation/calc";
import { formatIdr, formatPower } from "@/lib/colocation/calc";
import { track } from "@/lib/colocation/analytics";

interface Props {
    content: ColocationContent;
    input: CalcInput;
    result: CalcResult;
    serverTypeLabel: string;
    bandwidthLabel: string;
    onClose: () => void;
}

const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5";

function getUtm() {
    if (typeof window === "undefined") return {};
    const p = new URLSearchParams(window.location.search);
    return { utm_source: p.get("utm_source") || undefined, utm_medium: p.get("utm_medium") || undefined, utm_campaign: p.get("utm_campaign") || undefined };
}

export function LeadForm({ content, input, result, serverTypeLabel, bandwidthLabel, onClose }: Props) {
    const L = content.lead;
    const [form, setForm] = useState({
        name: "", company: "", email: "", phone: "", deploymentDate: "", currentLocation: "",
        needReceiving: "", gpuFabric: input.gpuFabric ? "yes" : "", siteMode: input.siteMode, notes: "", website: "",
    });
    const [tech, setTech] = useState<Record<string, string>>({});
    const [techOpen, setTechOpen] = useState(false);
    const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const isBlackwell = input.presetId === "dgx-b200" || input.presetId === "dgx-b300";
    const showTechnical = isBlackwell && result.quantity >= 10;
    const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.company || !form.email || !form.phone) { setError(L.required); return; }
        setError(null);
        setState("sending");
        try {
            const res = await fetch("/api/leads/colocation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    connectivity: bandwidthLabel,
                    calculator: input,
                    technical: showTechnical && Object.keys(tech).length ? tech : undefined,
                    pageUrl: window.location.href,
                    ...getUtm(),
                }),
            });
            if (!res.ok) throw new Error("failed");
            setState("done");
            track("colocation_quote_submitted", {
                server_type: input.presetId, quantity: result.quantity, power_kw: result.totalPowerKw,
                monthly_estimate: result.monthlyIdr, contract_term: result.contractMonths, enterprise_tier: result.enterpriseTier,
            });
        } catch {
            setState("error");
        }
    };

    const techFields: Array<[string, string, "text" | "bool"]> = [
        ["model", L.technical.model, "text"], ["systems", L.technical.systems, "text"], ["powerPref", L.technical.powerPref, "text"],
        ["targetDate", L.technical.targetDate, "text"], ["topology", L.technical.topology, "text"], ["infiniband", L.technical.infiniband, "bool"],
        ["ethernet", L.technical.ethernet, "text"], ["storage", L.technical.storage, "text"], ["storageThroughput", L.technical.storageThroughput, "text"],
        ["publicInternet", L.technical.publicInternet, "bool"], ["privateCircuit", L.technical.privateCircuit, "bool"], ["asn", L.technical.asn, "text"],
        ["mgmtNetwork", L.technical.mgmtNetwork, "text"], ["staging", L.technical.staging, "bool"], ["spares", L.technical.spares, "bool"],
        ["noc247", L.technical.noc247, "bool"], ["drSite", L.technical.drSite, "bool"],
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="lead-title">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
                    <h3 id="lead-title" className="text-lg font-black text-slate-900 dark:text-white">{L.title}</h3>
                    <button type="button" onClick={onClose} aria-label={L.close} className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={18} /></button>
                </div>

                {state === "done" ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-6"><CheckCircle2 size={32} /></div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mx-auto">{L.success}</p>
                        <button type="button" onClick={onClose} className="mt-8 px-6 py-3 bg-slate-900 dark:bg-indigo-600 text-white font-bold rounded-full">{L.close}</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="p-6 space-y-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{L.intro}</p>

                        <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-4 text-sm">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">{L.snapshot}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300">
                                <span className="font-bold">{serverTypeLabel}</span><span className="text-right tabular-nums">× {result.quantity}</span>
                                <span>{content.calculator.result.monthly}</span><span className="text-right font-bold tabular-nums">{formatIdr(result.monthlyIdr)}</span>
                                <span>{content.calculator.result.setup}</span><span className="text-right tabular-nums">{formatIdr(result.setupIdr)}</span>
                                <span>{content.calculator.result.power}</span><span className="text-right tabular-nums">{formatPower(result.totalPowerKw)}</span>
                                <span>{content.calculator.result.rackSpace}</span><span className="text-right tabular-nums">{result.totalRackU}U · {result.estimatedRackCount} {content.calculator.result.racks.toLowerCase()}</span>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div><label className={labelCls} htmlFor="lf-name">{L.fields.name} *</label><input id="lf-name" required className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></div>
                            <div><label className={labelCls} htmlFor="lf-company">{L.fields.company} *</label><input id="lf-company" required className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" /></div>
                            <div><label className={labelCls} htmlFor="lf-email">{L.fields.email} *</label><input id="lf-email" type="email" required className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" /></div>
                            <div><label className={labelCls} htmlFor="lf-phone">{L.fields.phone} *</label><input id="lf-phone" type="tel" required className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+62" /></div>
                            <div><label className={labelCls} htmlFor="lf-date">{L.fields.deploymentDate}</label><input id="lf-date" type="date" className={inputCls} value={form.deploymentDate} onChange={(e) => set("deploymentDate", e.target.value)} /></div>
                            <div><label className={labelCls} htmlFor="lf-loc">{L.fields.currentLocation}</label><input id="lf-loc" className={inputCls} value={form.currentLocation} onChange={(e) => set("currentLocation", e.target.value)} /></div>
                            <div>
                                <label className={labelCls} htmlFor="lf-recv">{L.fields.needReceiving}</label>
                                <select id="lf-recv" className={inputCls} value={form.needReceiving} onChange={(e) => set("needReceiving", e.target.value)}>
                                    <option value="">—</option><option value="yes">{L.yes}</option><option value="no">{L.no}</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="lf-fabric">{L.fields.gpuFabric}</label>
                                <select id="lf-fabric" className={inputCls} value={form.gpuFabric} onChange={(e) => set("gpuFabric", e.target.value)}>
                                    <option value="">—</option><option value="yes">{L.yes}</option><option value="no">{L.no}</option><option value="not-sure">{L.notSure}</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls} htmlFor="lf-site">{L.fields.siteMode}</label>
                                <select id="lf-site" className={inputCls} value={form.siteMode} onChange={(e) => set("siteMode", e.target.value)}>
                                    <option value="single">{content.calculator.siteOptions.single}</option>
                                    <option value="dr">{content.calculator.siteOptions.dr}</option>
                                    <option value="recommend">{content.calculator.siteOptions.recommend}</option>
                                </select>
                            </div>
                            <div><label className={labelCls}>{L.fields.connectivity}</label><div className={`${inputCls} text-slate-500`}>{bandwidthLabel}</div></div>
                        </div>

                        <div><label className={labelCls} htmlFor="lf-notes">{L.fields.notes}</label><textarea id="lf-notes" rows={3} className={`${inputCls} resize-none`} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
                        {/* honeypot */}
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden="true" />

                        {showTechnical && (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <button type="button" onClick={() => setTechOpen((o) => !o)} aria-expanded={techOpen} className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950/50">
                                    {L.technicalTitle}
                                    <ChevronDown size={18} className={`transition-transform ${techOpen ? "rotate-180" : ""}`} />
                                </button>
                                {techOpen && (
                                    <div className="p-5 grid sm:grid-cols-2 gap-4">
                                        {techFields.map(([k, label, type]) => (
                                            <div key={k}>
                                                <label className={labelCls} htmlFor={`lf-t-${k}`}>{label}</label>
                                                {type === "bool" ? (
                                                    <select id={`lf-t-${k}`} className={inputCls} value={tech[k] || ""} onChange={(e) => setTech((t) => ({ ...t, [k]: e.target.value }))}>
                                                        <option value="">—</option><option value="yes">{L.yes}</option><option value="no">{L.no}</option><option value="not-sure">{L.notSure}</option>
                                                    </select>
                                                ) : (
                                                    <input id={`lf-t-${k}`} className={inputCls} value={tech[k] || ""} onChange={(e) => setTech((t) => ({ ...t, [k]: e.target.value }))} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(error || state === "error") && (
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error || L.error}</p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                            <button type="submit" disabled={state === "sending"} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60">
                                <Send size={16} /> {state === "sending" ? L.sending : L.submit}
                            </button>
                            <p className="text-[11px] text-slate-400 leading-snug">{L.privacy}</p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
