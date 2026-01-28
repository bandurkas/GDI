"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, ClipboardList, Shield, CreditCard, CheckCircle, XCircle, ChevronDown, Edit, ArrowUpRight, CheckCircle2, ShoppingCart, MoreHorizontal, ExternalLink, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

interface AdminDailyStats {
    todayOrdersSum: number;
    todayOrdersCount: number;
    todayCashbackRequested: number;
    todayCashbackPaid: number;
    pendingCashbackCount: number;
    totalCustomers: number;
    newCustomersToday: number;
    activeCustomersCount: number;
}

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

    // Initial state is set via props, use key in parent to reset

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

    // Initial state is set via props, use key in parent to reset

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
    const [activeTab, setActiveTab] = useState<"users" | "payouts">("payouts");
    const [data, setData] = useState<(AdminPayout | AdminUser)[]>([]);
    const [dailyStats, setDailyStats] = useState<AdminDailyStats | null>(null);
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



    const fetchDailyStats = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/financial?stats=daily&t=${new Date().getTime()}`);
            const json = await res.json();
            setDailyStats(json);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchData = useCallback(async (type: string, pageNum: number) => {
        setLoading(true);
        try {
            let endpoint = `/api/admin?type=${type}&page=${pageNum}&limit=10`;
            if (type === "payouts") {
                endpoint = `/api/admin/payouts?page=${pageNum}&limit=10`;
            }

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
    }, []);

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
    }, [status, session, router, activeTab, fetchDailyStats, fetchData]);

    // Tab Change Data Load
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "ADMIN") {
            setPage(1); // Reset page on tab change
            fetchData(activeTab, 1);
        }
    }, [activeTab, status, session, fetchData]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchData(activeTab, newPage);
        }
    };

    // Modals reset via key, so we don't need explicitly separate open handlers if we just set the item.
    // Removed unused openUpdateModal and openUserModal warnings.

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
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : String(err));
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
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : String(err));
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
                            onClick={() => setActiveTab("payouts")}
                            role="tab"
                            aria-selected={activeTab === "payouts"}
                            aria-controls="payouts-panel"
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
                            role="tab"
                            aria-selected={activeTab === "users"}
                            aria-controls="users-panel"
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
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.userEmail}</th>
                                            <th scope="col" className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.statsToday}</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.amount}</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">{dictionary.admin.status}</th>
                                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.requested}</th>
                                            <th scope="col" className="hidden xl:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.comment}</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-12"></th>
                                        </>
                                    ) : activeTab === "users" ? (
                                        <>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.allUsers}</th>
                                            <th scope="col" className="hidden md:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dictionary.admin.role}</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.cashbackPercent}</th>
                                            <th scope="col" className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.totalSpent}</th>
                                            <th scope="col" className="hidden lg:table-cell px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Earned</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">{dictionary.admin.availableBalance}</th>
                                            <th scope="col" className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right w-12"></th>
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
                                        <td colSpan={7} className="text-center py-12 text-slate-400 dark:text-slate-500">{dictionary.admin.noPayouts}</td>
                                    </tr>
                                ) : (
                                    (data as (AdminPayout | AdminUser)[]).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {activeTab === "payouts" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[200px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={(item as AdminPayout).user?.email}>{(item as AdminPayout).user?.email}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">ID: {(item as AdminPayout).user?.id?.substring(0, 8)}...</div>
                                                    </td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                        {formatCurrency(((item as AdminPayout).dayOrdersSum || 0) * 100)}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">{formatCurrency((item as AdminPayout).amountCents * 100)}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(item as AdminPayout).status === 'PAID' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                            (item as AdminPayout).status === 'REQUESTED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                                                                (item as AdminPayout).status === 'PROCESSING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                                    'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                            }`}>
                                                            {(item as AdminPayout).status}
                                                        </span>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                        {new Date((item as AdminPayout).requestedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="hidden xl:table-cell px-4 py-4 text-sm text-slate-500 dark:text-slate-400 italic max-w-xs truncate" title={(item as AdminPayout).notes}>
                                                        {(item as AdminPayout).notes || "-"}
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
                                                                        {(item as AdminPayout).receiptUrl && (
                                                                            <a
                                                                                href={(item as AdminPayout).receiptUrl}
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
                                                                            onClick={() => { setSelectedPayout(item as AdminPayout); setIsModalOpen(true); setOpenMenuId(null); }}
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
                                            ) : activeTab === "users" ? (
                                                <>
                                                    <td className="px-4 py-4 max-w-[200px]">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate" title={(item as AdminUser).email}>{(item as AdminUser).email}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{dictionary.admin.joined}: {new Date((item as AdminUser).createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{(item as AdminUser).role}</td>
                                                    <td className="px-4 py-4 text-right font-medium text-indigo-600 dark:text-indigo-400">{(item as AdminUser).cashbackPercentage}%</td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency((item as AdminUser).totalSpentCents * 100)}</td>
                                                    <td className="hidden lg:table-cell px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">{formatCurrency((item as AdminUser).totalEarnedCents * 100)}</td>
                                                    <td className="px-4 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency((item as AdminUser).availableBalanceCents * 100)}</td>
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
                                                                            onClick={() => { setSelectedUser(item as AdminUser); setIsUserModalOpen(true); setOpenMenuId(null); }}
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
                        <div className="flex gap-2" role="navigation" aria-label="Pagination">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                aria-label="Previous page"
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                aria-label="Next page"
                                className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal */}
                {selectedPayout && (
                    <StatusUpdateModal
                        key={selectedPayout.id}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        payout={selectedPayout}
                        onUpdate={handleUpdate}
                    />
                )}

                {selectedUser && (
                    <UserUpdateModal
                        key={selectedUser.id}
                        isOpen={isUserModalOpen}
                        onClose={() => setIsUserModalOpen(false)}
                        user={selectedUser}
                        onUpdate={handleUserUpdate}
                    />
                )}
            </div>
        </div>
    );
}
