import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X, Check, Sparkles, Wand2, Play, ChevronLeft, ChevronRight,
  ArrowRight,
} from "lucide-react";

import rawExteriorImg from "../assets/vehicle/raw-exterior-1.jpg";
import rawExteriorImg2 from "../assets/vehicle/raw-exterior-2.jpg";
import rawExteriorImg3 from "../assets/vehicle/raw-exterior-3.jpg";
import rawInteriorImg from "../assets/vehicle/raw-interior-1.jpg";
import rawInteriorImg2 from "../assets/vehicle/raw-interior-2.jpg";
import studioExteriorImg from "../assets/vehicle/studio-exterior-1.jpg";
import studioExteriorImg2 from "../assets/vehicle/studio-exterior-2.jpg";
import studioExteriorImg3 from "../assets/vehicle/studio-exterior-3.jpg";
import studioInteriorImg from "../assets/vehicle/studio-interior-1.jpg";
import studioInteriorImg2 from "../assets/vehicle/studio-interior-2.jpg";
import spin360Mov from "../assets/vehicle/spin-360.mov";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onBack?: () => void;
  stageCompleted?: boolean;
  totalRaw?: number;
}

// Paired slides: each slot has a studio version and (optionally) its raw input pair
// so toggling Input/Output keeps you on the same vehicle angle.
type Slide = {
  kind: "video" | "image";
  studio: string;
  input: string | null;     // null when there's no raw input for that slot (e.g. 360 spin)
  label: string;
};

