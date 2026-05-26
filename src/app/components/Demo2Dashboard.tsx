import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import {
  Plus, Sparkles, ChevronDown, Filter, Download, Eye, CircleDot, Info,
} from "lucide-react";
import { AppHeader, AppSidebar } from "./AppShell";
import { VehicleRow, ColHeader, type Row } from "./shared/VehicleRow";
import { FilterChip } from "./shared/FilterChip";
import { MiniBars } from "./shared/KpiCards";
import { KpiCounter } from "./shared/KpiCounter";
import { ScoreGauge } from "./ScoreGauge";

export type BucketKey = "raw" | "nophoto" | "unsyndicated" | "aging";

export interface BucketState {
  count: number;
  /** Resolved by an earlier scene */
  completed: boolean;
}

export interface Demo2DashboardProps {
  dtf: number;
  score: number;
  buckets: Record<BucketKey, BucketState>;
  activeBucket: BucketKey | null;
  onBucketClick: (b: BucketKey) => void;
  onClearBucket: () => void;
  rows: Row[];
  /** IDs of rows to spotlight (per-scene focus). */
  highlightIds: Set<number>;
  /** IDs of rows currently animating through a transformation (shimmer overlay). */
  transformingIds: Set<number>;
  onNavigate?: (label: string) => void;
}

function Tab({ label, count, active }: { label: string; count?: number; active?: boolean }) {
  return (
    <button
      type="button"
      className={`relative pb-[10px] pt-[2px] text-[13px] font-['Inter:Semi_Bold',sans-serif] transition-colors ${
        active ? "text-[#4600F2] font-semibold" : "text-black/55 hover:text-[#0a0a0a] font-medium"
      }`}
    >
      <span className="inline-flex items-center gap-[6px]">
        {label}
        {typeof count === "number" && (
          <span
            className={`text-[11px] px-[6px] py-[1px] rounded-full font-semibold ${
              active ? "bg-[rgba(70,0,242,0.1)] text-[#4600F2]" : "bg-black/5 text-black/55"
            }`}
          >
            {count}
          </span>
        )}
      </span>
      {active && (
        <span className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] rounded-full bg-[#4600F2]" />
      )}
    </button>
  );
}

function shortBucketLabel(b: BucketKey): string {
  switch (b) {
    case "raw":          return "Raw media";
    case "nophoto":      return "No photos";
    case "unsyndicated": return "Not syndicated";
    case "aging":        return "Aging";
  }
}

// Verbal status descriptors so the AE can read the KPI at a glance instead of
// translating raw numbers. Thresholds match the ScoreGauge's banded gradient
// (red 0-5, amber 5-8, green 8-10) and the holding-cost target of ≤ 7 days.
function scoreStatus(score: number): { label: string; color: string; bg: string } {
  if (score < 5)  return { label: "Critical",        color: "#B91C1C", bg: "rgba(239,68,68,0.12)" };
  if (score < 8)  return { label: "Needs attention", color: "#92400E", bg: "rgba(245,158,11,0.14)" };
  return            { label: "Healthy",          color: "#047857", bg: "rgba(16,185,129,0.14)" };
}

function dtfStatus(dtf: number): { label: string; color: string; bg: string } {
  if (dtf > 10)   return { label: "Too slow",        color: "#B91C1C", bg: "rgba(239,68,68,0.12)" };
  if (dtf > 6)    return { label: "Behind target",   color: "#92400E", bg: "rgba(245,158,11,0.14)" };
  return            { label: "On target",        color: "#047857", bg: "rgba(16,185,129,0.14)" };
}

function barsFor(value: number, max: number, higherBetter = false): number[] {
  const ratio = Math.min(1, Math.max(0, value / max));
  const skew = higherBetter ? ratio : 1 - ratio;
  const base = 30 + skew * 55;
  return Array.from({ length: 8 }, (_, i) => {
    const wobble = ((i * 17) % 10) - 5;
    return Math.max(20, Math.min(95, Math.round(base + wobble)));
  });
}

