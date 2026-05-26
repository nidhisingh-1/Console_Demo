import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown, Plus, AlertTriangle, ArrowUpDown, MoreVertical, Monitor, Eye, Copy } from "lucide-react";
import imgCar from "../../imports/Frame2147240604/5dc495ae052ef514c9683fd2a095ba455d93a330.png";
import { AppHeader, AppSidebar } from "./AppShell";
import { InventorySnapshotModal } from "./InventorySnapshotModal";
import { RawPhotoTransformModal } from "./RawPhotoTransformModal";
import { SmartMatchModal } from "./SmartMatchModal";
import { CGIUpgradeModal } from "./CGIUpgradeModal";
import { MerchandisingPitchModal } from "./MerchandisingPitchModal";
import { SmartMatchPitchModal } from "./SmartMatchPitchModal";

// ─── Scanning status ─────────────────────────────────────────────────────────

const buildStatusMessages = (imsName: string) => [
  "Checking inventory",
  "Processing vehicle data",
  "Analyzing media files",
  "Computing hold costs",
  `Syncing with ${imsName}`,
  "Updating pricing data",
];

function Spinner() {
  const circ = 2 * Math.PI * 12;
  return (
    <svg className="animate-spin shrink-0" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="12" fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
      <circle
        cx="17" cy="17" r="12" fill="none"
        stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={`${circ * 0.35} ${circ * 0.65}`}
      />
    </svg>
  );
}

