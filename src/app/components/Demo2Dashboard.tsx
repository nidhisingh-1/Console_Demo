import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { MIcon } from "./shared/MIcon";
import { AppHeader, AppSidebar } from "./AppShell";
import { VehicleRow, ColHeader, type Row } from "./shared/VehicleRow";
import { MiniBars } from "./shared/KpiCards";
import { KpiCounter } from "./shared/KpiCounter";
import { KpiDelta } from "./shared/KpiDelta";
import { ScoreGauge } from "./ScoreGauge";

export type BucketKey = "raw" | "nophoto" | "cgi" | "unsyndicated" | "aging";
/** Dashboard filter key — buckets + age-threshold sub-filters. */
export type FilterKey = BucketKey | "age45" | "age60";

export interface BucketState {
  count: number;
  /** Resolved by an earlier scene */
  completed: boolean;
}

export interface Demo2DashboardProps {
  dtf: number;
  score: number;
  /** Total holding cost still accruing on open issues — decreases as buckets resolve. */
  holdingCost: number;
  /** Persistent delta versus the previous resolved bucket (post-transformation) */
  dtfUplift: number;        // positive when DTF dropped
  scoreUplift: number;      // positive when score rose
  holdingCostDrop: number;  // positive when holding cost dropped this step
  buckets: Record<BucketKey, BucketState>;
  /** Multi-select: any number of filter chips may be active at once. */
  activeFilters: Set<FilterKey>;
  /** Used by the FAB — opens the pitch panel too. */
  onBucketClick: (b: BucketKey) => void;
  /** Used by the on-dashboard filter chips — toggles f in activeFilters. */
  onFilterChange: (f: FilterKey | null) => void;
  onClearBucket: () => void;
  rows: Row[];
  /** IDs of rows to spotlight (per-scene focus). */
  highlightIds: Set<number>;
  /** IDs of rows currently animating through a transformation (shimmer overlay). */
  transformingIds: Set<number>;
  /** Currently-selected vehicle IDs (drives the SelectionActionBar count). */
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onNavigate?: (label: string) => void;
}

