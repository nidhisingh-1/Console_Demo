import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MIcon } from "./shared/MIcon";
import type { BucketKey, BucketState } from "./Demo2Dashboard";

const BUCKET_DEFS: Array<{
  key: BucketKey;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "raw",          label: "Raw media awaiting processing", icon: <MIcon name="camera_alt" size={16} /> },
  { key: "nophoto",      label: "No photos",                     icon: <MIcon name="image_not_supported" size={16} /> },
  { key: "cgi",          label: "Standard photos awaiting CGI",  icon: <MIcon name="auto_fix_high" size={16} /> },
  { key: "unsyndicated", label: "Not syndicated",                icon: <MIcon name="send" size={16} /> },
  { key: "aging",        label: "Aging, high holding cost",      icon: <MIcon name="trending_down" size={16} /> },
];

export interface InventoryDiagnosticFabProps {
  buckets: Record<BucketKey, BucketState>;
  activeBucket: BucketKey | null;
  onBucketClick: (b: BucketKey) => void;
  /** When provided, the parent owns the expanded/collapsed state. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * Bottom-right floating widget mirroring Demo 1's NeedActionsWidget.
 * Two states:
 *   1. Collapsed → small red pill ("Inventory diagnosis · N issues")
 *   2. Expanded → full widget with red-gradient header + clickable issue rows
 * Clicking an issue row opens the pitch panel for that bucket (the pitch's CTA
 * is what actually fires the transformation animation — see Demo2.tsx).
 */
export function InventoryDiagnosticFab({
  buckets, activeBucket, onBucketClick, expanded: expandedProp, onExpandedChange,
}: InventoryDiagnosticFabProps) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const expanded = expandedProp ?? internalExpanded;
  const setExpanded = (v: boolean) => {
    if (onExpandedChange) onExpandedChange(v);
    if (expandedProp === undefined) setInternalExpanded(v);
  };
  const widgetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Open / collapse animation
  useEffect(() => {
    const el = expanded ? widgetRef.current : buttonRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { y: 16, opacity: 0, scale: 0.94 },
      { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.4)" }
    );
  }, [expanded]);

  const openIssues = (Object.keys(buckets) as BucketKey[])
    .filter((k) => !buckets[k].completed);
  const totalNeedingAction = openIssues.reduce((sum, k) => sum + buckets[k].count, 0);
  const allResolved = openIssues.length === 0;

  // ── Collapsed → red pill button ──────────────────────────────────────────
  if (!expanded) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed bottom-[24px] right-[24px] z-[55] h-[44px] pl-[16px] pr-[10px] rounded-full text-white text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center gap-[10px] shadow-[0_8px_24px_rgba(220,38,38,0.45)] hover:shadow-[0_12px_32px_rgba(220,38,38,0.55)] transition-shadow"
        style={{
          background: allResolved
            ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
            : "linear-gradient(90deg, #DC2626 0%, #EF4444 100%)",
        }}
      >
        {allResolved ? <MIcon name="check" size={18} weight={600} /> : <MIcon name="error" size={18} weight={500} />}
        Actions required
        <span className="size-[24px] rounded-full bg-white flex items-center justify-center ring-2 text-[11px] font-bold"
          style={{
            color: allResolved ? "#059669" : "#DC2626",
            ["--tw-ring-color" as never]: allResolved ? "rgba(16,185,129,0.3)" : "rgba(220,38,38,0.3)",
          }}
        >
          {allResolved ? "0" : openIssues.length}
        </span>
      </button>
    );
  }

  // ── Expanded → full widget ───────────────────────────────────────────────
  return (
    <div
      ref={widgetRef}
      className="fixed bottom-[24px] right-[24px] z-[55] w-[460px]"
    >
      <div className="bg-white rounded-[18px] shadow-[0_28px_70px_rgba(0,0,0,0.26)] border border-black/5 overflow-hidden">
        {/* Header — light red gradient (urgency) */}
        <div
          className="relative px-[22px] pt-[20px] pb-[18px]"
          style={{
            background: allResolved
              ? "linear-gradient(180deg, rgba(16,185,129,0.10) 0%, rgba(16,185,129,0.02) 100%)"
              : "linear-gradient(180deg, rgba(239,68,68,0.10) 0%, rgba(239,68,68,0.02) 100%)",
          }}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-[14px] right-[14px] size-[30px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
            aria-label="Minimize"
          >
            <MIcon name="remove" size={18} className="text-black/55" weight={500} />
          </button>
          {allResolved ? (
            <p className="text-[22px] font-bold leading-[28px] font-['Inter:Bold',sans-serif] pr-[36px]">
              <span className="text-[#059669]">All resolved!</span>
              <span className="text-[#0a0a0a]"> Inventory is sale-ready.</span>
            </p>
          ) : (
            <p className="text-[22px] font-bold leading-[28px] font-['Inter:Bold',sans-serif] pr-[36px]">
              <span className="text-[#DC2626]">{totalNeedingAction} vehicles</span>
              <span className="text-[#0a0a0a]"> not ready to sell!</span>
            </p>
          )}
          <p className="mt-[6px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif] leading-[18px]">
            {allResolved
              ? "Every diagnosis bucket has been worked through."
              : "Click a bucket to see the pitch — then transform from there."}
          </p>
        </div>

        {/* Issue list */}
        <div className="px-[16px] py-[14px] flex flex-col gap-[10px]">
          {BUCKET_DEFS.map((def) => {
            const state = buckets[def.key];
            const isActive = activeBucket === def.key;
            const isCompleted = state.completed;
            return (
              <button
                key={def.key}
                type="button"
                onClick={() => onBucketClick(def.key)}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[12px] rounded-[12px] transition-colors text-left ${
                  isCompleted
                    ? "bg-[rgba(16,185,129,0.08)] hover:bg-[rgba(16,185,129,0.14)]"
                    : isActive
                      ? "bg-[rgba(70,0,242,0.08)] ring-1 ring-[#4600F2]/30"
                      : "bg-[#F4F4F6] hover:bg-[#EDEDF1]"
                }`}
              >
                <span
                  className="size-[36px] rounded-[10px] flex items-center justify-center shrink-0"
                  style={{
                    background: isCompleted ? "rgba(16,185,129,0.15)" : "#FFFFFF",
                    color: isCompleted ? "#059669" : "#0a0a0a",
                  }}
                >
                  {isCompleted
                    ? <MIcon name="check" size={18} weight={600} />
                    : <span className="scale-[1.2] flex">{def.icon}</span>}
                </span>
                <span className="flex-1 text-[14px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] truncate">
                  {def.label}
                </span>
                <span
                  className={`text-[13px] font-bold font-['Inter:Bold',sans-serif] whitespace-nowrap ${
                    isCompleted ? "text-[#059669]" : "text-[#4600F2]"
                  }`}
                >
                  {isCompleted ? "Done" : `${state.count} vehicles`}
                </span>
                {!isCompleted && (
                  <MIcon name="arrow_forward" size={18} className="text-[#4600F2] shrink-0" weight={500} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
