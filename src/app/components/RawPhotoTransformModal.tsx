import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Check, Sparkles, Wand2 } from "lucide-react";
import imgCar from "../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onBack?: () => void;
  stageCompleted?: boolean;
  totalRaw?: number;
}

type Status = "queued" | "processing" | "done";

type Card = {
  id: number;
  name: string;
  stk: string;
  status: Status;
};

const VEHICLE_NAMES = [
  "2021 Ford Mustang GT Premium",
  "2020 Ford F-150 XLT",
  "2022 Chevrolet Silverado LT",
  "2021 Toyota Camry SE",
  "2022 BMW 3 Series 330i",
  "2023 Honda Accord Sport",
  "2021 Audi Q5 Premium",
  "2022 Tesla Model 3 LR",
];

// ─── Background presets ──────────────────────────────────────────────────────

// Raw / dealership-lot look — grimy, uneven, noisy
const rawBg = (i: number) => {
  const variants = [
    "linear-gradient(180deg, #6B7280 0%, #4B5563 60%, #374151 100%)",
    "linear-gradient(180deg, #78716C 0%, #57534E 60%, #44403C 100%)",
    "linear-gradient(180deg, #71717A 0%, #52525B 60%, #3F3F46 100%)",
  ];
  return variants[i % variants.length];
};

// Polished studio look — clean white/gradient floor
const studioBg = `
  radial-gradient(ellipse at 50% 100%, rgba(70,0,242,0.18) 0%, transparent 70%),
  linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 55%, #DDE3EC 100%)
`;

// ─── Individual transform card ───────────────────────────────────────────────

