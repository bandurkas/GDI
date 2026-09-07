// Centralised configuration for the Managed Server Colocation section.
// All public prices below are customer-facing GDI prices (IDR, excl. taxes).
// Partner cost / markup logic must never live in this file — it is shipped to the browser.

export type ServerCategory =
    | "standard"
    | "standard-high-power"
    | "gpu"
    | "extreme-gpu"
    | "custom";

export interface ColocationPreset {
    id: string;
    name: string;
    category: ServerCategory;
    rackU: number;
    /** kW used by the pricing formula (GPU) or power profile assumed by the base price (standard). */
    pricingPowerKw: number;
    /** Nominal operating figure shown to the user when it differs from pricingPowerKw (B300). */
    displayPowerKw?: number;
    /** Power included in baseMonthlyIdr; usage above it is billed per 100 W block. */
    includedPowerKw?: number;
    setupPriceIdr: number;
    baseMonthlyIdr?: number;
    systemsPerRackDefault?: number;
    systemsPerRackSpecialized?: number;
    engineeringReview: boolean;
    badge?: "popular-ai" | "blackwell-ultra";
    examples?: string[];
    note?: string;
    /** Only used for the on-page "server categories" cards. */
    gpuCount?: number;
    weightKg?: number;
}

export const COLOCATION_PRESETS: ColocationPreset[] = [
    {
        id: "standard-1u",
        name: "Standard 1U Server",
        category: "standard",
        rackU: 1,
        pricingPowerKw: 0.45,
        includedPowerKw: 0.45,
        setupPriceIdr: 660000,
        baseMonthlyIdr: 1560000,
        engineeringReview: false,
        examples: ["Dell PowerEdge R660-class", "HPE ProLiant DL360-class", "Supermicro 1U compute"],
    },
    {
        id: "standard-2u",
        name: "Standard 2U Server",
        category: "standard",
        rackU: 2,
        pricingPowerKw: 0.5,
        includedPowerKw: 0.5,
        setupPriceIdr: 660000,
        baseMonthlyIdr: 2040000,
        engineeringReview: false,
        examples: ["Dell PowerEdge R760-class", "HPE ProLiant DL380-class", "Lenovo ThinkSystem SR650-class"],
    },
    {
        id: "storage-2u",
        name: "Storage / High-Power 2U",
        category: "standard-high-power",
        rackU: 2,
        pricingPowerKw: 1.2,
        includedPowerKw: 0.5,
        setupPriceIdr: 660000,
        baseMonthlyIdr: 2040000,
        engineeringReview: false,
        examples: ["Storage appliances", "CPU-dense 2U systems above the standard power allowance"],
    },
    {
        id: "gpu-4u-l40s",
        name: "4U GPU — L40S / PCIe GPU Class",
        category: "gpu",
        rackU: 4,
        pricingPowerKw: 3.0,
        setupPriceIdr: 6000000,
        systemsPerRackDefault: 4,
        engineeringReview: true,
        examples: ["4× NVIDIA L40S", "4× PCIe accelerator server", "OEM AI inference server"],
        note: "Actual OEM PSU and power profile must be validated.",
    },
    {
        id: "dgx-h100",
        name: "NVIDIA DGX H100",
        category: "gpu",
        rackU: 8,
        pricingPowerKw: 10.2,
        setupPriceIdr: 6000000,
        systemsPerRackDefault: 2,
        systemsPerRackSpecialized: 4,
        engineeringReview: true,
        gpuCount: 8,
    },
    {
        id: "dgx-h200",
        name: "NVIDIA DGX H200",
        category: "gpu",
        rackU: 8,
        pricingPowerKw: 10.2,
        setupPriceIdr: 6000000,
        systemsPerRackDefault: 2,
        systemsPerRackSpecialized: 4,
        engineeringReview: true,
        gpuCount: 8,
    },
    {
        id: "dgx-b200",
        name: "NVIDIA DGX B200",
        category: "extreme-gpu",
        rackU: 10,
        pricingPowerKw: 14.3,
        setupPriceIdr: 6000000,
        systemsPerRackDefault: 2,
        systemsPerRackSpecialized: 4,
        engineeringReview: true,
        badge: "popular-ai",
        gpuCount: 8,
        weightKg: 142.4,
    },
    {
        id: "dgx-b300",
        name: "NVIDIA DGX B300",
        category: "extreme-gpu",
        rackU: 10,
        displayPowerKw: 14.5,
        pricingPowerKw: 15.0, // 15 kW planning value — do not lower without approval
        setupPriceIdr: 6000000,
        systemsPerRackDefault: 2,
        systemsPerRackSpecialized: 4,
        engineeringReview: true,
        badge: "blackwell-ultra",
        gpuCount: 8,
        weightKg: 168,
    },
];

