"use client";

// Live rack visualisation: fills rack slots with the selected servers and shows power per rack
// against the standard / high-density bands. Pure SVG, no library.

interface Props {
    rackUPerServer: number;
    powerKwPerServer: number;
    servers: number;
    racks: number;
    usableU: number;
    systemsPerRack?: number;
    highDensity: boolean;
    labels: { rack: string; perRack: string; standardBand: string; highDensityBand: string; serversPerRack: string };
}

const STANDARD_RACK_KW = 6;   // typical standard-density rack allowance shown as reference band
const HIGH_DENSITY_KW = 60;   // top of the scale for the power gauge

export function RackViz({ rackUPerServer, powerKwPerServer, servers, racks, usableU, systemsPerRack, highDensity, labels }: Props) {
    const shownRacks = Math.min(racks, 4);
    const perRackCap = systemsPerRack && highDensity ? systemsPerRack : Math.max(1, Math.floor(usableU / rackUPerServer));
    const perRack = Math.min(servers, perRackCap);
    const rackKw = Math.round(perRack * powerKwPerServer * 10) / 10;
    const gauge = Math.min(1, rackKw / HIGH_DENSITY_KW);
    const stdMark = STANDARD_RACK_KW / HIGH_DENSITY_KW;

    const W = 34, H = 120, GAP = 10, PAD = 2;
    const slotH = (H - PAD * 2) / usableU;
    const usedU = perRack * rackUPerServer;

    return (
        <div className="flex items-end gap-5">
            <svg width={shownRacks * (W + GAP)} height={H + 18} viewBox={`0 0 ${shownRacks * (W + GAP)} ${H + 18}`} role="img" aria-label={`${racks} ${labels.rack}, ${rackKw} kW ${labels.perRack}`} className="shrink-0">
                {Array.from({ length: shownRacks }).map((_, r) => {
                    const x = r * (W + GAP);
                    const isLast = r === shownRacks - 1;
                    const remaining = servers - perRack * r;
                    const fillServers = Math.max(0, Math.min(perRack, remaining));
                    const fillU = fillServers * rackUPerServer;
                    return (
                        <g key={r}>
                            <rect x={x} y={0} width={W} height={H} rx={3} className="fill-white/5 stroke-white/20" strokeWidth={1} />
                            {Array.from({ length: usableU }).map((_, u) => (
                                <line key={u} x1={x + 3} x2={x + W - 3} y1={PAD + u * slotH} y2={PAD + u * slotH} className="stroke-white/10" strokeWidth={0.5} />
                            ))}
                            {Array.from({ length: fillServers }).map((_, s) => {
                                const y = H - PAD - (s + 1) * rackUPerServer * slotH;
                                return (
                                    <rect key={s} x={x + 3} y={y + 0.6} width={W - 6} height={rackUPerServer * slotH - 1.2} rx={1}
                                        className={highDensity ? "fill-amber-400/90" : "fill-indigo-400/90"}
                                        style={{ transition: "all .25s ease-out" }} />
                                );
                            })}
                            {isLast && racks > shownRacks && (
                                <text x={x + W / 2} y={H + 14} textAnchor="middle" className="fill-slate-400" fontSize={9} fontFamily="ui-monospace, monospace">+{racks - shownRacks}</text>
                            )}
                            {!(isLast && racks > shownRacks) && (
                                <text x={x + W / 2} y={H + 14} textAnchor="middle" className="fill-slate-500" fontSize={9} fontFamily="ui-monospace, monospace">{fillU}U</text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <span>{labels.perRack}</span>
                    <span className={highDensity ? "text-amber-300" : "text-indigo-300"}>{rackKw} kW</span>
                </div>
                <div className="relative mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`absolute inset-y-0 left-0 rounded-full ${highDensity ? "bg-amber-400" : "bg-indigo-400"}`} style={{ width: `${Math.max(2, gauge * 100)}%`, transition: "width .3s ease-out" }} />
                    <div className="absolute inset-y-0 w-px bg-white/60" style={{ left: `${stdMark * 100}%` }} aria-hidden="true" />
                </div>
                <div className="relative mt-1.5 h-4 text-[9px] font-mono text-slate-500">
                    <span className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${stdMark * 100}%` }}>{STANDARD_RACK_KW} kW · {labels.standardBand}</span>
                    <span className="absolute right-0">{HIGH_DENSITY_KW} kW · {labels.highDensityBand}</span>
                </div>
                <p className="mt-3 text-[10px] font-mono text-slate-500">{usedU}/{usableU}U · {perRack} {labels.serversPerRack}</p>
            </div>
        </div>
    );
}
