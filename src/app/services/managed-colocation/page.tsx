import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
    Building2, Network, Wrench, Cable, Hand, Activity, Boxes, FileBarChart,
    ArrowRight, Zap, Server, Cpu, Sparkles, ShieldCheck, Gauge, Layers, ClipboardCheck, CheckCircle2, MapPin, MonitorCheck, ShieldPlus, Clock, Wrench as WrenchIcon,
} from "lucide-react";
import { colocationContent, type Lang } from "@/lib/colocation/content";
import { COLOCATION_PRESETS, STANDARD_RACK_PRICING, SERVER_OPS_PLANS, SERVER_OPS_ADDONS, getPreset } from "@/lib/colocation/config";
import { calculateColocation, formatIdr, formatIdrCompact } from "@/lib/colocation/calc";
import { ColocationCalculator } from "@/components/colocation/Calculator";
import { PresetLink, Faq } from "@/components/colocation/Bits";

export async function generateMetadata(): Promise<Metadata> {
    const lang = ((await cookies()).get("lang")?.value as Lang) || "en";
    const m = colocationContent[lang].meta;
    return {
        title: m.title,
        description: m.description,
        alternates: { canonical: "/services/managed-colocation" },
        openGraph: { title: m.title, description: m.description, url: "/services/managed-colocation", type: "website" },
    };
}

const manageIcons = [Building2, Layers, Wrench, Cable, Hand, Activity, Boxes, FileBarChart];
const processIcons = [ClipboardCheck, MapPin, Gauge, FileBarChart, Wrench, Activity];

function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-indigo-600 dark:text-indigo-400">{n}</span>
            <span className="h-px w-8 bg-indigo-300 dark:bg-indigo-500/50" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{children}</span>
        </div>
    );
}

const presetPrice = (id: string) => calculateColocation({ presetId: id, quantity: 1, contractMonths: 1, bandwidthId: "basic", gpuFabric: false, siteMode: "single", drScope: "all", drCount: 0, serviceLevel: "core" });

