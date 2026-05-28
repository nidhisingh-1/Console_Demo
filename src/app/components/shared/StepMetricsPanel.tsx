import { forwardRef, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { DollarSign, Activity, Zap } from "lucide-react";
import { calcOpportunity, type DemoConfig } from "../../types/demoConfig";

// Light green palette used for metric boxes
const METRIC_BOX_BG = "#ECFDF5";

// ── Constants (mirrored from Demo2.tsx — keep in sync) ───────────────────────
const SCORE_STEPS = [4.2, 5.3, 6.4, 7.5, 8.4, 9.1];
const HC_STEPS    = [52_500, 48_200, 43_600, 37_300, 27_900, 10_000];
const DTF_STEPS   = [14, 12, 10, 8, 6, 5];

// VINs processed by each non-aging step (proportional to 200-unit seed inventory)
// raw=89, nophoto=23, cgi=134 (from BUCKET_TOTALS in Demo2.tsx)
const PHOTO_VINS_PER_STEP = [89, 23, 134];

// Step-specific TTM "after" targets (see docs/METRICS_AND_DEALER_INPUTS.md §4.3)
// nophoto: 0d — SmartMatch is instant, no photographer visit needed
// cgi:     1d — CGI processing SLA
// raw:     no override — use dealer-scaled fleet avg (dtf[afterIdx])
const TTM_AFTER_OVERRIDE: Partial<Record<StepBucketKey, number>> = {
  nophoto: 0,
  cgi: 1,
};

export type StepBucketKey = "raw" | "nophoto" | "cgi" | "unsyndicated" | "aging";
const BUCKET_ORDER: StepBucketKey[] = ["raw", "nophoto", "cgi", "unsyndicated", "aging"];

// ── Scaling helpers ───────────────────────────────────────────────────────────
function scaledHC(cfg: DemoConfig): number[] {
  const s = Math.max(0.2, (cfg.holdingCostPerDay * cfg.monthlySalesVolume) / (46 * 100));
  return HC_STEPS.map(v => Math.round(v * s));
}

function scaledDTF(cfg: DemoConfig): number[] {
  const { currentDaysToFrontline } = calcOpportunity(cfg);
  const shift = currentDaysToFrontline - DTF_STEPS[0];
  return DTF_STEPS.map((v, i) =>
    i === 0 ? currentDaysToFrontline : Math.max(1, v + shift)
  );
}

function fmtK(v: number): string {
  return v >= 1_000 ? `$${(v / 1_000).toFixed(1)}K` : `$${v.toLocaleString()}`;
}

// ── GraphSection ──────────────────────────────────────────────────────────────
interface GraphSectionProps {
  title: string;
  beforeDisplay: string;
  afterDisplay: string;
  deltaDisplay: string;
  deltaColor: string;
  deltaBg: string;
  startPct: number;
  endPct: number;
  afterBarRef: React.RefObject<HTMLDivElement | null>;
  deltaRef: React.RefObject<HTMLDivElement | null>;
  afterBarGradient: string;
  isZeroAfter?: boolean;
  zeroLabel?: string;
}

function GraphSection({
  title,
  beforeDisplay,
  afterDisplay,
  deltaDisplay,
  deltaColor,
  deltaBg,
  startPct,
  endPct: _endPct,
  afterBarRef,
  deltaRef,
  afterBarGradient,
  isZeroAfter,
  zeroLabel = "Instant",
}: GraphSectionProps) {
  return (
    <div className="mb-[20px]">
      {/* Title + animated delta badge */}
      <div className="flex items-center justify-between mb-[10px]">
        <p className="text-[11px] font-semibold uppercase tracking-[1.2px] text-black/50 font-['Inter',sans-serif]">
          {title}
        </p>
        <div
          ref={deltaRef}
          className="inline-flex items-center px-[8px] py-[3px] rounded-full text-[10px] font-bold font-['Inter',sans-serif]"
          style={{ background: deltaBg, color: deltaColor, opacity: 0 }}
        >
          {deltaDisplay}
        </div>
      </div>

      {/* Before bar */}
      <div className="flex items-center gap-[10px] mb-[6px]">
        <div className="flex-1 h-[20px] rounded-[6px] relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(244,63,94,0.28) 0%, rgba(244,63,94,0.12) 100%)" }}
          />
          <span className="absolute left-[10px] inset-y-0 flex items-center text-[8.5px] font-semibold uppercase tracking-[0.8px] text-black/35 font-['Inter',sans-serif] select-none">
            Before
          </span>
        </div>
        <span className="w-[46px] text-right text-[12px] font-semibold text-black/45 tabular-nums font-['Inter',sans-serif]">
          {beforeDisplay}
        </span>
      </div>

      {/* After bar */}
      <div className="flex items-center gap-[10px]">
        <div className="flex-1 h-[20px] rounded-[6px] relative overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
          <div
            ref={afterBarRef}
            className="absolute inset-y-0 left-0 rounded-[6px]"
            style={{ background: afterBarGradient, width: `${startPct}%` }}
          />
          {!isZeroAfter && (
            <span className="absolute left-[10px] inset-y-0 flex items-center text-[8.5px] font-semibold uppercase tracking-[0.8px] text-white/85 font-['Inter',sans-serif] select-none z-[1]">
              After
            </span>
          )}
          {isZeroAfter && (
            <div className="absolute inset-0 flex items-center justify-center z-[1]">
              <span className="text-[11px] font-bold text-[#059669] font-['Inter',sans-serif]">
                {zeroLabel}
              </span>
            </div>
          )}
        </div>
        <span
          className="w-[46px] text-right text-[12px] font-semibold tabular-nums font-['Inter',sans-serif]"
          style={{ color: deltaColor }}
        >
          {afterDisplay}
        </span>
      </div>
    </div>
  );
}

