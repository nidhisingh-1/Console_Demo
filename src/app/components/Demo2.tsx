import { useCallback, useMemo, useState } from "react";
import {
  Monitor, Palette, Smartphone, Search, Rocket, Building2,
  Layers, Globe, Sparkles, Wand2, Send, Timer, Calendar,
} from "lucide-react";
import {
  RawScanHero, SmartMatchScanHero, StockPhotoGridHero,
  SyndicationHero, SmartCampaignsHero,
} from "./shared/PitchHeroes";
import { IMSImportScreen } from "./IMSImportScreen";
import { ScanningScreen } from "./ScanningScreen";
import { LoadingScreen } from "./LoadingScreen";
import Frame31 from "../../imports/Frame2147240606/Frame2147240606";
import { Demo2Dashboard, type BucketKey, type BucketState, type FilterKey } from "./Demo2Dashboard";
import { PitchPanel, type PitchContent } from "./shared/PitchPanel";
import { InventoryDiagnosticFab } from "./InventoryDiagnosticFab";
import { BeforeAfterToggle, type DashboardView } from "./BeforeAfterToggle";
import { SelectionActionBar } from "./SelectionActionBar";
import { SmartCampaignModal } from "./SmartCampaignModal";
import { PublishModal } from "./PublishModal";
import { UpgradeModal } from "./UpgradeModal";
import type { Row } from "./shared/VehicleRow";
import { PLATFORMS } from "./publishPlatforms";
// Hero images are now baked into PitchHeroes — Demo2 no longer needs the raw imports here.

