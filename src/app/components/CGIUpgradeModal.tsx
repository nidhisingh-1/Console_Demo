import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Check, Layers, ArrowRight, Image as ImageIcon, Camera, TrendingUp, Eye, Award } from "lucide-react";
import imgCar from "../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";

interface Props {
  open: boolean;
  onClose: () => void;
  onNext?: () => void;
  onBack?: () => void;
  completed?: boolean;
  totalCgi?: number;
}

type Status = "scanning" | "matching" | "applied";

type UpgradeCard = {
  id: number;
  name: string;
  stk: string;
  trim: string;
  status: Status;
  matchedFrom: string;
};

const NEW_VEHICLES = [
  { name: "2025 Ford F-150 XLT",            trim: "XLT · Iconic Silver",     stk: "STK-3210" },
  { name: "2025 Ford Mustang GT",           trim: "GT Premium · Race Red",    stk: "STK-3212" },
  { name: "2025 Ford Explorer Limited",     trim: "Limited · Star White",     stk: "STK-3214" },
  { name: "2025 Ford Bronco Outer Banks",   trim: "Outer Banks · Cactus Gray",stk: "STK-3216" },
  { name: "2025 Ford Maverick Lariat",      trim: "Lariat · Hot Pepper",      stk: "STK-3218" },
  { name: "2025 Ford Escape ST-Line",       trim: "ST-Line · Atlas Blue",     stk: "STK-3220" },
  { name: "2025 Ford Edge ST",              trim: "ST · Carbonized Gray",     stk: "STK-3222" },
  { name: "2025 Ford Ranger Lariat",        trim: "Lariat · Velocity Blue",   stk: "STK-3224" },
];

// CGI / stock look — flat, slightly cartoonish, pastel
const CGI_BG = `
  repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 6px, transparent 6px 12px),
  radial-gradient(ellipse at 50% 100%, rgba(127,106,242,0.22) 0%, transparent 70%),
  linear-gradient(180deg, #E9E5FF 0%, #D7CDFB 60%, #B8A8F3 100%)
`;

// Real studio photo look — same as the other modals
const REAL_BG = `
  radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.18) 0%, transparent 70%),
  linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 55%, #DDE3EC 100%)
`;

// ─── Before/After hero — sells the upgrade ────────────────────────────────────

function UpgradeDiagram() {
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

  return (
    <div className="rounded-[14px] border border-black/8 bg-white p-[18px]">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <TrendingUp size={16} className="text-[#F59E0B]" />
        <p className="text-[12px] font-semibold uppercase tracking-[1px] text-black/55 font-['Inter:Semi_Bold',sans-serif]">
          From placeholder to authentic
        </p>
      </div>
      <div className="relative flex items-center gap-[20px] justify-center">
        {/* CGI / stock tile */}
        <div
          className="relative shrink-0 w-[200px] aspect-[4/3] rounded-[12px] overflow-hidden border border-black/10"
          style={{ background: CGI_BG }}
        >
          <img
            src={imgCar}
            alt=""
            className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain opacity-90"
            style={{ filter: "saturate(0.75) brightness(1.05) contrast(0.85)" }}
          />
          <div className="absolute top-[8px] left-[8px]">
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#7F6AF2] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <ImageIcon size={10} />
              CGI / Stock
            </span>
          </div>
          <div className="absolute bottom-[8px] left-[8px] right-[8px]">
            <p className="text-[10px] text-white/95 font-semibold font-['Inter:Semi_Bold',sans-serif] bg-black/45 backdrop-blur-sm rounded px-[6px] py-[2px] inline-block">
              Today
            </p>
          </div>
        </div>

        {/* Beam */}
        <div className="relative shrink-0 flex flex-col items-center gap-[6px]">
          <div className="relative w-[80px] h-[28px] rounded-full bg-[rgba(245,158,11,0.12)] overflow-hidden flex items-center justify-center">
            <div
              ref={beamRef}
              className="absolute inset-y-0 w-[60%]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.65) 50%, transparent 100%)",
              }}
            />
            <ArrowRight size={14} className="text-[#F59E0B] relative z-10" strokeWidth={2.5} />
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#F59E0B] font-['Inter:Bold',sans-serif]">
            Smart Match upgrade
          </p>
        </div>

        {/* Real photo tile */}
        <div
          className="relative shrink-0 w-[200px] aspect-[4/3] rounded-[12px] overflow-hidden border-[2px] border-[#10B981] shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
          style={{ background: REAL_BG }}
        >
          <img
            src={imgCar}
            alt=""
            className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.2)]"
          />
          <div className="absolute top-[8px] left-[8px]">
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#10B981] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <Camera size={10} />
              Real photo
            </span>
          </div>
          <div className="absolute bottom-[8px] left-[8px] right-[8px]">
            <p className="text-[10px] text-white/95 font-semibold font-['Inter:Semi_Bold',sans-serif] bg-[#10B981] rounded px-[6px] py-[2px] inline-block">
              After Smart Match
            </p>
          </div>
        </div>
      </div>
      <p className="mt-[14px] text-[12px] text-black/55 text-center font-['Inter:Regular',sans-serif] leading-[18px] max-w-[560px] mx-auto">
        Same trim, same color — real photography from a VIN already on your lot.
      </p>
    </div>
  );
}

