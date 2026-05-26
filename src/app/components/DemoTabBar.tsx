import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

export type DemoTab = "demo1" | "demo2";

interface DemoTabBarProps {
  active: DemoTab;
  onChange: (tab: DemoTab) => void;
}

interface Position {
  x: number;
  y: number;
}

const FAB_MARGIN = 16;
const STORAGE_KEY = "demoTabBar:position";

function defaultPosition(): Position {
  if (typeof window === "undefined") return { x: FAB_MARGIN, y: FAB_MARGIN };
  // Top-center by default so it's visible without covering header actions.
  return { x: Math.max(FAB_MARGIN, window.innerWidth / 2 - 100), y: FAB_MARGIN };
}

function loadPosition(): Position {
  if (typeof window === "undefined") return defaultPosition();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPosition();
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === "number" && typeof parsed?.y === "number") return parsed;
  } catch { /* ignore */ }
  return defaultPosition();
}

export function DemoTabBar({ active, onChange }: DemoTabBarProps) {
  const [pos, setPos] = useState<Position>(loadPosition);
  const [dragging, setDragging] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  // Mouse offset within the FAB at drag start
  const offset = useRef<Position>({ x: 0, y: 0 });
  // Track movement to distinguish drag vs. click on the handle
  const dragMoved = useRef(false);

  const tabs: { id: DemoTab; label: string }[] = [
    { id: "demo1", label: "Demo 1" },
    { id: "demo2", label: "Demo 2" },
  ];

  // Clamp inside viewport on mount and on resize so it never escapes.
  useEffect(() => {
    const clamp = () => {
      const el = fabRef.current;
      if (!el) return;
      const { offsetWidth: w, offsetHeight: h } = el;
      setPos((p) => ({
        x: Math.min(Math.max(FAB_MARGIN, p.x), window.innerWidth - w - FAB_MARGIN),
        y: Math.min(Math.max(FAB_MARGIN, p.y), window.innerHeight - h - FAB_MARGIN),
      }));
    };
    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, []);

  // Persist position so it survives reloads.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
  }, [pos]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = fabRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragMoved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const el = fabRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const nextX = Math.min(Math.max(FAB_MARGIN, e.clientX - offset.current.x), window.innerWidth - w - FAB_MARGIN);
    const nextY = Math.min(Math.max(FAB_MARGIN, e.clientY - offset.current.y), window.innerHeight - h - FAB_MARGIN);
    if (Math.abs(nextX - pos.x) > 2 || Math.abs(nextY - pos.y) > 2) {
      dragMoved.current = true;
    }
    setPos({ x: nextX, y: nextY });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <div
      ref={fabRef}
      style={{
        left: pos.x,
        top: pos.y,
        cursor: dragging ? "grabbing" : undefined,
        userSelect: dragging ? "none" : undefined,
      }}
      className="fixed z-[80] inline-flex items-center gap-[2px] h-[40px] pl-[6px] pr-[6px] bg-white/95 backdrop-blur-md rounded-full border border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      {/* Drag handle */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="Drag to move"
        className="h-[28px] w-[20px] flex items-center justify-center text-black/35 hover:text-black/70 rounded-full"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <GripVertical size={14} />
      </div>
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              // Suppress click if the user actually dragged the FAB during this gesture
              if (dragMoved.current) {
                dragMoved.current = false;
                return;
              }
              onChange(tab.id);
            }}
            className={
              "px-[14px] h-[28px] rounded-full text-[12px] font-semibold transition-colors font-['Inter:Semi_Bold',sans-serif] " +
              (isActive
                ? "bg-[#4600F2] text-white shadow-[0_2px_6px_rgba(70,0,242,0.35)]"
                : "text-black/60 hover:bg-black/5")
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
