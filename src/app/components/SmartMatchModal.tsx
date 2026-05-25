import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import {
  X, Check, Layers, ArrowRight, Zap, Clock,
  Image as ImageIcon, RotateCw, Aperture,
} from "lucide-react";

import studioExt1 from "../assets/vehicle/studio-exterior-1.jpg";
import studioExt2 from "../assets/vehicle/studio-exterior-2.jpg";
import studioExt3 from "../assets/vehicle/studio-exterior-3.jpg";
import studioInt1 from "../assets/vehicle/studio-interior-1.jpg";
import studioInt2 from "../assets/vehicle/studio-interior-2.jpg";
import spin360Mov from "../assets/vehicle/spin-360.mov";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onBack?: () => void;
  completed?: boolean;
  totalNoPhotos?: number;
  daysBaseline?: number;
  holdingPerDay?: number;
}

const EXTERIOR_TARGET = 9;
const INTERIOR_TARGET = 18;
const VIDEO_TARGET = 1;
const PER_CHILD_TOTAL = EXTERIOR_TARGET + INTERIOR_TARGET + VIDEO_TARGET; // 28

type Child = {
  stk: string;
  vin: string;
  mmytcc: string;
  exterior: number;
  interior: number;
  has360: boolean;
};

const INITIAL_CHILDREN: Child[] = [
  { stk: "STK-2210", vin: "5TFMA5DB4RX040924", mmytcc: "Toyota Tundra 1794 · 2024 · White", exterior: 0, interior: 0, has360: false },
  { stk: "STK-2212", vin: "5TFMA5DB4RX040931", mmytcc: "Toyota Tundra 1794 · 2024 · White", exterior: 0, interior: 0, has360: false },
  { stk: "STK-2214", vin: "5TFMA5DB4RX040944", mmytcc: "Toyota Tundra 1794 · 2024 · White", exterior: 0, interior: 0, has360: false },
];

// ─── Child card ──────────────────────────────────────────────────────────────