// ─── Pitch content — uses Demo 1's hero artwork and feature card structure so
//     the Demo 2 side panel feels like an extension of the Demo 1 transformation
//     journey (same imagery, same product story).
const PITCHES: Record<BucketKey, PitchContent> = {
  raw: {
    accent: "#E91E63",
    step: "Step 01 · Studio AI · Smart Shoot",
    product: "Smart Shoot",
    punchline: "Cut re shoots and editing time",
    tagline: "Turn lot photos into marketplace ready media",
    problem:
      "Raw lot photos have mixed backgrounds, patchy lighting, and no 360 or video. Buyers scroll past listings that look like they were shot in a hurry.",
    problemChips: [
      "Mixed Backgrounds",
      "Patchy Lighting",
      "Non-interactive VDPs",
      "Low CTRs",
      "High TTM",
      "Photography Costs",
      "Holding Cost",
      "No 360 / Video",
      "Inconsistent Branding",
    ],
    solutionSection: {
      title: "The Solution: Smart Shoot",
      boxes: [
        { icon: <Monitor size={14} strokeWidth={2} />,    label: "Interactive VDPs",            body: "Studio images, car tours and video tours from your smartphone." },
        { icon: <Palette size={14} strokeWidth={2} />,    label: "Dealership Branding",         body: "Wide range of studio backgrounds and dealership branding." },
        { icon: <Smartphone size={14} strokeWidth={2} />, label: "Studio Grade Without Agencies", body: "Shoot with minimal training on a phone or import from IMS." },
      ],
    },
    bullets: [
      "Shoot with Studio App",
      "Choose background",
      "Hit Create Listing",
      "Studio grade assets ready",
    ],
    bulletStyle: "nodes",
    heroNode: <RawScanHero />,
    actionLabel: "Process all 89",
  },
  nophoto: {
    accent: "#7F6AF2",
    step: "Step 02 · Studio AI · Smart Match",
    product: "SmartMatch",
    punchline: "Capture demand from Day 0",
    tagline: "Be visible while competitors wait for the shoot",
    problem:
      "The vehicle is acquired but the shoot is pending or it has not hit your lot yet. Every day your listing sits dark, buyers are clicking the competition while holding cost eats at your margin.",
    problemChips: [
      "Dark Listings, Zero Leads",
      "3-5 Days to Go Live",
      "Shoot Scheduling Delays",
      "Repeat Reshoots",
      "Photography Costs",
      "Holding Cost",
      "High Time to Live",
    ],
    solutionSection: {
      title: "The Solution: Smart Match",
      boxes: [
        { icon: <Search size={14} strokeWidth={2} />,    label: "Smart VIN Matching",          body: "Matched on year, make, model, trim and color. Cloned automatically." },
        { icon: <Rocket size={14} strokeWidth={2} />,    label: "Go Live Instantly",           body: "Published in seconds. Capture demand from Day 0." },
        { icon: <Building2 size={14} strokeWidth={2} />, label: "Reuse Assets Across Rooftops", body: "Shot once, live-ready across every dealership in your group." },
      ],
    },
    bullets: [
      "New car acquired",
      "Enter VIN or import from IMS",
      "Matching VIN found",
      "Go live with studio grade assets",
    ],
    bulletStyle: "nodes",
    heroNode: <SmartMatchScanHero />,
    features: [
      { icon: <Rocket size={16} strokeWidth={2.2} />,   title: "Live Instantly",   tagline: "Skip the shoot. Publish in seconds.", accent: "#4600F2" },
      { icon: <Calendar size={16} strokeWidth={2.2} />, title: "List Pre-Arrival", tagline: "Live days before the car lands.",     accent: "#10B981" },
      { icon: <Search size={16} strokeWidth={2.2} />,   title: "Spec Matching",    tagline: "Year, make, model, trim, color.",     accent: "#E91E63" },
    ],
    featuresPhase: "success",
    actionLabel: "Match all eligible",
  },
  cgi: {
    accent: "#7C3AED",
    step: "Step 03 · Studio AI · Stock Photos",
    product: "Smart Shoot",
    punchline: "Make your VDPs look premium",
    tagline: "Studio grade imagery at inventory scale",
    problem:
      "Stock images on your VDPs are hurting your dealership brand. Inconsistent backgrounds, watermarks, and non-standard crops across listings reduce buyer trust and suppress VDP clicks.",
    problemChips: [
      "Inconsistent VDPs",
      "Watermarked Images",
      "Off-Brand Visuals",
      "Reduced Buyer Trust",
      "Low Marketplace CTR",
      "Non-Standard Crops",
      "Perceived Unreliability",
    ],
    solutionSection: {
      title: "The Solution: Studio AI",
      boxes: [
        { icon: <Layers size={14} strokeWidth={2} />,   label: "Consistent VDPs",       body: "Uniform angles, clean backgrounds and studio grade on every VDP." },
        { icon: <Globe size={14} strokeWidth={2} />,    label: "Increased Competitiveness", body: "Beat stock photos on every marketplace and drive higher VDP clicks." },
        { icon: <Sparkles size={14} strokeWidth={2} />, label: "Higher Buyer Trust",    body: "Consistent imagery builds credibility and keeps buyers engaged." },
      ],
    },
    bullets: [
      "Import inventory",
      "Smart Match or Smart Shoot",
      "Studio grade assets ready",
      "Push live to all platforms",
    ],
    bulletStyle: "nodes",
    heroNode: <StockPhotoGridHero />,
    actionLabel: "Upgrade all 134 to CGI",
  },
  unsyndicated: {
    accent: "#4600F2",
    step: "Step 04 · Studio AI · Syndication",
    product: "Syndication",
    punchline: "Every channel, one click.",
    tagline: "Push every studio-grade listing to the marketplaces buyers actually use, instantly.",
    problem:
      "Your vehicles are listing-ready but visibility stops at your website. Buyers searching AutoTrader, Cars.com, and KBB never see them. Every day a car sits off-marketplace is another day holding cost compounds with zero buyer reach.",
    problemChips: [
      "Zero Off-Site Visibility",
      "Manual Publishing",
      "Platform Reformatting",
      "Slow Time to Live",
      "No Publish Confirmation",
      "Duplicate Listing Risk",
      "IMS Sync Delays",
    ],
    solutionSection: {
      title: "The Solution: Syndication",
      boxes: [
        { icon: <Globe size={14} strokeWidth={2} />, label: "Instant Multi-Platform Reach", body: "AutoTrader, Cars.com, KBB, Facebook and Instagram in one action." },
        { icon: <Wand2 size={14} strokeWidth={2} />, label: "Marketplace-Specific Formatting", body: "Aspect ratios, specs and character limits matched per platform." },
        { icon: <Send size={14} strokeWidth={2} />,  label: "Safe Publish Tracking",       body: "Confirms each listing published safely. Status synced to IMS." },
      ],
    },
    bullets: [
      "Select listings to syndicate",
      "Pick your marketplaces",
      "One-click publish",
      "Track listing health",
    ],
    bulletStyle: "nodes",
    heroNode: <SyndicationHero />,
    actionLabel: "Syndicate all 156",
  },
  aging: {
    accent: "#DC2626",
    step: "Step 05 · Studio AI · Smart Campaigns",
    product: "Smart Campaigns",
    punchline: "Right offer. Right car. Right time.",
    tagline: "Run visual promotions across your entire inventory automatically. No briefing cycle, no manual updates.",
    problem:
      "Dealership campaigns are fragmented, manual, and easy to miss. Promotions expire unnoticed, aged inventory looks identical to fresh arrivals, and every deal becomes a price negotiation when your value goes unseen.",
    problemChips: [
      "Promotions Expire Unnoticed",
      "Aged Inventory Invisible",
      "Manual Campaign Setup",
      "Inconsistent Brand Presence",
      "Competing on Price Alone",
      "Value Goes Unseen",
      "Missed Seasonal Timing",
    ],
    solutionSection: {
      title: "The Solution: Smart Campaigns",
      boxes: [
        { icon: <Sparkles size={14} strokeWidth={2} />,  label: "Automated Visual Promotions", body: "Overlays, billboards and dynamic text applied across your inventory automatically." },
        { icon: <Timer size={14} strokeWidth={2} />,     label: "Aged Inventory Targeting",    body: "Listings past 30 days get a visual urgency push automatically." },
        { icon: <Building2 size={14} strokeWidth={2} />, label: "Multi-Rooftop Campaigns",     body: "One campaign across all locations. Every listing stays on-brand." },
      ],
    },
    bullets: [
      "Set up your creatives",
      "Build campaign rules",
      "Preview per VIN",
      "Launch and run automatically",
    ],
    bulletStyle: "nodes",
    heroNode: <SmartCampaignsHero />,
    features: [
      { icon: <Sparkles size={16} strokeWidth={2.2} />,  title: "Targeted Audiences", tagline: "In-market shoppers, auto-segmented.", accent: "#DC2626" },
      { icon: <Timer size={16} strokeWidth={2.2} />,     title: "Holding-Cost ROI",   tagline: "$/day math on every campaign run.",  accent: "#F59E0B" },
      { icon: <Building2 size={16} strokeWidth={2.2} />, title: "Group-Wide",         tagline: "Roll the same campaign across lots.", accent: "#4600F2" },
    ],
    featuresPhase: "success",
    actionLabel: "Launch campaigns",
  },
};

