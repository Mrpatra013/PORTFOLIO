import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useIntroReady } from "../lib/introReady";
import { startScroll, stopScroll } from "../lib/scrollLock";

const FILL_MS = 3400;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

export default function PageLoader() {
  const { setReady } = useIntroReady();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const doneRef = useRef(false);
  const lockedRef = useRef(false);

  useEffect(() => {
    if (!lockedRef.current) {
      lockedRef.current = true;
      stopScroll();
    }

    const start = performance.now();
    let rafId = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / FILL_MS, 1);
      setProgress(Math.round(easeInOutCubic(t) * 100));
      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setExiting(true);
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center gap-8 bg-[#0a0a0a] text-white"
      initial={{ y: "0%" }}
      animate={{ y: exiting ? "-100%" : "0%" }}
      transition={{ type: "spring", stiffness: 220, damping: 30 }}
      onAnimationComplete={() => {
        if (!exiting || doneRef.current) return;
        doneRef.current = true;
        startScroll();
        setReady(true);
        setMounted(false);
      }}
    >
      <motion.div
        className="flex flex-col items-center gap-5 text-center"
        animate={{ opacity: exiting ? 0 : 1, y: exiting ? -12 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <div className="flex items-center gap-2 text-2xl font-semibold sm:text-[1.875rem]">
          <img
            src="/hero/logo.png"
            alt=""
            className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          />
          <span>
            TheDesk<span className="text-[#E86100]">.</span>
          </span>
        </div>
        <p className="max-w-[24ch] text-sm text-white/55">
          We Don&apos;t Do Average.
        </p>
      </motion.div>

      <div className="flex w-[min(22rem,72vw)] flex-col gap-3">
        <div className="h-px w-full bg-white/15">
          <div
            className="h-full bg-[#E86100] transition-[width] duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.05em] text-white/45">
          <span>Loading</span>
          <span className="tabular-nums text-white/80">
            {String(progress).padStart(3, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
