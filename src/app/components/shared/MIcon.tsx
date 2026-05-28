import { MaterialSymbol, type SymbolCodepoints } from "react-material-symbols";

interface Props {
  /** Material Symbols name, e.g. "camera_alt", "auto_awesome", "schedule" */
  name: SymbolCodepoints;
  /** Square render size in px (default 18) */
  size?: number;
  /** Stroke weight 100–700 (default 400) */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** Whether the symbol is filled */
  fill?: boolean;
  className?: string;
  /** Inline style (use for explicit color) */
  style?: React.CSSProperties;
}

/**
 * Demo 2 / Demo 3 icon wrapper. Thin layer over react-material-symbols so we
 * can drop in icons by name without re-importing the underlying component
 * everywhere. The outlined Material Symbols font is loaded once from main.tsx.
 */
export function MIcon({ name, size = 18, weight = 400, fill, className, style }: Props) {
  return (
    <MaterialSymbol
      icon={name}
      size={size}
      weight={weight}
      fill={fill}
      className={className}
      style={style}
    />
  );
}
