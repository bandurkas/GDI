import {
    BANDWIDTH_OPTIONS,
    COLOCATION_PRICING as P,
    CUSTOM_PRESET_ID,
    ENTERPRISE_THRESHOLDS,
    getPreset,
    type ContractTerm,
    type DrScope,
    type EnterpriseTier,
    type ServerCategory,
    type ServiceLevel,
    type SiteMode,
} from "./config";

export interface CustomServerSpec {
    rackU: number;
    powerWatts: number;
    psuCount?: number;
    dualFeed?: boolean;
    depthMm?: number;
    weightKg?: number;
    ports?: number;
    bandwidth?: string;
    specialCooling?: boolean;
    notes?: string;
}

export interface CalcInput {
    presetId: string; // preset id or "custom"
    quantity: number;
    contractMonths: ContractTerm;
    bandwidthId: string;
    gpuFabric: boolean;
    siteMode: SiteMode;
    drScope: DrScope;
    drCount: number;
    serviceLevel: ServiceLevel;
    /** Optional power override for standard presets (watts). */
    powerWattsOverride?: number;
    custom?: CustomServerSpec;
}

export type FacilityClass = "standard" | "standard-extended" | "high-density-gpu" | "high-density-ai";

export interface CalcResult {
    presetId: string;
    category: ServerCategory;
    quantity: number;
    /** Servers actually priced (primary + duplicated DR servers). */
    pricedServers: number;
    rackUPerServer: number;
    powerKwPerServer: number;
    displayPowerKwPerServer: number;
    monthlyPerServerIdr: number;
    serversMonthlyIdr: number;
    bandwidthMonthlyIdr: number;
    serviceMonthlyIdr: number;
    monthlyIdr: number;
    setupIdr: number;
    contractMonths: number;
    contractTotalIdr: number;
    totalRackU: number;
    totalPowerKw: number;
    estimatedRackCount: number;
    facility: FacilityClass;
    highDensity: boolean;
    engineeringReview: boolean;
    enterpriseTier: EnterpriseTier;
    enterpriseQuoteRequired: boolean;
    bandwidthQuoteRequired: boolean;
    fabricQuoteRequired: boolean;
    serviceQuoteRequired: boolean;
    drNote: "none" | "duplicated-all" | "duplicated-count" | "custom" | "recommend";
    overMaxQuantity: boolean;
}

const clampQty = (q: number) => Math.min(Math.max(Math.floor(q) || 1, 1), P.maxQuantity);

function standardMonthly(baseMonthly: number, includedKw: number, powerKw: number): number {
    const extraWatts = Math.max(0, Math.round(powerKw * 1000) - Math.round(includedKw * 1000));
    const blocks = Math.ceil(extraWatts / 100);
    return baseMonthly + blocks * P.standardExtraPowerPer100WIdr;
}

function gpuMonthly(rackU: number, powerKw: number): number {
    return rackU * P.gpuRackSpacePerUIdr + powerKw * P.highDensityPowerPerKwIdr + P.gpuManagementPerServerIdr;
}

