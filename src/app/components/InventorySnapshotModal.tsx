import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ImageOff, Camera, Box } from "lucide-react";

interface Props {
  open: boolean;
  totalInventory?: number;
  score?: number;
  noPhotos?: number;
  rawPhotos?: number;
  cgiPhotos?: number;
  onStart?: () => void;
}

function Gauge({ score }: { score: number }) {
  // Semicircle gauge — score is 0..5; arc goes left (low/red) → right (high/green)
  const pct = Math.max(0, Math.min(1, score / 5));
  const W = 160, H = 96, CX = W / 2, CY = H - 8, R = 64, SW = 14;
  // Arc from angle 180° to 0° (left to right, half circle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const arc = (a0: number, a1: number) => {
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0) * -1; // y inverted
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1) * -1;
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const sweep = a0 > a1 ? 1 : 0;
    return `M ${x0} ${y0} A ${R} ${R} 0 ${largeArc} ${sweep} ${x1} ${y1}`;
  };
  return (
    <div className="relative flex flex-col items-center" style={{ width: W }}>
      <svg width={W} height={H + 4} viewBox={`0 0 ${W} ${H + 4}`} fill="none">
        <defs>
          <linearGradient id="gaugeFill" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path
          d={arc(startAngle, endAngle)}
          stroke="#F1F1F4"
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
        {/* Filled portion (left side red since score is low) */}
        <path
          d={arc(startAngle, startAngle - Math.PI * pct)}
          stroke="url(#gaugeFill)"
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-end justify-center pb-[2px]">
        <span className="text-[36px] font-bold text-[#EF4444] font-['Inter:Bold',sans-serif] leading-none">
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon, iconBg, iconColor, label, value, barColor, barPct,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  barColor: string;
  barPct: number;
}) {
  return (
    <div className="flex-1 rounded-[14px] bg-white border border-black/5 p-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-[10px]">
        <div
          className="size-[28px] rounded-[8px] flex items-center justify-center"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <p
          className="text-[13px] font-semibold font-['Inter:Semi_Bold',sans-serif]"
          style={{ color: iconColor }}
        >
          {label}
        </p>
      </div>
      <p className="mt-[12px] text-[28px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
        {value}
      </p>
      <p className="mt-[2px] text-[11px] text-black/40 font-['Inter:Regular',sans-serif]">vehicles</p>
      <div className="mt-[10px] h-[4px] rounded-full bg-[#F1F1F4] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, barPct)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

export function InventorySnapshotModal({
  open,
  totalInventory = 234,
  score = 2.8,
  noPhotos = 90,
  rawPhotos = 67,
  cgiPhotos = 134,
  onStart,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, [open]);

  if (!open) return null;

  const total = noPhotos + rawPhotos + cgiPhotos || 1;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[1080px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-[28px] pt-[22px]">
          <div className="flex items-start gap-[14px]">
            <div className="shrink-0 size-[40px] rounded-full bg-[rgba(70,0,242,0.08)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l1.6 4.7L18.3 8l-3.6 3.4 1 4.9L12 14l-3.7 2.3 1-4.9L5.7 8l4.7-1.3L12 2z"
                  fill="#4600F2"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
                Your inventory snapshot
              </h2>
              <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                Every vehicle scored — here's where you stand.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] text-black/40 font-['Inter:Medium',sans-serif] font-medium">
              Total Inventory:
            </p>
            <p className="text-[16px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
              {totalInventory}
            </p>
          </div>
        </div>

        {/* Score row */}
        <div className="mx-[28px] mt-[20px] rounded-[14px] border border-black/5 bg-[#FAFAFB] px-[24px] py-[18px] flex items-center gap-[24px]">
          <Gauge score={score} />
          <div className="flex-1">
            <p className="text-[18px] font-bold font-['Inter:Bold',sans-serif] text-[#0a0a0a]">
              Inventory Score:{" "}
              <span className="text-[#EF4444]">
                {score < 3 ? "Critical" : score < 4 ? "Needs Work" : "Healthy"}
              </span>
            </p>
            <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
              Most listings have placeholder or no media.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="px-[28px] pt-[16px] flex gap-[14px]">
          <StatCard
            icon={<ImageOff size={16} />}
            iconBg="rgba(239,68,68,0.12)"
            iconColor="#EF4444"
            label="Vehicles with No Photos"
            value={noPhotos}
            barColor="#EF4444"
            barPct={(noPhotos / total) * 100}
          />
          <StatCard
            icon={<Camera size={16} />}
            iconBg="rgba(16,185,129,0.12)"
            iconColor="#059669"
            label="Vehicles with Raw Photos"
            value={rawPhotos}
            barColor="#10B981"
            barPct={(rawPhotos / total) * 100}
          />
          <StatCard
            icon={<Box size={16} />}
            iconBg="rgba(245,158,11,0.14)"
            iconColor="#D97706"
            label="Vehicles with CGI/Stock"
            value={cgiPhotos}
            barColor="#F59E0B"
            barPct={(cgiPhotos / total) * 100}
          />
        </div>

        {/* CTA */}
        <div className="px-[28px] py-[24px] flex">
          <button
            type="button"
            onClick={onStart}
            className="h-[44px] px-[24px] rounded-[10px] text-white text-[14px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
              boxShadow: "0 6px 16px rgba(70,0,242,0.25)",
            }}
          >
            Start Transforming
          </button>
        </div>
      </div>
    </div>
  );
}
