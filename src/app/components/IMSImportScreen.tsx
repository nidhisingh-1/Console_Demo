import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  ChevronRight, FolderUp, Check, Sparkles, Layers, Globe, Search, X,
} from "lucide-react";
import { AppHeader, AppSidebar } from "./AppShell";

type IMS = {
  id: string;
  name: string;
  tagline: string;
  initials: string;
  bg: string;
  fg: string;
};

const PRIMARY_IMS: IMS[] = [
  { id: "vincue",        name: "Vincue",              tagline: "Inventory & pricing",            initials: "V",   bg: "#1490DF", fg: "#fff" },
  { id: "vinsolutions",  name: "VinSolutions",        tagline: "Cox Automotive",                 initials: "VS",  bg: "#0061FF", fg: "#fff" },
  { id: "dealersocket",  name: "DealerSocket",        tagline: "CRM and inventory",              initials: "DS",  bg: "#E83E54", fg: "#fff" },
  { id: "cdk",           name: "CDK Global",          tagline: "Dealer management",              initials: "CDK", bg: "#00832D", fg: "#fff" },
  { id: "reynolds",      name: "Reynolds & Reynolds", tagline: "Retail management",              initials: "R&R", bg: "#402387", fg: "#fff" },
];

const MORE_IMS: IMS[] = [
  { id: "homenet",     name: "HomeNet Automotive",  tagline: "Cox inventory",                     initials: "HN",  bg: "#0066DA", fg: "#fff" },
  { id: "dealertrack", name: "Dealertrack",         tagline: "Cox dealer management",             initials: "DT",  bg: "#28A8EA", fg: "#fff" },
  { id: "automate",    name: "Auto/Mate",           tagline: "DealerSocket DMS",                  initials: "AM",  bg: "#FF7700", fg: "#fff" },
  { id: "dealercom",   name: "Dealer.com",          tagline: "Website + inventory",               initials: "DC",  bg: "#B651D7", fg: "#fff" },
  { id: "elead",       name: "eLead",               tagline: "CDK customer relationship",         initials: "eL",  bg: "#7F6AF2", fg: "#fff" },
  { id: "autotrader",  name: "AutoTrader Feed",     tagline: "Marketplace listings",              initials: "AT",  bg: "#FFCC00", fg: "#0a0a0a" },
  { id: "carscom",     name: "Cars.com Feed",       tagline: "Marketplace listings",              initials: "C",   bg: "#FF003D", fg: "#fff" },
  { id: "vauto",       name: "vAuto",               tagline: "Cox pricing & inventory",           initials: "vA",  bg: "#5BBFF6", fg: "#fff" },
  { id: "promax",      name: "ProMax",              tagline: "Dealer management",                 initials: "PM",  bg: "#00C488", fg: "#fff" },
  { id: "frazer",      name: "Frazer",              tagline: "Independent dealer",                initials: "Fr",  bg: "#433D4B", fg: "#fff" },
  { id: "dealercenter",name: "DealerCenter",        tagline: "Independent dealer",                initials: "DC",  bg: "#01C6DC", fg: "#fff" },
  { id: "wayne-reaves",name: "Wayne Reaves",        tagline: "Independent dealer",                initials: "WR",  bg: "#ED8939", fg: "#fff" },
  { id: "tekion",      name: "Tekion",              tagline: "Automotive retail cloud",           initials: "Tk",  bg: "#4600F2", fg: "#fff" },
  { id: "quorum",      name: "Quorum",              tagline: "Dealer management",                 initials: "Qm",  bg: "#FFBA00", fg: "#0a0a0a" },
];

const ALL_IMS = [...PRIMARY_IMS, ...MORE_IMS];

// ─── Banner cards ─────────────────────────────────────────────────────────────

