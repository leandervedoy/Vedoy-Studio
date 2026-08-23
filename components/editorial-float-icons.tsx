"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

const icons = [
  { className: "float-icon--code", label: "〈/〉" },
  { className: "float-icon--wifi", label: "⌁" },
  { className: "float-icon--db", label: "▤" },
] as const;

type IconRange = { x: number[]; y: number[]; rotate: number[] };

function ScrollIcon({ icon, range, progress, reduceMotion, index }: { icon: (typeof icons)[number]; range: IconRange; progress: ReturnType<typeof useSpring>; reduceMotion: boolean | null; index: number }) {
  const x = useTransform(progress, [0, 1], range.x);
  const y = useTransform(progress, [0, 1], range.y);
  const rotate = useTransform(progress, [0, 1], range.rotate);
  const scale = useTransform(progress, [0, .5, 1], [.9, 1.08, .94]);
  return <motion.span className={`float-icon ${icon.className}`} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} style={reduceMotion ? undefined : { x, y, rotate, scale }} transition={{ opacity: { duration: .4, delay: index * .08 } }}>{icon.label}</motion.span>;
}

export function EditorialFloatIcons({ variant = "hero" }: { variant?: "hero" | "hosting" }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rawProgress = useMotionValue(0);
  const { scrollY } = useScroll();
  const updateProgress = useCallback(() => {
    const section = fieldRef.current?.parentElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const viewport = Math.max(window.innerHeight, 1);
    const travel = Math.max(viewport * .65 + rect.height, 1);
    rawProgress.set(Math.min(1, Math.max(0, (viewport - rect.top) / travel)));
  }, [rawProgress]);

  useMotionValueEvent(scrollY, "change", updateProgress);
  useEffect(() => {
    updateProgress();
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => window.removeEventListener("resize", updateProgress);
  }, [updateProgress]);

  const progress = useSpring(rawProgress, { stiffness: 420, damping: 34, mass: 0.18 });
  const ranges = variant === "hosting"
    ? [{ x: [-140, 190], y: [105, -155], rotate: [-24, 42] }, { x: [120, -175], y: [125, -175], rotate: [28, -48] }, { x: [-85, 165], y: [95, -145], rotate: [34, -42] }]
    : [{ x: [-105, 155], y: [135, -175], rotate: [-28, 46] }, { x: [115, -160], y: [150, -195], rotate: [30, -52] }, { x: [-90, 145], y: [120, -165], rotate: [36, -44] }];

  return (
    <div ref={fieldRef} className={`editorial-float-field editorial-float-field--${variant}`} aria-hidden="true">
      {icons.map((icon, index) => <ScrollIcon key={icon.className} icon={icon} range={ranges[index]} progress={progress} reduceMotion={reduceMotion} index={index} />)}
    </div>
  );
}
