"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Shield, Search, Plus, MoreHorizontal, Edit, Trash2, Key, XCircle, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ManagedUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    totalSpentCents: number;
    totalEarnedCents: number;
    availableBalanceCents: number;
}

// --- Modals ---

function CreateUserModal({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (data: any) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("USER");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ email, password, role });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Create New User</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"><XCircle size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Initial Password</label>
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">User Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                            <Plus size={18} /> Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PwdResetModal({ isOpen, onClose, user, onReset }: { isOpen: boolean, onClose: () => void, user: ManagedUser | null, onReset: (id: string, pwd: string) => void }) {
    const [password, setPassword] = useState("");

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onReset(user.id, password);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Reset Password</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"><XCircle size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Resetting password for <span className="font-bold text-slate-900 dark:text-white">{user.email}</span></p>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium" placeholder="Minimum 6 characters" />
                    </div>
                    <div className="flex gap-3 justify-end pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20">
                            <Key size={18} /> Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RoleChangeModal({ isOpen, onClose, user, onRoleChange }: { isOpen: boolean, onClose: () => void, user: ManagedUser | null, onRoleChange: (id: string, role: string) => void }) {
    const [role, setRole] = useState(user?.role || "USER");

    if (!isOpen || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRoleChange(user.id, role);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Change User Role</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full"><XCircle size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-slate-500">Changing role for <span className="font-bold text-slate-900 dark:text-white">{user.email}</span></p>

                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-2">⚠️ Current Role</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{user.role}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">New Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold">
                            <option value="USER">USER - Regular customer access</option>
                            <option value="ADMIN">ADMIN - Admin panel access</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN - Full system control</option>
                        </select>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4">
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Role Permissions:</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <li>• <strong>USER:</strong> Can shop and earn commissions</li>
                            <li>• <strong>ADMIN:</strong> + Manage payouts & view reports</li>
                            <li>• <strong>SUPER_ADMIN:</strong> + Manage all users & roles</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 justify-end pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                            <Shield size={18} /> Update Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Main Page ---

export default function SuperAdminUsersPage() {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPwdResetOpen, setIsPwdResetOpen] = useState(false);
    const [isRoleChangeOpen, setIsRoleChangeOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
            return;
        }
        if (status === "authenticated" && (session?.user as any).role !== "SUPER_ADMIN") {
            router.push("/dashboard");
            return;
        }
        if (status === "authenticated") {
            fetchUsers(1);
        }
    }, [status]);

    const fetchUsers = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/super-admin/users?page=${pageNum}&limit=10`);
            const json = await res.json();
            if (res.ok) {
                setUsers(json.users || []);
                setTotalPages(Math.ceil((json.total || 1) / 10));
                setPage(pageNum);
            }
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            const res = await fetch("/api/super-admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to create user");
            toast.success("User created successfully");
            setIsCreateOpen(false);
            fetchUsers(page);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleResetPwd = async (id: string, newPassword: string) => {
        try {
            const res = await fetch(`/api/super-admin/users/${id}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to reset password");
            }
            toast.success("Password reset successfully");
            setIsPwdResetOpen(false);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRoleChange = async (id: string, newRole: string) => {
        try {
            const res = await fetch(`/api/super-admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to update role");
            }
            toast.success(`Role updated to ${newRole} successfully`);
            setIsRoleChangeOpen(false);
            fetchUsers(page);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user? This action is IRREVERSIBLE.")) return;

        try {
            const res = await fetch(`/api/super-admin/users/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const json = await res.json();
                throw new Error(json.error || "Failed to delete user");
            }
            toast.success("User deleted successfully");
            fetchUsers(page);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (status === "loading" || (loading && users.length === 0)) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-500/20"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
            <Toaster position="top-center" richColors />
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-indigo-600 dark:text-indigo-500" size={32} />
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Management</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage platform users, roles, and access controls.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
                    >
                        <Plus size={20} /> New User
                    </button>
                </div>

                {/* Search & Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by email or ID..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                            <p className="text-[10px] uppercase tracking-widest font-black text-indigo-500 mb-1">Total Users</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{users.length}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Created</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{user.email}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${user.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' :
                                                user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(user.availableBalanceCents * 100)}
                                            </div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Available</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                {openMenuId === user.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right overflow-hidden">
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setIsRoleChangeOpen(true); setOpenMenuId(null); }}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Shield size={16} className="text-indigo-500" />
                                                                Change Role
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedUser(user); setIsPwdResetOpen(true); setOpenMenuId(null); }}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Key size={16} className="text-amber-500" />
                                                                Reset Password
                                                            </button>
                                                            <button
                                                                onClick={() => { handleDelete(user.id); setOpenMenuId(null); }}
                                                                disabled={user.id === session?.user?.id}
                                                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50"
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete User
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => fetchUsers(page - 1)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => fetchUsers(page + 1)}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreate}
            />
            <RoleChangeModal
                isOpen={isRoleChangeOpen}
                onClose={() => setIsRoleChangeOpen(false)}
                user={selectedUser}
                onRoleChange={handleRoleChange}
            />
            <PwdResetModal
                isOpen={isPwdResetOpen}
                onClose={() => setIsPwdResetOpen(false)}
                user={selectedUser}
                onReset={handleResetPwd}
            />
        </div>
    );
}
