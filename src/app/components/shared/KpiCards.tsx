import type React from "react";

export function MiniBars({ heights = [50, 70, 45, 80, 35, 65, 55, 75], color = "#CBD5E1" }: {
  heights?: number[];
  color?: string;
}) {
  return (
    <div className="flex items-end gap-[3px] h-[36px]">
      {heights.map((h, i) => (
        <div key={i} className="w-[5px] rounded-sm" style={{ height: `${h}%`, backgroundColor: color }} />
      ))}
    </div>
  );
}

export function SummaryCard({
  label, value, suffix, accent, right, valueColor,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  accent: string;
  right?: React.ReactNode;
  /** Override the value text color (defaults to near-black) */
  valueColor?: string;
}) {
  return (
    <div className="flex-1 rounded-[14px] border border-black/8 bg-white px-[20px] py-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between gap-[10px]">
        <div>
          <div className="flex items-center gap-[6px]">
            <span className="size-[8px] rounded-full" style={{ backgroundColor: accent }} />
            <p className="text-[12px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif] uppercase tracking-[0.3px]">
              {label}
            </p>
          </div>
          <div className="mt-[8px] flex items-baseline gap-[6px]">
            <span
              className="text-[28px] font-bold font-['Inter:Bold',sans-serif] leading-none"
              style={{ color: valueColor ?? "#0a0a0a" }}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-[14px] text-black/55 font-medium">{suffix}</span>
            )}
          </div>
        </div>
        {right}
      </div>
    </div>
  );
}

export function ActionRequiredCard({
  label, value, icon, color, active, onClick, completed,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  /** Demo 2 — clickable bucket states */
  active?: boolean;
  onClick?: () => void;
  completed?: boolean;
}) {
  const clickable = typeof onClick === "function";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`flex-1 rounded-[12px] border bg-white px-[14px] py-[12px] flex items-center gap-[12px] text-left transition-all ${
        clickable ? "cursor-pointer hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]" : "cursor-default"
      } ${
        active
          ? "border-[#4600F2] shadow-[0_0_0_3px_rgba(70,0,242,0.12)]"
          : completed
            ? "border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.04)]"
            : "border-black/8"
      }`}
    >
      <div
        className="size-[36px] rounded-[10px] flex items-center justify-center shrink-0"
        style={{
          background: completed ? "rgba(16,185,129,0.12)" : `${color}1A`,
          color: completed ? "#059669" : color,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
          {label}
        </p>
        <p className="text-[12px] text-black/45 font-['Inter:Regular',sans-serif] mt-[1px]">
          {completed ? "Resolved" : `${value} vehicles`}
        </p>
      </div>
    </button>
  );
}
