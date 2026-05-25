import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X, ArrowRight, ChevronLeft, Wand2, Check,
  CameraOff, Clock, Palette, VideoOff,
  Image as ImageIcon, RotateCw, Film,
  Smartphone, WifiOff, Zap,
} from "lucide-react";
import imgListing from "../assets/merchandising-example.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  completed?: boolean;
}

const MAGENTA = "#E91E63";
const MAGENTA_GRAD = "linear-gradient(90deg, #FF5C9A 0%, #B651D7 100%)";

// ─── Minimal atoms ───────────────────────────────────────────────────────────

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

/** Compact icon + short label — used for the Problem pointers */
function Pointer({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[10px] bg-white border border-black/8">
      <span className="size-[28px] rounded-[8px] bg-[rgba(233,30,99,0.10)] flex items-center justify-center shrink-0" style={{ color: MAGENTA }}>
        {icon}
      </span>
      <p className="text-[12.5px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">{text}</p>
    </div>
  );
}

/** Icon-led solution card with a short tagline */
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

function Divider() {
  return <div className="my-[20px] h-px bg-black/8" />;
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function MerchandisingPitchModal({ open, onClose, onContinue, onBack, completed }: Props) {
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
          {/* HERO — 2-col: pitch + listing mockup */}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-[24px] items-center">
            <div>
              <Eyebrow>Step 02 · Smart Suite · Merchandising</Eyebrow>
              <h1 className="text-[32px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[36px] tracking-tight">
                Studio AI.
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
                Studio media, without the studio.
              </h1>
              <p className="mt-[10px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif]">
                Smartphone in, brand-perfect media out — in minutes.
              </p>
            </div>
            <div className="relative rounded-[14px] overflow-hidden border border-black/8 bg-[#FAFAFB]">
              <img
                src={imgListing}
                alt="Listing page with studio-processed inventory"
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

          {/* PROBLEM — 4 inline pointers, no body copy */}
          <div>
            <Eyebrow>Why dealers struggle today</Eyebrow>
            <div className="grid grid-cols-2 gap-[10px]">
              <Pointer icon={<CameraOff size={15} />} text="Photographer bottleneck" />
              <Pointer icon={<Clock size={15} />} text="Editing eats days" />
              <Pointer icon={<Palette size={15} />} text="Inconsistent output across crews" />
              <Pointer icon={<VideoOff size={15} />} text="No 360° tours or video" />
            </div>
          </div>

          <Divider />

          {/* SMART PROCESSING — icon-led cards, short taglines */}
          <div>
            <Eyebrow>Smart Processing</Eyebrow>
            <h2 className="text-[18px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              AI media production, at inventory scale.
            </h2>
            <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
              <FeatureCard
                icon={<ImageIcon size={18} strokeWidth={2.2} />}
                title="Studio Images"
                tagline="Auto-enhanced, background-removed."
                accent="#3B82F6"
              />
              <FeatureCard
                icon={<RotateCw size={18} strokeWidth={2.2} />}
                title="360° Car Tours"
                tagline="Stitched and ready in one shoot."
                accent="#10B981"
              />
              <FeatureCard
                icon={<Film size={18} strokeWidth={2.2} />}
                title="Feature & Tour Videos"
                tagline="Branded clips, made automatically."
                accent="#F59E0B"
              />
            </div>
          </div>

          <Divider />

          {/* SMART SHOOT APP — icon-led cards, short taglines */}
          <div>
            <Eyebrow>Smart Shoot App</Eyebrow>
            <h2 className="text-[18px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[22px]">
              Anyone on your lot can shoot like a pro.
            </h2>
            <div className="mt-[12px] grid grid-cols-3 gap-[10px]">
              <FeatureCard
                icon={<Smartphone size={18} strokeWidth={2.2} />}
                title="Smart Overlays"
                tagline="Guided angles, every time."
                accent={MAGENTA}
              />
              <FeatureCard
                icon={<WifiOff size={18} strokeWidth={2.2} />}
                title="Offline Mode"
                tagline="No WiFi? No problem."
                accent="#F59E0B"
              />
              <FeatureCard
                icon={<Zap size={18} strokeWidth={2.2} />}
                title="Same-Day Live"
                tagline="Capture → listing in hours."
                accent="#10B981"
              />
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
              <Wand2 size={13} className="text-[#4600F2]" />
              Studio AI · ready to transform raw photos
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
            {completed ? "Continue" : "Start transforming"}
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