function Tab({ label, count, active, onClick }: {
  label: string; count?: number; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-[10px] pt-[2px] text-[16px] font-['Inter:Semi_Bold',sans-serif] transition-colors ${
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

export type VehicleTypeTab = "all" | "new" | "preowned";

/** Small green "+1.1" / "−2d" / "+$8,600" indicator shown next to a KPI's
 *  current value to make the latest-step uplift unmistakable. */
function UpliftBadge({ text }: { text: string }) {
  return (
    <span
      className="ml-[6px] inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[10px] font-bold uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif] text-[#047857] bg-[rgba(16,185,129,0.14)]"
      title="Uplift since the previous step"
    >
      ↑ {text}
    </span>
  );
}

interface FilterCardDef {
  key: FilterKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  /** True for bucket filters (drive the buckets count badge); false for age filters. */
  isBucket: boolean;
}

const FILTER_CARDS: FilterCardDef[] = [
  { key: "nophoto",      label: "No Photos",      icon: <MIcon name="image_not_supported" size={18} />, color: "#EF4444", isBucket: true },
  { key: "raw",          label: "Raw Photos",     icon: <MIcon name="camera_alt" size={18} />,          color: "#F59E0B", isBucket: true },
  { key: "cgi",          label: "CGI Photos",     icon: <MIcon name="auto_fix_high" size={18} />,       color: "#7C3AED", isBucket: true },
  { key: "unsyndicated", label: "Not Syndicated", icon: <MIcon name="send" size={18} />,                color: "#4600F2", isBucket: true },
  // "Aging Units" chip removed — the age-threshold chips below cover it.
  { key: "age45",        label: ">45+ Days",      icon: <MIcon name="warning" size={18} />,             color: "#DC2626", isBucket: false },
  { key: "age60",        label: ">60+ Days",      icon: <MIcon name="warning" size={18} />,             color: "#B91C1C", isBucket: false },
];

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
  dtf, score, holdingCost, dtfUplift, scoreUplift, holdingCostDrop,
  buckets, activeFilters, onBucketClick, onFilterChange, onClearBucket,
  rows, highlightIds, transformingIds,
  selectedIds, onToggleSelect, onNavigate,
}: Demo2DashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const [vehicleType, setVehicleType] = useState<VehicleTypeTab>("new");

  // Tabs filter by the explicit vehicleType field; aging on the lot does
  // *not* make a vehicle pre-owned — it can still be a new unit racking up
  // holding cost. Rows default to "new" when the field is omitted.
  const filteredByType = useMemo(() => {
    if (vehicleType === "all") return rows;
    return rows.filter((r) => (r.vehicleType ?? "new") === vehicleType);
  }, [rows, vehicleType]);

  const newCount = rows.filter((r) => (r.vehicleType ?? "new") === "new").length;
  const preownedCount = rows.filter((r) => r.vehicleType === "preowned").length;

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
  // ── Filter-change animation ─────────────────────────────────────────────
  // When the active bucket changes, the visible rows fade-in with a stagger
  // and the active filter card pops with a small bounce. This makes the
  // filter feel like it's actively being applied rather than just toggling.
  useEffect(() => {
    const tbody = tbodyRef.current;
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr"));
      if (rows.length) {
        gsap.fromTo(
          rows,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, stagger: 0.035, ease: "power3.out" }
        );
      }
    }
    if (activeFilters.size > 0) {
      // Pulse only the most-recently-toggled chip (the last data-active one)
      const actives = document.querySelectorAll<HTMLElement>(
        `[data-filter-card][data-active="true"]`
      );
      const last = actives[actives.length - 1];
      if (last) {
        gsap.fromTo(last,
          { scale: 1 },
          { scale: 1.04, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1 }
        );
      }
    }
  }, [activeFilters]);

  useEffect(() => {
    if (transformingIds.size === 0) return;
    const tbody = tbodyRef.current;
    if (!tbody) return;
    const rows = Array.from(
      tbody.querySelectorAll<HTMLTableRowElement>('tr[data-transforming="true"]')
    );
    if (rows.length === 0) return;

    const tl = gsap.timeline();

    // Mint / teal wash — softer than the brand purple and reads as "processing"
    // instead of paint-the-row. Total runtime targets ~3.0s to match the new
    // overlay window.
    tl.fromTo(
      rows,
      { backgroundColor: "rgba(16,185,129,0.05)" },
      {
        backgroundColor: "rgba(16,185,129,0.22)",
        duration: 0.55,
        stagger: 0.12,
        ease: "power2.out",
      }
    );

    tl.to(rows, {
      backgroundColor: "rgba(16,185,129,0.32)",
      duration: 0.22,
      ease: "sine.inOut",
      yoyo: true,
      repeat: 5,
    });

    tl.to(rows, {
      backgroundColor: "rgba(16,185,129,0.10)",
      duration: 0.45,
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
                  Active Inventory
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-[2px] font-['Inter:Regular',sans-serif]">
                  Diagnosed from your IMS scan
                </p>
              </div>
              <div className="flex items-center gap-[10px]">
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-black/10 rounded-[8px] text-[12px] font-medium text-[#374151] hover:bg-gray-50 font-['Inter:Medium',sans-serif]">
                  Holding Cost: <span className="text-[#4600f2] font-semibold">$45/day</span>
                  <MIcon name="expand_more" size={16} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-[#4600F2] rounded-[8px] text-[12px] font-semibold text-[#4600F2] hover:bg-[rgba(70,0,242,0.04)] font-['Inter:Semi_Bold',sans-serif]">
                  <MIcon name="auto_awesome" size={15} />
                  Create SmartCampaign
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-[#4600F2] rounded-[8px] text-[12px] font-semibold text-white hover:bg-[#3a00d0] font-['Inter:Semi_Bold',sans-serif]">
                  <MIcon name="add" size={16} weight={500} />
                  Add New Inventory
                </button>
              </div>
            </div>

            {/* Tabs row */}
            <div data-fade className="flex items-end justify-between border-b border-black/8 mb-[28px]">
              <div className="flex items-center gap-[24px] -mb-[1px]">
                <Tab
                  label="All vehicles"
                  count={rows.length}
                  active={vehicleType === "all"}
                  onClick={() => setVehicleType("all")}
                />
                <Tab
                  label="New Vehicles"
                  count={newCount}
                  active={vehicleType === "new"}
                  onClick={() => setVehicleType("new")}
                />
                <Tab
                  label="Pre-owned Vehicles"
                  count={preownedCount}
                  active={vehicleType === "preowned"}
                  onClick={() => setVehicleType("preowned")}
                />
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

            {/* KPI bar — DTF, Inventory Score, Holding Cost. Each card carries:
                ▸ a label + info icon on the top row
                ▸ the main figure + persistent uplift indicator on the bottom-left
                ▸ a status pill (Critical / Needs attention / Healthy) on the bottom-right */}
            <div data-fade className="flex gap-[14px] mb-[28px]">
              {/* ── 1. Days to Frontline ─────────────────────────────────── */}
              <div className="relative flex-1 rounded-[14px] border border-black/8 bg-white px-[18px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
                <KpiDelta value={dtf} direction="down-good" suffix=" d" />
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
                    <MIcon name="info" size={15} />
                  </button>
                </div>
                <div className="flex items-end justify-between gap-[10px] mt-auto pt-[10px]">
                  <div className="flex items-baseline gap-[6px]">
                    <span
                      className="text-[40px] font-bold font-['Inter:Bold',sans-serif] leading-none"
                      style={{ color: dtfColor }}
                    >
                      <KpiCounter value={dtf} />
                    </span>
                    <span className="text-[14px] text-black/55 font-medium">days</span>
                    {dtfUplift > 0 && (
                      <UpliftBadge text={`−${dtfUplift}d`} />
                    )}
                  </div>
                  {(() => {
                    const s = dtfStatus(dtf);
                    return (
                      <span
                        className="inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-full text-[10px] font-bold uppercase tracking-[0.5px] font-['Inter:Bold',sans-serif]"
                        style={{ color: s.color, background: s.bg }}
                      >
                        <span className="size-[6px] rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* ── 2. Inventory Score (half-donut gauge on the LEFT) ──── */}
              <div className="relative flex-1 rounded-[14px] border border-black/8 bg-white px-[18px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
                <KpiDelta value={score} direction="up-good" decimals={1} />
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
                    <MIcon name="info" size={15} />
                  </button>
                </div>
                <div className="flex items-end justify-between gap-[12px] mt-auto pt-[4px]">
                  <div className="flex items-center gap-[8px]">
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
                    {scoreUplift > 0 && (
                      <UpliftBadge text={`+${scoreUplift.toFixed(1)}`} />
                    )}
                  </div>
                  {(() => {
                    const s = scoreStatus(score);
                    return (
                      <span
                        className="inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-full text-[10px] font-bold uppercase tracking-[0.5px] font-['Inter:Bold',sans-serif]"
                        style={{ color: s.color, background: s.bg }}
                      >
                        <span className="size-[6px] rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* ── 3. Holding Cost (total accruing — decreases as buckets resolve) ── */}
              {(() => {
                const hcStatus = holdingCost > 35_000
                  ? { label: "High risk",     color: "#B91C1C", bg: "rgba(239,68,68,0.12)",  dot: "#B91C1C" }
                  : holdingCost > 15_000
                  ? { label: "Reducing",      color: "#92400E", bg: "rgba(245,158,11,0.14)", dot: "#D97706" }
                  : { label: "Under control", color: "#047857", bg: "rgba(16,185,129,0.14)", dot: "#047857" };
                const hcColor = holdingCost > 35_000 ? "#EF4444" : holdingCost > 15_000 ? "#D97706" : "#059669";
                return (
                  <div className="relative flex-1 rounded-[14px] border border-black/8 bg-white px-[18px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
                    <KpiDelta value={holdingCost} direction="down-good" decimals={0} />
                    <div className="flex items-center gap-[6px]">
                      <span className="size-[8px] rounded-full" style={{ background: hcColor }} />
                      <p className="text-[12px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.3px]">
                        Holding Cost
                      </p>
                      <button
                        type="button"
                        title="Total holding cost accruing on vehicles with open issues. Drops as each bucket is resolved."
                        className="ml-auto size-[18px] rounded-full hover:bg-black/5 flex items-center justify-center text-black/40"
                        aria-label="About Holding Cost"
                      >
                        <MIcon name="info" size={15} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between gap-[10px] mt-auto pt-[10px]">
                      <div className="flex items-baseline gap-[6px]">
                        <span
                          className="text-[20px] font-bold font-['Inter:Bold',sans-serif] leading-none"
                          style={{ color: hcColor }}
                        >$</span>
                        <span
                          className="text-[40px] font-bold font-['Inter:Bold',sans-serif] leading-none"
                          style={{ color: hcColor }}
                        >
                          <KpiCounter value={holdingCost} format={(n) => Math.round(n).toLocaleString()} />
                        </span>
                        {holdingCostDrop > 0 && (
                          <UpliftBadge text={`−$${Math.round(holdingCostDrop).toLocaleString()}`} />
                        )}
                      </div>
                      <span
                        className="inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-full text-[10px] font-bold uppercase tracking-[0.5px] font-['Inter:Bold',sans-serif]"
                        style={{ color: hcStatus.color, background: hcStatus.bg }}
                      >
                        <span className="size-[6px] rounded-full" style={{ background: hcStatus.dot }} />
                        {hcStatus.label}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Compact filter row — 5 mini bucket pills on the left,
                utility buttons (View Input / Export / Filters / Sold) right-aligned. */}
            <div data-fade className="flex items-center justify-between gap-[12px] mb-[14px]">
              <div className="flex items-center gap-[8px] flex-wrap">
                {FILTER_CARDS.map((f) => {
                  const isBucket = f.isBucket;
                  const isActive = activeFilters.has(f.key);
                  // Bucket chip: count from buckets prop + completed state.
                  // Age chip: count of rows whose age clears the threshold.
                  const bucketState = isBucket ? buckets[f.key as BucketKey] : undefined;
                  const isDone = isBucket && bucketState ? bucketState.completed : false;
                  const count = isBucket
                    ? (bucketState ? bucketState.count : 0)
                    : rows.filter((r) => r.age >= (f.key === "age45" ? 45 : 60)).length;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      data-filter-card
                      data-active={isActive ? "true" : undefined}
                      onClick={() => onFilterChange(isActive ? null : f.key)}
                      className={`relative inline-flex items-center gap-[7px] h-[34px] pl-[8px] pr-[12px] rounded-full border transition-all ${
                        isActive
                          ? "bg-[#311083] border-[#311083]"
                          : "bg-white border-black/8 hover:border-black/15 hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                      }`}
                    >
                      <span
                        className="shrink-0 flex"
                        style={{
                          color: isActive ? "#ffffff" : (isDone ? "#059669" : f.color),
                        }}
                      >
                        <span className="scale-[0.78] flex">{f.icon}</span>
                      </span>
                      <span
                        className={`text-[11.5px] font-semibold font-['Inter:Semi_Bold',sans-serif] whitespace-nowrap ${
                          isActive ? "text-white" : "text-[#0a0a0a]"
                        }`}
                      >
                        {f.label}
                      </span>
                      <span
                        className="text-[11px] font-bold font-['Inter:Bold',sans-serif] px-[6px] py-[1px] rounded-full whitespace-nowrap"
                        style={{
                          background: isActive
                            ? "rgba(255,255,255,0.20)"
                            : "rgba(0,0,0,0.05)",
                          color: isActive ? "#ffffff" : (isDone ? "#059669" : "#0a0a0a"),
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-[6px] shrink-0">
                <button className="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] bg-white border border-black/10 text-[11.5px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <MIcon name="visibility" size={14} /> View Input
                </button>
                <button className="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] bg-white border border-black/10 text-[11.5px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <MIcon name="download" size={14} /> Export
                </button>
                <button className="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] bg-white border border-black/10 text-[11.5px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <MIcon name="filter_alt" size={14} /> Filters
                </button>
                <button className="inline-flex items-center gap-[5px] h-[30px] px-[10px] rounded-[8px] bg-white border border-black/10 text-[11.5px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <MIcon name="radio_button_unchecked" size={14} /> Sold
                </button>
              </div>
            </div>

            {/* Vehicle table */}
            <div data-fade className="bg-white rounded-[14px] border border-black/8 overflow-clip shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#F3F4F6]">
                  <tr className="border-b border-black/8 bg-[#F3F4F6]">
                    <th className="pl-4 pr-2 py-3 w-10 border-r border-black/5">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#4600f2]" />
                    </th>
                    <ColHeader label="Vehicle" />
                    <ColHeader label="Age" />
                    <ColHeader label="Media" />
                    <ColHeader label="Media Score" />
                    <ColHeader label="Publishing" />
                    <ColHeader label="Last Published" />
                    <ColHeader label="Days to Frontline" />
                    <ColHeader label="Hold. Cost" last />
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {filteredByType.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-[40px] text-center text-[13px] text-black/45">
                        No vehicles in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredByType.map((r) => (
                      <VehicleRow
                        key={r.id}
                        row={r}
                        published={[]}
                        selected={selectedIds.has(r.id)}
                        onToggle={() => onToggleSelect(r.id)}
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
