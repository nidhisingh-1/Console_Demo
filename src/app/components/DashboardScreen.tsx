import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ChevronDown, Plus, Sparkles, Filter, Download, Eye,
  Image as ImageIcon, AlertCircle, Camera, CircleDot,
} from "lucide-react";
import { AppHeader, AppSidebar } from "./AppShell";
import {
  TransformationSummaryModal,
  TransformationSummaryWidget,
} from "./TransformationSummaryModal";
import { PublishModal } from "./PublishModal";
import { PublishingProgressModal } from "./PublishingProgressModal";
import { PublishedSummaryModal } from "./PublishedSummaryModal";
import { SyndicationPitchModal } from "./SyndicationPitchModal";
import { SelectionActionBar } from "./SelectionActionBar";
import { SmartCampaignModal } from "./SmartCampaignModal";
import { SmartMatchSpotlight } from "./SmartMatchSpotlight";
import { NeedActionsWidget, NeedActionsButton } from "./NeedActionsWidget";
import type { PublishedTo } from "./publishPlatforms";
import { VehicleRow, ColHeader, type Row } from "./shared/VehicleRow";
import { FilterChip } from "./shared/FilterChip";
import { SummaryCard, MiniBars, ActionRequiredCard } from "./shared/KpiCards";

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

// ─── Vehicle rows ────────────────────────────────────────────────────────────

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

// ─── Main dashboard ──────────────────────────────────────────────────────────

const SUMMARY_TOTAL_FIXED = 67 + 70 + 96; // raw + smartMatch + cgi

interface DashboardScreenProps {
  benchmarks?: { daysToFrontline: number; holdingCostPerDay: number };
  onNavigate?: (label: string) => void;
  onRowClick?: (vehicle: { id: number; name: string; stk: string; vin: string; trim?: string; smartMatch?: boolean }) => void;
}

export function DashboardScreen({
  benchmarks = { daysToFrontline: 50, holdingCostPerDay: 40 },
  onNavigate,
  onRowClick,
}: DashboardScreenProps = {}) {
  // Derived demo numbers, calibrated from the dealer's inputs
  // Smart Match collapses frontline cycle to ~1 day; publishing keeps it there.
  const daysAfterSmartMatch = 1;
  const daysAfterPublish = 1;
  const daysSavedTransform = Math.round((benchmarks.daysToFrontline - daysAfterSmartMatch) * 10) / 10;
  const containerRef = useRef<HTMLDivElement>(null);
  const [summaryOpen, setSummaryOpen] = useState(true);
  type PubPhase = "none" | "syndicationPitch" | "select" | "progress" | "recap";
  const [pubPhase, setPubPhase] = useState<PubPhase>("none");
  const [syndicationSeen, setSyndicationSeen] = useState(false);
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
                        onOpen={() => onRowClick?.({
                          id: r.id,
                          name: r.name,
                          stk: r.stk,
                          vin: r.vin,
                          smartMatch: r.smartMatch,
                        })}
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
        onPublish={() => {
          setSummaryOpen(false);
          // First time we get to publishing, show the syndication pitch; afterwards skip to channel pick
          setPubPhase(syndicationSeen ? "select" : "syndicationPitch");
        }}
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
      <SyndicationPitchModal
        open={pubPhase === "syndicationPitch"}
        completed={syndicationSeen}
        totalListings={SUMMARY_TOTAL_FIXED}
        onClose={() => setPubPhase("none")}
        onBack={() => { setPubPhase("none"); setSummaryOpen(true); }}
        onContinue={() => { setSyndicationSeen(true); setPubPhase("select"); }}
      />
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
