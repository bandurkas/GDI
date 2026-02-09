import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest"
                >
                    {label}
                </label>
            )}

            <input
                id={inputId}
                className={`
                    w-full px-4 py-3 
                    bg-slate-50 dark:bg-slate-950 
                    border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'}
                    rounded-xl text-sm font-medium
                    text-slate-900 dark:text-white
                    placeholder:text-slate-400 dark:placeholder:text-slate-600
                    focus:ring-2 focus:outline-none
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${className}
                `}
                {...props}
            />

            {error && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {helperText && !error && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {helperText}
                </p>
            )}
        </div>
    );
}
