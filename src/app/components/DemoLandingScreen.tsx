import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Sparkles, ArrowRight, Plus, Search, Clock, TrendingUp,
  Building2, ChevronRight, Calendar, MoreHorizontal,
  LayoutGrid, List, X, FileText, Play,
} from "lucide-react";
import { SpyneMark } from "./AppShell";

// ─── Data shape ────────────────────────────────────────────────────────────

export interface DiscoveryAnswers {
  imsProvider: string;
  rooftops: string;
  daysToLive: string;
  publishingPlatforms: string;
  photographySource: string;
  daysOnLot: string;
  monthlyPhotoSpend: string;
  mediaFormats: string;
  bottlenecks: string;
}

export interface PastDemo {
  id: string;
  dealershipName: string;
  imsProvider: string;
  rooftops: string;
  inventory: number;
  monthlySales: number;
  monthlyOpportunity: number;
  takenOn: string; // ISO date
  painPoints: string[];
  notes?: string;
  answers: DiscoveryAnswers;
}

const DISCOVERY_QUESTIONS: Array<{ key: keyof DiscoveryAnswers; q: string }> = [
  { key: "imsProvider",         q: "Which IMS are you currently integrated with?" },
  { key: "rooftops",            q: "How many rooftops do you operate?" },
  { key: "daysToLive",          q: "How long does it take to get a vehicle from trade-in to live online today?" },
  { key: "publishingPlatforms", q: "Which platforms do you currently publish listings to?" },
  { key: "photographySource",   q: "Do you have an in-house photographer or use a third party?" },
  { key: "daysOnLot",           q: "What is your current average days-on-lot?" },
  { key: "monthlyPhotoSpend",   q: "What does your current photography spend look like per month?" },
  { key: "mediaFormats",        q: "What types of media are you producing today — photos, 360s, video?" },
  { key: "bottlenecks",         q: "What are the biggest bottlenecks in your current media workflow?" },
];