function FeatureBanner({
  icon, eyebrow, title, body, accent,
}: { icon: React.ReactNode; eyebrow: string; title: string; body: string; accent: string }) {
  return (
    <div
      className="relative flex-1 rounded-[16px] p-[20px] overflow-hidden border border-black/5 bg-white"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle at 90% 10%, ${accent} 0%, transparent 55%)` }}
      />
      <div className="flex items-start gap-[12px] relative">
        <div
          className="shrink-0 size-[40px] rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold tracking-[1.2px] uppercase font-['Inter:Semi_Bold',sans-serif]"
            style={{ color: accent }}
          >
            {eyebrow}
          </p>
          <h3 className="mt-[2px] text-[16px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] leading-[22px]">
            {title}
          </h3>
          <p className="mt-[6px] text-[13px] text-black/60 font-['Inter:Regular',sans-serif] leading-[18px]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: full IMS list ─────────────────────────────────────────────────────

function IMSModal({
  open, onClose, onPick, selectedId,
}: { open: boolean; onClose: () => void; onPick: (ims: IMS) => void; selectedId: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" });
    gsap.fromTo(
      panel,
      { y: 16, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.28, ease: "power3.out" }
    );
  }, [open]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const results = q
    ? ALL_IMS.filter(i => i.name.toLowerCase().includes(q) || i.tagline.toLowerCase().includes(q))
    : ALL_IMS;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="bg-white rounded-[16px] w-full max-w-[720px] max-h-[80vh] flex flex-col overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-black/8">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">
              Select your inventory system
            </h2>
            <p className="text-[12px] text-black/50 font-['Inter:Regular',sans-serif] mt-[2px]">
              {ALL_IMS.length}+ inventory systems supported
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-[32px] rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-black/60" />
          </button>
        </div>

        <div className="px-[24px] py-[14px] border-b border-black/8">
          <div className="flex items-center gap-[8px] bg-[#f3f3f5] rounded-[8px] px-[12px] h-[40px]">
            <Search size={16} className="text-black/40" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or category…"
              className="flex-1 bg-transparent outline-none text-[14px] text-[#0a0a0a] placeholder:text-black/40 font-['Inter:Regular',sans-serif]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-[16px]">
          <div className="grid grid-cols-2 gap-[10px]">
            {results.map((ims) => {
              const isSelected = selectedId === ims.id;
              return (
                <button
                  key={ims.id}
                  type="button"
                  onClick={() => { onPick(ims); onClose(); }}
                  className={`flex items-center gap-[12px] text-left p-[12px] rounded-[10px] border transition-colors
                    ${isSelected
                      ? "border-[#4600f2] bg-[rgba(70,0,242,0.04)]"
                      : "border-black/10 bg-white hover:border-black/20 hover:bg-[#fafafa]"}`}
                >
                  <div
                    className="shrink-0 size-[36px] rounded-[8px] flex items-center justify-center text-[12px] font-bold font-['Inter:Bold',sans-serif]"
                    style={{ backgroundColor: ims.bg, color: ims.fg }}
                  >
                    {ims.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
                      {ims.name}
                    </p>
                    <p className="text-[11px] text-black/50 truncate font-['Inter:Regular',sans-serif]">
                      {ims.tagline}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="shrink-0 size-[18px] rounded-full bg-[#4600f2] flex items-center justify-center">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
            {results.length === 0 && (
              <p className="col-span-2 text-center text-[13px] text-black/40 py-[40px]">
                Nothing matches "{query}"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

interface Props {
  onImport: (imsName: string) => void;
}

export function IMSImportScreen({ onImport }: Props) {
  const [selected, setSelected] = useState<IMS>(PRIMARY_IMS[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const titleRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const bannersRef = useRef<HTMLDivElement>(null);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (titleRef.current)     tl.fromTo(titleRef.current,     { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 });
    if (cardRef.current)      tl.fromTo(cardRef.current,      { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.25");
    if (secondaryRef.current) tl.fromTo(secondaryRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, "-=0.3");
    if (bannersRef.current)   tl.fromTo(bannersRef.current,   { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, "-=0.3");
    return () => { tl.kill(); };
  }, []);

  const handlePick = (ims: IMS) => {
    setSelected(ims);
    // Highlight the CTA pulse on selection
    const cta = document.getElementById("ims-cta-btn");
    if (cta) gsap.fromTo(cta, { scale: 0.97 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
  };

  return (
    <div className="bg-white flex flex-col size-full">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar active="Studio AI" />

        <div className="flex-1 overflow-auto bg-[#f9fafb]">
          <div className="mx-auto max-w-[960px] px-[32px] py-[40px]">
            {/* Title */}
            <div ref={titleRef} className="text-center mb-[28px]">
              <h1 className="text-[#402387] text-[32px] font-semibold font-['Inter:Semi_Bold',sans-serif] leading-[44px]">
                Import your inventory
              </h1>
              <p className="mt-[6px] text-[14px] text-black/50 font-['Inter:Medium',sans-serif] font-medium">
                Where do you want to import your inventory from?
              </p>
            </div>

            {/* IMS card */}
            <div
              ref={cardRef}
              className="bg-white rounded-[16px] border border-black/5 p-[32px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <p className="text-[14px] font-semibold text-black/80 font-['Inter:Semi_Bold',sans-serif] mb-[16px]">
                Select your inventory system
              </p>

              <div className="grid grid-cols-3 gap-[12px]">
                {PRIMARY_IMS.map((ims) => {
                  const isSelected = selected.id === ims.id;
                  return (
                    <button
                      key={ims.id}
                      type="button"
                      onClick={() => handlePick(ims)}
                      className={`group flex items-center gap-[12px] text-left p-[14px] rounded-[12px] border transition-all
                        ${isSelected
                          ? "border-[#4600f2] bg-[rgba(70,0,242,0.04)] ring-1 ring-[#4600f2]"
                          : "border-black/10 bg-white hover:border-black/20 hover:bg-[#fafafa]"}`}
                    >
                      <div
                        className="shrink-0 size-[40px] rounded-[10px] flex items-center justify-center text-[12px] font-bold font-['Inter:Bold',sans-serif]"
                        style={{ backgroundColor: ims.bg, color: ims.fg }}
                      >
                        {ims.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif] truncate">
                          {ims.name}
                        </p>
                        <p className="text-[11px] text-black/50 truncate font-['Inter:Regular',sans-serif]">
                          {ims.tagline}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 size-[18px] rounded-full flex items-center justify-center border transition-colors
                          ${isSelected ? "bg-[#4600f2] border-[#4600f2]" : "border-black/20 bg-white"}`}
                      >
                        {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}

                {/* +12 more tile */}
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-[12px] text-left p-[14px] rounded-[12px] border border-dashed border-black/20 bg-[#fafafa] hover:border-[#4600f2] hover:bg-[rgba(70,0,242,0.04)] transition-colors"
                >
                  <div className="shrink-0 size-[40px] rounded-[10px] flex items-center justify-center bg-white border border-black/10 text-[13px] font-bold text-[#4600f2] font-['Inter:Bold',sans-serif]">
                    {MORE_IMS.length}+
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]">
                      Browse all
                    </p>
                    <p className="text-[11px] text-black/50 font-['Inter:Regular',sans-serif]">
                      {ALL_IMS.length} systems
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-black/40 shrink-0" />
                </button>
              </div>

              {/* Dynamic CTA */}
              <div className="mt-[24px] flex justify-center">
                <button
                  id="ims-cta-btn"
                  type="button"
                  onClick={() => onImport(selected.name)}
                  className="bg-[#4600f2] hover:bg-[#3a00d0] active:bg-[#2e00a8] transition-colors text-white font-semibold font-['Inter:Semi_Bold',sans-serif] text-[14px] h-[48px] px-[24px] min-w-[342px] rounded-[8px] inline-flex items-center justify-center gap-[12px] shadow-[0_1px_2px_rgba(70,0,242,0.3)]"
                >
                  <span>Import from {selected.name}</span>
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Alternative sources: folder + website URL */}
            <div ref={secondaryRef} className="mt-[16px]">
              <div className="flex items-center gap-[12px] mb-[10px]">
                <div className="h-px bg-black/8 flex-1" />
                <p className="text-[11px] uppercase tracking-[1.4px] font-semibold text-black/40 font-['Inter:Semi_Bold',sans-serif]">
                  Or import from
                </p>
                <div className="h-px bg-black/8 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-[16px]">
                {/* Folder upload */}
                <div className="bg-white rounded-[12px] border border-[#eceef1] p-[16px] flex flex-col gap-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <FolderUp size={22} className="text-[#0a0a0a]" />
                    <p className="text-[16px] font-medium font-['Inter:Medium',sans-serif] text-[#0a0a0a]">Folder</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onImport("Folder upload")}
                    className="h-[40px] rounded-[8px] border border-black/10 bg-white hover:bg-[#fafafa] transition-colors flex items-center justify-center gap-[8px] text-[12px] font-semibold text-[#0a0a0a] font-['Inter:Semi_Bold',sans-serif]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v12m0-12l-4 4m4-4l4 4M4 18v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload CSV or media folder
                  </button>
                </div>

                {/* Website URL */}
                <div className="bg-white rounded-[12px] border border-[#eceef1] p-[16px] flex flex-col gap-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <Globe size={22} className="text-[#0a0a0a]" />
                    <p className="text-[16px] font-medium font-['Inter:Medium',sans-serif] text-[#0a0a0a]">Website URL</p>
                  </div>
                  <div className="h-[40px] rounded-[8px] border border-black/20 bg-white flex items-center px-[8px] gap-[8px]">
                    <Search size={14} className="text-black/40 shrink-0" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="www.dealerwebsite.com"
                      className="flex-1 bg-transparent outline-none text-[12px] text-[#0a0a0a] placeholder:text-black/40 font-['Inter:Regular',sans-serif]"
                    />
                    <button
                      type="button"
                      disabled={!websiteUrl.trim()}
                      onClick={() => onImport(websiteUrl.trim() || "Website URL")}
                      className="size-[24px] rounded-[6px] flex items-center justify-center text-[#4600F2] disabled:opacity-30 hover:bg-[rgba(70,0,242,0.08)] transition-colors"
                      aria-label="Import from URL"
                    >
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature banners */}
            <div ref={bannersRef} className="mt-[28px]">
              <p className="text-[11px] uppercase tracking-[1.4px] font-semibold text-black/40 mb-[10px] font-['Inter:Semi_Bold',sans-serif]">
                What you'll unlock after import
              </p>
              <div className="flex gap-[16px]">
                <FeatureBanner
                  icon={<Sparkles size={20} />}
                  eyebrow="Smart Campaigns"
                  title="Highlights, billboards & overlays at scale"
                  body="Bulk-apply branded creatives to vehicle media in one click."
                  accent="#4600f2"
                />
                <FeatureBanner
                  icon={<Layers size={20} />}
                  eyebrow="Smart Match"
                  title="Reuse media for same-spec new vehicles"
                  body="Same trim, same color — matching vehicles share studio media. No reshoots."
                  accent="#00C488"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <IMSModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPick={handlePick}
        selectedId={selected.id}
      />
    </div>
  );
}
