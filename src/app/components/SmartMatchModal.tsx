import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Check, Layers, ArrowRight, Zap, Clock } from "lucide-react";
import imgCar from "../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onBack?: () => void;
  completed?: boolean;
  totalNoPhotos?: number;
  /** Baseline days to frontline (dealer's input) */
  daysBaseline?: number;
  /** $ holding cost per day per VIN (dealer's input) */
  holdingPerDay?: number;
}

type Status = "scanning" | "matching" | "applied";

type MatchCard = {
  id: number;
  name: string;
  stk: string;
  trim: string;
  status: Status;
  matchedFrom: string;
};

const NEW_VEHICLES = [
  { name: "2025 Ford F-150 XLT",            trim: "XLT · Iconic Silver",     stk: "STK-2210" },
  { name: "2025 Ford F-150 XLT",            trim: "XLT · Iconic Silver",     stk: "STK-2211" },
  { name: "2025 Ford Mustang GT",           trim: "GT Premium · Race Red",    stk: "STK-2212" },
  { name: "2025 Ford Mustang GT",           trim: "GT Premium · Race Red",    stk: "STK-2213" },
  { name: "2025 Ford Explorer Limited",     trim: "Limited · Star White",     stk: "STK-2214" },
  { name: "2025 Ford Explorer Limited",     trim: "Limited · Star White",     stk: "STK-2215" },
  { name: "2025 Ford Bronco Outer Banks",   trim: "Outer Banks · Cactus Gray", stk: "STK-2216" },
  { name: "2025 Ford Bronco Outer Banks",   trim: "Outer Banks · Cactus Gray", stk: "STK-2217" },
];

const STUDIO_BG = `
  radial-gradient(ellipse at 50% 100%, rgba(0,196,136,0.18) 0%, transparent 70%),
  linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 55%, #DDE3EC 100%)
`;

// ─── How-it-works diagram ─────────────────────────────────────────────────────

