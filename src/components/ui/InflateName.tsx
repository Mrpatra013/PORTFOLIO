import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Big display name whose letters are lit like soft inflated 3D shapes.
 *
 * Each letter gets an SVG lighting filter: the glyph's alpha is blurred into a
 * height map, lit from above with diffuse + specular light, and given a soft
 * drop shadow, so flat type reads as a puffy, glossy solid.
 *
 * Letters swell further (and bob up a touch) under a finger, under the card
 * while it's being dragged, and in a wave that rolls through the name once on
 * load. Each letter runs its own under-damped spring, so it overshoots and
 * settles, then deflates slowly.
 *
 * Filters are pre-built at a handful of puff levels and a letter just swaps
 * which one it uses when its level changes. Re-writing filter attributes every
 * frame is what makes this kind of effect stutter on iOS, where Safari renders
 * SVG filters on the CPU.
 */

const LEVELS = 9; // filter steps from flat to fully inflated
const QMAX = 1.15; // spring overshoot headroom
const BASE = 0.32; // resting puff, so the name always reads as 3D
const WAVE_DELAY = 1100; // ms after mount
const WAVE_LEN = 1700; // ms
const WAVE_AMP = 0.85;
const WAVE_HALF = 1.15; // half-width of the crest, in letters

interface Props {
  lines: string[];
  className?: string;
  style?: CSSProperties;
  /** Shadow tint, as 0–1 RGB. */
  shadowRgb?: [number, number, number];
}

type Letter = { el: HTMLSpanElement | null; k: number; v: number; lvl: number; tf: string };

