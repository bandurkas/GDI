

import { CheckCircle2, Zap, Shield, Brain, Globe, ChevronRight, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { cookies } from "next/headers";
import { dictionaries } from "@/lib/dictionaries";

export default async function GDIPage() {
    const cookieStore = await cookies();
    const lang = (cookieStore.get("lang")?.value as "en" | "id") || "en";
    const dict = dictionaries[lang];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-x-hidden">
            {/* --- HERO SECTION --- */}
            <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 bg-white dark:bg-slate-950 isolate">

                {/* Vibrant Mesh Gradient Background (Optimized for performance) */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 overflow-hidden pointer-events-none">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

                    {/* Optimized gradients: Static on mobile, Animated on desktop */}
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#00AEEF] blur-[60px] md:blur-[80px] opacity-10 md:opacity-20 hidden md:block animate-blob-slow mix-blend-multiply [will-change:transform] [contain:layout_style_paint]"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#6A5AE0] blur-[60px] md:blur-[80px] opacity-10 md:opacity-20 hidden md:block animate-blob-slow animation-delay-2000 mix-blend-multiply [will-change:transform] [contain:layout_style_paint]"></div>

                    {/* Simple mobile gradient fallback */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 md:hidden"></div>

                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white dark:from-slate-950 to-transparent"></div>
                </div>

                {/* Angled Separation (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-slate-50 dark:bg-slate-900 origin-bottom-right -skew-y-3 translate-y-12 z-0"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left Content */}
                        <div className="text-left">
                            {/* Pill Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider mb-8 border border-slate-900/5 dark:border-white/10 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                </span>
                                {dict.home.badge}
                                <ChevronRight size={14} className="opacity-50" />
                            </div>

                            <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.95]">
                                {dict.home.heroTitle}
                            </h1>
                            <p className="max-w-xl text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-10">
                                {dict.home.heroSubtitle}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/auth/register" className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group">
                                    {dict.common.startNow} <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </Link>
                                <Link href="/contact-sales" className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                                    {dict.common.contactSales}
                                </Link>
                            </div>


                            {/* Trusted By Strip */}
                            <div className="mt-16 pt-8 border-t border-slate-100/50 dark:border-white/10">
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{dict.home.trustedBy}</p>
                                <div className="flex flex-wrap gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 dark:brightness-150">
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-lg"><Globe size={20} className="text-indigo-600" /> ACME Corp</div>
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-lg"><Zap size={20} className="text-amber-500" /> BoltShift</div>
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-lg"><Brain size={20} className="text-purple-600" /> NeuralNet</div>
                                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-lg"><Shield size={20} className="text-emerald-500" /> Security</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Visual (Floating UI Mockup) */}
                        <div className="relative hidden lg:block perspective-1000">
                            <div className="relative w-full aspect-[3/4] max-w-sm mx-auto rotate-y-neg-12 rotate-x-5 hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
                                {/* Floating Phone/Card */}
                                <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl border-[1px] border-slate-200 overflow-hidden ring-1 ring-slate-900/5">

                                    {/* Fake Mobile Header */}
                                    <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 pt-4">
                                        <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                                            <div className="w-4 h-4 rounded-full bg-slate-100"></div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex flex-col items-center text-center space-y-8 mt-4">

                                        {/* Logo/Icon */}
                                        {/* Logo/Icon */}
                                        <div className="w-20 h-24 relative mb-2 transform hover:scale-105 transition-transform flex items-center justify-center">
                                            <Image src="/gdi-logo.svg" alt="GDI" width={80} height={96} className="w-full h-auto object-contain" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-slate-900 font-bold text-xl">Abstraction Magazine</h3>
                                            <p className="text-slate-500 font-medium">$19 per month</p>
                                        </div>

                                        {/* Pay Button */}
                                        <button className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition-colors">
                                            <span className="text-lg">{dict.common.pay}</span>
                                        </button>

                                        <div className="relative w-full flex items-center justify-center gap-4 py-2">
                                            <div className="h-[1px] bg-slate-100 w-full"></div>
                                            <span className="text-xs text-slate-400 font-semibold uppercase whitespace-nowrap">{dict.common.orPayWithCard}</span>
                                            <div className="h-[1px] bg-slate-100 w-full"></div>
                                        </div>

                                        {/* Inputs */}
                                        <div className="w-full space-y-3 text-left">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{dict.common.email}</label>
                                                <div className="mt-1 h-10 w-full bg-slate-50 border border-slate-200 rounded-md"></div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">{dict.common.cardInfo}</label>
                                                <div className="mt-1 h-10 w-full bg-slate-50 border border-slate-200 rounded-md flex items-center px-3 gap-2">
                                                    <CreditCard size={14} className="text-slate-400" />
                                                    <div className="flex-1"></div>
                                                    <div className="flex gap-1">
                                                        <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
                                                        <div className="w-6 h-4 bg-slate-200 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Notification Card 1 */}
                                <div className="absolute -right-12 top-24 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 w-64 animate-float-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase">{dict.common.paymentSuccessful}</p>
                                            <p className="text-slate-900 font-bold">$149.00 USD</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Notification Card 2 */}
                                <div className="absolute -left-12 bottom-32 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 w-56 animate-float-slow animation-delay-2000">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                            <Globe size={16} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold uppercase">{dict.common.globalPayout}</p>
                                            <p className="text-slate-900 font-bold">{dict.common.sentToId}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* --- ABOUT COMPANY SECTION --- */}
            <section className="py-12 lg:py-20 bg-white dark:bg-slate-900 relative">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">{dict.common.aboutUs}</h2>
                            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                                {dict.home.aboutTitle}
                            </h3>
                            <div className="space-y-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                <p>
                                    {dict.home.aboutText1}
                                </p>
                                <p>
                                    {dict.home.aboutText2}
                                </p>
                                <p>
                                    {dict.home.aboutText3}
                                </p>
                            </div>
                        </div>

                        {/* Visual Element / Grid */}
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
                                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <Zap className="text-amber-500 mb-4 h-8 w-8" />
                                    <p className="font-bold text-slate-900 dark:text-white">{dict.home.strengthFast.title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{dict.home.strengthFast.desc}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

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
            </section >

            {/* --- CAPABILITIES / STRENGTHS SECTION --- */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{dict.common.keyStrengths}</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400">{dict.home.choosingGdi}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: dict.home.strengthCustom.title,
                                desc: dict.home.strengthCustom.desc,
                                icon: <Brain size={24} />
                            },
                            {
                                title: dict.home.strengthPerf.title,
                                desc: dict.home.strengthPerf.desc,
                                icon: <Zap size={24} />
                            },
                            {
                                title: dict.home.strengthAuto.title,
                                desc: dict.home.strengthAuto.desc,
                                icon: <CheckCircle2 size={24} />
                            },
                            {
                                title: dict.home.strengthPartner.title,
                                desc: dict.home.strengthPartner.desc,
                                icon: <Shield size={24} />
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* --- FOOTER CTA --- */}
            < section className="py-20 bg-slate-900 text-white text-center" >
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-6">{dict.common.readyToTransform}</h2>
                    <p className="text-indigo-200 mb-8 text-lg max-w-2xl mx-auto">
                        {dict.home.footerText}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/auth/register" className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full transition-colors shadow-lg shadow-indigo-500/30">
                            {dict.common.getStarted}
                        </Link>
                        <Link href="/products" className="px-8 py-3 bg-transparent border border-slate-600 hover:border-white text-white font-bold rounded-full transition-colors">
                            {dict.home.exploreSolutions}
                        </Link>
                    </div>
                </div>
            </section >
        </div >
    );
}