function TransformCard({ card, index }: { card: Card; index: number }) {
  const rawLayerRef = useRef<HTMLDivElement>(null);
  const studioLayerRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // React to status transitions with GSAP
  useEffect(() => {
    if (card.status === "processing") {
      const scan = scanRef.current;
      if (scan) {
        gsap.fromTo(
          scan,
          { y: "-100%", opacity: 0.0 },
          { y: "100%", opacity: 1.0, duration: 1.4, ease: "power1.inOut" }
        );
      }
      // Car gently bobs while processing
      if (carRef.current) {
        gsap.fromTo(
          carRef.current,
          { y: 0 },
          { y: -3, duration: 0.6, yoyo: true, repeat: 2, ease: "sine.inOut" }
        );
      }
    } else if (card.status === "done") {
      // Cross-fade: raw bg fades out, studio bg fades in
      const raw = rawLayerRef.current;
      const studio = studioLayerRef.current;
      const scan = scanRef.current;
      if (raw) gsap.to(raw, { opacity: 0, duration: 0.5, ease: "power2.out" });
      if (studio) gsap.fromTo(studio, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" });
      if (scan) gsap.to(scan, { opacity: 0, duration: 0.3 });
      // Car settle with subtle scale
      if (carRef.current) {
        gsap.fromTo(
          carRef.current,
          { scale: 1.02 },
          { scale: 1, duration: 0.5, ease: "power3.out" }
        );
      }
      // Badge pop
      if (badgeRef.current) {
        gsap.fromTo(
          badgeRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }
        );
      }
    }
  }, [card.status]);

  return (
    <div className="relative bg-white rounded-[12px] border border-black/8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {/* Image area */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Raw background (visible until done) */}
        <div
          ref={rawLayerRef}
          className="absolute inset-0"
          style={{ background: rawBg(index) }}
        >
          {/* Noise / grime overlay */}
          <div
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.5) 0%, transparent 40%)",
            }}
          />
        </div>

        {/* Studio background (revealed when done) */}
        <div
          ref={studioLayerRef}
          className="absolute inset-0 opacity-0"
          style={{ background: studioBg }}
        />

        {/* Vehicle */}
        <img
          ref={carRef}
          src={imgCar}
          alt={card.name}
          className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
        />

        {/* Scan beam (visible while processing) */}
        <div
          ref={scanRef}
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-[40%] opacity-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(70,0,242,0.35) 50%, transparent 100%)",
            boxShadow: "0 0 30px 8px rgba(70,0,242,0.4)",
          }}
        />

        {/* Status badge */}
        <div className="absolute top-[8px] left-[8px]">
          {card.status === "queued" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px]">
              Queued
            </span>
          )}
          {card.status === "processing" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#4600F2] text-white text-[10px] font-semibold font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px]">
              <span className="size-[5px] rounded-full bg-white animate-pulse" />
              Processing
            </span>
          )}
          {card.status === "done" && (
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#10B981] text-white text-[10px] font-semibold font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.6px]"
            >
              <Check size={10} strokeWidth={3} />
              Studio Ready
            </div>
          )}
        </div>

        {/* Before / After tag */}
        <div className="absolute bottom-[8px] right-[8px]">
          {card.status === "done" ? (
            <span className="text-[9px] font-bold tracking-[1.2px] uppercase px-[6px] py-[2px] rounded bg-white/90 text-[#4600F2] font-['Inter:Bold',sans-serif]">
              After
            </span>
          ) : (
            <span className="text-[9px] font-bold tracking-[1.2px] uppercase px-[6px] py-[2px] rounded bg-black/55 text-white font-['Inter:Bold',sans-serif] backdrop-blur-sm">
              Before
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="px-[12px] py-[10px]">
        <p className="text-[12px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
          {card.name}
        </p>
        <p className="text-[10px] text-black/45 mt-[1px] font-['Inter:Regular',sans-serif]">
          {card.stk} · Studio background • Brand floor
        </p>
      </div>
    </div>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

export function RawPhotoTransformModal({ open, onClose, onNext, onBack, stageCompleted, totalRaw = 67 }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Generate the visible grid of cards
  const VISIBLE = 8;
  const [cards, setCards] = useState<Card[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({
      id: i + 1,
      name: VEHICLE_NAMES[i % VEHICLE_NAMES.length],
      stk: `STK-${2100 + i}`,
      status: "queued" as Status,
    }))
  );
  const [completed, setCompleted] = useState(0);
  const nextIdRef = useRef(VISIBLE + 1);

  // Modal entrance animation
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 24, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [open]);

  // Reset when re-opened
  useEffect(() => {
    if (!open) return;
    setCards(
      Array.from({ length: VISIBLE }, (_, i) => ({
        id: i + 1,
        name: VEHICLE_NAMES[i % VEHICLE_NAMES.length],
        stk: `STK-${2100 + i}`,
        status: "queued" as Status,
      }))
    );
    setCompleted(0);
    nextIdRef.current = VISIBLE + 1;
  }, [open]);

  // Drive the processing pipeline: queue → processing → done, then rotate in next vehicle
  useEffect(() => {
    if (!open) return;

    // Stage 1: kick off — promote first 2 to processing immediately
    const kickoff = setTimeout(() => {
      setCards((prev) =>
        prev.map((c, i) => (i < 2 ? { ...c, status: "processing" } : c))
      );
    }, 300);

    // Stage 2: every ~1.6s — finish the oldest processing card, start the next queued
    const tick = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        // Mark the first "processing" card as "done"
        const processingIdx = next.findIndex((c) => c.status === "processing");
        if (processingIdx !== -1) {
          next[processingIdx] = { ...next[processingIdx], status: "done" };
          setCompleted((n) => n + 1);
        }
        // Promote the first "queued" card to "processing"
        const queuedIdx = next.findIndex((c) => c.status === "queued");
        if (queuedIdx !== -1) {
          next[queuedIdx] = { ...next[queuedIdx], status: "processing" };
        }
        // If a card just finished, after a brief moment swap it out for a fresh queued one
        // so the grid keeps flowing instead of going entirely "done"
        return next;
      });
    }, 1600);

    // Stage 3: rotate completed cards out — replace the oldest "done" with a fresh queued card
    const rotate = setInterval(() => {
      setCards((prev) => {
        const doneIdx = prev.findIndex((c) => c.status === "done");
        if (doneIdx === -1) return prev;
        const next = [...prev];
        const newId = nextIdRef.current++;
        next[doneIdx] = {
          id: newId,
          name: VEHICLE_NAMES[(newId - 1) % VEHICLE_NAMES.length],
          stk: `STK-${2100 + newId - 1}`,
          status: "queued",
        };
        return next;
      });
    }, 2400);

    return () => {
      clearTimeout(kickoff);
      clearInterval(tick);
      clearInterval(rotate);
    };
  }, [open]);

  // Animate progress bar width based on completed count
  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const pct = Math.min(100, (completed / totalRaw) * 100);
    gsap.to(bar, { width: `${pct}%`, duration: 0.5, ease: "power2.out" });
  }, [completed, totalRaw]);

  if (!open) return null;

  const displayedCompleted = Math.min(completed, totalRaw);
  const remaining = Math.max(0, totalRaw - displayedCompleted);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-6"
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
                  background:
                    "linear-gradient(135deg, rgba(70,0,242,0.12) 0%, rgba(0,196,136,0.12) 100%)",
                  color: "#4600F2",
                }}
              >
                <Wand2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                    Transforming raw photos
                  </h2>
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(70,0,242,0.08)] text-[#4600F2] text-[10px] font-semibold uppercase tracking-[0.6px]">
                    <Sparkles size={10} />
                    Smart Studio
                  </span>
                  {stageCompleted && (
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px]">
                      <Check size={10} strokeWidth={3} />
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                  Swapping lot backgrounds for clean studio media.
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

          {/* Progress */}
          <div className="mt-[16px] flex items-center gap-[16px]">
            <div className="flex-1 h-[8px] rounded-full bg-[#F1F1F4] overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full rounded-full"
                style={{
                  width: "0%",
                  background:
                    "linear-gradient(90deg, #4600F2 0%, #7F6AF2 50%, #00C488 100%)",
                }}
              />
            </div>
            <div className="text-right shrink-0">
              <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
                <span className="text-[#4600F2]">{displayedCompleted}</span>
                <span className="text-black/40"> / {totalRaw}</span>
              </p>
              <p className="text-[10px] text-black/45 mt-[3px] font-['Inter:Medium',sans-serif] font-medium uppercase tracking-[0.6px]">
                {remaining} remaining
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-[28px] py-[20px] bg-[#FAFAFB]">
          <div className="grid grid-cols-4 gap-[14px]">
            {cards.map((c, i) => (
              <TransformCard key={c.id} card={c} index={i} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#10B981] animate-pulse" />
            Ford Sec 48 · brand-tuned background
          </div>
          <div className="flex items-center gap-[10px]">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-[40px] px-[16px] rounded-[10px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#0a0a0a] hover:bg-black/5 transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M11 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back
              </button>
            )}
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="h-[40px] px-[20px] rounded-[10px] text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-[8px]"
                style={{
                  background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                  boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
                }}
              >
                Next: Fix No-Photo vehicles
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
