import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ChevronDown, Plus, Sparkles, Filter, Download, Eye, MoreVertical,
  Monitor, Copy, Layers, Image as ImageIcon, AlertCircle, AlertTriangle, Camera,
  CircleDot,
} from "lucide-react";
import imgCar from "../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";
import { AppHeader, AppSidebar } from "./AppShell";
import {
  TransformationSummaryModal,
  TransformationSummaryWidget,
} from "./TransformationSummaryModal";
import { PublishModal } from "./PublishModal";
import { PublishingProgressModal } from "./PublishingProgressModal";
import { PublishedSummaryModal } from "./PublishedSummaryModal";
import { PublishingCell } from "./PublishingCell";
import { SelectionActionBar } from "./SelectionActionBar";
import { SmartCampaignModal } from "./SmartCampaignModal";
import { SmartMatchSpotlight } from "./SmartMatchSpotlight";
import { NeedActionsWidget, NeedActionsButton } from "./NeedActionsWidget";
import type { PublishedTo } from "./publishPlatforms";

// ─── Atomic pieces ────────────────────────────────────────────────────────────

function Tab({ label, count, active }: { label: string; count?: number; active?: boolean }) {
  return (
    <button
      type="button"
      className={`relative pb-[10px] pt-[2px] text-[13px] font-['Inter:Semi_Bold',sans-serif] transition-colors ${
        active ? "text-[#4600F2] font-semibold" : "text-black/55 hover:text-[#0a0a0a] font-medium"
      }`}
    >
      <span className="inline-flex items-center gap-[6px]">
        {label}
        {typeof count === "number" && (
          <span
            className={`text-[11px] px-[6px] py-[1px] rounded-full font-semibold ${
              active ? "bg-[rgba(70,0,242,0.1)] text-[#4600F2]" : "bg-black/5 text-black/55"
            }`}
          >
            {count}
          </span>
        )}
      </span>
      {active && (
        <span className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] rounded-full bg-[#4600F2]" />
      )}
    </button>
  );
}

