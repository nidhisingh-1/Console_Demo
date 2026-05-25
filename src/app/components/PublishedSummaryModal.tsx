import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Check, Megaphone, Clock, Users, TrendingDown, ArrowRight } from "lucide-react";
import { PLATFORMS, type Platform } from "./publishPlatforms";

interface Props {
  open: boolean;
  onClose: () => void;
  platformIds: string[];
  totalListings: number;
  /** Final days-to-frontline post-publish */
  daysAfter?: number;
  /** Pre-transform baseline for context */
  daysBaseline?: number;
}

function LogoTile({ platform, size = 28 }: { platform: Platform; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-[6px] flex items-center justify-center font-bold font-['Inter:Bold',sans-serif]"
      style={{
        width: size,
        height: size,
        background: platform.gradient || platform.bg,
        color: platform.fg,
        fontStyle: platform.italic ? "italic" : "normal",
        fontSize: Math.round(size * 0.45),
        lineHeight: 1,
      }}
    >
      {platform.glyph}
    </div>
  );
}

function useCountUp(target: number, open: boolean, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!open) { setVal(0); return; }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: target,
      duration: 1.0,
      ease: "power2.out",
      onUpdate: () => setVal(obj.v),
    });
    return () => { tween.kill(); };
  }, [target, open]);
  return decimals === 0 ? Math.round(val) : Number(val.toFixed(decimals));
}

function ImpactStat({
  label, value, accent, icon, suffix, decimals = 0, open, strike,
}: {
  label: string; value: number; accent: string; icon: React.ReactNode;
  suffix?: string; decimals?: number; open: boolean;
  strike?: { value: number; decimals?: number };
}) {
  const live = useCountUp(value, open, decimals);
  return (
    <div className="flex-1 rounded-[14px] border border-black/8 bg-white px-[16px] py-[14px]">
      <div className="flex items-center gap-[10px]">
        <div
          className="size-[32px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        <p className="text-[11px] uppercase tracking-[0.6px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
          {label}
        </p>
      </div>
      <p className="mt-[10px] text-[26px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
        {decimals === 0 ? live.toLocaleString() : live.toFixed(decimals)}
        {suffix && <span className="text-[13px] text-black/45 font-medium ml-[4px]">{suffix}</span>}
        {strike && (
          <span className="text-[14px] text-black/30 font-medium line-through ml-[8px]">
            {(strike.decimals ?? 0) === 0 ? strike.value.toLocaleString() : strike.value.toFixed(strike.decimals!)}
          </span>
        )}
      </p>
    </div>
  );
}

export function PublishedSummaryModal({
  open, onClose, platformIds, totalListings,
  daysAfter = 1.2, daysBaseline = 8.2,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const platforms = platformIds
    .map((id) => PLATFORMS.find((p) => p.id === id))
    .filter((p): p is Platform => Boolean(p));

  const totalPublications = totalListings * platforms.length;
  const daysSavedTotal = daysBaseline - daysAfter;

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

  if (!open) return null;

  // Group platforms by category for the readout
  const byCategory: Record<string, Platform[]> = {};
  platforms.forEach((p) => {
    (byCategory[p.category] ||= []).push(p);
  });
  const CATEGORY_LABEL: Record<string, string> = {
    syndication: "Syndication",
    marketplace: "Marketplaces",
    website:     "Website",
    social:      "Social",
  };
  const orderedCats = ["syndication", "marketplace", "website", "social"].filter(c => byCategory[c]?.length);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[75] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[22px] pb-[18px] border-b border-black/8">
          <div className="flex items-start justify-between gap-[16px]">
            <div className="flex items-start gap-[14px]">
              <div
                className="shrink-0 size-[46px] rounded-[14px] flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#fff",
                  boxShadow: "0 6px 16px rgba(16,185,129,0.25)",
                }}
              >
                <Check size={24} strokeWidth={3} />
              </div>
              <div>
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                    Your inventory is live
                  </h2>
                  <span className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full bg-[rgba(16,185,129,0.12)] text-[#059669] text-[10px] font-bold uppercase tracking-[0.6px]">
                    <Megaphone size={10} />
                    Published
                  </span>
                </div>
                <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                  <span className="font-semibold text-[#0a0a0a]">{totalListings.toLocaleString()} listings</span> live on{" "}
                  <span className="font-semibold text-[#0a0a0a]">{platforms.length}</span> {platforms.length === 1 ? "channel" : "channels"}.
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
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[28px] py-[20px] bg-[#FAFAFB]">
          {/* Impact stats */}
          <div className="flex gap-[12px]">
            <ImpactStat
              open={open}
              label="Total publications"
              value={totalPublications}
              accent="#4600F2"
              icon={<Megaphone size={16} />}
            />
            <ImpactStat
              open={open}
              label="Days to Frontline"
              value={daysAfter}
              decimals={1}
              suffix="days"
              accent="#10B981"
              icon={<Clock size={16} />}
              strike={{ value: daysBaseline, decimals: 1 }}
            />
            <ImpactStat
              open={open}
              label="Days saved per vehicle"
              value={daysSavedTotal}
              decimals={1}
              suffix="days"
              accent="#F59E0B"
              icon={<TrendingDown size={16} />}
            />
          </div>

          {/* Channels live */}
          <p className="mt-[20px] mb-[10px] text-[11px] uppercase tracking-[1px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
            Channels now live
          </p>
          <div className="rounded-[14px] border border-black/8 bg-white p-[16px] space-y-[14px]">
            {orderedCats.map((cat) => (
              <div key={cat}>
                <p className="text-[10px] uppercase tracking-[0.8px] font-bold text-black/45 mb-[6px] font-['Inter:Bold',sans-serif]">
                  {CATEGORY_LABEL[cat]}
                </p>
                <div className="grid grid-cols-2 gap-[8px]">
                  {byCategory[cat].map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-[10px] px-[10px] py-[8px] rounded-[8px] bg-[#FAFAFB] border border-black/5"
                    >
                      <LogoTile platform={p} size={26} />
                      <span className="text-[12px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] flex-1 truncate">
                        {p.name}
                      </span>
                      <span className="inline-flex items-center gap-[3px] text-[10px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif] uppercase tracking-[0.4px]">
                        <Check size={10} strokeWidth={3} />
                        Live
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Audience callout */}
          <div
            className="mt-[16px] rounded-[14px] p-[16px] flex items-center gap-[14px] relative overflow-hidden"
            style={{
              background: "linear-gradient(95deg, rgba(70,0,242,0.05) 0%, rgba(0,196,136,0.05) 100%)",
              border: "1px solid rgba(70,0,242,0.10)",
            }}
          >
            <div
              className="shrink-0 size-[38px] rounded-[10px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4600F2 0%, #00C488 100%)",
                color: "#fff",
              }}
            >
              <Users size={18} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">
                Reaching buyers now
              </p>
              <p className="text-[12px] text-black/55 mt-[2px] font-['Inter:Regular',sans-serif]">
                Studio-grade media live on every channel.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#10B981] animate-pulse" />
            All channels live
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-[22px] rounded-[10px] text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-[8px]"
            style={{
              background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
              boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
            }}
          >
            Back to dashboard
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
