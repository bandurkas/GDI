import { describe, it, expect } from "vitest";
import { calculateColocation, formatPower, type CalcInput } from "./calc";

const base: CalcInput = {
    presetId: "dgx-b200",
    quantity: 1,
    contractMonths: 1,
    bandwidthId: "basic",
    gpuFabric: false,
    siteMode: "single",
    drScope: "all",
    drCount: 0,
    serviceLevel: "core",
};

describe("colocation calculator — spec test cases", () => {
    it("standard 1U", () => {
        const r = calculateColocation({ ...base, presetId: "standard-1u" });
        expect(r.monthlyIdr).toBe(1560000);
        expect(r.setupIdr).toBe(660000);
        expect(r.estimatedRackCount).toBe(1);
        expect(r.enterpriseTier).toBe("none");
    });

    it("standard 1U with 650 W override bills 2 extra blocks", () => {
        const r = calculateColocation({ ...base, presetId: "standard-1u", powerWattsOverride: 650 });
        expect(r.monthlyIdr).toBe(1560000 + 2 * 420000);
    });

    it("standard 2U", () => {
        const r = calculateColocation({ ...base, presetId: "standard-2u" });
        expect(r.monthlyIdr).toBe(2040000);
    });

    it("storage 2U = 2U base + 7 × 420k", () => {
        const r = calculateColocation({ ...base, presetId: "storage-2u" });
        expect(r.monthlyIdr).toBe(4980000);
        expect(r.facility).toBe("standard-extended");
    });

    it("4U GPU L40S class", () => {
        const r = calculateColocation({ ...base, presetId: "gpu-4u-l40s" });
        expect(r.monthlyIdr).toBe(13080000);
        expect(r.setupIdr).toBe(6000000);
        expect(r.engineeringReview).toBe(true);
    });

    it("DGX H100 / H200", () => {
        expect(calculateColocation({ ...base, presetId: "dgx-h100" }).monthlyIdr).toBe(36360000);
        expect(calculateColocation({ ...base, presetId: "dgx-h200" }).monthlyIdr).toBe(36360000);
    });

    it("1 × B200", () => {
        const r = calculateColocation(base);
        expect(r.monthlyIdr).toBe(49500000);
        expect(r.setupIdr).toBe(6000000);
        expect(r.totalRackU).toBe(10);
        expect(r.totalPowerKw).toBe(14.3);
        expect(r.estimatedRackCount).toBe(1);
        expect(r.facility).toBe("high-density-ai");
    });

    it("2 × B200 share one rack", () => {
        const r = calculateColocation({ ...base, quantity: 2 });
        expect(r.monthlyIdr).toBe(99000000);
        expect(r.setupIdr).toBe(12000000);
        expect(r.totalRackU).toBe(20);
        expect(r.totalPowerKw).toBe(28.6);
        expect(r.estimatedRackCount).toBe(1);
    });

    it("10 × B200 → enterprise tier, 5 racks", () => {
        const r = calculateColocation({ ...base, quantity: 10 });
        expect(r.monthlyIdr).toBe(495000000);
        expect(r.setupIdr).toBe(60000000);
        expect(r.totalRackU).toBe(100);
        expect(r.totalPowerKw).toBe(143);
        expect(r.estimatedRackCount).toBe(5);
        expect(r.enterpriseTier).toBe("enterprise");
        expect(r.enterpriseQuoteRequired).toBe(false);
    });

    it("100 × B200 → 1.43 MW, 50 racks, capacity reservation", () => {
        const r = calculateColocation({ ...base, quantity: 100 });
        expect(r.monthlyIdr).toBe(4950000000);
        expect(r.setupIdr).toBe(600000000);
        expect(r.totalPowerKw).toBe(1430);
        expect(formatPower(r.totalPowerKw)).toBe("1.43 MW");
        expect(r.estimatedRackCount).toBe(50);
        expect(r.enterpriseTier).toBe("capacity-reservation");
        expect(r.enterpriseQuoteRequired).toBe(true);
    });

    it("200 × B200, 6-month total", () => {
        const r = calculateColocation({ ...base, quantity: 200, contractMonths: 6 });
        expect(r.monthlyIdr).toBe(9900000000);
        expect(r.contractTotalIdr).toBe(59400000000);
        expect(r.setupIdr).toBe(1200000000);
        expect(r.totalPowerKw).toBe(2860);
        expect(r.estimatedRackCount).toBe(100);
    });

    it("B300 prices on 15.0 kW, displays 14.5 kW", () => {
        const r = calculateColocation({ ...base, presetId: "dgx-b300" });
        expect(r.monthlyIdr).toBe(51600000);
        expect(r.powerKwPerServer).toBe(15);
        expect(r.displayPowerKwPerServer).toBe(14.5);
    });

    it("10 × B300 and 200 × B300", () => {
        expect(calculateColocation({ ...base, presetId: "dgx-b300", quantity: 10 }).monthlyIdr).toBe(516000000);
        const r = calculateColocation({ ...base, presetId: "dgx-b300", quantity: 200, contractMonths: 6 });
        expect(r.monthlyIdr).toBe(10320000000);
        expect(r.contractTotalIdr).toBe(61920000000);
        expect(r.totalPowerKw).toBe(3000);
        expect(r.estimatedRackCount).toBe(100);
    });

    it("quantity is clamped to 200 and flagged", () => {
        const r = calculateColocation({ ...base, quantity: 250 });
        expect(r.quantity).toBe(200);
        expect(r.overMaxQuantity).toBe(true);
        expect(r.enterpriseQuoteRequired).toBe(true);
    });

    it("enterprise thresholds for GPU nodes", () => {
        expect(calculateColocation({ ...base, quantity: 9 }).enterpriseTier).toBe("none");
        expect(calculateColocation({ ...base, quantity: 20 }).enterpriseTier).toBe("large-cluster");
        expect(calculateColocation({ ...base, quantity: 50 }).enterpriseTier).toBe("ai-factory");
        expect(calculateColocation({ ...base, presetId: "standard-1u", quantity: 150 }).enterpriseTier).toBe("none");
    });

    it("standard rack count is U-based (150 × 1U = 4 racks)", () => {
        expect(calculateColocation({ ...base, presetId: "standard-1u", quantity: 150 }).estimatedRackCount).toBe(4);
    });
});

