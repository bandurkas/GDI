"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Info, AlertTriangle, Cpu, Server, HardDrive, Sparkles } from "lucide-react";
import type { ColocationContent } from "@/lib/colocation/content";
import { BANDWIDTH_OPTIONS, COLOCATION_PRESETS, COLOCATION_PRICING, CONTRACT_TERMS, CUSTOM_PRESET_ID, SERVER_OPS_PLANS, getPreset, opsMonthlyIdr, type ContractTerm, type OpsPlanId } from "@/lib/colocation/config";
import { calculateColocation, formatIdr, formatPower, formatUsd, type CalcInput } from "@/lib/colocation/calc";
import { track } from "@/lib/colocation/analytics";
import { LeadForm } from "./LeadForm";
import { RackViz } from "./RackViz";

export const PRESET_EVENT = "gdi:colocation-preset";

interface Props { content: ColocationContent }

const selectCls = "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const inputCls = "w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2";

function Tip({ text }: { text: string }) {
    return (
        <span className="inline-flex align-middle ml-1 text-slate-400 hover:text-indigo-400 cursor-help" title={text} tabIndex={0} aria-label={text}>
            <Info size={13} />
        </span>
    );
}

const presetIcon = (category: string) =>
    category === "extreme-gpu" ? <Sparkles size={16} /> : category === "gpu" ? <Cpu size={16} /> : category === "standard-high-power" ? <HardDrive size={16} /> : <Server size={16} />;

