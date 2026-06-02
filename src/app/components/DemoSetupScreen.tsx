import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Sparkles, ArrowRight, ArrowLeft, Minus, Plus, Check,
  ChevronDown, ChevronUp, AlertCircle,
} from "lucide-react";
import { SpyneMark } from "./AppShell";
import {
  DEFAULT_DEMO_CONFIG, calcOpportunity,
  DAYS_TO_LIVE_MAP, PHOTO_PROCESS_GAP_MAP,
  type DemoConfig,
} from "../types/demoConfig";

// ─── Static option lists ───────────────────────────────────────────────────

const IMS_OPTIONS = [
  "Vincue", "VinSolutions", "DealerSocket", "CDK Global",
  "Reynolds & Reynolds", "vAuto", "Tekion", "Other",
];
const ROOFTOP_OPTIONS = ["1", "2-3", "4-7", "8+"];
const INVENTORY_MIX_OPTIONS = ["New only", "Used only", "Both New & Used"];
const DAYS_TO_LIVE_OPTIONS = Object.keys(DAYS_TO_LIVE_MAP);
const PHOTO_PROCESS_OPTIONS = Object.keys(PHOTO_PROCESS_GAP_MAP);
const MEDIA_FORMAT_OPTIONS = [
  "Still photos", "360 spins", "Video walkarounds", "Syndicated to portals", "None yet",
];
const PAIN_POINT_OPTIONS = [
  "Slow to go live", "Inconsistent quality", "High cost per car",
  "Low VDP engagement", "Multi-rooftop consistency", "Promotions not showing",
];
const SPEND_OPTIONS = ["Under $5K", "$5K-$10K", "$10K-$20K", "$20K-$50K", "Over $50K"];

const DISCOVERY_QUESTIONS = [
  "Which IMS are you currently integrated with?",
  "How many rooftops do you operate?",
  "How long does it take to get a vehicle from trade-in to live online today?",
  "Which platforms do you currently publish listings to?",
  "Do you have an in-house photographer or use a third party?",
  "What is your current average days-on-lot?",
  "What does your current photography spend look like per month?",
  "What types of media are you producing today -- photos, 360s, video?",
  "What are the biggest bottlenecks in your current media workflow?",
];

const STEPS = [
  { key: 1, label: "Dealership profile", hint: "Who they are & how big" },
  { key: 2, label: "Performance & spend", hint: "Where the gaps are today" },
] as const;

// ─── Small UI atoms ────────────────────────────────────────────────────────

