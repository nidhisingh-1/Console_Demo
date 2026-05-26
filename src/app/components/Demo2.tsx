import { useCallback, useMemo, useState } from "react";
import { Camera, ImageOff, Send, TrendingDown, Layers, Sparkles } from "lucide-react";
import { IMSImportScreen } from "./IMSImportScreen";
import { ScanningScreen } from "./ScanningScreen";
import { Demo2Dashboard, type BucketKey, type BucketState } from "./Demo2Dashboard";
import { PitchPanel, type PitchContent } from "./shared/PitchPanel";
import { InventoryDiagnosticFab } from "./InventoryDiagnosticFab";
import { CreateCampaignFab } from "./CreateCampaignFab";
import type { Row } from "./shared/VehicleRow";
import { PLATFORMS } from "./publishPlatforms";

// ─── Pitch content — same product story as Demo 1's pitch modals, restructured
//     to fit the right-side panel layout (problem / how-it-works / proof / before-after)
const PITCHES: Record<BucketKey, PitchContent> = {
  raw: {
    accent: "#F59E0B",
    product: "Merchandising AI",
    tagline: "Turn raw lot photos into showroom-grade media — automatically.",
    problem:
      "89 vehicles have raw photos sitting in the IMS — parking-lot backgrounds, mixed lighting, no 360. They're listable, but they don't convert.",
    bullets: [
      "Studio backgrounds applied to existing photos with 1-click",
      "360° spin + dealership-branded video tour auto-generated",
      "Shadow, plate-blur, and color-correct baked into every output",
    ],
    proof: { value: "+34% VDP views", caption: "Average lift on listings upgraded with Spyne studio backgrounds vs. raw lot photos." },
    visual: {
      beforeLabel: "Raw lot photo",
      afterLabel: "Studio output",
      before: (
        <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#C7CDD3] via-[#A8B0B7] to-[#888F95] flex items-center justify-center">
          <Camera size={28} className="text-white/70" />
        </div>
      ),
      after: (
        <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#FEF3C7] via-[#FCD34D] to-[#F59E0B] flex items-center justify-center">
          <Sparkles size={28} className="text-white" />
        </div>
      ),
    },
    actionLabel: "Process all 89",
  },
  nophoto: {
    accent: "#7F6AF2",
    product: "SmartMatch",
    tagline: "Eligible vehicles inherit photos from a matched parent in your network.",
    problem:
      "23 vehicles have no media yet. They're projected as eligible for SmartMatch — same year, trim, and spec as parent inventory we already have media for.",
    bullets: [
      "Eligibility computed from VIN spec, trim, color match, and year",
      "Projected matches surfaced before commit — AE controls when to apply",
      "Parent media adapted per-vehicle so listings don't look duplicated",
    ],
    proof: { value: "0 → live in 4 min", caption: "Median time from IMS arrival to first published listing for SmartMatch-eligible vehicles." },
    visual: {
      beforeLabel: "Placeholder",
      afterLabel: "Projected match",
      before: (
        <div className="w-full h-full rounded-[6px] bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF]">
          <ImageOff size={28} />
        </div>
      ),
      after: (
        <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#EDE9FE] via-[#C4B5FD] to-[#7F6AF2] flex items-center justify-center text-white">
          <Layers size={28} strokeWidth={2.2} />
        </div>
      ),
    },
    actionLabel: "Match all eligible",
  },
  unsyndicated: {
    accent: "#4600F2",
    product: "Syndication",
    tagline: "One click pushes every complete listing to the channels that matter.",
    problem:
      "156 vehicles are camera-ready but only live on your dealer site. Marketplaces, social, and OEM partners haven't seen them — that's frontline time you're paying for.",
    bullets: [
      "AutoTrader, Cars.com, KBB, dealer site, Facebook & Instagram in one push",
      "Channel-specific formatting (aspect ratios, character limits) handled per-platform",
      "Status pinged back to the IMS so the AE never re-publishes by accident",
    ],
    proof: { value: "11 channels", caption: "Average syndication reach per vehicle after first publish. Marketplaces alone drive ~62% of inbound leads." },
    visual: {
      beforeLabel: "1 channel",
      afterLabel: "11 channels",
      before: (
        <div className="w-full h-full rounded-[6px] bg-[#F3F4F6] flex items-center justify-center">
          <Send size={28} className="text-[#9CA3AF]" />
        </div>
      ),
      after: (
        <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#EDE7FF] via-[#A78BFA] to-[#4600F2] flex items-center justify-center text-white">
          <Send size={28} strokeWidth={2.2} />
        </div>
      ),
    },
    actionLabel: "Syndicate all 156",
  },
  aging: {
    accent: "#DC2626",
    product: "Smart Campaigns",
    tagline: "Targeted campaigns for aged inventory bleeding holding cost.",
    problem:
      "34 units are past 40 days on lot at $45/day holding cost — that's $1,530+ per car per month evaporating. Generic ads aren't moving them; targeted campaigns can.",
    bullets: [
      "Auto-segmented audiences from in-market shopper data",
      "Campaign template library — price-drop, finance-led, trade-in pitches",
      "Holding-cost math attached to every campaign so the AE proves the ROI",
    ],
    proof: { value: "$52K saved", caption: "Average monthly holding-cost reduction across dealers running Smart Campaigns on >40-day inventory." },
    visual: {
      beforeLabel: "Aging on lot",
      afterLabel: "In-market",
      before: (
        <div className="w-full h-full rounded-[6px] bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]">
          <TrendingDown size={28} />
        </div>
      ),
      after: (
        <div className="w-full h-full rounded-[6px] bg-gradient-to-br from-[#FECACA] via-[#F87171] to-[#DC2626] flex items-center justify-center text-white">
          <Sparkles size={28} />
        </div>
      ),
    },
    actionLabel: "Launch campaigns",
  },
};

