import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X,
  Layers, ImageOff, Timer, Eye,
  Sparkles, MonitorPlay, Type, SlidersHorizontal,
  Snowflake, Building2, Clock,
} from "lucide-react";
import imgCampaigns from "../assets/smart-campaigns-example.png";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Reserved for future direct campaign trigger (e.g. from a CTA inside the deck) */
  onCreate?: () => void;
}

const MAGENTA = "#E91E63";
const PURPLE = "#7F6AF2";
const MAGENTA_GRAD = "linear-gradient(90deg, #FF5C9A 0%, #B651D7 100%)";

// ─── Atoms (mirroring the pitch-modal style) ─────────────────────────────────

function Eyebrow({ children, color = MAGENTA }: { children: React.ReactNode; color?: string }) {
  return (
    <p
      className="text-[10px] font-bold tracking-[2px] uppercase font-['Inter:Bold',sans-serif] mb-[8px]"
      style={{ color }}
    >
      {children}
    </p>
  );
}

function Pointer({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] bg-white border border-black/8">
      <span
        className="size-[28px] rounded-[8px] flex items-center justify-center shrink-0"
        style={{ background: "rgba(233,30,99,0.10)", color: MAGENTA }}
      >
        {icon}
      </span>
      <p className="text-[12.5px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">{text}</p>
    </div>
  );
}

function FeatureCard({
  icon, title, tagline, accent,
}: { icon: React.ReactNode; title: string; tagline: string; accent: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-black/8 p-[14px] relative">
      <span
        className="size-[36px] rounded-[10px] flex items-center justify-center mb-[10px]"
        style={{ background: `${accent}1A`, color: accent }}
      >
        {icon}
      </span>
      <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[16px]">{title}</p>
      <p className="mt-[3px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">{tagline}</p>
    </div>
  );
}

function StepBlock({
  n, title, tagline, accent,
}: { n: string; title: string; tagline: string; accent: string }) {
  return (
    <div>
      <p className="text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-none" style={{ color: accent }}>
        {n}
      </p>
      <p className="mt-[6px] text-[12.5px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[15px]">{title}</p>
      <p className="mt-[2px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">{tagline}</p>
    </div>
  );
}

function BuiltForCard({
  title, tagline, accent, icon,
}: { title: string; tagline: string; accent: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[12px] border border-black/8 p-[14px] relative overflow-hidden">
      <div className="absolute left-[10px] right-[10px] top-0 h-[3px] rounded-b-full" style={{ background: accent }} />
      <span
        className="mt-[8px] inline-flex size-[28px] rounded-[8px] items-center justify-center"
        style={{ background: `${accent}1A`, color: accent }}
      >
        {icon}
      </span>
      <p className="mt-[10px] text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[16px]">{title}</p>
      <p className="mt-[3px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">{tagline}</p>
    </div>
  );
}

function Divider() {
  return <div className="my-[18px] h-px bg-black/8" />;
}

// ─── Popover ─────────────────────────────────────────────────────────────────