function HowItWorks() {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;
    const tween = gsap.fromTo(
      beam,
      { x: "-110%", opacity: 0 },
      {
        x: "110%",
        opacity: 1,
        duration: 1.8,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.4,
      }
    );
    return () => { tween.kill(); };
  }, []);

  const Tile = ({ label, sub, primary }: { label: string; sub: string; primary?: boolean }) => (
    <div
      className={`relative shrink-0 w-[180px] aspect-[4/3] rounded-[12px] overflow-hidden border ${
        primary ? "border-[#00C488] shadow-[0_0_0_3px_rgba(0,196,136,0.15)]" : "border-black/10"
      }`}
      style={{ background: STUDIO_BG }}
    >
      <img src={imgCar} alt="" className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)]" />
      <div className="absolute top-[8px] left-[8px]">
        <span
          className={`inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[10px] font-semibold uppercase tracking-[0.6px] ${
            primary ? "bg-[#00C488] text-white" : "bg-black/55 text-white backdrop-blur-sm"
          }`}
        >
          {primary ? <><Check size={10} strokeWidth={3} />Donor</> : "No photos"}
        </span>
      </div>
      <div className="absolute bottom-[8px] left-[8px] right-[8px]">
        <p className="text-[11px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-tight">
          {label}
        </p>
        <p className="text-[9px] text-black/55 mt-[1px]">{sub}</p>
      </div>
    </div>
  );

  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-[18px]">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <Layers size={16} className="text-[#00C488]" />
        <p className="text-[12px] font-semibold uppercase tracking-[1px] text-black/55 font-['Inter:Semi_Bold',sans-serif]">
          How Smart Match works
        </p>
      </div>
      <div className="relative flex items-center gap-[20px] justify-center">
        <Tile label="2024 Ford F-150 XLT" sub="STK-2103 · already photographed" primary />
        <div className="relative shrink-0 flex flex-col items-center gap-[6px]">
          <div className="relative w-[80px] h-[28px] rounded-full bg-[rgba(0,196,136,0.1)] overflow-hidden flex items-center justify-center">
            <div
              ref={beamRef}
              className="absolute inset-y-0 w-[60%]"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(0,196,136,0.6) 50%, transparent 100%)",
              }}
            />
            <ArrowRight size={14} className="text-[#00C488] relative z-10" strokeWidth={2.5} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#00C488] font-['Inter:Bold',sans-serif]">
            Same trim · Same color
          </p>
        </div>
        <Tile label="2025 Ford F-150 XLT" sub="STK-2210 · no photos yet" />
      </div>
      <p className="mt-[12px] text-[12px] text-black/55 text-center font-['Inter:Regular',sans-serif]">
        Same trim, same color — instant media for new arrivals.
      </p>
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ card }: { card: MatchCard }) {
  const studioRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (card.status === "scanning") {
      if (scanRef.current) {
        gsap.fromTo(
          scanRef.current,
          { y: "-100%", opacity: 0 },
          { y: "100%", opacity: 1, duration: 1.2, ease: "power1.inOut" }
        );
      }
    } else if (card.status === "matching") {
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, ease: "power2.out", transformOrigin: "left" }
        );
      }
    } else if (card.status === "applied") {
      if (studioRef.current) {
        gsap.fromTo(studioRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" });
      }
      if (carRef.current) {
        gsap.fromTo(carRef.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: "power3.out" });
      }
    }
  }, [card.status]);

  const isApplied = card.status === "applied";

  return (
    <div className="relative bg-white rounded-[12px] border border-black/8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
        {/* Empty / dark "no photo" placeholder */}
        {!isApplied && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-[6px] bg-[#1f1f24]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="#4a4a55" strokeWidth="1.5" />
              <path d="M3 17l5-4 3 2 4-4 6 5" stroke="#4a4a55" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="3" x2="21" y2="21" stroke="#6b6b75" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[10px] uppercase tracking-[1px] text-[#6b6b75] font-semibold font-['Inter:Semi_Bold',sans-serif]">
              No photo
            </p>
          </div>
        )}

        {/* Studio background reveal (when applied) */}
        <div ref={studioRef} className="absolute inset-0 opacity-0" style={{ background: STUDIO_BG }} />

        {/* Vehicle photo (only visible after applied) */}
        {isApplied && (
          <img
            ref={carRef}
            src={imgCar}
            alt={card.name}
            className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
          />
        )}

        {/* Scan beam */}
        <div
          ref={scanRef}
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-[40%] opacity-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(0,196,136,0.4) 50%, transparent 100%)",
            boxShadow: "0 0 30px 8px rgba(0,196,136,0.4)",
          }}
        />

        {/* Match line indicator on matching */}
        {card.status === "matching" && (
          <div
            ref={lineRef}
            aria-hidden
            className="absolute left-[8px] right-[8px] bottom-[40%] h-[2px] origin-left"
            style={{
              background: "linear-gradient(90deg, #00C488 0%, transparent 100%)",
            }}
          />
        )}

        {/* Status badge */}
        <div className="absolute top-[8px] left-[8px]">
          {card.status === "scanning" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <span className="size-[5px] rounded-full bg-white animate-pulse" />
              Scanning
            </span>
          )}
          {card.status === "matching" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#4600F2] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <Layers size={10} />
              Matching
            </span>
          )}
          {card.status === "applied" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#00C488] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <Check size={10} strokeWidth={3} />
              Matched
            </span>
          )}
        </div>

        {/* New badge in corner */}
        <div className="absolute top-[8px] right-[8px]">
          <span className="text-[9px] font-bold tracking-[1px] uppercase px-[6px] py-[2px] rounded bg-[#4600F2] text-white font-['Inter:Bold',sans-serif]">
            New
          </span>
        </div>

        {/* Matched from caption */}
        {isApplied && (
          <div className="absolute bottom-[8px] left-[8px] right-[8px] flex items-center gap-[4px] bg-black/55 backdrop-blur-sm rounded-[6px] px-[6px] py-[3px]">
            <Layers size={9} className="text-[#5DEAB0] shrink-0" />
            <p className="text-[9px] text-white truncate font-['Inter:Medium',sans-serif] font-medium">
              From <span className="font-bold">{card.matchedFrom}</span>
            </p>
          </div>
        )}
      </div>

      <div className="px-[12px] py-[10px]">
        <p className="text-[12px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
          {card.name}
        </p>
        <p className="text-[10px] text-black/45 mt-[1px] font-['Inter:Regular',sans-serif] truncate">
          {card.stk} · {card.trim}
        </p>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function SmartMatchModal({
  open, onClose, onNext, onBack, completed, totalNoPhotos = 90,
  daysBaseline = 8.2, holdingPerDay = 38,
}: Props) {
  // Smart Match cuts the dealer's frontline cycle roughly in half
  const daysAfter = Math.round((daysBaseline / 2) * 10) / 10;
  const daysSaved = Math.round((daysBaseline - daysAfter) * 10) / 10;
  const reductionPct = Math.round((daysSaved / daysBaseline) * 100);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const VISIBLE = 8;
  const [cards, setCards] = useState<MatchCard[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({
      id: i + 1,
      name: NEW_VEHICLES[i % NEW_VEHICLES.length].name,
      stk: NEW_VEHICLES[i % NEW_VEHICLES.length].stk,
      trim: NEW_VEHICLES[i % NEW_VEHICLES.length].trim,
      status: "scanning" as Status,
      matchedFrom: `STK-${2100 + i}`,
    }))
  );
  const [matched, setMatched] = useState(0);
  const nextIdRef = useRef(VISIBLE + 1);
  // Smart Match works on new vehicles only — assume ~70% of no-photo inventory is new
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
        name: NEW_VEHICLES[i % NEW_VEHICLES.length].name,
        stk: NEW_VEHICLES[i % NEW_VEHICLES.length].stk,
        trim: NEW_VEHICLES[i % NEW_VEHICLES.length].trim,
        status: "scanning" as Status,
        matchedFrom: `STK-${2100 + i}`,
      }))
    );
    setMatched(0);
    nextIdRef.current = VISIBLE + 1;
  }, [open]);

  // Drive the pipeline: scanning → matching → applied; rotate fresh queued cards in
  useEffect(() => {
    if (!open) return;

    // Promote first two cards to "matching" quickly
    const kickoff = setTimeout(() => {
      setCards((prev) => prev.map((c, i) => (i < 2 ? { ...c, status: "matching" } : c)));
    }, 300);

    const tick = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        // Finish oldest matching → applied
        const matchingIdx = next.findIndex((c) => c.status === "matching");
        if (matchingIdx !== -1) {
          next[matchingIdx] = { ...next[matchingIdx], status: "applied" };
          setMatched((n) => n + 1);
        }
        // Promote oldest scanning → matching
        const scanningIdx = next.findIndex((c) => c.status === "scanning");
        if (scanningIdx !== -1) {
          next[scanningIdx] = { ...next[scanningIdx], status: "matching" };
        }
        return next;
      });
    }, 1600);

    // Rotate applied cards out for fresh scanning ones
    const rotate = setInterval(() => {
      setCards((prev) => {
        const appliedIdx = prev.findIndex((c) => c.status === "applied");
        if (appliedIdx === -1) return prev;
        const next = [...prev];
        const newId = nextIdRef.current++;
        const veh = NEW_VEHICLES[(newId - 1) % NEW_VEHICLES.length];
        next[appliedIdx] = {
          id: newId,
          name: veh.name,
          stk: veh.stk,
          trim: veh.trim,
          status: "scanning",
          matchedFrom: `STK-${2100 + newId - 1}`,
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

  // Animate progress bar (vs eligible new vehicles count)
  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const pct = Math.min(100, (matched / eligible) * 100);
    gsap.to(bar, { width: `${pct}%`, duration: 0.5, ease: "power2.out" });
  }, [matched, eligible]);

  if (!open) return null;

  const displayedMatched = Math.min(matched, eligible);

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
                    "linear-gradient(135deg, rgba(0,196,136,0.14) 0%, rgba(70,0,242,0.10) 100%)",
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
                  Reusing studio media from spec-matched VINs already on your lot.
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

          {/* Impact stats row */}
          <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[10px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Photos added via Smart Match
              </p>
              <p className="mt-[4px] text-[20px] font-bold text-[#00C488] font-['Inter:Bold',sans-serif] leading-none">
                {displayedMatched}<span className="text-black/30 text-[13px] font-medium"> / {eligible}</span>
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
                $<span>{(displayedMatched * daysSaved * holdingPerDay).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
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

        {/* Body — split: how it works + matched grid */}
        <div className="flex-1 overflow-auto px-[28px] py-[18px] bg-[#FAFAFB]">
          <HowItWorks />

          <div className="mt-[18px]">
            <p className="text-[11px] uppercase tracking-[1px] font-semibold text-black/55 mb-[8px] font-['Inter:Semi_Bold',sans-serif]">
              No-photo vehicles getting matched live
            </p>
            <div className="grid grid-cols-4 gap-[14px]">
              {cards.map((c) => (
                <MatchCard key={c.id} card={c} />
              ))}
            </div>
          </div>

          <p className="mt-[12px] text-[11px] text-black/45 text-center font-['Inter:Regular',sans-serif]">
            Used VINs are queued for the next Studio capture.
          </p>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#00C488] animate-pulse" />
            Smart Match active · Time-to-life on inventory:
            <span className="text-[#0a0a0a] font-semibold ml-[2px]">−{reductionPct}%</span>
          </div>
          <div className="flex items-center gap-[10px]">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="h-[40px] px-[16px] rounded-[10px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#0a0a0a] hover:bg-black/5 transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                <ArrowRight size={14} strokeWidth={2.5} className="rotate-180" />
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
                Next: CGI / Stock photos
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
