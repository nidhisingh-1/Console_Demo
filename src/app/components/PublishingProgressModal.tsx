import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Megaphone, Check, Clock, TrendingDown } from "lucide-react";
import { PLATFORMS, type Platform } from "./publishPlatforms";

interface Props {
  open: boolean;
  platformIds: string[];
  totalListings: number;
  /** Days to frontline BEFORE publishing (post-transform value) */
  daysBefore?: number;
  /** Days to frontline AFTER publishing — what we end on */
  daysAfter?: number;
  /** Total duration of the simulated publishing flow */
  durationMs?: number;
  onComplete: () => void;
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

function PlatformProgressRow({
  platform, progress, done,
}: { platform: Platform; progress: number; done: boolean }) {
  return (
    <div className="flex items-center gap-[12px] py-[8px]">
      <LogoTile platform={platform} size={30} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-[12px]">
          <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
            {platform.name}
          </p>
          {done ? (
            <span className="inline-flex items-center gap-[4px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#10B981] font-['Inter:Bold',sans-serif]">
              <Check size={11} strokeWidth={3} />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-[5px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#4600F2] font-['Inter:Bold',sans-serif]">
              <span className="size-[6px] rounded-full bg-[#4600F2] animate-pulse" />
              Publishing
            </span>
          )}
        </div>
        <div className="mt-[6px] h-[4px] rounded-full bg-[#F1F1F4] overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-200 ease-out"
            style={{
              width: `${Math.min(100, progress * 100)}%`,
              background: done
                ? "#10B981"
                : "linear-gradient(90deg, #4600F2 0%, #B651D7 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function PublishingProgressModal({
  open, platformIds, totalListings,
  daysBefore = 4.1, daysAfter = 1.2,
  durationMs = 4500,
  onComplete,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 overall
  const [days, setDays] = useState(daysBefore);
  const [completedCount, setCompletedCount] = useState(0);

  const platforms = platformIds
    .map((id) => PLATFORMS.find((p) => p.id === id))
    .filter((p): p is Platform => Boolean(p));

  // Entrance animation
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 20, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [open]);

  // Reset + drive the progress timeline
  useEffect(() => {
    if (!open) {
      setProgress(0);
      setDays(daysBefore);
      setCompletedCount(0);
      return;
    }
    const obj = { p: 0, d: daysBefore };
    const tween = gsap.to(obj, {
      p: 1,
      d: daysAfter,
      duration: durationMs / 1000,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(obj.p);
        setDays(obj.d);
      },
      onComplete: () => {
        setCompletedCount(platforms.length);
        // brief breather to show the "all live" state, then chain
        gsap.delayedCall(0.4, () => onComplete());
      },
    });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, durationMs, platforms.length, daysAfter, daysBefore]);

  // Compute per-platform progress: platforms finish staggered across the duration
  // so the rows complete one after another, not all at once.
  const perPlatformProgress = (idx: number) => {
    const N = Math.max(1, platforms.length);
    // each platform owns a slice of the timeline starting at idx/N
    const start = idx / N;
    const end = (idx + 1) / N;
    if (progress <= start) return 0;
    if (progress >= end) return 1;
    return (progress - start) / (end - start);
  };

  // Update completed count based on progress
  useEffect(() => {
    const N = platforms.length;
    if (!N) return;
    const completed = Math.floor(progress * N);
    setCompletedCount(Math.min(completed, N));
  }, [progress, platforms.length]);

  if (!open) return null;

  const listingsLive = Math.round(progress * totalListings);
  const totalPublications = totalListings * platforms.length;
  const publicationsLive = Math.round(progress * totalPublications);

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
          <div className="flex items-start gap-[14px]">
            <div
              className="shrink-0 size-[46px] rounded-[14px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                color: "#fff",
                boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
              }}
            >
              <Megaphone size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-[8px] flex-wrap">
                <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                  Publishing your inventory
                </h2>
                <span className="inline-flex items-center gap-[5px] px-[8px] py-[2px] rounded-full bg-[rgba(70,0,242,0.08)] text-[#4600F2] text-[10px] font-bold uppercase tracking-[0.6px]">
                  <span className="size-[5px] rounded-full bg-[#4600F2] animate-pulse" />
                  In progress
                </span>
              </div>
              <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                Pushing to {platforms.length} {platforms.length === 1 ? "channel" : "channels"}.
              </p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[12px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Listings published
              </p>
              <p className="mt-[4px] text-[22px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] leading-none">
                {listingsLive.toLocaleString()}
                <span className="text-black/30 text-[14px] font-medium"> / {totalListings.toLocaleString()}</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-black/8 bg-white px-[14px] py-[12px]">
              <p className="text-[10px] uppercase tracking-[0.8px] text-black/45 font-semibold font-['Inter:Semi_Bold',sans-serif]">
                Total publications
              </p>
              <p className="mt-[4px] text-[22px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
                {publicationsLive.toLocaleString()}
                <span className="text-black/30 text-[14px] font-medium"> / {totalPublications.toLocaleString()}</span>
              </p>
            </div>
            <div className="rounded-[10px] border border-[#10B981]/25 bg-[rgba(16,185,129,0.05)] px-[14px] py-[12px]">
              <div className="flex items-center gap-[6px]">
                <Clock size={11} className="text-[#10B981]" />
                <p className="text-[10px] uppercase tracking-[0.8px] text-[#059669] font-semibold font-['Inter:Semi_Bold',sans-serif]">
                  Days to Frontline
                </p>
              </div>
              <p className="mt-[4px] text-[22px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif] leading-none">
                {days.toFixed(1)}
                <span className="text-black/30 text-[12px] font-medium ml-[6px] line-through">
                  {daysBefore.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-[2px] text-[12px] text-[#10B981] font-semibold ml-[6px]">
                  <TrendingDown size={11} strokeWidth={3} />
                  −{(daysBefore - days).toFixed(1)}
                </span>
              </p>
            </div>
          </div>

          {/* Master progress bar */}
          <div className="mt-[14px] flex items-center gap-[12px]">
            <div className="flex-1 h-[8px] rounded-full bg-[#F1F1F4] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-out"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  background: "linear-gradient(90deg, #4600F2 0%, #B651D7 50%, #FF5C7A 100%)",
                }}
              />
            </div>
            <p className="text-[11px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] tabular-nums w-[36px] text-right">
              {Math.round(progress * 100)}%
            </p>
          </div>
        </div>

        {/* Per-platform rows */}
        <div className="flex-1 overflow-auto px-[28px] py-[16px] bg-[#FAFAFB]">
          <p className="text-[11px] uppercase tracking-[1px] font-semibold text-black/55 mb-[6px] font-['Inter:Semi_Bold',sans-serif]">
            Channels
          </p>
          <div className="divide-y divide-black/5">
            {platforms.map((p, i) => (
              <PlatformProgressRow
                key={p.id}
                platform={p}
                progress={perPlatformProgress(i)}
                done={completedCount > i}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <div className="flex items-center gap-[6px] text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            <div className="size-[6px] rounded-full bg-[#4600F2] animate-pulse" />
            Streaming to channels…
          </div>
          <p className="text-[11px] text-black/45 font-['Inter:Medium',sans-serif] font-medium">
            Keep this tab open
          </p>
        </div>
      </div>
    </div>
  );
}
