"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setLanguage as setLanguageCookie } from "@/actions/language";
import { dictionaries, Dictionary } from "@/lib/dictionaries";

interface LanguageContextType {
    language: "en" | "id";
    dictionary: Dictionary;
    switchLanguage: (lang: "en" | "id") => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
    children,
    initialLanguage
}: {
    children: ReactNode;
    initialLanguage: "en" | "id"
}) {
    const [language, setLanguage] = useState<"en" | "id">(initialLanguage);
    const router = useRouter();

    const switchLanguage = async (lang: "en" | "id") => {
        setLanguage(lang);
        await setLanguageCookie(lang);
        router.refresh(); // Refresh Server Components
    };

    const dictionary = dictionaries[language];

    return (
        <LanguageContext.Provider value={{ language, dictionary, switchLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
