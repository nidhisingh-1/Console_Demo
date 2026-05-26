import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, Check, ArrowRight, Loader2 } from "lucide-react";

export interface PitchFeature {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  accent: string;
}

export interface PitchContent {
  /** Brand accent for this pitch (used for badges + tints, not the primary CTA) */
  accent: string;
  /** Product name displayed as the header */
  product: string;
  /** Step label, e.g. "Step 02 · Smart Suite · Merchandising" */
  step?: string;
  /** Tagline shown under the product name */
  tagline: string;
  /** Gradient-painted secondary headline (Demo 1 style) */
  punchline?: string;
  /** The problem this pitch addresses (tied to the current bucket) */
  problem: string;
  /** "How it works" bullets (max 3) */
  bullets: string[];
  /** ROI number + caption — proof.value animates in */
  proof: { value: string; caption: string };
  /** Hero image (Demo 1 transformation artwork). Replaces the abstract gradient. */
  heroImage?: string;
  /** Feature cards (Demo 1 style — stagger in after the hero) */
  features?: PitchFeature[];
  /** Primary CTA label (Process / Match / Syndicate / Launch campaign) */
  actionLabel: string;
}

export interface PitchPanelProps extends PitchContent {
  open: boolean;
  onClose: () => void;
  onAction: () => void;
  /** True while the primary action animation is running on the dashboard */
  actionRunning?: boolean;
  /** True once this scene's action has completed (CTA becomes "Done") */
  completed?: boolean;
}

export function PitchPanel(props: PitchPanelProps) {
  const {
    open, onClose, onAction, actionRunning, completed,
    accent, product, tagline, problem, bullets, proof, visual, actionLabel,
  } = props;
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const sections = sectionsRef.current;
    if (!panel || !sections) return;

    const tl = gsap.timeline();
    tl.fromTo(
      panel,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
    );
    const items = sections.querySelectorAll<HTMLElement>("[data-section]");
    tl.fromTo(
      items,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power3.out" },
      "-=0.25"
    );

    return () => { tl.kill(); };
  }, [open, product]);

  if (!open) return null;

  return createPortal(
    // No overlay — dashboard + vehicle rows remain fully visible behind the panel.
    <div
      ref={panelRef}
      className="fixed top-0 right-0 bottom-0 z-[70] w-[480px] bg-white border-l border-black/10 shadow-[-30px_0_60px_rgba(0,0,0,0.18)] flex flex-col"
    >
        {/* Header */}
        <div className="px-[28px] pt-[24px] pb-[18px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[12px]">
            <div>
              <div className="flex items-center gap-[8px]">
                <span className="size-[8px] rounded-full" style={{ backgroundColor: accent }} />
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.8px] font-['Inter:Bold',sans-serif]"
                  style={{ color: accent }}
                >
                  Spyne · Pitch
                </p>
              </div>
              <h2 className="mt-[6px] text-[22px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-tight">
                {product}
              </h2>
              <p className="mt-[4px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif] leading-snug">
                {tagline}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-[32px] rounded-full bg-black/5 hover:bg-black/10 text-black/55 flex items-center justify-center shrink-0"
              aria-label="Close pitch"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={sectionsRef} className="flex-1 overflow-y-auto px-[28px] py-[20px]">
          {/* Problem */}
          <div data-section className="mb-[18px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[6px]">
              The problem
            </p>
            <p className="text-[13px] text-[#1F2937] leading-[1.55] font-['Inter:Regular',sans-serif]">
              {problem}
            </p>
          </div>

          {/* How it works */}
          <div data-section className="mb-[18px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[8px]">
              How it works
            </p>
            <ul className="space-y-[8px]">
              {bullets.slice(0, 3).map((b, i) => (
                <li key={i} className="flex items-start gap-[10px]">
                  <span
                    className="size-[18px] rounded-full flex items-center justify-center shrink-0 mt-[1px]"
                    style={{ background: `${accent}1A`, color: accent }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="text-[13px] text-[#1F2937] leading-[1.5] font-['Inter:Medium',sans-serif] font-medium">
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Before / After visual */}
          <div data-section className="mb-[18px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[8px]">
              The output
            </p>
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="rounded-[10px] overflow-hidden border border-black/8 bg-[#F9FAFB]">
                <div className="px-[10px] py-[6px] bg-[#F3F4F6] border-b border-black/5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-black/55">
                    {visual.beforeLabel ?? "Before"}
                  </p>
                </div>
                <div className="h-[110px] flex items-center justify-center p-[8px]">
                  {visual.before}
                </div>
              </div>
              <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: `${accent}40` }}>
                <div className="px-[10px] py-[6px] border-b" style={{ background: `${accent}10`, borderColor: `${accent}20` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.5px]" style={{ color: accent }}>
                    {visual.afterLabel ?? "After"}
                  </p>
                </div>
                <div className="h-[110px] flex items-center justify-center p-[8px]">
                  {visual.after}
                </div>
              </div>
            </div>
          </div>

          {/* Proof / ROI */}
          <div
            data-section
            className="rounded-[12px] p-[16px] border"
            style={{ background: `${accent}08`, borderColor: `${accent}25` }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[4px]">
              Proven impact
            </p>
            <p
              className="text-[26px] font-bold font-['Inter:Bold',sans-serif] leading-none"
              style={{ color: accent }}
            >
              {proof.value}
            </p>
            <p className="mt-[6px] text-[12px] text-[#374151] font-['Inter:Regular',sans-serif] leading-snug">
              {proof.caption}
            </p>
          </div>
        </div>

        {/* Sticky footer CTA */}
        <div className="px-[24px] py-[14px] border-t border-black/8 bg-white">
          <button
            type="button"
            onClick={onAction}
            disabled={actionRunning || completed}
            className="w-full inline-flex items-center justify-center gap-[8px] h-[44px] rounded-[10px] text-[14px] font-semibold text-white font-['Inter:Semi_Bold',sans-serif] transition-opacity disabled:opacity-80 bg-[#4600F2] hover:bg-[#3a00d0]"
          >
            {completed ? (
              <>
                <Check size={16} strokeWidth={3} />
                Done
              </>
            ) : actionRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running…
              </>
            ) : (
              <>
                {actionLabel}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>,
    document.body
  );
}
