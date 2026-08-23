"use client";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useMotionValueEvent } from "motion/react";
import { useCallback, useEffect, useRef } from "react";

export function ScrollIconField({ variant = "mixed" }: { variant?: "mixed" | "network" | "orbit" }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rawProgress = useMotionValue(0);
  const { scrollY } = useScroll();
  const updateProgress = useCallback(() => {
    const field = ref.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const viewport = Math.max(window.innerHeight, 1);
    rawProgress.set(Math.min(1, Math.max(0, (viewport - rect.top) / (viewport * .9))));
  }, [rawProgress]);

  useMotionValueEvent(scrollY, "change", updateProgress);
  useEffect(() => {
    updateProgress();
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => window.removeEventListener("resize", updateProgress);
  }, [updateProgress]);

  const progress = useSpring(rawProgress, { stiffness: 460, damping: 31, mass: 0.16 });
  const codeX = useTransform(progress, [0, 1], [-210, 175]);
  const codeY = useTransform(progress, [0, 1], [105, -135]);
  const codeRotate = useTransform(progress, [0, 1], [-42, 58]);
  const wifiX = useTransform(progress, [0, 1], [160, -190]);
  const wifiY = useTransform(progress, [0, 1], [135, -105]);
  const wifiRotate = useTransform(progress, [0, 1], [42, -52]);
  const dbX = useTransform(progress, [0, 1], [-125, 230]);
  const dbY = useTransform(progress, [0, 1], [155, -145]);
  const dbRotate = useTransform(progress, [0, 1], [54, -70]);

  useMotionValueEvent(scrollY, "change", (latest) => { document.documentElement.style.setProperty("--page-scroll", `${(latest * .5).toFixed(2)}px`); });
  useMotionValueEvent(progress, "change", (latest) => {
    document.documentElement.style.setProperty("--scroll-progress", latest.toFixed(3));
  });
  const value = (motionValue: typeof codeX) => reduceMotion ? 0 : motionValue;

  return <div ref={ref} className={`scroll-icon-field scroll-icon-field--${variant}`} aria-hidden="true">
    <motion.span className="scroll-icon scroll-icon--code" style={{ x: value(codeX), y: value(codeY), rotate: value(codeRotate) }}>〈/〉</motion.span>
    <motion.span className="scroll-icon scroll-icon--wifi" style={{ x: value(wifiX), y: value(wifiY), rotate: value(wifiRotate) }}>⌁</motion.span>
    <motion.span className="scroll-icon scroll-icon--db" style={{ x: value(dbX), y: value(dbY), rotate: value(dbRotate) }}>▤</motion.span>
  </div>;
}
