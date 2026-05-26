import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface Props {
  /** Current score */
  score: number;
  /** Max possible score (default 10) */
  max?: number;
  /** Render width in pixels */
  width?: number;
  /** Color of the big numeric label in the middle */
  scoreColor?: string;
  /** If provided, animates the gauge from 0 → score whenever this changes */
  animateKey?: string | number | boolean;
  /** Optional small label rendered above the number */
  topLabel?: string;
  /** Optional "before" reference value — renders a tick mark on the arc */
  beforeScore?: number;
  /**
   * Compact layout — number is moved up inside the arc dome instead of sitting
   * below the diameter. Use this for inline KPI cards where vertical space is
   * tight (e.g. Demo 2 dashboard's inventory score).
   */
  compact?: boolean;
}

/**
 * Half-donut score gauge.
 * Track is a flat gray semicircle; the fill arc starts at the left and sweeps clockwise.
 * Fill uses the same red→amber→green gradient used in the inventory snapshot modal,
 * so this component is the shared gauge across snapshot / summary.
 */
export function ScoreGauge({
  score,
  max = 10,
  width = 160,
  scoreColor = "#0a0a0a",
  animateKey,
  topLabel,
  beforeScore,
  compact = false,
}: Props) {
  const W = width;
  const H = Math.round(W * 0.6);
  const CX = W / 2;
  const CY = H - 8;
  const R = Math.round(W * 0.4);
  const SW = Math.round(W * 0.088);
  const startAngle = Math.PI;

  const fillRef = useRef<SVGPathElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const gradId = useRef(`gaugeFill-${Math.random().toString(36).slice(2, 8)}`).current;

  const target = Math.max(0, Math.min(1, score / max));

  // Helper: SVG arc from angle a0 to a1
  const arc = (a0: number, a1: number) => {
    const x0 = CX + R * Math.cos(a0);
    const y0 = CY + R * Math.sin(a0) * -1;
    const x1 = CX + R * Math.cos(a1);
    const y1 = CY + R * Math.sin(a1) * -1;
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const sweep = a0 > a1 ? 1 : 0;
    return `M ${x0} ${y0} A ${R} ${R} 0 ${largeArc} ${sweep} ${x1} ${y1}`;
  };

  // Animate fill arc + numeric label whenever animateKey changes
  useEffect(() => {
    const path = fillRef.current;
    const obj = { p: 0 };
    const tween = gsap.to(obj, {
      p: target,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        const pct = obj.p;
        setDisplayScore(pct * max);
        if (path) {
          path.setAttribute("d", arc(startAngle, startAngle - Math.PI * pct));
        }
      },
    });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, animateKey]);

  // "Before" tick — position on the arc at angle for beforeScore
  const beforeMarker = (() => {
    if (beforeScore === undefined) return null;
    const bPct = Math.max(0, Math.min(1, beforeScore / max));
    const angle = startAngle - Math.PI * bPct;
    // Inner edge of the stroke
    const ri = R - SW / 2 - 2;
    const ro = R + SW / 2 + 4;
    const x1 = CX + ri * Math.cos(angle);
    const y1 = CY - ri * Math.sin(angle);
    const x2 = CX + ro * Math.cos(angle);
    const y2 = CY - ro * Math.sin(angle);
    // Dot at outer end
    const dotX = CX + (R + SW / 2 + 10) * Math.cos(angle);
    const dotY = CY - (R + SW / 2 + 10) * Math.sin(angle);
    // Label position (a hair beyond the dot)
    const labelX = CX + (R + SW / 2 + 22) * Math.cos(angle);
    const labelY = CY - (R + SW / 2 + 22) * Math.sin(angle);
    return { x1, y1, x2, y2, dotX, dotY, labelX, labelY, angle };
  })();

  return (
    <div className="relative flex flex-col items-center" style={{ width: W + 28 }}>
      <svg
        width={W + 28}
        height={H + 22}
        viewBox={`${-14} ${-12} ${W + 28} ${H + 22}`}
        fill="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/*
            Banded red → amber → green gradient (not a smooth blend).
            Red dominates 0-50%, amber 50-80%, green only past 80% —
            so a score of 5.8 visibly stops in the amber band (not green).
          */}
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#EF4444" />
            <stop offset="50%" stopColor="#EF4444" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="80%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Track */}
        <path d={arc(startAngle, 0)} stroke="#F1F1F4" strokeWidth={SW} strokeLinecap="round" fill="none" />
        {/* Animated fill */}
        <path
          ref={fillRef}
          d={arc(startAngle, startAngle)}
          stroke={`url(#${gradId})`}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
        {/* Before marker */}
        {beforeMarker && (
          <>
            <line
              x1={beforeMarker.x1} y1={beforeMarker.y1}
              x2={beforeMarker.x2} y2={beforeMarker.y2}
              stroke="#EF4444"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle
              cx={beforeMarker.dotX}
              cy={beforeMarker.dotY}
              r={3.5}
              fill="#EF4444"
              stroke="#fff"
              strokeWidth={1.5}
            />
            <text
              x={beforeMarker.labelX}
              y={beforeMarker.labelY}
              fill="#EF4444"
              fontSize={9}
              fontWeight={700}
              letterSpacing={0.4}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}
            >
              Before
            </text>
          </>
        )}
      </svg>
      <div
        className={
          compact
            ? "absolute inset-0 flex flex-col items-center justify-end pb-[12%]"
            : "absolute inset-0 flex flex-col items-center justify-end pb-[2px]"
        }
      >
        {topLabel && (
          <span className="text-[10px] uppercase tracking-[0.6px] font-semibold text-black/45 mb-[2px] font-['Inter:Semi_Bold',sans-serif]">
            {topLabel}
          </span>
        )}
        <span
          className="font-bold font-['Inter:Bold',sans-serif] leading-none"
          style={{
            color: scoreColor,
            // Compact mode shrinks the number a touch so it nests cleanly inside
            // the arc dome instead of being clipped by the curve.
            fontSize: Math.round(W * (compact ? 0.20 : 0.225)),
          }}
        >
          {displayScore.toFixed(1)}
        </span>
        {beforeScore !== undefined && (
          <span className="mt-[2px] text-[10px] font-medium text-black/45 font-['Inter:Medium',sans-serif]">
            was <span className="text-[#EF4444] font-bold">{beforeScore.toFixed(1)}</span>
          </span>
        )}
      </div>
    </div>
  );
}