export function Demo2Dashboard({
  dtf, score, buckets, activeBucket, onBucketClick, onClearBucket,
  rows, highlightIds, transformingIds, onNavigate,
}: Demo2DashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-fade]");
    if (!items.length) return;
    gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  }, []);

  // ── GSAP transformation cascade ──────────────────────────────────────────
  // Total runtime ≈ 1.5s — designed to finish just before the 1.6s state-swap in
  // Demo2.tsx so the new badges pop the moment the cascade settles.
  //   1. Cascade — each row turns purple top-to-bottom (stagger 0.10s, max 1s)
  //   2. Quad-pulse — every row breathes together (4 yoyo cycles)
  //   3. Settle — clears to a faint tint, then clearProps so CSS takes over
  useEffect(() => {
    if (transformingIds.size === 0) return;
    const tbody = tbodyRef.current;
    if (!tbody) return;
    const rows = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>('tr[data-transforming="true"]')
    );
    if (rows.length === 0) return;

    const tl = gsap.timeline();

    tl.fromTo(
      rows,
      { backgroundColor: "rgba(70,0,242,0.04)" },
      {
        backgroundColor: "rgba(70,0,242,0.34)",
        duration: 0.34,
        stagger: 0.10,
        ease: "power2.out",
      }
    );

    tl.to(rows, {
      backgroundColor: "rgba(70,0,242,0.52)",
      duration: 0.18,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 3,
    });

    tl.to(rows, {
      backgroundColor: "rgba(70,0,242,0.10)",
      duration: 0.30,
      ease: "power2.out",
    });
    tl.set(rows, { clearProps: "backgroundColor" });

    return () => {
      tl.kill();
      gsap.set(rows, { clearProps: "backgroundColor" });
    };
  }, [transformingIds]);

  const scoreColor = score >= 8 ? "#10B981" : score >= 6 ? "#F59E0B" : "#EF4444";
  const dtfColor = dtf <= 6 ? "#10B981" : dtf <= 10 ? "#F59E0B" : "#EF4444";
  const dtfBars = useMemo(() => barsFor(dtf, 14), [dtf]);

  return (
    <div className="bg-white flex flex-col size-full">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar active="Studio AI" onNavigate={onNavigate} />
        <div ref={containerRef} className="flex-1 bg-[#f9fafb] overflow-auto">
          <div className="px-[28px] py-[20px] min-w-[1100px]">
            {/* Page header */}
            <div data-fade className="flex items-start justify-between mb-[16px]">
              <div>
                <h1 className="text-[24px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-tight">
                  New Vehicle Inventory
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-[2px] font-['Inter:Regular',sans-serif]">
                  Diagnosed from your IMS scan
                </p>
              </div>
              <div className="flex items-center gap-[10px]">
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-black/10 rounded-[8px] text-[12px] font-medium text-[#374151] hover:bg-gray-50 font-['Inter:Medium',sans-serif]">
                  Holding Cost: <span className="text-[#4600f2] font-semibold">$45/day</span>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-[#4600F2] rounded-[8px] text-[12px] font-semibold text-[#4600F2] hover:bg-[rgba(70,0,242,0.04)] font-['Inter:Semi_Bold',sans-serif]">
                  <Sparkles size={13} />
                  Create SmartCampaign
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-[#4600F2] rounded-[8px] text-[12px] font-semibold text-white hover:bg-[#3a00d0] font-['Inter:Semi_Bold',sans-serif]">
                  <Plus size={14} strokeWidth={2.5} />
                  Add New Inventory
                </button>
              </div>
            </div>

            {/* Tabs row */}
            <div data-fade className="flex items-end justify-between border-b border-black/8 mb-[18px]">
              <div className="flex items-center gap-[24px] -mb-[1px]">
                <Tab label="All vehicles" />
                <Tab label="New Vehicles" count={234} active />
                <Tab label="Pre-owned Vehicles" count={108} />
              </div>
              <div className="flex items-center gap-[6px] pb-[10px]">
                <span className="size-[6px] rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-[11px] text-[#0a0a0a] font-semibold font-['Inter:Semi_Bold',sans-serif]">
                  Last Synced:
                </span>
                <span className="text-[11px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
                  Today, 6:35 PM
                </span>
              </div>
            </div>

            {/* Persistent KPI bar — Days to Frontline + half-donut Inventory Score.
                Cards are tight: label row, then a single data row right under it. */}
            <div data-fade className="flex gap-[14px] mb-[16px]">
              {/* ── Days to Frontline ───────────────────────────────────── */}
              <div className="flex-1 rounded-[14px] border border-black/8 bg-white px-[18px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
                <div className="flex items-center gap-[6px]">
                  <span className="size-[8px] rounded-full bg-[#4600F2]" />
                  <p className="text-[12px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.3px]">
                    Days to Frontline
                  </p>
                  <button
                    type="button"
                    title="Average days from IMS arrival to a vehicle being fully listed and live. Lower is better — target ≤ 6 days."
                    className="ml-auto size-[18px] rounded-full hover:bg-black/5 flex items-center justify-center text-black/40"
                    aria-label="About Days to Frontline"
                  >
                    <Info size={13} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-[10px] mt-auto pt-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <span
                      className="text-[40px] font-bold font-['Inter:Bold',sans-serif] leading-none"
                      style={{ color: dtfColor }}
                    >
                      <KpiCounter value={dtf} />
                    </span>
                    <span className="text-[14px] text-black/55 font-medium">days</span>
                    {(() => {
                      const s = dtfStatus(dtf);
                      return (
                        <span
                          className="ml-[8px] inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full text-[10px] font-bold uppercase tracking-[0.5px] font-['Inter:Bold',sans-serif]"
                          style={{ color: s.color, background: s.bg }}
                        >
                          <span className="size-[6px] rounded-full" style={{ background: s.color }} />
                          {s.label}
                        </span>
                      );
                    })()}
                  </div>
                  <MiniBars heights={dtfBars} color={dtfColor} />
                </div>
              </div>

              {/* ── Inventory Score (half-donut gauge on the LEFT) ─────── */}
              <div className="flex-1 rounded-[14px] border border-black/8 bg-white px-[18px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
                <div className="flex items-center gap-[6px]">
                  <span className="size-[8px] rounded-full bg-[#10B981]" />
                  <p className="text-[12px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.3px]">
                    Inventory Score
                  </p>
                  <button
                    type="button"
                    title="Composite health score (0-10) of media completeness, syndication coverage, and inventory ageing. ≥ 8 is healthy."
                    className="ml-auto size-[18px] rounded-full hover:bg-black/5 flex items-center justify-center text-black/40"
                    aria-label="About Inventory Score"
                  >
                    <Info size={13} strokeWidth={2.2} />
                  </button>
                </div>
                <div className="flex items-center gap-[12px] mt-auto pt-[4px]">
                  <div className="-my-[6px] shrink-0">
                    <ScoreGauge
                      score={score}
                      max={10}
                      width={110}
                      scoreColor={scoreColor}
                      animateKey={score}
                      compact
                    />
                  </div>
                  {(() => {
                    const s = scoreStatus(score);
                    return (
                      <span
                        className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full text-[10px] font-bold uppercase tracking-[0.5px] font-['Inter:Bold',sans-serif]"
                        style={{ color: s.color, background: s.bg }}
                      >
                        <span className="size-[6px] rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Filter chips — diagnostic buckets now live in the floating FAB above */}
            <div data-fade className="flex items-center justify-between mb-[12px]">
              <div className="flex items-center gap-[8px] flex-wrap">
                <FilterChip
                  label="All"
                  count={rows.length}
                  active={activeBucket === null}
                  onClick={onClearBucket}
                />
                {(["raw","nophoto","unsyndicated","aging"] as BucketKey[]).map((k) => (
                  <FilterChip
                    key={k}
                    label={shortBucketLabel(k)}
                    count={buckets[k].count}
                    active={activeBucket === k}
                    onClick={() => onBucketClick(k)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-[8px]">
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Eye size={13} /> View Input
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Download size={13} /> Export
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Filter size={13} /> Filters
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <CircleDot size={13} /> Sold
                </button>
              </div>
            </div>

            {/* Vehicle table */}
            <div data-fade className="bg-white rounded-[14px] border border-black/8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 bg-[#F4F0FF]">
                    <th className="pl-4 pr-2 py-3 w-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#4600f2]" />
                    </th>
                    <ColHeader label="Vehicle" />
                    <ColHeader label="Age" />
                    <ColHeader label="Media" />
                    <ColHeader label="Media Score" />
                    <ColHeader label="Publishing" />
                    <ColHeader label="Days to Frontline" />
                    <ColHeader label="Hold. Cost" />
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-[40px] text-center text-[13px] text-black/45">
                        No vehicles in this view.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <VehicleRow
                        key={r.id}
                        row={r}
                        published={[]}
                        selected={false}
                        onToggle={() => {}}
                        spotlit={highlightIds.has(r.id) || transformingIds.has(r.id)}
                        transforming={transformingIds.has(r.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
