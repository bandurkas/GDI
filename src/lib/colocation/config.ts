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
    /** Typical market value of the server (USD), used to size the hardware-responsibility component of ops plans. */
    hardwareValueUsd?: number;
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
        hardwareValueUsd: 6000,
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
        hardwareValueUsd: 9000,
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
        hardwareValueUsd: 16000,
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
        hardwareValueUsd: 50000,
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
        hardwareValueUsd: 230000,
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
        hardwareValueUsd: 315000,
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
        hardwareValueUsd: 290000,
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
        hardwareValueUsd: 330000,
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

// ── Managed Server Operations (OS / application layer + hardware responsibility) ──
// Separate from data-center remote hands (facility). Price per server =
//   (labour & tooling cost basis + hardware-responsibility reserve = hardware value × rate / 12) × SERVER_OPS_MARKUP
// Cost bases are market averages (see docs/PRICING_SERVER_OPS.md). Markup requested by the owner: +30 %.
export type OpsPlanId = "none" | "essential" | "standard" | "advanced" | "gpu";

export interface OpsPlan {
    id: Exclude<OpsPlanId, "none">;
    /** Market-average labour + tooling cost per server per month (IDR, before markup). */
    labourCostIdr: number;
    /** Hardware-responsibility reserve as a share of hardware value per year (0 = no hardware coverage). */
    hardwareRatePerYear: number;
    /** One-time onboarding (connection, initial configuration, customer software install), market-average cost basis (before markup). */
    setupCostIdr: number;
    /** Engineering hours included in onboarding. */
    onboardingHours: number;
    includedHours: number;
    coverage: "24x7-monitoring" | "business-hours" | "24x7";
    responseMinutes: number;
    /** Only offered for GPU-class servers (auto-selected for GPU presets). */
    gpuOnly?: boolean;
    /** Volume review threshold (servers) after which pricing is negotiated. */
    volumeReviewFrom?: number;
}

export const SERVER_OPS_MARKUP = 1.3;
export const USD_IDR_PLANNING_RATE = 17600;

export const SERVER_OPS_PLANS: OpsPlan[] = [
    { id: "essential", labourCostIdr: 400000, hardwareRatePerYear: 0, setupCostIdr: 500000, onboardingHours: 2, includedHours: 0, coverage: "24x7-monitoring", responseMinutes: 60 },
    { id: "standard", labourCostIdr: 1500000, hardwareRatePerYear: 0.05, setupCostIdr: 2000000, onboardingHours: 6, includedHours: 4, coverage: "business-hours", responseMinutes: 240 },
    { id: "advanced", labourCostIdr: 5000000, hardwareRatePerYear: 0.10, setupCostIdr: 3000000, onboardingHours: 10, includedHours: 10, coverage: "24x7", responseMinutes: 30 },
    { id: "gpu", labourCostIdr: 7500000, hardwareRatePerYear: 0.10, setupCostIdr: 9000000, onboardingHours: 24, includedHours: 12, coverage: "24x7", responseMinutes: 30, gpuOnly: true, volumeReviewFrom: 10 },
];

const round10k = (v: number) => Math.round(v / 10000) * 10000;

/** Public monthly price of an ops plan for a server of the given hardware value (IDR). */
export function opsMonthlyIdr(plan: OpsPlan, hardwareValueIdr: number): number {
    return round10k((plan.labourCostIdr + (hardwareValueIdr * plan.hardwareRatePerYear) / 12) * SERVER_OPS_MARKUP);
}
export function opsSetupIdr(plan: OpsPlan): number {
    return round10k(plan.setupCostIdr * SERVER_OPS_MARKUP);
}
export const hardwareValueIdrOf = (preset: ColocationPreset) => (preset.hardwareValueUsd ?? 6000) * USD_IDR_PLANNING_RATE;

/** Add-ons: market average × SERVER_OPS_MARKUP. Hardware parts/labour are included in Advanced & GPU plans; at cost otherwise. */
export const SERVER_OPS_ADDONS = {
    extraAdminHourIdr: 650000,
    backupPer100GbIdr: 325000,
    backupPerTbIdr: 1625000,
    vulnerabilityScanPerServerIdr: 975000,
    drRestoreTestPerEventIdr: 1625000,
};

export const getOpsPlan = (id: OpsPlanId) => SERVER_OPS_PLANS.find((p) => p.id === id);

export function getPreset(id: string): ColocationPreset | undefined {
    return COLOCATION_PRESETS.find((p) => p.id === id);
}