export default async function ManagedColocationPage() {
    const lang = ((await cookies()).get("lang")?.value as Lang) || "en";
    const t = colocationContent[lang];
    const b200 = getPreset("dgx-b200")!;
    const b300 = getPreset("dgx-b300")!;
    const maxKw = 15;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">

            {/* ── 1. HERO ─────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-20 pb-16 lg:pt-28 lg:pb-24">
                <div className="absolute inset-0 gdi-blueprint [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
                <div className="absolute -top-32 right-[-10%] w-[55%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12 items-end">
                        <div className="lg:col-span-7">
                            <div className="gdi-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/5 dark:border-white/10 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200 mb-8">
                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" /></span>
                                {t.hero.eyebrow}
                            </div>
                            <h1 className="gdi-reveal gdi-reveal-1 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-8">{t.hero.h1}</h1>
                            <p className="gdi-reveal gdi-reveal-2 max-w-2xl text-lg lg:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{t.hero.p1}</p>
                            <p className="gdi-reveal gdi-reveal-2 max-w-2xl text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-10">{t.hero.p2}</p>
                            <div className="gdi-reveal gdi-reveal-3 flex flex-wrap gap-4">
                                <PresetLink className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:-translate-y-0.5 cursor-pointer">
                                    {t.hero.ctaPrimary} <ArrowRight size={18} />
                                </PresetLink>
                                <a href="#quote" className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-all">
                                    {t.hero.ctaSecondary}
                                </a>
                            </div>
                            <div className="gdi-reveal gdi-reveal-4 mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-mono font-bold tracking-wide text-slate-700 dark:text-slate-200">{t.hero.micro1}</span>
                                <span className="hidden sm:block h-4 w-px bg-slate-300 dark:bg-white/20" />
                                <span>{t.hero.micro2}</span>
                            </div>
                        </div>

                        {/* Datasheet strip */}
                        <div className="lg:col-span-5 gdi-reveal gdi-reveal-3">
                            <div className="rounded-3xl bg-slate-900 dark:bg-black text-white p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-12 -mt-12" />
                                <p className="relative font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-300 mb-5">{t.why.title}</p>
                                <ul className="relative space-y-4">
                                    {[getPreset("standard-1u")!, getPreset("dgx-h100")!, b200, b300].map((p) => {
                                        const kw = p.displayPowerKw ?? p.pricingPowerKw;
                                        return (
                                            <li key={p.id}>
                                                <div className="flex items-baseline justify-between gap-3 text-sm">
                                                    <span className="font-bold truncate">{p.name}</span>
                                                    <span className="font-mono text-xs text-slate-300 whitespace-nowrap">{p.rackU}U · {kw} kW</span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                    <div className={`h-full rounded-full ${p.category === "extreme-gpu" ? "bg-amber-400" : p.category === "gpu" ? "bg-indigo-300" : "bg-indigo-500"}`} style={{ width: `${Math.max(3, (kw / maxKw) * 100)}%` }} />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <p className="relative mt-6 text-xs text-slate-400 leading-relaxed">{t.hero.tagline}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. TRUST STRIP ──────────────────────────────────────── */}
            <section className="border-y border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
                        {t.trust.map((item, i) => {
                            const Icon = [Building2, ShieldCheck, Zap, FileBarChart][i];
                            return (
                                <div key={i} className="flex gap-4 p-6 lg:p-8">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Icon size={20} /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 3. WHAT GDI MANAGES ─────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-14">
                        <Eyebrow n="01">{t.eyebrows.manages}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{t.manages.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.manages.intro}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {t.manages.cards.map((c, i) => {
                            const Icon = manageIcons[i];
                            return (
                                <div key={i} className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Icon size={20} /></div>
                                        <span className="font-mono text-[10px] text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 4. WHY MULTI-DC ─────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">
                        <div>
                            <Eyebrow n="02">{t.eyebrows.why}</Eyebrow>
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6">{t.why.title}</h2>
                            <div className="space-y-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p className="font-bold text-slate-900 dark:text-white">{t.why.p1}</p>
                                <p>{t.why.p2}</p>
                                <p>{t.why.p3}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {t.why.examples.map((ex, i) => {
                                const Icon = [Server, ShieldCheck, Sparkles][i];
                                const tone = ["bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700", "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700", "bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20"][i];
                                return (
                                    <div key={i} className={`flex gap-5 p-6 rounded-2xl border ${tone} ${i === 2 ? "translate-x-0 lg:translate-x-6" : ""}`}>
                                        <Icon className={`shrink-0 h-7 w-7 ${i === 2 ? "text-white" : "text-indigo-600 dark:text-indigo-400"}`} />
                                        <div>
                                            <p className={`font-bold ${i === 2 ? "text-white" : "text-slate-900 dark:text-white"}`}>{ex.title}</p>
                                            <p className={`mt-1 text-sm leading-relaxed ${i === 2 ? "text-indigo-100" : "text-slate-500 dark:text-slate-400"}`}>{ex.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. SERVER CATEGORIES ────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="03">{t.eyebrows.categories}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{t.categories.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.categories.intro}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {COLOCATION_PRESETS.map((p) => {
                            const r = presetPrice(p.id);
                            const copy = t.categories.presets[p.id];
                            const isGpu = p.category === "gpu" || p.category === "extreme-gpu";
                            const kwLabel = p.category === "extreme-gpu" && p.displayPowerKw
                                ? `~${p.displayPowerKw} kW ${t.categories.typicalPower} · ${p.pricingPowerKw} kW ${t.categories.planningPower}`
                                : isGpu ? `${p.pricingPowerKw} kW ${t.categories.maxPower}`
                                    : p.category === "standard-high-power" ? `${p.pricingPowerKw} kW ${t.categories.pricingPower}`
                                        : `${p.pricingPowerKw} kW ${t.categories.powerProfile}`;
                            return (
                                <div key={p.id} className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${p.category === "extreme-gpu" ? "bg-slate-900 dark:bg-black text-white border-slate-800 hover:shadow-indigo-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-indigo-500/10"}`}>
                                    {p.badge && <span className="absolute top-5 right-5 px-2 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest">{t.categories.badges[p.badge]}</span>}
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 ${p.category === "extreme-gpu" ? "bg-white/10 text-amber-300" : "bg-slate-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-white/10"}`}>
                                        {p.category === "extreme-gpu" ? <Sparkles size={20} /> : isGpu ? <Cpu size={20} /> : <Server size={20} />}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1 pr-16">{p.name}</h3>
                                    <p className={`font-mono text-xs mb-4 ${p.category === "extreme-gpu" ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{p.rackU}U · {kwLabel}</p>
                                    <p className={`text-sm leading-relaxed mb-5 flex-1 ${p.category === "extreme-gpu" ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>{copy?.desc}</p>
                                    {p.examples && (
                                        <ul className={`mb-5 space-y-1 text-xs ${p.category === "extreme-gpu" ? "text-slate-400" : "text-slate-500 dark:text-slate-500"}`}>
                                            {p.examples.map((e) => <li key={e} className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />{e}</li>)}
                                        </ul>
                                    )}
                                    <div className={`pt-5 border-t ${p.category === "extreme-gpu" ? "border-white/10" : "border-slate-100 dark:border-white/5"}`}>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${p.category === "extreme-gpu" ? "text-slate-400" : "text-slate-400"}`}>{t.categories.from}</p>
                                        <p className="text-2xl font-black tracking-tight tabular-nums">{formatIdrCompact(r.monthlyIdr)}<span className="text-sm font-bold text-slate-400 ml-1">{isGpu ? t.categories.perServerMonth : t.categories.perMonth}</span></p>
                                        <p className={`mt-1 text-xs ${p.category === "extreme-gpu" ? "text-slate-400" : "text-slate-500"}`}>{t.categories.setup} {formatIdr(r.setupIdr)}</p>
                                        {copy?.note && <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">{copy.note}</p>}
                                        {p.engineeringReview && !copy?.note && <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">{t.categories.validation}</p>}
                                        <PresetLink presetId={p.id} className={`mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${p.category === "extreme-gpu" ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 dark:bg-indigo-600 text-white hover:bg-black dark:hover:bg-indigo-500"}`}>
                                            {t.categories.configure} <ArrowRight size={16} />
                                        </PresetLink>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Custom */}
                        <div className="flex flex-col p-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/15 bg-transparent hover:border-indigo-400 transition-colors">
                            <div className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-5"><Boxes size={20} /></div>
                            <h3 className="text-xl font-bold mb-3">{t.categories.custom.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{t.categories.custom.desc}</p>
                            <PresetLink presetId="custom" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-white/5 transition-colors cursor-pointer">
                                {t.categories.configure} <ArrowRight size={16} />
                            </PresetLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 6+7. AI / B200 B300 ─────────────────────────────────── */}
            <section id="ai" className="relative py-20 lg:py-28 bg-slate-900 dark:bg-black text-white overflow-hidden scroll-mt-24">
                <div className="absolute inset-0 gdi-blueprint opacity-60 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" />
                <div className="absolute top-1/3 left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/15 blur-[120px]" />
                <div className="absolute bottom-0 right-[-10%] w-[40%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-amber-300">04</span>
                                <span className="h-px w-8 bg-amber-300/60" />
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">{t.ai.eyebrow}</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6">{t.ai.h2}</h2>
                            <div className="space-y-4 text-slate-300 leading-relaxed">
                                <p>{t.ai.p1}</p><p>{t.ai.p2}</p><p className="text-white font-medium">{t.ai.p3}</p>
                            </div>
                            <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10">
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-2">{t.ai.rackPlanning}</p>
                                <p className="text-sm text-white font-bold">{t.ai.defaultRack}</p>
                                <p className="mt-1 text-xs text-amber-300">{t.ai.specializedRack}</p>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <PresetLink presetId="dgx-b200" className="inline-flex items-center gap-2 px-7 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-200 transition-colors cursor-pointer">{t.ai.ctaPrimary} <ArrowRight size={18} /></PresetLink>
                                <PresetLink className="inline-flex items-center gap-2 px-7 py-4 border border-white/25 hover:border-white text-white font-bold rounded-full transition-colors cursor-pointer">{t.ai.ctaSecondary}</PresetLink>
                            </div>
                        </div>
                        <div className="lg:col-span-6 grid sm:grid-cols-2 gap-5">
                            {[{ p: b200, metrics: t.ai.b200 }, { p: b300, metrics: t.ai.b300 }].map(({ p, metrics }) => {
                                const r = presetPrice(p.id);
                                return (
                                    <div key={p.id} className="relative p-6 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300">{t.categories.badges[p.badge!]}</span>
                                            <Sparkles size={16} className="text-amber-300" />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight mb-5">{p.name}</h3>
                                        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                                            {metrics.map((m, i) => (
                                                <div key={i} className={i < 2 ? "" : "col-span-2 sm:col-span-1"}>
                                                    <dd className={`font-mono font-bold ${i < 2 ? "text-xl" : "text-sm"} text-white leading-snug`}>{m}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <div className="mt-6 pt-5 border-t border-white/10">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.categories.from}</p>
                                            <p className="text-2xl font-black tabular-nums">{formatIdrCompact(r.monthlyIdr)}<span className="text-xs font-bold text-slate-400 ml-1">{t.categories.perServerMonth}</span></p>
                                            <p className="mt-1 text-xs text-slate-400">{t.categories.setup} {formatIdr(r.setupIdr)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 8. CALCULATOR ───────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <ColocationCalculator content={t} />
                    <p className="mt-8 max-w-4xl mx-auto text-center text-[11px] text-slate-400 leading-relaxed">{t.disclaimer}</p>
                </div>
            </section>

            {/* ── 9. STANDARD RACK PRICING + ADD-ONS ──────────────────── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="05">{t.eyebrows.racks}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight">{t.rackPricing.title}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {STANDARD_RACK_PRICING.map((item, i) => {
                            const c = t.rackPricing.items[item.id];
                            return (
                                <div key={item.id} className="flex flex-col p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 hover:border-indigo-400/60 transition-colors">
                                    <span className="font-mono text-[10px] text-slate-400 mb-3">{String(i + 1).padStart(2, "0")}</span>
                                    <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.categories.from}</p>
                                    <p className="text-xl font-black tabular-nums mb-4">{formatIdr(item.monthlyIdr)}<span className="text-xs font-bold text-slate-400 ml-1">{t.categories.perMonth}</span></p>
                                    <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 flex-1">
                                        {c.lines.map((l) => <li key={l} className="flex gap-2"><CheckCircle2 size={13} className="mt-0.5 text-emerald-500 shrink-0" />{l}</li>)}
                                    </ul>
                                    {item.presetId ? (
                                        <PresetLink presetId={item.presetId} className="mt-5 w-full py-2.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-sm font-bold hover:bg-black dark:hover:bg-indigo-500 transition-colors cursor-pointer">{c.cta}</PresetLink>
                                    ) : (
                                        <a href="#quote" className="mt-5 w-full py-2.5 rounded-lg border border-slate-300 dark:border-white/20 text-center text-sm font-bold hover:bg-white dark:hover:bg-white/5 transition-colors">{t.rackPricing.requestQuote}</a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-5 text-xs font-bold text-amber-700 dark:text-amber-400">{t.rackPricing.footnote}</p>

                    <div className="mt-12 grid lg:grid-cols-3 gap-8 items-start">
                        <h3 className="text-xl font-bold">{t.rackPricing.addonsTitle}</h3>
                        <ul className="lg:col-span-2 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-600 dark:text-slate-400">
                            {t.rackPricing.addons.map((a) => <li key={a} className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{a}</li>)}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── 10. SERVICE LEVELS ──────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="06">{t.eyebrows.ops}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">{t.serviceLevels.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">{t.serviceLevels.intro}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-5">
                        {(["core", "remote", "enterprise"] as const).map((k, i) => {
                            const s = t.serviceLevels[k];
                            const dark = k === "enterprise";
                            return (
                                <div key={k} className={`flex flex-col p-7 rounded-3xl border ${dark ? "bg-slate-900 dark:bg-black text-white border-slate-800" : i === 1 ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
                                    <span className={`self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-5 ${dark ? "bg-white/10 text-amber-300" : i === 1 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"}`}>{s.badge}</span>
                                    <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                                    <p className={`text-sm font-bold mb-6 ${dark ? "text-slate-300" : "text-indigo-600 dark:text-indigo-400"}`}>{s.price}</p>
                                    <ul className={`space-y-2.5 text-sm flex-1 ${dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                                        {s.items.map((it) => <li key={it} className="flex gap-2"><CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${dark ? "text-amber-300" : "text-emerald-500"}`} />{it}</li>)}
                                    </ul>
                                    {"cta" in s && s.cta && <a href="#quote" className="mt-7 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors">{s.cta} <ArrowRight size={16} /></a>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 10b. MANAGED SERVER OPERATIONS ─────────────────────── */}
            <section id="server-operations" className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10 scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="06b">{t.eyebrows.serverOps}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{t.serverOps.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{t.serverOps.intro}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed border-l-2 border-indigo-300 dark:border-indigo-500/50 pl-4">{t.serverOps.boundary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {SERVER_OPS_PLANS.map((pl, i) => {
                            const c = t.serverOps.plans[pl.id];
                            const Icon = [MonitorCheck, ShieldPlus, Clock, Sparkles][i];
                            const gpu = pl.id === "gpu";
                            const featured = pl.id === "standard";
                            return (
                                <div key={pl.id} className={`flex flex-col p-7 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${gpu ? "bg-slate-900 dark:bg-black text-white border-slate-800 hover:shadow-indigo-500/20" : featured ? "bg-slate-50 dark:bg-slate-950 border-indigo-500 shadow-xl shadow-indigo-500/10" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 hover:border-indigo-400/60"}`}>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${gpu ? "bg-white/10 text-amber-300" : "bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-indigo-600 dark:text-indigo-400"}`}><Icon size={20} /></div>
                                        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${gpu ? "text-amber-300" : "text-slate-400"}`}>{t.serverOps.coverage[pl.coverage]}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                                    <p className={`text-sm mb-5 ${gpu ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{c.tagline}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${gpu ? "text-slate-400" : "text-slate-400"}`}>{t.categories.from}</p>
                                    <p className="text-2xl font-black tracking-tight tabular-nums">{formatIdrCompact(pl.monthlyPerServerIdr)}<span className="text-xs font-bold text-slate-400 ml-1">{gpu ? t.serverOps.perNodeMonth : t.serverOps.perServerMonth}</span></p>
                                    <p className={`mt-1 text-xs mb-5 ${gpu ? "text-slate-400" : "text-slate-500"}`}>{t.serverOps.setup} {formatIdr(pl.setupPerServerIdr)} · {pl.includedHours ? `${pl.includedHours} ${t.serverOps.hours} · ` : ""}{pl.responseMinutes} min {t.serverOps.response}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${gpu ? "text-slate-400" : "text-slate-400"}`}>{t.serverOps.included}</p>
                                    <ul className={`space-y-2 text-sm flex-1 ${gpu ? "text-slate-200" : "text-slate-600 dark:text-slate-400"}`}>
                                        {c.items.map((it) => <li key={it} className="flex gap-2"><CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${gpu ? "text-amber-300" : "text-emerald-500"}`} />{it}</li>)}
                                    </ul>
                                    {"note" in c && c.note && <p className={`mt-4 text-[11px] leading-snug ${gpu ? "text-slate-400" : "text-slate-500"}`}>{c.note}</p>}
                                    <PresetLink presetId="ops" className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${gpu ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 dark:bg-indigo-600 text-white hover:bg-black dark:hover:bg-indigo-500"}`}>
                                        {t.serverOps.cta} <ArrowRight size={16} />
                                    </PresetLink>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 grid lg:grid-cols-3 gap-8 items-start">
                        <h3 className="text-xl font-bold">{t.serverOps.addonsTitle}</h3>
                        <ul className="lg:col-span-2 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.extraHour}: {formatIdr(SERVER_OPS_ADDONS.extraAdminHourIdr)}</li>
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.backup}: {formatIdr(SERVER_OPS_ADDONS.backupPer100GbIdr)} {t.serverOps.addons.backupUnit} · {formatIdr(SERVER_OPS_ADDONS.backupPerTbIdr)} {t.serverOps.addons.backupTb}</li>
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.hardware}: {formatIdr(SERVER_OPS_ADDONS.hardwareMaintenanceNbdPerServerIdr)} {t.serverOps.perServerMonth}. {t.serverOps.addons.hardwareNote}</li>
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.vuln}: {formatIdr(SERVER_OPS_ADDONS.vulnerabilityScanPerServerIdr)} {t.serverOps.perServerMonth}</li>
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.dr}: {formatIdr(SERVER_OPS_ADDONS.drRestoreTestPerEventIdr)} {t.serverOps.addons.perEvent}</li>
                            <li className="flex gap-3"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{t.serverOps.addons.licensing}</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── 11. PROCESS ─────────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-14">
                        <Eyebrow n="07">{t.eyebrows.process}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight">{t.process.title}</h2>
                    </div>
                    <ol className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {t.process.steps.map((s, i) => {
                            const Icon = processIcons[i];
                            return (
                                <li key={i} className="relative pl-16">
                                    <span className="absolute left-0 top-0 h-12 w-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400"><Icon size={16} /><h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* ── 12. REPORTING ───────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-14 items-start">
                        <div>
                            <Eyebrow n="08">{t.eyebrows.reporting}</Eyebrow>
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6">{t.reporting.title}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.reporting.copy}</p>
                            <p className="mt-6 text-xs text-slate-500 italic">{t.reporting.note}</p>
                        </div>
                        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400">{t.reporting.exampleTitle}</p>
                                <FileBarChart size={16} className="text-indigo-500" />
                            </div>
                            <ul className="divide-y divide-slate-100 dark:divide-white/5">
                                {t.reporting.items.map((it, i) => (
                                    <li key={i} className="flex gap-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="font-mono text-[10px] text-slate-400 pt-1 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>{it}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 13. MULTI-SITE ──────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-14 items-center">
                        <div>
                            <Eyebrow n="09">{t.eyebrows.multisite}</Eyebrow>
                            <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-6">{t.multisite.title}</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{t.multisite.copy}</p>
                            <p className="text-xs text-slate-500">{t.multisite.disclaimer}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {t.multisite.useCases.map((u) => (
                                <span key={u} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200"><Network size={14} className="text-indigo-500" />{u}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 14. ENTERPRISE ──────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="10">{t.eyebrows.scale}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-4">{t.enterprise.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.enterprise.copy}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {t.enterprise.tiers.map((tier, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10">
                                <p className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3">{tier.range}</p>
                                <h3 className="font-bold mb-2">{tier.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{tier.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 15. FAQ ─────────────────────────────────────────────── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Eyebrow n="11">{t.eyebrows.faq}</Eyebrow>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-10">{t.faq.title}</h2>
                    <Faq items={t.faq.items} />
                </div>
            </section>

            {/* ── 16. FINAL CTA ───────────────────────────────────────── */}
            <section id="quote" className="relative py-24 lg:py-32 bg-slate-900 dark:bg-black text-white text-center overflow-hidden scroll-mt-24">
                <div className="absolute inset-0 gdi-blueprint opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">{t.finalCta.h2}</h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">{t.finalCta.copy}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <PresetLink className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer">{t.finalCta.primary} <ArrowRight size={18} /></PresetLink>
                        <Link href="/auth/register" className="inline-flex items-center px-8 py-4 border border-white/25 hover:border-white text-white font-bold rounded-full transition-colors">{t.finalCta.secondary}</Link>
                    </div>
                    <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">{t.finalCta.micro}</p>
                    <p className="mt-10 max-w-3xl mx-auto text-[11px] text-slate-500 leading-relaxed">{t.disclaimer}</p>
                </div>
            </section>
        </div>
    );
}
