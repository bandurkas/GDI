"use client";

import { useState } from "react";
import { ArrowRight, Compass, RotateCcw } from "lucide-react";
import type { ServicesContent } from "@/lib/services/content";
import { PACKAGE_NAMES, formatIdr, getPackage, recommendPackage, type FinderStage, type FinderSystems, type FinderWhen } from "@/lib/services/config";

interface Props { content: ServicesContent }

const optionCls = (active: boolean) =>
    `w-full text-left p-4 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${active ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-slate-900 dark:text-white" : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500/40"}`;

export function PackageFinder({ content }: Props) {
    const F = content.finder;
    const [stage, setStage] = useState<FinderStage | null>(null);
    const [systems, setSystems] = useState<FinderSystems | null>(null);
    const [when, setWhen] = useState<FinderWhen | null>(null);
    const done = stage && systems && when;
    const rec = done ? recommendPackage(stage, systems) : null;
    const pkg = rec ? getPackage(rec) : undefined;

    const Q = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
        <div>
            <p className="flex items-center gap-3 mb-3 text-sm font-bold text-slate-900 dark:text-white"><span className="h-7 w-7 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-xs font-mono flex items-center justify-center">{n}</span>{title}</p>
            <div className="grid gap-2">{children}</div>
        </div>
    );

    return (
        <div id="finder" className="scroll-mt-24 grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <Q n={1} title={F.q1}>
                    {(Object.keys(F.q1Options) as FinderStage[]).map((k) => <button key={k} type="button" className={optionCls(stage === k)} onClick={() => setStage(k)} aria-pressed={stage === k}>{F.q1Options[k]}</button>)}
                </Q>
                <Q n={2} title={F.q2}>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(F.q2Options) as FinderSystems[]).map((k) => <button key={k} type="button" className={optionCls(systems === k)} onClick={() => setSystems(k)} aria-pressed={systems === k}>{F.q2Options[k]}</button>)}
                    </div>
                </Q>
                <Q n={3} title={F.q3}>
                    <div className="grid sm:grid-cols-3 gap-2">
                        {(Object.keys(F.q3Options) as FinderWhen[]).map((k) => <button key={k} type="button" className={optionCls(when === k)} onClick={() => setWhen(k)} aria-pressed={when === k}>{F.q3Options[k]}</button>)}
                    </div>
                </Q>
            </div>
            <div className="lg:col-span-2 lg:sticky lg:top-24">
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 dark:bg-black text-white p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 min-h-[280px]">
                    <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative">
                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-300 mb-4"><Compass size={14} />{F.resultTitle}</p>
                        {rec && pkg ? (
                            <div key={rec} className="gdi-pop">
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{PACKAGE_NAMES[rec]}</h3>
                                <p className="mt-1 font-mono text-sm text-indigo-300">{formatIdr(pkg.priceIdr)} · {pkg.durationDays[0] === pkg.durationDays[1] ? pkg.durationDays[0] : `${pkg.durationDays[0]}–${pkg.durationDays[1]}`} {content.packagesSection.workingDays}</p>
                                <p className="mt-4 text-sm text-slate-300 leading-relaxed">{F.why[rec]}</p>
                                <p className="mt-3 text-xs text-slate-400">{F.startNote[when!]}</p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <a href={`#pkg-${rec}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors">{F.goTo} <ArrowRight size={16} /></a>
                                    <button type="button" onClick={() => { setStage(null); setSystems(null); setWhen(null); }} className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-white/20 text-sm font-bold hover:border-white transition-colors"><RotateCcw size={14} />{F.reset}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => {
                                    const answered = i === 1 ? !!stage : i === 2 ? !!systems : !!when;
                                    return <div key={i} className={`h-2 rounded-full ${answered ? "bg-indigo-400" : "bg-white/10"}`} style={{ width: `${100 - (i - 1) * 20}%` }} />;
                                })}
                                <p className="pt-2 text-sm text-slate-400">{[stage, systems, when].filter(Boolean).length} / 3</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