type Scene = "connect" | "scanning" | "dashboard";

interface VehicleState extends Row {
  initialBuckets: BucketKey[];
  /**
   * The bucket this vehicle was just resolved from, if any.
   * Keeps the row visible under the same bucket filter after its state has
   * changed — otherwise the post-transform list goes empty as vehicles cascade
   * into their next bucket.
   */
  lastResolvedFromBucket?: BucketKey;
}

// KPI lookup — index = number of resolved buckets
const DTF_BY_STEP   = [14,  11,  8,    8,    5];
// Inventory Score is on a 0-10 scale (rendered as a half-donut gauge)
const SCORE_BY_STEP = [4.2, 5.8, 7.4,  8.4,  9.1];

const BUCKET_TOTALS: Record<BucketKey, number> = {
  raw: 89,
  nophoto: 23,
  unsyndicated: 156,
  aging: 34,
};

// ─── Seed inventory ──────────────────────────────────────────────────────────
// 19 vehicles — new-vehicle inventory (2024/2025 model year). Bucket membership
// is derived from per-vehicle flags via computeBucket() below.
const SEED: VehicleState[] = [
  // ── Raw bucket (5) ──
  ...rawSeed(1, "2025 Honda CR-V EX-L",         "STK-4012", "VIN5FJRW1H8XPL", "$36,500"),
  ...rawSeed(2, "2025 Toyota RAV4 XLE Premium", "STK-4015", "VIN2T3W1RFV0SC", "$34,900"),
  ...rawSeed(3, "2024 Hyundai Tucson SEL",      "STK-4017", "VIN5NMJBCAE7RH", "$31,200"),
  ...rawSeed(4, "2025 Mazda CX-5 Carbon Turbo", "STK-4019", "VINJM3KFBCM9R0", "$37,800"),
  ...rawSeed(5, "2025 Subaru Forester Sport",   "STK-4022", "VIN4S4BTGND1S3", "$33,600"),

  // ── No-photo bucket (4): 2 "pure" + 2 also-aging ──
  ...noPhotoSeed(6, "2025 Nissan Rogue SV",      "STK-4031", "VIN5N1AT3CBXSC", "$32,400", false),
  ...noPhotoSeed(7, "2024 Volkswagen Tiguan SE", "STK-4034", "VIN3VV2B7AX7RM", "$30,900", false),
  ...noPhotoSeed(8, "2024 Kia Sportage X-Line",  "STK-3955", "VIN5XYK3CAF9RG", "$33,100", true),
  ...noPhotoSeed(9, "2024 Ford Bronco Sport BL", "STK-3941", "VIN3FMCR9C66RR", "$34,800", true),

  // ── Unsyndicated bucket (5) ──
  ...unsynSeed(10, "2025 Chevrolet Equinox RS",  "STK-4040", "VIN3GNAXKEV2SL", "$32,750"),
  ...unsynSeed(11, "2025 GMC Terrain Denali",    "STK-4042", "VIN3GKAL5EX3SL", "$39,500"),
  ...unsynSeed(12, "2025 Jeep Compass Limited",  "STK-4044", "VIN3C4NJDCB7ST", "$33,200"),
  ...unsynSeed(13, "2024 Buick Envista Avenir",  "STK-4047", "VINKL77LFE2XRB", "$31,800"),
  ...unsynSeed(14, "2025 Hyundai Kona N Line",   "STK-4050", "VINKM8K3CAB9SU", "$29,400"),

  // ── Aging bucket (5) ──
  ...agingSeed(15, "2024 Ford Explorer Limited", "STK-3812", "VIN1FM5K8F8XR0", "$44,200", 48, 1180, 56),
  ...agingSeed(16, "2024 Toyota Highlander LE",  "STK-3805", "VIN5TDADAB04RS", "$41,500", 52, 1305, 64),
  ...agingSeed(17, "2024 Honda Pilot Sport",     "STK-3798", "VIN5FNYG2H50RB", "$45,800", 58, 1490, 78),
  ...agingSeed(18, "2024 Nissan Pathfinder SL",  "STK-3791", "VIN5N1DR3BB1RC", "$42,300", 61, 1620, 92),
  ...agingSeed(19, "2024 Mazda CX-90 Preferred", "STK-3780", "VINJM3KKBHB1R1", "$46,900", 67, 1830, 118),
];