export function ColocationCalculator({ content }: Props) {
    const C = content.calculator;
    const [presetId, setPresetId] = useState("standard-1u");
    const [quantity, setQuantity] = useState(1);
    const [qtyText, setQtyText] = useState("1");
    const [contractMonths, setContractMonths] = useState<ContractTerm>(12);
    const [bandwidthId, setBandwidthId] = useState("basic");
    const [gpuFabric, setGpuFabric] = useState(false);
    const [siteMode, setSiteMode] = useState<CalcInput["siteMode"]>("single");
    const [drScope, setDrScope] = useState<CalcInput["drScope"]>("all");
    const [drCount, setDrCount] = useState(1);
    const [serviceLevel, setServiceLevel] = useState<CalcInput["serviceLevel"]>("core");
    const [opsPlan, setOpsPlan] = useState<OpsPlanId>("none");
    const [powerOverride, setPowerOverride] = useState("");
    const [custom, setCustom] = useState({ rackU: "2", powerWatts: "800", psuCount: "", dualFeed: false, depthMm: "", weightKg: "", ports: "", specialCooling: false, notes: "", hardwareValue: "" });
    const [leadOpen, setLeadOpen] = useState(false);
    const started = useRef(false);
    const lastTier = useRef("none");

    const input: CalcInput = useMemo(() => ({
        presetId, quantity, contractMonths, bandwidthId, gpuFabric, siteMode, drScope, drCount, serviceLevel, opsPlan,
        powerWattsOverride: Number(powerOverride) || undefined,
        custom: presetId === CUSTOM_PRESET_ID ? {
            rackU: Number(custom.rackU) || 1, powerWatts: Number(custom.powerWatts) || 0,
            psuCount: Number(custom.psuCount) || undefined, dualFeed: custom.dualFeed, depthMm: Number(custom.depthMm) || undefined,
            weightKg: Number(custom.weightKg) || undefined, ports: Number(custom.ports) || undefined, specialCooling: custom.specialCooling, notes: custom.notes || undefined,
            hardwareValueIdr: Number(custom.hardwareValue) || undefined,
        } : undefined,
    }), [presetId, quantity, contractMonths, bandwidthId, gpuFabric, siteMode, drScope, drCount, serviceLevel, opsPlan, powerOverride, custom]);

    const result = useMemo(() => calculateColocation(input), [input]);
    const preset = getPreset(presetId);
    const isStandard = preset && (preset.category === "standard" || preset.category === "standard-high-power");
    const isGpu = result.highDensity;

    const markStarted = () => { if (!started.current) { started.current = true; track("colocation_calculator_started"); } };

    const choosePreset = (id: string) => {
        markStarted();
        setPresetId(id);
        setPowerOverride("");
        track("colocation_server_type_selected", { server_type: id });
        if (id === "dgx-b200") track("colocation_b200_selected");
        if (id === "dgx-b300") track("colocation_b300_selected");
    };

    const commitQty = (q: number) => {
        markStarted();
        const v = Math.min(Math.max(Math.floor(q) || 1, 1), COLOCATION_PRICING.maxQuantity);
        setQuantity(v);
        setQtyText(String(q > COLOCATION_PRICING.maxQuantity ? q : v));
        track("colocation_quantity_changed", { server_type: presetId, quantity: v });
    };

    useEffect(() => {
        if (result.enterpriseTier !== "none" && result.enterpriseTier !== lastTier.current) {
            track("colocation_enterprise_threshold_reached", { server_type: presetId, quantity: result.quantity, enterprise_tier: result.enterpriseTier });
        }
        lastTier.current = result.enterpriseTier;
    }, [result.enterpriseTier, presetId, result.quantity]);

    useEffect(() => {
        track("colocation_page_view");
        const onPreset = (e: Event) => {
            const id = (e as CustomEvent<string>).detail;
            if (id === "ops") { setOpsPlan((cur) => (cur === "none" ? "standard" : cur)); return; }
            if (id) choosePreset(id);
        };
        window.addEventListener(PRESET_EVENT, onPreset);
        const fromQuery = new URLSearchParams(window.location.search).get("preset");
        if (fromQuery && (getPreset(fromQuery) || fromQuery === CUSTOM_PRESET_ID)) setPresetId(fromQuery);
        return () => window.removeEventListener(PRESET_EVENT, onPreset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const overMax = Number(qtyText) > COLOCATION_PRICING.maxQuantity;
    const serverTypeLabel = presetId === CUSTOM_PRESET_ID ? `${content.categories.custom.title} (${result.rackUPerServer}U, ${result.powerKwPerServer} kW)` : preset?.name ?? presetId;
    const bwLabel = (id: string) => {
        const b = BANDWIDTH_OPTIONS.find((x) => x.id === id)!;
        if (b.scope === "basic") return C.bandwidth.basic;
        if (b.scope === "custom") return C.bandwidth.custom;
        const size = b.mbps! >= 1000 ? `${b.mbps! / 1000} Gbps` : `${b.mbps} Mbps`;
        return `${b.scope === "domestic" ? C.bandwidth.domestic : C.bandwidth.international} ${size} ${C.bandwidth.dedicated}`;
    };
    const tier = result.enterpriseTier !== "none" ? C.tiers[result.enterpriseTier] : null;
    const enterpriseCta = result.enterpriseQuoteRequired;

    const openLead = () => {
        track("colocation_quote_clicked", { server_type: presetId, quantity: result.quantity, power_kw: result.totalPowerKw, monthly_estimate: result.monthlyIdr, contract_term: result.contractMonths, enterprise_tier: result.enterpriseTier });
        setLeadOpen(true);
    };

    const Row = ({ label, value, tip }: { label: string; value: React.ReactNode; tip?: string }) => (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-0.5">{label}{tip && <Tip text={tip} />}</span>
            <span className="text-sm font-bold text-white text-right tabular-nums font-mono">{value}</span>
        </div>
    );

    return (
        <section id="calculator" className="scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">{C.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{C.intro}</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* ── Configure ── */}
                <div className="lg:col-span-3 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{C.configure}</h3>

                    {/* Step 1 — server type */}
                    <div>
                        <label className={labelCls}>{C.serverType}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={C.serverType}>
                            {[...COLOCATION_PRESETS.map((p) => ({ id: p.id, name: p.name, category: p.category, badge: p.badge })), { id: CUSTOM_PRESET_ID, name: content.categories.custom.title, category: "custom", badge: undefined }].map((p) => {
                                const active = presetId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        onClick={() => choosePreset(p.id)}
                                        className={`relative text-left p-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${active ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm" : "border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 bg-slate-50/50 dark:bg-white/5"}`}
                                    >
                                        <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide ${active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-400"}`}>
                                            {presetIcon(p.category)}
                                            {p.badge && <span className="ml-auto px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] tracking-wider">{content.categories.badges[p.badge]}</span>}
                                        </div>
                                        <div className={`mt-1.5 text-sm font-bold leading-tight ${active ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"}`}>{p.name}</div>
                                    </button>
                                );
                            })}
                        </div>
                        {preset?.note && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{content.categories.presets[preset.id]?.note ?? preset.note}</p>}
                    </div>

                    {/* Standard power override */}
                    {isStandard && (
                        <div>
                            <label className={labelCls} htmlFor="calc-power">{C.powerOverride}<Tip text={C.tooltips.kw} /></label>
                            <input id="calc-power" type="number" min={0} step={10} inputMode="numeric" className={inputCls} value={powerOverride} onChange={(e) => { markStarted(); setPowerOverride(e.target.value); }} placeholder={`${Math.round((preset!.includedPowerKw ?? preset!.pricingPowerKw) * 1000)}`} />
                            <p className="mt-1.5 text-xs text-slate-400">{C.powerOverrideHint}</p>
                        </div>
                    )}

                    {/* Custom server */}
                    {presetId === CUSTOM_PRESET_ID && (
                        <div className="grid sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                            <div><label className={labelCls} htmlFor="c-u">{C.customFields.rackU}<Tip text={C.tooltips.u} /></label><input id="c-u" type="number" min={1} max={42} inputMode="numeric" className={inputCls} value={custom.rackU} onChange={(e) => setCustom({ ...custom, rackU: e.target.value })} /></div>
                            <div><label className={labelCls} htmlFor="c-w">{C.customFields.powerWatts}<Tip text={C.tooltips.kw} /></label><input id="c-w" type="number" min={0} step={50} inputMode="numeric" className={inputCls} value={custom.powerWatts} onChange={(e) => setCustom({ ...custom, powerWatts: e.target.value })} /></div>
                            <div><label className={labelCls} htmlFor="c-psu">{C.customFields.psuCount}</label><input id="c-psu" type="number" min={1} inputMode="numeric" className={inputCls} value={custom.psuCount} onChange={(e) => setCustom({ ...custom, psuCount: e.target.value })} /></div>
                            <div><label className={labelCls} htmlFor="c-depth">{C.customFields.depthMm}</label><input id="c-depth" type="number" min={0} inputMode="numeric" className={inputCls} value={custom.depthMm} onChange={(e) => setCustom({ ...custom, depthMm: e.target.value })} /></div>
                            <div><label className={labelCls} htmlFor="c-kg">{C.customFields.weightKg}</label><input id="c-kg" type="number" min={0} inputMode="numeric" className={inputCls} value={custom.weightKg} onChange={(e) => setCustom({ ...custom, weightKg: e.target.value })} /></div>
                            <div><label className={labelCls} htmlFor="c-ports">{C.customFields.ports}</label><input id="c-ports" type="number" min={0} inputMode="numeric" className={inputCls} value={custom.ports} onChange={(e) => setCustom({ ...custom, ports: e.target.value })} /></div>
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={custom.dualFeed} onChange={(e) => setCustom({ ...custom, dualFeed: e.target.checked })} />{C.customFields.dualFeed}</label>
                            <label className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={custom.specialCooling} onChange={(e) => setCustom({ ...custom, specialCooling: e.target.checked })} />{C.customFields.specialCooling}</label>
                            <div className="sm:col-span-2"><label className={labelCls} htmlFor="c-notes">{C.customFields.notes}</label><input id="c-notes" className={inputCls} value={custom.notes} onChange={(e) => setCustom({ ...custom, notes: e.target.value })} /></div>
                            <div className="sm:col-span-2">
                                <label className={labelCls} htmlFor="c-hw">{content.serverOps.calc.customValue}</label>
                                <input id="c-hw" type="number" min={0} step={1000000} inputMode="numeric" className={inputCls} value={custom.hardwareValue} onChange={(e) => setCustom({ ...custom, hardwareValue: e.target.value })} placeholder={String(result.hardwareValueIdr)} />
                                <p className="mt-1.5 text-xs text-slate-400">{content.serverOps.calc.customValueHint}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — quantity + Step 3 — contract */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className={labelCls} htmlFor="calc-qty">{C.quantity}</label>
                            <div className="flex items-stretch">
                                <button type="button" aria-label="-" onClick={() => commitQty(quantity - 1)} className="px-4 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><Minus size={16} /></button>
                                <input id="calc-qty" type="number" min={1} max={COLOCATION_PRICING.maxQuantity} inputMode="numeric" className="w-full text-center px-2 py-3 border-y border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 tabular-nums" value={qtyText} onChange={(e) => setQtyText(e.target.value)} onBlur={() => commitQty(Number(qtyText))} onKeyDown={(e) => { if (e.key === "Enter") commitQty(Number(qtyText)); }} />
                                <button type="button" aria-label="+" onClick={() => commitQty(quantity + 1)} className="px-4 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"><Plus size={16} /></button>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-400">{overMax || result.overMaxQuantity ? C.moreThanMax : C.quantityHint}</p>
                        </div>
                        <div>
                            <label className={labelCls} htmlFor="calc-term">{C.contract}</label>
                            <select id="calc-term" className={selectCls} value={contractMonths} onChange={(e) => { markStarted(); setContractMonths(Number(e.target.value) as ContractTerm); }}>
                                {CONTRACT_TERMS.map((t) => <option key={t} value={t}>{t === 24 ? "24+" : t} {t === 1 ? C.month : C.months}</option>)}
                            </select>
                            {contractMonths >= 6 && <p className="mt-1.5 text-xs text-slate-400">{C.longTerm}</p>}
                        </div>
                    </div>

                    {/* Step 4 — connectivity */}
                    <div>
                        <label className={labelCls} htmlFor="calc-bw">{C.connectivity}<Tip text={C.tooltips.crossConnect} /></label>
                        <select id="calc-bw" className={selectCls} value={bandwidthId} onChange={(e) => { markStarted(); setBandwidthId(e.target.value); }}>
                            {BANDWIDTH_OPTIONS.map((b) => <option key={b.id} value={b.id}>{bwLabel(b.id)}{b.monthlyIdr ? ` — ${formatIdr(b.monthlyIdr)} (${formatUsd(b.monthlyIdr)})` : ""}</option>)}
                        </select>
                        {isGpu && (
                            <label className="mt-3 flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-indigo-600" checked={gpuFabric} onChange={(e) => setGpuFabric(e.target.checked)} />
                                <span>{C.fabric}{gpuFabric && <span className="block text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">{C.fabricNote}</span>}</span>
                            </label>
                        )}
                    </div>

                    {/* Step 5 — multi-site */}
                    <div>
                        <label className={labelCls} htmlFor="calc-site">{C.site}</label>
                        <select id="calc-site" className={selectCls} value={siteMode} onChange={(e) => { markStarted(); setSiteMode(e.target.value as CalcInput["siteMode"]); }}>
                            <option value="single">{C.siteOptions.single}</option>
                            <option value="dr">{C.siteOptions.dr}</option>
                            <option value="recommend">{C.siteOptions.recommend}</option>
                        </select>
                        {siteMode === "dr" && (
                            <div className="mt-3 grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls} htmlFor="calc-dr">{C.drScope}</label>
                                    <select id="calc-dr" className={selectCls} value={drScope} onChange={(e) => setDrScope(e.target.value as CalcInput["drScope"])}>
                                        <option value="all">{C.drScopeOptions.all}</option>
                                        <option value="count">{C.drScopeOptions.count}</option>
                                        <option value="custom">{C.drScopeOptions.custom}</option>
                                    </select>
                                </div>
                                {drScope === "count" && (
                                    <div><label className={labelCls} htmlFor="calc-drn">{C.drCount}</label><input id="calc-drn" type="number" min={0} max={quantity} inputMode="numeric" className={inputCls} value={drCount} onChange={(e) => setDrCount(Number(e.target.value) || 0)} /></div>
                                )}
                                {drScope === "custom" && <p className="text-xs text-slate-500 dark:text-slate-400 self-end pb-3">{C.drCustomNote}</p>}
                            </div>
                        )}
                        {siteMode === "recommend" && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{C.drRecommendNote}</p>}
                    </div>

                    {/* Step 6 — service level */}
                    <div>
                        <label className={labelCls}>{C.serviceLevel}<Tip text={C.tooltips.remoteHands} /></label>
                        <div className="grid gap-2" role="radiogroup" aria-label={C.serviceLevel}>
                            {(["core", "remote", "enterprise"] as const).map((lvl) => {
                                const s = C.service[lvl]; const active = serviceLevel === lvl;
                                return (
                                    <button key={lvl} type="button" role="radio" aria-checked={active} onClick={() => { markStarted(); setServiceLevel(lvl); }} className={`text-left p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${active ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-white/10 hover:border-indigo-300 bg-slate-50/50 dark:bg-white/5"}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</span>
                                            <span className={`text-xs font-bold ${active ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"}`}>{s.price}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.items.join(" · ")}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 7 — managed server operations */}
                    <div>
                        <label className={labelCls}>{content.serverOps.calc.label}</label>
                        <div className="grid gap-2" role="radiogroup" aria-label={content.serverOps.calc.label}>
                            {[{ id: "none" as OpsPlanId, name: content.serverOps.calc.none, price: "", items: [] as string[] }, ...SERVER_OPS_PLANS.filter((pl) => (isGpu ? pl.gpuOnly : !pl.gpuOnly)).map((pl) => ({ id: pl.id as OpsPlanId, name: content.serverOps.plans[pl.id].name, price: `+ ${formatIdr(opsMonthlyIdr(pl, result.hardwareValueIdr))} (${formatUsd(opsMonthlyIdr(pl, result.hardwareValueIdr))}) ${isGpu ? content.serverOps.perNodeMonth : content.serverOps.perServerMonth}`, items: [content.serverOps.coverage[pl.coverage], pl.includedHours ? `${pl.includedHours} ${content.serverOps.hours}` : "", `${pl.responseMinutes} min ${content.serverOps.response}`].filter(Boolean) }))].map((o) => {
                                const checked = o.id === "none" ? result.opsPlan === "none" : result.opsPlan === o.id;
                                return (
                                    <button key={o.id} type="button" role="radio" aria-checked={checked} onClick={() => { markStarted(); setOpsPlan(o.id); }} className={`text-left p-4 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${checked ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-white/10 hover:border-indigo-300 bg-slate-50/50 dark:bg-white/5"}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{o.name}</span>
                                            {o.price && <span className={`text-xs font-bold text-right ${checked ? "text-indigo-700 dark:text-indigo-300" : "text-slate-500"}`}>{o.price}</span>}
                                        </div>
                                        {o.items.length > 0 && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{o.items.join(" · ")}</p>}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{content.serverOps.calc.hint}</p>
                        {result.opsVolumeReview && <p className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">{content.serverOps.calc.volumeReview}</p>}
                    </div>
                </div>

                {/* ── Estimate ── */}
                <div className="lg:col-span-2 min-w-0 lg:sticky lg:top-24">
                    <div className="bg-slate-900 dark:bg-black text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/20 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="relative">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4">{C.estimate}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{C.result.monthly}</p>
                            <p key={result.monthlyIdr} className="mt-1 text-3xl sm:text-4xl font-black tracking-tight tabular-nums break-words gdi-pop">{formatIdr(result.monthlyIdr)}<span className="text-base font-bold text-slate-400 ml-2">{C.result.perMonth}</span></p>
                            <p className="mt-1 font-mono text-sm text-indigo-300">{formatUsd(result.monthlyIdr)} {C.result.perMonth}</p>

                            <div className="mt-6 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                                <RackViz
                                    rackUPerServer={result.rackUPerServer}
                                    powerKwPerServer={result.powerKwPerServer}
                                    servers={result.pricedServers}
                                    racks={result.estimatedRackCount}
                                    usableU={COLOCATION_PRICING.usableRackU}
                                    systemsPerRack={preset?.systemsPerRackDefault}
                                    highDensity={result.highDensity}
                                    labels={{ rack: C.result.racks, perRack: C.rackViz.perRack, standardBand: C.rackViz.standard, highDensityBand: C.rackViz.highDensity, serversPerRack: C.rackViz.serversPerRack }}
                                />
                            </div>

                            <div className="mt-6 divide-y divide-white/5">
                                <Row label={C.result.profile} value={serverTypeLabel} />
                                <Row label={C.result.quantity} value={<>{result.quantity}{result.pricedServers !== result.quantity && <span className="block text-[10px] text-slate-400 font-medium">+{result.pricedServers - result.quantity} {C.result.drSuffix}</span>}</>} />
                                <Row label={C.result.rackSpace} value={`${result.totalRackU}U`} tip={C.tooltips.u} />
                                <Row label={C.result.power} value={<>{formatPower(result.totalPowerKw)}{result.displayPowerKwPerServer !== result.powerKwPerServer && <span className="block text-[10px] text-slate-400 font-medium">~{result.displayPowerKwPerServer} kW / {content.categories.typicalPower}</span>}</>} tip={C.tooltips.kw} />
                                <Row label={C.result.racks} value={result.estimatedRackCount} />
                                <Row label={C.result.facility} value={C.facility[result.facility]} />
                                <Row label={C.result.setup} value={<>{formatIdr(result.setupIdr)}<span className="block text-[10px] text-slate-400 font-medium">{formatUsd(result.setupIdr)}</span></>} />
                                <Row label={C.result.connectivity} value={result.bandwidthQuoteRequired || result.fabricQuoteRequired ? C.result.quoteRequired : result.bandwidthMonthlyIdr ? formatIdr(result.bandwidthMonthlyIdr) : C.result.included} />
                                <Row label={C.result.service} value={result.serviceQuoteRequired ? C.result.quoteRequired : result.serviceMonthlyIdr ? formatIdr(result.serviceMonthlyIdr) : C.result.included} />
                                {result.opsPlan !== "none" && <Row label={content.serverOps.calc.resultRow} value={<>{formatIdr(result.opsMonthlyIdr)}<span className="block text-[10px] text-slate-400 font-medium">{formatUsd(result.opsMonthlyIdr)} · {content.serverOps.plans[result.opsPlan].name}</span></>} />}
                                {result.opsPlan !== "none" && <Row label={content.serverOps.calc.hardwareValue} value={<>{formatIdr(result.hardwareValueIdr)}<span className="block text-[10px] text-slate-400 font-medium">{formatUsd(result.hardwareValueIdr)}{result.hardwareValueAssumed ? ` · ${content.serverOps.calc.assumed}` : ""}</span></>} />}
                                <Row label={`${C.result.contractTotal} ${result.contractMonths} ${C.months}`} value={<>{formatIdr(result.contractTotalIdr)}<span className="block text-[10px] text-slate-400 font-medium">{formatUsd(result.contractTotalIdr)}</span></>} />
                                <Row label={C.result.finalQuote} value={<span className={result.engineeringReview ? "text-amber-300" : "text-emerald-300"}>{result.engineeringReview ? C.result.validation : C.result.standardQuote}</span>} />
                            </div>

                            {tier && (
                                <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300"><AlertTriangle size={14} />{tier.title}</div>
                                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">{tier.desc}</p>
                                </div>
                            )}
                            {result.engineeringReview && presetId === CUSTOM_PRESET_ID && <p className="mt-3 text-xs text-amber-300 font-bold">{C.result.engineering}</p>}

                            <div className="mt-6 flex flex-col gap-3">
                                <button type="button" onClick={openLead} className="w-full py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-black transition-colors shadow-lg shadow-indigo-500/30">
                                    {enterpriseCta ? C.ctaEnterprise : C.ctaQuote}
                                </button>
                                <button type="button" onClick={openLead} className="w-full py-3 rounded-full border border-white/20 hover:border-white text-white font-bold transition-colors text-sm">
                                    {C.ctaSend}
                                </button>
                            </div>
                            <p className="mt-4 text-[11px] text-slate-500 leading-snug">{C.planningNote}</p>
                        </div>
                    </div>
                </div>
            </div>

            {leadOpen && (
                <LeadForm content={content} input={input} result={result} serverTypeLabel={serverTypeLabel} bandwidthLabel={bwLabel(bandwidthId)} onClose={() => setLeadOpen(false)} />
            )}
        </section>
    );
}
