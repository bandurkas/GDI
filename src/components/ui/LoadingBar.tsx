
"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function LoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleComplete = () => setLoading(false);

        // Since Next.js 13+ doesn't have router events like before,
        // we can trigger the bar on pathname/params changes.
        // This is a simple visual cue.
        handleStart();
        const timer = setTimeout(handleComplete, 500);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-[9999] overflow-hidden bg-slate-100 dark:bg-slate-900">
            <div className="h-full bg-indigo-600 animate-loading-bar shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
        </div>
    );
}
