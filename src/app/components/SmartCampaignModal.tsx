import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  X, Plus, Snowflake, BadgeCheck, Zap, Megaphone, Check, Star,
} from "lucide-react";
import agingImg from "../assets/vehicle/studio-exterior-1.jpg";
import festiveImg from "../assets/vehicle/studio-exterior-3.jpg";
import certifiedImg from "../assets/vehicle/cgi-transformed-side.jpg";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick?: (campaignId: string) => void;
  onCreateCustom?: () => void;
  /** Vehicle count to show on the Ageing template (defaults to what the user selected) */
  selectedCount?: number;
}

type Template = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  vehicleCount: number;
  chipBg: string;
  chipFg: string;
};

function buildTemplates(selectedCount: number): Template[] {
  return [
    {
      id: "ageing",
      category: "Ageing",
      title: "Move 45+ day aged inventory",
      subtitle: "Push before the 60-day cliff with urgency banners.",
      vehicleCount: selectedCount || 4,
      chipBg: "#FEE2E2",
      chipFg: "#B91C1C",
    },
    {
      id: "promotional",
      category: "Promotional",
      title: "Dealership billboard",
      subtitle: "Make-of-the-month creatives for marketplace ads.",
      vehicleCount: 32,
      chipBg: "#DBEAFE",
      chipFg: "#1D4ED8",
    },
    {
      id: "festive",
      category: "Festive",
      title: "Holiday season",
      subtitle: "Capture the December rush with festive banners.",
      vehicleCount: 28,
      chipBg: "#FFEDD5",
      chipFg: "#C2410C",
    },
    {
      id: "certified",
      category: "Certified",
      title: "Certified Pre-owned Trust",
      subtitle: "Side ribbon and inspection badge on CPO listings.",
      vehicleCount: 41,
      chipBg: "#D1FAE5",
      chipFg: "#047857",
    },
  ];
}

// ─── 16:9 previews ────────────────────────────────────────────────────────

function AgingPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={agingImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Top banner */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-center px-[18px] py-[8px] text-white"
        style={{
          background: "linear-gradient(90deg, #7F1D1D 0%, #DC2626 50%, #7F1D1D 100%)",
        }}
      >
        <span className="inline-flex items-center gap-[8px] text-[12px] font-black uppercase tracking-[2.5px] font-['Inter:Bold',sans-serif]">
          <Zap size={13} strokeWidth={3} fill="currentColor" />
          Price Drop
        </span>
      </div>
      {/* Bottom banner */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center justify-between px-[18px] py-[10px] text-white"
        style={{ background: "linear-gradient(90deg, #7F1D1D 0%, #B91C1C 100%)" }}
      >
        <span className="text-[20px] font-black tracking-tight font-['Inter:Bold',sans-serif]">
          $2,500 OFF
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[1.5px] opacity-90 font-['Inter:Bold',sans-serif]">
          Must Go · Limited Time
        </span>
      </div>
    </div>
  );
}

function PromotionalBillboard() {
  // Pure billboard — no car image, full dealer branding
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0F1F4F 0%, #1D4ED8 45%, #2563EB 100%)",
      }}
    >
      {/* Diagonal ray pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(251,191,36,0.55) 0px, rgba(251,191,36,0.55) 2px, transparent 2px, transparent 60px)",
        }}
      />
      {/* Top + bottom yellow rails */}
      <div
        className="absolute top-0 inset-x-0 h-[10px]"
        style={{ background: "linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)" }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-[10px]"
        style={{ background: "linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)" }}
      />

      {/* Decorative star bursts */}
      <Star
        size={42}
        fill="#FBBF24"
        strokeWidth={0}
        className="absolute top-[18%] left-[6%] opacity-80"
        style={{ transform: "rotate(-12deg)", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))" }}
      />
      <Star
        size={30}
        fill="#FBBF24"
        strokeWidth={0}
        className="absolute bottom-[22%] right-[8%] opacity-70"
        style={{ transform: "rotate(8deg)", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.4))" }}
      />

      {/* Center copy */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-[24px]">
        <p className="inline-flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-[3px] text-[#FBBF24] mb-[10px] font-['Inter:Bold',sans-serif]">
          <Star size={9} fill="currentColor" strokeWidth={0} />
          AutoMart Premium
          <Star size={9} fill="currentColor" strokeWidth={0} />
        </p>
        <p
          className="text-[44px] font-black leading-[44px] mb-[8px] font-['Inter:Bold',sans-serif]"
          style={{ textShadow: "0 4px 16px rgba(0,0,0,0.45)" }}
        >
          DEALS
          <br />
          OF THE MONTH
        </p>
        <p className="text-[16px] font-black tracking-[1px] mt-[4px] font-['Inter:Bold',sans-serif] text-white/95">
          0% APR · 60 MONTHS · NO MONEY DOWN
        </p>
        <div className="mt-[14px] inline-flex items-center gap-[8px] px-[16px] py-[7px] rounded-[8px] bg-white text-[#1D4ED8] shadow-[0_6px_18px_rgba(0,0,0,0.30)]">
          <Megaphone size={14} strokeWidth={2.5} />
          <span className="text-[13px] font-black uppercase tracking-[1.5px] font-['Inter:Bold',sans-serif]">
            VisitAutoMart.com
          </span>
        </div>
      </div>
    </div>
  );
}

