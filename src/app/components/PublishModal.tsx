import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { X, Check } from "lucide-react";
import { PLATFORMS_BY_CATEGORY, type Platform, type PlatformCategory } from "./publishPlatforms";

interface Props {
  open: boolean;
  onClose: () => void;
  onPublish: (selectedIds: string[]) => void;
  totalListings?: number;
}

// ─── Logo tile ────────────────────────────────────────────────────────────────

function LogoTile({ platform, size = 32 }: { platform: Platform; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-[8px] flex items-center justify-center font-bold font-['Inter:Bold',sans-serif]"
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

// ─── Selectable platform card ─────────────────────────────────────────────────

function PlatformCard({
  platform, selected, onToggle,
}: { platform: Platform; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex items-center gap-[12px] p-[12px] rounded-[10px] border bg-white text-left transition-all
        ${selected
          ? "border-[#4600f2] ring-1 ring-[#4600f2] bg-[rgba(70,0,242,0.02)]"
          : "border-black/10 hover:border-black/25"}`}
    >
      <LogoTile platform={platform} size={34} />
      <span className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] flex-1 truncate">
        {platform.name}
      </span>
      {selected && (
        <span className="size-[18px] rounded-full bg-[#4600f2] flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title, count, platforms, selectedIds, toggle,
}: {
  title: string;
  count?: number;
  platforms: Platform[];
  selectedIds: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="mb-[18px]">
      <p className="text-[13px] font-bold text-[#0a0a0a] mb-[10px] font-['Inter:Bold',sans-serif]">
        {title}
        {typeof count === "number" && (
          <span className="text-black/50 font-medium ml-[4px]">({count})</span>
        )}
      </p>
      <div className="grid grid-cols-3 gap-[10px]">
        {platforms.map((p) => (
          <PlatformCard
            key={p.id}
            platform={p}
            selected={selectedIds.has(p.id)}
            onToggle={() => toggle(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export function PublishModal({ open, onClose, onPublish, totalListings }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Default: nothing pre-selected; users opt in
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 20, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" }
    );
  }, [open]);

  // Reset selection each time modal opens
  useEffect(() => {
    if (open) setSelectedIds(new Set());
  }, [open]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sections: { title: string; cat: PlatformCategory; count?: number }[] = [
    { title: "Syndication Partners", cat: "syndication" },
    { title: "Marketplaces", cat: "marketplace", count: PLATFORMS_BY_CATEGORY.marketplace.length },
    { title: "Website", cat: "website" },
    { title: "Social Channels", cat: "social" },
  ];

  const count = selectedIds.size;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[22px] pb-[16px] flex items-start justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[28px]">
              Publish your inventory
            </h2>
            <p className="mt-[2px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
              Select channels
              {typeof totalListings === "number" && (
                <span className="ml-[6px] text-black/50">· {totalListings} listings ready</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-[32px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={20} className="text-black/65" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[28px] py-[10px] bg-[#FAFAFB]">
          {sections.map((s) => (
            <Section
              key={s.cat}
              title={s.title}
              count={s.count}
              platforms={PLATFORMS_BY_CATEGORY[s.cat]}
              selectedIds={selectedIds}
              toggle={toggle}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-[28px] py-[14px] border-t border-black/8 flex items-center justify-between bg-white">
          <p className="text-[12px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
            {count === 0
              ? "Select at least one channel"
              : `${count} ${count === 1 ? "channel" : "channels"} selected`}
          </p>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] px-[28px] rounded-[10px] bg-white border border-black/15 text-[#0a0a0a] text-[14px] font-semibold font-['Inter:Semi_Bold',sans-serif] hover:bg-[#fafafa] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={count === 0}
              onClick={() => onPublish(Array.from(selectedIds))}
              className="h-[44px] px-[44px] rounded-[10px] bg-[#4600F2] hover:bg-[#3a00d0] disabled:bg-[#4600F2]/40 disabled:cursor-not-allowed text-white text-[14px] font-semibold font-['Inter:Semi_Bold',sans-serif] transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
