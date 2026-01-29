"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={className}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Moon size={20} className="text-slate-400 hover:text-white transition-colors" />
            ) : (
                <Sun size={20} className="text-slate-400 hover:text-indigo-600 transition-colors" />
            )}
        </button>
    );
}
