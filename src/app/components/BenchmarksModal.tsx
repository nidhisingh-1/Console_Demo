import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Calculator, ChevronDown, ChevronUp, ArrowRight, X, Info } from "lucide-react";

export interface Benchmarks {
  daysToFrontline: number;
  holdingCostPerDay: number;
}

export const DEFAULT_BENCHMARKS: Benchmarks = {
  daysToFrontline: 50,
  holdingCostPerDay: 40,
};

interface Props {
  open: boolean;
  imsName?: string;
  onClose?: () => void;
  onSubmit: (b: Benchmarks) => void;
}

// ─── Mini calculator ─────────────────────────────────────────────────────────

function Calc({
  onApply,
}: {
  onApply: (perDay: number) => void;
}) {
  const [value, setValue] = useState(25000);
  const [apr, setApr] = useState(7);
  const [other, setOther] = useState(30);

  const floorPlanPerDay = (value * (apr / 100)) / 365;
  const total = floorPlanPerDay + other;

  return (
    <div className="mt-[14px] rounded-[12px] border border-black/8 bg-[#FAFAFB] p-[16px]">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <Calculator size={14} className="text-[#4600F2]" />
        <p className="text-[12px] uppercase tracking-[0.8px] font-bold text-black/55 font-['Inter:Bold',sans-serif]">
          Holding cost calculator
        </p>
      </div>

      <div className="grid grid-cols-3 gap-[10px]">
        <CalcField
          label="Avg vehicle value"
          prefix="$"
          value={value}
          step={500}
          onChange={setValue}
        />
        <CalcField
          label="Floor plan APR"
          suffix="%"
          value={apr}
          step={0.25}
          decimals={2}
          onChange={setApr}
        />
        <CalcField
          label="Other daily costs"
          prefix="$"
          value={other}
          step={1}
          onChange={setOther}
          hint="depreciation, lot, admin"
        />
      </div>

      {/* Live result */}
      <div className="mt-[14px] flex items-center justify-between gap-[12px] rounded-[10px] bg-white border border-black/8 px-[14px] py-[10px]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.8px] font-bold text-black/55 font-['Inter:Bold',sans-serif]">
            Estimated holding cost
          </p>
          <p className="mt-[2px] text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
            ${total.toFixed(2)}
            <span className="text-[12px] text-black/45 font-medium ml-[4px]">/ day per vehicle</span>
          </p>
          <p className="mt-[4px] text-[10px] text-black/45 font-['Inter:Regular',sans-serif]">
            ${floorPlanPerDay.toFixed(2)} floor plan + ${other.toFixed(2)} other
          </p>
        </div>
        <button
          type="button"
          onClick={() => onApply(Math.round(total))}
          className="h-[36px] px-[16px] rounded-[8px] bg-[#4600F2] hover:bg-[#3a00d0] text-white text-[12px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-colors whitespace-nowrap"
        >
          Use this value
        </button>
      </div>
    </div>
  );
}

function CalcField({
  label, prefix, suffix, value, step = 1, decimals = 0, hint, onChange,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  step?: number;
  decimals?: number;
  hint?: string;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.6px] font-bold text-black/55 mb-[4px] font-['Inter:Bold',sans-serif]">
        {label}
      </label>
      <div className="flex items-center bg-white border border-black/10 rounded-[8px] h-[36px] px-[10px] focus-within:border-[#4600F2]">
        {prefix && <span className="text-[12px] text-black/55 mr-[2px]">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] min-w-0"
        />
        {suffix && <span className="text-[12px] text-black/55 ml-[2px]">{suffix}</span>}
      </div>
      {hint && (
        <p className="mt-[3px] text-[9px] text-black/40 font-['Inter:Regular',sans-serif] truncate">
          {hint}
        </p>
      )}
      {!hint && <p className="mt-[3px] text-[9px]">&nbsp;</p>}
    </div>
  );
}

// ─── Primary number field with prefix/suffix ────────────────────────────────

function MainField({
  label, prefix, suffix, value, onChange,
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex-1">
      <label className="block text-[11px] uppercase tracking-[0.6px] font-bold text-black/55 mb-[6px] font-['Inter:Bold',sans-serif]">
        {label}
      </label>
      <div className="flex items-center bg-white border border-black/15 rounded-[10px] h-[48px] px-[14px] focus-within:border-[#4600F2] focus-within:ring-1 focus-within:ring-[#4600F2]">
        {prefix && <span className="text-[16px] text-black/55 mr-[4px] font-medium">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] min-w-0"
        />
        {suffix && <span className="text-[13px] text-black/55 ml-[4px] font-medium whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function BenchmarksModal({ open, imsName, onClose, onSubmit }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [days, setDays] = useState(DEFAULT_BENCHMARKS.daysToFrontline);
  const [cost, setCost] = useState(DEFAULT_BENCHMARKS.holdingCostPerDay);
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Reset to defaults each time it opens
    setDays(DEFAULT_BENCHMARKS.daysToFrontline);
    setCost(DEFAULT_BENCHMARKS.holdingCostPerDay);
    setCalcOpen(false);

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 20, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
    );
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[620px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[22px] pb-[14px] flex items-start justify-between gap-[16px]">
          <div>
            <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
              Quick setup
            </h2>
            <p className="mt-[2px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
              Two numbers to calibrate your savings
              {imsName ? <> before we sync <span className="font-semibold text-[#0a0a0a]">{imsName}</span></> : ""}.
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-[32px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} className="text-black/60" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[28px] py-[10px] bg-[#FAFAFB]">
          <div className="flex gap-[12px]">
            <MainField
              label="Days to frontline"
              suffix="days"
              value={days}
              onChange={setDays}
            />
            <MainField
              label="Holding cost"
              prefix="$"
              suffix="/ day"
              value={cost}
              onChange={setCost}
            />
          </div>

          <button
            type="button"
            onClick={() => setCalcOpen((v) => !v)}
            className="mt-[12px] inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#4600F2] hover:text-[#3a00d0] transition-colors font-['Inter:Semi_Bold',sans-serif]"
          >
            <Calculator size={13} />
            {calcOpen ? "Hide calculator" : "Don't know? Let's calculate"}
            {calcOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {calcOpen && (
            <Calc
              onApply={(v) => {
                setCost(v);
                setCalcOpen(false);
              }}
            />
          )}

          {/* Info strip */}
          <div className="mt-[14px] flex items-start gap-[8px] px-[12px] py-[10px] rounded-[10px] bg-[rgba(70,0,242,0.04)] border border-[rgba(70,0,242,0.12)]">
            <Info size={14} className="text-[#4600F2] mt-[2px] shrink-0" />
            <p className="text-[11px] text-black/65 font-['Inter:Regular',sans-serif] leading-[16px]">
              Most dealers run a 50-day cycle at ~$40/day.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <button
            type="button"
            onClick={() => onSubmit(DEFAULT_BENCHMARKS)}
            className="text-[12px] font-semibold text-black/55 hover:text-[#0a0a0a] transition-colors font-['Inter:Semi_Bold',sans-serif]"
          >
            Skip — use defaults
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ daysToFrontline: days, holdingCostPerDay: cost })}
            className="h-[44px] px-[24px] rounded-[10px] text-white text-[14px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center gap-[8px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
              boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
            }}
          >
            Continue sync
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