function MiniBars() {
  // Small bar chart visual (8 bars, alternating heights)
  const heights = [50, 70, 45, 80, 35, 65, 55, 75];
  return (
    <div className="flex items-end gap-[3px] h-[36px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[5px] rounded-sm bg-[#CBD5E1]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function SummaryCard({
  label, value, suffix, accent, right,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent: string;
  right?: React.ReactNode;
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
            <span className="text-[28px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-none">
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

function ActionRequiredCard({
  label, value, icon, color,
}: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex-1 rounded-[12px] border border-black/8 bg-white px-[14px] py-[12px] flex items-center gap-[12px]">
      <div
        className="size-[36px] rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: `${color}1A`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">
          {label}
        </p>
        <p className="text-[12px] text-black/45 font-['Inter:Regular',sans-serif] mt-[1px]">
          {value} vehicles
        </p>
      </div>
    </div>
  );
}

function FilterChip({
  label, count, active, pulse, onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  /** When true, chip gets a red pulsing ring to draw attention */
  pulse?: boolean;
  onClick?: () => void;
}) {
  const ringRef = useRef<HTMLSpanElement>(null);

  // GSAP-driven pulsing red ring (used to nudge the user toward "Age >40/>60 days")
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

// ─── Vehicle rows ────────────────────────────────────────────────────────────

type Row = {
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
  /** Aged / loss-leader vehicles — render red holding cost + alert icon */
  isLoss?: boolean;
  /** Loss in dollars/day (rendered as "-$X loss" caption) */
  lossPerDay?: number;
};

const rows: Row[] = [
  {
    id: 1,
    name: "2021 Ford Mustang GT Premium",
    stk: "STK-2107",
    vin: "VIN1234567889000",
    price: "$22,000",
    date: "12 July '25, 12:30 PM",
    age: 24,
    mediaScore: 9.8,
    daysToFrontline: 2,
    holdCost: 229,
    marginPct: 12,
    totalMargin: 4500,
    smartMatch: true,
  },
  {
    id: 2,
    name: "2021 Ford Mustang GT Premium",
    stk: "STK-2107",
    vin: "VIN1234567889000",
    price: "$22,000",
    date: "12 July '25, 12:30 PM",
    age: 24,
    mediaScore: 9.8,
    daysToFrontline: 2,
    holdCost: 229,
    marginPct: 12,
    totalMargin: 4500,
  },
  {
    id: 3,
    name: "2020 Ford F-150 XLT",
    stk: "STK-2210",
    vin: "VIN9876543211000",
    price: "$35,000",
    date: "12 July '25, 01:15 PM",
    age: 12,
    mediaScore: 9.5,
    daysToFrontline: 1,
    holdCost: 189,
    marginPct: 18,
    totalMargin: 6200,
    smartMatch: true,
  },
  {
    id: 4,
    name: "2022 Chevrolet Silverado LT",
    stk: "STK-2113",
    vin: "VIN5678901234000",
    price: "$42,000",
    date: "12 July '25, 01:45 PM",
    age: 8,
    mediaScore: 9.4,
    daysToFrontline: 1,
    holdCost: 159,
    marginPct: 22,
    totalMargin: 8500,
  },
  {
    id: 5,
    name: "2021 Toyota Camry SE",
    stk: "STK-2114",
    vin: "VIN2345678901000",
    price: "$28,500",
    date: "12 July '25, 02:00 PM",
    age: 15,
    mediaScore: 9.2,
    daysToFrontline: 3,
    holdCost: 189,
    marginPct: 28,
    totalMargin: 3800,
  },
  // ── Aged inventory — high holding cost, bleeding margin ─────────────────────
  {
    id: 6,
    name: "2018 Chevrolet Malibu LT",
    stk: "STK-1908",
    vin: "VIN3344556677001",
    price: "$16,200",
    date: "29 May '25, 09:10 AM",
    age: 45,
    mediaScore: 7.8,
    daysToFrontline: 0,
    holdCost: 1029,
    marginPct: 100,
    totalMargin: 2200,
    isLoss: true,
    lossPerDay: 45,
  },
  {
    id: 7,
    name: "2017 Honda Civic EX-T",
    stk: "STK-1845",
    vin: "VIN9988776655002",
    price: "$13,800",
    date: "20 May '25, 11:25 AM",
    age: 52,
    mediaScore: 7.4,
    daysToFrontline: 0,
    holdCost: 1280,
    marginPct: 100,
    totalMargin: 1900,
    isLoss: true,
    lossPerDay: 72,
  },
  {
    id: 8,
    name: "2017 Nissan Altima SV",
    stk: "STK-1820",
    vin: "VIN5544332211003",
    price: "$12,400",
    date: "06 May '25, 02:40 PM",
    age: 68,
    mediaScore: 6.9,
    daysToFrontline: 0,
    holdCost: 1894,
    marginPct: 100,
    totalMargin: 1700,
    isLoss: true,
    lossPerDay: 168,
  },
  {
    id: 9,
    name: "2016 Ford Focus SE",
    stk: "STK-1715",
    vin: "VIN1122334455004",
    price: "$9,900",
    date: "29 Apr '25, 10:05 AM",
    age: 75,
    mediaScore: 6.5,
    daysToFrontline: 0,
    holdCost: 2150,
    marginPct: 100,
    totalMargin: 1400,
    isLoss: true,
    lossPerDay: 240,
  },
];

function VehicleRow({
  row, published, selected, onToggle, spotlit,
}: {
  row: Row;
  published: PublishedTo[];
  selected: boolean;
  onToggle: () => void;
  spotlit?: boolean;
}) {
  const ageClass = row.isLoss
    ? "text-[#EF4444]"
    : "text-[#374151]";
  return (
    <tr
      className={`border-b border-black/5 transition-colors ${
        spotlit
          ? "siri-row-glow bg-[rgba(127,106,242,0.06)]"
          : selected
            ? "bg-[rgba(70,0,242,0.04)]"
            : row.isLoss ? "bg-[#FEF2F2]/40 hover:bg-[#FEF2F2]" : "hover:bg-[#FAFAFB]"
      }`}
    >
      <td className="pl-4 pr-2 py-3 w-10">
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
          <img
            src={imgCar}
            alt=""
            className="w-[68px] h-[48px] object-cover rounded-[6px] bg-gray-100"
          />
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
      {/* Age — now also carries the date */}
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
          {row.smartMatch && (
            <span className="smart-match-badge siri-shimmer-bg inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded-full text-[9px] font-bold text-white font-['Inter:Bold',sans-serif] uppercase tracking-[0.5px] shadow-[0_2px_8px_rgba(127,106,242,0.35)]">
              <Layers size={9} strokeWidth={2.8} />
              Smart Match
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
        <PublishingCell published={published} />
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

function ColHeader({ label }: { label: string }) {
  return (
    <th className="py-3 pr-4 text-left text-[12px] font-medium text-[#6B7280] whitespace-nowrap font-['Inter:Medium',sans-serif]">
      <span className="flex items-center gap-1">{label}</span>
    </th>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────

const SUMMARY_TOTAL_FIXED = 67 + 70 + 96; // raw + smartMatch + cgi

interface DashboardScreenProps {
  benchmarks?: { daysToFrontline: number; holdingCostPerDay: number };
  onNavigate?: (label: string) => void;
}

export function DashboardScreen({
  benchmarks = { daysToFrontline: 50, holdingCostPerDay: 40 },
  onNavigate,
}: DashboardScreenProps = {}) {
  // Derived demo numbers, calibrated from the dealer's inputs
  // Smart Match collapses frontline cycle to ~1 day; publishing keeps it there.
  const daysAfterSmartMatch = 1;
  const daysAfterPublish = 1;
  const daysSavedTransform = Math.round((benchmarks.daysToFrontline - daysAfterSmartMatch) * 10) / 10;
  const containerRef = useRef<HTMLDivElement>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  type PubPhase = "none" | "select" | "progress" | "recap";
  const [pubPhase, setPubPhase] = useState<PubPhase>("none");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [published, setPublished] = useState<PublishedTo[]>([]);
  type AgeFilter = "all" | "lt40" | "gt40" | "gt60";
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");

  const visibleRows = rows.filter((r) => {
    if (ageFilter === "lt40") return r.age < 40;
    if (ageFilter === "gt40") return r.age > 40;
    if (ageFilter === "gt60") return r.age > 60;
    return true;
  });
  const countGt40 = rows.filter((r) => r.age > 40).length;
  const countGt60 = rows.filter((r) => r.age > 60).length;

  // Row selection — auto-fills when an aged filter is applied
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [barDismissed, setBarDismissed] = useState(false);

  useEffect(() => {
    if (ageFilter === "gt40" || ageFilter === "gt60") {
      setSelectedIds(new Set(visibleRows.map((r) => r.id)));
      setBarDismissed(false);
    } else {
      setSelectedIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ageFilter]);

  const toggleRow = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const dismissBar = () => {
    setBarDismissed(true);
    setSelectedIds(new Set());
  };

  const barOpen = !barDismissed && selectedIds.size > 0;

  // Smart Campaign modal — opens from the action bar CTA
  const [campaignOpen, setCampaignOpen] = useState(false);

  // Need Actions widget — toggled by the red floating button
  const [needActionsOpen, setNeedActionsOpen] = useState(false);

  // One-time Smart Match spotlight — surfaces after the summary modal closes
  const [smartMatchSpotlight, setSmartMatchSpotlight] = useState(false);
  const [smartMatchSeen, setSmartMatchSeen] = useState(false);

  useEffect(() => {
    if (summaryOpen || smartMatchSeen) return;
    const t = setTimeout(() => setSmartMatchSpotlight(true), 600);
    return () => clearTimeout(t);
  }, [summaryOpen, smartMatchSeen]);

  // Stage 1: user picks platforms in the publish modal
  const handlePublishSubmit = (ids: string[]) => {
    setSelectedPlatforms(ids);
    setPubPhase("progress");
  };
  // Stage 2: progress modal completes → mark the table as published, show recap
  const handleProgressComplete = () => {
    const now = new Date().toISOString();
    setPublished(selectedPlatforms.map((id) => ({ platformId: id, publishedAt: now })));
    setPubPhase("recap");
  };

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-fade]");
    if (!items.length) return;
    gsap.fromTo(
      items,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="bg-white flex flex-col size-full">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar active="Studio AI" onNavigate={onNavigate} />
        <div ref={containerRef} className="flex-1 bg-[#f9fafb] overflow-auto">
          <div className="px-[28px] py-[20px] min-w-[1100px]">
            {/* Page header */}
            <div data-fade className="flex items-start justify-between mb-[16px]">
              <div>
                <h1 className="text-[24px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] leading-tight">
                  Merchandising
                </h1>
                <p className="text-[13px] text-[#6B7280] mt-[2px] font-['Inter:Regular',sans-serif]">
                  See what needs your attention
                </p>
              </div>
              <div className="flex items-center gap-[10px]">
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-black/10 rounded-[8px] text-[12px] font-medium text-[#374151] hover:bg-gray-50 font-['Inter:Medium',sans-serif]">
                  Holding Cost: <span className="text-[#4600f2] font-semibold">$45/day</span>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-white border border-[#4600F2] rounded-[8px] text-[12px] font-semibold text-[#4600F2] hover:bg-[rgba(70,0,242,0.04)] font-['Inter:Semi_Bold',sans-serif]">
                  <Sparkles size={13} />
                  Create SmartCampaign
                </button>
                <button className="flex items-center gap-[6px] h-[36px] px-[14px] bg-[#4600F2] rounded-[8px] text-[12px] font-semibold text-white hover:bg-[#3a00d0] font-['Inter:Semi_Bold',sans-serif]">
                  <Plus size={14} strokeWidth={2.5} />
                  Add New Inventory
                </button>
              </div>
            </div>

            {/* Tabs row + last-synced */}
            <div data-fade className="flex items-end justify-between border-b border-black/8 mb-[18px]">
              <div className="flex items-center gap-[24px] -mb-[1px]">
                <Tab label="All vehicles" />
                <Tab label="New Vehicles" count={90} active />
                <Tab label="Pre-owned Vehicles" count={108} />
              </div>
              <div className="flex items-center gap-[6px] pb-[10px]">
                <span className="size-[6px] rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-[11px] text-[#0a0a0a] font-semibold font-['Inter:Semi_Bold',sans-serif]">
                  Last Synced:
                </span>
                <span className="text-[11px] text-black/55 font-['Inter:Medium',sans-serif] font-medium">
                  Today, 6:35 PM
                </span>
              </div>
            </div>

            {/* Summary cards */}
            <div data-fade className="flex gap-[14px] mb-[16px]">
              <SummaryCard
                label="Days to frontline"
                value="12"
                suffix="days"
                accent="#4600F2"
                right={<MiniBars />}
              />
              <SummaryCard
                label="Media Score"
                value="7.9"
                accent="#10B981"
                right={
                  <p className="text-[11px] text-black/45 font-['Inter:Regular',sans-serif] text-right">
                    Last synced<br />an hour ago
                  </p>
                }
              />
            </div>

            {/* Action Required */}
            <div data-fade className="mb-[16px]">
              <p className="text-[12px] font-semibold text-[#0a0a0a] mb-[8px] font-['Inter:Semi_Bold',sans-serif]">
                Action Required
              </p>
              <div className="flex gap-[12px]">
                <ActionRequiredCard
                  label="No Photos"
                  value={0}
                  color="#EF4444"
                  icon={<AlertCircle size={16} />}
                />
                <ActionRequiredCard
                  label="CGI Photos"
                  value={0}
                  color="#F59E0B"
                  icon={<ImageIcon size={16} />}
                />
                <ActionRequiredCard
                  label="Raw Photos"
                  value={0}
                  color="#4600F2"
                  icon={<Camera size={16} />}
                />
              </div>
            </div>

            {/* Filter chips */}
            <div data-fade className="flex items-center justify-between mb-[12px]">
              <div className="flex items-center gap-[8px] flex-wrap">
                <FilterChip label="Wholesale" count={8} />
                <FilterChip label="Retail" count={82} />
                <FilterChip label="Recents" count={12} />
                <FilterChip
                  label="Age <40 days"
                  count={64}
                  active={ageFilter === "lt40"}
                  onClick={() => setAgeFilter(ageFilter === "lt40" ? "all" : "lt40")}
                />
                <FilterChip
                  label="Age >40 days"
                  count={countGt40}
                  active={ageFilter === "gt40"}
                  pulse
                  onClick={() => setAgeFilter(ageFilter === "gt40" ? "all" : "gt40")}
                />
                <FilterChip
                  label="Age >60 days"
                  count={countGt60}
                  active={ageFilter === "gt60"}
                  pulse
                  onClick={() => setAgeFilter(ageFilter === "gt60" ? "all" : "gt60")}
                />
              </div>
              <div className="flex items-center gap-[8px]">
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Eye size={13} /> View Input
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Download size={13} /> Export
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <Filter size={13} /> Filters
                </button>
                <button className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[8px] bg-white border border-black/10 text-[12px] font-medium text-black/70 hover:bg-[#fafafa]">
                  <CircleDot size={13} /> Sold
                </button>
              </div>
            </div>

            {/* Vehicle table */}
            <div data-fade className="bg-white rounded-[14px] border border-black/8 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/8 bg-[#F4F0FF]">
                    <th className="pl-4 pr-2 py-3 w-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#4600f2]" />
                    </th>
                    <ColHeader label="Vehicle" />
                    <ColHeader label="Age" />
                    <ColHeader label="Media" />
                    <ColHeader label="Media Score" />
                    <ColHeader label="Publishing" />
                    <ColHeader label="Days to Frontline" />
                    <ColHeader label="Hold. Cost" />
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const firstSmartMatchId = visibleRows.find((r) => r.smartMatch)?.id;
                    return visibleRows.map((r) => (
                      <VehicleRow
                        key={r.id}
                        row={r}
                        published={published}
                        selected={selectedIds.has(r.id)}
                        onToggle={() => toggleRow(r.id)}
                        spotlit={smartMatchSpotlight && r.id === firstSmartMatchId}
                      />
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floating "Need actions" pill (bottom-right, red) — hidden while widget is open */}
          {!needActionsOpen && (
            <div className="fixed bottom-[24px] right-[24px] z-30">
              <NeedActionsButton count={12} onClick={() => setNeedActionsOpen(true)} />
            </div>
          )}
        </div>
      </div>

      {/* Selection action bar — auto-opens when aged filters select rows */}
      <SelectionActionBar
        open={barOpen}
        count={selectedIds.size}
        onClose={dismissBar}
        onSmartCampaign={() => setCampaignOpen(true)}
      />
      <SmartCampaignModal
        open={campaignOpen}
        selectedCount={selectedIds.size}
        onClose={() => setCampaignOpen(false)}
      />

      <SmartMatchSpotlight
        open={smartMatchSpotlight}
        published={published.length > 0}
        onDismiss={() => { setSmartMatchSpotlight(false); setSmartMatchSeen(true); }}
      />

      {/* Need Actions widget — toggled by the red floating button */}
      <NeedActionsWidget
        open={needActionsOpen}
        count={12}
        noPhotos={4}
        noHeroAngle={8}
        onMinimize={() => setNeedActionsOpen(false)}
        onIssueClick={() => {
          // Surface aged inventory in the table
          setNeedActionsOpen(false);
          setAgeFilter("gt40");
        }}
        onRunCampaign={() => {
          // Drives the existing >60-day flow: filters table, selects rows, opens action bar
          setNeedActionsOpen(false);
          setAgeFilter("gt60");
        }}
      />

      {/* Transformation summary — auto-opens on dashboard load; X minimizes to widget */}
      <TransformationSummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        onPublish={() => { setSummaryOpen(false); setPubPhase("select"); }}
        summary={{
          rawTransformed: 67,
          rawTotal: 67,
          smartMatched: 70,
          noPhotoTotal: 90,
          cgiUpgraded: 96,
          cgiTotal: 134,
          totalInventory: 234,
          scoreBefore: 2.8,
          scoreAfter: 7.9,
          daysSaved: daysSavedTransform,
          holdingPerDay: benchmarks.holdingCostPerDay,
        }}
      />
      <TransformationSummaryWidget
        open={!summaryOpen && pubPhase === "none"}
        totalFixed={SUMMARY_TOTAL_FIXED}
        onClick={() => setSummaryOpen(true)}
      />

      {/* Publish flow */}
      <PublishModal
        open={pubPhase === "select"}
        totalListings={SUMMARY_TOTAL_FIXED}
        onClose={() => setPubPhase("none")}
        onPublish={handlePublishSubmit}
      />
      <PublishingProgressModal
        open={pubPhase === "progress"}
        platformIds={selectedPlatforms}
        totalListings={SUMMARY_TOTAL_FIXED}
        daysBefore={daysAfterSmartMatch}
        daysAfter={daysAfterPublish}
        durationMs={4800}
        onComplete={handleProgressComplete}
      />
      <PublishedSummaryModal
        open={pubPhase === "recap"}
        platformIds={selectedPlatforms}
        totalListings={SUMMARY_TOTAL_FIXED}
        daysAfter={daysAfterPublish}
        daysBaseline={benchmarks.daysToFrontline}
        onClose={() => setPubPhase("none")}
      />
    </div>
  );
}
