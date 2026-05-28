import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ImageOff, Info } from "lucide-react";
import imgRawExterior from "../assets/vehicle/raw-exterior-1.jpg";
import imgCgiTransformed from "../assets/vehicle/cgi-transformed-front.jpg";

interface Props {
  open: boolean;
  totalInventory?: number;
  score?: number;
  noPhotos?: number;
  rawPhotos?: number;
  cgiPhotos?: number;
  holdingCostPerDay?: number;
  daysToList?: number;
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
  thumb, label, sublabel, value, barColor, barPct, accent,
}: {
  thumb: string | null;
  label: string;
  sublabel: string;
  value: number;
  barColor: string;
  barPct: number;
  accent: string;
}) {
  return (
    <div className="flex-1 rounded-[14px] bg-white border border-black/8 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Thumbnail strip — uses Demo 1's raw / studio / CGI assets */}
      <div className="relative h-[78px] bg-[#F3F4F6] overflow-hidden">
        {thumb ? (
          <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#9CA3AF]">
            <ImageOff size={28} strokeWidth={1.6} />
          </div>
        )}
        <span
          className="absolute top-[8px] left-[8px] inline-flex items-center px-[7px] py-[2px] rounded-full text-[10px] font-bold uppercase tracking-[0.4px] font-['Inter:Bold',sans-serif] text-white"
          style={{ background: accent }}
        >
          {label}
        </span>
      </div>
      <div className="p-[14px]">
        <div className="flex items-baseline gap-[5px]">
          <span className="text-[28px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
            {value}
          </span>
          <span className="text-[11px] text-black/45 font-medium font-['Inter:Medium',sans-serif]">
            vehicles
          </span>
        </div>
        <div className="mt-[10px] h-[4px] rounded-full bg-[#F1F1F4] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, barPct)}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="mt-[6px] text-[11px] font-medium font-['Inter:Medium',sans-serif]" style={{ color: accent }}>
          {sublabel}
        </p>
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
  holdingCostPerDay = 40,
  daysToList = 12,
  onStart,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

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
  const notReadyCount = noPhotos + rawPhotos;
  const dailyCostAtRisk = notReadyCount * holdingCostPerDay;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[20px] w-full max-w-[760px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        {/* Header — title only, metrics moved into the score row for balance */}
        <div className="flex items-start gap-[14px] px-[28px] pt-[22px]">
          <div className="shrink-0 size-[40px] rounded-full bg-[rgba(70,0,242,0.08)] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l1.6 4.7L18.3 8l-3.6 3.4 1 4.9L12 14l-3.7 2.3 1-4.9L5.7 8l4.7-1.3L12 2z"
                fill="#4600F2"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[20px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-[26px]">
              Your inventory snapshot
            </h2>
            <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
              Every vehicle scored. Here is what it is costing your lot right now.
            </p>
          </div>
        </div>

        {/* Score row + supporting metrics — single balanced card */}
        <div className="mx-[28px] mt-[20px] rounded-[14px] border border-black/5 bg-[#FAFAFB] px-[24px] py-[18px]">
          <div className="flex items-center gap-[24px]">
            <Gauge score={score} />
            <div className="flex-1">
              <p className="text-[18px] font-bold font-['Inter:Bold',sans-serif] text-[#0a0a0a]">
                Inventory Score:{" "}
                <span className="text-[#EF4444]">
                {score < 3 ? "Critical" : score < 4 ? "Needs Work" : "Healthy"}
              </span>
            </p>
            <p className="mt-[4px] text-[13px] text-black/55 font-['Inter:Regular',sans-serif]">
                Most listings have low-quality or missing media. None are ready to compete online.
              </p>
          </div>
          </div>

          {/* Divider + supporting metrics row */}
          <div className="mt-[16px] pt-[14px] border-t border-black/8 grid grid-cols-3 gap-[16px]">
            <Metric label="Total Inventory" value={totalInventory.toLocaleString()} valueColor="#0a0a0a" />
            <Metric label="Avg. time to list" value={`${daysToList} days`} valueColor="#F59E0B" />
            <Metric
              label="Daily cost at risk"
              value={`$${dailyCostAtRisk.toLocaleString("en-US")} / day`}
              valueColor="#EF4444"
              tooltip={
                <>
                  {noPhotos} no-photo + {rawPhotos} raw-photo vehicles = {notReadyCount} not retail-ready
                  <br />
                  <span className="text-white/60">
                    {notReadyCount} vehicles × ${holdingCostPerDay}/day ={" "}
                    <span className="text-white font-semibold">${dailyCostAtRisk.toLocaleString("en-US")}/day</span>
                  </span>
                </>
              }
              tooltipVisible={tooltipVisible}
              onTooltipShow={() => setTooltipVisible(true)}
              onTooltipHide={() => setTooltipVisible(false)}
            />
          </div>
        </div>

        {/* Stat cards — each carries a real thumbnail from Demo 1's transformation assets */}
        <div className="px-[28px] pt-[16px] flex gap-[12px]">
          <StatCard
            thumb={null}
            label="No Photos"
            sublabel="Not listed anywhere"
            value={noPhotos}
            barColor="#EF4444"
            barPct={(noPhotos / total) * 100}
            accent="#DC2626"
          />
          <StatCard
            thumb={imgRawExterior}
            label="Raw Photos"
            sublabel="Need studio treatment"
            value={rawPhotos}
            barColor="#F59E0B"
            barPct={(rawPhotos / total) * 100}
            accent="#D97706"
          />
          <StatCard
            thumb={imgCgiTransformed}
            label="Stock"
            sublabel="Ready to upgrade"
            value={cgiPhotos}
            barColor="#7C3AED"
            barPct={(cgiPhotos / total) * 100}
            accent="#7C3AED"
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
            Fix my inventory
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Metric helper for the score row ─────────────────────────────────────────
function Metric({
  label, value, valueColor, tooltip, tooltipVisible, onTooltipShow, onTooltipHide,
}: {
  label: string;
  value: string;
  valueColor: string;
  tooltip?: React.ReactNode;
  tooltipVisible?: boolean;
  onTooltipShow?: () => void;
  onTooltipHide?: () => void;
}) {
  return (
    <div className="relative">
      <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-black/45 font-['Inter:Semi_Bold',sans-serif] flex items-center gap-[4px]">
        {label}
        {tooltip && (
          <button
            type="button"
            onMouseEnter={onTooltipShow}
            onMouseLeave={onTooltipHide}
            className="text-black/30 hover:text-black/60 transition-colors"
            aria-label="How this is calculated"
          >
            <Info size={11} />
          </button>
        )}
      </p>
      <p className="mt-[3px] text-[16px] font-bold font-['Inter:Bold',sans-serif]" style={{ color: valueColor }}>
        {value}
      </p>
      {tooltip && tooltipVisible && (
        <div className="absolute left-0 top-full mt-[6px] z-10 w-[260px] rounded-[10px] bg-[#0a0a0a] text-white text-[11px] font-['Inter:Regular',sans-serif] px-[12px] py-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.25)] leading-[16px]">
          {tooltip}
          <div className="absolute left-[18px] -top-[5px] w-[10px] h-[5px] overflow-hidden">
            <div className="w-[8px] h-[8px] bg-[#0a0a0a] rotate-45 translate-y-[3px] translate-x-[1px]" />
          </div>
        </div>
      )}
    </div>
  );
}