const SAMPLE_DEMOS: PastDemo[] = [
  {
    id: "d1",
    dealershipName: "Valley Toyota",
    imsProvider: "vAuto",
    rooftops: "4-7",
    inventory: 840,
    monthlySales: 220,
    monthlyOpportunity: 84300,
    takenOn: "2026-05-22",
    painPoints: ["Slow to go live", "Inconsistent quality", "Multi-rooftop consistency"],
    notes: "Frontline gap is the #1 ask — GM wants 24-hr trade to live.",
    answers: {
      imsProvider: "vAuto",
      rooftops: "5 rooftops across Sacramento metro",
      daysToLive: "7–9 days from acquisition to listing",
      publishingPlatforms: "AutoTrader, Cars.com, dealer site, Facebook Marketplace",
      photographySource: "Third-party vendor (in-house backup)",
      daysOnLot: "52 days average",
      monthlyPhotoSpend: "$18K-$22K / month",
      mediaFormats: "Still photos + occasional 360 spins",
      bottlenecks: "Vendor scheduling delays; weather; aged units never reshot",
    },
  },
  {
    id: "d2",
    dealershipName: "Metro Honda of Chicago",
    imsProvider: "VinSolutions",
    rooftops: "2-3",
    inventory: 420,
    monthlySales: 140,
    monthlyOpportunity: 51200,
    takenOn: "2026-05-18",
    painPoints: ["High cost per car", "Low VDP engagement"],
    notes: "Skeptical on AI quality — bring before/after carousel.",
    answers: {
      imsProvider: "VinSolutions",
      rooftops: "3 rooftops in Chicagoland",
      daysToLive: "4–5 days",
      publishingPlatforms: "Cars.com, AutoTrader, OEM site",
      photographySource: "In-house, 1 photographer per store",
      daysOnLot: "38 days",
      monthlyPhotoSpend: "$11K / month",
      mediaFormats: "Photos only",
      bottlenecks: "Photographer bandwidth; manual editing eats afternoons",
    },
  },
  {
    id: "d3",
    dealershipName: "Sunshine Auto Group",
    imsProvider: "DealerSocket",
    rooftops: "8+",
    inventory: 1620,
    monthlySales: 380,
    monthlyOpportunity: 142800,
    takenOn: "2026-05-12",
    painPoints: ["Multi-rooftop consistency", "Slow to go live", "Promotions not showing"],
    notes: "Big multi-rooftop play. CFO wants standardised output across all 9 stores.",
    answers: {
      imsProvider: "DealerSocket",
      rooftops: "9 rooftops across FL and GA",
      daysToLive: "6–10 days, varies by store",
      publishingPlatforms: "AutoTrader, Cars.com, CarGurus, syndication to OEM",
      photographySource: "Mix — 4 stores in-house, 5 using vendors",
      daysOnLot: "47 days",
      monthlyPhotoSpend: "$42K-$50K / month",
      mediaFormats: "Photos + 360 spins on premium new inventory",
      bottlenecks: "Inconsistent backgrounds, vendor QA varies wildly",
    },
  },
  {
    id: "d4",
    dealershipName: "Peak Performance Motors",
    imsProvider: "CDK Global",
    rooftops: "1",
    inventory: 180,
    monthlySales: 60,
    monthlyOpportunity: 23400,
    takenOn: "2026-05-04",
    painPoints: ["High cost per car"],
    notes: "Smaller dealer — price-sensitive. Lead with ROI on cost-per-VIN.",
    answers: {
      imsProvider: "CDK Global",
      rooftops: "Single rooftop, Denver",
      daysToLive: "3–4 days",
      publishingPlatforms: "Cars.com, dealer site",
      photographySource: "Owner shoots most listings personally",
      daysOnLot: "32 days",
      monthlyPhotoSpend: "Under $5K / month",
      mediaFormats: "Still photos only",
      bottlenecks: "Time — owner-operator wears multiple hats",
    },
  },
  {
    id: "d5",
    dealershipName: "Coastal Ford",
    imsProvider: "Reynolds & Reynolds",
    rooftops: "2-3",
    inventory: 560,
    monthlySales: 175,
    monthlyOpportunity: 68900,
    takenOn: "2026-04-29",
    painPoints: ["Low VDP engagement", "Inconsistent quality"],
    notes: "Wants Smart Match for trims; their VDP CTR is below benchmark.",
    answers: {
      imsProvider: "Reynolds & Reynolds",
      rooftops: "3 rooftops, coastal Carolinas",
      daysToLive: "5–7 days",
      publishingPlatforms: "AutoTrader, Cars.com, OEM, Facebook",
      photographySource: "In-house with a vendor for overflow",
      daysOnLot: "41 days",
      monthlyPhotoSpend: "$14K-$18K / month",
      mediaFormats: "Photos + video walkarounds on some pre-owned",
      bottlenecks: "Quality varies between photographer shifts",
    },
  },
  {
    id: "d6",
    dealershipName: "Riverside Chevrolet",
    imsProvider: "Tekion",
    rooftops: "4-7",
    inventory: 940,
    monthlySales: 245,
    monthlyOpportunity: 96400,
    takenOn: "2026-04-21",
    painPoints: ["Slow to go live", "High cost per car"],
    notes: "Tekion-native — show integration depth.",
    answers: {
      imsProvider: "Tekion",
      rooftops: "5 rooftops, southwest US",
      daysToLive: "6 days average",
      publishingPlatforms: "Cars.com, AutoTrader, CarGurus, Tekion-syndicated",
      photographySource: "Vendor at all 5 stores",
      daysOnLot: "44 days",
      monthlyPhotoSpend: "$25K-$30K / month",
      mediaFormats: "Photos + 360 + syndicated to portals",
      bottlenecks: "Vendor lead time; aged units don't get refreshed media",
    },
  },
];

// ─── Demo card (grid view) ─────────────────────────────────────────────────

