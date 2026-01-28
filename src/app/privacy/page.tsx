
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Lock, Clock } from "lucide-react";

interface Section {
    title: string;
    content: string;
}

interface PrivacyData {
    title: string;
    lastUpdated: string;
    sections: Section[];
}

export default function PrivacyPage() {
    const { dictionary } = useLanguage();
    const privacy = dictionary.privacy;

    if (!privacy) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-6">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                        {privacy.title}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                        <Clock size={16} />
                        <span>{privacy.lastUpdated}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {privacy.sections.map((section, index: number) => (
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

                <div className="mt-16 p-8 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 text-center">
                    <h2 className="text-2xl font-bold mb-4">Need Clarification?</h2>
                    <p className="mb-8 text-indigo-100 max-w-xl mx-auto leading-relaxed">
                        If you have questions about how we handle your data or need to exercise your rights, our legal team is here to help.
                    </p>
                    <a
                        href="mailto:info@gdiconsult.online"
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                    >
                        Contact Privacy Team
                    </a>
                </div>
            </div>
        </div>
    );
}
