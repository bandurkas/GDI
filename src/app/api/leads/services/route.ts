import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BUDGET_BANDS, SERVICE_INTERESTS, TIMELINE_OPTIONS, getPackage } from "@/lib/services/config";

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const oneOf = <T extends readonly string[]>(list: T, v: unknown): T[number] | null => (list as readonly string[]).includes(String(v)) ? (v as T[number]) : null;

// POST /api/leads/services — public request form from the AI services page.
export async function POST(req: Request) {
    let body: any;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const name = str(body.name, 120);
    const company = str(body.company, 160);
    const email = str(body.email, 160).toLowerCase();
    const phone = str(body.phone, 60);
    const interest = oneOf(SERVICE_INTERESTS, body.interest);
    if (!name || !company || !email || !phone || !interest) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (str(body.website)) return NextResponse.json({ ok: true }); // honeypot

    const packageId = getPackage(str(body.packageId, 40))?.id ?? null;

    try {
        const lead = await prisma.serviceLead.create({
            data: {
                name, company, email, phone, interest, packageId,
                budget: oneOf(BUDGET_BANDS, body.budget),
                timeline: oneOf(TIMELINE_OPTIONS, body.timeline),
                message: str(body.message, 3000) || null,
                pageUrl: str(body.pageUrl, 500) || null,
                utmSource: str(body.utm_source, 100) || null,
                utmMedium: str(body.utm_medium, 100) || null,
                utmCampaign: str(body.utm_campaign, 100) || null,
            },
        });
        return NextResponse.json({ ok: true, id: lead.id });
    } catch (e) {
        console.error("Service lead error:", e);
        return NextResponse.json({ error: "Could not save request" }, { status: 500 });
    }
}
