import { CheckCircle2, Zap, Shield, Brain, Globe, ChevronRight, ArrowRight, Server, Sparkles, Cpu, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { dictionaries } from "@/lib/dictionaries";
import { colocationContent, type Lang } from "@/lib/colocation/content";
import { getPreset } from "@/lib/colocation/config";
import { calculateColocation, formatIdrCompact } from "@/lib/colocation/calc";

const fromPrice = (id: string) =>
    formatIdrCompact(calculateColocation({ presetId: id, quantity: 1, contractMonths: 1, bandwidthId: "basic", gpuFabric: false, siteMode: "single", drScope: "all", drCount: 0, serviceLevel: "core" }).monthlyIdr);

export default async function GDIPage() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value as Lang) || "en";
    const dict = dictionaries[lang];
    const colo = colocationContent[lang];
    const infraProfiles = [getPreset("standard-1u")!, getPreset("dgx-h100")!, getPreset("dgx-b200")!, getPreset("dgx-b300")!];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-x-hidden">
            {/* --- HERO SECTION --- */}
            <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 bg-white dark:bg-slate-950 isolate">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                    <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-[#00AEEF] blur-[100px] opacity-20 animate-blob-slow mix-blend-multiply"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-[#6A5AE0] blur-[100px] opacity-20 animate-blob-slow animation-delay-2000 mix-blend-multiply"></div>
                    <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#00C2FF] blur-[100px] opacity-15 animate-blob-slow animation-delay-4000 mix-blend-multiply"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50 dark:bg-slate-900 origin-bottom-right -skew-y-3 translate-y-12 z-0"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
                        {/* Left Content */}
                        <div className="lg:col-span-7 text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-8 border border-slate-900/5 dark:border-white/10 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                </span>
                                {dict.home.badge}
                                <ChevronRight size={14} className="opacity-50" />
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.95]">
                                {dict.home.heroTitle}
                            </h1>
                            <p className="max-w-xl text-lg lg:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-10">
                                {dict.home.heroSubtitle}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/products" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group">
                                    {dict.home.exploreSolutions} <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </Link>
                                <Link href="/services/managed-colocation" className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                                    <Server size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    {dict.home.exploreInfra}
                                </Link>
                            </div>

                            {/* Capability strip (facts, no fake logos) */}
                            <div className="mt-14 pt-8 border-t border-slate-100/50 dark:border-white/10">
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{dict.home.trustedBy}</p>
                                <div className="flex flex-wrap gap-2">
                                    {dict.home.capabilities.map((c) => (
                                        <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                            <CheckCircle2 size={12} className="text-emerald-500" />{c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right visual: two pillars */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative space-y-4 lg:translate-x-4">
                                {/* AI card */}
                                <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-white/10 animate-float-slow">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Brain size={20} /></div>
                                            <p className="font-bold text-slate-900 dark:text-white">{dict.home.pillarAi.badge}</p>
                                        </div>
                                        <Image src="/gdi-logo.png" alt="GDI" width={64} height={20} className="h-5 w-auto opacity-70" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[dict.products.startAi.name, dict.products.middleScale.name, dict.products.autoPlatform.name, dict.products.entAssistant.name].map((n, i) => (
                                            <div key={n} className={`px-3 py-2.5 rounded-xl text-xs font-bold ${i === 0 ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/10"}`}>{n}</div>
                                        ))}
                                    </div>
                                </div>
                                {/* Infra card */}
                                <div className="relative bg-slate-900 dark:bg-black text-white rounded-3xl p-6 shadow-2xl shadow-slate-900/30 border border-slate-800 overflow-hidden animate-float-slow animation-delay-2000">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                                    <div className="relative flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center"><Server size={20} /></div>
                                            <p className="font-bold">{dict.home.pillarInfra.badge}</p>
                                        </div>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Jakarta</span>
                                    </div>
                                    <ul className="relative space-y-3">
                                        {infraProfiles.map((p) => {
                                            const kw = p.displayPowerKw ?? p.pricingPowerKw;
                                            return (
                                                <li key={p.id}>
                                                    <div className="flex items-baseline justify-between gap-3 text-xs">
                                                        <span className="font-bold truncate">{p.name}</span>
                                                        <span className="font-mono text-slate-400 whitespace-nowrap">{p.rackU}U · {kw} kW</span>
                                                    </div>
                                                    <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden">
                                                        <div className={`h-full rounded-full ${p.category === "extreme-gpu" ? "bg-amber-400" : "bg-indigo-400"}`} style={{ width: `${Math.max(3, (kw / 15) * 100)}%` }} />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <p className="relative mt-5 text-[11px] text-slate-400">{colo.hero.tagline}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TWO PILLARS SECTION --- */}
            <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900 relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mb-14">
                        <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">{dict.home.pillarsEyebrow}</h2>
                        <h3 className="text-3xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5">{dict.home.pillarsTitle}</h3>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{dict.home.pillarsIntro}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* AI pillar */}
                        <div className="group flex flex-col p-8 lg:p-10 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Brain size={22} /></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{dict.home.pillarAi.badge}</span>
                            </div>
                            <h4 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-3">{dict.home.pillarAi.title}</h4>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{dict.home.pillarAi.desc}</p>
                            <ul className="space-y-3 mb-8 flex-1">
                                {dict.home.pillarAi.points.map((pt) => (
                                    <li key={pt} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500 shrink-0" />{pt}</li>
                                ))}
                            </ul>
                            <Link href="/products" className="inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-bold hover:bg-black dark:hover:bg-indigo-500 transition-colors">
                                {dict.home.pillarAi.cta} <ArrowRight size={16} />
                            </Link>
                        </div>
                        {/* Infra pillar */}
                        <div className="group relative flex flex-col p-8 lg:p-10 rounded-3xl bg-slate-900 dark:bg-black text-white border border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300">
                            <div className="absolute inset-0 gdi-blueprint opacity-40 [mask-image:linear-gradient(to_bottom,#000,transparent)] pointer-events-none" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="relative flex items-center gap-3 mb-6">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 text-amber-300 flex items-center justify-center"><Server size={22} /></div>
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">{dict.home.pillarInfra.badge}</span>
                            </div>
                            <h4 className="relative text-2xl lg:text-3xl font-black tracking-tight mb-3">{dict.home.pillarInfra.title}</h4>
                            <p className="relative text-slate-300 leading-relaxed mb-6">{dict.home.pillarInfra.desc}</p>
                            <ul className="relative space-y-3 mb-8 flex-1">
                                {dict.home.pillarInfra.points.map((pt) => (
                                    <li key={pt} className="flex gap-3 text-sm text-slate-200"><CheckCircle2 size={16} className="mt-0.5 text-amber-300 shrink-0" />{pt}</li>
                                ))}
                            </ul>
                            <div className="relative flex flex-wrap items-end justify-between gap-4">
                                <div className="flex gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">1U · {dict.home.pillarInfra.from}</p>
                                        <p className="font-mono text-xl font-bold tabular-nums">{fromPrice("standard-1u")}<span className="text-xs text-slate-400 ml-1">{dict.home.pillarInfra.perMonth}</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DGX B200 · {dict.home.pillarInfra.from}</p>
                                        <p className="font-mono text-xl font-bold tabular-nums text-amber-300">{fromPrice("dgx-b200")}<span className="text-xs text-slate-400 ml-1">{dict.home.pillarInfra.perMonth}</span></p>
                                    </div>
                                </div>
                                <Link href="/services/managed-colocation#calculator" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors">
                                    {dict.home.pillarInfra.cta} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ABOUT COMPANY SECTION --- */}
            <section className="py-12 lg:py-20 bg-white dark:bg-slate-950 relative">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">{dict.common.aboutUs}</h2>
                            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                {dict.home.aboutTitle}
                            </h3>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p>{dict.home.aboutText1}</p>
                                <p>{dict.home.aboutText2}</p>
                                <p>{dict.home.aboutText3}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 translate-y-8">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <Brain className="text-indigo-600 mb-4 h-8 w-8" />
                                    <p className="font-bold text-slate-900 dark:text-white">{dict.home.strengthCustom.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{dict.home.strengthCustom.desc}</p>
                                </div>
                                <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl text-white">
                                    <Globe className="mb-4 h-8 w-8" />
                                    <p className="font-bold">{dict.home.strengthGlobal.title}</p>
                                    <p className="text-sm text-indigo-100">{dict.home.strengthGlobal.desc}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <Shield className="text-emerald-600 mb-4 h-8 w-8" />
                                    <p className="font-bold text-slate-900 dark:text-white">{dict.home.strengthPerf.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{dict.home.strengthPerf.desc}</p>
                                </div>
                                <div className="bg-slate-900 dark:bg-black p-6 rounded-2xl border border-slate-800 shadow-xl text-white">
                                    <Building2 className="text-amber-300 mb-4 h-8 w-8" />
                                    <p className="font-bold">{dict.home.strengthInfra.title}</p>
                                    <p className="text-sm text-slate-400">{dict.home.strengthInfra.desc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- MISSION SECTION --- */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">{dict.common.ourMission}</h2>
                    <blockquote className="text-3xl lg:text-4xl font-medium text-slate-900 dark:text-white leading-normal mb-8">
                        {dict.home.missionQuote}
                    </blockquote>
                    <Link href="/auth/register" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                        {dict.home.missionLink} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* --- CAPABILITIES / STRENGTHS SECTION --- */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{dict.common.keyStrengths}</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400">{dict.home.choosingGdi}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: dict.home.strengthCustom.title, desc: dict.home.strengthCustom.desc, icon: <Brain size={24} /> },
                            { title: dict.home.strengthAuto.title, desc: dict.home.strengthAuto.desc, icon: <Zap size={24} /> },
                            { title: dict.home.strengthInfra.title, desc: dict.home.strengthInfra.desc, icon: <Cpu size={24} /> },
                            { title: dict.home.strengthPartner.title, desc: dict.home.strengthPartner.desc, icon: <Shield size={24} /> },
                        ].map((item, idx) => (
                            <div key={idx} className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FOOTER CTA --- */}
            <section className="py-20 bg-slate-900 dark:bg-black text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 gdi-blueprint opacity-40 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)] pointer-events-none" />
                <div className="container mx-auto px-4 relative">
                    <h2 className="text-3xl font-bold mb-6">{dict.common.readyToTransform}</h2>
                    <p className="text-indigo-200 mb-8 text-lg max-w-2xl mx-auto">
                        {dict.home.footerText}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/auth/register" className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30">
                            {dict.common.getStarted}
                        </Link>
                        <Link href="/products" className="px-8 py-3 bg-transparent border border-slate-600 hover:border-white text-white font-bold rounded-full transition-colors">
                            {dict.home.exploreSolutions}
                        </Link>
                        <Link href="/services/managed-colocation" className="px-8 py-3 bg-transparent border border-slate-600 hover:border-white text-white font-bold rounded-full transition-colors inline-flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-300" /> {dict.home.exploreInfra}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