export function SmartCampaignDeck({ open, onClose }: Props) {
  const popRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const pop = popRef.current;
    if (!pop) return;
    gsap.fromTo(
      pop,
      { y: 10, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)", delay: 0.08 }
    );
    const body = bodyRef.current;
    if (body) {
      const sections = body.querySelectorAll<HTMLElement>("[data-section]");
      gsap.fromTo(
        sections,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out", delay: 0.18 }
      );
    }
  }, [open]);

  // Click-outside dismiss
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const pop = popRef.current;
      if (!pop) return;
      if (e.target instanceof Node && !pop.contains(e.target)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onDown), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={popRef}
      style={{ pointerEvents: "auto" }}
      className="fixed bottom-[108px] left-1/2 -translate-x-1/2 z-[55] w-[calc(100vw-32px)] max-w-[920px]"
    >
      <div className="relative bg-white rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.22)] border border-black/5 max-h-[calc(100vh-160px)] flex flex-col overflow-hidden">
        {/* Sticky close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[14px] right-[14px] z-10 size-[32px] rounded-full bg-white/95 hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
          aria-label="Close"
        >
          <X size={17} className="text-black/55" />
        </button>

        {/* Scrollable body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-[36px] py-[32px]">
          {/* HERO — 2-col: pitch + Smart Campaigns mockup */}
          <div data-section className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-[24px] items-center">
            <div>
              <Eyebrow>Step 04 · Smart Suite · Performance</Eyebrow>
              <h1 className="text-[32px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[36px] tracking-tight">
                Smart Campaigns.
              </h1>
              <h1
                className="text-[32px] font-bold font-['Inter:Bold',sans-serif] leading-[36px] tracking-tight"
                style={{
                  background: MAGENTA_GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Win the attention battle.
              </h1>
              <p className="mt-[10px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif]">
                Branded creatives across every listing — automatically.
              </p>
            </div>
            <div className="relative rounded-[14px] overflow-hidden border border-black/8 bg-[#FAFAFB]">
              <img
                src={imgCampaigns}
                alt="Smart Campaigns — overlays, billboards and text applied to listings"
                className="block w-full h-auto"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 100% 0%, rgba(255,92,154,0.10) 0%, transparent 60%)",
                }}
              />
            </div>
          </div>

          <Divider />

          {/* PROBLEM */}
          <div data-section>
            <Eyebrow>Why campaigns fall through the cracks</Eyebrow>
            <div className="grid grid-cols-2 gap-[10px]">
              <Pointer icon={<ImageOff size={15} />} text="Every listing looks the same" />
              <Pointer icon={<Timer size={15} />}    text="Aged inventory left untouched" />
              <Pointer icon={<Building2 size={15} />} text="Inconsistent across locations" />
              <Pointer icon={<Eye size={15} />}      text="No preview before going live" />
            </div>
          </div>

          <Divider />

          {/* SOLUTION */}
          <div data-section>
            <Eyebrow>The Solution</Eyebrow>
            <h2 className="text-[18px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Automated visual campaigns across every listing.
            </h2>
            <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
              <FeatureCard
                icon={<Sparkles size={18} strokeWidth={2.2} />}
                title="Promotional Overlays"
                tagline="Branded overlays on every photo."
                accent={MAGENTA}
              />
              <FeatureCard
                icon={<MonitorPlay size={18} strokeWidth={2.2} />}
                title="Promotional Billboards"
                tagline="Full-frame offers in the photo set."
                accent="#F43F5E"
              />
              <FeatureCard
                icon={<Type size={18} strokeWidth={2.2} />}
                title="Dynamic Text Overlays"
                tagline="Price & specs auto-update live."
                accent="#10B981"
              />
              <FeatureCard
                icon={<SlidersHorizontal size={18} strokeWidth={2.2} />}
                title="Campaign Control"
                tagline="Schedule, pause, preview — anytime."
                accent="#4600F2"
              />
            </div>
          </div>

          <Divider />

          {/* HOW IT WORKS */}
          <div data-section>
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Set rules once. Campaigns run themselves.
            </h2>
            <div className="mt-[12px] grid grid-cols-4 gap-[12px]">
              <StepBlock n="01" title="Create"     tagline="Name it, set dates."           accent={MAGENTA} />
              <StepBlock n="02" title="Filter"     tagline="Trim, age, make, price."        accent={MAGENTA} />
              <StepBlock n="03" title="Assign"     tagline="Pick overlays or billboards."   accent={MAGENTA} />
              <StepBlock n="04" title="Auto-apply" tagline="Updates as inventory changes."  accent={MAGENTA} />
            </div>
          </div>

          <Divider />

          {/* BUILT FOR */}
          <div data-section>
            <Eyebrow color={PURPLE}>Built For</Eyebrow>
            <h2 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Every campaign scenario.
            </h2>
            <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
              <BuiltForCard
                icon={<Clock size={14} strokeWidth={2.2} />}
                title="Aged Inventory"
                tagline="30+ day visual push."
                accent={MAGENTA}
              />
              <BuiltForCard
                icon={<Snowflake size={14} strokeWidth={2.2} />}
                title="Seasonal Promotions"
                tagline="Holidays, manufacturer offers, month-end."
                accent="#F43F5E"
              />
              <BuiltForCard
                icon={<Building2 size={14} strokeWidth={2.2} />}
                title="Multi-location"
                tagline="One brand, every location."
                accent={PURPLE}
              />
            </div>
          </div>
        </div>

        {/* Tail pointing down toward the action bar */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: -8,
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid #fff",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.06))",
          }}
        />
      </div>

      {/* Subtle helper tag — borrows the Smart Match pitch's bottom hint */}
      <div className="mt-[10px] flex items-center justify-center gap-[6px] text-[11px] text-white/85 font-['Inter:Medium',sans-serif] font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
        <Layers size={11} />
        Smart Campaigns · ready to brand every listing
      </div>
    </div>,
    document.body
  );
}