export default function InflateName({ lines, className, style, shadowRgb = [0.36, 0.13, 0.02] }: Props) {
  const rootRef = useRef<HTMLParagraphElement>(null);
  const letters = useRef<Letter[]>([]);
  const [fs, setFs] = useState(0);
  const idBase = useRef(`inf${Math.random().toString(36).slice(2, 7)}`).current;

  // Filters depend on font size (blur radius, height, shadow offset in px).
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setFs(parseFloat(getComputedStyle(el).fontSize) || 100);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !fs) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const L = letters.current;

    const setLevel = (l: Letter, q: number) => {
      const lvl = Math.max(0, Math.min(LEVELS - 1, Math.round((q / QMAX) * (LEVELS - 1))));
      if (lvl === l.lvl || !l.el) return;
      l.lvl = lvl;
      l.el.style.filter = `url(#${idBase}-${lvl})`;
    };

    if (reduced) {
      L.forEach((l) => setLevel(l, BASE));
      return;
    }

    // Finger anywhere on the page.
    let fx = 0;
    let fy = 0;
    let fingerUntil = 0;
    const onDown = (e: PointerEvent) => {
      fx = e.clientX;
      fy = e.clientY;
      fingerUntil = Infinity;
    };
    const onMove = (e: PointerEvent) => {
      fx = e.clientX;
      fy = e.clientY;
      if (e.pointerType === "mouse") fingerUntil = performance.now() + 400;
    };
    const onUp = () => {
      fingerUntil = performance.now() + 250;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    const t0 = performance.now();
    let last = t0;
    let frame = 0;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      const sources: [number, number][] = [];
      if (now < fingerUntil) sources.push([fx, fy]);
      const card = document.querySelector<HTMLElement>("[data-lanyard-card][data-dragging]");
      if (card) {
        const r = card.getBoundingClientRect();
        sources.push([r.left + r.width / 2, r.bottom - r.height * 0.12]);
      }

      const we = (now - t0 - WAVE_DELAY) / WAVE_LEN;
      const crest = we > 0 && we < 1 ? -2.5 + we * (L.length + 5) : null;

      const centres = sources.length
        ? L.map((l) => {
            const r = l.el!.getBoundingClientRect();
            return [r.left + r.width / 2, r.top + r.height / 2] as const;
          })
        : null;
      const R = fs * 0.75;

      L.forEach((l, i) => {
        let t = 0;
        if (centres) {
          for (const [sx, sy] of sources) {
            const dx = sx - centres[i][0];
            const dy = sy - centres[i][1];
            t = Math.max(t, Math.exp(-(dx * dx + dy * dy) / (R * R)));
          }
        }
        if (crest !== null) {
          const u = (i - crest) / WAVE_HALF;
          t = Math.max(t, WAVE_AMP * Math.exp(-u * u));
        }

        if (t > l.k + 0.002 || Math.abs(l.v) > 0.01) {
          // Inflate: under-damped spring (ω 15, ζ 0.42) — overshoots, settles.
          const w = 15;
          const z = 0.42;
          l.v += (w * w * (t - l.k) - 2 * z * w * l.v) * dt;
          l.k += l.v * dt;
        } else {
          // Deflate: slow, like air leaking out.
          l.v = 0;
          l.k += (t - l.k) * (1 - Math.exp(-dt / (crest !== null ? 0.16 : 0.45)));
        }

        const kk = Math.max(0, l.k);
        setLevel(l, BASE + (1 - BASE) * kk);
        const tf = kk < 0.01 ? "" : `translate3d(0,${(-0.03 * kk).toFixed(4)}em,0) scale(${(1 + 0.085 * kk).toFixed(4)})`;
        if (tf !== l.tf && l.el) {
          l.tf = tf;
          l.el.style.transform = tf;
        }
      });

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [fs, idBase]);

  let idx = 0;
  const register = (i: number) => (el: HTMLSpanElement | null) => {
    letters.current[i] = letters.current[i] ?? { el: null, k: 0, v: 0, lvl: -1, tf: "" };
    letters.current[i].el = el;
  };

  return (
    <>
      <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute" style={{ overflow: "hidden" }}>
        <defs>
          {fs > 0 &&
            Array.from({ length: LEVELS }, (_, j) => (
              <PuffFilter key={j} id={`${idBase}-${j}`} q={(j / (LEVELS - 1)) * QMAX} fs={fs} shadow={shadowRgb} />
            ))}
        </defs>
      </svg>
      <p ref={rootRef} aria-hidden="true" className={className} style={style}>
        {lines.map((line, li) => (
          <span key={li} className="block whitespace-nowrap">
            {[...line].map((ch, ci) => {
              const i = idx++;
              return (
                <span
                  key={ci}
                  ref={register(i)}
                  className="inline-block will-change-transform"
                  style={{ transformOrigin: "50% 80%", filter: `url(#${idBase}-${Math.round(((BASE / QMAX) * (LEVELS - 1)))})` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </p>
    </>
  );
}

/**
 * One puff level. The glyph's blurred alpha is the height map; light comes
 * from straight above the screen at 52°. Diffuse light shades the sloping
 * edges (flat tops keep the original colour), specular adds the gloss, and a
 * warm soft shadow drops below.
 */
function PuffFilter({ id, q, fs, shadow }: { id: string; q: number; fs: number; shadow: [number, number, number] }) {
  const qc = Math.min(1.2, q);
  const r = fs * 0.032 * qc + 0.4; // dome radius ≈ a third of the stroke
  const z = fs * 0.065 * q; // dome height
  const a = 0.9 * Math.min(1, q);
  const [sr, sg, sb] = shadow;
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="175%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={r} result="h" />
      <feSpecularLighting in="h" surfaceScale={z} specularConstant={0.95} specularExponent={22} lightingColor="#fff" result="sp">
        <feDistantLight azimuth={270} elevation={52} />
      </feSpecularLighting>
      <feDiffuseLighting in="h" surfaceScale={z} diffuseConstant={1} lightingColor="#fff" result="df">
        <feDistantLight azimuth={270} elevation={52} />
      </feDiffuseLighting>
      {/* colour × light, normalised so a flat face (sin 52° ≈ .79) keeps its colour */}
      <feComposite in="SourceGraphic" in2="df" operator="arithmetic" k1={a} k2={1 - 0.79 * a} k3={0} k4={0} result="sh" />
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="g" />
      <feComposite in="g" in2="sh" operator="arithmetic" k1={0} k2={0.6 * qc} k3={1} k4={0} result="l" />
      <feComposite in="l" in2="SourceAlpha" operator="in" result="b" />
      <feGaussianBlur in="SourceAlpha" stdDeviation={fs * 0.035 * q + 0.5} result="sa" />
      <feOffset in="sa" dx={0} dy={fs * 0.05 * q} result="so" />
      <feColorMatrix
        in="so"
        type="matrix"
        values={`0 0 0 0 ${sr}  0 0 0 0 ${sg}  0 0 0 0 ${sb}  0 0 0 ${(0.24 * Math.min(1, q)).toFixed(3)} 0`}
        result="sc"
      />
      <feMerge>
        <feMergeNode in="sc" />
        <feMergeNode in="b" />
      </feMerge>
    </filter>
  );
}
