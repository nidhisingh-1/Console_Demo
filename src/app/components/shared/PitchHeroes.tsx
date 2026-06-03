import { Snowflake, BadgeCheck, Zap, Megaphone, CheckCircle2, Star } from "lucide-react";
import imgRawExterior from "../../assets/vehicle/raw-exterior-1.jpg";
import imgStudioExterior from "../../assets/vehicle/studio-exterior-1.jpg";
import imgCgiFront from "../../assets/vehicle/cgi-front.jpg";
import imgCgiTransformed from "../../assets/vehicle/cgi-transformed-front.jpg";
import vinScanVideo from "../../assets/vehicle/vin-scan.mp4";
import studioShootVideo from "../../assets/vehicle/studio-shoot.mp4";

// ─── SmartMatch · VIN scan video ─────────────────────────────────────────────
// Uses the supplied VIN scan MP4 as the hero animation.
export function SmartMatchScanHero() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#0d0d0d]"
      style={{ aspectRatio: "16/9" }}
    >
      <video
        src={vinScanVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

// ─── Stock photo grid animation ──────────────────────────────────────────────
const STOCK_GRID_CSS = `
@keyframes sgReveal {
  0%, 12%   { clip-path: inset(0 100% 0 0); }
  58%, 100% { clip-path: inset(0 0% 0 0); }
}
@keyframes sgScanLine {
  0%, 12%   { left: 0%; opacity: 1; }
  58%       { left: 100%; opacity: 0; }
  60%       { left: 0%; opacity: 0; }
  68%, 100% { left: 0%; opacity: 0; }
}
@keyframes sgScanPulse {
  0%, 100% { box-shadow: 0 0 6px 2px rgba(124,58,237,0.6), 0 0 16px 5px rgba(124,58,237,0.2); }
  50%      { box-shadow: 0 0 10px 4px rgba(124,58,237,0.9), 0 0 26px 8px rgba(124,58,237,0.4); }
}
@keyframes sgBadgeFade {
  0%, 52%   { opacity: 0; transform: scale(0.8); }
  68%, 100% { opacity: 1; transform: scale(1); }
}
@keyframes sgLabelFade {
  0%, 48%   { opacity: 1; }
  62%, 100% { opacity: 0; }
}
`;

export function StockPhotoGridHero() {
  const DURATION = "5s";
  const cards = [
    { delay: "0s",    before: imgCgiFront,    after: imgCgiTransformed,  filter: "hue-rotate(25deg) brightness(1.15)",   issue: "Watermark"    },
    { delay: "0.55s", before: imgRawExterior, after: imgStudioExterior,  filter: "grayscale(0.35) contrast(1.1)",        issue: "Off-brand"    },
    { delay: "1.1s",  before: imgCgiFront,    after: imgCgiTransformed,  filter: "sepia(0.3) brightness(1.05)",          issue: "Poor crop"    },
    { delay: "1.65s", before: imgRawExterior, after: imgStudioExterior,  filter: "hue-rotate(-18deg) saturate(1.35)",    issue: "Different BG" },
    { delay: "2.2s",  before: imgCgiFront,    after: imgCgiTransformed,  filter: "brightness(1.22) contrast(1.12)",      issue: "Inconsistent" },
    { delay: "2.75s", before: imgRawExterior, after: imgStudioExterior,  filter: "brightness(0.82) saturate(0.75)",      issue: "Off-angle"    },
  ];
  return (
    <>
      <style>{STOCK_GRID_CSS}</style>
      <div className="w-full rounded-[14px] border border-black/8 bg-[#111318] overflow-hidden p-[10px]">
        <div className="grid grid-cols-3 gap-[5px]">
          {cards.map((card, i) => (
            <div key={i} className="relative overflow-hidden rounded-[7px]" style={{ aspectRatio: "4/3" }}>
              <img src={card.before} alt="Inconsistent stock photo" className="absolute inset-0 w-full h-full object-cover" style={{ filter: card.filter }} />
              <div
                className="absolute top-[4px] left-[4px] px-[4px] py-[1.5px] rounded-[3px] text-[7.5px] font-bold text-white uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif]"
                style={{ background: "rgba(239,68,68,0.85)", animation: `sgLabelFade ${DURATION} ease-in-out ${card.delay} infinite` }}
              >
                {card.issue}
              </div>
              <div className="absolute inset-0" style={{ animation: `sgReveal ${DURATION} ease-in-out ${card.delay} infinite` }}>
                <img src={card.after} alt="Studio AI processed" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute inset-y-0 w-[1.5px]"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, #7C3AED 20%, #A855F7 50%, #7C3AED 80%, transparent 100%)",
                  animation: `sgScanLine ${DURATION} ease-in-out ${card.delay} infinite, sgScanPulse 1s ease-in-out infinite`,
                }}
              />
              <div
                className="absolute bottom-[4px] right-[4px] flex items-center gap-[3px] px-[5px] py-[2px] rounded-[3px] text-[7.5px] font-bold text-white font-['Inter:Bold',sans-serif]"
                style={{ background: "rgba(124,58,237,0.88)", backdropFilter: "blur(4px)", animation: `sgBadgeFade ${DURATION} ease-in-out ${card.delay} infinite` }}
              >
                ✓ Studio AI
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[8px] flex items-center justify-between px-[1px]">
          <div className="flex items-center gap-[5px]">
            <span className="size-[5px] rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.9px] text-white/65 font-['Inter:Bold',sans-serif]">
              Standardising stock photos
            </span>
          </div>
          <span className="text-[9px] font-bold text-[#7C3AED] font-['Inter:Bold',sans-serif]">
            134 vehicles
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Syndication · Publishing broadcast animation ────────────────────────────
// A car listing in the centre broadcasts outward — ripple waves emanate, each
// platform tile fades in around the perimeter and gets a "PUBLISHED" stamp in
// sequence. Final "All Live" badge once every platform is lit.
const SYNDICATION_CSS = `
@keyframes synRipple1 {
  0%   { opacity: 0.6; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(2.2); }
}
@keyframes synRipple2 {
  0%   { opacity: 0.5; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(2.6); }
}
@keyframes synHubPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(70,0,242,0.55), 0 6px 18px rgba(70,0,242,0.45); }
  50%      { box-shadow: 0 0 0 8px rgba(70,0,242,0.10), 0 6px 18px rgba(70,0,242,0.55); }
}
@keyframes synTileIn {
  0%        { opacity: 0; transform: scale(0.7); }
  60%, 100% { opacity: 1; transform: scale(1); }
}
@keyframes synStamp {
  0%, 30%   { opacity: 0; transform: scale(0.5) rotate(-15deg); }
  44%       { opacity: 1; transform: scale(1.15) rotate(-4deg); }
  56%, 100% { opacity: 1; transform: scale(1) rotate(-4deg); }
}
@keyframes synAllLive {
  0%, 84%   { opacity: 0; transform: translateY(4px); }
  92%, 100% { opacity: 1; transform: translateY(0); }
}
@keyframes synArrow {
  0%, 18%   { opacity: 0; transform: scale(0.6); }
  28%, 70%  { opacity: 1; transform: scale(1); }
  82%, 100% { opacity: 0; }
}
`;

export function SyndicationHero() {
  const DUR = "5.6s";
  // Platforms placed in a ring around the central hub
  const platforms = [
    { short: "AT",   name: "AutoTrader", color: "#FF6600", x: "8%",  y: "20%", tileDelay: "0.4s",  stampDelay: "0.8s" },
    { short: "Cars", name: "Cars.com",   color: "#005B99", x: "78%", y: "20%", tileDelay: "0.8s",  stampDelay: "1.2s" },
    { short: "KBB",  name: "KBB",        color: "#003087", x: "8%",  y: "72%", tileDelay: "1.2s",  stampDelay: "1.6s" },
    { short: "FB",   name: "Facebook",   color: "#1877F2", x: "78%", y: "72%", tileDelay: "1.6s",  stampDelay: "2.0s" },
    { short: "IG",   name: "Instagram",  color: "#C13584", x: "78%", y: "46%", tileDelay: "2.0s",  stampDelay: "2.4s" },
    { short: "Site", name: "Dealer Site",color: "#4600F2", x: "8%",  y: "46%", tileDelay: "2.4s",  stampDelay: "2.8s" },
  ];
  return (
    <>
      <style>{SYNDICATION_CSS}</style>
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#0d0d12]"
        style={{
          aspectRatio: "16/9",
          backgroundImage:
            "radial-gradient(ellipse at center, #1a1d2e 0%, #0d0d12 70%)",
        }}
      >
        {/* Broadcast ripples emanating from centre */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full border border-[#4600F2]/45"
            style={{
              width: "120px",
              height: "120px",
              animation: `${i === 0 ? "synRipple1" : "synRipple2"} ${i === 0 ? "3.5s" : "4.2s"} cubic-bezier(0.25,0.46,0.45,0.94) ${i * 0.6}s infinite`,
            }}
          />
        ))}

        {/* Central listing hub */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[12px] overflow-hidden border-2 border-white/15"
          style={{
            width: "30%",
            aspectRatio: "16/9",
            animation: "synHubPulse 1.8s ease-in-out infinite",
          }}
        >
          <img src={imgCgiTransformed} alt="Listing" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 px-[6px] py-[3px] bg-black/65 backdrop-blur-sm">
            <p className="text-[7px] font-bold uppercase tracking-[0.6px] text-[#A78BFA] leading-none font-['Inter:Bold',sans-serif]">
              VIN5N1AT3CBXSC
            </p>
          </div>
        </div>

        {/* Platform tiles around the perimeter */}
        {platforms.map((p, i) => (
          <div
            key={p.short}
            className="absolute"
            style={{
              left: p.x,
              top: p.y,
              width: "14%",
              aspectRatio: "1/1",
              animation: `synTileIn ${DUR} ease-out ${p.tileDelay} infinite`,
              opacity: 0,
            }}
          >
            <div
              className="relative w-full h-full rounded-[8px] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.40)]"
              style={{
                background: `linear-gradient(135deg, ${p.color}EE 0%, ${p.color} 100%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-black uppercase tracking-[0.5px] text-white font-['Inter:Bold',sans-serif]">
                  {p.short}
                </span>
              </div>
              {/* Published stamp */}
              <div
                className="absolute -bottom-[5px] -right-[5px] inline-flex items-center gap-[3px] px-[5px] py-[2px] rounded-[4px] bg-[#10B981] text-white text-[7px] font-black uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif] shadow-[0_2px_6px_rgba(16,185,129,0.55)]"
                style={{
                  animation: `synStamp ${DUR} ease-out ${p.stampDelay} infinite`,
                  opacity: 0,
                }}
              >
                ✓ Live
              </div>
            </div>
            {/* Connecting arrow toward centre (small dot trail) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 flex items-center gap-[3px]"
              style={{
                left: i % 2 === 0 ? "100%" : undefined,
                right: i % 2 === 1 ? "100%" : undefined,
                paddingLeft: i % 2 === 0 ? "6px" : 0,
                paddingRight: i % 2 === 1 ? "6px" : 0,
                animation: `synArrow ${DUR} ease-out ${p.tileDelay} infinite`,
                opacity: 0,
              }}
            >
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="size-[3px] rounded-full"
                  style={{ background: "#A78BFA", opacity: 0.4 + d * 0.2 }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Top-left: broadcasting status */}
        <div className="absolute top-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#4600F2] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Broadcasting
          </span>
        </div>

        {/* Top-right: All Live confirmation */}
        <div
          className="absolute top-[10px] right-[10px] inline-flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px]"
          style={{
            background: "rgba(16,185,129,0.92)",
            backdropFilter: "blur(4px)",
            animation: `synAllLive ${DUR} ease-out 0s infinite`,
            opacity: 0,
            boxShadow: "0 4px 12px rgba(16,185,129,0.40)",
          }}
        >
          <CheckCircle2 size={11} strokeWidth={2.8} className="text-white" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            All 6 Live
          </span>
        </div>
      </div>
    </>
  );
}

// ─── Smart Campaigns · Banner / billboard application ───────────────────────
// Cycles through 4 campaign treatments on a single hero canvas:
//   1. Aging — red price-drop top + bottom banners (car visible)
//   2. Promotional — full dealer billboard (no car)
//   3. Festive — holiday banners with snowfall (car visible)
//   4. Certified — blue side ribbon + inspection badge (car visible)
const SMART_CAMPAIGNS_CSS = `
@keyframes scPhase1 { 0%, 22% { opacity: 1; } 25%, 100% { opacity: 0; } }
@keyframes scPhase2 { 0%, 22% { opacity: 0; } 25%, 47% { opacity: 1; } 50%, 100% { opacity: 0; } }
@keyframes scPhase3 { 0%, 47% { opacity: 0; } 50%, 72% { opacity: 1; } 75%, 100% { opacity: 0; } }
@keyframes scPhase4 { 0%, 72% { opacity: 0; } 75%, 97% { opacity: 1; } 100% { opacity: 0; } }
@keyframes scDot1 { 0%, 22% { background: #FFFFFF; transform: scale(1.4); } 25%, 100% { background: rgba(255,255,255,0.35); transform: scale(1); } }
@keyframes scDot2 { 0%, 22% { background: rgba(255,255,255,0.35); transform: scale(1); } 25%, 47% { background: #FFFFFF; transform: scale(1.4); } 50%, 100% { background: rgba(255,255,255,0.35); transform: scale(1); } }
@keyframes scDot3 { 0%, 47% { background: rgba(255,255,255,0.35); transform: scale(1); } 50%, 72% { background: #FFFFFF; transform: scale(1.4); } 75%, 100% { background: rgba(255,255,255,0.35); transform: scale(1); } }
@keyframes scDot4 { 0%, 72% { background: rgba(255,255,255,0.35); transform: scale(1); } 75%, 97% { background: #FFFFFF; transform: scale(1.4); } 100% { background: rgba(255,255,255,0.35); transform: scale(1); } }
@keyframes scSnow {
  0%   { transform: translateY(-10px) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(220px) rotate(360deg); opacity: 0; }
}
@keyframes scTitleSlide {
  0%   { opacity: 0; transform: translateX(-12px); }
  10%, 90% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(12px); }
}
`;

const PHASES = [
  { label: "Aging · Price Drop",       accent: "#DC2626" },
  { label: "Promotional · Billboard",  accent: "#1D4ED8" },
  { label: "Festive · Holiday",        accent: "#10B981" },
  { label: "Certified · CPO",          accent: "#1E3A8A" },
];

export function SmartCampaignsHero() {
  const DUR = "12s";
  return (
    <>
      <style>{SMART_CAMPAIGNS_CSS}</style>
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#0d0d12]"
        style={{ aspectRatio: "16/9" }}
      >

        {/* ─── Phase 1 · Aging — car visible with red banners ─── */}
        <div
          className="absolute inset-0"
          style={{ animation: `scPhase1 ${DUR} ease-in-out infinite`, opacity: 0 }}
        >
          <img src={imgCgiTransformed} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute top-0 inset-x-0 flex items-center justify-between px-[14px] py-[6px] text-white"
            style={{ background: "linear-gradient(90deg, #7F1D1D 0%, #DC2626 50%, #7F1D1D 100%)" }}
          >
            <span className="inline-flex items-center gap-[5px] text-[10px] font-black uppercase tracking-[1.6px] font-['Inter:Bold',sans-serif]">
              <Zap size={10} strokeWidth={3} fill="currentColor" />
              Price Drop
            </span>
            <span className="text-[10px] font-black uppercase tracking-[1.6px] font-['Inter:Bold',sans-serif]">
              45+ Days
            </span>
          </div>
          <div
            className="absolute bottom-0 inset-x-0 flex items-center justify-between px-[14px] py-[7px] text-white"
            style={{ background: "linear-gradient(90deg, #7F1D1D 0%, #B91C1C 100%)" }}
          >
            <span className="text-[15px] font-black tracking-tight font-['Inter:Bold',sans-serif]">$2,500 OFF</span>
            <span className="text-[9px] font-bold uppercase tracking-[1.2px] opacity-90 font-['Inter:Bold',sans-serif]">
              Must Go · Limited Time
            </span>
          </div>
        </div>

        {/* ─── Phase 2 · Promotional billboard (no car) ─── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0F1F4F 0%, #1D4ED8 45%, #2563EB 100%)",
            animation: `scPhase2 ${DUR} ease-in-out infinite`,
            opacity: 0,
          }}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(251,191,36,0.55) 0px, rgba(251,191,36,0.55) 2px, transparent 2px, transparent 60px)",
            }}
          />
          <div className="absolute top-0 inset-x-0 h-[8px]" style={{ background: "linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)" }} />
          <div className="absolute bottom-0 inset-x-0 h-[8px]" style={{ background: "linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)" }} />

          <Star
            size={32}
            fill="#FBBF24"
            strokeWidth={0}
            className="absolute top-[14%] left-[6%] opacity-80"
            style={{ transform: "rotate(-12deg)" }}
          />
          <Star
            size={24}
            fill="#FBBF24"
            strokeWidth={0}
            className="absolute bottom-[18%] right-[8%] opacity-70"
            style={{ transform: "rotate(8deg)" }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-[16px]">
            <p className="inline-flex items-center gap-[5px] text-[8px] font-bold uppercase tracking-[2.5px] text-[#FBBF24] mb-[6px] font-['Inter:Bold',sans-serif]">
              <Star size={7} fill="currentColor" strokeWidth={0} />
              AutoMart Premium
              <Star size={7} fill="currentColor" strokeWidth={0} />
            </p>
            <p
              className="text-[28px] font-black leading-[28px] mb-[4px] font-['Inter:Bold',sans-serif]"
              style={{ textShadow: "0 3px 10px rgba(0,0,0,0.45)" }}
            >
              DEALS OF THE MONTH
            </p>
            <p className="text-[11px] font-black tracking-[1px] mt-[2px] font-['Inter:Bold',sans-serif] text-white/95">
              0% APR · 60 MO · NO MONEY DOWN
            </p>
            <div className="mt-[10px] inline-flex items-center gap-[6px] px-[12px] py-[5px] rounded-[6px] bg-white text-[#1D4ED8] shadow-[0_4px_12px_rgba(0,0,0,0.30)]">
              <Megaphone size={11} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[1.2px] font-['Inter:Bold',sans-serif]">
                VisitAutoMart.com
              </span>
            </div>
          </div>
        </div>

        {/* ─── Phase 3 · Festive · holiday banners with snow ─── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ animation: `scPhase3 ${DUR} ease-in-out infinite`, opacity: 0 }}
        >
          <img src={imgStudioExterior} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Top red holiday banner */}
          <div
            className="absolute top-0 inset-x-0 flex items-center justify-center gap-[10px] py-[7px] text-white"
            style={{ background: "linear-gradient(90deg, #7F1D1D 0%, #DC2626 50%, #7F1D1D 100%)" }}
          >
            <Snowflake size={11} strokeWidth={2.5} />
            <span className="text-[12px] font-black uppercase tracking-[2.4px] font-['Inter:Bold',sans-serif]">
              Happy Holidays
            </span>
            <Snowflake size={11} strokeWidth={2.5} />
          </div>
          {/* Snowflakes */}
          {[8, 22, 35, 48, 60, 72, 85].map((left, i) => (
            <span
              key={i}
              className="absolute text-white pointer-events-none"
              style={{
                left: `${left}%`,
                top: 0,
                animation: `scSnow 3.4s ease-in ${i * 0.4}s infinite`,
                opacity: 0,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.30))",
              }}
            >
              <Snowflake size={i % 2 ? 8 : 12} strokeWidth={1.8} />
            </span>
          ))}
          {/* Bottom green deals banner */}
          <div
            className="absolute bottom-0 inset-x-0 flex items-center justify-between px-[14px] py-[7px] text-white"
            style={{ background: "linear-gradient(90deg, #064E3B 0%, #10B981 50%, #064E3B 100%)" }}
          >
            <span className="text-[11px] font-black uppercase tracking-[1.2px] font-['Inter:Bold',sans-serif]">
              December Deals
            </span>
            <span className="text-[11px] font-black uppercase tracking-[1.2px] font-['Inter:Bold',sans-serif]">
              Up to $5,000 Off
            </span>
          </div>
        </div>

        {/* ─── Phase 4 · Certified · side ribbon ─── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ animation: `scPhase4 ${DUR} ease-in-out infinite`, opacity: 0 }}
        >
          <img src={imgStudioExterior} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-[18px] left-0 flex items-center">
            <div
              className="flex items-center gap-[8px] pl-[12px] pr-[14px] py-[7px] text-white shadow-[0_5px_14px_rgba(29,78,216,0.45)]"
              style={{
                background: "linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)",
                borderTopRightRadius: "8px",
                borderBottomRightRadius: "8px",
              }}
            >
              <BadgeCheck size={18} strokeWidth={2.5} className="shrink-0" />
              <div className="leading-tight">
                <p className="text-[8px] font-bold uppercase tracking-[1.2px] opacity-80 font-['Inter:Bold',sans-serif]">
                  Certified Pre-Owned
                </p>
                <p className="text-[12px] font-black tracking-[0.3px] font-['Inter:Bold',sans-serif]">
                  by AutoMart
                </p>
              </div>
            </div>
            <span
              className="block w-[8px] h-[36px]"
              style={{
                background: "#1D4ED8",
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
              }}
            />
          </div>
          <div className="absolute bottom-[14px] right-[14px] inline-flex items-center gap-[5px] bg-white/95 backdrop-blur-sm rounded-full px-[10px] py-[4px] shadow-[0_3px_8px_rgba(0,0,0,0.20)]">
            <span className="size-[6px] rounded-full bg-[#10B981]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.6px] text-[#1E3A8A] font-['Inter:Bold',sans-serif]">
              172-Pt Inspection
            </span>
          </div>
        </div>

        {/* ─── Phase indicator (top-left) ─── */}
        <div className="absolute top-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#FBBF24] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Applying campaign
          </span>
        </div>

        {/* ─── Active phase label ─── */}
        {PHASES.map((p, i) => (
          <div
            key={i}
            className="absolute top-[10px] right-[10px] px-[9px] py-[4px] rounded-[6px] text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]"
            style={{
              background: p.accent,
              boxShadow: `0 3px 10px ${p.accent}66`,
              animation: `scTitleSlide ${DUR} ease-in-out ${(i * 25) / 100 * 12}s infinite`,
              opacity: 0,
              animationDelay: `${i * 3}s`,
              animationDuration: "3s",
            }}
          >
            {p.label}
          </div>
        ))}

        {/* ─── Dots (bottom-center) ─── */}
        <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
          {["scDot1", "scDot2", "scDot3", "scDot4"].map((anim, i) => (
            <span
              key={i}
              className="size-[5px] rounded-full"
              style={{
                background: "rgba(255,255,255,0.35)",
                animation: `${anim} ${DUR} ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Smart Shoot · Studio video ──────────────────────────────────────────────
// Uses the supplied Studio MP4 as the hero animation.
export function RawScanHero() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#0d0d0d]"
      style={{ aspectRatio: "16/9" }}
    >
      <video
        src={studioShootVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