// ─── Upgrade card ─────────────────────────────────────────────────────────────

function UpgradeTile({ card }: { card: UpgradeCard }) {
  const cgiLayerRef = useRef<HTMLDivElement>(null);
  const realLayerRef = useRef<HTMLDivElement>(null);
  const cgiCarRef = useRef<HTMLImageElement>(null);
  const realCarRef = useRef<HTMLImageElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (card.status === "scanning") {
      if (scanRef.current) {
        gsap.fromTo(
          scanRef.current,
          { y: "-100%", opacity: 0 },
          { y: "100%", opacity: 1, duration: 1.2, ease: "power1.inOut" }
        );
      }
    } else if (card.status === "applied") {
      if (cgiLayerRef.current) gsap.to(cgiLayerRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" });
      if (cgiCarRef.current)   gsap.to(cgiCarRef.current,   { opacity: 0, duration: 0.4 });
      if (realLayerRef.current) gsap.fromTo(realLayerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: "power2.out" });
      if (realCarRef.current)   gsap.fromTo(realCarRef.current,   { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" });
      if (scanRef.current)      gsap.to(scanRef.current, { opacity: 0, duration: 0.3 });
    }
  }, [card.status]);

  return (
    <div className="relative bg-white rounded-[12px] border border-black/8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* CGI layer (initial state) */}
        <div ref={cgiLayerRef} className="absolute inset-0" style={{ background: CGI_BG }} />
        <img
          ref={cgiCarRef}
          src={imgCar}
          alt=""
          className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain"
          style={{ filter: "saturate(0.75) brightness(1.05) contrast(0.85)", opacity: 0.95 }}
        />

        {/* Real layer (revealed when applied) */}
        <div ref={realLayerRef} className="absolute inset-0 opacity-0" style={{ background: REAL_BG }} />
        {card.status === "applied" && (
          <img
            ref={realCarRef}
            src={imgCar}
            alt={card.name}
            className="absolute inset-0 m-auto w-[78%] h-[78%] object-contain opacity-0 drop-shadow-[0_8px_12px_rgba(0,0,0,0.25)]"
          />
        )}

        {/* Scan beam */}
        <div
          ref={scanRef}
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-0 h-[40%] opacity-0"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.4) 50%, transparent 100%)",
            boxShadow: "0 0 30px 8px rgba(245,158,11,0.4)",
          }}
        />

        {/* Status badge */}
        <div className="absolute top-[8px] left-[8px]">
          {card.status === "scanning" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#7F6AF2] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <ImageIcon size={10} />
              CGI
            </span>
          )}
          {card.status === "matching" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#F59E0B] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <Layers size={10} />
              Matching
            </span>
          )}
          {card.status === "applied" && (
            <span className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full bg-[#10B981] text-white text-[10px] font-semibold uppercase tracking-[0.6px]">
              <Check size={10} strokeWidth={3} />
              Real photo
            </span>
          )}
        </div>

        <div className="absolute top-[8px] right-[8px]">
          <span className="text-[9px] font-bold tracking-[1px] uppercase px-[6px] py-[2px] rounded bg-[#4600F2] text-white font-['Inter:Bold',sans-serif]">
            New
          </span>
        </div>

        {card.status === "applied" && (
          <div className="absolute bottom-[8px] left-[8px] right-[8px] flex items-center gap-[4px] bg-black/55 backdrop-blur-sm rounded-[6px] px-[6px] py-[3px]">
            <Layers size={9} className="text-[#FBBF24] shrink-0" />
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

export function CGIUpgradeModal({ open, onClose, onNext, onBack, completed, totalCgi = 134 }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const VISIBLE = 8;
  const [cards, setCards] = useState<UpgradeCard[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({
      id: i + 1,
      name: NEW_VEHICLES[i % NEW_VEHICLES.length].name,
      stk: NEW_VEHICLES[i % NEW_VEHICLES.length].stk,
      trim: NEW_VEHICLES[i % NEW_VEHICLES.length].trim,
      status: "scanning" as Status,
      matchedFrom: `STK-${2300 + i}`,
    }))
  );
  const [upgraded, setUpgraded] = useState(0);
  const nextIdRef = useRef(VISIBLE + 1);
  // Smart Match only swaps CGI for real photos on new vehicles with a spec-matched donor
  const eligible = Math.round(totalCgi * 0.72);

  // Entrance
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

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setCards(
      Array.from({ length: VISIBLE }, (_, i) => ({
        id: i + 1,
        name: NEW_VEHICLES[i % NEW_VEHICLES.length].name,
        stk: NEW_VEHICLES[i % NEW_VEHICLES.length].stk,
        trim: NEW_VEHICLES[i % NEW_VEHICLES.length].trim,
        status: "scanning" as Status,
        matchedFrom: `STK-${2300 + i}`,
      }))
    );
    setUpgraded(0);
    nextIdRef.current = VISIBLE + 1;
  }, [open]);

  // Pipeline
  useEffect(() => {
    if (!open) return;
    const kickoff = setTimeout(() => {
      setCards((prev) => prev.map((c, i) => (i < 2 ? { ...c, status: "matching" } : c)));
    }, 300);

    const tick = setInterval(() => {
      setCards((prev) => {
        const next = [...prev];
        const matchingIdx = next.findIndex((c) => c.status === "matching");
        if (matchingIdx !== -1) {
          next[matchingIdx] = { ...next[matchingIdx], status: "applied" };
          setUpgraded((n) => n + 1);
        }
        const scanningIdx = next.findIndex((c) => c.status === "scanning");
        if (scanningIdx !== -1) {
          next[scanningIdx] = { ...next[scanningIdx], status: "matching" };
        }
        return next;
      });
    }, 1600);

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
          matchedFrom: `STK-${2300 + newId - 1}`,
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

  useEffect(() => {
    const bar = progressBarRef.current;
    if (!bar) return;
    const pct = Math.min(100, (upgraded / eligible) * 100);
    gsap.to(bar, { width: `${pct}%`, duration: 0.5, ease: "power2.out" });
  }, [upgraded, eligible]);

  if (!open) return null;

  const displayedUpgraded = Math.min(upgraded, eligible);

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
                  background: "linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(70,0,242,0.10) 100%)",
                  color: "#F59E0B",
                }}
              >
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                    Upgrading CGI to real photos
                  </h2>
                  <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(245,158,11,0.14)] text-[#B45309] text-[10px] font-semibold uppercase tracking-[0.6px]">
                    <Layers size={10} />
                    Smart Match
                  </span>
                  {completed && (
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px]">
                      <Check size={10} strokeWidth={3} />
                      Completed
                    </span>
                  )}
                </div>
                <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                  Swapping renders for studio photos from spec-matched VINs.
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

          {/* One real stat + two qualitative callouts */}
          <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[12px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Upgraded to real photos
              </p>
              <p className="mt-[4px] text-[22px] font-bold text-[#F59E0B] font-['Inter:Bold',sans-serif] leading-none">
                {displayedUpgraded}<span className="text-black/30 text-[14px] font-medium"> / {eligible}</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[12px] flex items-center gap-[10px]">
              <Eye size={18} className="shrink-0 text-[#4600F2]" />
              <p className="text-[12px] text-black/70 font-['Inter:Medium',sans-serif] font-medium leading-[16px]">
                Buyers see your<br />
                <span className="text-[#0a0a0a] font-semibold">real floor, not a render</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[12px] flex items-center gap-[10px]">
              <Award size={18} className="shrink-0 text-[#10B981]" />
              <p className="text-[12px] text-black/70 font-['Inter:Medium',sans-serif] font-medium leading-[16px]">
                Authentic photography<br />
                <span className="text-[#0a0a0a] font-semibold">on every eligible VIN</span>
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
                  background: "linear-gradient(90deg, #F59E0B 0%, #10B981 100%)",
                }}
              />
            </div>
            <p className="text-[11px] text-black/50 font-medium font-['Inter:Medium',sans-serif]">
              Upgrading in progress
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[28px] py-[18px] bg-[#FAFAFB]">
          <UpgradeDiagram />

          <div className="mt-[18px]">
            <p className="text-[11px] uppercase tracking-[1px] font-semibold text-black/55 mb-[8px] font-['Inter:Semi_Bold',sans-serif]">
              CGI listings being upgraded live
            </p>
            <div className="grid grid-cols-4 gap-[14px]">
              {cards.map((c) => (
                <UpgradeTile key={c.id} card={c} />
              ))}
            </div>
          </div>

          <p className="mt-[14px] text-[11px] text-black/45 text-center font-['Inter:Regular',sans-serif] leading-[16px]">
            VINs without a spec-matched donor stay on their current media until the next Spyne Studio capture.
          </p>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#F59E0B] animate-pulse" />
            CGI → Real photo · powered by
            <span className="text-[#0a0a0a] font-semibold ml-[2px]">Smart Match</span>
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
                Finish
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