function baseRow(id: number, name: string, stk: string, vin: string, price: string): Row {
  return {
    id, name, stk, vin, price,
    date: "26 May '26, 10:30 AM",
    age: 6,
    mediaScore: 0,
    daysToFrontline: 4,
    holdCost: 240,
    marginPct: 28,
    totalMargin: 4200,
  };
}

function rawSeed(id: number, name: string, stk: string, vin: string, price: string): VehicleState[] {
  const r = baseRow(id, name, stk, vin, price);
  return [{ ...r, mediaState: "raw", mediaScore: 4.2, initialBuckets: ["raw"] }];
}

function noPhotoSeed(
  id: number, name: string, stk: string, vin: string, price: string, alsoAging: boolean
): VehicleState[] {
  const r = baseRow(id, name, stk, vin, price);
  if (alsoAging) {
    return [{
      ...r,
      noPhoto: true,
      mediaScore: 0,
      age: 43,
      date: "13 Apr '26, 09:15 AM",
      isLoss: true,
      lossPerDay: 45,
      holdCost: 1085,
      marginPct: 100,
      totalMargin: 1800,
      daysToFrontline: 0,
      initialBuckets: ["nophoto", "aging"],
    }];
  }
  return [{ ...r, noPhoto: true, mediaScore: 0, initialBuckets: ["nophoto"] }];
}

function unsynSeed(id: number, name: string, stk: string, vin: string, price: string): VehicleState[] {
  const r = baseRow(id, name, stk, vin, price);
  return [{ ...r, mediaState: "processed", mediaScore: 8.6, daysToFrontline: 2, initialBuckets: ["unsyndicated"] }];
}

function agingSeed(
  id: number, name: string, stk: string, vin: string, price: string,
  age: number, holdCost: number, lossPerDay: number,
): VehicleState[] {
  const r = baseRow(id, name, stk, vin, price);
  return [{
    ...r,
    age,
    date: ageToDate(age),
    isLoss: true,
    lossPerDay,
    holdCost,
    marginPct: 100,
    totalMargin: 2200,
    mediaScore: 7.4,
    mediaState: "processed",
    daysToFrontline: 0,
    syndicatedTo: ["vincue", "autotrader"],
    initialBuckets: ["aging"],
  }];
}

function ageToDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}, 09:15 AM`;
}

// Canonical bucket order — also drives the "Move on to next" CTA suggestion.
const BUCKET_ORDER: BucketKey[] = ["raw", "nophoto", "unsyndicated", "aging"];

const NEXT_BUCKET_LABELS: Record<BucketKey, string> = {
  raw:          "transform raw photos to studio output",
  nophoto:      "fix no photos with Smart Match",
  unsyndicated: "syndicate listings to all channels",
  aging:        "run Smart Campaigns on aged inventory",
};

// Priority: raw > nophoto > unsyndicated > aging > done
function computeBucket(v: VehicleState): BucketKey | null {
  if (v.mediaState === "raw") return "raw";
  if (v.noPhoto) return "nophoto";
  if (!v.syndicatedTo?.length) return "unsyndicated";
  if (v.isLoss && !v.campaignActive) return "aging";
  return null;
}

const SYND_PLATFORMS = PLATFORMS.filter((p) =>
  ["vincue", "autotrader", "cars", "kbb-marketplace", "facebook", "instagram"].includes(p.id)
).map((p) => p.id);

// ─── Component ───────────────────────────────────────────────────────────────

export function Demo2() {
  const [scene, setScene] = useState<Scene>("connect");
  const [imsName, setImsName] = useState("Vincue");
  const [activeBucket, setActiveBucket] = useState<BucketKey | null>(null);
  const [pitchOpen, setPitchOpen] = useState(false);
  const [runningBucket, setRunningBucket] = useState<BucketKey | null>(null);
  const [transformingIds, setTransformingIds] = useState<Set<number>>(new Set());
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleState[]>(SEED);
  const [completed, setCompleted] = useState<Record<BucketKey, boolean>>({
    raw: false, nophoto: false, unsyndicated: false, aging: false,
  });

  const completedCount = Object.values(completed).filter(Boolean).length;
  const dtf = DTF_BY_STEP[completedCount];
  const score = SCORE_BY_STEP[completedCount];

  const buckets: Record<BucketKey, BucketState> = useMemo(() => ({
    raw:          { count: BUCKET_TOTALS.raw,          completed: completed.raw },
    nophoto:      { count: BUCKET_TOTALS.nophoto,      completed: completed.nophoto },
    unsyndicated: { count: BUCKET_TOTALS.unsyndicated, completed: completed.unsyndicated },
    aging:        { count: BUCKET_TOTALS.aging,        completed: completed.aging },
  }), [completed]);

  const visibleRows: Row[] = useMemo(() => {
    if (!activeBucket) return vehicles;
    // Show the original cohort of vehicles that belonged to this bucket — whether
    // they've been transformed or not. This keeps the bucket view stable so the
    // AE can show before/after on the same rows, and there's never an empty list.
    return vehicles.filter((v) => v.initialBuckets.includes(activeBucket));
  }, [vehicles, activeBucket]);

  const highlightIds = useMemo(() => {
    if (!activeBucket) return new Set<number>();
    return new Set(visibleRows.map((v) => v.id));
  }, [visibleRows, activeBucket]);

  // ─── Scene 1: Connect & Scan ──
  const handleImport = useCallback((name: string) => {
    setImsName(name);
    setScene("scanning");
  }, []);

  const handleScanComplete = useCallback(() => {
    setScene("dashboard");
  }, []);

  // ─── Bucket click → filter + open pitch (no transformation yet) ──
  const handleBucketClick = useCallback((b: BucketKey) => {
    setActiveBucket((prev) => prev === b ? prev : b);
    setPitchOpen(true);
  }, []);

  const handleClearBucket = useCallback(() => {
    setActiveBucket(null);
    setPitchOpen(false);
  }, []);

  // ─── Run the actual transformation animation on the affected rows ──
  // Used by both the FAB's Transform button and (for aging) the Create-Campaign FAB.
  const runTransform = useCallback((bucket: BucketKey) => {
    if (runningBucket || completed[bucket]) return;
    // Snapshot which vehicle IDs will be touched so the row shimmer targets them
    const targetIds = new Set(
      vehicles.filter((v) => computeBucket(v) === bucket).map((v) => v.id)
    );
    if (targetIds.size === 0) {
      // Nothing visible to transform — still mark the bucket resolved + tick KPI
      setCompleted((c) => ({ ...c, [bucket]: true }));
      return;
    }
    setRunningBucket(bucket);
    setTransformingIds(targetIds);
    // Focus the list on the bucket so the AE sees the rows in motion
    setActiveBucket(bucket);

    // 1.6s shimmer pass → then apply state + clear the running flag
    setTimeout(() => {
      setVehicles((vs) => vs.map((v) => applyAction(v, bucket)));
      setCompleted((c) => ({ ...c, [bucket]: true }));
      setTransformingIds(new Set());
      setRunningBucket(null);
    }, 1600);
  }, [vehicles, runningBucket, completed]);

  // From the SmartCampaign pitch CTA → close pitch, show create-campaign FAB
  const handleAgingPitchContinue = useCallback(() => {
    setPitchOpen(false);
    setCreateCampaignOpen(true);
  }, []);

  // From the create-campaign FAB → fire the actual transformation
  const handleCreateCampaign = useCallback(() => {
    setCreateCampaignOpen(false);
    runTransform("aging");
  }, [runTransform]);

  if (scene === "connect") {
    return (
      <div className="size-full">
        <IMSImportScreen onImport={handleImport} />
      </div>
    );
  }
  if (scene === "scanning") {
    return (
      <div className="size-full overflow-auto">
        <ScanningScreen
          imsName={imsName}
          snapshotOnly
          onFinish={handleScanComplete}
        />
      </div>
    );
  }

  const pitchContent = activeBucket ? PITCHES[activeBucket] : null;
  const isAgingPitch = activeBucket === "aging";
  const isActiveCompleted = activeBucket ? completed[activeBucket] : false;
  // First bucket in canonical order that hasn't been resolved yet (excluding the
  // current bucket itself — so after resolving raw, "next" is nophoto, not raw).
  const nextBucket = BUCKET_ORDER.find((k) => k !== activeBucket && !completed[k]) ?? null;

  return (
    <div className="size-full">
      <Demo2Dashboard
        dtf={dtf}
        score={score}
        buckets={buckets}
        activeBucket={activeBucket}
        onBucketClick={handleBucketClick}
        onClearBucket={handleClearBucket}
        rows={visibleRows}
        highlightIds={highlightIds}
        transformingIds={transformingIds}
      />

      <InventoryDiagnosticFab
        buckets={buckets}
        activeBucket={activeBucket}
        onBucketClick={handleBucketClick}
      />

      {pitchContent && (() => {
        // Resolve which CTA the pitch should currently show:
        //   - already completed + a next bucket exists → "Move on to fix [next]"
        //   - already completed + no more buckets       → "All set — close"
        //   - aging bucket (not yet acted on)           → "Continue to campaign builder"
        //   - otherwise                                 → pitch's own action label
        let label: string;
        let onAction: () => void;
        if (isActiveCompleted) {
          if (nextBucket) {
            label = `Move on to ${NEXT_BUCKET_LABELS[nextBucket]}`;
            onAction = () => { setActiveBucket(nextBucket); setPitchOpen(true); };
          } else {
            label = "Inventory is sale-ready — close";
            onAction = () => setPitchOpen(false);
          }
        } else if (isAgingPitch) {
          label = "Continue to campaign builder";
          onAction = handleAgingPitchContinue;
        } else {
          label = pitchContent.actionLabel;
          onAction = () => runTransform(activeBucket!);
        }

        return (
          <PitchPanel
            open={pitchOpen}
            onClose={() => setPitchOpen(false)}
            onAction={onAction}
            actionRunning={runningBucket === activeBucket}
            // Always keep the button live so the AE can advance through buckets
            completed={false}
            {...pitchContent}
            actionLabel={label}
          />
        );
      })()}

      <CreateCampaignFab
        open={createCampaignOpen}
        selectedCount={BUCKET_TOTALS.aging}
        onCreate={handleCreateCampaign}
        onDismiss={() => setCreateCampaignOpen(false)}
      />
    </div>
  );
}

// ─── Action transitions ──────────────────────────────────────────────────────
function applyAction(v: VehicleState, bucket: BucketKey): VehicleState {
  if (computeBucket(v) !== bucket) return v;

  const stamp = { lastResolvedFromBucket: bucket };
  switch (bucket) {
    case "raw":
      return { ...v, ...stamp, mediaState: "processed", mediaScore: 9.1, daysToFrontline: 2 };
    case "nophoto":
      return {
        ...v,
        ...stamp,
        noPhoto: false,
        smartMatched: true,
        mediaState: "processed",
        mediaScore: 8.8,
        daysToFrontline: v.isLoss ? 0 : 2,
      };
    case "unsyndicated":
      return { ...v, ...stamp, syndicatedTo: SYND_PLATFORMS };
    case "aging":
      return { ...v, ...stamp, campaignActive: true };
  }
}