describe("colocation calculator — add-ons and options", () => {
    it("bandwidth add-on is per deployment, custom requires quote", () => {
        const r = calculateColocation({ ...base, quantity: 2, bandwidthId: "intl-100" });
        expect(r.monthlyIdr).toBe(99000000 + 7800000);
        const c = calculateColocation({ ...base, bandwidthId: "custom" });
        expect(c.bandwidthQuoteRequired).toBe(true);
        expect(c.monthlyIdr).toBe(49500000);
    });

    it("managed remote operations adds 2.4M per deployment; enterprise NOC is quote-only", () => {
        expect(calculateColocation({ ...base, serviceLevel: "remote" }).monthlyIdr).toBe(51900000);
        const e = calculateColocation({ ...base, serviceLevel: "enterprise" });
        expect(e.monthlyIdr).toBe(49500000);
        expect(e.serviceQuoteRequired).toBe(true);
    });

    it("primary + DR duplicates only the requested servers", () => {
        const all = calculateColocation({ ...base, quantity: 2, siteMode: "dr", drScope: "all" });
        expect(all.monthlyIdr).toBe(198000000);
        expect(all.estimatedRackCount).toBe(2);
        const some = calculateColocation({ ...base, quantity: 4, siteMode: "dr", drScope: "count", drCount: 1 });
        expect(some.pricedServers).toBe(5);
        const custom = calculateColocation({ ...base, quantity: 4, siteMode: "dr", drScope: "custom" });
        expect(custom.pricedServers).toBe(4);
        expect(custom.drNote).toBe("custom");
    });

    it("GPU fabric checkbox never prices a fake network", () => {
        const r = calculateColocation({ ...base, gpuFabric: true });
        expect(r.fabricQuoteRequired).toBe(true);
        expect(r.monthlyIdr).toBe(49500000);
    });

    it("custom server: standard below 5 kW, high density above, review above 10 kW", () => {
        const std = calculateColocation({ ...base, presetId: "custom", custom: { rackU: 2, powerWatts: 800 } });
        expect(std.highDensity).toBe(false);
        expect(std.monthlyIdr).toBe(2040000 + 3 * 420000);
        expect(std.setupIdr).toBe(660000);
        const hd = calculateColocation({ ...base, presetId: "custom", custom: { rackU: 6, powerWatts: 7000 } });
        expect(hd.highDensity).toBe(true);
        expect(hd.engineeringReview).toBe(false);
        expect(hd.monthlyIdr).toBe(6 * 420000 + 7 * 3000000 + 2400000);
        const rev = calculateColocation({ ...base, presetId: "custom", custom: { rackU: 10, powerWatts: 12000 } });
        expect(rev.engineeringReview).toBe(true);
        expect(rev.setupIdr).toBe(6000000);
    });
});
