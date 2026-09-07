import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateColocation, type CalcInput } from "@/lib/colocation/calc";
import { getPreset, CUSTOM_PRESET_ID } from "@/lib/colocation/config";

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/leads/colocation — public lead capture with calculator snapshot.
// The estimate is recalculated server-side from the calculator input so the stored numbers cannot be tampered with.
export async function POST(req: Request) {
    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const name = str(body.name, 120);
    const company = str(body.company, 160);
    const email = str(body.email, 160).toLowerCase();
    const phone = str(body.phone, 60);
    if (!name || !company || !email || !phone) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (str(body.website)) return NextResponse.json({ ok: true }); // honeypot

    const calc: Partial<CalcInput> = body.calculator ?? {};
    const presetId = str(calc.presetId, 40) || "standard-1u";
    if (presetId !== CUSTOM_PRESET_ID && !getPreset(presetId)) {
        return NextResponse.json({ error: "Unknown server type" }, { status: 400 });
    }
    const result = calculateColocation({
        presetId,
        quantity: Number(calc.quantity) || 1,
        contractMonths: ([1, 3, 6, 12, 24].includes(Number(calc.contractMonths)) ? Number(calc.contractMonths) : 1) as CalcInput["contractMonths"],
        bandwidthId: str(calc.bandwidthId, 20) || "basic",
        gpuFabric: !!calc.gpuFabric,
        siteMode: (["single", "dr", "recommend"].includes(String(calc.siteMode)) ? calc.siteMode : "single") as CalcInput["siteMode"],
        drScope: (["all", "count", "custom"].includes(String(calc.drScope)) ? calc.drScope : "all") as CalcInput["drScope"],
        drCount: Number(calc.drCount) || 0,
        serviceLevel: (["core", "remote", "enterprise"].includes(String(calc.serviceLevel)) ? calc.serviceLevel : "core") as CalcInput["serviceLevel"],
        powerWattsOverride: Number(calc.powerWattsOverride) || undefined,
        custom: calc.custom && typeof calc.custom === "object"
            ? { rackU: Number(calc.custom.rackU) || 1, powerWatts: Number(calc.custom.powerWatts) || 0, notes: str(calc.custom.notes, 300) || undefined }
            : undefined,
    });

    const serverType = presetId === CUSTOM_PRESET_ID
        ? `Custom ${result.rackUPerServer}U / ${result.powerKwPerServer} kW`
        : getPreset(presetId)!.name;

    try {
        const lead = await prisma.colocationLead.create({
            data: {
                name, company, email, phone,
                presetId,
                serverType,
                quantity: result.quantity,
                contractTerm: result.contractMonths,
                deploymentDate: str(body.deploymentDate, 60) || null,
                currentLocation: str(body.currentLocation, 160) || null,
                needReceiving: str(body.needReceiving, 20) || null,
                connectivity: str(body.connectivity, 200) || null,
                gpuFabric: str(body.gpuFabric, 20) || null,
                siteMode: str(body.siteMode, 40) || null,
                notes: str(body.notes, 2000) || null,
                monthlyEstimateIdr: result.monthlyIdr,
                setupEstimateIdr: result.setupIdr,
                totalRackU: result.totalRackU,
                totalPowerKw: result.totalPowerKw,
                estimatedRackCount: result.estimatedRackCount,
                selectedBandwidth: str(calc.bandwidthId, 20) || null,
                serviceLevel: str(calc.serviceLevel, 20) || null,
                engineeringReview: result.engineeringReview,
                enterpriseTier: result.enterpriseTier === "none" ? null : result.enterpriseTier,
                technical: body.technical && typeof body.technical === "object" ? body.technical : undefined,
                pageUrl: str(body.pageUrl, 500) || null,
                utmSource: str(body.utm_source, 100) || null,
                utmMedium: str(body.utm_medium, 100) || null,
                utmCampaign: str(body.utm_campaign, 100) || null,
            },
            select: { id: true },
        });
        return NextResponse.json({ ok: true, id: lead.id });
    } catch (error: any) {
        console.error("[API] colocation lead error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
