import React from 'react';

export interface StatCardProps {
    label: string;
    value: string | number;
    variant?: 'indigo' | 'amber' | 'green' | 'red' | 'blue';
    icon?: React.ReactNode;
}

export function StatCard({
    label,
    value,
    variant = 'indigo',
    icon
}: StatCardProps) {
    const variants = {
        indigo: 'bg-indigo-50 dark:bg-indigo-500/5 text-indigo-500',
        amber: 'bg-amber-50 dark:bg-amber-500/5 text-amber-500',
        green: 'bg-green-50 dark:bg-green-500/5 text-green-500',
        red: 'bg-red-50 dark:bg-red-500/5 text-red-500',
        blue: 'bg-blue-50 dark:bg-blue-500/5 text-blue-500'
    };

    return (
        <div className={`px-4 py-2 rounded-xl ${variants[variant]}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest font-black">
                        {label}
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                        {value}
                    </p>
                </div>
                {icon && (
                    <div className="ml-3 opacity-50">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
