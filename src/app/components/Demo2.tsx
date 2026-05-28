import { useCallback, useMemo, useState } from "react";
import {
  Image as ImageIcon, RotateCw, Film, Rocket, Calendar, Search,
  Send, Layers, Globe, Sparkles, Timer, Building2, Wand2,
} from "lucide-react";
import { IMSImportScreen } from "./IMSImportScreen";
import { ScanningScreen } from "./ScanningScreen";
import { LoadingScreen } from "./LoadingScreen";
import { Demo2Dashboard, type BucketKey, type BucketState } from "./Demo2Dashboard";
import { PitchPanel, type PitchContent } from "./shared/PitchPanel";
import { InventoryDiagnosticFab } from "./InventoryDiagnosticFab";
import { BeforeAfterToggle, type DashboardView } from "./BeforeAfterToggle";
import { SelectionActionBar } from "./SelectionActionBar";
import { SmartCampaignModal } from "./SmartCampaignModal";
import { PublishModal } from "./PublishModal";
import { UpgradeModal } from "./UpgradeModal";
import type { Row } from "./shared/VehicleRow";
import { PLATFORMS } from "./publishPlatforms";
import imgMerchandising from "../assets/merchandising-example.png";
import imgSmartMatch from "../assets/smart-match-example.png";
import imgCampaigns from "../assets/smart-campaigns-example.png";
import imgRawExterior from "../assets/vehicle/raw-exterior-1.jpg";
import imgStudioExterior from "../assets/vehicle/studio-exterior-1.jpg";
import imgCgiFront from "../assets/vehicle/cgi-front.jpg";
import imgCgiTransformed from "../assets/vehicle/cgi-transformed-front.jpg";
import { ImageOff } from "lucide-react";

