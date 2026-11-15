import { useEffect, useState, type CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import LanyardCard from "./ui/LanyardCard";
import InflateName from "./ui/InflateName";

/**
 * Anything narrower than the `lg` breakpoint gets the gate. That's the same
 * line the layout itself uses to switch to its stacked, animation-light
 * variants, so it's the point below which the scroll-driven experience stops
 * being the thing that was designed.
 */
const MOBILE_QUERY = "(max-width: 1023px)";

/**
 * True while the visitor is on a small screen.
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

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { blocked: isMobile };
}

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400;500;600&family=Funnel+Sans:wght@400;500;600&display=swap";

/** Gate-only palette: a white, quiet page with the brand orange as the accent. */
const tokens = {
  "--g-bg": "#ffffff",
  "--g-ink": "#0e0e12",
  "--g-ink-2": "#61606f",
  "--g-ink-3": "#9c9baa",
  "--g-soft": "#F4B184",
  "--g-soft-ink": "#F4B184",
  "--g-dot": "#E86100",
  "--g-line": "rgba(14,14,18,.08)",
  "--g-sans": "'Funnel Sans', system-ui, sans-serif",
  "--g-disp": "'Funnel Display', 'Funnel Sans', system-ui, sans-serif",
} as CSSProperties;

/** Card scale, strap length and anchor, worked out from the viewport. */
function useRigLayout() {
  const measure = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const strap = Math.round(vh * 0.14);
    // The card's bottom edge lands about two-thirds down, overlapping the big
    // name — and never wider than ~72% of the screen.
    const byHeight = (vh * 0.67 - strap) / (96 + 430);
    const byWidth = (vw * 0.72) / 300;
    const scale = Math.max(0.5, Math.min(1.1, byHeight, byWidth));
    const anchor = Math.min(vw * 0.62, vw - 12 - 150 * scale);
    return { scale, strap, anchorX: Math.round(anchor) };
  };

  const [layout, setLayout] = useState(measure);
  useEffect(() => {
    const onResize = () => setLayout(measure());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return layout;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

/**
 * Small-screen view: a single, unscrollable screen with a hanging ID card,
 * a "built for the desktop" note and a copy-link button. Nothing from the
 * real site (Lenis, ScrollTrigger, the hero scene) is mounted.
 */
export default function MobileGate() {
  const rig = useRigLayout();
  const [copied, setCopied] = useState(false);

  // Display fonts for the gate only — the desktop site never pays for them.
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  // Pin the page (no rubber-banding on iOS) and paint the overscroll white.
  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    for (const el of [html, body]) {
      el.style.overflow = "hidden";
      el.style.height = "100%";
      el.style.background = "#ffffff";
    }
    return () => {
      for (const el of [html, body]) {
        el.style.removeProperty("overflow");
        el.style.removeProperty("height");
        el.style.removeProperty("background");
      }
    };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + window.location.pathname);
      setCopied(true);
    } catch {
      // No clipboard permission (or no HTTPS) — leave the label alone rather
      // than claiming a copy that didn't happen.
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
      className="fixed inset-0 overflow-hidden bg-[var(--g-bg)] text-[var(--g-ink)] antialiased"
      style={{ ...tokens, fontFamily: "var(--g-sans)" }}
    >
      {/* Top copy */}
      <div
        className="relative z-[3] flex flex-col"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 36px)",
          paddingLeft: "max(24px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(24px, env(safe-area-inset-right, 0px))",
        }}
      >
        <motion.p
          variants={fadeUp}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--g-ink-3)]"
        >
          <i className="h-[5px] w-[5px] rounded-full bg-[var(--g-dot)]" />
          Sahil Patra · Studio
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-3.5 max-w-[11em] text-[24px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[34px]"
          style={{ fontFamily: "var(--g-disp)" }}
        >
          I build websites
          <span className="block text-[var(--g-soft)]">that sell.</span>
        </motion.h1>
      </div>

      {/* Big name + desktop note, pinned to the bottom. */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col"
        style={{
          paddingLeft: "max(24px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(24px, env(safe-area-inset-right, 0px))",
          paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <motion.div variants={fadeUp} className="relative z-[1]">
          <InflateName
            lines={["Sahil", "Patra"]}
            className="-ml-[0.04em] select-none font-medium leading-[0.84] tracking-[-0.055em] text-[var(--g-soft)]"
            style={{ fontFamily: "var(--g-disp)", fontSize: "min(30vw, 19svh)" }}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="relative z-[3] mt-7 grid max-w-[21em] justify-items-start gap-2">
          <p className="text-[22px] font-medium leading-[1.05] tracking-[-0.03em]" style={{ fontFamily: "var(--g-disp)" }}>
            Built for the desktop.
          </p>
          <p className="text-[12.5px] leading-[1.6] text-[var(--g-ink-2)] [@media(max-height:719px)]:hidden">
            This portfolio is designed for a larger screen. Open it on a computer to see it as it was meant to be seen.
          </p>
          <button
            type="button"
            onClick={copyLink}
            className="mt-2 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase leading-none tracking-[0.08em] text-[var(--g-ink)]"
          >
            <span>{copied ? "Link copied" : "Copy link"}</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--g-ink)] text-white">
              <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
                {copied ? (
                  <path d="M2.5 6.2L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M3 9L9 3M9 3H4.2M9 3V7.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </span>
          </button>
        </motion.div>
      </div>

      {/* The hanging card sits above everything on the page. */}
      <div className="pointer-events-none absolute inset-0 z-[60]">
        <LanyardCard {...rig} />
      </div>
    </motion.main>
  );
}