function DemoCard({
  demo, onClick,
}: {
  demo: PastDemo;
  onClick: () => void;
}) {
  const dateLabel = new Date(demo.takenOn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left bg-white rounded-[16px] border border-black/8 p-[18px] flex flex-col transition-all hover:border-[#4600F2]/40 hover:shadow-[0_10px_28px_rgba(70,0,242,0.10)] hover:-translate-y-[2px]"
    >
      <div className="flex items-start justify-between mb-[14px]">
        <div className="flex items-center gap-[10px] min-w-0">
          <div
            className="size-[36px] rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(70,0,242,0.08)" }}
          >
            <Building2 size={16} strokeWidth={2.2} className="text-[#4600F2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] truncate">
              {demo.dealershipName}
            </p>
            <p className="text-[10px] text-black/45 font-['Inter:Regular',sans-serif] mt-[2px]">
              {demo.imsProvider} · {demo.rooftops} rooftop{demo.rooftops === "1" ? "" : "s"}
            </p>
          </div>
        </div>
        <span
          className="size-[24px] rounded-full flex items-center justify-center text-black/30 group-hover:text-[#4600F2] transition-colors"
          aria-hidden
        >
          <MoreHorizontal size={14} />
        </span>
      </div>

      <div className="flex items-end gap-[14px] mb-[14px]">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[4px] font-['Inter:Bold',sans-serif]">
            Monthly opportunity
          </p>
          <p className="text-[20px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] leading-none">
            ${Math.round(demo.monthlyOpportunity / 1000)}K
            <span className="text-[10px] font-medium text-black/40 ml-[3px]">/mo</span>
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[9px] font-bold uppercase tracking-[0.6px] text-black/40 mb-[4px] font-['Inter:Bold',sans-serif]">
            Inventory
          </p>
          <p className="text-[13px] font-semibold text-black/75 font-['Inter:Semi_Bold',sans-serif] leading-none">
            {demo.inventory} units
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-[12px] border-t border-black/6">
        <span className="inline-flex items-center gap-[4px] text-[10px] text-black/45 font-['Inter:Regular',sans-serif]">
          <Calendar size={11} />
          {dateLabel}
        </span>
        <span className="inline-flex items-center gap-[3px] text-[10px] font-semibold text-[#4600F2] font-['Inter:Semi_Bold',sans-serif] group-hover:translate-x-[2px] transition-transform">
          View summary <ChevronRight size={11} strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}

// ─── Demo row (list view) ──────────────────────────────────────────────────

function DemoRow({
  demo, onClick,
}: {
  demo: PastDemo;
  onClick: () => void;
}) {
  const dateLabel = new Date(demo.takenOn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full bg-white rounded-[12px] border border-black/8 px-[16px] py-[12px] flex items-center gap-[16px] transition-all hover:border-[#4600F2]/40 hover:shadow-[0_6px_18px_rgba(70,0,242,0.08)]"
    >
      <div
        className="size-[36px] rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: "rgba(70,0,242,0.08)" }}
      >
        <Building2 size={16} strokeWidth={2.2} className="text-[#4600F2]" />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-12 items-center gap-[12px]">
        <div className="col-span-4 min-w-0 text-left">
          <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif] truncate">
            {demo.dealershipName}
          </p>
          <p className="text-[10px] text-black/45 font-['Inter:Regular',sans-serif] mt-[1px] truncate">
            {demo.imsProvider} · {demo.rooftops} rooftop{demo.rooftops === "1" ? "" : "s"}
          </p>
        </div>

        <div className="col-span-2 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-black/40 font-['Inter:Bold',sans-serif]">
            Inventory
          </p>
          <p className="text-[12px] font-semibold text-black/75 font-['Inter:Semi_Bold',sans-serif] mt-[1px]">
            {demo.inventory} units
          </p>
        </div>

        <div className="col-span-2 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-black/40 font-['Inter:Bold',sans-serif]">
            Sales/mo
          </p>
          <p className="text-[12px] font-semibold text-black/75 font-['Inter:Semi_Bold',sans-serif] mt-[1px]">
            {demo.monthlySales}
          </p>
        </div>

        <div className="col-span-2 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-black/40 font-['Inter:Bold',sans-serif]">
            Monthly gap
          </p>
          <p className="text-[13px] font-bold text-[#4600F2] font-['Inter:Bold',sans-serif] mt-[1px]">
            ${Math.round(demo.monthlyOpportunity / 1000)}K
          </p>
        </div>

        <div className="col-span-2 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.5px] text-black/40 font-['Inter:Bold',sans-serif]">
            Date
          </p>
          <p className="text-[11px] text-black/55 font-['Inter:Regular',sans-serif] mt-[1px]">
            {dateLabel}
          </p>
        </div>
      </div>

      <span className="inline-flex items-center gap-[3px] text-[11px] font-semibold text-[#4600F2] font-['Inter:Semi_Bold',sans-serif] shrink-0 group-hover:translate-x-[2px] transition-transform">
        View summary <ChevronRight size={12} strokeWidth={2.5} />
      </span>
    </button>
  );
}

