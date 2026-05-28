import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Sparkles, ArrowRight, Camera, Clock, DollarSign,
  ChevronDown, ChevronUp, Info,
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
const HOLDING_COST_CHIPS = ["$40", "$43", "$46", "$50", "Custom"];

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

// ─── Small UI helpers ──────────────────────────────────────────────────────

function Req() {
  return (
    <span className="ml-[4px] px-[5px] py-[1px] rounded text-[8px] font-bold uppercase tracking-[0.4px] bg-[#EF4444]/10 text-[#EF4444] font-['Inter:Bold',sans-serif]">
      Required
    </span>
  );
}

function FieldLabel({
  children, required, hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-[4px] mb-[7px]">
      <span className="text-[10px] uppercase tracking-[0.6px] font-bold text-black/50 font-['Inter:Bold',sans-serif]">
        {children}
      </span>
      {required && <Req />}
      {hint && (
        <span className="group relative inline-flex ml-[2px]">
          <Info size={11} className="text-black/30" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-[6px] hidden group-hover:block bg-[#0a0a0a] text-white text-[10px] px-[6px] py-[3px] rounded whitespace-nowrap z-10 pointer-events-none font-['Inter:Regular',sans-serif]">
            {hint}
          </span>
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
          className={`h-[26px] px-[9px] rounded-full text-[10px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
            value === opt
              ? "bg-[#4600F2] text-white border-[#4600F2]"
              : "bg-white text-black/60 border-black/15 hover:border-[#4600F2]/40"
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
          className={`h-[26px] px-[9px] rounded-full text-[10px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
            values.includes(opt)
              ? "bg-[#4600F2] text-white border-[#4600F2]"
              : "bg-white text-black/60 border-black/15 hover:border-[#4600F2]/40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// Left panel section wrapper
function PanelSection({
  title, children, last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`px-[20px] py-[16px] ${last ? "" : "border-b border-black/8"}`}>
      <p className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#4600F2]/60 mb-[13px] font-['Inter:Bold',sans-serif]">
        {title}
      </p>
      <div className="space-y-[13px]">{children}</div>
    </div>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step = 1, format, benchmark, required, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (v: number) => string;
  benchmark?: string;
  required?: boolean;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-[8px]">
        <FieldLabel required={required}>{label}</FieldLabel>
        <span className="text-[18px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] leading-none">
          {format(value)}
        </span>
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
      <div className="flex justify-between mt-[5px]">
        <span className="text-[9px] text-black/30 font-['Inter:Regular',sans-serif]">{format(min)}</span>
        <span className="text-[9px] text-black/30 font-['Inter:Regular',sans-serif]">{format(max)}+</span>
      </div>
      {benchmark && (
        <p className="mt-[4px] text-[10px] text-black/40 font-['Inter:Regular',sans-serif]">{benchmark}</p>
      )}
    </div>
  );
}

// ─── Stat box (right panel header) ────────────────────────────────────────

function StatBox({
  label, value, sub, variant,
}: {
  label: string;
  value: string;
  sub?: string;
  variant: "neutral" | "alert" | "accent" | "warn";
}) {
  const styles = {
    neutral: {
      wrap: "bg-white border-black/10",
      label: "text-black/40",
      value: "text-[#0a0a0a]",
    },
    alert: {
      wrap: "bg-[#FEF2F2] border-[#EF4444]/25",
      label: "text-[#EF4444]/70",
      value: "text-[#EF4444]",
    },
    accent: {
      wrap: "bg-[#F4F0FF] border-[#4600F2]/20",
      label: "text-[#4600F2]/70",
      value: "text-[#4600F2]",
    },
    warn: {
      wrap: "bg-[#FFFBEB] border-[#F59E0B]/30",
      label: "text-[#B45309]/80",
      value: "text-[#B45309]",
    },
  };
  const s = styles[variant];
  return (
    <div className={`flex-1 rounded-[14px] border p-[14px] ${s.wrap}`}>
      <p className={`text-[9px] font-bold uppercase tracking-[0.6px] mb-[6px] ${s.label} font-['Inter:Bold',sans-serif]`}>
        {label}
      </p>
      <p className={`text-[22px] font-bold leading-none ${s.value} font-['Inter:Bold',sans-serif]`}>
        {value}
      </p>
      {sub && (
        <p className="mt-[4px] text-[10px] text-black/35 font-['Inter:Regular',sans-serif]">{sub}</p>
      )}
    </div>
  );
}

// ─── Impact card ───────────────────────────────────────────────────────────

function ImpactCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div
      className="flex-1 rounded-[14px] p-[16px] border"
      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
    >
      <div className="flex items-center gap-[8px] mb-[10px]">
        <div
          className="size-[28px] rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-black/50 font-['Inter:Semi_Bold',sans-serif]">
          {label}
        </p>
      </div>
      <p
        className="text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-none"
        style={{ color: accent }}
      >
        {value}
        <span className="text-[11px] font-medium text-black/40 ml-[4px]">/mo</span>
      </p>
      <p className="mt-[4px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">
        {sub}
      </p>
    </div>
  );
}

// ─── Right panel section label ─────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.8px] text-black/40 mb-[10px] font-['Inter:Bold',sans-serif]">
      {children}
    </p>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

interface Props {
  onLaunch: (config: DemoConfig) => void;
}

export function DemoSetupScreen({ onLaunch }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);

  const set = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const opp = calcOpportunity(config);

  // Holding cost chip handler — syncs both chip label and numeric value
  const setHoldingCostChip = (chip: string) => {
    set("holdingCostChip", chip);
    if (chip !== "Custom") {
      set("holdingCostPerDay", parseInt(chip.replace("$", ""), 10));
    }
  };

  // GSAP entrance
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-fade]");
    gsap.fromTo(
      items,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      {/* Top bar */}
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

      <div ref={containerRef} className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── LEFT: Discovery panel ────────────────────────────────────── */}
        <div className="w-[340px] shrink-0 bg-white border-r border-black/8 flex flex-col min-h-0">
          {/* Sticky header */}
          <div className="shrink-0 px-[20px] py-[14px] border-b border-black/8 bg-white">
            <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#4600F2] font-['Inter:Bold',sans-serif]">
              Discovery Inputs
            </p>
            <p className="mt-[3px] text-[11px] text-black/45 font-['Inter:Regular',sans-serif]">
              AE intake — fields marked <span className="font-semibold text-[#EF4444]">Required</span> are needed to launch
            </p>
          </div>

          {/* Scrolling body */}
          <div className="flex-1 overflow-auto">

          {/* Section 1: Account Details */}
          <PanelSection title="Account Details">
            <div data-fade>
              <FieldLabel>AE Name</FieldLabel>
              <input
                type="text"
                placeholder="Enter AE name"
                value={config.aeName}
                onChange={(e) => set("aeName", e.target.value)}
                className="w-full h-[34px] px-[10px] rounded-[8px] border border-black/15 bg-[#FAFAFA] text-[13px] text-[#0a0a0a] outline-none focus:border-[#4600F2] font-['Inter:Regular',sans-serif] placeholder:text-black/30"
              />
            </div>

            <div data-fade>
              <FieldLabel>Dealership Name</FieldLabel>
              <input
                type="text"
                placeholder="e.g. Valley Toyota"
                value={config.dealershipName}
                onChange={(e) => set("dealershipName", e.target.value)}
                className="w-full h-[34px] px-[10px] rounded-[8px] border border-black/15 bg-[#FAFAFA] text-[13px] text-[#0a0a0a] outline-none focus:border-[#4600F2] font-['Inter:Regular',sans-serif] placeholder:text-black/30"
              />
            </div>

            <div data-fade>
              <FieldLabel>IMS Provider</FieldLabel>
              <ChipGroup
                options={IMS_OPTIONS}
                value={config.imsProvider}
                onChange={(v) => set("imsProvider", v)}
              />
            </div>
          </PanelSection>

          {/* Section 2: Dealership Profile */}
          <PanelSection title="Dealership Profile">
            <div data-fade>
              <FieldLabel>Number of Rooftops</FieldLabel>
              <ChipGroup
                options={ROOFTOP_OPTIONS}
                value={config.numRooftops}
                onChange={(v) => set("numRooftops", v)}
              />
            </div>

            <div data-fade>
              <FieldLabel>Inventory Mix</FieldLabel>
              <ChipGroup
                options={INVENTORY_MIX_OPTIONS}
                value={config.inventoryMix}
                onChange={(v) => set("inventoryMix", v)}
              />
            </div>

            <div data-fade>
              <Slider
                label="Units on Lot"
                value={config.totalInventory}
                min={50}
                max={2000}
                step={10}
                format={(v) => `${v}`}
                required
                benchmark="Avg. active inventory at any given time across all rooftops"
                onChange={(v) => set("totalInventory", v)}
              />
            </div>
          </PanelSection>

          {/* Section 3: Current Process */}
          <PanelSection title="Current Process">
            <div data-fade>
              <FieldLabel
                required
                hint="Drives the frontline gap cost in the financial model"
              >
                Avg Days from Acquisition to Listing Go-Live
              </FieldLabel>
              <ChipGroup
                options={DAYS_TO_LIVE_OPTIONS}
                value={config.daysToLiveChip}
                onChange={(v) => set("daysToLiveChip", v)}
              />
              {config.daysToLiveChip && (
                <p className="mt-[6px] text-[10px] text-[#4600F2]/70 font-['Inter:Regular',sans-serif]">
                  Studio AI target: 1 day &rarr; saves{" "}
                  <span className="font-bold">
                    {opp.frontlineGapDays} days x ${config.holdingCostPerDay} x{" "}
                    {config.monthlySalesVolume} units/mo
                  </span>
                </p>
              )}
            </div>

            <div data-fade>
              <FieldLabel
                required
                hint="Estimates % of inventory without photos for media gap calculation"
              >
                Current Photography Process
              </FieldLabel>
              <ChipGroup
                options={PHOTO_PROCESS_OPTIONS}
                value={config.photographyProcess}
                onChange={(v) => set("photographyProcess", v)}
              />
              {config.photographyProcess && (
                <p className="mt-[6px] text-[10px] text-black/45 font-['Inter:Regular',sans-serif]">
                  Est.{" "}
                  <span className="font-semibold text-[#EF4444]">
                    ~{PHOTO_PROCESS_GAP_MAP[config.photographyProcess]}%
                  </span>{" "}
                  of inventory without photos
                </p>
              )}
            </div>

            <div data-fade>
              <FieldLabel>Media Formats Currently Produced</FieldLabel>
              <MultiChipGroup
                options={MEDIA_FORMAT_OPTIONS}
                values={config.mediaFormats}
                onChange={(v) => set("mediaFormats", v)}
              />
            </div>
          </PanelSection>

          {/* Section 4: Pain Points & Spend */}
          <PanelSection title="Pain Points & Spend" last>
            <div data-fade>
              <FieldLabel required>Biggest Pain Points</FieldLabel>
              <MultiChipGroup
                options={PAIN_POINT_OPTIONS}
                values={config.painPoints}
                onChange={(v) => set("painPoints", v)}
              />
            </div>

            {/* Photography spend — two input modes, fill either one */}
            <div data-fade className="rounded-[10px] border border-black/8 bg-[#FAFAFA] p-[12px] space-y-[10px]">
              <div>
                <FieldLabel hint="Common for vendors charging per shoot. Industry baseline: $15-$25/VIN.">
                  Cost per VIN
                </FieldLabel>
                <div className="flex items-center h-[30px] bg-white rounded-[8px] px-[9px] border border-black/12 focus-within:border-[#4600F2] w-[120px]">
                  <span className="text-[12px] text-black/50 font-semibold mr-[2px]">$</span>
                  <input
                    type="number"
                    value={config.perVinCost}
                    onChange={(e) => set("perVinCost", Number(e.target.value) || 0)}
                    className="flex-1 bg-transparent outline-none text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] min-w-0"
                  />
                  <span className="text-[10px] text-black/35 ml-[2px]">/ car</span>
                </div>
                {config.perVinCost > 0 && (
                  <p className="mt-[5px] text-[10px] text-black/40 font-['Inter:Regular',sans-serif]">
                    At {config.totalInventory} units: est.{" "}
                    <span className="font-semibold text-black/60">
                      ${(config.perVinCost * config.totalInventory).toLocaleString()}/mo
                    </span>{" "}
                    in photography costs
                  </p>
                )}
              </div>

              <div className="flex items-center gap-[8px]">
                <div className="flex-1 h-px bg-black/8" />
                <span className="text-[9px] font-bold uppercase tracking-[0.6px] text-black/30 font-['Inter:Bold',sans-serif]">or</span>
                <div className="flex-1 h-px bg-black/8" />
              </div>

              <div>
                <FieldLabel hint="Total monthly outlay including vendor fees, labour, and editing">
                  Monthly Photography Spend
                </FieldLabel>
                <div className="flex flex-wrap gap-[6px]">
                  {SPEND_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        set("monthlyPhotographySpend", config.monthlyPhotographySpend === opt ? "" : opt)
                      }
                      className={`h-[26px] px-[9px] rounded-full text-[10px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                        config.monthlyPhotographySpend === opt
                          ? "bg-[#4600F2] text-white border-[#4600F2]"
                          : "bg-white text-black/60 border-black/15 hover:border-[#4600F2]/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Discovery questions (collapsible) */}
            <div data-fade>
              <button
                type="button"
                onClick={() => setShowDiscovery((v) => !v)}
                className="inline-flex items-center gap-[5px] text-[10px] font-semibold text-black/45 hover:text-[#4600F2] transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                {showDiscovery ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showDiscovery ? "Hide" : "Show"} discovery script
              </button>
              {showDiscovery && (
                <ol className="mt-[10px] space-y-[8px]">
                  {DISCOVERY_QUESTIONS.map((q, i) => (
                    <li key={i} className="flex gap-[8px]">
                      <span className="shrink-0 size-[17px] rounded-full bg-[rgba(70,0,242,0.08)] text-[9px] font-bold text-[#4600F2] flex items-center justify-center mt-[1px] font-['Inter:Bold',sans-serif]">
                        {i + 1}
                      </span>
                      <p className="text-[10px] text-black/65 font-['Inter:Regular',sans-serif] leading-[14px]">
                        {q}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </PanelSection>
          </div>
        </div>

        {/* ── RIGHT: Opportunity model ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* ── STICKY TOP: Impact summary ─── */}
          {(() => {
            const turnRate = config.totalInventory > 0
              ? config.monthlySalesVolume / config.totalInventory
              : 0;
            const turnVariant: "accent" | "warn" | "alert" =
              turnRate >= 1.4 ? "accent" : turnRate >= 0.8 ? "warn" : "alert";
            const turnSub =
              turnRate >= 1.4
                ? "On track. Target: 1.6-2.0x"
                : turnRate >= 0.8
                ? "Below target. Target: 1.6-2.0x"
                : "Critical. Target: 1.6-2.0x";
            return (
              <div className="shrink-0 bg-white border-b border-black/8 px-[28px] pt-[16px] pb-[18px]">
                <div className="flex items-center justify-between mb-[10px]">
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-black/45 font-['Inter:Bold',sans-serif]">
                    Impact Snapshot
                  </p>
                  <p className="text-[10px] text-black/35 font-['Inter:Regular',sans-serif]">
                    Updates live as you tweak inputs
                  </p>
                </div>
                <div data-fade className="flex gap-[10px]">
                  <StatBox
                    label="Total Vehicles"
                    value={`${config.totalInventory}`}
                    sub="units on lot"
                    variant="neutral"
                  />
                  <StatBox
                    label="Monthly Sales"
                    value={`${config.monthlySalesVolume}`}
                    sub="units sold / mo"
                    variant="accent"
                  />
                  <StatBox
                    label="Inventory Turn Rate"
                    value={`${turnRate.toFixed(1)}x`}
                    sub={turnSub}
                    variant={turnVariant}
                  />
                  <StatBox
                    label="Est. Monthly Gap"
                    value={`$${opp.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
                    sub="across all three cost buckets"
                    variant="alert"
                  />
                </div>
              </div>
            );
          })()}

          {/* ── SCROLLING MIDDLE: inputs + breakdown ─── */}
          <div className="flex-1 overflow-auto">
          <div className="px-[28px] py-[20px] max-w-[900px]">

            {/* ── Section A: Financial Inputs ─── */}
            <div data-fade className="mb-[20px]">
              <SectionHeading>Financial Inputs</SectionHeading>
              <div className="bg-white rounded-[14px] border border-black/8 p-[16px] space-y-[16px]">

                {/* Monthly Sales Volume slider */}
                <Slider
                  label="Monthly Sales Volume"
                  value={config.monthlySalesVolume}
                  min={20}
                  max={400}
                  step={5}
                  format={(v) => `${v} units`}
                  benchmark="Used to calculate frontline gap holding cost formula"
                  onChange={(v) => set("monthlySalesVolume", v)}
                />

                <div className="border-t border-black/6" />

                {/* Holding cost chips */}
                <div>
                  <FieldLabel hint="Industry range: $40-$50/car/day. Mid-volume store benchmark: $46.44 (playbook 5-step formula)">
                    Holding Cost / Day
                  </FieldLabel>
                  <div className="flex items-center gap-[6px] flex-wrap">
                    {HOLDING_COST_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setHoldingCostChip(chip)}
                        className={`h-[28px] px-[10px] rounded-full text-[11px] font-semibold border transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                          config.holdingCostChip === chip
                            ? "bg-[#4600F2] text-white border-[#4600F2]"
                            : "bg-white text-black/60 border-black/15 hover:border-[#4600F2]/40"
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                    {config.holdingCostChip === "Custom" && (
                      <div className="flex items-center h-[28px] bg-[#F4F0FF] rounded-[8px] px-[8px] border border-[rgba(70,0,242,0.25)] focus-within:border-[#4600F2] ml-[2px]">
                        <span className="text-[12px] text-[#4600F2] font-semibold mr-[2px]">$</span>
                        <input
                          type="number"
                          value={config.holdingCostPerDay}
                          onChange={(e) => set("holdingCostPerDay", Number(e.target.value) || 0)}
                          className="w-[48px] bg-transparent outline-none text-[13px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif]"
                        />
                        <span className="text-[10px] text-[#4600F2]/60 ml-[2px]">/day</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-[6px] text-[10px] text-black/40 font-['Inter:Regular',sans-serif]">
                    40 cars x 10 extra days = ${(40 * 10 * config.holdingCostPerDay).toLocaleString()} in avoidable holding cost
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section B: Monthly Opportunity Breakdown ─── */}
            <div data-fade className="mb-[20px]">
              <SectionHeading>Monthly Opportunity Breakdown</SectionHeading>
              <div className="flex gap-[10px]">
                <ImpactCard
                  icon={<Camera size={14} strokeWidth={2.5} />}
                  label="Photography Cost"
                  value={
                    opp.photographyCostMonthly >= 1000
                      ? `$${Math.round(opp.photographyCostMonthly / 1000)}K`
                      : `$${opp.photographyCostMonthly.toLocaleString()}`
                  }
                  sub={
                    config.monthlyPhotographySpend
                      ? `Current monthly spend: ${config.monthlyPhotographySpend}`
                      : `$${config.perVinCost}/car x ${config.totalInventory} units on lot`
                  }
                  accent="#0891B2"
                />
                <ImpactCard
                  icon={<Clock size={14} strokeWidth={2.5} />}
                  label="Frontline Gap Cost"
                  value={`$${Math.round(opp.frontlineMonthly / 1000)}K`}
                  sub={`${opp.frontlineGapDays} days above 1-day target x $${config.holdingCostPerDay}/day x ${config.monthlySalesVolume} units`}
                  accent="#F59E0B"
                />
                <ImpactCard
                  icon={<DollarSign size={14} strokeWidth={2.5} />}
                  label="Aged Inventory Exposure"
                  value={`$${Math.round(opp.agedMonthly / 1000)}K`}
                  sub={`~${opp.agedVehicles} vehicles at 45+ days. Break-even at day ${opp.breakEvenDay}`}
                  accent="#4600F2"
                />
              </div>
            </div>

            {/* ── Section C: How the gap is calculated (collapsible) ─── */}
            <div data-fade className="mb-[20px]">
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-black/55 hover:text-[#4600F2] transition-colors mb-[10px] font-['Inter:Semi_Bold',sans-serif]"
              >
                {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showBreakdown ? "Hide" : "Show"} calculation breakdown
              </button>

              {showBreakdown && (
                <div className="rounded-[12px] border border-black/8 bg-white overflow-hidden text-[12px]">
                  <div className="px-[16px] py-[10px] bg-[#F4F0FF] border-b border-black/8">
                    <span className="font-bold text-[#4600F2] font-['Inter:Bold',sans-serif]">
                      How the monthly gap is calculated
                    </span>
                  </div>
                  {[
                    {
                      label: "Media Gap",
                      detail: `${opp.vehiclesNoPhotos} vehicles x $220/wk x 4 weeks`,
                      sub: `Est. ${opp.pctWithoutPhotos}% without photos based on photography process`,
                      value: opp.mediaGapMonthly,
                      color: "#EF4444",
                    },
                    {
                      label: "Frontline Gap",
                      detail: `${opp.frontlineGapDays} extra days x $${config.holdingCostPerDay} x ${config.monthlySalesVolume} units`,
                      sub: "Days above Studio AI 1-day target",
                      value: opp.frontlineMonthly,
                      color: "#F59E0B",
                    },
                    {
                      label: "Aged Inventory (45+ days)",
                      detail: `${opp.agedVehicles} vehicles x $${config.holdingCostPerDay}/day x 30 days`,
                      sub: "~15% of lot beyond the break-even threshold",
                      value: opp.agedMonthly,
                      color: "#4600F2",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between px-[16px] py-[11px] border-b border-black/5 last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">
                          {row.label}
                        </p>
                        <p className="text-black/45 font-['Inter:Regular',sans-serif] mt-[1px]">
                          {row.detail}
                        </p>
                        <p className="text-black/30 font-['Inter:Regular',sans-serif] mt-[1px] text-[11px]">
                          {row.sub}
                        </p>
                      </div>
                      <span
                        className="font-bold font-['Inter:Bold',sans-serif] text-[14px] shrink-0 ml-[16px] px-[10px] py-[4px] rounded-[8px]"
                        style={{
                          color: row.color,
                          background: `${row.color}10`,
                        }}
                      >
                        ${row.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-[16px] py-[12px] bg-[#F4F0FF]">
                    <span className="font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                      Total monthly opportunity
                    </span>
                    <span
                      className="font-bold text-[#4600F2] text-[15px] font-['Inter:Bold',sans-serif] px-[12px] py-[5px] rounded-[8px]"
                      style={{ background: "rgba(70,0,242,0.08)" }}
                    >
                      ${opp.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── What Studio AI closes ─── */}
            <div
              data-fade
              className="rounded-[14px] border border-[rgba(70,0,242,0.2)] bg-[rgba(70,0,242,0.04)] px-[20px] py-[16px] mb-[24px] flex items-center justify-between gap-[20px]"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[1px] font-bold text-[#4600F2] mb-[4px] font-['Inter:Bold',sans-serif]">
                  What Studio AI closes
                </p>
                <p className="text-[14px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                  Fills {opp.vehiclesNoPhotos} photo gaps overnight.
                  Frontline drops from {opp.currentDaysToFrontline} days to 1 day.
                  Smart Campaigns auto-target {opp.agedVehicles} aged units.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] uppercase tracking-[0.6px] font-semibold text-black/45 font-['Inter:Semi_Bold',sans-serif]">
                  Monthly reclaim
                </p>
                <p className="text-[28px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] leading-none">
                  ${opp.totalMonthly.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

          </div>
          </div>

          {/* ── STICKY BOTTOM: Launch CTA ─── */}
          <div className="shrink-0 bg-white border-t border-black/8 px-[28px] py-[14px]">
            <div className="max-w-[900px] flex items-center gap-[16px]">
              <p className="flex-1 text-[11px] text-black/45 font-['Inter:Regular',sans-serif] leading-[15px]">
                The demo will be pre-loaded with{" "}
                <span className="font-semibold text-black/65">
                  {config.dealershipName || "this dealership"}
                </span>
                's numbers and benchmarks.
              </p>
              <button
                type="button"
                onClick={() => onLaunch(config)}
                className="shrink-0 h-[48px] px-[22px] rounded-[12px] text-white text-[14px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center justify-center gap-[10px] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                  boxShadow: "0 8px 20px rgba(70,0,242,0.28)",
                }}
              >
                <Sparkles size={15} strokeWidth={2.5} />
                {config.dealershipName.trim()
                  ? `Launch Demo for ${config.dealershipName.trim()}`
                  : "Launch Demo"}
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
