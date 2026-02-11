
import { prisma } from "@/lib/prisma";

const RATE_KEY = "USD_TO_IDR";
const DEFAULT_RATE = 16000; // Fallback if API fails
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class ExchangeRateService {
    /**
     * Get the current USD to IDR exchange rate.
     * Fetches from external API if cache is expired (>24h).
     */
    static async getRate(): Promise<number> {
        try {
            // 1. Check Database Cache
            const setting = await prisma.systemSetting.findUnique({
                where: { key: RATE_KEY },
            });

            const now = new Date();
            if (setting) {
                const age = now.getTime() - setting.updatedAt.getTime();
                // If fresh (< 24h), return cached rate
                if (age < CACHE_TTL_MS) {
                    return parseFloat(setting.value);
                }
            }

            // 2. Fetch Fresh Rate (if expired or missing)
            console.log("[ExchangeRateService] Rate expired or missing. Fetching new rate...");
            const newRate = await this.fetchExternalRate();

            // 3. Update Database Cache
            await prisma.systemSetting.upsert({
                where: { key: RATE_KEY },
                update: {
                    value: newRate.toString(),
                    updatedAt: now // Force update timestamp
                },
                create: {
                    key: RATE_KEY,
                    value: newRate.toString(),
                    description: "Daily USD to IDR Exchange Rate",
                },
            });

            return newRate;

        } catch (error) {
            console.error("[ExchangeRateService] Failed to get/update rate:", error);
            // If DB/Network fails, return fallback (or old cached value if possible)
            return DEFAULT_RATE;
        }
    }

    /**
     * Fetch rate from external API
     */
    private static async fetchExternalRate(): Promise<number> {
        try {
            // Using a free public API (Rate limit: usually generous for this endpoint)
            const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { next: { revalidate: 3600 } });

            if (!response.ok) {
                throw new Error(`External API error: ${response.statusText}`);
            }

            const data = await response.json();
            const rate = data.rates?.IDR;

            if (!rate || typeof rate !== 'number') {
                throw new Error("Invalid rate data received");
            }

            console.log(`[ExchangeRateService] Fetched new rate: 1 USD = ${rate} IDR`);
            return rate;
        } catch (error) {
            console.error("[ExchangeRateService] External fetch failed:", error);
            throw error;
        }
    }

    /**
     * Force refresh the rate manually (e.g. via Admin button)
     */
    static async refreshRate(): Promise<number> {
        const newRate = await this.fetchExternalRate();
        await prisma.systemSetting.upsert({
            where: { key: RATE_KEY },
            update: { value: newRate.toString() },
            create: {
                key: RATE_KEY,
                value: newRate.toString(),
                description: "Daily USD to IDR Exchange Rate",
            },
        });
        return newRate;
    }
}