// ─── Create demo card (grid view) ──────────────────────────────────────────

function CreateDemoCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left rounded-[16px] border-2 border-dashed border-[#4600F2]/25 bg-[#F4F0FF]/40 p-[18px] flex flex-col items-start justify-between min-h-[174px] transition-all hover:border-[#4600F2]/60 hover:bg-[#F4F0FF] hover:-translate-y-[2px]"
    >
      <div className="size-[36px] rounded-[10px] bg-[#4600F2] flex items-center justify-center shrink-0">
        <Plus size={18} strokeWidth={2.5} className="text-white" />
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
          Start a new demo
        </p>
        <p className="mt-[3px] text-[11px] text-black/55 font-['Inter:Regular',sans-serif] leading-[15px]">
          Capture the prospect's profile, pain points, and unlock a personalised pitch.
        </p>
        <span className="mt-[8px] inline-flex items-center gap-[4px] text-[11px] font-semibold text-[#4600F2] font-['Inter:Semi_Bold',sans-serif] group-hover:translate-x-[2px] transition-transform">
          Create demo <ArrowRight size={12} strokeWidth={2.5} />
        </span>
      </div>
    </button>
  );
}

// ─── Discovery summary modal ───────────────────────────────────────────────

function DiscoverySummaryModal({
  demo, onClose, onStartDemo,
}: {
  demo: PastDemo;
  onClose: () => void;
  onStartDemo: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 24, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: "power3.out" }
    );
  }, []);

  const dateLabel = new Date(demo.takenOn).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[20px] bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[820px] max-h-[90vh] flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.30)]"
      >
        {/* Header */}
        <div
          className="relative px-[26px] pt-[24px] pb-[20px] text-white"
          style={{
            background:
              "linear-gradient(120deg, #3a0a8a 0%, #4600F2 55%, #2c0066 100%)",
          }}
        >
          <div
            className="absolute -top-[40px] -right-[20px] size-[180px] rounded-full opacity-25 blur-3xl"
            style={{ background: "#B651D7" }}
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-[16px] right-[16px] size-[28px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/85 transition-colors"
            aria-label="Close"
          >
            <X size={14} strokeWidth={2.5} />
          </button>

          <div className="relative">
            <p className="inline-flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-[1.2px] text-white/70 font-['Inter:Bold',sans-serif] mb-[10px]">
              <FileText size={11} strokeWidth={2.5} />
              Discovery summary
            </p>
            <div className="flex items-center justify-between gap-[20px] flex-wrap">
              <div>
                <h2 className="text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-tight">
                  {demo.dealershipName}
                </h2>
                <p className="mt-[4px] text-[12px] text-white/70 font-['Inter:Regular',sans-serif]">
                  {demo.imsProvider} · {demo.rooftops} rooftop{demo.rooftops === "1" ? "" : "s"} · Captured {dateLabel}
                </p>
              </div>
              <div className="flex items-center gap-[20px]">
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/55 font-['Inter:Bold',sans-serif] mb-[3px]">
                    Inventory
                  </p>
                  <p className="text-[18px] font-bold text-white font-['Inter:Bold',sans-serif] leading-none">
                    {demo.inventory}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/55 font-['Inter:Bold',sans-serif] mb-[3px]">
                    Sales / mo
                  </p>
                  <p className="text-[18px] font-bold text-white font-['Inter:Bold',sans-serif] leading-none">
                    {demo.monthlySales}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[1px] text-white/55 font-['Inter:Bold',sans-serif] mb-[3px]">
                    Monthly gap
                  </p>
                  <p className="text-[18px] font-bold text-white font-['Inter:Bold',sans-serif] leading-none">
                    ${Math.round(demo.monthlyOpportunity / 1000)}K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-[26px] py-[22px] space-y-[20px]">
          {/* Pain points */}
          {demo.painPoints.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#4600F2] mb-[8px] font-['Inter:Bold',sans-serif]">
                Pain points called out
              </p>
              <div className="flex flex-wrap gap-[6px]">
                {demo.painPoints.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-[10px] h-[28px] rounded-full bg-[#FEF2F2] text-[#B91C1C] text-[11px] font-semibold border border-[#EF4444]/20 font-['Inter:Semi_Bold',sans-serif]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AE notes */}
          {demo.notes && (
            <div className="rounded-[12px] bg-[#FFFBEB] border border-[#F59E0B]/25 px-[14px] py-[12px]">
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#B45309] mb-[4px] font-['Inter:Bold',sans-serif]">
                AE notes
              </p>
              <p className="text-[12px] text-[#7A4A06] font-['Inter:Regular',sans-serif] leading-[17px]">
                {demo.notes}
              </p>
            </div>
          )}

          {/* Discovery answers */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#4600F2] mb-[10px] font-['Inter:Bold',sans-serif]">
              Discovery questions
            </p>
            <ol className="space-y-[10px]">
              {DISCOVERY_QUESTIONS.map((item, i) => (
                <li
                  key={item.key}
                  className="rounded-[12px] border border-black/8 bg-[#FAFAFA] px-[14px] py-[12px]"
                >
                  <div className="flex items-start gap-[10px]">
                    <span className="shrink-0 size-[20px] rounded-full bg-[rgba(70,0,242,0.10)] text-[10px] font-bold text-[#4600F2] flex items-center justify-center mt-[1px] font-['Inter:Bold',sans-serif]">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-black/55 font-['Inter:Semi_Bold',sans-serif] leading-[15px]">
                        {item.q}
                      </p>
                      <p className="mt-[4px] text-[13px] text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-[18px] font-['Inter:Semi_Bold',sans-serif]">
                        {demo.answers[item.key] || (
                          <span className="text-black/35 italic font-['Inter:Regular',sans-serif]">
                            Not captured
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/8 px-[26px] py-[14px] flex items-center justify-between gap-[16px]">
          <p className="text-[11px] text-black/45 font-['Inter:Regular',sans-serif]">
            Review the answers above before launching{" "}
            <span className="font-semibold text-black/65">{demo.dealershipName}</span>'s demo.
          </p>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-[14px] rounded-[10px] text-[12px] font-semibold border border-black/12 text-black/65 hover:border-[#4600F2]/40 hover:text-[#4600F2] transition-colors font-['Inter:Semi_Bold',sans-serif]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onStartDemo}
              className="h-[38px] px-[16px] rounded-[10px] text-white text-[12px] font-bold font-['Inter:Bold',sans-serif] inline-flex items-center gap-[7px] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(90deg, #FF5C7A 0%, #B651D7 50%, #4600F2 100%)",
                boxShadow: "0 8px 18px rgba(70,0,242,0.28)",
              }}
            >
              <Play size={13} strokeWidth={2.6} fill="currentColor" />
              Start demo
              <ArrowRight size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────

interface Props {
  aeName?: string;
  onCreateNewDemo: () => void;
  onOpenPastDemo?: (demo: PastDemo) => void;
  pastDemos?: PastDemo[];
}

type ViewMode = "grid" | "list";

export function DemoLandingScreen({
  aeName = "Nidhi",
  onCreateNewDemo,
  onOpenPastDemo,
  pastDemos = SAMPLE_DEMOS,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [selectedDemo, setSelectedDemo] = useState<PastDemo | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pastDemos;
    return pastDemos.filter(
      (d) =>
        d.dealershipName.toLowerCase().includes(q) ||
        d.imsProvider.toLowerCase().includes(q)
    );
  }, [pastDemos, query]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-fade]");
    gsap.fromTo(
      items,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" }
    );
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-black/8 h-[52px] flex items-center justify-between px-[28px] shrink-0">
        <div className="flex items-center gap-[10px]">
          <SpyneMark />
          <span className="font-bold text-[#402387] text-[18px] leading-none font-['Inter:Bold',sans-serif]">
            Studio AI
          </span>
          <span className="ml-[6px] px-[8px] py-[2px] rounded-full bg-[rgba(70,0,242,0.08)] text-[10px] font-bold text-[#4600F2] uppercase tracking-[0.6px] font-['Inter:Bold',sans-serif]">
            AE Console
          </span>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="size-[30px] rounded-full bg-gradient-to-br from-[#FF5C7A] via-[#B651D7] to-[#4600F2] flex items-center justify-center text-white text-[11px] font-bold font-['Inter:Bold',sans-serif]">
            {aeName.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
              {aeName}
            </p>
            <p className="text-[10px] text-black/45 font-['Inter:Regular',sans-serif]">
              Account Executive
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-[28px] py-[28px]">

          {/* ── Hero ─────────────────────────────────────── */}
          <div
            data-fade
            className="relative overflow-hidden rounded-[16px] px-[22px] py-[16px] mb-[22px]"
            style={{
              background:
                "linear-gradient(120deg, #4600F2 0%, #6E2BE8 45%, #B651D7 85%, #FF5C7A 100%)",
            }}
          >
            <div
              className="absolute -top-[40px] -right-[30px] size-[160px] rounded-full opacity-25 blur-3xl"
              style={{ background: "#FF5C7A" }}
            />
            <div
              className="absolute -bottom-[60px] left-[30%] size-[200px] rounded-full opacity-20 blur-3xl"
              style={{ background: "#7BD3FF" }}
            />

            <div className="relative flex items-stretch gap-[20px]">
              <div className="flex-1 min-w-0 flex flex-col justify-between py-[2px]">
                <div>
                  <h1 className="text-white text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-[1.15]">
                    Welcome back, {aeName}.
                  </h1>
                  <p className="mt-[6px] text-white/75 text-[12px] font-['Inter:Regular',sans-serif] max-w-[460px] leading-[16px]">
                    Spin up a fresh personalised demo, or pick up where you left off with a prospect.
                  </p>
                </div>

                <div className="mt-[18px] flex items-center gap-[8px]">
                  <button
                    type="button"
                    onClick={onCreateNewDemo}
                    className="h-[36px] px-[16px] rounded-[10px] bg-white text-[#4600F2] text-[12px] font-bold font-['Inter:Bold',sans-serif] inline-flex items-center gap-[6px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
                  >
                    <Plus size={13} strokeWidth={2.8} />
                    Create new demo
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="h-[36px] px-[12px] rounded-[10px] bg-white/10 text-white text-[12px] font-semibold font-['Inter:Semi_Bold',sans-serif] inline-flex items-center gap-[5px] border border-white/25 hover:bg-white/15 transition-colors"
                  >
                    View playbook
                    <ChevronRight size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Demo screen graphic — stacked previews */}
              <div className="hidden md:block shrink-0 pl-[18px] border-l border-white/20">
                <div className="relative w-[240px] h-[140px]">
                  {/* Back card */}
                  <div
                    className="absolute inset-0 rounded-[10px] bg-white/10 border border-white/15"
                    style={{
                      transform: "translate(18px, 14px) rotate(4deg)",
                      backdropFilter: "blur(6px)",
                    }}
                  />
                  {/* Middle card */}
                  <div
                    className="absolute inset-0 rounded-[10px] bg-white/20 border border-white/25"
                    style={{
                      transform: "translate(8px, 6px) rotate(-2deg)",
                      backdropFilter: "blur(6px)",
                    }}
                  />

                  {/* Front card — full mock dashboard */}
                  <div
                    className="absolute inset-0 rounded-[10px] overflow-hidden border border-white/30"
                    style={{
                      background:
                        "linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)",
                      boxShadow:
                        "0 20px 40px -10px rgba(0,0,0,0.40), 0 0 0 1px rgba(255,255,255,0.10) inset",
                    }}
                  >
                    {/* Mock top bar */}
                    <div className="h-[22px] bg-white border-b border-black/8 flex items-center px-[10px] gap-[5px]">
                      <span className="size-[6px] rounded-full bg-[#FF5C7A]" />
                      <span className="size-[6px] rounded-full bg-[#F59E0B]" />
                      <span className="size-[6px] rounded-full bg-[#10B981]" />
                      <span className="ml-[8px] text-[7px] font-bold text-[#4600F2] tracking-[0.6px] font-['Inter:Bold',sans-serif]">
                        STUDIO AI · LIVE DEMO
                      </span>
                      <span className="ml-auto flex items-center gap-[3px]">
                        <span className="size-[4px] rounded-full bg-[#10B981] animate-pulse" />
                        <span className="text-[6px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif]">
                          LIVE
                        </span>
                      </span>
                    </div>

                    {/* KPI tiles */}
                    <div className="px-[10px] pt-[8px] flex gap-[6px]">
                      <div className="flex-1 rounded-[5px] bg-white border border-black/8 px-[6px] py-[5px]">
                        <p className="text-[6px] font-bold uppercase tracking-[0.4px] text-black/40 leading-none font-['Inter:Bold',sans-serif]">
                          Inventory
                        </p>
                        <p className="mt-[3px] text-[12px] font-bold text-[#0a0a0a] leading-none font-['Inter:Bold',sans-serif]">
                          842
                        </p>
                      </div>
                      <div className="flex-1 rounded-[5px] bg-[#4600F2]/8 border border-[#4600F2]/20 px-[6px] py-[5px]">
                        <p className="text-[6px] font-bold uppercase tracking-[0.4px] text-[#4600F2]/70 leading-none font-['Inter:Bold',sans-serif]">
                          Live VINs
                        </p>
                        <p className="mt-[3px] text-[12px] font-bold text-[#4600F2] leading-none font-['Inter:Bold',sans-serif]">
                          798
                        </p>
                      </div>
                      <div className="flex-1 rounded-[5px] bg-[#ECFDF5] border border-[#10B981]/25 px-[6px] py-[5px]">
                        <p className="text-[6px] font-bold uppercase tracking-[0.4px] text-[#047857] leading-none font-['Inter:Bold',sans-serif]">
                          Reclaim
                        </p>
                        <p className="mt-[3px] text-[12px] font-bold text-[#047857] leading-none font-['Inter:Bold',sans-serif]">
                          $84K
                        </p>
                      </div>
                    </div>

                    {/* Mock chart bars */}
                    <div className="px-[10px] pt-[8px]">
                      <div className="h-[44px] flex items-end gap-[2px]">
                        {[28, 44, 36, 56, 42, 64, 52, 72, 60, 80, 70, 92, 84, 100].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-[2px]"
                              style={{
                                height: `${h * 0.42}px`,
                                background:
                                  i >= 10
                                    ? "linear-gradient(180deg, #4600F2 0%, #B651D7 100%)"
                                    : i >= 6
                                    ? "rgba(70,0,242,0.30)"
                                    : "rgba(70,0,242,0.15)",
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>

                    {/* Mock inventory rows */}
                    <div className="px-[10px] pt-[8px] space-y-[4px]">
                      {[
                        { label: "2024 Toyota Camry · SE", live: true },
                        { label: "2023 Honda Civic · Touring", live: true },
                      ].map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-[6px] rounded-[4px] bg-white border border-black/6 px-[5px] py-[3px]"
                        >
                          <div
                            className="size-[14px] rounded-[3px] bg-gradient-to-br from-[#4600F2]/25 to-[#FF5C7A]/20 shrink-0"
                            style={{
                              backgroundImage:
                                "linear-gradient(135deg, rgba(70,0,242,0.25) 0%, rgba(255,92,122,0.18) 100%)",
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[6px] font-bold text-black/75 truncate font-['Inter:Bold',sans-serif] leading-none">
                              {row.label}
                            </p>
                            <div className="mt-[2px] h-[2px] w-[55%] rounded-full bg-black/15" />
                          </div>
                          <span className="inline-flex items-center gap-[2px] text-[5px] font-bold text-[#10B981] font-['Inter:Bold',sans-serif]">
                            <span className="size-[3px] rounded-full bg-[#10B981]" />
                            LIVE
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Floating brand chip */}
                    <div className="absolute bottom-[6px] right-[6px] flex items-center gap-[4px] bg-[#4600F2] rounded-full px-[7px] py-[3px] shadow-[0_4px_10px_rgba(70,0,242,0.40)]">
                      <Sparkles size={8} strokeWidth={2.8} className="text-white" />
                      <span className="text-[6px] font-bold text-white font-['Inter:Bold',sans-serif] tracking-[0.3px]">
                        Studio AI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Toolbar ─────────────────────────────────── */}
          <div data-fade className="flex items-center justify-between gap-[16px] mb-[18px] flex-wrap">
            <div className="flex items-center gap-[10px]">
              <h2 className="text-[15px] font-bold text-[#0a0a0a] font-['Inter:Bold',sans-serif]">
                Your demos
              </h2>
              <span className="px-[8px] py-[2px] rounded-full bg-black/5 text-[10px] font-bold text-black/55 font-['Inter:Bold',sans-serif]">
                {filtered.length}
              </span>
            </div>

            <div className="flex items-center gap-[10px]">
              <div className="flex items-center h-[34px] bg-white rounded-[10px] px-[10px] border border-black/10 focus-within:border-[#4600F2] w-[220px]">
                <Search size={13} className="text-black/35 mr-[6px]" />
                <input
                  type="text"
                  placeholder="Search dealership or IMS"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[12px] font-['Inter:Regular',sans-serif] placeholder:text-black/30 text-[#0a0a0a] min-w-0"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center h-[34px] bg-white rounded-[10px] border border-black/10 p-[3px]">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`h-[26px] px-[10px] rounded-[7px] inline-flex items-center gap-[5px] text-[11px] font-semibold transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                    view === "grid"
                      ? "bg-[#4600F2] text-white"
                      : "text-black/55 hover:text-[#4600F2]"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={12} strokeWidth={2.5} />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`h-[26px] px-[10px] rounded-[7px] inline-flex items-center gap-[5px] text-[11px] font-semibold transition-colors font-['Inter:Semi_Bold',sans-serif] ${
                    view === "list"
                      ? "bg-[#4600F2] text-white"
                      : "text-black/55 hover:text-[#4600F2]"
                  }`}
                  aria-label="List view"
                >
                  <List size={12} strokeWidth={2.5} />
                  List
                </button>
              </div>
            </div>
          </div>

          {/* ── Content ───────────────────────────────────── */}
          {filtered.length === 0 ? (
            <div data-fade className="rounded-[16px] border border-dashed border-black/12 bg-white py-[40px] flex flex-col items-center justify-center text-center mb-[24px]">
              <div className="size-[44px] rounded-full bg-black/5 flex items-center justify-center mb-[10px]">
                <Clock size={18} className="text-black/35" />
              </div>
              <p className="text-[13px] font-semibold text-black/65 font-['Inter:Semi_Bold',sans-serif]">
                No demos match your search
              </p>
              <p className="mt-[3px] text-[11px] text-black/40 font-['Inter:Regular',sans-serif]">
                Try a different dealership or IMS name.
              </p>
            </div>
          ) : view === "grid" ? (
            <div data-fade className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px] pb-[24px]">
              <CreateDemoCard onClick={onCreateNewDemo} />
              {filtered.map((demo) => (
                <DemoCard
                  key={demo.id}
                  demo={demo}
                  onClick={() => setSelectedDemo(demo)}
                />
              ))}
            </div>
          ) : (
            <div data-fade className="space-y-[8px] pb-[24px]">
              {filtered.map((demo) => (
                <DemoRow
                  key={demo.id}
                  demo={demo}
                  onClick={() => setSelectedDemo(demo)}
                />
              ))}
            </div>
          )}

          {/* Footnote */}
          <div className="flex items-center justify-center gap-[6px] pb-[24px] text-[10px] text-black/35 font-['Inter:Regular',sans-serif]">
            <TrendingUp size={11} />
            Demo data syncs automatically with your Spyne CRM
          </div>

        </div>
      </div>

      {/* Discovery summary modal */}
      {selectedDemo && (
        <DiscoverySummaryModal
          demo={selectedDemo}
          onClose={() => setSelectedDemo(null)}
          onStartDemo={() => {
            const d = selectedDemo;
            setSelectedDemo(null);
            onOpenPastDemo?.(d);
          }}
        />
      )}
    </div>
  );
}