// ── MetricBox ─────────────────────────────────────────────────────────────────
interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  delta: React.ReactNode;
  sub: string;
  accent: string;
}

const MetricBox = forwardRef<HTMLDivElement, MetricBoxProps>(
  ({ icon, label, delta, sub, accent }, ref) => (
    <div
      ref={ref}
      className="flex-1 rounded-[12px] p-[13px] flex flex-col"
      style={{ background: METRIC_BOX_BG }}
    >
      <span
        className="size-[22px] rounded-[6px] flex items-center justify-center mb-[9px]"
        style={{ background: `${accent}20`, color: accent }}
      >
        {icon}
      </span>
      <p className="text-[20px] font-bold text-[#0a0a0a] leading-none tabular-nums font-['Inter',sans-serif]">
        {delta}
      </p>
      <p className="mt-[5px] text-[8px] font-semibold uppercase tracking-[0.6px] text-black/40 font-['Inter',sans-serif]">
        {label}
      </p>
      <p className="mt-[2px] text-[9px] text-black/40 leading-snug font-['Inter',sans-serif]">
        {sub}
      </p>
    </div>
  )
);
MetricBox.displayName = "MetricBox";

// ── Main export ───────────────────────────────────────────────────────────────
export interface StepMetricsPanelProps {
  bucketKey: StepBucketKey;
  completedSteps: number;
  demoConfig: DemoConfig;
  accent: string;
  successMode?: boolean;
}