function ChildCard({
  child, refSetter, previewImg,
}: { child: Child; refSetter: (el: HTMLDivElement | null) => void; previewImg: string }) {
  const total = child.exterior + child.interior + (child.has360 ? 1 : 0);
  const done = total === PER_CHILD_TOTAL;
  return (
    <div
      ref={refSetter}
      className="relative rounded-[12px] overflow-hidden border border-black/10 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] flex"
    >
      {/* Thumbnail */}
      <div className="relative w-[112px] aspect-[4/3] shrink-0 bg-[#1f1f24]">
        {child.exterior > 0 ? (
          <img src={previewImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[4px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#4a4a55" strokeWidth="1.5" />
              <line x1="3" y1="3" x2="21" y2="21" stroke="#6b6b75" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[8px] uppercase tracking-[0.8px] text-[#6b6b75] font-bold">No photos</p>
          </div>
        )}
        <div className="absolute top-[6px] left-[6px]">
          {done ? (
            <span className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded-full bg-[#00C488] text-white text-[8px] font-bold uppercase tracking-[0.5px]">
              <Check size={8} strokeWidth={3} /> Matched
            </span>
          ) : (
            <span className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded-full bg-[#4600F2] text-white text-[8px] font-bold uppercase tracking-[0.5px]">
              <Layers size={8} /> Matching
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0 px-[12px] py-[10px] flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] truncate leading-tight">
            {child.stk}
          </p>
          <p className="text-[9px] text-black/55 font-['Inter:Medium',sans-serif] font-medium truncate mt-[1px]">
            VIN {child.vin}
          </p>
          <p className="text-[9px] text-black/50 font-['Inter:Regular',sans-serif] truncate mt-[1px]">
            {child.mmytcc}
          </p>
        </div>

        {/* Count badges */}
        <div className="mt-[6px] flex items-center gap-[4px]">
          <CountChip
            icon={<ImageIcon size={9} strokeWidth={2.5} />}
            value={child.exterior}
            target={EXTERIOR_TARGET}
            color="#4600F2"
          />
          <CountChip
            icon={<Aperture size={9} strokeWidth={2.5} />}
            value={child.interior}
            target={INTERIOR_TARGET}
            color="#F59E0B"
          />
          <CountChip
            icon={<RotateCw size={9} strokeWidth={2.5} />}
            value={child.has360 ? 1 : 0}
            target={VIDEO_TARGET}
            color="#00C488"
          />
        </div>
      </div>
    </div>
  );
}

function CountChip({
  icon, value, target, color,
}: { icon: React.ReactNode; value: number; target: number; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-[3px] px-[6px] py-[2px] rounded-[5px] bg-[#FAFAFB] border border-black/8"
      style={{ color }}
    >
      {icon}
      <span className="text-[10px] font-bold font-['Inter:Bold',sans-serif] leading-none">
        {value}<span className="text-black/35 font-medium">/{target}</span>
      </span>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SmartMatchModal({
  open, onClose, onNext, onBack, completed, totalNoPhotos = 90,
  daysBaseline = 8.2, holdingPerDay = 38,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const lineRefs = useRef<(SVGPathElement | null)[]>([null, null, null]);
  const flowRefs = useRef<(SVGPathElement | null)[]>([null, null, null]);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [children, setChildren] = useState<Child[]>(() => INITIAL_CHILDREN.map(c => ({ ...c })));
  // Holds the resolved SVG d="..." strings for each parent→child path
  const [paths, setPaths] = useState<string[]>(["", "", ""]);

  // Smart Match collapses days-to-frontline down to ~1 day (publish-on-Day-0 pitch)
  const daysAfter = 1;
  const daysSaved = Math.round((daysBaseline - daysAfter) * 10) / 10;
  const reductionPct = Math.round((daysSaved / daysBaseline) * 100);
  const eligible = Math.round(totalNoPhotos * 0.78);

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

  // Reset state when opened
  useEffect(() => {
    if (!open) return;
    setChildren(INITIAL_CHILDREN.map(c => ({ ...c })));
  }, [open]);

  // Compute SVG paths from parent → each child centre, relative to stage
  useEffect(() => {
    if (!open) return;
    const recompute = () => {
      const stage = stageRef.current;
      const parent = parentRef.current;
      if (!stage || !parent) return;
      const stageRect = stage.getBoundingClientRect();
      const pr = parent.getBoundingClientRect();
      // Parent anchor: right-middle
      const px = pr.right - stageRect.left;
      const py = pr.top - stageRect.top + pr.height / 2;
      const newPaths = childRefs.current.map((el) => {
        if (!el) return "";
        const cr = el.getBoundingClientRect();
        // Child anchor: left-middle
        const cx = cr.left - stageRect.left;
        const cy = cr.top - stageRect.top + cr.height / 2;
        // Cubic curve: control points sit horizontally
        const dx = (cx - px) * 0.5;
        return `M ${px} ${py} C ${px + dx} ${py}, ${cx - dx} ${cy}, ${cx} ${cy}`;
      });
      setPaths(newPaths);
    };
    const id = requestAnimationFrame(recompute);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", recompute);
    };
  }, [open]);

  // Once paths exist, draw them with GSAP, then loop a flowing dash along each
  useEffect(() => {
    if (!open || paths.every(p => p === "")) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.5 });

      // Draw each base line with a stroke-dashoffset reveal
      lineRefs.current.forEach((path, i) => {
        if (!path) return;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
        tl.to(path, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, i * 0.18);
      });

      // After lines drawn, animate a flowing dash (gradient overlay path) infinitely
      flowRefs.current.forEach((path) => {
        if (!path) return;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: `${len * 0.18} ${len * 0.82}`, strokeDashoffset: len, opacity: 1 });
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 1.6,
            ease: "none",
            repeat: -1,
          },
          "<+=0.2"
        );
      });
    });
    return () => ctx.revert();
  }, [open, paths]);

  // Animate orbs travelling along the paths (one per lane), repeatedly,
  // and credit each child as the orb lands
  useEffect(() => {
    if (!open || paths.every(p => p === "")) return;

    // Build the per-child delivery schedule: 9 ext → 18 int → 1 video = 28 each
    const schedule: { lane: number; kind: "exterior" | "interior" | "video" }[] = [];
    const cats = [
      { kind: "exterior" as const, count: EXTERIOR_TARGET },
      { kind: "interior" as const, count: INTERIOR_TARGET },
      { kind: "video" as const,    count: VIDEO_TARGET },
    ];
    cats.forEach(({ kind, count }) => {
      for (let i = 0; i < count; i++) {
        for (let lane = 0; lane < 3; lane++) {
          schedule.push({ lane, kind });
        }
      }
    });

    const ctx = gsap.context(() => {
      const start = 1.8; // start after lines have drawn
      const stepDelay = 0.15; // seconds between successive orb launches
      schedule.forEach((step, i) => {
        const orb = orbRefs.current[step.lane];
        const lineEl = lineRefs.current[step.lane];
        if (!orb || !lineEl) return;
        const len = lineEl.getTotalLength();
        const obj = { p: 0 };
        const at = start + i * stepDelay;

        gsap.fromTo(
          orb,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.15, ease: "power2.out", delay: at }
        );
        gsap.to(obj, {
          p: 1,
          duration: 0.65,
          ease: "power1.inOut",
          delay: at,
          onUpdate: () => {
            const point = lineEl.getPointAtLength(obj.p * len);
            gsap.set(orb, { x: point.x - 16, y: point.y - 12 });
          },
          onComplete: () => {
            gsap.to(orb, { opacity: 0, scale: 0.5, duration: 0.15 });
            // Credit the child
            setChildren(prev => prev.map((c, idx) => {
              if (idx !== step.lane) return c;
              if (step.kind === "exterior") return { ...c, exterior: Math.min(EXTERIOR_TARGET, c.exterior + 1) };
              if (step.kind === "interior") return { ...c, interior: Math.min(INTERIOR_TARGET, c.interior + 1) };
              return { ...c, has360: true };
            }));
          },
        });
      });
    });
    return () => ctx.revert();
  }, [open, paths]);

  // Progress bar
  const matchedSum = children.reduce((s, c) => s + c.exterior + c.interior + (c.has360 ? 1 : 0), 0);
  const matchedMax = children.length * PER_CHILD_TOTAL;
  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const pct = (matchedSum / matchedMax) * 100;
    gsap.to(bar, { width: `${pct}%`, duration: 0.4, ease: "power2.out" });
  }, [matchedSum, matchedMax]);

  if (!open) return null;

  const allDone = children.every(c => c.exterior === EXTERIOR_TARGET && c.interior === INTERIOR_TARGET && c.has360);
  const matchedChildren = children.filter(c => c.exterior === EXTERIOR_TARGET && c.interior === INTERIOR_TARGET && c.has360).length;
  const previews = [studioExt2, studioExt3, studioInt2];

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
        <div className="px-[28px] pt-[22px] pb-[16px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="flex items-start gap-[14px]">
              <div
                className="shrink-0 size-[44px] rounded-[12px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0,196,136,0.14) 0%, rgba(70,0,242,0.10) 100%)",
                  color: "#00C488",
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                    Smart Match — filling no-photo inventory
                  </h2>
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(0,196,136,0.12)] text-[#00C488] text-[10px] font-semibold uppercase tracking-[0.6px]">
                    <Zap size={10} />
                    New vehicles only
                  </span>
                  {completed && (
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px]">
                      <Check size={10} strokeWidth={3} />
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                  One donor sends its full media set to every matching vehicle.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-[32px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} className="text-black/60" />
            </button>
          </div>

          {/* Stats row — same shape as the CGI / Raw modals */}
          <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[10px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Vehicles matched
              </p>
              <p className="mt-[4px] text-[20px] font-bold text-[#00C488] font-['Inter:Bold',sans-serif] leading-none">
                {matchedChildren}<span className="text-black/30 text-[13px] font-medium"> / {eligible}</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[10px]">
              <div className="flex items-center gap-[6px]">
                <Clock size={11} className="text-[#4600F2]" />
                <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                  Days to Frontline
                </p>
              </div>
              <p className="mt-[4px] text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
                <span className="text-black/40 text-[14px] font-medium line-through mr-[6px]">{daysBaseline.toFixed(1)}</span>
                {daysAfter.toFixed(1)}<span className="text-[12px] font-semibold text-[#10B981] ml-[4px]">−{reductionPct}%</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[10px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Holding cost saved
              </p>
              <p className="mt-[4px] text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
                $<span>{(matchedSum * daysSaved * holdingPerDay / PER_CHILD_TOTAL).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-[14px] flex items-center gap-[12px]">
            <div className="flex-1 h-[6px] rounded-full bg-[#F1F1F4] overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background: "linear-gradient(90deg, #00C488 0%, #4600F2 100%)",
                }}
              />
            </div>
            <p className="text-[11px] text-black/50 font-medium font-['Inter:Medium',sans-serif]">
              Matching in progress
            </p>
          </div>
        </div>

        {/* Stage — parent + lines + 3 children, all on one screen */}
        <div
          ref={stageRef}
          className="relative flex-1 px-[24px] py-[16px] bg-[#FAFAFB] overflow-hidden"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] gap-[40px] h-full items-center">
            {/* Donor parent */}
            <div ref={parentRef} className="relative">
              <p className="text-[9px] uppercase tracking-[0.8px] font-bold text-black/55 mb-[6px] font-['Inter:Bold',sans-serif]">
                Donor vehicle
              </p>
              <div className="relative rounded-[14px] overflow-hidden border-[2px] border-[#00C488] shadow-[0_8px_24px_rgba(0,196,136,0.18)] aspect-[16/11]">
                <img src={studioExt1} alt="Donor" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-[8px] left-[8px]">
                  <span className="inline-flex items-center gap-[4px] px-[7px] py-[2px] rounded-full bg-[#00C488] text-white text-[9px] font-bold uppercase tracking-[0.5px]">
                    <Check size={9} strokeWidth={3} />
                    Donor
                  </span>
                </div>
                <div className="absolute bottom-[8px] left-[8px] right-[8px] bg-black/55 backdrop-blur-sm rounded-[6px] px-[8px] py-[5px]">
                  <p className="text-[10px] font-bold text-white font-['Inter:Bold',sans-serif] leading-tight">
                    2024 Toyota Tundra 1794
                  </p>
                  <p className="text-[8px] text-white/70 leading-tight mt-[1px]">
                    STK-2107 · full media set
                  </p>
                </div>
              </div>
              <p className="mt-[8px] text-[10px] text-black/55 font-['Inter:Regular',sans-serif] leading-tight">
                Sending its full media set to every spec-match.
              </p>
            </div>

            {/* Children stack */}
            <div className="flex flex-col gap-[10px]">
              {children.map((c, i) => (
                <ChildCard
                  key={c.stk}
                  child={c}
                  refSetter={(el) => { childRefs.current[i] = el; }}
                  previewImg={previews[i % previews.length]}
                />
              ))}
            </div>
          </div>

          {/* SVG layer for the flowing lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient id="sm-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"  stopColor="#00C488" />
                <stop offset="100%" stopColor="#4600F2" />
              </linearGradient>
            </defs>
            {paths.map((d, i) => (
              <g key={i}>
                {/* Base path (drawn once) */}
                <path
                  ref={(el) => { lineRefs.current[i] = el; }}
                  d={d}
                  stroke="rgba(0,196,136,0.25)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  style={{ opacity: 0 }}
                />
                {/* Flowing dash overlay */}
                <path
                  ref={(el) => { flowRefs.current[i] = el; }}
                  d={d}
                  stroke="url(#sm-flow-grad)"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  style={{ opacity: 0, filter: "drop-shadow(0 0 4px rgba(0,196,136,0.5))" }}
                />
              </g>
            ))}
          </svg>

          {/* Three orbs (one per lane) that travel along the lines */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => { orbRefs.current[i] = el; }}
              className="absolute pointer-events-none top-0 left-0 size-[32px] rounded-full opacity-0"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(0,196,136,0.85) 40%, rgba(70,0,242,0.85) 100%)",
                boxShadow: "0 0 14px 4px rgba(0,196,136,0.55)",
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[11px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#00C488] animate-pulse" />
            Smart Match active · time-to-life:
            <span className="text-[#0a0a0a] font-semibold ml-[2px]">−{reductionPct}%</span>
            {allDone && <span className="text-[#00C488] font-bold ml-[6px]">All 3 matched</span>}
          </div>
          <div className="flex items-center gap-[8px]">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-[38px] px-[14px] rounded-[10px] inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#0a0a0a] hover:bg-black/5 transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                <ArrowRight size={13} strokeWidth={2.5} className="rotate-180" />
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
                Next: CGI / Stock photos
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