function ReqBadge({ kind = "required" }: { kind?: "required" | "editable" }) {
  if (kind === "editable") {
    return (
      <span className="inline-flex items-center px-[7px] h-[18px] rounded-md text-[9px] font-bold uppercase tracking-[0.6px] bg-black/6 text-black/55 font-['Inter:Bold',sans-serif]">
        Editable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-[7px] h-[18px] rounded-md text-[9px] font-bold uppercase tracking-[0.6px] bg-[#FEF3C7] text-[#B45309] font-['Inter:Bold',sans-serif]">
      Required
    </span>
  );
}

function FieldLabel({
  children, required, error,
}: {
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
}) {
  return (
    <div className="text-[12px] font-semibold text-black/70 mb-[8px] font-['Inter:Semi_Bold',sans-serif] flex items-center gap-[5px]">
      <span>{children}</span>
      {required && (
        <span
          className={`font-bold ${error ? "text-[#EF4444]" : "text-[#B45309]"}`}
          aria-label="required"
        >
          *
        </span>
      )}
      {error && (
        <span className="text-[10px] font-semibold text-[#EF4444] font-['Inter:Semi_Bold',sans-serif]">
          Required
        </span>
      )}
    </div>
  );
}

function ChipGroup({
  options, value, onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`h-[30px] px-[12px] rounded-full text-[11px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
            value === opt
              ? "bg-[#4600F2] text-white border-[#4600F2]"
              : "bg-white text-black/65 border-black/15 hover:border-[#4600F2]/40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiChipGroup({
  options, values, onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  return (
    <div className="flex flex-wrap gap-[6px]">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`h-[30px] px-[12px] rounded-full text-[11px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
            values.includes(opt)
              ? "bg-[#4600F2] text-white border-[#4600F2]"
              : "bg-white text-black/65 border-black/15 hover:border-[#4600F2]/40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── MetricCard: big number + +/- stepper + slider + benchmark line ───────

function MetricCard({
  label, value, suffix, prefix, min, max, step = 1, onChange, badge = "required",
  benchmarkLabel, benchmarkValue,
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  badge?: "required" | "editable";
  benchmarkLabel?: string;
  benchmarkValue?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-[16px]">
      <div className="flex items-start justify-between gap-[12px] mb-[10px]">
        <p className="text-[12px] font-semibold text-black/70 font-['Inter:Semi_Bold',sans-serif]">
          {label}
        </p>
        <ReqBadge kind={badge} />
      </div>
      <div className="flex items-end justify-between gap-[10px] mb-[12px]">
        <div className="flex items-baseline gap-[3px]">
          {prefix && (
            <span className="text-[18px] font-bold text-black/40 font-['Inter:Bold',sans-serif]">
              {prefix}
            </span>
          )}
          <span className="text-[28px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
            {value.toLocaleString()}
          </span>
          {suffix && (
            <span className="text-[12px] font-semibold text-black/40 ml-[3px] font-['Inter:Semi_Bold',sans-serif]">
              {suffix}
            </span>
          )}
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            className="size-[26px] rounded-md border border-black/12 flex items-center justify-center text-black/55 hover:border-[#4600F2] hover:text-[#4600F2] transition-colors"
            aria-label="decrement"
          >
            <Minus size={12} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + step))}
            className="size-[26px] rounded-md border border-black/12 flex items-center justify-center text-black/55 hover:border-[#4600F2] hover:text-[#4600F2] transition-colors"
            aria-label="increment"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[4px] rounded-full appearance-none cursor-pointer accent-[#4600F2]"
        style={{
          background: `linear-gradient(to right, #4600F2 ${pct}%, #E5E7EB ${pct}%)`,
        }}
      />
      {benchmarkLabel && (
        <div className="mt-[8px] flex items-center justify-between text-[11px] font-['Inter:Regular',sans-serif]">
          <span className="inline-flex items-center gap-[5px] text-black/50">
            <span className="size-[6px] rounded-full bg-[#10B981]" />
            {benchmarkLabel}
          </span>
          {benchmarkValue && (
            <span className="text-[#10B981] font-semibold font-['Inter:Semi_Bold',sans-serif]">
              {benchmarkValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Card wrapper for each section in the right column ────────────────────

function SectionCard({
  eyebrow, title, badge, badgeKind, hint, children,
}: {
  eyebrow: string;
  title: string;
  badge?: boolean;
  badgeKind?: "required" | "editable";
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[16px] border border-black/8 p-[20px]">
      <div className="flex items-start justify-between mb-[16px] gap-[12px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-black/40 mb-[2px] font-['Inter:Bold',sans-serif]">
            {eyebrow}
          </p>
          <h3 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
            {title}
          </h3>
        </div>
        {badge ? (
          <ReqBadge kind={badgeKind} />
        ) : hint ? (
          <p className="text-[11px] text-black/40 font-['Inter:Regular',sans-serif] text-right max-w-[220px]">
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

interface Props {
  onLaunch: (config: DemoConfig) => void;
}

export function DemoSetupScreen({ onLaunch }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepBodyRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [step, setStep] = useState<1 | 2>(1);
  const [showDiscoveryQs, setShowDiscoveryQs] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const set = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const opp = calcOpportunity(config);

  // Per-step required-field tracking
  const step1Missing = {
    dealershipName: !config.dealershipName.trim(),
    numRooftops: !config.numRooftops,
  };
  const step2Missing = {
    daysToLiveChip: !config.daysToLiveChip,
    photographyProcess: !config.photographyProcess,
    painPoints: config.painPoints.length === 0,
  };
  const step1MissingList = [
    step1Missing.dealershipName && "Dealership name",
    step1Missing.numRooftops && "Number of rooftops",
  ].filter(Boolean) as string[];
  const step2MissingList = [
    step2Missing.daysToLiveChip && "Avg days to listing go-live",
    step2Missing.photographyProcess && "Current photography process",
    step2Missing.painPoints && "Biggest pain points",
  ].filter(Boolean) as string[];

  const step1Valid = step1MissingList.length === 0;
  const step2Valid = step2MissingList.length === 0;
  const allValid = step1Valid && step2Valid;
  const canAdvance = step === 1 ? step1Valid : step2Valid;
  const currentMissingList = step === 1 ? step1MissingList : step2MissingList;

  // Mount entrance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-fade]");
    gsap.fromTo(
      items,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" }
    );
  }, []);

  // Step content fade on change
  useEffect(() => {
    const el = stepBodyRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-step-fade]");
    gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: "power3.out" }
    );
    setShowErrors(false);
  }, [step]);

  const requiredFilledCount =
    (config.dealershipName.trim() ? 1 : 0) +
    (config.numRooftops ? 1 : 0) +
    (config.totalInventory > 0 ? 1 : 0) +
    (config.daysToLiveChip ? 1 : 0) +
    (config.photographyProcess ? 1 : 0) +
    (config.painPoints.length > 0 ? 1 : 0);

  return (
    <div ref={containerRef} className="h-screen bg-[#f9fafb] flex flex-col">
      {/* Top app bar */}
      <div className="bg-white border-b border-black/8 h-[52px] flex items-center justify-between px-[28px] shrink-0">
        <div className="flex items-center gap-[10px]">
          <SpyneMark />
          <span className="font-bold text-[#402387] text-[18px] leading-none font-['Inter:Bold',sans-serif]">
            Studio AI
          </span>
          <span className="ml-[6px] px-[8px] py-[2px] rounded-full bg-[rgba(70,0,242,0.08)] text-[10px] font-bold text-[#4600F2] uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]">
            Demo Setup
          </span>
        </div>
        <p className="text-[12px] text-black/40 font-['Inter:Regular',sans-serif]">
          Fill in prospect details, then launch the personalised demo
        </p>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 w-full max-w-[1280px] mx-auto px-[28px] pt-[24px] flex flex-col">

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
        <div data-fade className="mb-[20px] flex items-center justify-between gap-[16px] flex-wrap">
          <div>
            <p className="inline-flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-[1.2px] text-black/45 font-['Inter:Bold',sans-serif] mb-[6px]">
              <span className="size-[5px] rounded-full bg-[#FF5C7A]" />
              Demo builder · Discovery
            </p>
            <h1 className="text-[#0a0a0a] text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-[1.15]">
              Build a custom demo
            </h1>
            <p className="mt-[4px] text-[12px] text-black/50 font-['Inter:Regular',sans-serif] inline-flex items-center gap-[8px] flex-wrap">
              Live updates as you fill the form
              <span className="px-[8px] py-[3px] rounded-full bg-[#4600F2]/8 text-[#4600F2] text-[10px] font-bold font-['Inter:Bold',sans-serif] uppercase tracking-[0.4px]">
                {requiredFilledCount}/6 required filled
              </span>
            </p>
          </div>
        </div>

        {/* ── BODY GRID ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-[20px] flex-1 min-h-0 pb-[20px]">

          {/* ── LEFT SIDEBAR (persistent — does not scroll the page) ─── */}
          <div data-fade className="bg-white rounded-[16px] border border-black/8 p-[20px] overflow-y-auto min-h-0">
            <p className="text-[10px] font-bold uppercase tracking-[1px] text-black/40 mb-[3px] font-['Inter:Bold',sans-serif]">
              Discovery
            </p>
            <h2 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] mb-[18px]">
              Customer details
            </h2>

            <FieldLabel>AE Name</FieldLabel>
            <input
              type="text"
              placeholder="Enter AE name"
              value={config.aeName}
              onChange={(e) => set("aeName", e.target.value)}
              className="w-full h-[38px] px-[12px] mb-[14px] rounded-[10px] border border-black/12 bg-white text-[13px] text-[#0a0a0a] outline-none focus:border-[#4600F2] font-['Inter:Regular',sans-serif] placeholder:text-black/30"
            />

            <FieldLabel required error={showErrors && step === 1 && step1Missing.dealershipName}>
              Dealership Name
            </FieldLabel>
            <input
              type="text"
              placeholder="Enter dealership name"
              value={config.dealershipName}
              onChange={(e) => set("dealershipName", e.target.value)}
              className={`w-full h-[38px] px-[12px] mb-[14px] rounded-[10px] border bg-white text-[13px] text-[#0a0a0a] outline-none font-['Inter:Regular',sans-serif] placeholder:text-black/30 transition-colors ${
                showErrors && step === 1 && step1Missing.dealershipName
                  ? "border-[#EF4444] focus:border-[#EF4444]"
                  : "border-black/12 focus:border-[#4600F2]"
              }`}
            />

            <FieldLabel>Inventory Mix</FieldLabel>
            <div className="grid grid-cols-2 gap-[8px] mb-[8px]">
              {INVENTORY_MIX_OPTIONS.slice(0, 2).map((opt) => {
                const isActive = config.inventoryMix === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("inventoryMix", isActive ? "" : opt)}
                    className={`rounded-[10px] border p-[10px] text-left transition-colors ${
                      isActive
                        ? "border-[#4600F2] bg-[#4600F2]/5"
                        : "border-black/12 bg-white hover:border-[#4600F2]/40"
                    }`}
                  >
                    <p
                      className={`text-[12px] font-bold font-['Inter:Bold',sans-serif] ${
                        isActive ? "text-[#4600F2]" : "text-[#0a0a0a]"
                      }`}
                    >
                      {opt === "New only" ? "New" : "Used"}
                    </p>
                    <p className="text-[10px] text-black/45 font-['Inter:Regular',sans-serif] mt-[1px]">
                      {opt === "New only" ? "$45,000 per car" : "$27,000 per car"}
                    </p>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() =>
                set(
                  "inventoryMix",
                  config.inventoryMix === INVENTORY_MIX_OPTIONS[2] ? "" : INVENTORY_MIX_OPTIONS[2]
                )
              }
              className={`w-full rounded-[10px] border h-[34px] text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-colors mb-[16px] ${
                config.inventoryMix === INVENTORY_MIX_OPTIONS[2]
                  ? "border-[#4600F2] bg-[#4600F2]/5 text-[#4600F2]"
                  : "border-black/12 text-black/60 hover:border-[#4600F2]/40"
              }`}
            >
              Both New &amp; Used
            </button>

            <FieldLabel>IMS / DMS</FieldLabel>
            <ChipGroup
              options={IMS_OPTIONS}
              value={config.imsProvider}
              onChange={(v) => set("imsProvider", v)}
            />

            {/* Discovery questions — collapsed by default */}
            <div className="mt-[20px] pt-[18px] border-t border-black/8">
              <button
                type="button"
                onClick={() => setShowDiscoveryQs((v) => !v)}
                className="w-full flex items-center justify-between gap-[8px] group"
              >
                <span className="inline-flex items-center gap-[8px]">
                  <span className="text-[10px] font-bold uppercase tracking-[1px] text-black/40 font-['Inter:Bold',sans-serif] group-hover:text-[#4600F2] transition-colors">
                    Discovery Questions
                  </span>
                  <span className="px-[6px] py-[1px] rounded-full bg-black/5 text-[9px] font-bold text-black/45 font-['Inter:Bold',sans-serif]">
                    {DISCOVERY_QUESTIONS.length}
                  </span>
                </span>
                <span className="text-black/35 group-hover:text-[#4600F2] transition-colors">
                  {showDiscoveryQs ? (
                    <ChevronUp size={14} strokeWidth={2.5} />
                  ) : (
                    <ChevronDown size={14} strokeWidth={2.5} />
                  )}
                </span>
              </button>
              {showDiscoveryQs && (
                <ol className="mt-[12px] space-y-[10px]">
                  {DISCOVERY_QUESTIONS.map((q, i) => (
                    <li key={i} className="flex gap-[10px]">
                      <span className="shrink-0 size-[18px] rounded-full bg-[rgba(70,0,242,0.08)] text-[9px] font-bold text-[#4600F2] flex items-center justify-center mt-[1px] font-['Inter:Bold',sans-serif]">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-black/65 font-['Inter:Regular',sans-serif] leading-[15px]">
                        {q}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* ── RIGHT STEP CONTENT ─────────────────────────────────────── */}
          <div ref={stepBodyRef} className="min-w-0 min-h-0 overflow-y-auto pr-[4px]">

            {/* Step progress header */}
            <div className="mb-[12px] flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[1.2px] text-black/40 font-['Inter:Bold',sans-serif]">
                Setup progress
              </p>
              <span className="text-[10px] font-bold text-black/55 font-['Inter:Bold',sans-serif]">
                Step {step} of {STEPS.length}
              </span>
            </div>

            {/* Step tabs with connector */}
            <div className="flex items-stretch gap-[6px] mb-[20px]">
              {STEPS.map((s, idx) => {
                const isActive = step === s.key;
                const isDone = step > s.key;
                return (
                  <div key={s.key} className="flex-1 flex items-center gap-[6px]">
                    <button
                      type="button"
                      onClick={() => setStep(s.key)}
                      className={`flex-1 rounded-[12px] border-2 px-[14px] py-[12px] flex items-center gap-[12px] transition-all text-left ${
                        isActive
                          ? "border-[#4600F2] bg-white shadow-[0_4px_14px_rgba(70,0,242,0.15)]"
                          : isDone
                          ? "border-[#4600F2]/20 bg-[#F4F0FF] hover:border-[#4600F2]/40"
                          : "border-dashed border-black/15 bg-white/40 hover:border-[#4600F2]/30"
                      }`}
                    >
                      <span
                        className={`size-[34px] rounded-full flex items-center justify-center text-[14px] font-bold font-['Inter:Bold',sans-serif] shrink-0 transition-colors ${
                          isActive
                            ? "bg-[#4600F2] text-white shadow-[0_3px_10px_rgba(70,0,242,0.35)]"
                            : isDone
                            ? "bg-[#4600F2]/15 text-[#4600F2]"
                            : "bg-black/5 text-black/35"
                        }`}
                      >
                        {isDone ? <Check size={15} strokeWidth={3} /> : s.key}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-[9px] font-bold uppercase tracking-[0.8px] mb-[2px] font-['Inter:Bold',sans-serif] ${
                            isActive
                              ? "text-[#4600F2]"
                              : isDone
                              ? "text-[#4600F2]/70"
                              : "text-black/35"
                          }`}
                        >
                          Step {s.key}
                        </p>
                        <p
                          className={`text-[12px] font-bold truncate font-['Inter:Bold',sans-serif] ${
                            isActive ? "text-[#0a0a0a]" : "text-black/55"
                          }`}
                        >
                          {s.label}
                        </p>
                      </div>
                    </button>
                    {idx < STEPS.length - 1 && (
                      <div className="flex items-center gap-[2px] px-[2px] shrink-0">
                        <span className="size-[3px] rounded-full bg-black/20" />
                        <span className="size-[3px] rounded-full bg-black/20" />
                        <span className="size-[3px] rounded-full bg-black/20" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ─── STEP 1: Dealership profile ─── */}
            {step === 1 && (
              <div className="space-y-[16px]">
                <div data-step-fade>
                  <SectionCard
                    eyebrow="Volume"
                    title="Inventory & throughput"
                    badge
                    badgeKind="required"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                      <MetricCard
                        label="Units on lot"
                        value={config.totalInventory}
                        suffix="cars"
                        min={50}
                        max={2000}
                        step={10}
                        onChange={(v) => set("totalInventory", v)}
                        benchmarkLabel="Top dealer range"
                        benchmarkValue="500–1,000"
                      />
                      <MetricCard
                        label="Monthly sales volume"
                        value={config.monthlySalesVolume}
                        suffix="units/mo"
                        min={20}
                        max={400}
                        step={5}
                        onChange={(v) => set("monthlySalesVolume", v)}
                        benchmarkLabel="Industry turn target"
                        benchmarkValue="1.6–2.0×"
                      />
                    </div>

                    <div className="mt-[14px] rounded-[10px] bg-[#F4F0FF] border border-[#4600F2]/15 px-[14px] py-[10px] flex items-center justify-between">
                      <p className="text-[11px] text-[#4600F2]/85 font-['Inter:Regular',sans-serif]">
                        Inventory turn rate{" "}
                        <span className="font-bold">
                          {config.totalInventory > 0
                            ? (config.monthlySalesVolume / config.totalInventory).toFixed(2)
                            : "0.00"}
                          ×
                        </span>
                        {" "}· target 1.6–2.0×
                      </p>
                    </div>
                  </SectionCard>
                </div>

                <div data-step-fade>
                  <SectionCard
                    eyebrow="Footprint"
                    title="Rooftops"
                    badge
                    badgeKind="required"
                  >
                    <FieldLabel
                      required
                      error={showErrors && step === 1 && step1Missing.numRooftops}
                    >
                      Number of rooftops
                    </FieldLabel>
                    <div
                      className={`rounded-[10px] transition-colors ${
                        showErrors && step === 1 && step1Missing.numRooftops
                          ? "ring-1 ring-[#EF4444]/50 p-[6px] -m-[6px]"
                          : ""
                      }`}
                    >
                      <ChipGroup
                        options={ROOFTOP_OPTIONS}
                        value={config.numRooftops}
                        onChange={(v) => set("numRooftops", v)}
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Performance & spend ─── */}
            {step === 2 && (
              <div className="space-y-[16px]">
                <div data-step-fade>
                  <SectionCard
                    eyebrow="Current workflow"
                    title="Photo & listing process"
                    badge
                    badgeKind="required"
                  >
                    <div className="space-y-[18px]">
                      <div>
                        <FieldLabel
                          required
                          error={showErrors && step === 2 && step2Missing.daysToLiveChip}
                        >
                          Avg days from acquisition to listing go-live
                        </FieldLabel>
                        <div
                          className={`rounded-[10px] transition-colors ${
                            showErrors && step === 2 && step2Missing.daysToLiveChip
                              ? "ring-1 ring-[#EF4444]/50 p-[6px] -m-[6px]"
                              : ""
                          }`}
                        >
                          <ChipGroup
                            options={DAYS_TO_LIVE_OPTIONS}
                            value={config.daysToLiveChip}
                            onChange={(v) => set("daysToLiveChip", v)}
                          />
                        </div>
                        {config.daysToLiveChip && (
                          <p className="mt-[8px] text-[11px] text-[#4600F2]/80 font-['Inter:Regular',sans-serif] inline-flex items-center gap-[6px]">
                            <span className="size-[6px] rounded-full bg-[#10B981]" />
                            Studio AI target: 1 day — saves{" "}
                            <span className="font-bold">
                              {opp.frontlineGapDays} days × ${config.holdingCostPerDay} ×{" "}
                              {config.monthlySalesVolume} units/mo
                            </span>
                          </p>
                        )}
                      </div>

                      <div>
                        <FieldLabel
                          required
                          error={showErrors && step === 2 && step2Missing.photographyProcess}
                        >
                          Current photography process
                        </FieldLabel>
                        <div
                          className={`rounded-[10px] transition-colors ${
                            showErrors && step === 2 && step2Missing.photographyProcess
                              ? "ring-1 ring-[#EF4444]/50 p-[6px] -m-[6px]"
                              : ""
                          }`}
                        >
                          <ChipGroup
                            options={PHOTO_PROCESS_OPTIONS}
                            value={config.photographyProcess}
                            onChange={(v) => set("photographyProcess", v)}
                          />
                        </div>
                        {config.photographyProcess && (
                          <p className="mt-[8px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif]">
                            Est.{" "}
                            <span className="font-bold text-[#EF4444]">
                              ~{PHOTO_PROCESS_GAP_MAP[config.photographyProcess]}%
                            </span>{" "}
                            of inventory without photos
                          </p>
                        )}
                      </div>

                      <div>
                        <FieldLabel>Media formats currently produced</FieldLabel>
                        <MultiChipGroup
                          options={MEDIA_FORMAT_OPTIONS}
                          values={config.mediaFormats}
                          onChange={(v) => set("mediaFormats", v)}
                        />
                      </div>
                    </div>
                  </SectionCard>
                </div>

                <div data-step-fade>
                  <SectionCard
                    eyebrow="Friction"
                    title="Biggest pain points"
                    badge
                    badgeKind="required"
                  >
                    <FieldLabel
                      required
                      error={showErrors && step === 2 && step2Missing.painPoints}
                    >
                      Select all that apply
                    </FieldLabel>
                    <div
                      className={`rounded-[10px] transition-colors ${
                        showErrors && step === 2 && step2Missing.painPoints
                          ? "ring-1 ring-[#EF4444]/50 p-[6px] -m-[6px]"
                          : ""
                      }`}
                    >
                      <MultiChipGroup
                        options={PAIN_POINT_OPTIONS}
                        values={config.painPoints}
                        onChange={(v) => set("painPoints", v)}
                      />
                    </div>
                  </SectionCard>
                </div>

                <div data-step-fade>
                  <SectionCard
                    eyebrow="Deal economics"
                    title="Assumptions"
                    hint="Defaults pre-filled. Adjust if you have data."
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
                      <MetricCard
                        label="Holding cost / day"
                        value={config.holdingCostPerDay}
                        prefix="$"
                        suffix="/day"
                        min={30}
                        max={60}
                        step={1}
                        onChange={(v) => {
                          set("holdingCostPerDay", v);
                          set("holdingCostChip", "Custom");
                        }}
                        badge="editable"
                        benchmarkLabel="Mid-volume benchmark"
                        benchmarkValue="$46/day"
                      />
                      <MetricCard
                        label="Cost per VIN photo"
                        value={config.perVinCost}
                        prefix="$"
                        suffix="/car"
                        min={0}
                        max={40}
                        step={1}
                        onChange={(v) => set("perVinCost", v)}
                        badge="editable"
                        benchmarkLabel="Industry baseline"
                        benchmarkValue="$15–$25"
                      />
                    </div>

                    <div className="mt-[16px]">
                      <FieldLabel>Monthly photography spend</FieldLabel>
                      <ChipGroup
                        options={SPEND_OPTIONS}
                        value={config.monthlyPhotographySpend}
                        onChange={(v) => set("monthlyPhotographySpend", v)}
                      />
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ── OUTPUT BAR ─── */}
            <div
              data-fade
              className="mt-[20px] bg-white rounded-[16px] border border-black/8 px-[20px] py-[16px] flex items-center justify-between gap-[16px]"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#4600F2] mb-[3px] font-['Inter:Bold',sans-serif]">
                  Output
                </p>
                <p className="text-[14px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                  Gap analysis{" "}
                  <span className="text-black/45 font-medium font-['Inter:Regular',sans-serif]">
                    vs. top dealers
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[28px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] leading-none">
                  ${opp.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-[3px] text-[10px] text-black/40 font-['Inter:Regular',sans-serif]">
                  Monthly reclaimable
                </p>
              </div>
            </div>

            {/* ── ERROR BANNER ─── */}
            {showErrors && currentMissingList.length > 0 && (
              <div className="mt-[16px] rounded-[12px] border border-[#EF4444]/30 bg-[#FEF2F2] px-[14px] py-[12px] flex items-start gap-[10px]">
                <span className="size-[22px] rounded-full bg-[#EF4444]/15 flex items-center justify-center text-[#EF4444] shrink-0 mt-[1px]">
                  <AlertCircle size={13} strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#B91C1C] font-['Inter:Bold',sans-serif]">
                    Fill the required fields before continuing
                  </p>
                  <p className="mt-[3px] text-[11px] text-[#B91C1C]/85 font-['Inter:Regular',sans-serif]">
                    Missing:{" "}
                    <span className="font-semibold">
                      {currentMissingList.join(", ")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP NAV ─── */}
            <div className="mt-[16px] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={step === 1}
                className={`h-[40px] px-[16px] rounded-[12px] text-[12px] font-semibold inline-flex items-center gap-[6px] border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                  step === 1
                    ? "border-black/8 text-black/25 cursor-not-allowed bg-white"
                    : "border-black/15 bg-white text-black/65 hover:border-[#4600F2]/40 hover:text-[#4600F2]"
                }`}
              >
                <ArrowLeft size={13} strokeWidth={2.5} />
                Back
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canAdvance) {
                      setShowErrors(true);
                      return;
                    }
                    setStep(2);
                  }}
                  className="h-[40px] px-[18px] rounded-[12px] text-[12px] font-bold inline-flex items-center gap-[6px] transition-all font-['Inter:Bold',sans-serif] bg-[#4600F2] text-white hover:bg-[#3a00c9] active:scale-[0.98] shadow-[0_4px_14px_rgba(70,0,242,0.30)]"
                >
                  Next: Performance &amp; spend
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!allValid) {
                      setShowErrors(true);
                      return;
                    }
                    onLaunch(config);
                  }}
                  className="h-[42px] px-[20px] rounded-[12px] text-[12px] font-bold inline-flex items-center gap-[8px] transition-all font-['Inter:Bold',sans-serif] text-white shadow-[0_8px_20px_rgba(70,0,242,0.28)] hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background:
                      "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                  }}
                >
                  <Sparkles size={13} strokeWidth={2.5} />
                  {config.dealershipName.trim()
                    ? `Launch demo for ${config.dealershipName.trim()}`
                    : "Launch demo"}
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
