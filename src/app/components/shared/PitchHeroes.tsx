import { ImageOff } from "lucide-react";
import imgRawExterior from "../../assets/vehicle/raw-exterior-1.jpg";
import imgStudioExterior from "../../assets/vehicle/studio-exterior-1.jpg";
import imgCgiFront from "../../assets/vehicle/cgi-front.jpg";
import imgCgiTransformed from "../../assets/vehicle/cgi-transformed-front.jpg";

// ─── SmartMatch scan animation ────────────────────────────────────────────────
// Shows a blank placeholder with a VIN number, then a purple scan line sweeps
// left→right and the matched car image reveals — same 16/9 ratio as RawScanHero.
const SMART_MATCH_CSS = `
@keyframes smReveal {
  0%, 12%   { clip-path: inset(0 100% 0 0); }
  58%, 100% { clip-path: inset(0 0% 0 0); }
}
@keyframes smScanLine {
  0%, 12%   { left: 0%; opacity: 1; }
  58%       { left: 100%; opacity: 0; }
  62%       { left: 0%; opacity: 0; }
  70%, 100% { left: 0%; opacity: 0; }
}
@keyframes smScanPulse {
  0%, 100% { box-shadow: 0 0 8px 3px rgba(127,106,242,0.55), 0 0 22px 6px rgba(127,106,242,0.22); }
  50%      { box-shadow: 0 0 14px 5px rgba(127,106,242,0.85), 0 0 34px 10px rgba(127,106,242,0.42); }
}
@keyframes smVinGlow {
  0%, 8%    { color: rgba(156,163,175,0.6); text-shadow: none; }
  28%, 48%  { color: rgba(167,139,250,1); text-shadow: 0 0 20px rgba(127,106,242,0.8), 0 0 40px rgba(127,106,242,0.4); }
  62%, 100% { color: rgba(255,255,255,0.85); text-shadow: none; }
}
@keyframes smFoundBadge {
  0%, 42%   { opacity: 0; transform: scale(0.85); }
  58%, 100% { opacity: 1; transform: scale(1); }
}
`;

export function SmartMatchScanHero() {
  return (
    <>
      <style>{SMART_MATCH_CSS}</style>
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#111318]"
        style={{ aspectRatio: "16/9" }}
      >
        {/* Base layer: "No Photo" placeholder with VIN number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[14px]">
          <ImageOff size={36} className="text-white/20" strokeWidth={1.5} />
          <div
            className="font-mono text-[13px] font-bold tracking-[3px] uppercase px-[12px] py-[6px] rounded-[6px] border border-white/10 bg-white/5"
            style={{
              animation: "smVinGlow 4.5s cubic-bezier(0.45,0,0.55,1) 0.5s infinite",
              color: "rgba(156,163,175,0.6)",
            }}
          >
            VIN5N1AT3CBXSC
          </div>
        </div>

        {/* Reveal layer: matched car image */}
        <div
          className="absolute inset-0"
          style={{ animation: "smReveal 4.5s cubic-bezier(0.45,0,0.55,1) 0.5s infinite" }}
        >
          <img src={imgStudioExterior} alt="Matched media" className="w-full h-full object-cover" />
        </div>

        {/* Glowing purple scan line */}
        <div
          className="absolute inset-y-0 w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #7F6AF2 18%, #B651D7 50%, #7F6AF2 82%, transparent 100%)",
            animation:
              "smScanLine 4.5s cubic-bezier(0.45,0,0.55,1) 0.5s infinite, smScanPulse 1.1s ease-in-out infinite",
          }}
        />

        {/* Top-left: scanning status */}
        <div className="absolute top-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#A78BFA] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Scanning VIN
          </span>
        </div>

        {/* Top-right: VIN Found badge (appears after scan) */}
        <div
          className="absolute top-[10px] right-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px]"
          style={{
            background: "rgba(127,106,242,0.82)",
            backdropFilter: "blur(4px)",
            animation: "smFoundBadge 4.5s cubic-bezier(0.45,0,0.55,1) 0.5s infinite",
          }}
        >
          <span className="size-[5px] rounded-full bg-white" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            VIN Found
          </span>
        </div>

        {/* Bottom-left: No photo yet */}
        <div className="absolute bottom-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#9CA3AF]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#D1D5DB] font-['Inter:Bold',sans-serif]">
            No photo yet
          </span>
        </div>

        {/* Bottom-right: Matched media badge (appears after scan) */}
        <div
          className="absolute bottom-[10px] right-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px]"
          style={{
            background: "rgba(127,106,242,0.82)",
            backdropFilter: "blur(4px)",
            animation: "smFoundBadge 4.5s cubic-bezier(0.45,0,0.55,1) 0.5s infinite",
          }}
        >
          <span className="size-[5px] rounded-full bg-white" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Matched media
          </span>
        </div>
      </div>
    </>
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