function FestivePreview() {
  // Scattered static snowflake decorations (random positions, no animation)
  const flakes = [
    { left: 6,  top: 22, size: 14, opacity: 0.85 },
    { left: 18, top: 38, size: 10, opacity: 0.60 },
    { left: 30, top: 26, size: 12, opacity: 0.75 },
    { left: 44, top: 44, size: 9,  opacity: 0.55 },
    { left: 58, top: 30, size: 13, opacity: 0.80 },
    { left: 72, top: 42, size: 10, opacity: 0.60 },
    { left: 86, top: 28, size: 11, opacity: 0.70 },
    { left: 22, top: 58, size: 8,  opacity: 0.50 },
    { left: 64, top: 60, size: 9,  opacity: 0.55 },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={festiveImg} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Top red holiday banner */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-center gap-[14px] py-[10px] text-white"
        style={{
          background: "linear-gradient(90deg, #7F1D1D 0%, #DC2626 50%, #7F1D1D 100%)",
        }}
      >
        <Snowflake size={16} strokeWidth={2.5} />
        <span className="text-[16px] font-black uppercase tracking-[3px] font-['Inter:Bold',sans-serif]">
          Happy Holidays
        </span>
        <Snowflake size={16} strokeWidth={2.5} />
      </div>

      {/* Static decorative snowflakes */}
      {flakes.map((f, i) => (
        <span
          key={i}
          className="absolute text-white pointer-events-none"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            opacity: f.opacity,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.30))",
          }}
        >
          <Snowflake size={f.size} strokeWidth={1.8} />
        </span>
      ))}

      {/* Bottom green deals banner */}
      <div
        className="absolute bottom-0 inset-x-0 flex items-center justify-between px-[18px] py-[10px] text-white"
        style={{
          background: "linear-gradient(90deg, #064E3B 0%, #10B981 50%, #064E3B 100%)",
        }}
      >
        <span className="text-[14px] font-black uppercase tracking-[1.5px] font-['Inter:Bold',sans-serif]">
          December Deals
        </span>
        <span className="text-[14px] font-black uppercase tracking-[1.5px] font-['Inter:Bold',sans-serif]">
          Up to $5,000 Off
        </span>
      </div>
    </div>
  );
}

function CertifiedPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={certifiedImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Left side blue ribbon */}
      <div className="absolute top-[22px] left-0 flex items-center">
        <div
          className="flex items-center gap-[10px] pl-[14px] pr-[16px] py-[10px] text-white shadow-[0_6px_18px_rgba(29,78,216,0.50)]"
          style={{
            background: "linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)",
            borderTopRightRadius: "8px",
            borderBottomRightRadius: "8px",
          }}
        >
          <BadgeCheck size={24} strokeWidth={2.5} className="shrink-0" />
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] opacity-80 font-['Inter:Bold',sans-serif]">
              Certified Pre-Owned
            </p>
            <p className="text-[14px] font-black tracking-[0.5px] font-['Inter:Bold',sans-serif]">
              by AutoMart
            </p>
          </div>
        </div>
        <span
          className="block w-[10px] h-[44px]"
          style={{
            background: "#1D4ED8",
            clipPath: "polygon(0 0, 100% 50%, 0 100%)",
          }}
        />
      </div>
      {/* Inspection badge bottom-right */}
      <div className="absolute bottom-[16px] right-[16px] inline-flex items-center gap-[6px] bg-white/95 backdrop-blur-sm rounded-full px-[12px] py-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.20)]">
        <span className="size-[7px] rounded-full bg-[#10B981]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#1E3A8A] font-['Inter:Bold',sans-serif]">
          172-Point Inspection
        </span>
      </div>
    </div>
  );
}