type Scene = "connect" | "loading" | "synced" | "scanning" | "dashboard";

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

// KPI lookup — index = number of resolved buckets (now 5 buckets, 6 steps)
const DTF_BY_STEP   = [14,  12,  10,  8,    6,    5];
// Inventory Score is on a 0-10 scale (rendered as a half-donut gauge)
const SCORE_BY_STEP = [4.2, 5.3, 6.4, 7.5,  8.4,  9.1];
// Total holding cost still accruing each step — starts at the dealership's
// baseline exposure and drops as each bucket is resolved. Decrease = good.
const HOLDING_COST_BY_STEP = [52_500, 48_200, 43_600, 37_300, 27_900, 10_000];

// Per-step drop in holding cost (used by the success banner's "+$N saved" chip).
function holdingCostSavedAtStep(step: number): number {
  if (step <= 0 || step >= HOLDING_COST_BY_STEP.length) return 0;
  return HOLDING_COST_BY_STEP[step - 1] - HOLDING_COST_BY_STEP[step];
}

const BUCKET_TOTALS: Record<BucketKey, number> = {
  raw: 89,
  nophoto: 23,
  cgi: 134,
  unsyndicated: 156,
  aging: 34,
};

// ─── Seed inventory ──────────────────────────────────────────────────────────
// 19 vehicles — new-vehicle inventory (2024/2025 model year). Bucket membership
// is derived from per-vehicle flags via computeBucket() below.
const SEED: VehicleState[] = [
  // ── Raw bucket (10) ──
  ...rawSeed(1,  "2025 Honda CR-V EX-L",            "STK-4012", "VIN5FJRW1H8XPL", "$36,500"),
  ...rawSeed(2,  "2025 Toyota RAV4 XLE Premium",    "STK-4015", "VIN2T3W1RFV0SC", "$34,900"),
  ...rawSeed(3,  "2024 Hyundai Tucson SEL",         "STK-4017", "VIN5NMJBCAE7RH", "$31,200"),
  ...rawSeed(4,  "2025 Mazda CX-5 Carbon Turbo",    "STK-4019", "VINJM3KFBCM9R0", "$37,800"),
  ...rawSeed(5,  "2025 Subaru Forester Sport",      "STK-4022", "VIN4S4BTGND1S3", "$33,600"),
  ...rawSeed(30, "2025 Honda Civic Sport Touring",  "STK-4023", "VIN2HGFE2F50RH", "$28,400"),
  ...rawSeed(31, "2025 Toyota Camry SE Hybrid",     "STK-4024", "VIN4T1B11HK1SU", "$29,950"),
  ...rawSeed(32, "2024 Hyundai Elantra N Line",     "STK-4025", "VINKMHLM4AG7RU", "$26,800"),
  ...rawSeed(33, "2025 Kia Telluride EX",           "STK-4026", "VIN5XYP3DHC7SG", "$44,500"),
  ...rawSeed(34, "2025 Ford Edge ST-Line",          "STK-4027", "VIN2FMPK4J96RB", "$41,200"),

  // ── No-photo bucket (10): mostly pure, 4 also aging ──
  ...noPhotoSeed(6,  "2025 Nissan Rogue SV",        "STK-4031", "VIN5N1AT3CBXSC", "$32,400", false),
  ...noPhotoSeed(7,  "2024 Volkswagen Tiguan SE",   "STK-4034", "VIN3VV2B7AX7RM", "$30,900", false),
  ...noPhotoSeed(8,  "2024 Kia Sportage X-Line",    "STK-3955", "VIN5XYK3CAF9RG", "$33,100", true),
  ...noPhotoSeed(9,  "2024 Ford Bronco Sport BL",   "STK-3941", "VIN3FMCR9C66RR", "$34,800", true),
  ...noPhotoSeed(35, "2025 Chevrolet Trax LT",      "STK-4035", "VINKL77LJE26SB", "$24,300", false),
  ...noPhotoSeed(36, "2025 Subaru Crosstrek Sport", "STK-4036", "VIN4S4GUHF67S3", "$31,750", false),
  ...noPhotoSeed(37, "2024 Jeep Wrangler Sahara",   "STK-3942", "VIN1C4HJXEG2RW", "$42,950", true),
  ...noPhotoSeed(38, "2024 Toyota 4Runner TRD",     "STK-3950", "VINJTEBU5JR8RX", "$48,600", true),
  ...noPhotoSeed(39, "2025 Mazda CX-30 Turbo",      "STK-4038", "VIN3MVDMBCM8SM", "$33,900", false),
  ...noPhotoSeed(40, "2025 Volkswagen Atlas SEL",   "STK-4039", "VIN1V2BR2CA6SC", "$45,800", false),

  // ── CGI bucket (10) — premium inventory worth elevating to CGI-grade ──
  ...cgiSeed(20, "2025 BMW X5 xDrive40i",           "STK-4060", "VIN5UXCR6C04PL", "$67,400"),
  ...cgiSeed(21, "2025 Mercedes-Benz GLE 350",      "STK-4063", "VIN4JGFB4FB4SA", "$72,900"),
  ...cgiSeed(22, "2025 Audi Q5 Premium Plus",       "STK-4066", "VINWA1BAAFY8R2", "$58,500"),
  ...cgiSeed(23, "2025 Lexus RX 350 Luxury",        "STK-4069", "VIN2T2BAMCA3SC", "$63,200"),
  ...cgiSeed(41, "2025 Cadillac XT5 Premium",       "STK-4071", "VIN1GYKNDRS9SZ", "$55,400"),
  ...cgiSeed(42, "2025 Acura MDX A-Spec",           "STK-4073", "VIN5J8YE1H50SL", "$57,800"),
  ...cgiSeed(43, "2025 Volvo XC60 Plus B5",         "STK-4075", "VINYV4L12RK9S1", "$54,950"),
  ...cgiSeed(44, "2025 Genesis GV70 Sport",         "STK-4077", "VINKMUH4DTC9SU", "$61,300"),
  ...cgiSeed(45, "2025 Lincoln Nautilus Reserve",   "STK-4079", "VIN2LMPJ8K94RB", "$59,750"),
  ...cgiSeed(46, "2025 Infiniti QX60 Sensory",      "STK-4081", "VIN5N1DL1FS4SC", "$62,400"),

  // ── Unsyndicated bucket (10) ──
  ...unsynSeed(10, "2025 Chevrolet Equinox RS",     "STK-4040", "VIN3GNAXKEV2SL", "$32,750"),
  ...unsynSeed(11, "2025 GMC Terrain Denali",       "STK-4042", "VIN3GKAL5EX3SL", "$39,500"),
  ...unsynSeed(12, "2025 Jeep Compass Limited",     "STK-4044", "VIN3C4NJDCB7ST", "$33,200"),
  ...unsynSeed(13, "2024 Buick Envista Avenir",     "STK-4047", "VINKL77LFE2XRB", "$31,800"),
  ...unsynSeed(14, "2025 Hyundai Kona N Line",      "STK-4050", "VINKM8K3CAB9SU", "$29,400"),
  ...unsynSeed(47, "2025 Honda Passport TrailSport","STK-4052", "VIN5FNYF8H58SB", "$45,200"),
  ...unsynSeed(48, "2024 Nissan Murano Platinum",   "STK-4054", "VIN5N1AZ2DJ6RC", "$42,900"),
  ...unsynSeed(49, "2025 Kia Sorento X-Pro",        "STK-4056", "VIN5XYRH4LFXSG", "$41,600"),
  ...unsynSeed(50, "2025 Ford Escape ST-Line Plus", "STK-4058", "VIN1FMCU0H66RB", "$36,800"),
  ...unsynSeed(51, "2024 Mazda CX-50 Turbo Premium","STK-4061", "VIN7MMVABDM3RN", "$39,950"),

  // ── Aging bucket (10) — past frontline target, holding cost climbing ──
  ...agingSeed(15, "2024 Ford Explorer Limited",    "STK-3812", "VIN1FM5K8F8XR0", "$44,200", 48, 1180, 56),
  ...agingSeed(16, "2024 Toyota Highlander LE",     "STK-3805", "VIN5TDADAB04RS", "$41,500", 52, 1305, 64),
  ...agingSeed(17, "2024 Honda Pilot Sport",        "STK-3798", "VIN5FNYG2H50RB", "$45,800", 58, 1490, 78),
  ...agingSeed(18, "2024 Nissan Pathfinder SL",     "STK-3791", "VIN5N1DR3BB1RC", "$42,300", 61, 1620, 92),
  ...agingSeed(19, "2024 Mazda CX-90 Preferred",    "STK-3780", "VINJM3KKBHB1R1", "$46,900", 67, 1830, 118),
  ...agingSeed(52, "2024 Chevrolet Traverse LT",    "STK-3760", "VIN1GNERFKW6RJ", "$39,400", 45, 1080, 48),
  ...agingSeed(53, "2024 GMC Acadia Denali",        "STK-3755", "VIN1GKKNVRS6RZ", "$48,750", 53, 1335, 70),
  ...agingSeed(54, "2024 Subaru Ascent Onyx",       "STK-3748", "VIN4S4WMBKD7R3", "$42,100", 56, 1430, 76),
  ...agingSeed(55, "2024 Hyundai Palisade SEL",     "STK-3740", "VINKM8R3DGE2RU", "$43,800", 64, 1745, 105),
  ...agingSeed(56, "2024 Volkswagen Atlas Cross",   "STK-3732", "VIN1V2GE2CA1RC", "$40,600", 71, 1985, 132),
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

function cgiSeed(id: number, name: string, stk: string, vin: string, price: string): VehicleState[] {
  const r = baseRow(id, name, stk, vin, price);
  // Premium / high-value vehicles already have processed photos but benefit
  // from CGI-grade renders for OEM-tier marketplaces.
  return [{
    ...r,
    mediaState: "processed",
    mediaScore: 8.4,
    daysToFrontline: 3,
    initialBuckets: ["cgi"],
  }];
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
    publishedAt: new Date(Date.now() - age * 86400000).toISOString(),
    initialBuckets: ["aging"],
  }];
}

function ageToDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}, 09:15 AM`;
}

// Canonical bucket order — also drives the "Move on to next" CTA suggestion.
const BUCKET_ORDER: BucketKey[] = ["raw", "nophoto", "cgi", "unsyndicated", "aging"];

const NEXT_BUCKET_LABELS: Record<BucketKey, string> = {
  raw:          "Smart Shoot",
  nophoto:      "Smart Match",
  cgi:          "CGI Upgrade",
  unsyndicated: "Syndication",
  aging:        "Smart Campaigns",
};

// Headline copy for the success banner per bucket — referenced by successForActive.
function successTitle(b: BucketKey): string {
  switch (b) {
    case "raw":          return "89 raw listings, now studio grade.";
    case "nophoto":      return "23 dark listings, now SmartMatched.";
    case "cgi":          return "134 stock photos, upgraded to CGI.";
    case "unsyndicated": return "156 listings, now live on every channel.";
    case "aging":        return "34 aged units, now in active campaigns.";
  }
}

// Does a vehicle match a given filter key (bucket cohort or age threshold)?
function matchesFilter(v: VehicleState, f: FilterKey): boolean {
  if (f === "age45") return v.age >= 45;
  if (f === "age60") return v.age >= 60;
  return v.initialBuckets.includes(f);
}

// Priority: raw > nophoto > unsyndicated > aging > done
function computeBucket(v: VehicleState): BucketKey | null {
  if (v.mediaState === "raw") return "raw";
  if (v.noPhoto) return "nophoto";
  if (!v.syndicatedTo?.length) return "unsyndicated";
  if (v.isLoss && !v.campaignActive) return "aging";
  return null;
}

// Channels the syndication picker offers — keeps the side panel digestible
// (6 channels) instead of all 11 in PLATFORMS.
const SYND_CHANNEL_IDS = ["vincue", "autotrader", "cars", "kbb-marketplace", "facebook", "instagram"];
const SYND_CHANNELS = PLATFORMS.filter((p) => SYND_CHANNEL_IDS.includes(p.id));
const SYND_PLATFORMS = SYND_CHANNEL_IDS;

// ─── Component ───────────────────────────────────────────────────────────────

export type Demo2Plan = "pro" | "lite";

// Buckets gated behind the Pro plan when running Demo 2 in "lite" mode.
const LITE_LOCKED_BUCKETS: Set<BucketKey> = new Set(["nophoto", "aging"]);

const UPGRADE_COPY: Record<BucketKey, { feature: string; tagline: string; bullets: string[] } | null> = {
  raw: null,
  nophoto: {
    feature: "SmartMatch",
    tagline: "Publish vehicles before the photoshoot — match media from your existing inventory and go live on Day 0.",
    bullets: [
      "Spec-matched donor media (year, trim, color) per VIN",
      "Eligibility surfaced before commit — AE controls timing",
      "Median IMS → live time drops from 4 days to 4 minutes",
    ],
  },
  cgi: null,
  unsyndicated: null,
  aging: {
    feature: "Smart Campaigns",
    tagline: "Targeted in-market campaigns for aged inventory bleeding holding cost — branded creatives, automated audiences.",
    bullets: [
      "Auto-segmented in-market shopper audiences",
      "Campaign templates: price-drop, finance, trade-in",
      "Average $52K/month in holding-cost recovered",
    ],
  },
};

interface Demo2Props {
  /** "pro" (default) = full demo. "lite" = Demo 3 — SmartMatch & SmartCampaigns gated behind upgrade. */
  plan?: Demo2Plan;
}

export function Demo2({ plan = "pro" }: Demo2Props = {}) {
  const [scene, setScene] = useState<Scene>("connect");
  const [upgradeBucket, setUpgradeBucket] = useState<BucketKey | null>(null);
  const [imsName, setImsName] = useState("Vincue");
  // Pitch panel state — which bucket is "active" for the side-panel pitch.
  // Independent of the dashboard chip multi-select below.
  const [activeBucket, setActiveBucket] = useState<BucketKey | null>(null);
  // Multi-select: any number of filter chips may be lit at once.
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(() => new Set());
  const [pitchOpen, setPitchOpen] = useState(false);
  const [runningBucket, setRunningBucket] = useState<BucketKey | null>(null);
  const [transformingIds, setTransformingIds] = useState<Set<number>>(new Set());
  // Syndication flow: pitch CTA opens Demo 1's PublishModal for channel selection
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  // Smart Campaign two-step flow state
  const [campaignSelectionMode, setCampaignSelectionMode] = useState(false);
  const [smartCampaignModalOpen, setSmartCampaignModalOpen] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(true);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<number>>(new Set());

  const [dashboardView, setDashboardView] = useState<DashboardView>("current");
  // Syndication channel selection — defaults to all available channels.
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(() => new Set(SYND_CHANNEL_IDS));
  const [vehicles, setVehicles] = useState<VehicleState[]>(SEED);
  const [completed, setCompleted] = useState<Record<BucketKey, boolean>>({
    raw: false, nophoto: false, cgi: false, unsyndicated: false, aging: false,
  });

  const completedCount = Object.values(completed).filter(Boolean).length;
  // "Before" view freezes the dashboard at step 0 with no buckets resolved.
  // "Current" view tracks live progress.
  const isBeforeView = dashboardView === "before";
  const effectiveStep = isBeforeView ? 0 : completedCount;
  const dtf = DTF_BY_STEP[effectiveStep];
  const score = SCORE_BY_STEP[effectiveStep];
  const holdingCost = HOLDING_COST_BY_STEP[effectiveStep];
  // Persistent uplift since the previous resolved bucket (used by the KPI bar
  // to show e.g. "+2 days saved" / "+1.1" next to the current value).
  // In Before view we suppress uplifts since there's no preceding step.
  const prevDtf   = !isBeforeView && completedCount > 0 ? DTF_BY_STEP[completedCount - 1]   : null;
  const prevScore = !isBeforeView && completedCount > 0 ? SCORE_BY_STEP[completedCount - 1] : null;
  const prevHoldingCost = !isBeforeView && completedCount > 0 ? HOLDING_COST_BY_STEP[completedCount - 1] : null;
  const dtfUplift   = prevDtf   != null ? prevDtf - dtf : 0;
  const scoreUplift = prevScore != null ? score - prevScore : 0;
  // Positive = holding cost dropped this step (good).
  const holdingCostDrop = prevHoldingCost != null ? prevHoldingCost - holdingCost : 0;

  const buckets: Record<BucketKey, BucketState> = useMemo(() => ({
    raw:          { count: BUCKET_TOTALS.raw,          completed: isBeforeView ? false : completed.raw },
    nophoto:      { count: BUCKET_TOTALS.nophoto,      completed: isBeforeView ? false : completed.nophoto },
    cgi:          { count: BUCKET_TOTALS.cgi,          completed: isBeforeView ? false : completed.cgi },
    unsyndicated: { count: BUCKET_TOTALS.unsyndicated, completed: isBeforeView ? false : completed.unsyndicated },
    aging:        { count: BUCKET_TOTALS.aging,        completed: isBeforeView ? false : completed.aging },
  }), [completed, isBeforeView]);

  // Before view freezes vehicle state to the SEED (no transformations applied);
  // Current view uses the live `vehicles` state that mutates as buckets resolve.
  const visibleVehicles = isBeforeView ? SEED : vehicles;
  // Union semantics — a vehicle is visible if it matches ANY active filter.
  // Empty set = no filter, show everything.
  const visibleRows: Row[] = useMemo(() => {
    if (activeFilters.size === 0) return visibleVehicles;
    return visibleVehicles.filter((v) => {
      for (const f of activeFilters) {
        if (matchesFilter(v, f)) return true;
      }
      return false;
    });
  }, [visibleVehicles, activeFilters]);

  // Selecting a filter no longer tints the rows — the table stays white. Row
  // colour is reserved for the transformation animation (purple shimmer) only.
  const highlightIds = useMemo(() => new Set<number>(), []);

  // ─── Scene 1: Connect → Loading → Scanning ──
  // pick an IMS → inventory fetch/sync animation → live scan → dashboard.
  const handleImport = useCallback((name: string) => {
    setImsName(name);
    setScene("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setScene("synced");
  }, []);

  // Synced screen — AE clicks the "Scan your inventory" button on the Figma
  // import; we walk up the DOM to detect that text on the click target.
  const handleSyncedClick = useCallback((e: React.MouseEvent) => {
    let el: HTMLElement | null = e.target as HTMLElement;
    while (el) {
      if (el.textContent?.toLowerCase().includes("scan your inventory")) {
        setScene("scanning");
        return;
      }
      el = el.parentElement;
    }
  }, []);

  const handleScanComplete = useCallback(() => {
    setScene("dashboard");
  }, []);

  // ─── Bucket click → filter + open pitch (no transformation yet) ──
  // Opening a pitch resets the chip multi-select to just that bucket so the
  // dashboard always agrees with the pitch panel. (Users can multi-select
  // chips again afterwards without touching the FAB.)
  const handleBucketClick = useCallback((b: BucketKey) => {
    setActiveBucket((prev) => prev === b ? prev : b);
    setActiveFilters(new Set([b]));
    setPitchOpen(true);
    setFabExpanded(false);
  }, []);

  const handleClearBucket = useCallback(() => {
    setActiveBucket(null);
    setActiveFilters(new Set());
    setPitchOpen(false);
  }, []);

  // Filter chips toggle in/out of a multi-select set. Aging-related chips
  // (Aging Units, >45+ Days, >60+ Days) also drive the SelectionActionBar by
  // auto-adding their matches when toggled on.
  const handleFilterChange = useCallback((f: FilterKey | null) => {
    setCampaignSelectionMode(false);

    if (f === null) {
      setActiveFilters(new Set());
      setSelectedVehicleIds(new Set());
      return;
    }

    setActiveFilters((prev) => {
      const next = new Set(prev);
      const wasActive = next.has(f);
      if (wasActive) next.delete(f); else next.add(f);

      // Recompute auto-selection from the post-toggle set of aging-ish filters
      const agingActive: FilterKey[] = [];
      for (const k of next) {
        if (k === "aging" || k === "age45" || k === "age60") agingActive.push(k);
      }
      if (agingActive.length === 0) {
        setSelectedVehicleIds(new Set());
      } else {
        const ids = new Set<number>();
        for (const af of agingActive) {
          for (const v of vehicles) {
            if (matchesFilter(v, af)) ids.add(v.id);
          }
        }
        setSelectedVehicleIds(ids);
      }
      return next;
    });
  }, [vehicles]);

  // ─── Run the actual transformation animation on the affected rows ──
  // Used by both the FAB's Transform button and (for aging) the Create-Campaign FAB.
  const runTransform = useCallback((bucket: BucketKey, options?: { platforms?: string[] }) => {
    // Defense-in-depth: Lite plan absolutely cannot process gated buckets.
    // No matter which UI path tries to invoke this — pitch CTA, SmartCampaign
    // modal pick, syndication publish — a locked bucket diverts to the
    // upgrade modal instead of running the transform.
    if (plan === "lite" && LITE_LOCKED_BUCKETS.has(bucket)) {
      setUpgradeBucket(bucket);
      return;
    }
    if (runningBucket || completed[bucket]) return;
    // Snapshot which vehicle IDs will be touched so the row shimmer targets them
    const targetIds = new Set(
      vehicles.filter((v) => v.initialBuckets.includes(bucket)).map((v) => v.id)
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
    // Close the pitch drawer so the magic animation plays on the full dashboard
    setPitchOpen(false);

    // 3.0s shimmer pass → then apply state + clear the running flag
    setTimeout(() => {
      setVehicles((vs) => vs.map((v) => applyAction(v, bucket, options)));
      setCompleted((c) => ({ ...c, [bucket]: true }));
      setTransformingIds(new Set());
      setRunningBucket(null);
      // Re-open the drawer to reveal the success state of the same pitch
      setPitchOpen(true);
    }, 3000);
  }, [vehicles, runningBucket, completed]);

  // Center-of-dashboard overlay label while a transform animation is playing.
  const TRANSFORM_OVERLAY_LABELS: Record<BucketKey, string> = {
    raw:          "Transforming your inventory",
    nophoto:      "Applying Smart Match",
    cgi:          "Applying Studio AI",
    unsyndicated: "Syndicating to channels",
    aging:        "Launching Smart Campaigns",
  };

  // From the SmartCampaign pitch CTA → close pitch, minimise the Need Actions
  // FAB, auto-select all aging vehicles, and surface the SelectionActionBar so
  // the AE can act on the cohort just like Demo 1's >40-day flow.
  const handleAgingPitchContinue = useCallback(() => {
    // Lite plan: Smart Campaigns is gated. Route to the upgrade modal.
    if (plan === "lite") {
      setUpgradeBucket("aging");
      return;
    }
    setPitchOpen(false);
    setFabExpanded(false);
    const agingIds = new Set(
      vehicles.filter((v) => v.initialBuckets.includes("aging")).map((v) => v.id)
    );
    setSelectedVehicleIds(agingIds);
    setCampaignSelectionMode(true);
    setActiveBucket("aging"); // filter the list to aging too
  }, [vehicles, plan]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleCloseSelectionBar = useCallback(() => {
    setCampaignSelectionMode(false);
    setSelectedVehicleIds(new Set());
  }, []);

  // From SmartCampaignModal "pick a template" → fire the actual transform
  const handleCampaignPick = useCallback(() => {
    setSmartCampaignModalOpen(false);
    setCampaignSelectionMode(false);
    setSelectedVehicleIds(new Set());
    runTransform("aging");
  }, [runTransform]);

  if (scene === "connect") {
    return (
      <div className="size-full">
        <IMSImportScreen onImport={handleImport} />
      </div>
    );
  }
  if (scene === "loading") {
    return (
      <div className="size-full overflow-auto">
        <LoadingScreen onComplete={handleLoadingComplete} />
      </div>
    );
  }
  if (scene === "synced") {
    return (
      <div className="size-full overflow-auto" onClick={handleSyncedClick}>
        <Frame31 />
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
    <div className="size-full relative">
      <Demo2Dashboard
        dtf={dtf}
        score={score}
        holdingCost={holdingCost}
        dtfUplift={dtfUplift}
        scoreUplift={scoreUplift}
        holdingCostDrop={holdingCostDrop}
        buckets={buckets}
        activeFilters={activeFilters}
        onBucketClick={handleBucketClick}
        onFilterChange={handleFilterChange}
        onClearBucket={handleClearBucket}
        rows={visibleRows}
        highlightIds={highlightIds}
        transformingIds={transformingIds}
        selectedIds={selectedVehicleIds}
        onToggleSelect={handleToggleSelect}
      />

      <InventoryDiagnosticFab
        buckets={buckets}
        activeBucket={activeBucket}
        onBucketClick={handleBucketClick}
        expanded={fabExpanded}
        onExpandedChange={setFabExpanded}
      />

      <BeforeAfterToggle active={dashboardView} onChange={setDashboardView} />

      {/* Selection action bar — surfaces during the Smart Campaign flow */}
      <SelectionActionBar
        open={selectedVehicleIds.size > 0}
        count={selectedVehicleIds.size}
        onClose={handleCloseSelectionBar}
        onSmartCampaign={() => setSmartCampaignModalOpen(true)}
        onExport={() => { /* AE narration only */ }}
        onDownload={() => { /* AE narration only */ }}
        skipDeck
      />

      {/* "Where do you want to publish?" — Demo 1's PublishModal */}
      <PublishModal
        open={publishModalOpen}
        totalListings={BUCKET_TOTALS.unsyndicated}
        onClose={() => setPublishModalOpen(false)}
        onPublish={(ids) => {
          setPublishModalOpen(false);
          runTransform("unsyndicated", { platforms: ids });
        }}
      />

      {/* Suggested campaign templates — reuses Demo 1's modal */}
      <SmartCampaignModal
        open={smartCampaignModalOpen}
        selectedCount={selectedVehicleIds.size}
        onClose={() => setSmartCampaignModalOpen(false)}
        onPick={handleCampaignPick}
      />

      {pitchContent && (() => {
        const isSyndication = activeBucket === "unsyndicated";
        // Demo 3 (lite) gates SmartMatch + SmartCampaigns. The pitch still
        // shows in full, but the CTA becomes a gradient "Contact Sales" button
        // that opens the UpgradeModal instead of running the transform.
        const isLocked = plan === "lite"
          && !!activeBucket
          && LITE_LOCKED_BUCKETS.has(activeBucket)
          && !completed[activeBucket];

        // ── Success banner data ──────────────────────────────────────────
        // When the active bucket has been resolved, compute the lift it gave —
        // the deltas between its step and the step before it.
        const bucketStep = activeBucket ? BUCKET_ORDER.indexOf(activeBucket) + 1 : 0;
        const successForActive = (activeBucket && completed[activeBucket] && bucketStep > 0) ? {
          dtfSaved:    DTF_BY_STEP[bucketStep - 1] - DTF_BY_STEP[bucketStep],
          scoreGained: SCORE_BY_STEP[bucketStep] - SCORE_BY_STEP[bucketStep - 1],
          scoreBefore: SCORE_BY_STEP[bucketStep - 1],
          scoreAfter:  SCORE_BY_STEP[bucketStep],
          savedDollars: holdingCostSavedAtStep(bucketStep),
          title: successTitle(activeBucket),
        } : undefined;

        // Resolve which CTA the pitch should currently show
        let label: string;
        let onAction: () => void;
        if (isLocked) {
          // Lite plan: SmartMatch / SmartCampaigns are upsells.
          label = "Upgrade to Pro · Contact Sales";
          onAction = () => setUpgradeBucket(activeBucket!);
        } else if (isActiveCompleted) {
          if (nextBucket) {
            label = `Next up: ${NEXT_BUCKET_LABELS[nextBucket]}`;
            onAction = () => {
              setActiveBucket(nextBucket);
              setActiveFilters(new Set([nextBucket]));
              setPitchOpen(true);
              setFabExpanded(false);
            };
          } else {
            label = "Inventory is sale-ready — close";
            onAction = () => setPitchOpen(false);
          }
        } else if (isAgingPitch) {
          label = "Continue to campaign builder";
          onAction = handleAgingPitchContinue;
        } else if (isSyndication) {
          // Clicking Syndicate closes the pitch panel and opens Demo 1's
          // PublishModal — the proper "where do you want to publish?" picker.
          label = pitchContent.actionLabel;
          onAction = () => {
            setPitchOpen(false);
            setPublishModalOpen(true);
          };
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
            completed={false}
            {...pitchContent}
            success={successForActive}
            actionLabel={label}
            locked={isLocked}
            metricsStep={activeBucket ?? undefined}
            completedSteps={completedCount}
          />
        );
      })()}

      {/* Center-of-dashboard label while the magic animation is playing */}
      {runningBucket && (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="demo2-transform-overlay flex items-center gap-[14px] px-[26px] py-[16px] rounded-[16px] bg-white/95 backdrop-blur-[6px]"
            style={{
              boxShadow: "0 12px 40px rgba(16,185,129,0.18), 0 2px 6px rgba(0,0,0,0.06)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <span className="relative inline-flex size-[14px] shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#10B981] opacity-60 animate-ping" />
              <span className="relative inline-flex size-[14px] rounded-full bg-[#10B981]" />
            </span>
            <p className="text-[15px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-none">
              {TRANSFORM_OVERLAY_LABELS[runningBucket]}
              <span className="demo2-transform-dots ml-[2px]" />
            </p>
          </div>
        </div>
      )}

      {/* Demo 3 (lite plan) — upgrade gate for SmartMatch / SmartCampaigns */}
      {upgradeBucket && (() => {
        const copy = UPGRADE_COPY[upgradeBucket];
        if (!copy) return null;
        return (
          <UpgradeModal
            open={!!upgradeBucket}
            feature={copy.feature}
            tagline={copy.tagline}
            bullets={copy.bullets}
            onClose={() => setUpgradeBucket(null)}
          />
        );
      })()}
    </div>
  );
}

// ─── Action transitions ──────────────────────────────────────────────────────
// Gate by initialBuckets — the cohort a vehicle was diagnosed into doesn't
// change, even as its state migrates through transformations.
function applyAction(
  v: VehicleState, bucket: BucketKey, options?: { platforms?: string[] }
): VehicleState {
  if (!v.initialBuckets.includes(bucket)) return v;

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
    case "cgi":
      return {
        ...v,
        ...stamp,
        cgiUpgraded: true,
        mediaState: "processed",
        mediaScore: 9.6,
        daysToFrontline: 2,
      };
    case "unsyndicated":
      return {
        ...v,
        ...stamp,
        syndicatedTo: options?.platforms ?? SYND_PLATFORMS,
        publishedAt: new Date().toISOString(),
      };
    case "aging":
      return { ...v, ...stamp, campaignActive: true };
  }
}