export function calculateColocation(input: CalcInput): CalcResult {
    const quantity = clampQty(input.quantity);
    const overMaxQuantity = input.quantity > P.maxQuantity;

    let category: ServerCategory;
    let rackU: number;
    let powerKw: number;
    let displayPowerKw: number;
    let monthlyPerServer: number;
    let setupPerServer: number;
    let engineeringReview: boolean;
    let systemsPerRack: number | undefined;

    if (input.presetId === CUSTOM_PRESET_ID) {
        const c = input.custom ?? { rackU: 1, powerWatts: 450 };
        rackU = Math.max(1, Math.floor(c.rackU) || 1);
        powerKw = Math.max(0, (c.powerWatts || 0) / 1000);
        displayPowerKw = powerKw;
        category = "custom";
        const highDensity = powerKw > P.customHighDensityThresholdKw;
        engineeringReview = powerKw > P.customEngineeringReviewKw;
        if (highDensity) {
            monthlyPerServer = gpuMonthly(rackU, powerKw);
            setupPerServer = P.gpuSetupIdr;
            systemsPerRack = Math.max(1, Math.floor(P.usableRackU / rackU));
        } else {
            const base = rackU <= 1 ? 1560000 : 2040000 + Math.max(0, rackU - 2) * P.customStandardExtraUIdr;
            const includedKw = rackU <= 1 ? 0.45 : 0.5;
            monthlyPerServer = standardMonthly(base, includedKw, powerKw);
            setupPerServer = P.standardSetupIdr;
        }
    } else {
        const preset = getPreset(input.presetId) ?? getPreset("standard-1u")!;
        category = preset.category;
        rackU = preset.rackU;
        engineeringReview = preset.engineeringReview;
        systemsPerRack = preset.systemsPerRackDefault;
        setupPerServer = preset.setupPriceIdr;
        if (category === "standard" || category === "standard-high-power") {
            const includedKw = preset.includedPowerKw ?? preset.pricingPowerKw;
            const override = input.powerWattsOverride && input.powerWattsOverride > 0 ? input.powerWattsOverride / 1000 : undefined;
            powerKw = override !== undefined ? Math.max(override, includedKw) : preset.pricingPowerKw;
            displayPowerKw = powerKw;
            monthlyPerServer = standardMonthly(preset.baseMonthlyIdr ?? 0, includedKw, powerKw);
        } else {
            powerKw = preset.pricingPowerKw;
            displayPowerKw = preset.displayPowerKw ?? preset.pricingPowerKw;
            monthlyPerServer = gpuMonthly(rackU, powerKw);
        }
    }

    const isGpuClass = category === "gpu" || category === "extreme-gpu" || (category === "custom" && powerKw > P.customHighDensityThresholdKw);

    // Multi-site duplication
    let pricedServers = quantity;
    let drNote: CalcResult["drNote"] = "none";
    if (input.siteMode === "dr") {
        if (input.drScope === "all") { pricedServers = quantity * 2; drNote = "duplicated-all"; }
        else if (input.drScope === "count") { pricedServers = quantity + Math.min(Math.max(Math.floor(input.drCount) || 0, 0), quantity); drNote = "duplicated-count"; }
        else drNote = "custom";
    } else if (input.siteMode === "recommend") {
        drNote = "recommend";
    }

    const serversMonthly = monthlyPerServer * pricedServers;
    const setup = setupPerServer * pricedServers;

    const bw = BANDWIDTH_OPTIONS.find((b) => b.id === input.bandwidthId) ?? BANDWIDTH_OPTIONS[0];
    const bandwidthQuoteRequired = bw.monthlyIdr === null;
    const bandwidthMonthly = bw.monthlyIdr ?? 0;

    const serviceQuoteRequired = input.serviceLevel === "enterprise";
    const serviceMonthly = input.serviceLevel === "remote" ? P.remoteOperationsPerDeploymentIdr : 0;

    const monthly = serversMonthly + bandwidthMonthly + serviceMonthly;
    const contractMonths = Math.min(input.contractMonths, 24);
    const contractTotal = monthly * contractMonths;

    const totalRackU = rackU * pricedServers;
    const totalPowerKw = Math.round(powerKw * pricedServers * 1000) / 1000;

    const racksByU = Math.ceil(totalRackU / P.usableRackU);
    const estimatedRackCount = isGpuClass && systemsPerRack
        ? Math.max(racksByU, Math.ceil(pricedServers / systemsPerRack))
        : Math.max(1, racksByU);

    let enterpriseTier: EnterpriseTier = "none";
    if (isGpuClass) {
        if (quantity >= ENTERPRISE_THRESHOLDS.capacityReservation) enterpriseTier = "capacity-reservation";
        else if (quantity >= ENTERPRISE_THRESHOLDS.aiFactory) enterpriseTier = "ai-factory";
        else if (quantity >= ENTERPRISE_THRESHOLDS.largeCluster) enterpriseTier = "large-cluster";
        else if (quantity >= ENTERPRISE_THRESHOLDS.enterprise) enterpriseTier = "enterprise";
    }

    const facility: FacilityClass =
        category === "extreme-gpu" ? "high-density-ai"
            : isGpuClass ? "high-density-gpu"
                : category === "standard-high-power" ? "standard-extended"
                    : "standard";

    return {
        presetId: input.presetId,
        category,
        quantity,
        pricedServers,
        rackUPerServer: rackU,
        powerKwPerServer: powerKw,
        displayPowerKwPerServer: displayPowerKw,
        monthlyPerServerIdr: monthlyPerServer,
        serversMonthlyIdr: serversMonthly,
        bandwidthMonthlyIdr: bandwidthMonthly,
        serviceMonthlyIdr: serviceMonthly,
        monthlyIdr: monthly,
        setupIdr: setup,
        contractMonths,
        contractTotalIdr: contractTotal,
        totalRackU,
        totalPowerKw,
        estimatedRackCount,
        facility,
        highDensity: isGpuClass,
        engineeringReview,
        enterpriseTier,
        enterpriseQuoteRequired: enterpriseTier === "large-cluster" || enterpriseTier === "ai-factory" || enterpriseTier === "capacity-reservation" || overMaxQuantity,
        bandwidthQuoteRequired,
        fabricQuoteRequired: input.gpuFabric,
        serviceQuoteRequired,
        drNote,
        overMaxQuantity,
    };
}

export const formatIdr = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

export const formatIdrCompact = (v: number) => {
    if (v >= 1e9) return `Rp ${(v / 1e9).toLocaleString("en-US", { maximumFractionDigits: 2 })}B`;
    if (v >= 1e6) return `Rp ${(v / 1e6).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
    return formatIdr(v);
};

export const formatPower = (kw: number) =>
    kw >= 1000 ? `${(kw / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} MW` : `${kw.toLocaleString("en-US", { maximumFractionDigits: 2 })} kW`;
