
import { XCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutErrorPage() {
    return (
        <div className="max-w-md mx-auto py-24 px-4 text-center">
            <div className="h-24 w-24 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-500/10">
                <XCircle size={48} />
            </div>

            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Checkout Failed</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 leading-relaxed">
                Sorry, something went wrong, please try again.
            </p>

            <div className="space-y-4">
                <Link
                    href="/cart"
                    className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                    Try Again
                </Link>

                <Link
                    href="/products"
                    className="w-full inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                    <ShoppingBag size={20} />
                    Browse Solutions
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
