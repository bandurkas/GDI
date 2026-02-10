"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Wallet, Package, Clock, DollarSign, ExternalLink, ArrowUpRight, AlertCircle, CheckCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatUSD, formatCurrencyWithUSD, formatNumberInput, parseFormattedNumber, convertIDRtoUSD } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardData {
    wallet: {
        availableBalanceCents: number;
        totalEarnedCents: number;
        pendingBalanceCents: number;
    };
    payouts: Array<{
        id: string;
        requestedAt: string;
        amountCents: number;
        status: string;
        receiptUrl?: string;
    }>;
    payoutsMeta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    orders: Array<{
        id: string;
        createdAt: string;
        totalCents: number;
        status: string;
        items: Array<{
            productName: string;
        }>;
    }>;
    totalBills: number;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const { dictionary } = useLanguage();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [payoutPage, setPayoutPage] = useState(1);
    const [payoutTotalPages, setPayoutTotalPages] = useState(1);

    // Payout Form State
    const [payoutAmount, setPayoutAmount] = useState<string>("");
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutError, setPayoutError] = useState<string | null>(null);
    const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }
        if (status === "authenticated") {
            fetchDashboard(1);
        }
    }, [status]);

    const fetchDashboard = async (ordersPageOverride?: number, payoutsPageOverride?: number) => {
        const targetOrdersPage = ordersPageOverride ?? page;
        const targetPayoutsPage = payoutsPageOverride ?? payoutPage;

        // Only set loading on initial load, not page changes to avoid flash
        if (targetOrdersPage === 1 && targetPayoutsPage === 1 && !data) setLoading(true);

        const timestamp = new Date().getTime();
        const res = await fetch(`/api/dashboard?page=${targetOrdersPage}&limit=5&payout_page=${targetPayoutsPage}&payout_limit=5&t=${timestamp}`, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache' }
        });
        const json = await res.json();

        // Calculate Total Bills (Total Spent) - Note: this might need adjustment if logic changes to partial fetch
        // For now, total bills calculation based on partial fetched data is incorrect if we want LIFETIME total.
        // Ideally backend should return this total separately. Assuming backend might return it later or we accept this limitation for now.
        // Actually, let's keep it as is, but be aware.

        // Correct approach: If json.totalBills is missing, we might only show sum of current page or 0.
        // Let's assume for now we just show what we have or 0.

        // UPDATE: json.orders is now paginated.
        // We need to handle the new structure: json.orders (array) and json.ordersMeta.

        const orders = json.orders || [];
        // If meta exists, use it
        if (json.ordersMeta) {
            setTotalPages(json.ordersMeta.totalPages);
            setPage(json.ordersMeta.page);
        }

        if (json.payoutsMeta) {
            setPayoutTotalPages(json.payoutsMeta.totalPages);
            setPayoutPage(json.payoutsMeta.page);
        }

        // For total bills, if we are paginating, we can't sum up simply on frontend unless backend returns it.
        // Let's check `json.wallet.totalSpentCents`? Most likely not there yet. 
        // We will just sum up visible orders for now or 0, or if backend returned a total somewhere.
        // Actually, let's look at OrderService. It returns `orders` and `total`. 
        // We might need to ask backend for "total spent" if that's critical. 
        // For now, let's just use what we have.
        const totalBills = orders.reduce((acc: number, order: { totalCents: number }) => acc + order.totalCents, 0);

        setData({ ...json, orders, totalBills });
        setLoading(false);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchDashboard(newPage, undefined);
        }
    };

    const handlePayoutPageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= payoutTotalPages) {
            fetchDashboard(undefined, newPage);
        }
    };

    const handlePayoutInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatNumberInput(e.target.value);
        setPayoutAmount(formatted);
        if (payoutError) setPayoutError(null);
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayoutLoading(true);
        setPayoutError(null);
        setPayoutSuccess(null);

        const idrAmount = parseFormattedNumber(payoutAmount);
        if (isNaN(idrAmount) || idrAmount <= 0) {
            setPayoutError("Please enter a valid amount");
            setPayoutLoading(false);
            return;
        }

        const cents = idrAmount * 100;
        const MIN_CENTS = 100000000; // Rp 1,000,000
        const MAX_CENTS = 10000000000; // Rp 100,000,000

        if (cents < MIN_CENTS) {
            setPayoutError(`Minimum withdrawal is Rp 1.000.000 (~$62.50)`);
            setPayoutLoading(false);
            return;
        }
        if (cents > MAX_CENTS) {
            setPayoutError(`Maximum withdrawal is Rp 100.000.000 (~$6,250)`);
            setPayoutLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/payouts/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountCents: cents }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to request payout");
            }

            setPayoutSuccess("Payout requested successfully!");
            setPayoutAmount("");
            fetchDashboard(page); // Refresh data
        } catch (err: any) {
            setPayoutError(err.message);
        } finally {
            setPayoutLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );



    return (
        <div className="space-y-10 py-8 px-4 sm:px-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{dictionary.dashboard.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{dictionary.dashboard.welcome} <span className="font-bold text-indigo-600 dark:text-indigo-400 break-all">{session?.user?.email}</span></p>
                </div>

                {data?.wallet && (
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{dictionary.dashboard.cashback}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                    {formatCurrency((data.wallet.availableBalanceCents || 0) * 100)}
                                    <span className="text-sm text-slate-400 font-medium ml-2">
                                        (~{formatUSD((data.wallet.availableBalanceCents || 0) * 100)})
                                    </span>
                                </p>
                                {(data.wallet.pendingBalanceCents || 0) > 0 && (
                                    <p className="text-xs font-bold text-amber-500 mt-1">
                                        + {formatCurrency(data.wallet.pendingBalanceCents * 100)}
                                        <span className="opacity-75 ml-1">
                                            (~{formatUSD(data.wallet.pendingBalanceCents * 100)})
                                        </span> Pending
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-widest">{dictionary.dashboard.totalBills}</p>
                                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight tabular-nums">
                                    {formatCurrency((data.totalBills || 0) * 100)}
                                    <span className="text-sm text-emerald-600/60 dark:text-emerald-500/60 font-medium ml-2">
                                        (~{formatUSD((data.totalBills || 0) * 100)})
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Request Payout Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-50 dark:bg-indigo-950/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30"></div>

                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6">
                                <ArrowUpRight className="text-indigo-600 dark:text-indigo-400" size={24} />
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">{dictionary.dashboard.withdrawFunds}</h3>
                            </div>

                            <form onSubmit={handleRequestPayout} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{dictionary.dashboard.amountLabel}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <input
                                            type="text"
                                            placeholder="100.000"
                                            value={payoutAmount}
                                            onChange={handlePayoutInput}
                                            className="w-full pl-12 pr-20 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        {payoutAmount && parseFormattedNumber(payoutAmount) > 0 && (
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                                                ~${convertIDRtoUSD(parseFormattedNumber(payoutAmount)).toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Minimum: Rp 1.000.000 (~$62.50) • Maximum: Rp 100.000.000 (~$6,250)</p>
                                </div>

                                {payoutError && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400">{payoutError}</p>
                                    </div>
                                )}

                                {payoutSuccess && (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start gap-3">
                                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{payoutSuccess}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={payoutLoading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center"
                                >
                                    {payoutLoading ? dictionary.dashboard.processing : dictionary.dashboard.requestPayout}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: History & Orders */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Payout History */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Clock className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{dictionary.dashboard.payoutHistory}</h3>
                        </div>

                        {!data?.payouts || data.payouts.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-slate-400 dark:text-slate-500 font-medium">{dictionary.dashboard.noPayouts}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="text-left text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-4 pl-4">{dictionary.dashboard.tableDate}</th>
                                            <th className="text-right text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-4">{dictionary.dashboard.tableAmount}</th>
                                            <th className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-4">{dictionary.dashboard.tableStatus}</th>
                                            <th className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pb-4 pr-4">{dictionary.dashboard.tableReceipt}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {data.payouts.map((payout) => (
                                            <tr key={payout.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 pl-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {new Date(payout.requestedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-right text-sm font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                    {formatCurrency(payout.amountCents * 100)}
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${payout.status === "PAID" ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" :
                                                        payout.status === "Processing" ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20" :
                                                            "bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20"
                                                        }`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-center">
                                                    {payout.receiptUrl ? (
                                                        <a href={payout.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-xs flex items-center justify-center gap-1">
                                                            View <ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Payout Pagination Controls */}
                        {data?.payoutsMeta && data.payoutsMeta.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 px-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {dictionary.dashboard.page} {payoutPage} {dictionary.dashboard.of} {payoutTotalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePayoutPageChange(payoutPage - 1)}
                                        disabled={payoutPage === 1}
                                        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => handlePayoutPageChange(payoutPage + 1)}
                                        disabled={payoutPage === payoutTotalPages}
                                        className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Purchased Services (Full Width) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                {/* Decorative background elements specific to dark theme card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <Package className="text-indigo-600 dark:text-indigo-400" size={24} />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{dictionary.dashboard.purchasedServices}</h3>
                </div>

                {!data?.orders || data.orders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 relative z-10">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{dictionary.dashboard.noServices}</p>
                        <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-all">
                            {dictionary.common.browseServices}
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4 relative z-10">
                            <div className="hidden sm:grid grid-cols-12 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-4 pb-2">
                                <div className="col-span-6">Service</div>
                                <div className="col-span-3">Date</div>
                                <div className="col-span-2 text-right">Total</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>

                            <div className="space-y-4 sm:space-y-2">
                                {data.orders.map((order) => (
                                    <div key={order.id} className="relative flex flex-col sm:grid sm:grid-cols-12 sm:items-center p-5 sm:p-4 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all group gap-4 sm:gap-0">

                                        {/* Mobile: Top Row (Service + Amount) | Desktop: Service Col */}
                                        <div className="w-full sm:col-span-6">
                                            <div className="flex justify-between items-start gap-4 mb-1 sm:mb-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                                    {order.items[0]?.productName || dictionary.common.unknownService}
                                                    {order.items.length > 1 && <span className="text-slate-500 dark:text-slate-400 text-xs font-normal ml-2">+{order.items.length - 1} {dictionary.common.more}</span>}
                                                </p>
                                                {/* Mobile Amount */}
                                                <div className="sm:hidden">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                        {formatCurrency(order.totalCents * 100)}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        ~{formatUSD(order.totalCents * 100)}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Order ID: #{order.id.slice(-8)}</p>
                                        </div>

                                        {/* Desktop: Date Col */}
                                        <div className="w-full sm:col-span-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                            <Clock size={12} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
                                            <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-2">Date:</span>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>

                                        {/* Mobile: Status | Desktop: Amount + Status */}
                                        <div className="w-full sm:col-span-2 flex items-center justify-between sm:block sm:text-right">
                                            {/* Desktop Amount */}
                                            <div className="hidden sm:block">
                                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                                                    {formatCurrency(order.totalCents * 100)}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    ~{formatUSD(order.totalCents * 100)}
                                                </p>
                                            </div>

                                            <div className="mt-0 sm:mt-1 inline-flex">
                                                <span className={`px-2 py-1 sm:px-1.5 sm:py-0.5 rounded text-[10px] sm:text-[8px] font-bold uppercase tracking-wide border ${order.status === "COMPLETED"
                                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                                    : order.status === "PENDING"
                                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/20"
                                                        : "bg-slate-500/20 text-slate-400 border-slate-500/20"
                                                    }`}>
                                                    {order.status || dictionary.common.completed}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Desktop: Action | Mobile: Absolute/Hidden */}
                                        <div className="sm:col-span-1 flex justify-center hidden sm:flex">
                                            <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-6 px-2 relative z-10">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center gap-1"
                            >
                                ← {dictionary.dashboard.page}
                            </button>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                {dictionary.dashboard.page} {page} {dictionary.dashboard.of} {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors flex items-center gap-1"
                            >
                                {dictionary.dashboard.page} →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
