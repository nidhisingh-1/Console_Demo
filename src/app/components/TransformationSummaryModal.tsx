import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  X, Sparkles, Wand2, Layers, TrendingUp,
  Clock, DollarSign, Check, ArrowRight, ChevronUp,
} from "lucide-react";
import { ScoreGauge } from "./ScoreGauge";

interface Summary {
  rawTransformed: number;
  rawTotal: number;
  smartMatched: number;
  noPhotoTotal: number;
  cgiUpgraded: number;
  cgiTotal: number;
  totalInventory: number;
  scoreBefore: number;
  scoreAfter: number;
  daysSaved: number;       // per VIN avg
  holdingPerDay: number;   // $/day per VIN
}

const DEFAULT_SUMMARY: Summary = {
  rawTransformed: 67,
  rawTotal: 67,
  smartMatched: 70,
  noPhotoTotal: 90,
  cgiUpgraded: 96,
  cgiTotal: 134,
  totalInventory: 234,
  scoreBefore: 2.8,
  scoreAfter: 7.9,
  daysSaved: 4.1,
  holdingPerDay: 38,
};

// ─── Number count-up helper ──────────────────────────────────────────────────

function useCountUp(target: number, open: boolean, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!open) { setVal(0); return; }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: target,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => setVal(obj.v),
    });
    return () => { tween.kill(); };
  }, [target, open]);
  return decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals));
}

// ─── Score lift (half-donut gauge + before/after caption) ────────────────────

