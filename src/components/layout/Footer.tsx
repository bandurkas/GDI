
"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    const { dictionary } = useLanguage();

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-16 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/gdi-logo.png" // Fallback to png for now
                                alt="GDI Logo"
                                width={180}
                                height={50}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            {dictionary.home.footerText}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all">
                                <Twitter size={18} />
                            </a>
                            <a
                                href="https://www.linkedin.com/company/global-digital-informasi/?viewAsMember=true"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all"
                            >
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Solutions Section */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest mb-6">
                            {dictionary.footer.solutions}
                        </h3>
                        <ul className="space-y-4">
                            <li><Link href="/products" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">Start AI Pack</Link></li>
                            <li><Link href="/products" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">Enterprise AI</Link></li>
                            <li><Link href="/products" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">Cloud Infrastructure</Link></li>
                        </ul>
                    </div>

                    {/* Company Section */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest mb-6">
                            {dictionary.footer.company}
                        </h3>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">{dictionary.common.aboutUs}</Link></li>
                            <li><Link href="/" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">{dictionary.common.ourMission}</Link></li>
                            <li><Link href="/privacy" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">{dictionary.footer.privacy}</Link></li>
                            <li><Link href="/terms" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">{dictionary.footer.terms}</Link></li>
                            <li><Link href="/refund" className="text-slate-500 dark:text-slate-400 text-sm hover:text-indigo-600 dark:hover:text-white transition-colors">{dictionary.footer.refund}</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest mb-6">
                            {dictionary.footer.support}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                                <Mail size={16} className="text-slate-400" />
                                <span>info@gdiconsult.online</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                                <Phone size={16} className="text-slate-400" />
                                <span>+62 812 1901 04 08</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                                <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <span>Menara 165 lt.14 Unit E, Jl. TB Simatupang, Cilandak Timur, Jakarta Selatan</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-xs font-medium">
                        © {new Date().getFullYear()} Global Digital Informasi. {dictionary.footer.rights}
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/auth/login" className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold transition-colors">
                            {dictionary.common.login}
                        </Link>
                        <Link href="/auth/register" className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold transition-colors">
                            {dictionary.common.getStarted}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