function ScanStatusCard({ noPhotos, rawPhotos, cgiPhotos, statusText }: {
  noPhotos: number; rawPhotos: number; cgiPhotos: number; statusText: string;
}) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_1px_8px_rgba(0,0,0,0.07)] mb-5 px-6 py-5 flex items-center gap-0">
      {/* Left: title + status */}
      <div className="shrink-0 pr-8 border-r border-black/8 min-w-[240px]">
        <h2
          className="text-[22px] font-bold font-['Inter:Bold',sans-serif] leading-tight"
          style={{ background: "linear-gradient(90deg,#2dd4bf,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          Scanning your inventory
        </h2>
        <p className="text-[14px] text-[#6B7280] font-medium mt-1 transition-all duration-500 font-['Inter:Medium',sans-serif]">
          {statusText}
        </p>
      </div>
      {/* Stats */}
      {[
        { label: "No Photos", count: noPhotos },
        { label: "Raw photos", count: rawPhotos },
        { label: "CGI Photos", count: cgiPhotos },
      ].map((s, i) => (
        <div key={i} className="flex items-center gap-5 pl-8 border-r last:border-r-0 border-black/8 pr-8">
          <div>
            <p className="text-[13px] text-[#6B7280] font-medium font-['Inter:Medium',sans-serif]">{s.label}</p>
            <p className="text-[28px] font-bold text-black font-['Inter:Bold',sans-serif] leading-none mt-1">
              {s.count}
            </p>
            <p className="text-[12px] text-[#9CA3AF] font-medium font-['Inter:Medium',sans-serif] mt-0.5">vehicles</p>
          </div>
          <Spinner />
        </div>
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

type Vehicle = {
  id: number;
  name: string;
  stk: string;
  vin: string;
  price: string;
  date: string;
  age: number;
  score: number;
  holdCost: number;
  marginPct: number;
  totalMargin: number;
  isLoss: boolean;
  lossAmount?: number;
  barColor: string;
};

const vehiclePool: Omit<Vehicle, "id">[] = [
  { name: "2021 Ford Mustang GT Premium", stk: "STK-2107", vin: "VIN1234567889000", price: "$22,000", date: "12 July '25, 12:30 PM", age: 24, score: 3.2, holdCost: 229, marginPct: 12, totalMargin: 4500, isLoss: false, barColor: "#10B981" },
  { name: "2021 Ford Mustang GT Premium", stk: "STK-2108", vin: "VIN1234567889001", price: "$24,500", date: "12 July '25, 12:30 PM", age: 30, score: 3.2, holdCost: 229, marginPct: 12, totalMargin: 4500, isLoss: false, barColor: "#14B8A6" },
  { name: "2021 Ford Mustang GT Premium", stk: "STK-2109", vin: "VIN1234567889002", price: "$19,800", date: "12 July '25, 12:30 PM", age: 18, score: 3.2, holdCost: 229, marginPct: 92, totalMargin: 4500, isLoss: false, barColor: "#F59E0B" },
  { name: "2021 Ford Mustang GT Premium", stk: "STK-2110", vin: "VIN1234567889003", price: "$21,000", date: "12 July '25, 12:30 PM", age: 45, score: 3.2, holdCost: 1029, marginPct: 100, totalMargin: 4500, isLoss: true, lossAmount: 45, barColor: "#EF4444" },
  { name: "2020 Ford F-150 XLT", stk: "STK-2112", vin: "VIN9876543211000", price: "$35,000", date: "12 July '25, 01:15 PM", age: 12, score: 4.1, holdCost: 189, marginPct: 34, totalMargin: 6200, isLoss: false, barColor: "#10B981" },
  { name: "2022 Chevrolet Silverado LT", stk: "STK-2113", vin: "VIN5678901234000", price: "$42,000", date: "12 July '25, 01:45 PM", age: 8, score: 4.5, holdCost: 159, marginPct: 8, totalMargin: 8500, isLoss: false, barColor: "#14B8A6" },
  { name: "2021 Toyota Camry SE", stk: "STK-2114", vin: "VIN2345678901000", price: "$28,500", date: "12 July '25, 02:00 PM", age: 15, score: 3.8, holdCost: 849, marginPct: 95, totalMargin: 3800, isLoss: true, lossAmount: 120, barColor: "#EF4444" },
  { name: "2022 BMW 3 Series 330i", stk: "STK-2116", vin: "VIN4567890123000", price: "$48,000", date: "12 July '25, 02:30 PM", age: 6, score: 4.8, holdCost: 389, marginPct: 18, totalMargin: 9500, isLoss: false, barColor: "#3B82F6" },
];

function VehicleRow({ vehicle, isNew }: { vehicle: Vehicle; isNew: boolean }) {
  return (
    <tr className="border-b border-black/5 hover:bg-[#F9FAFB] transition-colors">
      {/* Checkbox */}
      <td className="pl-4 pr-2 py-3 w-10">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#4600f2]" />
      </td>
      {/* Vehicle */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {isNew && (
              <span className="absolute top-0.5 left-0.5 z-10 bg-[#10B981] text-white text-[8px] font-bold px-1 py-0.5 rounded-sm leading-none">
                NEW
              </span>
            )}
            <img src={imgCar} alt="vehicle" className="w-[68px] h-[48px] object-cover rounded-[6px] bg-gray-100" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#111] font-['Inter:Semi_Bold',sans-serif]">{vehicle.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#6B7280]">{vehicle.stk}</span>
              <span className="text-[#D1D5DB]">•</span>
              <span className="text-[11px] text-[#6B7280]">{vehicle.vin}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-gray-400 inline">
                <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 9h6M9 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-[12px] text-[#374151] mt-0.5 font-medium">{vehicle.price}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">{vehicle.date}</p>
          </div>
        </div>
      </td>
      {/* Age */}
      <td className="py-3 pr-4 text-[13px] text-[#374151] font-medium whitespace-nowrap">{vehicle.age} days</td>
      {/* Media icons */}
      <td className="py-3 pr-4">
        <div className="flex items-center gap-1">
          {[Monitor, Eye, Copy].map((Icon, i) => (
            <button key={i} className="p-1 rounded hover:bg-gray-100 text-[#9CA3AF]">
              <Icon size={15} />
            </button>
          ))}
        </div>
      </td>
      {/* Media Score */}
      <td className="py-3 pr-4">
        <span className="text-[13px] font-semibold text-[#F59E0B]">{vehicle.score.toFixed(1)}</span>
      </td>
      {/* Publishing */}
      <td className="py-3 pr-4 text-[13px] text-[#9CA3AF]">Not published</td>
      {/* Days to Frontline */}
      <td className="py-3 pr-4 text-[13px] text-[#374151]">–</td>
      {/* Hold. Cost */}
      <td className="py-3 pr-2">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className={`text-[13px] font-semibold ${vehicle.isLoss ? "text-[#EF4444]" : "text-[#111]"}`}>
                ${vehicle.holdCost.toLocaleString()}
              </span>
              {vehicle.isLoss && <AlertTriangle size={12} className="text-[#EF4444] shrink-0" />}
            </div>
            <div className="mt-1 w-[100px] h-[4px] rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${vehicle.marginPct}%`, backgroundColor: vehicle.barColor }}
              />
            </div>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">
              {vehicle.isLoss
                ? `-$${vehicle.lossAmount} loss`
                : `${vehicle.marginPct}% of $${vehicle.totalMargin.toLocaleString()} margin`}
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

function ColHeader({ label, sortable = true }: { label: string; sortable?: boolean }) {
  return (
    <th className="py-3 pr-4 text-left text-[12px] font-medium text-[#6B7280] whitespace-nowrap font-['Inter:Medium',sans-serif]">
      <span className="flex items-center gap-1">
        {label}
        {sortable && <ArrowUpDown size={11} className="text-[#9CA3AF]" />}
      </span>
    </th>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ScanningScreenProps {
  imsName?: string;
  onFinish?: () => void;
  benchmarks?: { daysToFrontline: number; holdingCostPerDay: number };
  /**
   * When true, the snapshot modal's Start button calls onFinish directly,
   * skipping Demo 1's Merchandising → SmartMatch → CGI pitch chain. Used by
   * Demo 2 where the pitches are triggered from bucket clicks on the dashboard.
   */
  snapshotOnly?: boolean;
}

export function ScanningScreen({
  imsName = "Vincue",
  onFinish,
  benchmarks = { daysToFrontline: 50, holdingCostPerDay: 40 },
  snapshotOnly = false,
}: ScanningScreenProps = {}) {
  const statusMessages = buildStatusMessages(imsName);
  const [statusIdx, setStatusIdx] = useState(0);
  const [noPhotos, setNoPhotos] = useState(12);
  const [rawPhotos, setRawPhotos] = useState(102);
  const [cgiPhotos, setCgiPhotos] = useState(72);
  const VISIBLE_ROWS = 6;
  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    vehiclePool.slice(0, VISIBLE_ROWS).map((v, i) => ({ ...v, id: i + 1 }))
  );
  type Stage =
    | "scanning"
    | "snapshot"
    | "merchandisingPitch"
    | "rawTransform"
    | "smartMatchPitch"
    | "smartMatch"
    | "cgiUpgrade"
    | "done";
  const [stage, setStage] = useState<Stage>("scanning");
  // Stages the user has previously moved past — so revisiting via Back shows a "Completed" chip
  const [completedStages, setCompletedStages] = useState<Set<Stage>>(new Set());
  const advanceTo = (next: Stage) => {
    setCompletedStages((prev) => {
      const copy = new Set(prev);
      copy.add(stage);
      return copy;
    });
    setStage(next);
  };
  const goBackTo = (prev: Stage) => setStage(prev);

  // After 8s of scanning, surface the inventory snapshot modal
  useEffect(() => {
    const t = setTimeout(() => setStage("snapshot"), 8000);
    return () => clearTimeout(t);
  }, []);

  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const nextIdRef = useRef(vehiclePool.length + 1);

  // Status text cycle — only while actively scanning
  useEffect(() => {
    if (stage !== "scanning") return;
    const t = setInterval(() => setStatusIdx(i => (i + 1) % statusMessages.length), 2500);
    return () => clearInterval(t);
  }, [statusMessages.length, stage]);

  // Row flow + counter increment — only while actively scanning
  useEffect(() => {
    if (stage !== "scanning") return;
    const t = setInterval(() => {
      const poolIdx = (nextIdRef.current - 1) % vehiclePool.length;
      const newVehicle: Vehicle = { ...vehiclePool[poolIdx], id: nextIdRef.current++ };
      setVehicles(prev => [newVehicle, ...prev.slice(0, VISIBLE_ROWS - 1)]);
      setNoPhotos(n => n + Math.floor(Math.random() * 3) + 1);
      setRawPhotos(n => n + Math.floor(Math.random() * 5) + 2);
      setCgiPhotos(n => n + Math.floor(Math.random() * 4) + 1);
    }, 1400);
    return () => clearInterval(t);
  }, [stage]);

  // GSAP: continuous downward flow on each new row
  useEffect(() => {
    const tbody = tableBodyRef.current;
    if (!tbody) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      gsap.from(Array.from(tbody.children), {
        y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power2.out",
      });
      return;
    }
    const rows = Array.from(tbody.children) as HTMLElement[];
    if (!rows.length) return;
    // Measure the first row's height so the offset matches exactly
    const rowH = rows[0].getBoundingClientRect().height || 76;
    // All rows enter from one slot above their current position — creates a unified
    // downward conveyor flow. The new row fades in as it lands.
    gsap.fromTo(
      rows,
      { y: -rowH },
      { y: 0, duration: 0.55, ease: "power3.out" }
    );
    gsap.fromTo(
      rows[0],
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: "power2.out" }
    );
  }, [vehicles]);

  // Scan-line sweep across the table — only while actively scanning
  useEffect(() => {
    const line = scanLineRef.current;
    if (!line) return;
    if (stage !== "scanning") {
      gsap.to(line, { opacity: 0, duration: 0.25 });
      return;
    }
    const tween = gsap.fromTo(
      line,
      { y: 0, opacity: 0 },
      {
        y: () => (tableWrapRef.current?.clientHeight ?? 460) - 4,
        opacity: 1,
        duration: 2.6,
        ease: "none",
        repeat: -1,
        yoyo: false,
        repeatDelay: 0.2,
      }
    );
    return () => { tween.kill(); };
  }, [stage]);

  return (
    <div className="bg-white flex flex-col size-full">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        {/* Main content */}
        <div className="flex-1 bg-[#f9fafb] overflow-auto">
          <div className="px-8 py-6 min-w-[900px]">
            {/* Page header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-[26px] font-bold text-[#111] font-['Inter:Bold',sans-serif]">Merchandising</h1>
                <p className="text-[14px] text-[#6B7280] mt-1 font-['Inter:Regular',sans-serif]">
                  Manage your inventory and see what needs your attention
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/10 rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-gray-50 shadow-sm">
                  Holding Cost:&nbsp;<span className="text-[#4600f2] font-semibold">$12</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] rounded-[8px] text-[13px] font-semibold text-white hover:bg-[#1a1a1a]">
                  <Plus size={15} />
                  Add New Inventory
                </button>
              </div>
            </div>

            {/* Scan status card */}
            <ScanStatusCard
              noPhotos={noPhotos}
              rawPhotos={rawPhotos}
              cgiPhotos={cgiPhotos}
              statusText={statusMessages[statusIdx]}
            />

            {/* Inventory table */}
            <div
              ref={tableWrapRef}
              className="relative bg-white rounded-[16px] shadow-[0_1px_8px_rgba(0,0,0,0.07)] overflow-hidden"
            >
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
                <tbody ref={tableBodyRef}>
                  {vehicles.map((v, i) => (
                    <VehicleRow key={v.id} vehicle={v} isNew={i === 0} />
                  ))}
                </tbody>
              </table>

              {/* Scan-line sweep */}
              <div
                ref={scanLineRef}
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-0 h-[3px]"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(70,0,242,0.55) 50%, transparent 100%)",
                  boxShadow: "0 0 12px 2px rgba(70,0,242,0.35)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <InventorySnapshotModal
        open={stage === "snapshot"}
        totalInventory={234}
        score={2.8}
        noPhotos={90}
        rawPhotos={67}
        cgiPhotos={134}
        onStart={() => {
          if (snapshotOnly) {
            setStage("done");
            onFinish?.();
          } else {
            advanceTo("merchandisingPitch");
          }
        }}
      />

      <MerchandisingPitchModal
        open={stage === "merchandisingPitch"}
        completed={completedStages.has("merchandisingPitch")}
        onClose={() => setStage("done")}
        onBack={() => goBackTo("snapshot")}
        onContinue={() => advanceTo("rawTransform")}
      />

      <RawPhotoTransformModal
        open={stage === "rawTransform"}
        totalRaw={67}
        stageCompleted={completedStages.has("rawTransform")}
        onClose={() => setStage("done")}
        onBack={() => goBackTo("merchandisingPitch")}
        onNext={() => advanceTo("smartMatchPitch")}
      />

      <SmartMatchPitchModal
        open={stage === "smartMatchPitch"}
        completed={completedStages.has("smartMatchPitch")}
        onClose={() => setStage("done")}
        onBack={() => goBackTo("rawTransform")}
        onContinue={() => advanceTo("smartMatch")}
      />

      <SmartMatchModal
        open={stage === "smartMatch"}
        totalNoPhotos={90}
        daysBaseline={benchmarks.daysToFrontline}
        holdingPerDay={benchmarks.holdingCostPerDay}
        completed={completedStages.has("smartMatch")}
        onClose={() => setStage("done")}
        onBack={() => goBackTo("smartMatchPitch")}
        onNext={() => advanceTo("cgiUpgrade")}
      />

      <CGIUpgradeModal
        open={stage === "cgiUpgrade"}
        totalCgi={134}
        completed={completedStages.has("cgiUpgrade")}
        onClose={() => { setStage("done"); onFinish?.(); }}
        onBack={() => goBackTo("smartMatch")}
        onNext={() => { setStage("done"); onFinish?.(); }}
      />
    </div>
  );
}
