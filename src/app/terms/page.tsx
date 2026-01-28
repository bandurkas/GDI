
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { FileText, ShieldCheck, Clock, Bookmark } from "lucide-react";

export default function TermsPage() {
    const { dictionary } = useLanguage();
    const { terms } = dictionary as any;

    if (!terms) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-6">
                        <FileText size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        {terms.title}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                        <Clock size={16} />
                        <span>{terms.lastUpdated}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {terms.sections.map((section: any, index: number) => (
                        <div
                            key={index}
                            className="p-8 md:p-10 rounded-3xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm"
                        >
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                {section.title}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                                {section.content}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Questions about our terms? Email us at <a href="mailto:info@gdiconsult.online" className="text-indigo-600 font-bold hover:underline">info@gdiconsult.online</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