// ─── Pitch content — uses Demo 1's hero artwork and feature card structure so
//     the Demo 2 side panel feels like an extension of the Demo 1 transformation
//     journey (same imagery, same product story).
const PITCHES: Record<BucketKey, PitchContent> = {
  raw: {
    accent: "#F59E0B",
    step: "Step 01 · Smart Suite · Merchandising",
    product: "Studio AI.",
    punchline: "Studio media, without the studio.",
    tagline: "Smartphone in, brand-perfect media out — in minutes.",
    problem:
      "89 vehicles have raw photos sitting in the IMS — parking-lot backgrounds, mixed lighting, no 360. They're listable, but they don't convert.",
    bullets: [
      "Studio backgrounds applied to existing photos with 1-click",
      "360° spin + dealership-branded video tour auto-generated",
      "Shadow, plate-blur, and color-correct baked into every output",
    ],
    proof: { value: "+34% VDP views", caption: "Average lift on listings upgraded with Spyne studio backgrounds vs. raw lot photos." },
    heroImage: imgMerchandising,
    comparison: {
      beforeLabel: "Raw lot photo",
      afterLabel: "Studio output",
      before: <img src={imgRawExterior} alt="Raw lot photo" className="w-full h-full object-cover" />,
      after:  <img src={imgStudioExterior} alt="Studio output" className="w-full h-full object-cover" />,
    },
    features: [
      { icon: <ImageIcon size={16} strokeWidth={2.2} />, title: "Studio Images",  tagline: "Auto-enhanced, background-removed.", accent: "#3B82F6" },
      { icon: <RotateCw size={16} strokeWidth={2.2} />,  title: "360° Car Tours", tagline: "Stitched and ready in one shoot.",  accent: "#10B981" },
      { icon: <Film size={16} strokeWidth={2.2} />,      title: "Feature Videos", tagline: "Branded clips, made automatically.", accent: "#F59E0B" },
    ],
    actionLabel: "Process all 89",
  },
  nophoto: {
    accent: "#7F6AF2",
    step: "Step 02 · Smart Suite · Acquisition",
    product: "SmartMatch.",
    punchline: "Go live on Day 0.",
    tagline: "Publish before the vehicle even arrives.",
    problem:
      "23 vehicles have no media yet. They're projected as eligible for SmartMatch — same year, trim, and spec as parent inventory we already have media for.",
    bullets: [
      "Eligibility computed from VIN spec, trim, color match, and year",
      "Projected matches surfaced before commit — AE controls when to apply",
      "Parent media adapted per-vehicle so listings don't look duplicated",
    ],
    proof: { value: "0 → live in 4 min", caption: "Median time from IMS arrival to first published listing for SmartMatch-eligible vehicles." },
    heroImage: imgSmartMatch,
    comparison: {
      beforeLabel: "No photo yet",
      afterLabel: "Matched media",
      before: (
        <div className="w-full h-full bg-[#F3F4F6] flex flex-col items-center justify-center gap-[6px] text-[#9CA3AF]">
          <ImageOff size={28} strokeWidth={1.8} />
          <span className="text-[10px] font-semibold text-black/40 uppercase tracking-[0.5px]">Awaiting media</span>
        </div>
      ),
      after: <img src={imgStudioExterior} alt="Matched studio media" className="w-full h-full object-cover" />,
    },
    features: [
      { icon: <Rocket size={16} strokeWidth={2.2} />,   title: "Live Instantly",  tagline: "Skip the shoot. Publish in seconds.", accent: "#4600F2" },
      { icon: <Calendar size={16} strokeWidth={2.2} />, title: "List Pre-Arrival", tagline: "Live days before the car lands.",   accent: "#10B981" },
      { icon: <Search size={16} strokeWidth={2.2} />,   title: "Spec Matching",   tagline: "Year, make, model, trim, colour.",   accent: "#E91E63" },
    ],
    actionLabel: "Match all eligible",
  },
  cgi: {
    accent: "#7C3AED",
    step: "Step 03 · Smart Suite · CGI",
    product: "CGI Studio.",
    punchline: "Photorealistic showroom renders.",
    tagline: "Elevate standard processed photos to CGI-grade renders without a reshoot.",
    problem:
      "134 vehicles have clean processed photos, but the lighting, angles, and backgrounds aren't premium enough to stand out on third-party marketplaces or high-intent OEM placements.",
    bullets: [
      "Vehicle re-lit, rotated, and re-staged in a virtual studio per VIN",
      "Brand backgrounds & color accents matched to your dealership",
      "Multi-angle CGI set — front 3/4, rear 3/4, interior dash — generated together",
    ],
    proof: { value: "+58% engagement", caption: "Median CTR lift on listings with CGI-grade hero images vs. standard processed photos across third-party marketplaces." },
    heroImage: imgCampaigns,
    comparison: {
      beforeLabel: "Standard processed",
      afterLabel: "CGI-grade render",
      before: <img src={imgCgiFront} alt="Standard processed front" className="w-full h-full object-cover" />,
      after:  <img src={imgCgiTransformed} alt="CGI-grade front" className="w-full h-full object-cover" />,
    },
    features: [
      { icon: <Wand2 size={16} strokeWidth={2.2} />,     title: "Virtual Studio", tagline: "Showroom lighting, no studio space.", accent: "#7C3AED" },
      { icon: <ImageIcon size={16} strokeWidth={2.2} />, title: "Brand Match",    tagline: "Backgrounds + color tuned to lot.",   accent: "#3B82F6" },
      { icon: <RotateCw size={16} strokeWidth={2.2} />,  title: "Multi-Angle",    tagline: "Hero, rear 3/4, interior — together.", accent: "#10B981" },
    ],
    actionLabel: "Upgrade all 134 to CGI",
  },
  unsyndicated: {
    accent: "#4600F2",
    step: "Step 03 · Smart Suite · Distribution",
    product: "Syndication.",
    punchline: "Every channel, one click.",
    tagline: "Push every complete listing to the marketplaces that matter.",
    problem:
      "156 vehicles are camera-ready but only live on your dealer site. Marketplaces, social, and OEM partners haven't seen them — that's frontline time you're paying for.",
    bullets: [
      "AutoTrader, Cars.com, KBB, dealer site, Facebook & Instagram in one push",
      "Channel-specific formatting (aspect ratios, character limits) handled per-platform",
      "Status pinged back to the IMS so the AE never re-publishes by accident",
    ],
    proof: { value: "11 channels", caption: "Average syndication reach per vehicle after first publish. Marketplaces alone drive ~62% of inbound leads." },
    // No Demo 1 image for syndication — use the campaign hero as the cleanest stand-in
    heroImage: imgCampaigns,
    features: [
      { icon: <Globe size={16} strokeWidth={2.2} />, title: "Marketplaces",      tagline: "AutoTrader, Cars.com, KBB live.", accent: "#4600F2" },
      { icon: <Send size={16} strokeWidth={2.2} />,  title: "Channel-Aware",     tagline: "Per-platform crops & captions.",   accent: "#0EA5E9" },
      { icon: <Layers size={16} strokeWidth={2.2} />, title: "IMS Sync",         tagline: "Status pings back automatically.", accent: "#10B981" },
    ],
    actionLabel: "Syndicate all 156",
  },
  aging: {
    accent: "#DC2626",
    step: "Step 04 · Smart Suite · Performance",
    product: "Smart Campaigns.",
    punchline: "Win the attention battle.",
    tagline: "Targeted campaigns for aged inventory bleeding holding cost.",
    problem:
      "34 units are past 40 days on lot at $45/day holding cost — that's $1,530+ per car per month evaporating. Generic ads aren't moving them; targeted campaigns can.",
    bullets: [
      "Auto-segmented audiences from in-market shopper data",
      "Campaign template library — price-drop, finance-led, trade-in pitches",
      "Holding-cost math attached to every campaign so the AE proves the ROI",
    ],
    proof: { value: "$52K saved", caption: "Average monthly holding-cost reduction across dealers running Smart Campaigns on >40-day inventory." },
    heroImage: imgCampaigns,
    comparison: {
      beforeLabel: "Standard listing",
      afterLabel: "Campaign-grade",
      before: <img src={imgCgiFront} alt="Standard CGI image" className="w-full h-full object-cover" />,
      after:  <img src={imgCgiTransformed} alt="Campaign-grade CGI" className="w-full h-full object-cover" />,
    },
    features: [
      { icon: <Sparkles size={16} strokeWidth={2.2} />,  title: "Targeted Audiences", tagline: "In-market shoppers, auto-segmented.", accent: "#DC2626" },
      { icon: <Timer size={16} strokeWidth={2.2} />,     title: "Holding-Cost ROI",   tagline: "$/day math attached to every run.", accent: "#F59E0B" },
      { icon: <Building2 size={16} strokeWidth={2.2} />, title: "Group-Wide",         tagline: "Roll the same campaign across lots.", accent: "#4600F2" },
    ],
    actionLabel: "Launch campaigns",
  },
};

