import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
    ArrowRight, Compass, Brain, Workflow, Layers, MessageSquareText, CheckCircle2, Clock, Users, FileText, ShieldCheck, Server, Wrench, Sparkles,
    ClipboardCheck, Rocket, CalendarCheck, PackageCheck, LifeBuoy, Building2,
} from "lucide-react";
import { servicesContent, type ServicesLang } from "@/lib/services/content";
import { SERVICE_PACKAGES, PACKAGE_NAMES, ASSISTANT_LIMITS, formatIdr, type PackageId } from "@/lib/services/config";
import { formatUsd } from "@/lib/colocation/calc";
import { Faq } from "@/components/colocation/Bits";
import { BuyButton } from "@/components/services/BuyButton";
import { PackageFinder } from "@/components/services/PackageFinder";
import { ServiceLeadForm } from "@/components/services/ServiceLeadForm";

export async function generateMetadata(): Promise<Metadata> {
    const lang = ((await cookies()).get("lang")?.value as ServicesLang) || "en";
    const m = servicesContent[lang].meta;
    return { title: m.title, description: m.description, alternates: { canonical: "/products" }, openGraph: { title: m.title, description: m.description, url: "/products", type: "website" } };
}

const pkgIcon: Record<PackageId, React.ReactNode> = { "start-ai": <Compass size={22} />, "middle-scale": <Workflow size={22} />, "automation-platform": <Layers size={22} />, "ent-assistant": <MessageSquareText size={22} /> };
const processIcons = [ClipboardCheck, Rocket, CalendarCheck, PackageCheck, LifeBuoy];

function Eyebrow({ n, children, light }: { n: string; children: React.ReactNode; light?: boolean }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className={`font-mono text-[11px] font-bold tracking-[0.25em] ${light ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400"}`}>{n}</span>
            <span className={`h-px w-8 ${light ? "bg-amber-300/60" : "bg-indigo-300 dark:bg-indigo-500/50"}`} />
            <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${light ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{children}</span>
        </div>
    );
}

const durationLabel = (d: [number, number], t: { workingDays: string }) => `${d[0] === d[1] ? d[0] : `${d[0]}–${d[1]}`} ${t.workingDays}`;
const buyCls = "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-bold text-sm hover:bg-black dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-60";

