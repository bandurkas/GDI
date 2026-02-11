"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Wallet, Package, Clock, DollarSign, ExternalLink, ArrowUpRight, AlertCircle, CheckCircle, FileText, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatUSD, formatNumberInput, parseFormattedNumber, convertIDRToUSDCents } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface DashboardData {
    exchangeRate: number;
    cashbackPercentage: number;
    wallet: {
        availableBalanceCents: number;
        totalEarnedCents: number;
        pendingBalanceCents: number;
        totalPaidOutCents: number;
    };
    calculatedStats: {
        totalSalesIDR: number;
        pendingPayoutsUSD: number;
        totalPaidUSD: number;
        calculatedAvailableUSD: number;
    };
    payouts: Array<{
        id: string;
        requestedAt: string;
        amountCents: number;
        amountIDRCents?: number;
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
            quantity: number;
            priceCents: number;
        }>;
    }>;
    ordersMeta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
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

    // Payout Form State (USD)
    const [payoutAmountUSD, setPayoutAmountUSD] = useState<string>("");
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

        if (targetOrdersPage === 1 && targetPayoutsPage === 1 && !data) setLoading(true);

        const timestamp = new Date().getTime();
        const res = await fetch(`/api/dashboard?page=${targetOrdersPage}&limit=5&payout_page=${targetPayoutsPage}&payout_limit=5&t=${timestamp}`, {
            cache: 'no-store',
            headers: { 'Pragma': 'no-cache' }
        });
        const json = await res.json();

        // Orders processing
        const orders = json.orders || [];
        if (json.ordersMeta) {
            setTotalPages(json.ordersMeta.totalPages);
            setPage(json.ordersMeta.page);
        }

        if (json.payoutsMeta) {
            setPayoutTotalPages(json.payoutsMeta.totalPages);
            setPayoutPage(json.payoutsMeta.page);
        }

        setData(json);
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
        // Simple number input for USD (allows decimals)
        const val = e.target.value;
        // Validate simpler regex for USD amount (e.g. 10.50)
        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
            setPayoutAmountUSD(val);
        }
        if (payoutError) setPayoutError(null);
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setPayoutLoading(true);
        setPayoutError(null);
        setPayoutSuccess(null);

        const amount = parseFloat(payoutAmountUSD);
        if (isNaN(amount) || amount <= 0) {
            setPayoutError("Please enter a valid amount");
            setPayoutLoading(false);
            return;
        }

        const cents = Math.floor(amount * 100);
        // Min payout $10
        if (cents < 1000) {
            setPayoutError("Minimum withdrawal is $10.00");
            setPayoutLoading(false);
            return;
        }

        // Check available balance (USD Cents)
        if (cents > (data?.wallet.availableBalanceCents || 0)) {
            setPayoutError("Insufficient balance");
            setPayoutLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/payouts/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amountCents: cents }), // Sending USD Cents
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to request payout");
            }

            setPayoutSuccess("Payout requested successfully!");
            setPayoutAmountUSD("");
            fetchDashboard(page);
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

    const rate = data?.exchangeRate || 16000;
    const commPct = data?.cashbackPercentage || 80.0;

    // Use aggregated stats from API for strict accuracy
    const activePayoutsCents = data?.calculatedStats?.pendingPayoutsUSD || 0;

    return (
        <div className="space-y-10 py-8 px-4 sm:px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{dictionary.dashboard.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{dictionary.dashboard.welcome} <span className="font-bold text-indigo-600 dark:text-indigo-400">{session?.user?.email}</span></p>
            </div>

            {/* 1. Summary Section (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Total Sales (IDR Only) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Sales</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                {formatCurrency((data?.calculatedStats?.totalSalesIDR || 0))}
                            </h3>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                            <Package size={20} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Customer payments (IDR)</p>
                </div>

                {/* Card 2: Your Commission (USD Only - Primary) */}
                <div className="bg-indigo-600 rounded-2xl p-6 border border-indigo-500 shadow-xl shadow-indigo-200/50 dark:shadow-none relative overflow-hidden text-white group">
                    <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-white/20 transition-all"></div>

                    <div className="relative">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Available Commission</p>
                            <div className="p-2 bg-white/20 rounded-lg text-white">
                                <DollarSign size={20} />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black tracking-tight mb-1">
                            {formatUSD((data?.calculatedStats?.calculatedAvailableUSD || 0))}
                        </h3>
                        <div className="flex gap-4 mt-4 text-sm font-medium text-indigo-100">
                            <div>
                                <span className="opacity-70 block text-[10px] uppercase">Total Earned</span>
                                {formatUSD(data?.wallet.totalEarnedCents || 0)}
                            </div>
                            <div>
                                <span className="opacity-70 block text-[10px] uppercase">Pending</span>
                                {formatUSD(data?.calculatedStats?.pendingPayoutsUSD || 0)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Payout Overview (USD Only) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Payout Overview</p>
                            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                {formatUSD(data?.calculatedStats?.totalPaidUSD || 0)}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">Total Paid (USD)</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                        <span className="text-slate-500">Processing</span>
                        <span className="font-bold text-amber-500">{formatUSD(data?.calculatedStats?.pendingPayoutsUSD || 0)}</span>
                    </div>
                </div>
            </div>

            {/* 2. Commission Breakdown (USD Only) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-600" />
                        Commission Breakdown (USD)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 text-right">Units Sold</th>
                                <th className="px-6 py-3 text-right">Comm. / Unit (USD)</th>
                                <th className="px-6 py-3 text-right">Total Comm. (USD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data?.orders.flatMap(order =>
                                order.items.map((item, idx) => {
                                    // Calculate Commission for this item
                                    // Item Price (IDR) / Rate -> USD Price
                                    // USD Price * 100 -> USD Cents
                                    // USD Cents * Comm% -> Comm Per Unit (Cents)
                                    // Strict Calc: Total Item Value (IDR) -> USD Cents -> Comm %
                                    const itemTotalIDR = item.priceCents * item.quantity;
                                    const itemTotalUSDCents = convertIDRToUSDCents(itemTotalIDR, rate);
                                    const totalComm = Math.floor(itemTotalUSDCents * (commPct / 100)); // Total for line item
                                    const commPerUnit = totalComm / item.quantity; // Est. per unit


                                    return (
                                        <tr key={`${order.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.productName}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">{formatUSD(commPerUnit)}</td>
                                            <td className="px-6 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{formatUSD(totalComm)}</td>
                                        </tr>
                                    );
                                })
                            )}
                            {(!data?.orders || data.orders.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No sales yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Withdraw (USD) */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <ArrowUpRight className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Withdraw Funds</h3>
                        </div>

                        <form onSubmit={handleRequestPayout} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Amount (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="text"
                                        placeholder="100.00"
                                        value={payoutAmountUSD}
                                        onChange={handlePayoutInput}
                                        className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all tabular-nums"
                                    />
                                </div>
                                <div className="mt-3 text-[10px] text-slate-400 space-y-1">
                                    <p>Available: <span className="font-bold text-slate-700 dark:text-slate-300">{formatUSD(data?.wallet.availableBalanceCents || 0)}</span></p>
                                    <p>Converted to IDR at payout using official exchange rate.</p>
                                    <p className="opacity-70">Current Rate: 1 USD ≈ {formatCurrency(rate * 100).replace("Rp", "Rp ")}</p>
                                </div>
                            </div>

                            {payoutError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{payoutError}</span>
                                </div>
                            )}

                            {payoutSuccess && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-xl flex items-start gap-2">
                                    <CheckCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{payoutSuccess}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={payoutLoading || (data?.wallet.availableBalanceCents || 0) < 1000}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {payoutLoading ? "Processing..." : "Request Payout"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Payout History (USD) & Sales List (IDR) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Payout History (USD) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white">Payout History (USD)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Amount (USD)</th>
                                        <th className="px-6 py-3 whitespace-nowrap">Status</th>
                                        <th className="px-6 py-3 whitespace-nowrap text-right">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data?.payouts.map((payout) => (
                                        <tr key={payout.id}>
                                            <td className="px-6 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                                                {formatUSD(payout.amountCents)}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                    ${payout.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        payout.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                    {payout.status.toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-right">
                                                {payout.receiptUrl && (
                                                    <a href={payout.receiptUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 text-xs font-medium inline-flex items-center gap-1">
                                                        View <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!data?.payouts || data.payouts.length === 0) && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No payout history</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination for Payouts */}
                        {payoutTotalPages > 1 && (
                            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2">
                                <button
                                    onClick={() => handlePayoutPageChange(payoutPage - 1)}
                                    disabled={payoutPage === 1}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-medium py-1">Page {payoutPage} of {payoutTotalPages}</span>
                                <button
                                    onClick={() => handlePayoutPageChange(payoutPage + 1)}
                                    disabled={payoutPage === payoutTotalPages}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Purchased Services (IDR Only) */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Package size={18} className="text-slate-400" />
                                {dictionary.dashboard.purchasedServices}
                            </h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Product / Order ID</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Paid (IDR)</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {data?.orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {order.items.map(i => i.productName).join(", ")}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">#{order.id.slice(-8)}</div>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-slate-900 dark:text-white tabular-nums">
                                            {formatCurrency(order.totalCents)} {/* IDR Cents */}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    order.status === 'FAILED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {order.status.toLowerCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!data?.orders || data.orders.length === 0) && (
                                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No orders found</td></tr>
                                )}
                            </tbody>
                        </table>
                        {/* Pagination for Orders */}
                        {totalPages > 1 && (
                            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-medium py-1">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
