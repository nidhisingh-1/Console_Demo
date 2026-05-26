import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function KpiCounter({
  value, durationMs = 900, format,
}: {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const proxy = { n: prev.current };
    const tween = gsap.to(proxy, {
      n: value,
      duration: durationMs / 1000,
      ease: "power3.out",
      onUpdate: () => setDisplay(proxy.n),
      onComplete: () => setDisplay(value),
    });
    prev.current = value;
    return () => { tween.kill(); };
  }, [value, durationMs]);

  const rendered = format ? format(display) : Math.round(display).toString();
  return <span>{rendered}</span>;
}
