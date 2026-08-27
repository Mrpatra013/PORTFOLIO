import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Anything narrower than the `lg` breakpoint gets the gate. That's the same
 * line the layout itself uses to switch to its stacked, animation-light
 * variants, so it's the point below which the scroll-driven experience stops
 * being the thing that was designed.
 */
const MOBILE_QUERY = "(max-width: 1023px)";

/** Survives in-session reloads, but every fresh visit sees the notice again. */
const DISMISSED_KEY = "thedesk:mobile-gate-dismissed";

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    // Private-mode Safari throws on storage access; treat it as "not dismissed".
    return false;
  }
};

/**
 * True while the visitor should see the desktop notice instead of the site.
 *
 * Read synchronously on the first render (this is a client-rendered SPA, so
 * `matchMedia` is available before paint) — otherwise the real page would
 * mount for a frame and start its intro before the gate replaced it. Kept live
 * on a listener so rotating a tablet, or dragging a desktop window narrow and
 * back, resolves to the right view without a reload.
 */
export function useMobileGate() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches,
  );
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage is optional — the dismissal just won't outlive this render.
    }
    setDismissed(true);
  }, []);

  return { blocked: isMobile && !dismissed, dismiss };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function MobileGate({ onContinue }: { onContinue: () => void }) {
  const [copied, setCopied] = useState(false);

  // The page never scrolls behind the gate, but iOS still rubber-bands the
  // body under a fixed layer unless it's pinned.
  useEffect(() => {
    const { style } = document.documentElement;
    style.overflow = "hidden";
    style.height = "100%";
    return () => {
      style.removeProperty("overflow");
      style.removeProperty("height");
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // No clipboard permission (or no HTTPS) — leave the label alone rather
      // than claiming a copy that didn't happen.
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
      className="relative flex h-svh min-h-[100vh] w-full flex-col justify-between overflow-hidden bg-black px-6 py-10 text-white"
    >
      {/* Warm floor glow — a quiet echo of the site's accent, no animation cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#E86100] opacity-20 blur-[120px]"
      />

      <motion.div variants={fadeUp} className="relative z-10 flex items-center gap-1">
        <img src="/hero/logo.png" alt="" className="h-12 w-12 object-contain" />
        <span className="text-2xl font-bold">
          TheDesk<span className="text-[#E86100]">.</span>
        </span>
      </motion.div>

      <div className="relative z-10 flex flex-col items-start">
        <motion.span
          variants={fadeUp}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#E86100]" />
          Desktop experience
        </motion.span>

        <motion.h1
          variants={fadeUp}
          className="font-black uppercase leading-[0.88] tracking-tight text-[13vw] sm:text-[9vw]"
        >
          <span className="block">Best</span>
          <span className="block">Seen On</span>
          <span className="block text-[#E86100]">Desktop.</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-6 max-w-md text-[15px] leading-relaxed text-white/65">
          This portfolio was built around motion — scroll-driven sequences, pinned
          sections and transitions that were tuned frame by frame. A phone screen
          simply can&apos;t carry them.
        </motion.p>
        <motion.p variants={fadeUp} className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
          Open it on a laptop or desktop to see the work as it was designed — and
          as it was worth building.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex w-full flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 text-[15px] font-medium text-[#111] transition-transform active:scale-95"
          >
            {copied ? "Link copied" : "Copy link for later"}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E86100]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {copied ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </>
                )}
              </svg>
            </span>
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="rounded-full px-4 py-3.5 text-[15px] text-white/50 underline underline-offset-4 transition-colors active:text-white"
          >
            Continue anyway
          </button>
        </motion.div>
      </div>

      <motion.p
        variants={fadeUp}
        className="relative z-10 text-[11px] uppercase tracking-[0.18em] text-white/35"
      >
        Thanks for stopping by
      </motion.p>
    </motion.section>
  );
}
