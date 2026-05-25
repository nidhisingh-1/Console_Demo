import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Layers, X } from "lucide-react";

interface Props {
  open: boolean;
  /** CSS selector for the element to highlight */
  targetSelector?: string;
  /** Whether publishing is complete — controls whether the copy says "took it live" vs "ready to publish" */
  published?: boolean;
  onDismiss: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

export function SmartMatchSpotlight({
  open,
  targetSelector = ".smart-match-badge",
  published = false,
  onDismiss,
}: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Measure the target — re-measure on window resize so the spotlight stays aligned
  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    // Defer to next frame to ensure the table has rendered + ScrollIntoView completes
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (el) el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      measure();
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, targetSelector]);

  // Entrance animation when both open and rect are ready
  useEffect(() => {
    if (!open || !rect) return;
    const overlay = overlayRef.current;
    const halo = haloRef.current;
    const card = cardRef.current;
    if (!overlay || !halo || !card) return;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      halo,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }
    );
    gsap.fromTo(
      card,
      { y: 12, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", delay: 0.15 }
    );

    // Continuous green ring pulse on the halo (outer box-shadow ring)
    const pulse = gsap.to(halo, {
      boxShadow:
        "0 0 0 0 rgba(0,0,0,0.55), 0 0 0 12px rgba(0,196,136,0)",
      duration: 1.3,
      repeat: -1,
      ease: "power1.out",
      startAt: {
        boxShadow:
          "0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 0 rgba(0,196,136,0.6)",
      },
    });
    return () => { pulse.kill(); };
  }, [open, rect]);

  if (!open || !rect) return null;

  // Card position — anchored to the badge, sitting just below with a small offset.
  const cardWidth = 320;
  const padding = 10; // halo padding around badge
  const haloTop = rect.top - padding;
  const haloLeft = rect.left - padding;
  const haloW = rect.width + padding * 2;
  const haloH = rect.height + padding * 2;

  // Anchor the card centered under the halo when there's room; otherwise above.
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const wantBelow = haloTop + haloH + 12 + 180 < winH;
  const cardTop = wantBelow ? haloTop + haloH + 12 : haloTop - 12 - 170;
  let cardLeft = haloLeft + haloW / 2 - cardWidth / 2;
  cardLeft = Math.max(16, Math.min(cardLeft, winW - cardWidth - 16));
  const tailLeft = haloLeft + haloW / 2 - cardLeft;
  const tailOnTop = wantBelow;

  // Clicking the dim area outside the card nudges the card with a small wiggle
  // — instead of dismissing — so the user is gently steered to the "Got it" button.
  const handleBackdropClick = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(
      card,
      { x: -6 },
      { x: 0, duration: 0.45, ease: "elastic.out(1, 0.4)" }
    );
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[55]"
    >
      {/* Halo over the badge — uses an enormous outer box-shadow to dim everything else */}
      <div
        ref={haloRef}
        className="absolute rounded-[8px] pointer-events-none"
        style={{
          top: haloTop,
          left: haloLeft,
          width: haloW,
          height: haloH,
          boxShadow:
            "0 0 0 9999px rgba(0,0,0,0.55), 0 0 0 4px rgba(0,196,136,0.7)",
        }}
      />

      {/* Explainer card */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute pointer-events-auto"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <div className="bg-white rounded-[14px] shadow-[0_18px_40px_rgba(0,0,0,0.30)] p-[16px]">
          <div className="flex items-start justify-between gap-[10px]">
            <div className="inline-flex items-center gap-[6px]">
              <div className="size-[26px] rounded-[8px] bg-[rgba(0,196,136,0.12)] flex items-center justify-center">
                <Layers size={14} className="text-[#00C488]" strokeWidth={2.5} />
              </div>
              <span className="text-[12px] font-bold text-[#00C488] uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]">
                Smart Match
              </span>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="size-[22px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X size={13} className="text-black/55" />
            </button>
          </div>
          <p className="mt-[8px] text-[14px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-[20px]">
            This vehicle had no photos. Smart Match added media from a matching vehicle
            {published ? (
              <> and <span className="text-[#10B981]">took it live</span>.</>
            ) : (
              <> — <span className="text-[#4600F2]">ready to publish</span>.</>
            )}
          </p>
          <p className="mt-[4px] text-[12px] text-black/55 font-['Inter:Regular',sans-serif] leading-[16px]">
            Any listing tagged Smart Match is running on borrowed media instead of original photos.
          </p>
          <div className="mt-[12px] flex justify-end">
            <button
              type="button"
              onClick={onDismiss}
              className="h-[32px] px-[16px] rounded-[8px] bg-[#0a0a0a] text-white text-[12px] font-semibold font-['Inter:Semi_Bold',sans-serif] hover:bg-[#1a1a1a] transition-colors"
            >
              Got it
            </button>
          </div>

          {/* Tail */}
          <div
            aria-hidden
            className="absolute"
            style={{
              left: Math.max(14, Math.min(tailLeft - 8, cardWidth - 22)),
              [tailOnTop ? "top" : "bottom"]: -8,
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              ...(tailOnTop
                ? { borderBottom: "10px solid #fff" }
                : { borderTop: "10px solid #fff" }),
              filter: "drop-shadow(0 -2px 4px rgba(0,0,0,0.08))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
