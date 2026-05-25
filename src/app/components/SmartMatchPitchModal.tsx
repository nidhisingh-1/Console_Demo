import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X, ArrowRight, ChevronLeft, Layers, Check,
  Lock, Hourglass, FileSearch, Users,
  Rocket, Calendar, Search, Eye,
} from "lucide-react";
import imgSmartMatch from "../assets/smart-match-example.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  completed?: boolean;
}

const MAGENTA = "#E91E63";
const PURPLE = "#7F6AF2";
const MAGENTA_GRAD = "linear-gradient(90deg, #FF5C9A 0%, #B651D7 100%)";

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
      <span className="size-[28px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: "rgba(233,30,99,0.10)", color: MAGENTA }}>
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
  title, tagline, accent,
}: { title: string; tagline: string; accent: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-black/8 p-[14px] relative overflow-hidden">
      <div className="absolute left-[10px] right-[10px] top-0 h-[3px] rounded-b-full" style={{ background: accent }} />
      <p className="mt-[8px] text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[16px]">{title}</p>
      <p className="mt-[3px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">{tagline}</p>
    </div>
  );
}

function Divider() {
  return <div className="my-[20px] h-px bg-black/8" />;
}

export function SmartMatchPitchModal({ open, onClose, onContinue, onBack, completed }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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
    const body = bodyRef.current;
    if (body) {
      const targets = body.querySelectorAll<HTMLElement>("[data-pitch-section] > *");
      gsap.fromTo(
        targets,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute top-[16px] right-[16px] z-10 flex items-center gap-[10px]">
          {completed && (
            <span className="inline-flex items-center gap-[4px] px-[10px] py-[4px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]">
              <Check size={11} strokeWidth={3} />
              Completed
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="size-[32px] rounded-full bg-white/95 hover:bg-black/5 flex items-center justify-center transition-colors shadow-sm"
            aria-label="Close"
          >
            <X size={18} className="text-black/65" />
          </button>
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-[36px] py-[32px]" data-pitch-section>
          {/* HERO — 2-col: pitch + Smart Match diagram */}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-[24px] items-center">
            <div>
              <Eyebrow>Step 01 · Smart Suite · Acquisition</Eyebrow>
              <h1 className="text-[32px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[36px] tracking-tight">
                SmartMatch.
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
                Go live on Day 0.
              </h1>
              <p className="mt-[10px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif]">
                Publish before the vehicle even arrives.
              </p>
            </div>
            <div className="relative rounded-[14px] overflow-hidden border border-black/8 bg-[#FAFAFB]">
              <img
                src={imgSmartMatch}
                alt="SmartMatch: vehicle identified, matching media replicated"
                className="block w-full h-auto"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(120% 80% at 100% 0%, rgba(127,106,242,0.10) 0%, transparent 60%)",
                }}
              />
            </div>
          </div>

          <Divider />

          {/* PROBLEM */}
          <div>
            <Eyebrow>Why your listings stay dark</Eyebrow>
            <div className="grid grid-cols-2 gap-[10px]">
              <Pointer icon={<Lock size={15} />} text="Capital locked, listing missing" />
              <Pointer icon={<Hourglass size={15} />} text="Detailing delays the shoot" />
              <Pointer icon={<FileSearch size={15} />} text="Processing & QC add more days" />
              <Pointer icon={<Users size={15} />} text="Competitors capture your demand" />
            </div>
          </div>

          <Divider />

          {/* SOLUTION */}
          <div>
            <Eyebrow>The Solution</Eyebrow>
            <h2 className="text-[18px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Match. Replicate. Publish. Instantly.
            </h2>
            <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
              <FeatureCard icon={<Rocket size={18} strokeWidth={2.2} />}    title="Go Live Instantly"    tagline="Skip the shoot. Publish in seconds." accent="#4600F2" />
              <FeatureCard icon={<Calendar size={18} strokeWidth={2.2} />}  title="List Before It Lands" tagline="Live days before the car arrives." accent="#10B981" />
              <FeatureCard icon={<Search size={18} strokeWidth={2.2} />}    title="Smart matching"      tagline="Year, make, model, trim, color." accent={MAGENTA} />
              <FeatureCard icon={<Eye size={18} strokeWidth={2.2} />}       title="Capture Early Demand" tagline="Visible when competitors aren't." accent="#F59E0B" />
            </div>
          </div>

          <Divider />

          {/* HOW IT WORKS */}
          <div>
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Automated or on-demand. Fits your workflow.
            </h2>
            <div className="mt-[12px] grid grid-cols-4 gap-[12px]">
              <StepBlock n="01" title="Vehicle detected" tagline="New listing enters your feed."    accent={MAGENTA} />
              <StepBlock n="02" title="Match Found"      tagline="Spec-matched donor located."      accent={MAGENTA} />
              <StepBlock n="03" title="Media Replicated" tagline="Full set copied to new vehicle." accent={MAGENTA} />
              <StepBlock n="04" title="Listing Live"     tagline="Published before car arrives."    accent={MAGENTA} />
            </div>
          </div>

          <Divider />

          {/* BUILT FOR */}
          <div>
            <Eyebrow color={PURPLE}>Built For</Eyebrow>
            <h2 className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              High-volume dealership workflows.
            </h2>
            <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
              <BuiltForCard title="New Vehicle Restocks"  tagline="Live before transport arrives."  accent={MAGENTA} />
              <BuiltForCard title="Repeat Variants & Trims" tagline="Best-sellers never cost a day." accent="#F43F5E" />
              <BuiltForCard title="Multi-location groups"  tagline="One shoot, every location."     accent={PURPLE} />
            </div>
          </div>
        </div>

        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="h-[42px] px-[16px] rounded-[10px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#0a0a0a] hover:bg-black/5 transition-colors font-['Inter:Semi_Bold',sans-serif]"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
              Back
            </button>
          ) : (
            <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
              <Layers size={13} className="text-[#00C488]" />
              Smart Match · ready to fill no-photo inventory
            </div>
          )}
          <button
            type="button"
            onClick={() => onContinue?.()}
            className="h-[42px] px-[22px] rounded-[10px] text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center gap-[8px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #FF5C9A 0%, #B651D7 50%, #4600F2 100%)",
              boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
            }}
          >
            {completed ? "Continue" : "Start filling no-photos"}
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
