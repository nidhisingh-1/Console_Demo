import { Demo2 } from "./Demo2";

/**
 * Demo 3 = Demo 2 running in the "lite" plan: same flow, same screens, but the
 * SmartMatch (no-photo) and SmartCampaigns (aging) pitch CTAs are replaced
 * with a gradient "Upgrade to Pro · Contact Sales" button that opens
 * UpgradeModal instead of running the transform.
 */
export function Demo3() {
  return <Demo2 plan="lite" />;
}
