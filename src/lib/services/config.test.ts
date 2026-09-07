import { describe, it, expect } from "vitest";
import { SERVICE_PACKAGES, PACKAGE_NAMES, recommendPackage, getPackage, SERVICE_INTERESTS, BUDGET_BANDS, TIMELINE_OPTIONS } from "./config";
import { servicesContent } from "./content";

describe("service packages config", () => {
    it("has four packages with ascending market prices", () => {
        expect(SERVICE_PACKAGES.map((p) => p.id)).toEqual(["start-ai", "middle-scale", "automation-platform", "ent-assistant"]);
        const prices = SERVICE_PACKAGES.map((p) => p.priceIdr);
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
        expect(prices).toEqual([19500000, 45000000, 120000000, 150000000]);
        for (const p of SERVICE_PACKAGES) expect(p.priceIdr % 500000).toBe(0);
    });

    it("every package has a name and sane delivery/support figures", () => {
        for (const p of SERVICE_PACKAGES) {
            expect(PACKAGE_NAMES[p.id].length).toBeGreaterThan(3);
            expect(p.durationDays[0]).toBeLessThanOrEqual(p.durationDays[1]);
            expect(p.customerHours[0]).toBeLessThanOrEqual(p.customerHours[1]);
            expect(p.supportDays).toBeGreaterThan(0);
            if (p.nextId) expect(getPackage(p.nextId)).toBeDefined();
        }
        expect(SERVICE_PACKAGES.filter((p) => p.featured)).toHaveLength(1);
    });

    it("recommends by stage and system count", () => {
        expect(recommendPackage("unsure", "3-5")).toBe("start-ai");
        expect(recommendPackage("one-process", "0-1")).toBe("middle-scale");
        expect(recommendPackage("one-process", "2")).toBe("middle-scale");
        expect(recommendPackage("one-process", "3-5")).toBe("automation-platform");
        expect(recommendPackage("department", "0-1")).toBe("automation-platform");
        expect(recommendPackage("knowledge", "not-sure")).toBe("ent-assistant");
    });
});

describe("service content", () => {
    const langs = Object.keys(servicesContent) as Array<keyof typeof servicesContent>;

    it("covers every package, interest, budget and timeline in every language", () => {
        for (const lang of langs) {
            const c = servicesContent[lang];
            for (const p of SERVICE_PACKAGES) {
                const copy = c.packages[p.id];
                expect(copy.whatWeDo.length).toBeGreaterThanOrEqual(4);
                expect(copy.deliverables.length).toBeGreaterThanOrEqual(3);
                expect(copy.timeline.length).toBeGreaterThanOrEqual(3);
                expect(copy.notIncluded.length).toBeGreaterThanOrEqual(1);
                expect(c.compare.results[p.id]).toBeTruthy();
                expect(c.finder.why[p.id]).toBeTruthy();
            }
            for (const k of SERVICE_INTERESTS) expect(c.lead.interests[k]).toBeTruthy();
            for (const k of BUDGET_BANDS) expect(c.lead.budgets[k]).toBeTruthy();
            for (const k of TIMELINE_OPTIONS) expect(c.lead.timelines[k]).toBeTruthy();
            expect(c.process.steps).toHaveLength(5);
        }
    });

    it("contains no fabricated performance claims", () => {
        const text = JSON.stringify(servicesContent);
        expect(text).not.toMatch(/99\.9|uptime|Stripe|money-back|SOC ?2/i);
    });
});
