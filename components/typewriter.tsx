"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  lines: string[];          // each item becomes its own paragraph
  speedMs?: number;         // ms per character
  linePauseMs?: number;     // pause between lines
  startOnVisible?: boolean; // wait until scrolled into view
  className?: string;       // applied to each <p>
};

export default function Typewriter({
  lines,
  speedMs = 24,
  linePauseMs = 600,
  startOnVisible = true,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(!startOnVisible);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  // Respect prefers-reduced-motion: render full text immediately
  const reduceMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (!startOnVisible || started || reduceMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [startOnVisible, started, reduceMotion]);

  useEffect(() => {
    if (!started || reduceMotion) return;
    if (lineIdx >= lines.length) return;

    const current = lines[lineIdx];
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), speedMs);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, linePauseMs);
      return () => clearTimeout(t);
    }
  }, [started, reduceMotion, lineIdx, charIdx, lines, speedMs, linePauseMs]);

  if (reduceMotion) {
    return (
      <div className="space-y-3" ref={containerRef}>
        {lines.map((l, i) => (
          <p key={i} className={className}>{l}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      {lines.map((l, i) => {
        const visible =
          i < lineIdx ? l : i === lineIdx ? l.slice(0, charIdx) : "";
        const showCaret = i === Math.min(lineIdx, lines.length - 1);
        return (
          <p key={i} className={`${className} relative`}>
            <span>{visible}</span>
            {showCaret && started && (
              <span className="ml-[1px] align-[-0.1em] inline-block w-[1px] h-[1em] bg-foreground/60 motion-safe:animate-pulse" />
            )}
          </p>
        );
      })}
    </div>
  );
}