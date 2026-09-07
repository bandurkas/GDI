// Centralised configuration for the AI services packages (/products).
// Numbers live here; copy lives in ./content.ts. Product ids must match the `Product` rows in the database
// (seeded by /api/seed) because the cart and orders reference them.

export type PackageId = "start-ai" | "middle-scale" | "automation-platform" | "ent-assistant";
export type PackageTier = "foundation" | "pilot" | "program" | "assistant";

export interface ServicePackage {
    id: PackageId;
    tier: PackageTier;
    /** Public fixed price, IDR, excl. taxes. Stored as-is in Product.priceCents (whole rupiah). */
    priceIdr: number;
    /** Delivery window in working days (min/max). */
    durationDays: [number, number];
    /** Stakeholder time we need from the customer, hours over the whole engagement. */
    customerHours: [number, number];
    /** Systems / integrations included in the fixed price. */
    integrationsIncluded: number;
    /** Live training sessions included. */
    trainingSessions: number;
    /** Post-delivery support window, calendar days. */
    supportDays: number;
    /** Days from confirmed payment to kickoff (working days). */
    kickoffWithinDays: number;
    featured?: boolean;
    /** Package we recommend as the natural next step. */
    nextId?: PackageId;
}

// Prices: market-based fixed fees (basis in docs/PRICING_AI_SERVICES.md, internal). Updated 2026-09-07.
export const SERVICE_PACKAGES: ServicePackage[] = [
    { id: "start-ai", tier: "foundation", priceIdr: 19500000, durationDays: [7, 7], customerHours: [2, 4], integrationsIncluded: 0, trainingSessions: 1, supportDays: 14, kickoffWithinDays: 2, nextId: "middle-scale" },
    { id: "middle-scale", tier: "pilot", priceIdr: 45000000, durationDays: [15, 15], customerHours: [4, 6], integrationsIncluded: 2, trainingSessions: 1, supportDays: 30, kickoffWithinDays: 2, featured: true, nextId: "automation-platform" },
    { id: "automation-platform", tier: "program", priceIdr: 120000000, durationDays: [30, 40], customerHours: [8, 12], integrationsIncluded: 5, trainingSessions: 2, supportDays: 30, kickoffWithinDays: 3, nextId: "ent-assistant" },
    { id: "ent-assistant", tier: "assistant", priceIdr: 150000000, durationDays: [20, 30], customerHours: [6, 10], integrationsIncluded: 1, trainingSessions: 2, supportDays: 30, kickoffWithinDays: 3 },
];

/** Public package names (brand-level, not translated). */
export const PACKAGE_NAMES: Record<PackageId, string> = {
    "start-ai": "AI Readiness Sprint",
    "middle-scale": "Automation Pilot",
    "automation-platform": "Automation Program",
    "ent-assistant": "Private AI Assistant",
};

export const getPackage = (id: string) => SERVICE_PACKAGES.find((p) => p.id === id);

/** Limits quoted on the page for the AI Assistant package. */
export const ASSISTANT_LIMITS = { documents: 500, pages: 5000, channels: 1, departments: 1 };

/** Interest options for the custom request form (ids stored in ServiceLead.interest). */
export const SERVICE_INTERESTS = ["custom-ai", "custom-software", "retainer", "own-infrastructure", "package-question"] as const;
export type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

export const BUDGET_BANDS = ["under-25m", "25-75m", "75-200m", "over-200m", "not-sure"] as const;
export const TIMELINE_OPTIONS = ["asap", "1-2-months", "this-quarter", "exploring"] as const;

// ── Package finder (3 questions → recommendation) ──
export type FinderStage = "unsure" | "one-process" | "department" | "knowledge";
export type FinderSystems = "0-1" | "2" | "3-5" | "not-sure";
export type FinderWhen = "this-month" | "2-months" | "this-quarter";

export function recommendPackage(stage: FinderStage, systems: FinderSystems): PackageId {
    if (stage === "unsure") return "start-ai";
    if (stage === "knowledge") return "ent-assistant";
    if (stage === "department") return "automation-platform";
    return systems === "3-5" ? "automation-platform" : "middle-scale";
}

export const formatIdr = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