// ─── Syndication hero ────────────────────────────────────────────────────────
const SYNDICATION_CSS = `
@keyframes synCard {
  0%   { opacity: 0; transform: translateY(6px) scale(0.93); }
  8%   { opacity: 1; transform: translateY(0) scale(1); }
  82%  { opacity: 1; transform: translateY(0) scale(1); }
  94%  { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes synLive {
  0%, 8%  { opacity: 0; transform: scale(0.7); }
  16%     { opacity: 1; transform: scale(1); }
  82%     { opacity: 1; }
  94%     { opacity: 0; }
  100%    { opacity: 0; }
}
@keyframes synAllLive {
  0%, 64%  { opacity: 0; transform: translateX(6px); }
  72%, 80% { opacity: 1; transform: translateX(0); }
  92%      { opacity: 0; }
  100%     { opacity: 0; }
}
`;

export function SyndicationHero() {
  const DUR = "7s";
  const platforms = [
    { name: "AutoTrader", short: "AT",   color: "#FF6600", delay: "0s",    liveDel: "0.55s" },
    { name: "Cars.com",   short: "Cars", color: "#005B99", delay: "0.6s",  liveDel: "1.15s" },
    { name: "KBB",        short: "KBB",  color: "#003087", delay: "1.2s",  liveDel: "1.75s" },
    { name: "Facebook",   short: "FB",   color: "#1877F2", delay: "1.8s",  liveDel: "2.35s" },
    { name: "Instagram",  short: "IG",   color: "#C13584", delay: "2.4s",  liveDel: "2.95s" },
    { name: "Dealer Site",short: "Site", color: "#4600F2", delay: "3.0s",  liveDel: "3.55s" },
  ];
  return (
    <>
      <style>{SYNDICATION_CSS}</style>
      <div className="w-full rounded-[14px] border border-black/8 bg-[#111318] overflow-hidden p-[10px]">
        <div className="grid grid-cols-3 gap-[5px]">
          {platforms.map((p, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[7px]"
              style={{ aspectRatio: "4/3", opacity: 0, animation: `synCard ${DUR} ease-out ${p.delay} infinite` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] z-[1]" style={{ background: p.color }} />
              <img src={i % 2 === 0 ? imgCgiTransformed : imgStudioExterior} alt={p.name} className="w-full h-full object-cover" />
              <div
                className="absolute bottom-[4px] left-[4px] px-[5px] py-[2px] rounded-[3px] text-[7.5px] font-bold text-white uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif]"
                style={{ background: `${p.color}DD` }}
              >
                {p.short}
              </div>
              <div
                className="absolute bottom-[4px] right-[4px] flex items-center gap-[2px] px-[5px] py-[2px] rounded-[3px] text-[7.5px] font-bold text-white font-['Inter:Bold',sans-serif]"
                style={{ background: "rgba(16,185,129,0.9)", opacity: 0, animation: `synLive ${DUR} ease-out ${p.liveDel} infinite` }}
              >
                ✓ Live
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[8px] flex items-center justify-between px-[1px]">
          <div className="flex items-center gap-[5px]">
            <span className="size-[5px] rounded-full bg-[#4600F2] animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.9px] text-white/65 font-['Inter:Bold',sans-serif]">
              Syndicating to 6 platforms
            </span>
          </div>
          <div className="flex items-center gap-[4px]" style={{ opacity: 0, animation: `synAllLive ${DUR} ease-out 3.55s infinite` }}>
            <span className="size-[5px] rounded-full bg-[#10B981]" />
            <span className="text-[9px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif]">All live</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Smart Campaigns overlay carousel ───────────────────────────────────────
const SMART_CAMPAIGNS_CSS = `
@keyframes scO1 {
  0%    { opacity: 0; transform: translateX(14px); }
  6%    { opacity: 1; transform: translateX(0); }
  27%   { opacity: 1; transform: translateX(0); }
  33%   { opacity: 0; transform: translateX(-14px); }
  33.1% { opacity: 0; transform: translateX(14px); }
  100%  { opacity: 0; transform: translateX(14px); }
}
@keyframes scO2 {
  0%    { opacity: 0; transform: translateX(14px); }
  33%   { opacity: 0; transform: translateX(14px); }
  39%   { opacity: 1; transform: translateX(0); }
  60%   { opacity: 1; transform: translateX(0); }
  66%   { opacity: 0; transform: translateX(-14px); }
  66.1% { opacity: 0; transform: translateX(14px); }
  100%  { opacity: 0; transform: translateX(14px); }
}
@keyframes scO3 {
  0%    { opacity: 0; transform: translateX(14px); }
  66%   { opacity: 0; transform: translateX(14px); }
  72%   { opacity: 1; transform: translateX(0); }
  93%   { opacity: 1; transform: translateX(0); }
  99%   { opacity: 0; transform: translateX(-14px); }
  100%  { opacity: 0; transform: translateX(14px); }
}
@keyframes scDot1 {
  0%, 33%, 100% { opacity: 0.3; transform: scale(1); }
  6%, 27%       { opacity: 1;   transform: scale(1.4); }
}
@keyframes scDot2 {
  0%, 100%  { opacity: 0.3; transform: scale(1); }
  39%, 60%  { opacity: 1;   transform: scale(1.4); }
}
@keyframes scDot3 {
  0%, 100%  { opacity: 0.3; transform: scale(1); }
  72%, 93%  { opacity: 1;   transform: scale(1.4); }
}
`;

export function SmartCampaignsHero() {
  const DUR = "9s";
  return (
    <>
      <style>{SMART_CAMPAIGNS_CSS}</style>
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#111318]"
        style={{ aspectRatio: "16/9" }}
      >
        <img src={imgCgiTransformed} alt="Car listing" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

        <div className="absolute inset-0" style={{ animation: `scO1 ${DUR} ease-in-out infinite` }}>
          <div
            className="absolute top-[10px] right-[10px] px-[9px] py-[4px] rounded-[7px] text-[9px] font-bold text-white uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]"
            style={{ background: "linear-gradient(135deg,#DC2626,#EF4444)", boxShadow: "0 3px 10px rgba(220,38,38,0.5)" }}
          >
            Special Offer
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-[12px] py-[10px] flex items-center justify-between">
            <span className="text-white text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif]">Finance from $299/mo</span>
            <span className="text-[10px] text-white/65 font-['Inter:Regular',sans-serif]">0% APR available</span>
          </div>
          <div
            className="absolute bottom-[10px] left-[10px] px-[7px] py-[2px] rounded-[4px] text-[8px] font-bold text-white/80 uppercase tracking-[0.8px] font-['Inter:Bold',sans-serif]"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            Promo Overlay
          </div>
        </div>

        <div className="absolute inset-0" style={{ animation: `scO2 ${DUR} ease-in-out infinite` }}>
          <div
            className="absolute top-[10px] right-[10px] flex items-center gap-[5px] px-[9px] py-[4px] rounded-[7px] text-[9px] font-bold text-white uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]"
            style={{ background: "rgba(245,158,11,0.92)", boxShadow: "0 3px 10px rgba(245,158,11,0.45)" }}
          >
            <span>38 Days on Lot</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-[12px] py-[10px] flex items-center justify-between">
            <span className="text-white text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif]">Price reduced $1,200</span>
            <span
              className="px-[7px] py-[3px] rounded-[5px] text-[9px] font-bold text-white font-['Inter:Bold',sans-serif]"
              style={{ background: "rgba(220,38,38,0.88)" }}
            >
              Act Now
            </span>
          </div>
          <div
            className="absolute bottom-[10px] left-[10px] px-[7px] py-[2px] rounded-[4px] text-[8px] font-bold text-white/80 uppercase tracking-[0.8px] font-['Inter:Bold',sans-serif]"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            Aged Inventory
          </div>
        </div>

        <div className="absolute inset-0" style={{ animation: `scO3 ${DUR} ease-in-out infinite` }}>
          <div
            className="absolute top-[10px] right-[10px] px-[9px] py-[4px] rounded-[7px] text-[9px] font-bold text-white uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]"
            style={{ background: "rgba(16,185,129,0.92)", boxShadow: "0 3px 10px rgba(16,185,129,0.45)" }}
          >
            Certified Pre-Owned
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-[12px] py-[10px] flex items-center gap-[6px]">
            {["Free Delivery", "2-Year Warranty", "Remote Buying"].map((t, i) => (
              <span key={i} className="flex items-center gap-[6px]">
                {i > 0 && <span className="size-[3px] rounded-full bg-white/40" />}
                <span className="text-white text-[11px] font-semibold font-['Inter:Semi_Bold',sans-serif]">{t}</span>
              </span>
            ))}
          </div>
          <div
            className="absolute bottom-[10px] left-[10px] px-[7px] py-[2px] rounded-[4px] text-[8px] font-bold text-white/80 uppercase tracking-[0.8px] font-['Inter:Bold',sans-serif]"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            Billboard
          </div>
        </div>

        <div className="absolute top-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#DC2626] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Active Campaign
          </span>
        </div>

        <div className="absolute top-[10px] right-[10px] flex gap-[4px]" style={{ marginTop: 32 }}>
          {(["scDot1", "scDot2", "scDot3"] as const).map((anim, i) => (
            <span key={i} className="size-[5px] rounded-full bg-white" style={{ animation: `${anim} ${DUR} ease-in-out infinite` }} />
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Raw scan animation ───────────────────────────────────────────────────────
const RAW_SCAN_CSS = `
@keyframes studioReveal {
  0%,8%    { clip-path: inset(0 100% 0 0); }
  52%,62%  { clip-path: inset(0 0% 0 0); }
  92%,100% { clip-path: inset(0 100% 0 0); }
}
@keyframes scanLineMove {
  0%,8%    { left: 0%; opacity: 1; }
  52%,62%  { left: 100%; opacity: 0; }
  63%      { left: 0%; opacity: 0; }
  70%,100% { left: 0%; opacity: 1; }
}
@keyframes scanPulse {
  0%,100% { box-shadow: 0 0 8px 3px rgba(233,30,99,0.55), 0 0 22px 6px rgba(233,30,99,0.22); }
  50%     { box-shadow: 0 0 14px 5px rgba(233,30,99,0.85), 0 0 34px 10px rgba(233,30,99,0.42); }
}
`;

export function RawScanHero() {
  return (
    <>
      <style>{RAW_SCAN_CSS}</style>
      <div
        className="relative w-full overflow-hidden rounded-[14px] border border-black/8 bg-[#0d0d0d]"
        style={{ aspectRatio: "16/9" }}
      >
        <img src={imgRawExterior} alt="Raw lot photo" className="absolute inset-0 w-full h-full object-cover" />

        <div className="absolute inset-0" style={{ animation: "studioReveal 4s cubic-bezier(0.45,0,0.55,1) 1.2s infinite" }}>
          <img src={imgStudioExterior} alt="Studio output" className="w-full h-full object-cover" />
        </div>

        <div
          className="absolute inset-y-0 w-[2px]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, #E91E63 18%, #FF5C9A 50%, #E91E63 82%, transparent 100%)",
            animation:
              "scanLineMove 4s cubic-bezier(0.45,0,0.55,1) 1.2s infinite, scanPulse 1.1s ease-in-out infinite",
          }}
        />

        <div className="absolute bottom-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#9CA3AF]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-[#D1D5DB] font-['Inter:Bold',sans-serif]">
            Raw lot photo
          </span>
        </div>
        <div
          className="absolute bottom-[10px] right-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px]"
          style={{ background: "rgba(233,30,99,0.82)", backdropFilter: "blur(4px)" }}
        >
          <span className="size-[5px] rounded-full bg-white" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Studio AI output
          </span>
        </div>

        <div
          className="absolute top-[10px] right-[10px] px-[10px] py-[5px] rounded-[8px] text-[11px] font-bold text-white font-['Inter:Bold',sans-serif]"
          style={{ background: "linear-gradient(90deg, #FF5C9A 0%, #B651D7 100%)", boxShadow: "0 4px 14px rgba(182,81,215,0.45)" }}
        >
          Studio AI
        </div>

        <div className="absolute top-[10px] left-[10px] flex items-center gap-[5px] px-[8px] py-[4px] rounded-[6px] bg-black/60 backdrop-blur-sm">
          <span className="size-[5px] rounded-full bg-[#E91E63] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-[0.8px] text-white font-['Inter:Bold',sans-serif]">
            Scanning
          </span>
        </div>
      </div>
    </>
  );
}
