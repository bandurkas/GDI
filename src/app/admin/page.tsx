"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, ClipboardList, Landmark, Shield, Search, ArrowUpDown, DollarSign, CreditCard, CheckCircle, XCircle, FileText, ChevronDown, Edit, ArrowUpRight, CheckCircle2, ShoppingCart, MoreHorizontal, ExternalLink, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface AdminPayout {
    id: string;
    amountCents: number;
    status: string;
    requestedAt: string;
    receiptUrl?: string;
    notes?: string;
    user: {
        id: string;
        email: string;
    };
    dayOrdersSum?: number;
}

interface AdminUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    cashbackPercentage: number;
    totalSpentCents: number;
    totalEarnedCents: number;
    availableBalanceCents: number;
}

// --- StatusUpdateModal Component ---
function StatusUpdateModal({ isOpen, onClose, payout, onUpdate }: { isOpen: boolean, onClose: () => void, payout: AdminPayout | null, onUpdate: (id: string, status: string, comment: string, receipt?: string) => void }) {
    const { dictionary } = useLanguage();
    const [status, setStatus] = useState(payout?.status || "REQUESTED");
    const [comment, setComment] = useState("");
    const [receipt, setReceipt] = useState("");

    useEffect(() => {
        if (payout) {
            setStatus(payout.status);
            setComment("");
            setReceipt(payout.receiptUrl || "");
        }
    }, [payout]);

    if (!isOpen || !payout) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(payout.id, status, comment, receipt);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl shadow-slate-900/20 border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{dictionary.admin.updateStatus}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><XCircle size={20} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{dictionary.admin.payoutId}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">#{payout.id.slice(-6)}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 block">{dictionary.admin.amount}</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(payout.amountCents * 100)}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{dictionary.admin.newStatus}</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                >
                                    <option value="REQUESTED">REQUESTED</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="PAID">PAID</option>
                                    <option value="REFUSED">REFUSED</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {status === "PAID" && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{dictionary.admin.receiptUrl}</label>
                                <div className="relative">
                                    <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://example.com/receipt.pdf"
                                        value={receipt}
                                        onChange={(e) => setReceipt(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">{dictionary.admin.comment} <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                placeholder={dictionary.admin.comment}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-6 border-t border-slate-50 dark:border-slate-800 mt-6">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-xl text-sm transition-all shadow-sm hover:shadow">{dictionary.common.cancel}</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 text-sm transition-all flex items-center gap-2">
                                <CheckCircle size={18} />
                                {dictionary.admin.update}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// --- UserUpdateModal Component ---
function UserUpdateModal({ isOpen, onClose, user, onUpdate }: { isOpen: boolean, onClose: () => void, user: AdminUser | null, onUpdate: (id: string, percentage: number) => void }) {
    const { dictionary } = useLanguage();
    const [percentage, setPercentage] = useState(user?.cashbackPercentage || 80);

    useEffect(() => {
        if (user) {
            setPercentage(user.cashbackPercentage ?? 80);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(user.id, percentage);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{dictionary.admin.edit}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XCircle size={18} /></button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">{dictionary.admin.userEmail}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{dictionary.admin.cashbackPercent}</label>
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.5"
                                value={percentage}
                                onChange={(e) => setPercentage(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-4 italic">Default is 80% if not set.</p>
                        </div>

                        <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 dark:border-slate-800 mt-8">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm transition-all shadow-sm">{dictionary.common.cancel}</button>
                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm shadow-lg shadow-indigo-500/20 transition-all">{dictionary.admin.set}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { dictionary } = useLanguage();
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<"users" | "payouts" | "orders" | "leads">("orders");
    const [data, setData] = useState<any[]>([]);
    const [dailyStats, setDailyStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);

    // User Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // Dropdown State
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const router = useRouter();



    // Initial Data Load
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }
        if (status === "authenticated") {
            if (session?.user?.role !== "ADMIN") {
                router.push("/dashboard");
                return;
            }
            fetchDailyStats();
            fetchData(activeTab, 1);
        }
    }, [status, session]);

    // Tab Change Data Load
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "ADMIN") {
            setPage(1); // Reset page on tab change
            fetchData(activeTab, 1);
        }
    }, [activeTab]);

    const fetchDailyStats = async () => {
        try {
            const res = await fetch(`/api/admin/financial?stats=daily&t=${new Date().getTime()}`);
            const json = await res.json();
            setDailyStats(json);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async (type: string, pageNum: number) => {
        setLoading(true);
        try {
            let endpoint = `/api/admin?type=${type}&page=${pageNum}&limit=10`;
            if (type === "payouts") {
                endpoint = `/api/admin/payouts?page=${pageNum}&limit=10`;
            }

            // Add timestamp to prevent caching
            const nocache = `&t=${new Date().getTime()}`;
            const finalEndpoint = `${endpoint}${nocache}`;


            const res = await fetch(finalEndpoint, {
                cache: 'no-store',
                headers: { 'Pragma': 'no-cache' }
            });
            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setData(json.data);
                setTotalPages(json.meta?.totalPages || 1);
                setPage(pageNum);
            } else if (Array.isArray(json)) {
                // Fallback for endpoints not yet paginated (if any)
                setData(json);
                setTotalPages(1);
            } else {
                setData([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchData(activeTab, newPage);
        }
    };

    const handleOrderAction = async (id: string, action: "confirm" | "cancel") => {
        if (action === "confirm" && !window.confirm(dictionary.admin.confirmPaymentPrompt)) return;
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed");
            toast.success(action === "confirm" ? dictionary.admin.paymentConfirmed : dictionary.admin.orderCancelled);
            setOpenMenuId(null);
            fetchData(activeTab, page);
            fetchDailyStats();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleLeadStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
            if (!res.ok) throw new Error("Failed");
            toast.success(dictionary.admin.leadStatusUpdated);
            fetchData(activeTab, page);
        } catch (e: any) { toast.error(e.message); }
    };

    const openUpdateModal = (payout: AdminPayout) => {
        setSelectedPayout(payout);
        setIsModalOpen(true);
    };

    const openUserModal = (user: AdminUser) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleUpdate = async (id: string, newStatus: string, comment: string, receipt?: string) => {
        if (!comment) {
            toast.error("Comment is mandatory");
            return;
        }

        try {
            const res = await fetch(`/api/admin/payouts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, comment, receiptUrl: receipt }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to update");
            }

            toast.success("Status updated successfully!");
            setIsModalOpen(false);
            toast.success("Status updated successfully!");
            setIsModalOpen(false);
            fetchData("payouts", page); // Refresh current page
            fetchDailyStats(); // Refresh stats too
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleUserUpdate = async (id: string, percentage: number) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cashbackPercentage: percentage }),
            });

            const json = await res.json();

            if (!res.ok) {
                throw new Error(json.error || "Failed to update user");
            }

            toast.success("User updated successfully!");
            setIsUserModalOpen(false);
            fetchData("users", page); // Refresh current page
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (status === "loading") return null; // Simple loading state for auth check

    if (loading && data.length === 0 && !isModalOpen && !isUserModalOpen) return (
        <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
            <Toaster position="top-center" richColors />
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="text-indigo-600 dark:text-indigo-500" size={32} />
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{dictionary.admin.title}</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Overview of financial performance and platform management.</p>
                </div>

                {/* Always Visible Financial Stats */}
                {dailyStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{dictionary.admin.statsToday}</p>
                                <ShoppingCart size={16} className="text-indigo-500/70 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dailyStats.todayOrdersCount}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">{dictionary.admin.amount}: {formatCurrency((dailyStats.todayOrdersSum || 0) * 100)}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Total Users</p>
                                <Users size={16} className="text-blue-500/70 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dailyStats.totalCustomers}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-purple-100 dark:hover:border-purple-900/50 group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">New Users</p>
                                <UserPlus size={16} className="text-purple-500/70 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dailyStats.newCustomersToday}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Joined Today</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-amber-100 dark:hover:border-amber-900/50 group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Active Buyers</p>
                                <CreditCard size={16} className="text-amber-500/70 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{dailyStats.activeCustomersCount}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Ever purchased</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-900/50 group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Processed</p>
                                <CheckCircle2 size={16} className="text-emerald-500/70 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{formatCurrency((dailyStats.todayCashbackPaid || 0) * 100)}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">Paid Today</p>
                        </div>
                    </div>
                )}

                {/* Section Separator Title */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`
                            group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm transition-all
                            ${activeTab === "orders"
                                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"}
                        `}
                        >
                            <ShoppingCart size={18} className="mr-2" />
                            {dictionary.admin.orders}
                        </button>

                        <button
                            onClick={() => setActiveTab("leads")}
                            className={`
                            group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm transition-all
                            ${activeTab === "leads"
                                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"}
                        `}
                        >
                            <Landmark size={18} className="mr-2" />
                            {dictionary.admin.leads}
                        </button>

                        <button
                            onClick={() => setActiveTab("payouts")}
                            className={`
                            group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm transition-all
                            ${activeTab === "payouts"
                                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"}
                        `}
                        >
                            <ArrowUpRight size={18} className="mr-2" />
                            {dictionary.admin.payouts}
                        </button>

                        <button
                            onClick={() => setActiveTab("users")}
                            className={`
                            group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm transition-all
                            ${activeTab === "users"
                                    ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"}
                        `}
                        >
                            <Users size={18} className="mr-2" />
                            {dictionary.admin.users}
                        </button>
                    </nav>
                </div>
                {/* Content */}
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    {activeTab === "payouts" ? (
                                        <>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.userEmail}</th>
                                            <th className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.statsToday}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.amount}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dictionary.admin.status}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.requested}</th>
                                            <th className="hidden xl:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.comment}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-12"></th>
                                        </>
                                    ) : activeTab === "leads" ? (
                                        <>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.lead}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.userEmail}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.estimate}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dictionary.admin.status}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.requested}</th>
                                            <th className="hidden xl:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.comment}</th>
                                        </>
                                    ) : activeTab === "orders" ? (
                                        <>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.order}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.userEmail}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.amount}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.method}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dictionary.admin.status}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.requested}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-12"></th>
                                        </>
                                    ) : activeTab === "users" ? (
                                        <>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.allUsers}</th>
                                            <th className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.role}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.cashbackPercent}</th>
                                            <th className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.totalSpent}</th>
                                            <th className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Earned</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.availableBalance}</th>
                                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-12"></th>
                                        </>
                                    ) : null}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">{dictionary.common.loading}</td>
                                    </tr>
                                ) : data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">{activeTab === "orders" ? dictionary.admin.noOrders : activeTab === "leads" ? dictionary.admin.noLeads : dictionary.admin.noPayouts}</td>
                                    </tr>
                                ) : (
                                    data.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {activeTab === "payouts" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[200px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={item.user?.email}>{item.user?.email}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {item.user?.id?.substring(0, 8)}...</div>
                                                    </td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                        {formatCurrency((item.dayOrdersSum || 0) * 100)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency(item.amountCents * 100)}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                            item.status === 'REQUESTED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                                item.status === 'PROCESSING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                                    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                        {new Date(item.requestedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="hidden xl:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={item.notes}>
                                                        {item.notes || "-"}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="relative inline-block text-left">
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                            >
                                                                <MoreHorizontal size={18} />
                                                            </button>

                                                            {openMenuId === item.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                                                        {item.receiptUrl && (
                                                                            <a
                                                                                href={item.receiptUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={() => setOpenMenuId(null)}
                                                                                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700"
                                                                            >
                                                                                <ExternalLink size={16} />
                                                                                View Receipt
                                                                            </a>
                                                                        )}
                                                                        <button
                                                                            onClick={() => { setSelectedPayout(item); setIsModalOpen(true); setOpenMenuId(null); }}
                                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <Edit size={16} />
                                                                            Update Status
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : activeTab === "leads" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[260px]">
                                                        <div className="font-bold text-slate-900 dark:text-white truncate">{item.serverType} × {item.quantity}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {item.totalRackU}U · {item.totalPowerKw >= 1000 ? `${(item.totalPowerKw / 1000).toFixed(2)} MW` : `${item.totalPowerKw} kW`} · {item.estimatedRackCount} racks
                                                            {item.enterpriseTier && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">{String(item.enterpriseTier).replace("-", " ")}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 max-w-[220px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={item.email}>{item.name} · {item.company}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate"><a href={`mailto:${item.email}`} className="hover:text-indigo-600">{item.email}</a> · <a href={`https://wa.me/${String(item.phone).replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600">{item.phone}</a></div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-right text-sm text-slate-900 dark:text-white tabular-nums">
                                                        <div className="font-bold">{formatCurrency(item.monthlyEstimateIdr * 100)}<span className="text-xs text-slate-400"> /mo</span></div>
                                                        <div className="text-xs text-slate-500">{item.contractTerm} mo · {item.serviceLevel} · {item.selectedBandwidth}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <select value={item.status} onChange={(e) => handleLeadStatus(item.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs font-bold border-0 focus:ring-2 focus:ring-indigo-500/30 ${item.status === "WON" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : item.status === "LOST" ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" : item.status === "NEW" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                                                            {["NEW", "CONTACTED", "QUOTED", "WON", "LOST"].map((st) => <option key={st} value={st}>{st}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</td>
                                                    <td className="hidden xl:table-cell px-4 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                                        <div className="truncate" title={[item.notes, item.deploymentDate && `Deploy: ${item.deploymentDate}`, item.currentLocation && `From: ${item.currentLocation}`, item.gpuFabric && `Fabric: ${item.gpuFabric}`, item.siteMode && `Site: ${item.siteMode}`, item.technical && `Tech: ${JSON.stringify(item.technical)}`].filter(Boolean).join(" | ")}>
                                                            {[item.notes, item.deploymentDate && `Deploy: ${item.deploymentDate}`, item.currentLocation && `From: ${item.currentLocation}`].filter(Boolean).join(" | ") || "-"}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : activeTab === "orders" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[240px]">
                                                        <div className="font-bold text-slate-900 dark:text-white">GDI-{item.id.slice(-8).toUpperCase()}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate" title={item.items?.map((i: any) => i.productName).join(", ")}>
                                                            {item.items?.[0]?.productName}{item.items?.length > 1 && ` +${item.items.length - 1}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 max-w-[200px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={item.user?.email}>{item.user?.email}</div>
                                                        {item.user?.name && <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.user.name}</div>}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white tabular-nums">{formatCurrency(item.totalCents * 100)}</td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{String(item.paymentMethod).replace("_", " ")}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                            item.status === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                                'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        {item.status === "PENDING" && (
                                                            <div className="relative inline-block text-left">
                                                                <button
                                                                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                                >
                                                                    <MoreHorizontal size={18} />
                                                                </button>

                                                                {openMenuId === item.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-2 origin-top-right overflow-hidden">
                                                                            <button
                                                                                onClick={() => handleOrderAction(item.id, "confirm")}
                                                                                className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-2 transition-colors border-b border-slate-50 dark:border-slate-700"
                                                                            >
                                                                                <CheckCircle2 size={16} />
                                                                                {dictionary.admin.confirmPayment}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleOrderAction(item.id, "cancel")}
                                                                                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                                                                            >
                                                                                <XCircle size={16} />
                                                                                {dictionary.admin.cancelOrder}
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </>
                                            ) : activeTab === "users" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[200px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={item.email}>{item.email}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{dictionary.admin.joined}: {new Date(item.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{item.role}</td>
                                                    <td className="px-4 py-4 text-right font-medium text-indigo-600 dark:text-indigo-400">{item.cashbackPercentage}%</td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency(item.totalSpentCents * 100)}</td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency(item.totalEarnedCents * 100)}</td>
                                                    <td className="px-4 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(item.availableBalanceCents * 100)}</td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="relative inline-block text-left">
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                            >
                                                                <MoreHorizontal size={18} />
                                                            </button>

                                                            {openMenuId === item.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                                        <button
                                                                            onClick={() => { setSelectedUser(item); setIsUserModalOpen(true); setOpenMenuId(null); }}
                                                                            className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 transition-colors"
                                                                        >
                                                                            <Edit size={16} />
                                                                            Edit User
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : null}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing page <span className="font-bold text-slate-900 dark:text-white">{page}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <StatusUpdateModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    payout={selectedPayout}
                    onUpdate={handleUpdate}
                />

                <UserUpdateModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    user={selectedUser}
                    onUpdate={handleUserUpdate}
                />
            </div>
        </div>
    );
}