export default async function ServicesPage() {
    const lang = ((await cookies()).get("lang")?.value as ServicesLang) || "en";
    const t = servicesContent[lang];
    const P = t.packagesSection;
    const maxPrice = Math.max(...SERVICE_PACKAGES.map((p) => p.priceIdr));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">

            {/* ── 1. HERO ── */}
            <section className="relative overflow-hidden bg-white dark:bg-slate-950 pt-20 pb-16 lg:pt-28 lg:pb-24">
                <div className="absolute inset-0 gdi-blueprint [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />
                <div className="absolute -top-32 left-[-10%] w-[55%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
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
                                <a href="#packages" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:-translate-y-0.5">{t.hero.ctaPrimary} <ArrowRight size={18} /></a>
                                <a href="#finder" className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-all"><Compass size={18} className="text-indigo-600 dark:text-indigo-400" />{t.hero.ctaSecondary}</a>
                            </div>
                            <p className="gdi-reveal gdi-reveal-4 mt-10 font-mono text-xs font-bold tracking-wide text-slate-700 dark:text-slate-200">{t.hero.micro}</p>
                        </div>
                        {/* Ladder card */}
                        <div className="lg:col-span-5 gdi-reveal gdi-reveal-3">
                            <div className="rounded-3xl bg-slate-900 dark:bg-black text-white p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-12 -mt-12" />
                                <p className="relative font-mono text-[10px] uppercase tracking-[0.25em] text-indigo-300 mb-5">{P.eyebrow}</p>
                                <ul className="relative space-y-4">
                                    {SERVICE_PACKAGES.map((p) => (
                                        <li key={p.id}>
                                            <div className="flex items-baseline justify-between gap-3 text-sm">
                                                <span className="font-bold truncate">{PACKAGE_NAMES[p.id]}</span>
                                                <span className="font-mono text-xs text-slate-300 whitespace-nowrap">{durationLabel(p.durationDays, P)}</span>
                                            </div>
                                            <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                <div className={`h-full rounded-full ${p.tier === "assistant" ? "bg-amber-400" : "bg-indigo-400"}`} style={{ width: `${Math.max(8, (p.priceIdr / maxPrice) * 100)}%` }} />
                                            </div>
                                            <p className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">{formatIdr(p.priceIdr)} · {formatUsd(p.priceIdr)}</p>
                                        </li>
                                    ))}
                                </ul>
                                <p className="relative mt-6 text-xs text-slate-400 leading-relaxed">{P.exclTax}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. TRUST ── */}
            <section className="border-y border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/10">
                        {t.trust.map((item, i) => {
                            const Icon = [FileText, CheckCircle2, ShieldCheck, Server][i];
                            return (
                                <div key={i} className="flex gap-4 p-6 lg:p-8">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Icon size={20} /></div>
                                    <div><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 3. PACKAGES ── */}
            <section id="packages" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="01">{P.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{P.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{P.intro}</p>
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {SERVICE_PACKAGES.map((p) => {
                            const c = t.packages[p.id];
                            const dark = p.tier === "assistant";
                            return (
                                <div key={p.id} className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${dark ? "bg-slate-900 dark:bg-black text-white border-slate-800 hover:shadow-indigo-500/20" : p.featured ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-indigo-500/10"}`}>
                                    {p.featured && <span className="absolute -top-3 left-6 px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest">{P.featured}</span>}
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-5 ${dark ? "bg-white/10 text-amber-300" : "bg-slate-50 dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-white/10"}`}>{pkgIcon[p.id]}</div>
                                    <h3 className="text-xl font-bold mb-1">{PACKAGE_NAMES[p.id]}</h3>
                                    <p className={`font-mono text-xs mb-4 ${dark ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}><Clock size={12} className="inline -mt-0.5 mr-1" />{durationLabel(p.durationDays, P)}</p>
                                    <p className={`text-sm leading-relaxed mb-4 ${dark ? "text-slate-200" : "text-slate-700 dark:text-slate-300"} font-medium`}>{c.tagline}</p>
                                    <p className={`text-xs leading-relaxed mb-5 flex-1 ${dark ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>{c.forWho}</p>
                                    <div className={`pt-5 border-t ${dark ? "border-white/10" : "border-slate-100 dark:border-white/5"}`}>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{P.from}</p>
                                        <p className="text-2xl font-black tracking-tight tabular-nums">{formatIdr(p.priceIdr)}</p>
                                        <p className="font-mono text-xs text-slate-400">{formatUsd(p.priceIdr)} · {P.exclTax}</p>
                                        <BuyButton productId={p.id} label={P.buy} className={`mt-4 w-full ${dark ? "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-60" : buyCls}`} />
                                        <a href={`#pkg-${p.id}`} className={`mt-2 w-full inline-flex items-center justify-center gap-1 py-2 text-sm font-bold ${dark ? "text-slate-300 hover:text-white" : "text-indigo-600 dark:text-indigo-400 hover:underline"}`}>{P.details} <ArrowRight size={14} /></a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 4. FINDER ── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="02">{t.finder.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight">{t.finder.title}</h2>
                    </div>
                    <PackageFinder content={t} />
                </div>
            </section>

            {/* ── 5. FULL SCOPE ── */}
            {SERVICE_PACKAGES.map((p, i) => {
                const c = t.packages[p.id];
                const dark = p.tier === "assistant";
                const next = p.nextId ? PACKAGE_NAMES[p.nextId] : null;
                return (
                    <section key={p.id} id={`pkg-${p.id}`} className={`scroll-mt-24 py-20 lg:py-28 ${dark ? "relative bg-slate-900 dark:bg-black text-white overflow-hidden" : i % 2 === 0 ? "bg-slate-50 dark:bg-slate-950" : "bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10"}`}>
                        {dark && <><div className="absolute inset-0 gdi-blueprint opacity-60 [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)]" /><div className="absolute top-1/3 right-[-10%] w-[45%] h-[60%] rounded-full bg-indigo-500/15 blur-[120px]" /></>}
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="grid lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-5">
                                    <Eyebrow n={`0${i + 3}`} light={dark}>{PACKAGE_NAMES[p.id]}</Eyebrow>
                                    <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{c.tagline}</h2>
                                    <p className={`text-base leading-relaxed mb-4 ${dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}><span className={`font-bold ${dark ? "text-white" : "text-slate-900 dark:text-white"}`}>{c.forWho}</span></p>
                                    <p className={`text-base leading-relaxed mb-8 ${dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>{c.problem}</p>
                                    <div className={`rounded-3xl p-6 border ${dark ? "bg-white/5 border-white/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm"}`}>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{P.duration}</p><p className="font-mono font-bold">{durationLabel(p.durationDays, P)}</p></div>
                                            <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.compare.rows.yourTime}</p><p className="font-mono font-bold">{p.customerHours[0]}–{p.customerHours[1]} {t.compare.hours}</p></div>
                                            <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.compare.rows.support}</p><p className="font-mono font-bold">{p.supportDays} {t.compare.days}</p></div>
                                            <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.compare.rows.training}</p><p className="font-mono font-bold">{p.trainingSessions}</p></div>
                                        </div>
                                        <div className={`mt-5 pt-5 border-t ${dark ? "border-white/10" : "border-slate-100 dark:border-white/10"}`}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{P.from}</p>
                                            <p className="text-3xl font-black tracking-tight tabular-nums">{formatIdr(p.priceIdr)}</p>
                                            <p className="font-mono text-xs text-slate-400">{formatUsd(p.priceIdr)} · {P.exclTax}</p>
                                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                                <BuyButton productId={p.id} label={P.buy} className={dark ? "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-60" : buyCls} />
                                                <a href="#request" className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border font-bold text-sm transition-colors ${dark ? "border-white/25 hover:border-white" : "border-slate-300 dark:border-white/20 hover:bg-white dark:hover:bg-white/5"}`}>{P.discuss}</a>
                                            </div>
                                        </div>
                                        {next && <p className={`mt-4 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{P.nextStep}: <a href={`#pkg-${p.nextId}`} className={`font-bold ${dark ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400"}`}>{next}</a></p>}
                                    </div>
                                </div>
                                <div className="lg:col-span-7 grid md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><Wrench size={14} />{lang === "id" ? "Yang kami kerjakan" : "What we do"}</h3>
                                        <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2.5">
                                            {c.whatWeDo.map((it) => <li key={it} className={`flex gap-2.5 text-sm leading-relaxed ${dark ? "text-slate-200" : "text-slate-700 dark:text-slate-300"}`}><CheckCircle2 size={16} className={`mt-0.5 shrink-0 ${dark ? "text-amber-300" : "text-emerald-500"}`} />{it}</li>)}
                                        </ul>
                                    </div>
                                    <div className={`rounded-2xl p-5 border ${dark ? "bg-white/5 border-white/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
                                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><PackageCheck size={14} />{lang === "id" ? "Hasil yang diserahkan" : "Deliverables"}</h3>
                                        <ul className="space-y-2">{c.deliverables.map((it) => <li key={it} className={`flex gap-2 text-sm ${dark ? "text-slate-200" : "text-slate-700 dark:text-slate-300"}`}><FileText size={14} className="mt-0.5 shrink-0 text-slate-400" />{it}</li>)}</ul>
                                    </div>
                                    <div className={`rounded-2xl p-5 border ${dark ? "bg-white/5 border-white/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
                                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><Clock size={14} />{lang === "id" ? "Jadwal" : "Timeline"}</h3>
                                        <ol className={`relative pl-4 border-l-2 space-y-3 ${dark ? "border-white/15" : "border-indigo-100 dark:border-indigo-900/40"}`}>
                                            {c.timeline.map((s) => (
                                                <li key={s.when} className="relative">
                                                    <span className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 ${dark ? "bg-amber-300 border-slate-900" : "bg-indigo-500 border-white dark:border-slate-900"}`} />
                                                    <p className={`font-mono text-xs font-bold ${dark ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400"}`}>{s.when}</p>
                                                    <p className={`text-sm ${dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>{s.what}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                    <div>
                                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3"><Users size={14} />{lang === "id" ? "Yang Anda sediakan" : "What you provide"}</h3>
                                        <ul className="space-y-1.5">{c.youProvide.map((it) => <li key={it} className={`flex gap-2 text-sm ${dark ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{it}</li>)}</ul>
                                    </div>
                                    <div>
                                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{lang === "id" ? "Tidak termasuk" : "Not included"}</h3>
                                        <ul className="space-y-1.5">{c.notIncluded.map((it) => <li key={it} className={`flex gap-2 text-sm ${dark ? "text-slate-400" : "text-slate-500 dark:text-slate-500"}`}><span className="mt-2 h-1 w-3 gdi-dash text-slate-400 shrink-0" />{it}</li>)}</ul>
                                    </div>
                                    <div className={`md:col-span-2 rounded-2xl p-5 border-l-4 ${dark ? "bg-white/5 border-amber-300" : "bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-500"}`}>
                                        <p className={`text-sm font-medium leading-relaxed ${dark ? "text-white" : "text-emerald-900 dark:text-emerald-100"}`}><Sparkles size={14} className="inline -mt-0.5 mr-1.5" />{c.outcome}</p>
                                        {p.id === "ent-assistant" && <p className="mt-2 text-xs text-slate-400">{ASSISTANT_LIMITS.documents} docs · {ASSISTANT_LIMITS.pages.toLocaleString("en-US")} pages · {ASSISTANT_LIMITS.channels} channel · {ASSISTANT_LIMITS.departments} department</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}

            {/* ── 6. COMPARE ── */}
            <section id="compare" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="07">{t.compare.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight">{t.compare.title}</h2>
                    </div>
                    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[760px]">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-white/10">
                                        <th className="text-left px-6 py-4" />
                                        {SERVICE_PACKAGES.map((p) => <th key={p.id} className="text-left px-4 py-4 text-slate-900 dark:text-white normal-case tracking-normal text-sm font-bold">{PACKAGE_NAMES[p.id]}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                                    {([
                                        [t.compare.rows.result, (p: typeof SERVICE_PACKAGES[number]) => t.compare.results[p.id]],
                                        [t.compare.rows.duration, (p: typeof SERVICE_PACKAGES[number]) => durationLabel(p.durationDays, P)],
                                        [t.compare.rows.yourTime, (p: typeof SERVICE_PACKAGES[number]) => `${p.customerHours[0]}–${p.customerHours[1]} ${t.compare.hours}`],
                                        [t.compare.rows.integrations, (p: typeof SERVICE_PACKAGES[number]) => (p.integrationsIncluded ? String(p.integrationsIncluded) : t.compare.none)],
                                        [t.compare.rows.training, (p: typeof SERVICE_PACKAGES[number]) => String(p.trainingSessions)],
                                        [t.compare.rows.support, (p: typeof SERVICE_PACKAGES[number]) => `${p.supportDays} ${t.compare.days}`],
                                    ] as Array<[string, (p: typeof SERVICE_PACKAGES[number]) => string]>).map(([label, fn]) => (
                                        <tr key={label} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">{label}</td>
                                            {SERVICE_PACKAGES.map((p) => <td key={p.id} className="px-4 py-3 text-slate-700 dark:text-slate-300">{fn(p)}</td>)}
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 dark:bg-white/5">
                                        <td className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.compare.rows.price}</td>
                                        {SERVICE_PACKAGES.map((p) => (
                                            <td key={p.id} className="px-4 py-4">
                                                <div className="font-black tabular-nums text-slate-900 dark:text-white">{formatIdr(p.priceIdr)}</div>
                                                <div className="font-mono text-[11px] text-slate-400">{formatUsd(p.priceIdr)}</div>
                                                <BuyButton productId={p.id} label={P.buy} className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-black dark:hover:bg-indigo-500 transition-colors disabled:opacity-60" />
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. PROCESS ── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-14">
                        <Eyebrow n="08">{t.process.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight">{t.process.title}</h2>
                    </div>
                    <ol className="grid md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10">
                        {t.process.steps.map((s, i) => {
                            const Icon = processIcons[i];
                            return (
                                <li key={i} className="relative pl-16 lg:pl-0 lg:pt-16">
                                    <span className="absolute left-0 top-0 h-12 w-12 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-mono font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400"><Icon size={16} /><h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </section>

            {/* ── 8. BEYOND + REQUEST ── */}
            <section id="beyond" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-12">
                        <Eyebrow n="09">{t.beyond.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tight mb-5">{t.beyond.title}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{t.beyond.intro}</p>
                    </div>
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 space-y-4">
                            {t.beyond.items.map((it, i) => {
                                const Icon = [Brain, Wrench, Server][i];
                                const infra = i === 2;
                                return (
                                    <div key={it.title} className={`flex gap-5 p-6 rounded-2xl border ${infra ? "bg-slate-900 dark:bg-black text-white border-slate-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10"}`}>
                                        <Icon className={`shrink-0 h-7 w-7 ${infra ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400"}`} />
                                        <div>
                                            <p className="font-bold">{it.title}</p>
                                            <p className={`mt-1 text-sm leading-relaxed ${infra ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{it.desc}</p>
                                            {infra && <Link href="/services/managed-colocation#server-operations" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white transition-colors"><Building2 size={14} />{t.beyond.colocationCta} <ArrowRight size={14} /></Link>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="lg:col-span-7">
                            <h3 className="text-xl font-bold mb-1">{t.beyond.formTitle}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{t.beyond.formIntro}</p>
                            <ServiceLeadForm content={t} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 9. STACK + INDUSTRIES ── */}
            <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-white/10">
                <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-14">
                    <div>
                        <Eyebrow n="10">{t.stack.title}</Eyebrow>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">{t.stack.title}</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">{t.stack.intro}</p>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {t.stack.groups.map((g) => (
                                <div key={g.name}>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{g.name}</p>
                                    <ul className="space-y-1.5">{g.items.map((it) => <li key={it} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="mt-2 h-1 w-3 gdi-dash text-indigo-500 shrink-0" />{it}</li>)}</ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Eyebrow n="11">{t.industries.eyebrow}</Eyebrow>
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-4">{t.industries.title}</h2>
                        <p className="text-xs text-slate-500 italic mb-8">{t.industries.note}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {t.industries.items.map((it) => (
                                <div key={it.name} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 hover:border-indigo-400/60 transition-colors">
                                    <p className="font-bold mb-1">{it.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{it.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 10. FAQ ── */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Eyebrow n="12">FAQ</Eyebrow>
                    <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-10">{t.faq.title}</h2>
                    <Faq items={t.faq.items} />
                    <p className="mt-6 text-xs text-slate-500">
                        <Link href="/refund" className="underline hover:text-indigo-600">Refund Policy</Link> · <Link href="/terms" className="underline hover:text-indigo-600">Terms of Service</Link>
                    </p>
                </div>
            </section>

            {/* ── 11. FINAL CTA ── */}
            <section className="relative py-24 lg:py-32 bg-slate-900 dark:bg-black text-white text-center overflow-hidden">
                <div className="absolute inset-0 gdi-blueprint opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6">{t.finalCta.h2}</h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">{t.finalCta.copy}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#packages" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30">{t.finalCta.primary} <ArrowRight size={18} /></a>
                        <a href="#request" className="inline-flex items-center px-8 py-4 border border-white/25 hover:border-white text-white font-bold rounded-full transition-colors">{t.finalCta.secondary}</a>
                    </div>
                    <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">{t.finalCta.micro}</p>
                    <p className="mt-10 max-w-3xl mx-auto text-[11px] text-slate-500 leading-relaxed">{t.disclaimer}</p>
                </div>
            </section>
        </div>
    );
}
