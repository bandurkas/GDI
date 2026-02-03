"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ContactSalesPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        // Simulate sending email (you can implement actual email sending later)
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            toast.success("Message sent! We'll get back to you soon.");

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({ name: "", email: "", subject: "", message: "" });
                setSubmitted(false);
            }, 3000);
        }, 1000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4">
                        Contact Sales
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Can't find what you're looking for? Get in touch with our team for pricing, services, and custom solutions.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                                Support
                            </h2>

                            {/* Phone/WhatsApp */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                        <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                            Phone / WhatsApp
                                        </h3>
                                        <a
                                            href="https://wa.me/6281219010408"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center gap-2"
                                        >
                                            <MessageCircle size={16} />
                                            +62 812 1901 04 08
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                        <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                            Pre-sales Questions
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                            For pricing, services, and custom solutions
                                        </p>
                                        <a
                                            href="mailto:info@gdiconsult.online"
                                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                        >
                                            info@gdiconsult.online
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                        <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                                            Our Address
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Menara 165, 14th Floor, Unit E<br />
                                            Jl. TB Simatupang, Cilandak Timur<br />
                                            Jakarta Selatan, Indonesia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                Get in Touch
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                Please fill out the form below and we'll get back to you shortly.
                            </p>

                            {submitted ? (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        Message Sent!
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        We'll get back to you as soon as possible.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            Comment or Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all resize-none"
                                            placeholder="Tell us more about your needs..."
                                            required
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Back to Home */}
                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
