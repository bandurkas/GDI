import React from 'react';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export function Card({
    children,
    className = '',
    padding = 'md',
    hover = false
}: CardProps) {
    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div className={`
            bg-white dark:bg-slate-900 
            rounded-2xl 
            border border-slate-200 dark:border-slate-800
            shadow-sm
            ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''}
            ${paddingStyles[padding]}
            ${className}
        `}>
            {children}
        </div>
    );
}