const SLIDES: Slide[] = [
  { kind: "video", studio: spin360Mov,        input: null,            label: "360° Tour" },
  { kind: "image", studio: studioExteriorImg, input: rawExteriorImg,  label: "Front 3/4" },
  { kind: "image", studio: studioExteriorImg2,input: rawExteriorImg2, label: "Side" },
  { kind: "image", studio: studioExteriorImg3,input: rawExteriorImg3, label: "Rear 3/4" },
  { kind: "image", studio: studioInteriorImg, input: rawInteriorImg,  label: "Interior front" },
  { kind: "image", studio: studioInteriorImg2,input: rawInteriorImg2, label: "Interior rear" },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

export function RawPhotoTransformModal({
  open, onClose, onNext, onBack, stageCompleted, totalRaw = 67,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const heroRawRef = useRef<HTMLImageElement>(null);
  const heroStudioRef = useRef<HTMLImageElement>(null);
  const heroVideoRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const wandRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<"raw" | "studio" | "video" | "interactive">("raw");
  const [mode, setMode] = useState<"studio" | "input">("studio");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [vehiclesDone, setVehiclesDone] = useState(0);

  // For each slot, resolve which source (studio output vs raw input) to show
  const resolveSource = (s: Slide): { kind: Slide["kind"]; src: string } | null => {
    if (mode === "studio") return { kind: s.kind, src: s.studio };
    if (!s.input) return null;
    return { kind: "image", src: s.input };
  };
  const selected = SLIDES[selectedIdx % SLIDES.length];
  const selectedSrc = resolveSource(selected);

  // Modal entrance
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

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setPhase("raw");
    setMode("studio");
    setSelectedIdx(0);
    setVehiclesDone(0);
    if (heroRawRef.current)    gsap.set(heroRawRef.current,    { opacity: 1 });
    if (heroStudioRef.current) gsap.set(heroStudioRef.current, { opacity: 0 });
    if (heroVideoRef.current)  gsap.set(heroVideoRef.current,  { opacity: 0 });
    if (scanRef.current)       gsap.set(scanRef.current,       { opacity: 0, y: "-100%" });
    if (wandRef.current)       gsap.set(wandRef.current,       { opacity: 0, scale: 0.6, y: 0, rotation: 0 });
    if (burstRef.current)      gsap.set(burstRef.current,      { opacity: 0, scale: 0.8 });
  }, [open]);

  // Magic timeline
  useEffect(() => {
    if (!open) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.6 });
      tl.to(scanRef.current, { opacity: 1, duration: 0.2 })
        .to(scanRef.current, { y: "100%", duration: 1.6, ease: "power1.inOut" }, "<")
        .to(scanRef.current, { opacity: 0, duration: 0.25 }, "-=0.3");
      tl.fromTo(
        wandRef.current,
        { opacity: 0, scale: 0.4, rotation: -20 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: "back.out(2)" },
        "-=0.4"
      );
      tl.to(burstRef.current, { scale: 1.4, opacity: 1, duration: 0.45, ease: "power2.out" }, "<");
      tl.to(heroRawRef.current,    { opacity: 0, duration: 0.55, ease: "power2.out" }, "<");
      tl.fromTo(
        heroStudioRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
        "<"
      );
      tl.to(burstRef.current, { opacity: 0, duration: 0.4, ease: "power2.in" }, "+=0.05");
      tl.to(wandRef.current, { opacity: 0, scale: 0.7, y: -8, duration: 0.3, ease: "power2.in" }, "<");
      tl.call(() => setPhase("studio"));
      tl.to(heroStudioRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, "+=0.4");
      tl.fromTo(
        heroVideoRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
        "<"
      );
      tl.call(() => setPhase("video"));
      // After video reveal, animate thumbs in, then unlock interactive mode
      if (thumbStripRef.current) {
        const thumbs = thumbStripRef.current.querySelectorAll<HTMLElement>("[data-thumb]");
        tl.fromTo(
          thumbs,
          { y: 16, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.07, ease: "back.out(1.6)" },
          "-=0.4"
        );
      }
      tl.call(() => setPhase("interactive"));
    });
    return () => ctx.revert();
  }, [open]);

  // Vehicle counter
  useEffect(() => {
    if (!open) return;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: totalRaw,
      duration: 6.5,
      ease: "power1.out",
      delay: 1.2,
      onUpdate: () => setVehiclesDone(Math.round(obj.v)),
    });
    return () => { tween.kill(); };
  }, [open, totalRaw]);

  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const pct = Math.min(100, (vehiclesDone / totalRaw) * 100);
    gsap.to(bar, { width: `${pct}%`, duration: 0.4, ease: "power2.out" });
  }, [vehiclesDone, totalRaw]);

  // Thumb / arrow nav
  const goPrev = () => setSelectedIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  const goNext = () => setSelectedIdx((i) => (i + 1) % SLIDES.length);

  // Magic layers are visible only during the animation; once interactive,
  // we render the user-selected slide on top.
  const inMagic = phase === "raw" || phase === "studio" || phase === "video";
  const interactive = phase === "interactive";

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="px-[24px] pt-[18px] pb-[14px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="flex items-start gap-[12px]">
              <div
                className="shrink-0 size-[40px] rounded-[12px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(70,0,242,0.12) 0%, rgba(0,196,136,0.12) 100%)",
                  color: "#4600F2",
                }}
              >
                <Wand2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[18px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[24px]">
                    Transforming raw photos
                  </h2>
                  <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full bg-[rgba(70,0,242,0.08)] text-[#4600F2] text-[9px] font-semibold uppercase tracking-[0.6px]">
                    <Sparkles size={9} />
                    Smart Studio
                  </span>
                  {stageCompleted && (
                    <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[9px] font-bold uppercase tracking-[0.6px]">
                      <Check size={9} strokeWidth={3} />
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-[2px] text-[12px] text-black/55 font-['Inter:Regular',sans-serif]">
                  Watch one vehicle become a full studio media set.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-[10px]">
              {/* Segmented Input/Output toggle — appears once the magic animation lands */}
              {interactive && (
                <div className="relative inline-flex items-center bg-[#F1F1F4] rounded-full p-[3px] h-[32px]">
                  <span
                    aria-hidden
                    className="absolute top-[3px] bottom-[3px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] transition-all duration-200 ease-out"
                    style={{
                      width: "calc(50% - 3px)",
                      left: mode === "input" ? "3px" : "calc(50%)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setMode("input"); setSelectedIdx(0); }}
                    className={`relative z-10 px-[14px] h-[26px] rounded-full text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-colors ${
                      mode === "input" ? "text-[#0a0a0a]" : "text-black/55 hover:text-[#0a0a0a]"
                    }`}
                  >
                    Input
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("studio"); setSelectedIdx(0); }}
                    className={`relative z-10 px-[14px] h-[26px] rounded-full text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-colors ${
                      mode === "studio" ? "text-[#0a0a0a]" : "text-black/55 hover:text-[#0a0a0a]"
                    }`}
                  >
                    Output
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="size-[30px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={17} className="text-black/60" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-[10px] flex items-center gap-[12px]">
            <div className="flex-1 h-[6px] rounded-full bg-[#F1F1F4] overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background: "linear-gradient(90deg, #4600F2 0%, #7F6AF2 50%, #00C488 100%)",
                }}
              />
            </div>
            <p className="text-[12px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none tabular-nums whitespace-nowrap">
              <span className="text-[#4600F2]">{vehiclesDone}</span>
              <span className="text-black/40"> / {totalRaw} vehicles</span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden px-[24px] py-[16px] bg-[#FAFAFB] flex flex-col gap-[12px]">
          {/* Big hero */}
          <div className="relative rounded-[14px] overflow-hidden border border-black/8 bg-[#1a1a1a] aspect-[16/9]">
            {/* Magic transformation layers — visible only during the animation */}
            {inMagic && (
              <>
                <img
                  ref={heroRawRef}
                  src={rawExteriorImg}
                  alt="Raw lot photo"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  ref={heroStudioRef}
                  src={studioExteriorImg}
                  alt="Studio output"
                  className="absolute inset-0 w-full h-full object-contain opacity-0"
                />
                <div ref={heroVideoRef} className="absolute inset-0 opacity-0">
                  <video
                    src={spin360Mov}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </>
            )}

            {/* Interactive selected slide */}
            {interactive && (
              selectedSrc === null ? (
                // 360 spin has no raw input — show a friendly placeholder
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] text-white/65">
                  <Play size={28} className="opacity-50" />
                  <p className="text-[12px] font-semibold uppercase tracking-[1px]">No raw input for 360° tour</p>
                  <p className="text-[11px] text-white/45">The spin is generated, not shot.</p>
                </div>
              ) : selectedSrc.kind === "video" ? (
                <video
                  key={`video-${mode}-${selectedIdx}`}
                  src={selectedSrc.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <img
                  key={`img-${mode}-${selectedIdx}`}
                  src={selectedSrc.src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )
            )}

            {/* Scan beam */}
            <div
              ref={scanRef}
              aria-hidden
              className="pointer-events-none absolute left-0 right-0 top-0 h-[30%] opacity-0"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(127,106,242,0.45) 50%, transparent 100%)",
                boxShadow: "0 0 40px 10px rgba(127,106,242,0.45)",
              }}
            />

            {/* Wand burst */}
            <div
              ref={burstRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 m-auto rounded-full opacity-0"
              style={{
                width: "55%",
                height: "55%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(127,106,242,0.4) 30%, transparent 60%)",
                filter: "blur(8px)",
              }}
            />
            <div
              ref={wandRef}
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
            >
              <div
                className="size-[64px] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(127,106,242,0.45)]"
                style={{
                  background: "linear-gradient(135deg, #FF5C9A 0%, #B651D7 50%, #4600F2 100%)",
                }}
              >
                <Wand2 size={28} className="text-white" strokeWidth={2.2} />
              </div>
            </div>

            {/* Status pill top-left */}
            <div className="absolute top-[10px] left-[10px]">
              {interactive ? (
                mode === "input" ? (
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                    Raw Input
                  </span>
                ) : selected.kind === "video" ? (
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#00C488] text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                    <Play size={9} strokeWidth={3} fill="currentColor" />
                    360° Tour
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#4600F2] text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                    <Check size={10} strokeWidth={3} />
                    Studio Output
                  </span>
                )
              ) : phase === "video" ? (
                <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#00C488] text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                  <Play size={9} strokeWidth={3} fill="currentColor" />
                  360° Tour playing
                </span>
              ) : phase === "studio" ? (
                <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#4600F2] text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                  <Check size={10} strokeWidth={3} />
                  Studio Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.6px]">
                  <span className="size-[5px] rounded-full bg-white animate-pulse" />
                  Processing
                </span>
              )}
            </div>

            {/* Chevron nav arrows — interactive only */}
            <button
              type="button"
              onClick={goPrev}
              disabled={!interactive}
              className="absolute left-[12px] top-1/2 -translate-y-1/2 size-[34px] rounded-full bg-white/85 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft size={18} className="text-[#0a0a0a]" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!interactive}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 size-[34px] rounded-full bg-white/85 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md"
              aria-label="Next"
            >
              <ChevronRight size={18} className="text-[#0a0a0a]" strokeWidth={2.5} />
            </button>

            {/* Vehicle caption */}
            <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-end justify-between">
              <div className="bg-black/55 backdrop-blur-sm rounded-[8px] px-[10px] py-[5px]">
                <p className="text-[11px] font-bold text-white font-['Inter:Bold',sans-serif] leading-tight">
                  2024 Toyota Tundra 1794
                </p>
                <p className="text-[9px] text-white/70 font-['Inter:Regular',sans-serif] leading-tight mt-[1px]">
                  STK-2107 · VIN 5TFMA5DB4RX040918
                </p>
              </div>
              <div className="bg-white/95 rounded-[6px] px-[6px] py-[2px]">
                <span className="text-[9px] font-bold uppercase tracking-[0.6px] text-[#4600F2] font-['Inter:Bold',sans-serif]">
                  {mode === "input" || phase === "raw" ? "Before" : "After"}
                </span>
              </div>
            </div>
          </div>

          {/* Thumbnail strip — paired, so toggling Input/Output stays on the same angle */}
          <div ref={thumbStripRef} className="grid grid-cols-6 gap-[8px]">
            {SLIDES.map((slide, i) => {
              const active = i === selectedIdx && interactive;
              const src = resolveSource(slide);
              return (
                <button
                  key={i}
                  data-thumb
                  type="button"
                  onClick={() => interactive && setSelectedIdx(i)}
                  disabled={!interactive}
                  className={`relative rounded-[8px] overflow-hidden border-[2px] aspect-[16/10] cursor-pointer opacity-0 transition-colors bg-[#1a1a1a] ${
                    active ? "border-[#4600F2]" : "border-transparent hover:border-black/15"
                  }`}
                >
                  {src === null ? (
                    // 360 in Input mode: no raw equivalent
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                      <Play size={14} className="opacity-40" />
                    </div>
                  ) : src.kind === "video" ? (
                    <>
                      <video
                        src={src.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                        <div className="size-[22px] rounded-full bg-[#00C488] flex items-center justify-center">
                          <Play size={11} className="text-white" fill="currentColor" strokeWidth={2.5} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={src.src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-[24px] py-[12px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[11px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#10B981] animate-pulse" />
            Ford Sec 48 · branded background
          </div>
          <div className="flex items-center gap-[8px]">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-[38px] px-[14px] rounded-[10px] inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#0a0a0a] hover:bg-black/5 transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                <ChevronLeft size={14} strokeWidth={2.5} />
                Back
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="h-[38px] px-[18px] rounded-[10px] text-white text-[12px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-[8px]"
                style={{
                  background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                  boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
                }}
              >
                Next: Fix No-Photo vehicles
                <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