function CampaignPreview({ id }: { id: string }) {
  return (
    <div
      key={id}
      className="relative w-full overflow-hidden rounded-[12px] border border-black/10 bg-black/5"
      style={{ aspectRatio: "16/9" }}
    >
      {id === "ageing" && <AgingPreview />}
      {id === "promotional" && <PromotionalBillboard />}
      {id === "festive" && <FestivePreview />}
      {id === "certified" && <CertifiedPreview />}
    </div>
  );
}

export function SmartCampaignModal({ open, onClose, onPick, onCreateCustom, selectedCount = 4 }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>("ageing");

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

  if (!open) return null;

  const templates = buildTemplates(selectedCount);
  const selectedTemplate = templates.find((t) => t.id === selectedId) ?? templates[0];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="px-[28px] pt-[22px] pb-[16px] flex items-start justify-between gap-[16px] border-b border-black/8">
          <div>
            <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
              Select a campaign to run
            </h2>
            <p className="mt-[2px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
              Pre-built templates or start from scratch.
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

        {/* Body: list + preview */}
        <div className="flex-1 grid grid-cols-[280px_1fr] min-h-0">
          {/* Left list */}
          <div className="border-r border-black/8 overflow-y-auto py-[8px] bg-[#FAFAFB]">
            {templates.map((t) => {
              const isActive = selectedId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left px-[14px] py-[12px] border-l-[3px] transition-colors ${
                    isActive
                      ? "border-[#4600F2] bg-white"
                      : "border-transparent hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-[8px] mb-[5px]">
                    <span
                      className="inline-flex items-center px-[7px] py-[1.5px] rounded-full text-[9px] font-bold uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif]"
                      style={{ background: t.chipBg, color: t.chipFg }}
                    >
                      {t.category}
                    </span>
                    {isActive && (
                      <Check size={12} strokeWidth={3} className="text-[#4600F2] ml-auto" />
                    )}
                  </div>
                  <p
                    className={`text-[13px] font-bold leading-[16px] font-['Inter:Bold',sans-serif] ${
                      isActive ? "text-[#0a0a0a]" : "text-black/75"
                    }`}
                  >
                    {t.title}
                  </p>
                  <p className="mt-[3px] text-[11px] text-black/45 font-['Inter:Regular',sans-serif] leading-[14px]">
                    {t.subtitle}
                  </p>
                  <p className="mt-[6px] text-[10px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif]">
                    {t.vehicleCount} vehicles
                  </p>
                </button>
              );
            })}
            {/* Create custom */}
            <div className="mt-[4px] pt-[8px] border-t border-black/8 px-[14px] pb-[6px]">
              <button
                type="button"
                onClick={onCreateCustom}
                className="w-full flex items-center gap-[8px] px-[8px] py-[10px] text-[#4600F2] hover:bg-white/70 rounded-[8px] transition-colors"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span className="text-[12px] font-semibold font-['Inter:Semi_Bold',sans-serif]">
                  Create custom campaign
                </span>
              </button>
            </div>
          </div>

          {/* Right preview */}
          <div className="overflow-y-auto p-[20px] flex flex-col gap-[16px]">
            <CampaignPreview id={selectedTemplate.id} />

            {/* Campaign info */}
            <div className="flex items-start justify-between gap-[14px]">
              <div className="flex-1 min-w-0">
                <span
                  className="inline-flex items-center px-[8px] py-[2px] rounded-full text-[10px] font-bold uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif]"
                  style={{ background: selectedTemplate.chipBg, color: selectedTemplate.chipFg }}
                >
                  {selectedTemplate.category}
                </span>
                <p className="mt-[6px] text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[20px]">
                  {selectedTemplate.title}
                </p>
                <p className="mt-[3px] text-[12px] text-black/55 font-['Inter:Regular',sans-serif]">
                  {selectedTemplate.subtitle}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-[0.6px] font-semibold text-black/45 font-['Inter:Semi_Bold',sans-serif]">
                  Total Vehicles
                </p>
                <p className="text-[22px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none mt-[2px]">
                  {selectedTemplate.vehicleCount}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-end gap-[10px] pt-[4px] mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-[36px] px-[14px] rounded-[8px] text-[12px] font-semibold text-black/60 hover:text-[#0a0a0a] transition-colors font-['Inter:Semi_Bold',sans-serif]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onPick?.(selectedTemplate.id)}
                className="h-[36px] px-[18px] rounded-[8px] bg-[#4600F2] text-white text-[12px] font-bold font-['Inter:Bold',sans-serif] hover:bg-[#3a00c9] transition-colors"
              >
                Review &amp; Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
