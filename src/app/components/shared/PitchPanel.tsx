import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X, Check, ArrowRight, Loader2, Sparkles, Lock } from "lucide-react";
import { StepMetricsPanel, type StepBucketKey } from "./StepMetricsPanel";
import { DEFAULT_DEMO_CONFIG, type DemoConfig } from "../../types/demoConfig";

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
  /**
   * When provided, renders the problem section as a chip/tag cloud instead of
   * a paragraph. Each string becomes one pill tag.
   */
  problemChips?: string[];
  /**
   * When provided, renders a "The Solution" section with up to 3 icon-card boxes
   * in a row between the problem section and "How it works".
   */
  solutionSection?: {
    title?: string;
    boxes: Array<{ icon: React.ReactNode; label: string; body: string }>;
  };
  /** "How it works" bullets (max 6) */
  bullets: string[];
  /**
   * Controls the visual layout of the "How it works" section.
   * - "checklist" (default) — checkmark bullets, paragraph text
   * - "steps" — numbered vertical step list for short 3-4 word step names
   * - "nodes" — horizontal connected-node timeline (max 4 nodes, no scroll)
   */
  bulletStyle?: "checklist" | "steps" | "nodes";
  /** ROI number + caption — proof.value animates in. Omit to hide the section. */
  proof?: { value: string; caption: string };
  /** Hero image (Demo 1 transformation artwork). */
  heroImage?: string;
  /**
   * Custom hero node — overrides heroImage when provided.
   * Use for animated placeholders (scan GIF, etc.) instead of a static image.
   */
  heroNode?: React.ReactNode;
  /**
   * Side-by-side input → output comparison (uses Demo 1's raw/studio/cgi assets).
   * Each side is a ReactNode so the pitch can use an <img> or a "no media yet"
   * placeholder where there's nothing to show on the input side (e.g. SmartMatch).
   */
  comparison?: {
    before: React.ReactNode;
    after: React.ReactNode;
    beforeLabel?: string;
    afterLabel?: string;
  };
  /** Feature cards (Demo 1 style — stagger in after the hero) */
  features?: PitchFeature[];
  /**
   * When to show feature cards. "pitch" = first drawer (default).
   * "success" = second drawer after the primary CTA completes (e.g. SmartMatch).
   */
  featuresPhase?: "pitch" | "success";
  /** Primary CTA label (Process / Match / Syndicate / Launch campaign) */
  actionLabel: string;
}

export interface PitchChannel {
  id: string;
  name: string;
  glyph: string;
  bg: string;
  fg: string;
  italic?: boolean;
}

export interface PitchSuccess {
  /** Days of frontline shaved this step (positive number) */
  dtfSaved: number;
  /** Inventory score gained this step (positive number) */
  scoreGained: number;
  /** Inventory score before and after this step (0-10) */
  scoreBefore?: number;
  scoreAfter?: number;
  /** Holding-cost dollars recovered this step (positive number) */
  savedDollars: number;
  /**
   * Override the default 3 chips with product-specific metrics.
   * When omitted, falls back to dtfSaved / scoreGained / savedDollars.
   */
  chips?: { delta: string; label: string }[];
  /** Override the banner headline. Defaults to generic congratulations copy. */
  title?: string;
  /** Override the banner subtitle. */
  subtitle?: string;
}

export interface PitchPanelProps extends PitchContent {
  open: boolean;
  onClose: () => void;
  onAction: () => void;
  /** True while the primary action animation is running on the dashboard */
  actionRunning?: boolean;
  /** True once this scene's action has completed (CTA becomes "Done") */
  completed?: boolean;
  /**
   * When provided, a celebratory banner appears at the top of the pitch
   * summarising what *this* bucket's transformation achieved. Pitch content
   * below remains unchanged so the AE can recap the product story.
   */
  success?: PitchSuccess;
  /**
   * Optional inline channel picker. When provided, the syndication pitch shows
   * a checkbox grid of channels — letting the AE answer "where do you want to
   * publish?" without breaking out of the side-panel chrome.
   */
  channels?: PitchChannel[];
  selectedChannels?: Set<string>;
  onChannelToggle?: (id: string) => void;
  /** Render the CTA as a magenta→purple gradient upgrade button (Demo 3 light plan). */
  locked?: boolean;
  /**
   * Which bucket step this pitch represents. When set with the success state,
   * renders the StepMetricsPanel (before/after bars + metric boxes).
   */
  metricsStep?: StepBucketKey;
  /** Number of buckets completed before this pitch opened. */
  completedSteps?: number;
  /** Dealer inputs from the setup screen — drives personalised metrics. */
  demoConfig?: DemoConfig;
}