type Scene = "connect" | "loading" | "scanning" | "dashboard";

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
// Cumulative holding-cost savings unlocked as each bucket resolves. Numbers
// roughly correspond to (DTF days saved × hold-cost $/day × inventory volume).
const SAVED_BY_STEP = [0,   4_300, 8_900, 15_200, 24_600, 42_500];

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
  raw:          "transform raw photos to studio output",
  nophoto:      "fix no photos with Smart Match",
  cgi:          "upgrade standard photos to CGI-grade renders",
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
  const [activeBucket, setActiveBucket] = useState<BucketKey | null>(null);
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
  const saved = SAVED_BY_STEP[effectiveStep];
  // Persistent uplift since the previous resolved bucket (used by the KPI bar
  // to show e.g. "+2 days saved" / "+1.1" next to the current value).
  // In Before view we suppress uplifts since there's no preceding step.
  const prevDtf   = !isBeforeView && completedCount > 0 ? DTF_BY_STEP[completedCount - 1]   : null;
  const prevScore = !isBeforeView && completedCount > 0 ? SCORE_BY_STEP[completedCount - 1] : null;
  const prevSaved = !isBeforeView && completedCount > 0 ? SAVED_BY_STEP[completedCount - 1] : null;
  const dtfUplift   = prevDtf   != null ? prevDtf - dtf : 0;
  const scoreUplift = prevScore != null ? score - prevScore : 0;
  const savedUplift = prevSaved != null ? saved - prevSaved : 0;

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
  const visibleRows: Row[] = useMemo(() => {
    if (!activeBucket) return visibleVehicles;
    return visibleVehicles.filter((v) => v.initialBuckets.includes(activeBucket));
  }, [visibleVehicles, activeBucket]);

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
    setScene("scanning");
  }, []);

  const handleScanComplete = useCallback(() => {
    setScene("dashboard");
  }, []);

  // ─── Bucket click → filter + open pitch (no transformation yet) ──
  // Opening the pitch also collapses the Need Actions FAB so the side panel
  // has the visual focus.
  const handleBucketClick = useCallback((b: BucketKey) => {
    setActiveBucket((prev) => prev === b ? prev : b);
    setPitchOpen(true);
    setFabExpanded(false);
  }, []);

  const handleClearBucket = useCallback(() => {
    setActiveBucket(null);
    setPitchOpen(false);
  }, []);

  // Filter chips on the dashboard only filter the list — they don't open the
  // pitch panel. The Need Actions FAB is the only entry into the pitch.
  const handleFilterChange = useCallback((b: BucketKey | null) => {
    setActiveBucket(b);
  }, []);

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

    // 1.6s shimmer pass → then apply state + clear the running flag
    setTimeout(() => {
      setVehicles((vs) => vs.map((v) => applyAction(v, bucket, options)));
      setCompleted((c) => ({ ...c, [bucket]: true }));
      setTransformingIds(new Set());
      setRunningBucket(null);
    }, 1600);
  }, [vehicles, runningBucket, completed]);

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
        saved={saved}
        dtfUplift={dtfUplift}
        scoreUplift={scoreUplift}
        savedUplift={savedUplift}
        buckets={buckets}
        activeBucket={activeBucket}
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
        open={campaignSelectionMode && selectedVehicleIds.size > 0}
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
          savedDollars: SAVED_BY_STEP[bucketStep] - SAVED_BY_STEP[bucketStep - 1],
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
            label = `Move on to ${NEXT_BUCKET_LABELS[nextBucket]}`;
            onAction = () => {
              setActiveBucket(nextBucket);
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
          />
        );
      })()}

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