function ScoreLift({ before, after, open }: { before: number; after: number; open: boolean }) {
  return (
    <div className="rounded-[16px] p-[20px] border border-black/8 bg-gradient-to-br from-[rgba(70,0,242,0.04)] to-[rgba(0,196,136,0.04)] flex items-center gap-[24px]">
      <ScoreGauge
        score={after}
        max={10}
        width={180}
        scoreColor="#10B981"
        animateKey={open ? "open" : "closed"}
        beforeScore={before}
      />
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-[1px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
          Inventory Score
        </p>
        <div className="mt-[6px] inline-flex items-center gap-[8px]">
          <span className="text-[28px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif] leading-none">
            Healthy
          </span>
          <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[11px] font-bold uppercase tracking-[0.6px]">
            <Check size={11} strokeWidth={3} />
            Studio-ready
          </span>
        </div>
        <p className="mt-[10px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif] leading-[18px]">
          Was <span className="font-semibold text-[#EF4444]">{before.toFixed(1)} Critical</span>
          <span className="mx-[6px] text-black/30">·</span>
          <span className="inline-flex items-center gap-[4px] font-semibold text-[#10B981]">
            <TrendingUp size={13} />
            +{(after - before).toFixed(1)} lift
          </span>
        </p>
      </div>
    </div>
  );
}

// ─── Impact stat card ─────────────────────────────────────────────────────────

function ImpactStat({
  label, value, accent, icon, prefix, suffix, decimals = 0, denominator, open,
}: {
  label: string; value: number; accent: string; icon: React.ReactNode;
  prefix?: string; suffix?: string; decimals?: number; denominator?: number; open: boolean;
}) {
  const live = useCountUp(value, open, decimals);
  const formatted = decimals === 0
    ? live.toLocaleString("en-US")
    : live.toFixed(decimals);
  return (
    <div className="flex-1 rounded-[14px] border border-black/8 bg-white px-[16px] py-[14px]">
      <div className="flex items-center gap-[10px]">
        <div
          className="size-[32px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        <p className="text-[11px] uppercase tracking-[0.6px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
          {label}
        </p>
      </div>
      <p className="mt-[10px] text-[26px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
        {prefix && <span>{prefix}</span>}
        {formatted}
        {typeof denominator === "number" && (
          <span className="text-[14px] text-black/35 font-semibold ml-[4px]">/ {denominator.toLocaleString("en-US")}</span>
        )}
        {suffix && <span className="text-[13px] text-black/45 font-medium ml-[4px]">{suffix}</span>}
      </p>
    </div>
  );
}

// ─── Action recap card ────────────────────────────────────────────────────────

function ActionRecap({
  icon, color, label, count, total,
}: {
  icon: React.ReactNode; color: string; label: string; count: number; total: number;
}) {
  return (
    <div className="flex-1 rounded-[12px] border border-black/8 bg-white p-[14px] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -right-[10px] -top-[10px] size-[80px] rounded-full opacity-[0.08]"
        style={{ background: color }}
      />
      <div className="flex items-center gap-[8px] relative">
        <div
          className="size-[28px] rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: `${color}1A`, color }}
        >
          {icon}
        </div>
        <p
          className="text-[10px] uppercase tracking-[0.8px] font-bold font-['Inter:Bold',sans-serif]"
          style={{ color }}
        >
          {label}
        </p>
      </div>
      <div className="mt-[12px] flex items-baseline gap-[4px]">
        <span className="text-[26px] font-bold font-['Inter:Bold',sans-serif]" style={{ color }}>
          {count}
        </span>
        <span className="text-[14px] text-black/35 font-semibold">/ {total}</span>
      </div>
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onPublish?: () => void;
  summary?: Summary;
}

export function TransformationSummaryModal({
  open, onClose, onPublish, summary = DEFAULT_SUMMARY,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalFixed = summary.rawTransformed + summary.smartMatched + summary.cgiUpgraded;
  const holdingSaved = Math.round(summary.daysSaved * summary.holdingPerDay * totalFixed);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="relative px-[28px] pt-[22px] pb-[18px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="flex items-start gap-[14px]">
              <div
                className="shrink-0 size-[46px] rounded-[14px] flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                  color: "#fff",
                  boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                    Your inventory is ready to sell
                  </h2>
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px]">
                    <Check size={10} strokeWidth={3} />
                    Transformation complete
                  </span>
                </div>
                <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                  <span className="font-semibold text-[#0a0a0a]">{totalFixed} VINs</span> fixed in the last few minutes.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-[32px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
              aria-label="Minimize"
            >
              <X size={18} className="text-black/60" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[28px] py-[20px] bg-[#FAFAFB]">
          {/* Score lift */}
          <ScoreLift before={summary.scoreBefore} after={summary.scoreAfter} open={open} />

          {/* Impact stats */}
          <div className="mt-[16px] flex gap-[12px]">
            <ImpactStat
              open={open}
              label="Days to Frontline saved"
              value={summary.daysSaved}
              decimals={1}
              suffix={`days / vehicle`}
              accent="#4600F2"
              icon={<Clock size={16} />}
            />
            <ImpactStat
              open={open}
              label="Holding cost saved"
              value={holdingSaved}
              prefix="$"
              accent="#10B981"
              icon={<DollarSign size={16} />}
            />
            <ImpactStat
              open={open}
              label="Vehicles ready to sell"
              value={Math.min(totalFixed, summary.totalInventory)}
              denominator={summary.totalInventory}
              accent="#F59E0B"
              icon={<Wand2 size={16} />}
            />
          </div>

          {/* Action recap */}
          <p className="mt-[20px] mb-[10px] text-[11px] uppercase tracking-[1px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
            What we fixed
          </p>
          <div className="flex gap-[12px]">
            <ActionRecap
              icon={<Wand2 size={14} />}
              color="#4600F2"
              label="Raw photos"
              count={summary.rawTransformed}
              total={summary.rawTotal}
            />
            <ActionRecap
              icon={<Layers size={14} />}
              color="#00C488"
              label="No photos"
              count={summary.smartMatched}
              total={summary.noPhotoTotal}
            />
            <ActionRecap
              icon={<TrendingUp size={14} />}
              color="#F59E0B"
              label="CGI photos"
              count={summary.cgiUpgraded}
              total={summary.cgiTotal}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#10B981] animate-pulse" />
            Saved as draft batch
          </div>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[40px] px-[18px] rounded-[10px] bg-white border border-black/15 text-[#0a0a0a] text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] hover:bg-[#fafafa] transition-colors"
            >
              Review later
            </button>
            <button
              type="button"
              onClick={onPublish ?? onClose}
              className="h-[40px] px-[22px] rounded-[10px] text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-[8px]"
              style={{
                background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
              }}
            >
              Publish {totalFixed} listings
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Floating widget (the "re-open" affordance) ──────────────────────────────

interface WidgetProps {
  open: boolean;
  totalFixed: number;
  onClick: () => void;
}

export function TransformationSummaryWidget({ open, totalFixed, onClick }: WidgetProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      gsap.fromTo(
        el,
        { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }
      );
    } else {
      gsap.to(el, { y: 80, opacity: 0, scale: 0.9, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ pointerEvents: open ? "auto" : "none" }}
      className="fixed bottom-[24px] left-[88px] z-30 flex items-center gap-[12px] pl-[6px] pr-[16px] py-[6px] rounded-full bg-white shadow-[0_10px_30px_rgba(70,0,242,0.18)] border border-[rgba(70,0,242,0.18)] hover:shadow-[0_14px_36px_rgba(70,0,242,0.25)] transition-shadow"
    >
      <span
        className="size-[34px] rounded-full flex items-center justify-center shrink-0"
        style={{
          background: "linear-gradient(135deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
        }}
      >
        <Sparkles size={16} className="text-white" />
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[12px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] inline-flex items-center gap-[4px]">
          Transformation complete
          <span className="size-[5px] rounded-full bg-[#10B981] animate-pulse" />
        </span>
        <span className="text-[10px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
          {totalFixed} VINs fixed · tap to view summary
        </span>
      </span>
      <ChevronUp size={14} className="text-[#4600F2] shrink-0" strokeWidth={2.5} />
    </button>
  );
}
