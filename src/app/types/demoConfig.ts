/**
 * DemoConfig — prospect inputs captured on the Demo Setup Screen.
 * Flows through the entire product so every number in the demo
 * reflects the prospect's actual situation, not hardcoded defaults.
 */
export interface DemoConfig {
  // ── Identity ──────────────────────────────────────────────────────────
  aeName: string;
  dealershipName: string;
  imsProvider: string;

  // ── Dealership profile (discovery) ────────────────────────────────────
  numRooftops: string;        // "1" | "2-3" | "4-7" | "8+"
  inventoryMix: string;       // "New only" | "Used only" | "Both New & Used"
  totalInventory: number;     // total units on lot (monthly units photographed)

  // ── Operations (discovery inputs — drive the financial model) ─────────
  daysToLiveChip: string;     // "1-2 days" | "3-5 days" | "6-9 days" | "10+ days"
  photographyProcess: string; // "In-house team" | "3rd party vendor" | "Freelancer" | "No consistent process"
  mediaFormats: string[];     // multi-select

  // ── Pain points & spend (discovery context) ───────────────────────────
  painPoints: string[];
  monthlyPhotographySpend: string; // bucketed range (fill either this or perVinCost)
  perVinCost: number;              // per-VIN photography cost in $ (default $20)

  // ── Financial inputs ──────────────────────────────────────────────────
  monthlySalesVolume: number;
  holdingCostPerDay: number;
  holdingCostChip: string;    // "$40" | "$43" | "$46" | "$50" | "Custom"
}

// ── Chip-to-value maps (exported so the screen can read them) ───────────────

/**
 * Maps the "days to go-live" chip selection to a numeric days value
 * used in the frontline gap calculation.
 * Gold standard per playbook Ch.4: < 3 days. Studio AI target: 1 day.
 */
export const DAYS_TO_LIVE_MAP: Record<string, number> = {
  "1-2 days": 2,
  "3-5 days": 4,
  "6-9 days": 7,
  "10+ days": 12,
};

/**
 * Maps photography process to estimated % of inventory without photos.
 * Used to calculate media gap cost (playbook Ch.4 §6: Invisible Inventory).
 * Each unlisted unit costs $200-$300/week in missed leads.
 */
export const PHOTO_PROCESS_GAP_MAP: Record<string, number> = {
  "In-house team": 15,
  "3rd party vendor": 20,
  "Freelancer": 30,
  "No consistent process": 40,
};

/** Midpoint estimates for monthly photography spend buckets. */
export const PHOTOGRAPHY_SPEND_MAP: Record<string, number> = {
  "Under $5K": 4000,
  "$5K-$10K": 7500,
  "$10K-$20K": 15000,
  "$20K-$50K": 35000,
  "Over $50K": 60000,
};

export function calcPhotographyCostMonthly(c: DemoConfig): number {
  if (c.monthlyPhotographySpend && PHOTOGRAPHY_SPEND_MAP[c.monthlyPhotographySpend]) {
    return PHOTOGRAPHY_SPEND_MAP[c.monthlyPhotographySpend];
  }
  return c.perVinCost * c.totalInventory;
}

export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  aeName: "",
  dealershipName: "",
  imsProvider: "Vincue",

  numRooftops: "",
  inventoryMix: "",
  totalInventory: 200,

  daysToLiveChip: "",
  photographyProcess: "",
  mediaFormats: [],

  painPoints: [],
  monthlyPhotographySpend: "",
  perVinCost: 20,

  monthlySalesVolume: 100,
  holdingCostPerDay: 46,
  holdingCostChip: "$46",
};

// ── Derived opportunity numbers ─────────────────────────────────────────────
// Used on the setup screen AND in the demo to show consistent math.

export function calcOpportunity(c: DemoConfig) {
  // Derive operational values from chip selections
  const currentDaysToFrontline = DAYS_TO_LIVE_MAP[c.daysToLiveChip] ?? 12;
  const pctWithoutPhotos = PHOTO_PROCESS_GAP_MAP[c.photographyProcess] ?? 30;

  // Media gap: estimated unlisted units × $220/wk × 4 weeks
  // Source: playbook Ch.4 §6 — each unlisted unit costs $200-$300/week in missed leads
  const vehiclesNoPhotos = Math.round((pctWithoutPhotos / 100) * c.totalInventory);
  const mediaGapMonthly = vehiclesNoPhotos * 220 * 4;

  // Frontline gap: days above 1-day Studio AI target × holding cost × monthly throughput
  const frontlineGapDays = Math.max(0, currentDaysToFrontline - 1);
  const frontlineMonthly = frontlineGapDays * c.holdingCostPerDay * c.monthlySalesVolume;

  // Aged inventory: ~15% of lot at 45+ days × holding cost × 30 days
  // Source: playbook Ch.5 §4 — aged % target < 10%, industry avg ~15%
  const agedVehicles = Math.round(c.totalInventory * 0.15);
  const agedMonthly = agedVehicles * c.holdingCostPerDay * 30;

  const totalMonthly = mediaGapMonthly + frontlineMonthly + agedMonthly;

  // Break-even day: $3,500 avg front gross / holding cost per day (playbook Ch.6)
  const breakEvenDay = c.holdingCostPerDay > 0 ? Math.round(3500 / c.holdingCostPerDay) : 76;

  const photographyCostMonthly = calcPhotographyCostMonthly(c);

  return {
    currentDaysToFrontline,
    pctWithoutPhotos,
    vehiclesNoPhotos,
    mediaGapMonthly,
    photographyCostMonthly,
    frontlineGapDays,
    frontlineMonthly,
    agedVehicles,
    agedMonthly,
    totalMonthly,
    breakEvenDay,
  };
}
