import {
  Monitor, Eye, Copy, Layers, AlertTriangle, MoreVertical, ImageOff, Megaphone, Check,
} from "lucide-react";
import imgCar from "../../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";
import { PublishingCell } from "../PublishingCell";
import type { PublishedTo } from "../publishPlatforms";
import { PLATFORMS } from "../publishPlatforms";

export type Row = {
  id: number;
  name: string;
  stk: string;
  vin: string;
  price: string;
  date: string;
  age: number;
  mediaScore: number;
  daysToFrontline: number;
  holdCost: number;
  marginPct: number;
  totalMargin: number;
  smartMatch?: boolean;
  isLoss?: boolean;
  lossPerDay?: number;
  /** Demo 2 — raw-media state. "raw" = pre-processing badge, "processed" = studio-ready. */
  mediaState?: "raw" | "processed";
  /** Demo 2 — vehicle has no photos yet; renders placeholder thumbnail. */
  noPhoto?: boolean;
  /** Demo 2 — after SmartMatch, the row carries this badge in addition to media state. */
  smartMatched?: boolean;
  /** Demo 2 — platform IDs the vehicle has been syndicated to (small logo strip). */
  syndicatedTo?: string[];
  /** Demo 2 — campaign launched on this vehicle. */
  campaignActive?: boolean;
  /** Demo 2 — optional thumbnail override (used when raw → processed swaps imagery). */
  thumbnailUrl?: string;
};

