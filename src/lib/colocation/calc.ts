import {
    BANDWIDTH_OPTIONS,
    COLOCATION_PRICING as P,
    CUSTOM_PRESET_ID,
    ENTERPRISE_THRESHOLDS,
    getPreset,
    getOpsPlan,
    opsMonthlyIdr,
    opsSetupIdr,
    hardwareValueIdrOf,
    USD_IDR_PLANNING_RATE,
    type OpsPlanId,
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
    /** Approximate hardware value (IDR) for the hardware-responsibility component; heuristic if omitted. */
    hardwareValueIdr?: number;
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
    /** Managed Server Operations plan applied per server (OS / application layer). */
    opsPlan?: OpsPlanId;
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
    opsPlan: OpsPlanId;
    /** Hardware value per server (IDR) used to size the ops hardware-responsibility component. */
    hardwareValueIdr: number;
    hardwareValueAssumed: boolean;
    opsMonthlyPerServerIdr: number;
    opsMonthlyIdr: number;
    opsSetupIdr: number;
    opsVolumeReview: boolean;
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

    let hardwareValueIdr: number;
    let hardwareValueAssumed = false;
    if (input.presetId === CUSTOM_PRESET_ID) {
        if (input.custom?.hardwareValueIdr && input.custom.hardwareValueIdr > 0) {
            hardwareValueIdr = input.custom.hardwareValueIdr;
        } else {
            hardwareValueAssumed = true;
            hardwareValueIdr = isGpuClass
                ? Math.round((50000 * (powerKw / 3)) * USD_IDR_PLANNING_RATE) // 4U L40S class ≈ USD 50k at 3 kW, scaled by power
                : Math.max(6000, rackU * 4500) * USD_IDR_PLANNING_RATE;
        }
    } else {
        hardwareValueIdr = hardwareValueIdrOf(getPreset(input.presetId) ?? getPreset("standard-1u")!);
    }

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

    // Managed Server Operations (per priced server). GPU plan only for GPU-class; non-GPU plans not offered for GPU-class.
    let opsPlan: OpsPlanId = input.opsPlan ?? "none";
    if (opsPlan !== "none") {
        const plan = getOpsPlan(opsPlan);
        if (!plan || (plan.gpuOnly && !isGpuClass) || (!plan.gpuOnly && isGpuClass)) opsPlan = "none";
    }
    const ops = opsPlan !== "none" ? getOpsPlan(opsPlan)! : undefined;
    const opsPerServer = ops ? opsMonthlyIdr(ops, hardwareValueIdr) : 0;
    const opsMonthly = opsPerServer * pricedServers;
    const opsSetup = ops ? opsSetupIdr(ops) * pricedServers : 0;
    const opsVolumeReview = !!ops?.volumeReviewFrom && pricedServers >= ops.volumeReviewFrom;

    const monthly = serversMonthly + bandwidthMonthly + serviceMonthly + opsMonthly;
    const setupTotal = setup + opsSetup;
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
        opsPlan,
        hardwareValueIdr,
        hardwareValueAssumed,
        opsMonthlyPerServerIdr: opsPerServer,
        opsMonthlyIdr: opsMonthly,
        opsSetupIdr: opsSetup,
        opsVolumeReview,
        monthlyIdr: monthly,
        setupIdr: setupTotal,
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

// "Rp 1.8M" is read as 1.8 miliar (billion) in Indonesia — never abbreviate IDR, always show full figures.
export const formatIdrCompact = (v: number) => formatIdr(v);

/** Indicative USD conversion for readers unfamiliar with rupiah. Rate via NEXT_PUBLIC_USD_IDR_RATE (default 17,600). */
export const USD_IDR_RATE = Number(process.env.NEXT_PUBLIC_USD_IDR_RATE) || 17600;
export const formatUsd = (idr: number) => {
    const usd = idr / USD_IDR_RATE;
    return `≈ $${usd.toLocaleString("en-US", { maximumFractionDigits: usd < 100 ? 1 : 0 })}`;
};

export const formatPower = (kw: number) =>
    kw >= 1000 ? `${(kw / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })} MW` : `${kw.toLocaleString("en-US", { maximumFractionDigits: 2 })} kW`;