const MAGENTA_GRAD = "linear-gradient(90deg, #FF5C9A 0%, #B651D7 100%)";

export function PitchPanel(props: PitchPanelProps) {
  const {
    open, onClose, onAction, actionRunning, completed,
    accent, product, step, tagline, punchline, problem, problemChips, solutionSection, bullets, bulletStyle = "checklist",
    proof, heroImage, heroNode, comparison: _comparison, features, featuresPhase = "pitch", actionLabel,
    channels, selectedChannels, onChannelToggle,
    success, locked,
    metricsStep, completedSteps, demoConfig,
  } = props;
  // _comparison is destructured but not rendered here — the new pitch UI uses heroNode for visual storytelling.
  void _comparison;

  const showFeatures = Boolean(
    features?.length && (
      (featuresPhase === "success" && success) ||
      (featuresPhase !== "success" && !success)
    )
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const proofValueRef = useRef<HTMLSpanElement>(null);

  // Animate the proof value as a counter when it contains a leading number.
  const [parsedProof] = useState(() => parseLeadingNumber(proof?.value ?? ""));

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

    if (heroImgRef.current) {
      tl.fromTo(
        heroImgRef.current,
        { scale: 1.06, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "power3.out" },
        "-=0.25"
      );
    }

    const items = sections.querySelectorAll<HTMLElement>("[data-section]");
    tl.fromTo(
      items,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: "power3.out" },
      "-=0.35"
    );

    const featureCards = sections.querySelectorAll<HTMLElement>("[data-feature]");
    if (featureCards.length) {
      tl.fromTo(
        featureCards,
        { y: 10, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "back.out(1.4)" },
        "-=0.25"
      );
    }

    if (parsedProof.hasNumber && proofValueRef.current) {
      const el = proofValueRef.current;
      const target = parsedProof.value;
      const obj = { n: 0 };
      tl.to(obj, {
        n: target,
        duration: 1.1,
        ease: "power3.out",
        onUpdate: () => {
          el.textContent = formatProof(parsedProof, obj.n);
        },
      }, "-=0.3");
    }

    return () => { tl.kill(); };
  }, [open, product, parsedProof, success, featuresPhase]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed top-0 right-0 bottom-0 z-[70] w-[480px] bg-white border-l border-black/10 shadow-[-12px_0_28px_rgba(0,0,0,0.08)] flex flex-col"
    >
        {/* Header */}
        <div className="px-[28px] pt-[24px] pb-[18px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[12px]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-[8px]">
                <span className="size-[8px] rounded-full" style={{ backgroundColor: accent }} />
                <p
                  className="text-[10px] font-bold uppercase tracking-[1.4px] font-['Inter:Bold',sans-serif]"
                  style={{ color: accent }}
                >
                  {step ?? "Spyne · Pitch"}
                </p>
              </div>
              <h2 className="mt-[8px] text-[26px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[30px]">
                {product}
              </h2>
              {punchline && (
                <h2
                  className="text-[26px] font-bold font-['Inter:Bold',sans-serif] leading-[30px]"
                  style={{
                    background: MAGENTA_GRAD,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {punchline}
                </h2>
              )}
              <p className="mt-[6px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif] leading-snug">
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
          {/* Success state — compact header (no StepMetricsPanel in this project) */}
          {success && (
            <div data-section className="mb-[20px]">
              <div
                className="relative rounded-[14px] p-[18px] overflow-hidden mb-[16px]"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 55%, #047857 100%)",
                  boxShadow: "0 12px 32px rgba(16,185,129,0.30), inset 0 0 0 1px rgba(255,255,255,0.15)",
                }}
              >
                <Sparkles size={90} className="absolute -top-[12px] -right-[8px] text-white/10" strokeWidth={1.4} />
                <div className="relative flex items-center justify-between gap-[16px]">
                  <div className="flex items-center gap-[12px] min-w-0">
                    <span className="size-[38px] rounded-full bg-white flex items-center justify-center text-[#059669] shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
                      <Check size={20} strokeWidth={3.2} />
                    </span>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-[5px] px-[7px] py-[1.5px] rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-[1.2px] text-white mb-[6px] font-['Inter:Bold',sans-serif]">
                        <Sparkles size={9} strokeWidth={2.6} />
                        Impact unlocked
                      </p>
                      <h3 className="text-[16px] font-bold text-white font-['Inter:Bold',sans-serif] leading-[20px]">
                        {success.title ?? "Transformation complete."}
                      </h3>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[1.1px] text-white/75 font-['Inter:Bold',sans-serif]">
                      Inventory score
                    </p>
                    <div className="mt-[4px] flex items-end justify-end gap-[6px] text-white">
                      <ScoreOdometer
                        before={success.scoreBefore}
                        after={success.scoreAfter}
                        delta={success.scoreGained}
                      />
                      <span className="text-[12px] font-semibold text-white/80 font-['Inter:Semi_Bold',sans-serif] pb-[2px]">
                        /10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before/After bars + metric boxes — drives the impact metrics
                  shown after a successful transformation. Falls back to inline
                  chips when no metricsStep is provided. */}
              {metricsStep ? (
                <StepMetricsPanel
                  bucketKey={metricsStep}
                  completedSteps={completedSteps ?? 0}
                  demoConfig={demoConfig ?? DEFAULT_DEMO_CONFIG}
                  accent={accent}
                  successMode
                />
              ) : (
                (success.chips ?? [
                  { delta: `−${success.dtfSaved}d`, label: "Days to frontline" },
                  { delta: `+${success.scoreGained.toFixed(1)}`, label: "Inventory score" },
                  { delta: `+$${success.savedDollars.toLocaleString()}`, label: "Holding cost" },
                ]).map((c, i) => (
                  <div key={i} className="inline-block w-[calc(33.333%-6px)] mr-[8px] last:mr-0 rounded-[12px] bg-white px-[12px] py-[11px] shadow-[0_4px_10px_rgba(0,0,0,0.06)] border border-[rgba(16,185,129,0.20)] align-top">
                    <p className="text-[20px] font-bold text-[#047857] font-['Inter:Bold',sans-serif] leading-none tracking-tight">
                      {c.delta}
                    </p>
                    <p className="mt-[5px] text-[10px] font-bold uppercase tracking-[0.5px] text-black/55 font-['Inter:Bold',sans-serif] leading-tight">
                      {c.label}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Hero artwork — animated node OR static image */}
          {!success && heroNode && (
            <div data-section className="mb-[20px]">
              {heroNode}
            </div>
          )}
          {!success && !heroNode && heroImage && (
            <div
              data-section
              className="mb-[20px] relative rounded-[14px] overflow-hidden border border-black/8 bg-[#FAFAFB]"
            >
              <img
                ref={heroImgRef}
                src={heroImage}
                alt={product}
                className="block w-full h-auto"
              />
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(120% 80% at 100% 0%, ${accent}1A 0%, transparent 60%)`,
                }}
              />
            </div>
          )}


          {/* Problem */}
          {!success && (
            <div data-section className="mb-[18px]">
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-black/45 mb-[10px] font-['Inter:Semi_Bold',sans-serif]">
                The problem
              </p>
              {problemChips && problemChips.length > 0 ? (
                <div className="flex flex-wrap gap-[6px]">
                  {problemChips.map((chip, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-[10px] py-[5px] rounded-full text-[11.5px] font-medium font-['Inter:Medium',sans-serif] leading-none text-[#B91C1C] bg-[#FEE2E2] border border-[#FCA5A5]/60"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#1F2937] leading-[1.55] font-['Inter:Regular',sans-serif]">
                  {problem}
                </p>
              )}
            </div>
          )}

          {/* The Solution — 3 icon-card boxes in a row */}
          {!success && solutionSection && (
            <div data-section className="mb-[20px]">
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-black/45 mb-[10px] font-['Inter:Semi_Bold',sans-serif]">
                {solutionSection.title ?? "The Solution"}
              </p>
              <div className="grid grid-cols-3 gap-[8px]">
                {solutionSection.boxes.slice(0, 3).map((box, i) => (
                  <div
                    key={i}
                    className="rounded-[12px] border border-black/8 bg-white flex flex-col gap-[6px] p-[12px]"
                  >
                    <span
                      className="size-[28px] rounded-[8px] flex items-center justify-center shrink-0"
                      style={{ background: `${accent}18`, color: accent }}
                    >
                      {box.icon}
                    </span>
                    <p className="text-[11.5px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-[14px]">
                      {box.label}
                    </p>
                    <p className="text-[10.5px] text-black/55 font-['Inter:Regular',sans-serif] leading-[14px]">
                      {box.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          {!success && (
            <div data-section className="mb-[20px]">
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-black/45 mb-[14px] font-['Inter:Semi_Bold',sans-serif]">
                How it works
              </p>
              {bulletStyle === "nodes" ? (
                <div className="relative flex items-start justify-between">
                  <div
                    className="absolute top-[13px] left-[14px] right-[14px] h-[2px]"
                    style={{ background: `${accent}30` }}
                    aria-hidden
                  />
                  {bullets.slice(0, 4).map((b, i) => (
                    <div key={i} className="flex flex-col items-center gap-[10px] flex-1 relative z-[1]">
                      <span
                        className="size-[26px] rounded-full flex items-center justify-center text-[11px] font-bold font-['Inter:Bold',sans-serif] text-white shrink-0"
                        style={{ background: accent }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[10.5px] text-[#374151] text-center leading-[1.35] font-['Inter:Medium',sans-serif] font-medium px-[4px]">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              ) : bulletStyle === "steps" ? (
                <ol className="relative">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-[12px] pb-[14px] last:pb-0 relative">
                      {i < bullets.length - 1 && (
                        <span
                          className="absolute left-[12px] top-[24px] bottom-0 w-[2px]"
                          style={{ background: `${accent}30` }}
                          aria-hidden
                        />
                      )}
                      <span
                        className="size-[24px] rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold font-['Inter:Bold',sans-serif] text-white z-[1]"
                        style={{ background: accent }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[13px] text-[#1F2937] leading-[1.5] font-['Inter:Medium',sans-serif] font-medium pt-[3px]">
                        {b}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="space-y-[10px]">
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
              )}
            </div>
          )}

          {/* Feature cards */}
          {showFeatures && features && (
            <div
              data-section
              className={`mb-[20px]${success && featuresPhase === "success" ? " mt-[32px]" : ""}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-black/40 mb-[10px] font-['Inter:Bold',sans-serif]">
                {success && featuresPhase === "success" ? "What you got" : "What you get"}
              </p>
              <div className="grid grid-cols-3 gap-[8px]">
                {features.slice(0, 3).map((f, i) => (
                  <div
                    key={i}
                    data-feature
                    className="bg-white rounded-[10px] border border-black/8 p-[10px]"
                  >
                    <span
                      className="size-[30px] rounded-[8px] flex items-center justify-center mb-[8px]"
                      style={{ background: `${f.accent}1A`, color: f.accent }}
                    >
                      {f.icon}
                    </span>
                    <p className="text-[12px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[14px]">
                      {f.title}
                    </p>
                    <p className="mt-[3px] text-[10.5px] text-black/55 font-['Inter:Regular',sans-serif] leading-[13px]">
                      {f.tagline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inline channel picker */}
          {!success && channels && selectedChannels && onChannelToggle && (
            <div data-section className="mb-[20px]">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-black/40 mb-[8px] font-['Inter:Bold',sans-serif]">
                Where do you want to publish?
              </p>
              <div className="grid grid-cols-3 gap-[6px]">
                {channels.map((c) => {
                  const isOn = selectedChannels.has(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onChannelToggle(c.id)}
                      className={`relative flex items-center gap-[8px] rounded-[10px] border px-[8px] py-[7px] text-left transition-all ${
                        isOn
                          ? "border-[#4600F2] bg-[rgba(70,0,242,0.05)]"
                          : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <span
                        className="size-[24px] rounded-[6px] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                        style={{ background: c.bg, color: c.fg, fontStyle: c.italic ? "italic" : undefined }}
                      >
                        {c.glyph}
                      </span>
                      <span className="flex-1 min-w-0 text-[11.5px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
                        {c.name}
                      </span>
                      <span
                        className={`size-[14px] rounded-full border flex items-center justify-center shrink-0 ${
                          isOn ? "border-[#4600F2] bg-[#4600F2]" : "border-black/20 bg-white"
                        }`}
                      >
                        {isOn && <Check size={9} strokeWidth={3.5} className="text-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-[8px] text-[10.5px] text-black/45 font-['Inter:Regular',sans-serif]">
                {selectedChannels.size} of {channels.length} channels selected · uncheck any you don't want to publish to.
              </p>
            </div>
          )}

          {/* Proof / ROI */}
          {!success && proof && (
            <div
              data-section
              className="rounded-[12px] p-[16px] border"
              style={{ background: `${accent}08`, borderColor: `${accent}25` }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[1.2px] mb-[4px] font-['Inter:Bold',sans-serif]"
                style={{ color: accent }}
              >
                Proven impact
              </p>
              <p
                className="text-[28px] font-bold font-['Inter:Bold',sans-serif] leading-none"
                style={{ color: accent }}
              >
                <span ref={proofValueRef}>
                  {parsedProof.hasNumber ? formatProof(parsedProof, 0) : proof.value}
                </span>
              </p>
              <p className="mt-[6px] text-[12px] text-black/60 font-['Inter:Regular',sans-serif] leading-snug">
                {proof.caption}
              </p>
            </div>
          )}
        </div>

        {/* Sticky footer CTA */}
        <div className="px-[24px] py-[14px] border-t border-black/8 bg-white">
          <button
            type="button"
            onClick={onAction}
            disabled={actionRunning || completed}
            className={`w-full inline-flex items-center justify-center gap-[8px] h-[44px] rounded-[10px] text-[14px] font-semibold text-white font-['Inter:Semi_Bold',sans-serif] transition-opacity disabled:opacity-80 ${
              locked ? "" : "bg-[#4600F2] hover:bg-[#3a00d0]"
            }`}
            style={locked ? {
              background: "linear-gradient(90deg, #FF5C9A 0%, #B651D7 50%, #4600F2 100%)",
              boxShadow: "0 8px 22px rgba(70,0,242,0.32)",
            } : undefined}
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
            ) : locked ? (
              <>
                <Lock size={14} strokeWidth={2.5} />
                {actionLabel}
                <ArrowRight size={16} />
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

// ── Success banner inventory-score odometer (rolling digits) ──────────────────
function ScoreOdometer({ before, after, delta }: { before?: number; after?: number; delta?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tensRef = useRef<HTMLDivElement>(null);
  const onesRef = useRef<HTMLDivElement>(null);
  const decRef  = useRef<HTMLDivElement>(null);

  const safeBefore = Number.isFinite(before) ? (before as number) : 0;
  const safeAfter  = Number.isFinite(after)  ? (after as number)  : safeBefore;

  // Inventory score is 0-10 on a one-decimal scale. Pad to "XY.Z" so values
  // like 5.3 parse as tens=0, ones=5, dec=3 (avoids the NaN/"30.0" bug from
  // padding to 3 chars where the "." landed in the tens slot).
  const fmt = (n: number) => n.toFixed(1).padStart(4, "0");
  const b = fmt(safeBefore);
  const a = fmt(safeAfter);

  const bT = parseInt(b[0], 10);
  const bO = parseInt(b[1], 10);
  const bD = parseInt(b[3], 10);

  const aT = parseInt(a[0], 10);
  const aO = parseInt(a[1], 10);
  const aD = parseInt(a[3], 10);

  // Hide the tens digit when both values stay below 10 — otherwise scores
  // would render as "06.4". Show it only when either side hits 10+ (i.e. 10.0).
  const showTens = bT > 0 || aT > 0;

  useEffect(() => {
    if (!wrapRef.current) return;
    const H = 28;

    const roll = (ref: React.RefObject<HTMLDivElement>, from: number, to: number, delay: number) => {
      if (!ref.current) return null;
      const cycles = 2;
      const steps = cycles * 10 + ((to - from + 10) % 10);
      gsap.set(ref.current, { y: -from * H });
      return gsap.to(ref.current, {
        y: -(from + steps) * H,
        duration: 0.9,
        delay,
        ease: "power3.out",
        modifiers: {
          y: (y) => {
            const val = parseFloat(y);
            const wrapped = ((val % (10 * H)) + (10 * H)) % (10 * H);
            return `${-wrapped}px`;
          },
        },
      });
    };

    const t1 = roll(tensRef, bT, aT, 0.25);
    const t2 = roll(onesRef, bO, aO, 0.28);
    const t3 = roll(decRef,  bD, aD, 0.31);

    return () => {
      t1?.kill();
      t2?.kill();
      t3?.kill();
    };
  }, [bT, bO, bD, aT, aO, aD]);

  const DigitStack = ({ innerRef }: { innerRef: React.RefObject<HTMLDivElement> }) => (
    <div className="h-[28px] overflow-hidden">
      <div ref={innerRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-[28px] leading-[28px] text-[28px] font-bold tabular-nums font-['Inter:Bold',sans-serif]"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-end justify-end gap-[10px] text-white">
      <div ref={wrapRef} className="relative flex items-end">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[2px] -top-[2px] h-[10px]"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.00) 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-[2px] -bottom-[2px] h-[10px]"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.00) 100%)" }}
        />
        {showTens && <DigitStack innerRef={tensRef} />}
        <DigitStack innerRef={onesRef} />
        <div className="h-[28px] leading-[28px] text-[28px] font-bold font-['Inter:Bold',sans-serif]">
          .
        </div>
        <DigitStack innerRef={decRef} />
      </div>

      {typeof delta === "number" && (
        <span className="pb-[3px] text-[12px] font-semibold text-white/85 font-['Inter:Semi_Bold',sans-serif] tabular-nums">
          +{delta.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface ParsedProof {
  hasNumber: boolean;
  prefix: string;
  value: number;
  decimals: number;
  suffix: string;
  fullText: string;
}

function parseLeadingNumber(text: string): ParsedProof {
  const match = text.match(/^(\D*?)([+-]?\d+(?:\.\d+)?)([^\d]?.*)$/);
  if (!match) {
    return { hasNumber: false, prefix: "", value: 0, decimals: 0, suffix: "", fullText: text };
  }
  const numStr = match[2];
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  return {
    hasNumber: true,
    prefix: match[1],
    value: parseFloat(numStr),
    decimals,
    suffix: match[3],
    fullText: text,
  };
}

function formatProof(parsed: ParsedProof, current: number): string {
  if (!parsed.hasNumber) return parsed.fullText;
  const sign = parsed.value < 0 ? "-" : (parsed.prefix.includes("+") ? "+" : "");
  const num = Math.abs(current).toFixed(parsed.decimals);
  const cleanPrefix = parsed.prefix.replace(/[+-]$/, "");
  return `${cleanPrefix}${sign}${num}${parsed.suffix}`;
}