export function VehicleRow({
  row, published, selected, onToggle, spotlit, onOpen, transforming,
}: {
  row: Row;
  published: PublishedTo[];
  selected: boolean;
  onToggle: () => void;
  spotlit?: boolean;
  onOpen?: () => void;
  /** Demo 2 — row is actively transforming (shimmer overlay + slight scale). */
  transforming?: boolean;
}) {
  const ageClass = row.isLoss ? "text-[#EF4444]" : "text-[#374151]";
  const thumb = row.thumbnailUrl ?? imgCar;
  const syndicatedPlatforms = row.syndicatedTo?.length
    ? PLATFORMS.filter((p) => row.syndicatedTo!.includes(p.id)).slice(0, 4)
    : [];

  return (
    <tr
      onClick={onOpen}
      data-vehicle-id={row.id}
      data-transforming={transforming ? "true" : undefined}
      className={`relative border-b border-black/5 transition-colors cursor-pointer ${
        transforming
          ? "demo2-transforming-row"
          : spotlit
            ? "siri-row-glow bg-[rgba(127,106,242,0.06)]"
            : selected
              ? "bg-[rgba(70,0,242,0.04)]"
              : row.isLoss ? "bg-[#FEF2F2]/40 hover:bg-[#FEF2F2]" : "hover:bg-[#FAFAFB]"
      }`}
    >
      <td className="pl-4 pr-2 py-3 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-300 accent-[#4600f2] cursor-pointer"
        />
      </td>
      {/* Vehicle */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          {row.noPhoto ? (
            <div className="w-[68px] h-[48px] rounded-[6px] bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
              <ImageOff size={18} strokeWidth={2} />
            </div>
          ) : (
            <img
              src={thumb}
              alt=""
              className="w-[68px] h-[48px] object-cover rounded-[6px] bg-gray-100"
            />
          )}
          <div>
            <p className="text-[13px] font-semibold text-[#111] font-['Inter:Semi_Bold',sans-serif]">
              {row.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#6B7280]">{row.stk}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span className="text-[11px] text-[#6B7280]">{row.vin}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[12px] text-[#374151] mt-0.5 font-medium">{row.price}</p>
          </div>
        </div>
      </td>
      {/* Age */}
      <td className="py-3 pr-4 whitespace-nowrap">
        <p className={`text-[13px] font-semibold ${ageClass}`}>
          {row.age} days
          {row.isLoss && (
            <AlertTriangle size={11} className="inline-block ml-[4px] -mt-[2px] text-[#EF4444]" />
          )}
        </p>
        <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-['Inter:Regular',sans-serif]">{row.date}</p>
      </td>
      {/* Media */}
      <td className="py-3 pr-4">
        <div className="flex flex-col items-start gap-[4px]">
          <div className="flex items-center gap-1">
            {[Monitor, Eye, Copy].map((Icon, i) => (
              <button key={i} className="p-1 rounded hover:bg-gray-100 text-[#9CA3AF]">
                <Icon size={15} />
              </button>
            ))}
          </div>
          {/* Demo 2 state badges */}
          {row.mediaState === "raw" && (
            <span className="inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold uppercase tracking-[0.5px] bg-[#FEF3C7] text-[#92400E]">
              Raw
            </span>
          )}
          {row.mediaState === "processed" && (
            <span className="demo2-badge-pop inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold uppercase tracking-[0.5px] bg-[rgba(16,185,129,0.12)] text-[#059669]">
              <Check size={9} strokeWidth={3} />
              Processed
            </span>
          )}
          {row.smartMatched && (
            <span className="demo2-badge-pop smart-match-badge siri-shimmer-bg inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold text-white font-['Inter:Bold',sans-serif] uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(127,106,242,0.35)]">
              <Layers size={9} strokeWidth={2.8} />
              SmartMatched
            </span>
          )}
          {/* Demo 1 spotlight badge — preserved */}
          {row.smartMatch && !row.smartMatched && (
            <span className="smart-match-badge siri-shimmer-bg inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold text-white font-['Inter:Bold',sans-serif] uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(127,106,242,0.35)]">
              <Layers size={9} strokeWidth={2.8} />
              Smart Match
            </span>
          )}
          {row.campaignActive && (
            <span className="demo2-badge-pop inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold uppercase tracking-[0.5px] bg-[rgba(70,0,242,0.1)] text-[#4600F2]">
              <Megaphone size={9} strokeWidth={2.8} />
              Campaign Live
            </span>
          )}
        </div>
      </td>
      {/* Media Score */}
      <td className="py-3 pr-4">
        <span className="text-[14px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif]">
          {row.mediaScore.toFixed(1)}
        </span>
      </td>
      {/* Publishing */}
      <td className="py-3 pr-4">
        {syndicatedPlatforms.length > 0 ? (
          <div className="flex items-center gap-[4px]">
            {syndicatedPlatforms.map((p, i) => (
              <span
                key={p.id}
                title={p.name}
                className="demo2-badge-pop size-[22px] rounded-[5px] flex items-center justify-center text-[9px] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                style={{
                  background: p.bg,
                  color: p.fg,
                  fontStyle: p.italic ? "italic" : undefined,
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {p.glyph}
              </span>
            ))}
            {(row.syndicatedTo?.length ?? 0) > syndicatedPlatforms.length && (
              <span className="text-[10px] font-semibold text-black/55">
                +{(row.syndicatedTo!.length) - syndicatedPlatforms.length}
              </span>
            )}
          </div>
        ) : (
          <PublishingCell published={published} />
        )}
      </td>
      {/* Days to Frontline */}
      <td className="py-3 pr-4 text-[13px] font-semibold whitespace-nowrap">
        {row.isLoss ? (
          <span className="text-[#9CA3AF]">—</span>
        ) : (
          <span className="text-[#10B981]">{row.daysToFrontline} days</span>
        )}
      </td>
      {/* Hold Cost */}
      <td className="py-3 pr-2">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <span className={`text-[13px] font-bold inline-flex items-center gap-[4px] ${
              row.isLoss ? "text-[#EF4444]" : "text-[#111]"
            }`}>
              ${row.holdCost.toLocaleString()}
              {row.isLoss && <AlertTriangle size={12} strokeWidth={2.5} />}
            </span>
            <div className="mt-1 w-[100px] h-[4px] rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.marginPct}%`,
                  backgroundColor: row.isLoss ? "#EF4444" : "#10B981",
                }}
              />
            </div>
            <p className={`text-[10px] mt-0.5 ${row.isLoss ? "text-[#EF4444] font-semibold" : "text-[#9CA3AF]"}`}>
              {row.isLoss
                ? `-$${row.lossPerDay}/day loss`
                : `${row.marginPct}% of $${row.totalMargin.toLocaleString()} margin`}
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
            <MoreVertical size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ColHeader({ label }: { label: string }) {
  return (
    <th className="py-3 pr-4 text-left text-[12px] font-medium text-[#6B7280] whitespace-nowrap font-['Inter:Medium',sans-serif]">
      <span className="flex items-center gap-1">{label}</span>
    </th>
  );
}
