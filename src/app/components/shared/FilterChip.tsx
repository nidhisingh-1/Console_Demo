import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AlertTriangle } from "lucide-react";

export function FilterChip({
  label, count, active, pulse, onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  /** Red pulsing ring to draw attention */
  pulse?: boolean;
  onClick?: () => void;
}) {
  const ringRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    if (!pulse || active) {
      gsap.killTweensOf(el);
      gsap.set(el, { boxShadow: "0 0 0 0 rgba(239,68,68,0)", scale: 1 });
      return;
    }
    const tween = gsap.fromTo(
      el,
      { boxShadow: "0 0 0 0 rgba(239,68,68,0.55)", scale: 1 },
      {
        boxShadow: "0 0 0 8px rgba(239,68,68,0)",
        scale: 1.04,
        duration: 1.2,
        repeat: -1,
        yoyo: false,
        ease: "power1.out",
      }
    );
    return () => { tween.kill(); };
  }, [pulse, active]);

  const ring = pulse ? "border-[#EF4444]/70" : active ? "border-[#4600F2]" : "border-black/10";
  const fg = pulse ? "text-[#B91C1C]" : active ? "text-[#4600F2]" : "text-black/70";
  const bg = active
    ? "bg-[rgba(70,0,242,0.08)]"
    : pulse
      ? "bg-[#FEF2F2]"
      : "bg-white hover:bg-[#fafafa]";

  return (
    <span ref={ringRef} className="inline-flex rounded-full">
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-[6px] h-[30px] px-[12px] rounded-full border text-[12px] font-medium transition-colors font-['Inter:Medium',sans-serif] ${ring} ${bg} ${fg}`}
      >
        {pulse && !active && (
          <AlertTriangle size={11} strokeWidth={2.5} className="text-[#EF4444]" />
        )}
        {label}
        {typeof count === "number" && (
          <span
            className={`text-[10px] font-semibold px-[6px] py-[1px] rounded-full ${
              pulse && !active
                ? "bg-[#EF4444]/15 text-[#B91C1C]"
                : active
                ? "bg-[#4600F2]/15 text-[#4600F2]"
                : "bg-black/5 text-black/40"
            }`}
          >
            {count}
          </span>
        )}
      </button>
    </span>
  );
}
