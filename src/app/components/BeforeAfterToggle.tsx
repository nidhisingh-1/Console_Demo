import { useEffect, useRef, useState } from "react";
import { MIcon } from "./shared/MIcon";

export type DashboardView = "before" | "current";

interface Props {
  active: DashboardView;
  onChange: (v: DashboardView) => void;
}

interface Position { x: number; y: number; }

const FAB_MARGIN = 16;
const STORAGE_KEY = "demo2:beforeAfterToggle:position";

function defaultPosition(): Position {
  if (typeof window === "undefined") return { x: FAB_MARGIN, y: FAB_MARGIN };
  // Bottom-left so it doesn't collide with the Need Actions FAB (bottom-right)
  // or the right-side pitch panel.
  return { x: FAB_MARGIN + 80, y: window.innerHeight - 70 };
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

/**
 * Floating draggable toggle that swaps the Demo 2 dashboard between
 * "Before" (the diagnosed initial state) and "Current" (transformations so far).
 * Same visual style as DemoTabBar.
 */
export function BeforeAfterToggle({ active, onChange }: Props) {
  const [pos, setPos] = useState<Position>(loadPosition);
  const [dragging, setDragging] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const offset = useRef<Position>({ x: 0, y: 0 });
  const dragMoved = useRef(false);

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
    const w = el.offsetWidth, h = el.offsetHeight;
    const nextX = Math.min(Math.max(FAB_MARGIN, e.clientX - offset.current.x), window.innerWidth - w - FAB_MARGIN);
    const nextY = Math.min(Math.max(FAB_MARGIN, e.clientY - offset.current.y), window.innerHeight - h - FAB_MARGIN);
    if (Math.abs(nextX - pos.x) > 2 || Math.abs(nextY - pos.y) > 2) dragMoved.current = true;
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
      className="fixed z-[78] inline-flex items-center gap-[2px] h-[40px] pl-[6px] pr-[6px] bg-white/95 backdrop-blur-md rounded-full border border-black/10 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="Drag to move"
        className="h-[28px] w-[20px] flex items-center justify-center text-black/35 hover:text-black/70 rounded-full"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      >
        <MIcon name="drag_indicator" size={16} />
      </div>
      {([
        { id: "before",  label: "Before",  icon: <MIcon name="history" size={15} /> },
        { id: "current", label: "Current", icon: <MIcon name="auto_awesome" size={15} /> },
      ] as const).map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              if (dragMoved.current) {
                dragMoved.current = false;
                return;
              }
              onChange(opt.id);
            }}
            className={
              "inline-flex items-center gap-[5px] px-[12px] h-[28px] rounded-full text-[12px] font-semibold transition-colors font-['Inter:Semi_Bold',sans-serif] " +
              (isActive
                ? "bg-[#4600F2] text-white shadow-[0_2px_6px_rgba(70,0,242,0.35)]"
                : "text-black/60 hover:bg-black/5")
            }
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