export const CUSTOM_PRESET_ID = "custom";

export const COLOCATION_PRICING = {
    standardExtraPowerPer100WIdr: 420000,
    highDensityPowerPerKwIdr: 3000000,
    gpuRackSpacePerUIdr: 420000,
    gpuManagementPerServerIdr: 2400000,
    remoteOperationsPerDeploymentIdr: 2400000,
    standardSetupIdr: 660000,
    gpuSetupIdr: 6000000,
    /** Custom standard servers above 2U: 2U base + this per additional U. */
    customStandardExtraUIdr: 420000,
    /** Custom servers above this power (kW) are classified as high density. */
    customHighDensityThresholdKw: 5,
    /** Custom servers above this power (kW) require engineering review. */
    customEngineeringReviewKw: 10,
    usableRackU: 42,
    maxQuantity: 200,
};

export const CONTRACT_TERMS = [1, 3, 6, 12, 24] as const;
export type ContractTerm = (typeof CONTRACT_TERMS)[number];

export interface BandwidthOption {
    id: string;
    scope: "basic" | "domestic" | "international" | "custom";
    mbps?: number;
    monthlyIdr: number | null; // null → quote required
}

export const BANDWIDTH_OPTIONS: BandwidthOption[] = [
    { id: "basic", scope: "basic", monthlyIdr: 0 },
    { id: "dom-100", scope: "domestic", mbps: 100, monthlyIdr: 600000 },
    { id: "dom-500", scope: "domestic", mbps: 500, monthlyIdr: 1800000 },
    { id: "dom-1000", scope: "domestic", mbps: 1000, monthlyIdr: 3000000 },
    { id: "intl-10", scope: "international", mbps: 10, monthlyIdr: 1020000 },
    { id: "intl-25", scope: "international", mbps: 25, monthlyIdr: 2400000 },
    { id: "intl-50", scope: "international", mbps: 50, monthlyIdr: 4500000 },
    { id: "intl-100", scope: "international", mbps: 100, monthlyIdr: 7800000 },
    { id: "intl-200", scope: "international", mbps: 200, monthlyIdr: 12000000 },
    { id: "custom", scope: "custom", monthlyIdr: null },
];

export const OTHER_ADDONS = [
    { id: "ipv4", monthlyIdr: 36000 },
    { id: "lan-port", monthlyIdr: 180000 },
    { id: "power-socket", monthlyIdr: 180000 },
    { id: "os-install", perEventIdr: 420000 },
];

export type ServiceLevel = "core" | "remote" | "enterprise";
export type SiteMode = "single" | "dr" | "recommend";
export type DrScope = "all" | "count" | "custom";

/** Thresholds apply to GPU-class deployments (quantity of GPU nodes). */
export const ENTERPRISE_THRESHOLDS = {
    enterprise: 10,
    largeCluster: 20,
    aiFactory: 50,
    capacityReservation: 100,
} as const;

export type EnterpriseTier = "none" | "enterprise" | "large-cluster" | "ai-factory" | "capacity-reservation";

export const STANDARD_RACK_PRICING = [
    { id: "1u", monthlyIdr: 1560000, presetId: "standard-1u" },
    { id: "2u", monthlyIdr: 2040000, presetId: "standard-2u" },
    { id: "quarter", monthlyIdr: 6600000 },
    { id: "half", monthlyIdr: 10800000 },
    { id: "full", monthlyIdr: 24000000 },
];

export function getPreset(id: string): ColocationPreset | undefined {
    return COLOCATION_PRESETS.find((p) => p.id === id);
}