export function StepMetricsPanel({
  bucketKey,
  completedSteps: _completedSteps,
  demoConfig,
  accent,
  successMode: _successMode = false,
}: StepMetricsPanelProps) {
  const bucketIdx = BUCKET_ORDER.indexOf(bucketKey);
  // Step 5 metrics (aging) are supported. Step 4 still handled separately.
  if (bucketKey === "unsyndicated") return null;

  const opp = calcOpportunity(demoConfig);
  const hc = scaledHC(demoConfig);
  const dtf = scaledDTF(demoConfig);

  const afterIdx = bucketIdx + 1;

  // ── Step 5 (aging) view values (also used for animation) ────────────────────
  const isAging = bucketKey === "aging";
  const agingTargetUnits = useMemo(() => Math.round(demoConfig.totalInventory * 0.10), [demoConfig.totalInventory]);
  const agingUnitsBefore = opp.agedVehicles;
  const agingUnitsAfter  = agingTargetUnits;
  const agingUnitsDelta  = agingUnitsBefore - agingUnitsAfter;

  const agingCostBefore = opp.agedMonthly;
  // Reduce cost proportionally with aged cohort shrinking from 15% → 10%
  const agingCostAfter = Math.round(agingCostBefore * (10 / 15));
  const agingCostDelta = agingCostBefore - agingCostAfter;

  const agingStartPct = agingUnitsBefore > 0 ? 100 : 0;
  const agingEndPct   = agingUnitsBefore > 0 ? Math.max(4, (agingUnitsAfter / agingUnitsBefore) * 100) : 4;
  const agingCostStartPct = agingCostBefore > 0 ? 100 : 0;
  const agingCostEndPct   = agingCostBefore > 0 ? Math.max(4, (agingCostAfter / agingCostBefore) * 100) : 4;

  // Score values for step 5
  const scoreBeforeAging = SCORE_STEPS[4];
  const scoreAfterAging  = SCORE_STEPS[5];
  const scoreDeltaAging  = +(scoreAfterAging - scoreBeforeAging).toFixed(1);

  // ── TTM values ───────────────────────────────────────────────────────────────
  // Before: dealer's original baseline — fixed across all steps
  // Start:  previous step's After value — where animation begins
  // After:  this step's target — where animation ends
  const ttmBaseline  = dtf[0];
  const ttmPrevAfter = dtf[bucketIdx];
  const ttmAfter     = TTM_AFTER_OVERRIDE[bucketKey] ?? dtf[afterIdx];
  const ttmDelta     = ttmBaseline - ttmAfter;
  const isZeroTTM    = ttmAfter === 0;

  const ttmStartPct = ttmBaseline > 0 ? (ttmPrevAfter / ttmBaseline) * 100 : 100;
  const ttmEndPct   = ttmBaseline > 0 ? (ttmAfter / ttmBaseline) * 100 : 0;

  // ── HC values ────────────────────────────────────────────────────────────────
  const hcBaseline  = hc[0];
  const hcPrevAfter = hc[bucketIdx];
  const hcAfter     = hc[afterIdx];
  const hcDelta     = hcPrevAfter - hcAfter; // recovered THIS step

  const hcStartPct = hcBaseline > 0 ? (hcPrevAfter / hcBaseline) * 100 : 100;
  const hcEndPct   = hcBaseline > 0 ? Math.max(4, (hcAfter / hcBaseline) * 100) : 4;

  // ── Photography cost (Graph 3, steps 1-3) ────────────────────────────────────
  // Before: static = totalInventory × perVinCost (baseline dealer spend)
  // After:  remaining VINs × perVinCost — reduces as each step processes VINs
  const photoBefore = demoConfig.totalInventory * demoConfig.perVinCost;
  const photoScaleFactor = demoConfig.totalInventory / 200;

  function photoCumulativeProcessed(upToStepIdx: number): number {
    let total = 0;
    for (let i = 0; i < upToStepIdx && i < PHOTO_VINS_PER_STEP.length; i++) {
      total += Math.round(PHOTO_VINS_PER_STEP[i] * photoScaleFactor);
    }
    return total;
  }

  const photoRemainingStart = Math.max(0, demoConfig.totalInventory - photoCumulativeProcessed(bucketIdx));
  const photoRemainingEnd   = Math.max(0, demoConfig.totalInventory - photoCumulativeProcessed(afterIdx));
  const photoAfterCost      = photoRemainingEnd * demoConfig.perVinCost;
  const photoDeltaCost      = photoRemainingStart * demoConfig.perVinCost - photoAfterCost;
  const isZeroPhoto         = photoAfterCost === 0;

  const photoStartPct = photoBefore > 0 ? (photoRemainingStart / demoConfig.totalInventory) * 100 : 100;
  const photoEndPct   = photoBefore > 0 ? Math.max(0, (photoRemainingEnd / demoConfig.totalInventory) * 100) : 0;

  // ── Animation refs ───────────────────────────────────────────────────────────
  const ttmAfterBarRef   = useRef<HTMLDivElement>(null);
  const hcAfterBarRef    = useRef<HTMLDivElement>(null);
  const photoAfterBarRef = useRef<HTMLDivElement>(null);
  const ttmDeltaRef      = useRef<HTMLDivElement>(null);
  const hcDeltaRef       = useRef<HTMLDivElement>(null);
  const photoDeltaRef    = useRef<HTMLDivElement>(null);
  const box1Ref          = useRef<HTMLDivElement>(null);
  const box2Ref          = useRef<HTMLDivElement>(null);
  const box3Ref          = useRef<HTMLDivElement>(null);

  // ── Entrance animation ───────────────────────────────────────────────────────
  // Runs on mount (StepMetricsPanel mounts fresh when success state activates).
  // Sequence:
  //   0.00s  Before bars appear instantly (no animation — static reference)
  //   0.15s  After bars animate from prev-step width → this-step width
  //   0.70s  Delta badges pop in
  //   0.80s  Metric boxes slide up
  //   0.90s  Score odometer counts up
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });

    // Set After bars at previous-step start position before animating
    if (ttmAfterBarRef.current) {
      const start = isAging ? agingStartPct : ttmStartPct;
      const end   = isAging ? agingEndPct   : Math.max(0, ttmEndPct);
      gsap.set(ttmAfterBarRef.current, { width: `${start}%` });
      tl.to(ttmAfterBarRef.current, {
        width: `${end}%`,
        duration: 0.8,
        ease: "power3.out",
      }, 0);
    }

    if (hcAfterBarRef.current) {
      const start = isAging ? agingCostStartPct : hcStartPct;
      const end   = isAging ? agingCostEndPct   : hcEndPct;
      gsap.set(hcAfterBarRef.current, { width: `${start}%` });
      tl.to(hcAfterBarRef.current, {
        width: `${end}%`,
        duration: 0.8,
        ease: "power3.out",
      }, 0.1);
    }

    if (!isAging && photoAfterBarRef.current) {
      gsap.set(photoAfterBarRef.current, { width: `${photoStartPct}%` });
      tl.to(photoAfterBarRef.current, {
        width: `${photoEndPct}%`,
        duration: 0.8,
        ease: "power3.out",
      }, 0.2);
    }

    // Delta badges: scale + fade pop after bars settle
    const deltaBadgeTargets = isAging
      ? [ttmDeltaRef.current, hcDeltaRef.current]
      : [ttmDeltaRef.current, hcDeltaRef.current, photoDeltaRef.current];
    tl.fromTo(
      deltaBadgeTargets,
      { opacity: 0, scale: 0.75, y: 4 },
      { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: "back.out(1.7)", stagger: 0.09 },
      0.65
    );

    // Metric boxes: staggered slide up (aging step only)
    if (isAging) {
      tl.fromTo(
        [box1Ref.current, box2Ref.current, box3Ref.current],
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.42, ease: "power3.out", stagger: 0.09 },
        0.78
      );
    }

    return () => { tl.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucketKey]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-[12px]">
      {isAging ? (
        <div>
          <GraphSection
            title="Aged units (45+ days)"
            beforeDisplay={`${agingUnitsBefore}`}
            afterDisplay={`${agingUnitsAfter}`}
            deltaDisplay={`-${agingUnitsDelta} units`}
            deltaColor="#EF4444"
            deltaBg="#FEE2E2"
            startPct={agingStartPct}
            endPct={agingEndPct}
            afterBarRef={ttmAfterBarRef}
            deltaRef={ttmDeltaRef}
            afterBarGradient="linear-gradient(90deg, #EF4444 0%, #F97316 100%)"
          />
          <GraphSection
            title="Aged holding cost · monthly"
            beforeDisplay={fmtK(agingCostBefore)}
            afterDisplay={fmtK(agingCostAfter)}
            deltaDisplay={`+${fmtK(agingCostDelta)} recovered`}
            deltaColor="#10B981"
            deltaBg="#D1FAE5"
            startPct={agingCostStartPct}
            endPct={agingCostEndPct}
            afterBarRef={hcAfterBarRef}
            deltaRef={hcDeltaRef}
            afterBarGradient="linear-gradient(90deg, #10B981 0%, #059669 100%)"
          />

          <div className="flex gap-[8px] pt-[10px]">
            <MetricBox
              ref={box1Ref}
              icon={<Zap size={13} strokeWidth={2.5} />}
              label="Aged vehicles targeted"
              delta={`${agingUnitsBefore}`}
              sub={`Target: ${agingUnitsAfter} (10% of lot)`}
              accent="#EF4444"
            />
            <MetricBox
              ref={box2Ref}
              icon={<DollarSign size={13} strokeWidth={2.5} />}
              label="Aged HC recovered"
              delta={`+${fmtK(agingCostDelta)}`}
              sub="estimated with campaigns"
              accent="#10B981"
            />
            <MetricBox
              ref={box3Ref}
              icon={<Activity size={13} strokeWidth={2.5} />}
              label="Listing quality"
              delta={scoreAfterAging.toFixed(1)}
              sub={`+${scoreDeltaAging} pts  ·  0 – 10`}
              accent="#7C3AED"
            />
          </div>
        </div>
      ) : (
        <div>
          {/* ── Graph 1: Time to market ─────────────────────────────────────────── */}
          <GraphSection
            title="Time to market"
            beforeDisplay={`${ttmBaseline}d`}
            afterDisplay={isZeroTTM ? "0d" : `${ttmAfter}d`}
            deltaDisplay={`-${ttmDelta}d`}
            deltaColor={accent}
            deltaBg={`${accent}20`}
            startPct={ttmStartPct}
            endPct={ttmEndPct}
            afterBarRef={ttmAfterBarRef}
            deltaRef={ttmDeltaRef}
            afterBarGradient={`linear-gradient(90deg, ${accent} 0%, ${accent}CC 100%)`}
            isZeroAfter={isZeroTTM}
          />

          {/* ── Graph 2: Gross margin at risk ──────────────────────────────────── */}
          <GraphSection
            title="Gross margin at risk"
            beforeDisplay={fmtK(hcBaseline)}
            afterDisplay={fmtK(hcAfter)}
            deltaDisplay={`+${fmtK(hcDelta)} recovered`}
            deltaColor="#059669"
            deltaBg="#D1FAE5"
            startPct={hcStartPct}
            endPct={hcEndPct}
            afterBarRef={hcAfterBarRef}
            deltaRef={hcDeltaRef}
            afterBarGradient="linear-gradient(90deg, #10B981 0%, #059669 100%)"
          />

          {/* ── Graph 3: Photography cost ───────────────────────────────────────── */}
          <GraphSection
            title="Photography cost"
            beforeDisplay={fmtK(photoBefore)}
            afterDisplay={isZeroPhoto ? "$0" : fmtK(photoAfterCost)}
            deltaDisplay={`+${fmtK(photoDeltaCost)} saved`}
            deltaColor="#0891B2"
            deltaBg="#E0F2FE"
            startPct={photoStartPct}
            endPct={photoEndPct}
            afterBarRef={photoAfterBarRef}
            deltaRef={photoDeltaRef}
            afterBarGradient="linear-gradient(90deg, #0891B2 0%, #0E7490 100%)"
            isZeroAfter={isZeroPhoto}
            zeroLabel="Eliminated"
          />
        </div>
      )}
    </div>
  );
}
