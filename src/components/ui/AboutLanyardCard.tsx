import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import qrcode from "qrcode-generator";
import { contactEmail, instagramHandle, instagramUrl } from "../../data/site";

/**
 * About-section copy of ui/LanyardCard (the mobile gate's badge), kept as a
 * separate component so the two can drift apart. Differences from the gate:
 *  - it lives inside a scrolling section, not a fixed full-screen layer, so
 *    pointer input is converted into the container's own coordinates;
 *  - it sizes itself from its container (bigger than the gate's card);
 *  - the simulation only runs while the section is on screen, and the
 *    drop-in swing starts the first time it scrolls into view;
 *  - its palette and fonts are self-contained, with a brand-orange strap so
 *    it reads against the dark About section.
 *
 * A frosted-glass staff ID hanging from a lanyard and a chrome snap hook.
 *
 * The strap is a real rope: a chain of verlet points pinned above the top of
 * the screen, with distance constraints (fixed length) and a bending
 * constraint (a ribbon can't kink). Its last point carries the card's weight.
 * The card is a physical pendulum hung from that point, so it swings, lags and
 * overshoots as the strap moves.
 *
 * Grab the card anywhere: the grab point follows your finger, the card turns
 * under its own weight about that point, and the strap goes slack or pulls
 * taut (stretching at most ~15%) to follow. Let go and it all keeps its
 * momentum. A quick tap flips the card.
 *
 * Everything inside the badge is laid out on a 300 × 430 card and scaled as a
 * whole, so the type and hardware stay in proportion on any screen. The loop
 * writes straight to the DOM; React only renders on flip.
 */

const CARD_W = 300;
const CARD_H = 430;
const CARD_TOP = 96; // strap end → top edge of the card, in card units
const STRAP_W = 40; // in card units
const OVER = 40; // strap starts this far above the screen
const N = 16; // rope points
const STEP = 1 / 120;
const GRAV = 2600; // px/s²
const TAP_MOVE = 6; // px
const TAP_TIME = 280; // ms

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Funnel+Display:wght@400;500;600&family=Funnel+Sans:wght@400;500;600&display=swap";

const tokens = {
  "--g-ink": "#0e0e12",
  "--g-ink-2": "#61606f",
  "--g-ink-3": "#9c9baa",
  "--g-soft": "#F4B184",
  "--g-strap-ink": "rgba(255,255,255,.92)",
  "--g-dot": "#E86100",
  "--g-line": "rgba(14,14,18,.08)",
  "--g-sans": "'Funnel Sans', system-ui, sans-serif",
  "--g-disp": "'Funnel Display', 'Funnel Sans', system-ui, sans-serif",
} as CSSProperties;

/** Scale, strap and anchor from the container's size. */
function fit(w: number, h: number) {
  const strap = Math.round(h * 0.12);
  const byHeight = (h * 0.86 - strap) / (CARD_TOP + CARD_H);
  const byWidth = (w * 0.8) / CARD_W;
  const scale = Math.max(0.6, Math.min(1.4, byHeight, byWidth));
  return { scale, strap, anchorX: Math.round(w / 2) };
}

type Pt = { x: number; y: number; px: number; py: number };

/** CSS-rotate convention: rotate(a) turns (0, 1) into (-sin a, cos a). */
const rot = (x: number, y: number, a: number) => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c] as const;
};

export default function AboutLanyardCard() {
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const [{ scale, strap, anchorX }, setRig] = useState({ scale: 1, strap: 100, anchorX: 0 });
  const [visible, setVisible] = useState(false);
  const [measured, setMeasured] = useState(false);
  const ribbonRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const stitchRef = useRef<SVGPathElement>(null);
  const centerRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const flippedRef = useRef(false);
  const [flipped, setFlipped] = useState(false);

  const layout = useRef({ scale, strap, anchorX });
  layout.current = { scale, strap, anchorX };

  // Fonts for the badge only.
  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  // Size from the container, and only simulate while it is on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        setRig(fit(r.width, r.height));
        setMeasured(true);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  /** Client coordinates → the container's own coordinates. */
  const local = (clientX: number, clientY: number) => {
    const r = rootRef.current?.getBoundingClientRect();
    return r ? ([clientX - r.left, clientY - r.top] as const) : ([clientX, clientY] as const);
  };

  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    startT: number;
    moved: boolean;
    /** Grab point in card space (unrotated, screen px, relative to the ring). */
    gx: number;
    gy: number;
    /** Finger, raw and smoothed. */
    tx: number;
    ty: number;
    sx: number;
    sy: number;
    /** Angle the fingers are holding the card at (a pinch resists turning). */
    hold: number;
  } | null>(null);

  const sim = useRef<{
    pts: Pt[];
    th: number;
    om: number;
    yaw: number;
    vyaw: number;
    ax: number;
    ay: number;
    vx: number;
    vy: number;
    t: number;
    intro: number;
  } | null>(null);

  useEffect(() => {
    if (!visible || !measured) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Start the card swung out to the side so it falls and swings in.
    if (!sim.current) {
      const { strap: L0, anchorX: x0 } = layout.current;
      const len = L0 + OVER;
      const a0 = reduced ? 0 : -1.05;
      const [dx, dy] = rot(0, 1, a0);
      const pts: Pt[] = Array.from({ length: N }, (_, i) => {
        const d = (len * i) / (N - 1);
        const x = x0 + dx * d;
        const y = -OVER + dy * d;
        return { x, y, px: x, py: y };
      });
      sim.current = { pts, th: a0 * 0.7, om: 0, yaw: 0, vyaw: 0, ax: 0, ay: 0, vx: 0, vy: 0, t: 0, intro: reduced ? 1 : 0 };
    }

    const s = sim.current;
    let last = performance.now();
    let acc = 0;
    let frame = 0;

    const step = () => {
      const { scale: k, strap: L0, anchorX: x0 } = layout.current;
      const P = s.pts;
      const len = L0 + OVER;
      const seg = len / (N - 1);
      const rc = (CARD_TOP + CARD_H / 2) * k; // ring → card centre
      const d = drag.current;
      s.t += STEP;

      // The first swing only meets air resistance; normal damping fades in.
      if (s.intro < 1) s.intro = Math.min(1, s.intro + STEP / 2.2);
      const e = s.intro * s.intro * (3 - 2 * s.intro);
      const kd = reduced ? 0.95 : 0.9985 - 0.016 * e;

      // Anchor.
      P[0].x = P[0].px = x0;
      P[0].y = P[0].py = -OVER;

      // Verlet integrate.
      for (let i = 1; i < N; i++) {
        const p = P[i];
        const vx = (p.x - p.px) * kd;
        const vy = (p.y - p.py) * kd;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + GRAV * STEP * STEP;
      }

      // While dragging, the ring follows the finger through the card. If the
      // finger is further than the strap can reach, the strap pulls taut and
      // the card lines up along the pull, like a held tag on a string.
      const E = P[N - 1];
      let taut = false;
      let want = 0;
      if (d) {
        d.sx += (d.tx - d.sx) * 0.35;
        d.sy += (d.ty - d.sy) * 0.35;
        const max = len * 1.12;
        const glen = Math.hypot(d.gx, d.gy);
        const fdx = d.sx - x0;
        const fdy = d.sy + OVER;
        const fd = Math.hypot(fdx, fdy) || 1;
        if (fd > max + glen * 0.98) {
          taut = true;
          const ux = fdx / fd;
          const uy = fdy / fd;
          E.x = x0 + ux * max;
          E.y = -OVER + uy * max;
          want = Math.atan2(-ux, uy) - Math.atan2(-d.gx, d.gy);
          want = s.th + Math.atan2(Math.sin(want - s.th), Math.cos(want - s.th));
        } else {
          const [gx, gy] = rot(d.gx, d.gy, s.th);
          let ex = d.sx - gx;
          let ey = d.sy - gy;
          const dist = Math.hypot(ex - x0, ey + OVER);
          if (dist > max) {
            ex = x0 + ((ex - x0) * max) / dist;
            ey = -OVER + ((ey + OVER) * max) / dist;
          }
          E.x = ex;
          E.y = ey;
        }
      }

      // Constraints: fixed segment length, and a ribbon that won't fold flat.
      const endW = d ? 0 : 0.22; // the card makes the end heavy
      for (let it = 0; it < 14; it++) {
        for (let i = 0; i < N - 1; i++) {
          const p = P[i];
          const q = P[i + 1];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const dd = Math.hypot(dx, dy) || 1;
          const wp = i === 0 ? 0 : 1;
          const wq = i + 1 === N - 1 ? endW : 1;
          const w = wp + wq;
          if (!w) continue;
          const f = (dd - seg) / dd / w;
          p.x += dx * f * wp;
          p.y += dy * f * wp;
          q.x -= dx * f * wq;
          q.y -= dy * f * wq;
        }
        for (let i = 0; i < N - 2; i++) {
          const p = P[i];
          const q = P[i + 2];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const dd = Math.hypot(dx, dy) || 1;
          const m = 1.9 * seg;
          if (dd >= m) continue;
          const wp = i === 0 ? 0 : 1;
          const wq = i + 2 === N - 1 ? endW : 1;
          const w = wp + wq;
          if (!w) continue;
          const f = (0.5 * (dd - m)) / dd / w;
          p.x += dx * f * wp;
          p.y += dy * f * wp;
          q.x -= dx * f * wq;
          q.y -= dy * f * wq;
        }
      }

      // Ring velocity and (smoothed) acceleration drive the card.
      const vx = (E.x - E.px) / STEP;
      const vy = (E.y - E.py) / STEP;
      const ax = (vx - s.vx) / STEP;
      const ay = (vy - s.vy) / STEP;
      s.vx = vx;
      s.vy = vy;
      s.ax += (Math.max(-2e4, Math.min(2e4, ax)) - s.ax) * 0.25;
      s.ay += (Math.max(-2e4, Math.min(2e4, ay)) - s.ay) * 0.25;

      let alpha: number;
      const c = reduced ? 6 : 0.4 + 1.6 * e;
      if (d && taut) {
        alpha = 140 * (want - s.th) - 16 * s.om;
        d.hold = s.th;
      } else if (d) {
        // A pinch mostly holds the card's angle; its weight and the finger's
        // jerks only lever it a little, and it never tips past ~70°.
        const [cx, cy] = rot(-d.gx, rc - d.gy, s.th);
        const I = Math.max(cx * cx + cy * cy, (90 * k) ** 2) * 1.15;
        const lim = 1.2;
        d.hold = Math.max(-lim, Math.min(lim, d.hold));
        alpha = (0.3 * (cx * GRAV - cx * s.ay + cy * s.ax)) / I + 40 * (d.hold - s.th) - 9 * s.om;
      } else {
        // Physical pendulum hung from the ring, plus a little stiffness in the
        // swivel that keeps it loosely lined up with the strap's end.
        const prev = P[N - 2];
        const phi = Math.atan2(-(E.x - prev.x), E.y - prev.y);
        const r = rc * 0.78;
        alpha = (-GRAV * Math.sin(s.th) + s.ax * Math.cos(s.th) + s.ay * Math.sin(s.th)) / r + 2.5 * (phi - s.th) - c * s.om;
      }
      s.om = Math.max(-14, Math.min(14, s.om + alpha * STEP));
      s.th += s.om * STEP;

      // Twist: springs to the shown face; sideways speed spins it a little.
      const target = flippedRef.current ? Math.PI : 0;
      s.vyaw += (90 * (target - s.yaw) - 11 * s.vyaw + Math.max(-8, Math.min(8, vx * 0.01))) * STEP;
      s.yaw += s.vyaw * STEP;
    };

    const render = () => {
      const { scale: k } = layout.current;
      const P = s.pts;
      const hw = (STRAP_W / 2) * k;

      // Smooth the rope (Catmull-Rom, 4 samples per segment).
      const C: [number, number][] = [];
      for (let i = 0; i < N - 1; i++) {
        const p0 = P[Math.max(0, i - 1)];
        const p1 = P[i];
        const p2 = P[i + 1];
        const p3 = P[Math.min(N - 1, i + 2)];
        for (let j = 0; j < 4; j++) {
          const t = j / 4;
          const t2 = t * t;
          const t3 = t2 * t;
          const f = (a: number, b: number, cc: number, dd: number) =>
            0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - dd) * t2 + (-a + 3 * b - 3 * cc + dd) * t3);
          C.push([f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y)]);
        }
      }
      C.push([P[N - 1].x, P[N - 1].y]);

      const M = C.length;
      const Lp: string[] = [];
      const Rp: string[] = [];
      const Sh: string[] = [];
      const St: string[] = [];
      const Sr: string[] = [];
      for (let i = 0; i < M; i++) {
        const a = C[Math.max(0, i - 1)];
        const b = C[Math.min(M - 1, i + 1)];
        let tx = b[0] - a[0];
        let ty = b[1] - a[1];
        const dd = Math.hypot(tx, ty) || 1;
        tx /= dd;
        ty /= dd;
        const [x, y] = C[i];
        Lp.push(`${(x - ty * hw).toFixed(1)} ${(y + tx * hw).toFixed(1)}`);
        Rp.push(`${(x + ty * hw).toFixed(1)} ${(y - tx * hw).toFixed(1)}`);
        // Wall shadow: offset to the right, more so further from the ring.
        const u = i / (M - 1);
        const off = (30 - 26 * u) * k;
        Sh.push(`${(x + off - ty * hw).toFixed(1)} ${(y + 6 * k + tx * hw).toFixed(1)}`);
        // Stitching just inside each edge.
        const si = hw - 3 * k;
        St.push(`${(x - ty * si).toFixed(1)} ${(y + tx * si).toFixed(1)}`);
        Sr.push(`${(x + ty * si).toFixed(1)} ${(y - tx * si).toFixed(1)}`);
      }
      const ShR: string[] = [];
      for (let i = M - 1; i >= 0; i--) {
        const u = i / (M - 1);
        const off = (30 - 26 * u) * k;
        const [x, y] = C[i];
        const a = C[Math.max(0, i - 1)];
        const b = C[Math.min(M - 1, i + 1)];
        let tx = b[0] - a[0];
        let ty = b[1] - a[1];
        const dd = Math.hypot(tx, ty) || 1;
        tx /= dd;
        ty /= dd;
        ShR.push(`${(x + off + ty * hw).toFixed(1)} ${(y + 6 * k - tx * hw).toFixed(1)}`);
      }

      ribbonRef.current?.setAttribute("d", `M${Lp.join("L")}L${Rp.reverse().join("L")}Z`);
      shadowRef.current?.setAttribute("d", `M${Sh.join("L")}L${ShR.join("L")}Z`);
      stitchRef.current?.setAttribute("d", `M${St.join("L")}M${Sr.join("L")}`);
      centerRef.current?.setAttribute("d", `M${C.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`);

      const E = P[N - 1];
      const prev = P[N - 2];
      const phi = Math.atan2(-(E.x - prev.x), E.y - prev.y);
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${E.x.toFixed(2)}px,${E.y.toFixed(2)}px,0) rotate(${phi.toFixed(4)}rad) scale(${k})`;
      if (badgeRef.current) badgeRef.current.style.transform = `translate3d(${E.x.toFixed(2)}px,${E.y.toFixed(2)}px,0) rotate(${s.th.toFixed(4)}rad) scale(${k})`;
      const card = cardRef.current;
      if (card) {
        card.style.transform = `rotateY(${s.yaw.toFixed(4)}rad) rotateX(${(-s.om * 0.03).toFixed(4)}rad)`;
        const turn = s.yaw + s.th * 0.8;
        card.style.setProperty("--shine", `${(Math.sin(turn) * 70 - s.th * 40).toFixed(1)}%`);
        card.style.setProperty("--rim", `${((turn * 180) / Math.PI + s.t * 12).toFixed(1)}deg`);
      }
    };

    const tick = (now: number) => {
      acc += Math.min((now - last) / 1000, 0.05);
      last = now;
      while (acc >= STEP) {
        step();
        acc -= STEP;
      }
      render();
      frame = requestAnimationFrame(tick);
    };

    render();
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, measured]);

  // Strap text length tracks the visible strap.
  useEffect(() => {
    textRef.current?.setAttribute("textLength", String(Math.max(40, strap - 30 * scale)));
  }, [strap, scale]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    const s = sim.current;
    if (!s) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const E = s.pts[N - 1];
    const [lx, ly] = local(e.clientX, e.clientY);
    const [gx, gy] = rot(lx - E.x, ly - E.y, -s.th);
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startT: performance.now(),
      moved: false,
      gx,
      gy,
      tx: lx,
      ty: ly,
      sx: lx,
      sy: ly,
      hold: s.th,
    };
    cardRef.current?.setAttribute("data-dragging", "");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > TAP_MOVE) d.moved = true;
    [d.tx, d.ty] = local(e.clientX, e.clientY);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    cardRef.current?.removeAttribute("data-dragging");
    if (!d.moved && performance.now() - d.startT < TAP_TIME) toggleFlip();
  };

  const toggleFlip = () => {
    flippedRef.current = !flippedRef.current;
    setFlipped(flippedRef.current);
    if (sim.current) sim.current.om += flippedRef.current ? 0.8 : -0.8;
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0"
      style={{ ...tokens, fontFamily: "var(--g-sans)", visibility: measured ? undefined : "hidden" }}
    >
      {/* Strap, its wall shadow and the name woven into it. */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <filter id={`${uid}-soft`} x="-20%" y="-5%" width="140%" height="110%">
            <feGaussianBlur stdDeviation={3 * scale} />
          </filter>
          <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F07A1F" />
            <stop offset="1" stopColor="#D85A00" />
          </linearGradient>
        </defs>
        <path ref={shadowRef} fill="rgba(0,0,0,.35)" filter={`url(#${uid}-soft)`} />
        <path ref={ribbonRef} fill={`url(#${uid}-sheen)`} />
        <path
          ref={stitchRef}
          fill="none"
          stroke="rgba(255,255,255,.28)"
          strokeWidth={0.8 * scale}
          strokeDasharray={`${3 * scale} ${2.2 * scale}`}
        />
        <path ref={centerRef} id={`${uid}-c`} fill="none" />
        <text
          ref={textRef}
          fill="var(--g-strap-ink)"
          dominantBaseline="central"
          lengthAdjust="spacing"
          style={{ fontFamily: "var(--g-sans)", fontSize: 10 * scale, fontWeight: 500 }}
        >
          <textPath href={`#${uid}-c`} startOffset={OVER + 12 * scale}>
            SAHIL PATRA
          </textPath>
        </text>
      </svg>

      {/* Ring at the strap's end; turns with the strap. */}
      <div ref={ringRef} className="absolute left-0 top-0 will-change-transform" style={{ transformOrigin: "0 0" }}>
        <Ring />
      </div>

      {/* Badge: hangs from the ring, turns as a pendulum. */}
      <div ref={badgeRef} className="absolute left-0 top-0 will-change-transform" style={{ transformOrigin: "0 0" }}>
        <div
          className="absolute"
          style={{ left: -CARD_W / 2, top: CARD_TOP, width: CARD_W, height: CARD_H, perspective: 1100 }}
        >
          <div
            ref={cardRef}
            data-lanyard-card=""
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-label={flipped ? "ID card, contact side. Tap to turn it back." : "ID card. Drag to swing, tap to flip."}
            onKeyDown={(e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleFlip();
              }
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="pointer-events-auto absolute inset-0 cursor-grab select-none outline-none active:cursor-grabbing"
            style={{
              transformOrigin: "50% 0",
              transformStyle: "preserve-3d",
              touchAction: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Clasp />
            <Clasp back />
            <Face>
              <Front onFlip={toggleFlip} />
            </Face>
            <Face back>
              <Back onFlip={toggleFlip} />
            </Face>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Hardware                                                                  */
/* ------------------------------------------------------------------------ */

const EDGE = "#2c2e34";

function MetalDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset=".28" stopColor="#a4a8b1" />
        <stop offset=".52" stopColor="#3b3e45" />
        <stop offset=".74" stopColor="#d9dce2" />
        <stop offset="1" stopColor="#5b5f68" />
      </linearGradient>
      <linearGradient id={`${id}-h`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4a4d55" />
        <stop offset=".22" stopColor="#ffffff" />
        <stop offset=".42" stopColor="#a9adb6" />
        <stop offset=".64" stopColor="#3a3d44" />
        <stop offset=".86" stopColor="#c4c7ce" />
        <stop offset="1" stopColor="#6e727b" />
      </linearGradient>
    </defs>
  );
}

/** The ring the strap folds through. Base units; scaled by its parent. */
function Ring() {
  const u = "about-ring";
  return (
    <svg
      aria-hidden="true"
      className="absolute overflow-visible"
      style={{ left: -37.5, top: -10, filter: "drop-shadow(0 2px 1.6px rgba(14,14,18,.32))" }}
      width="75"
      height="50"
      viewBox="0 0 60 40"
    >
      <MetalDefs id={u} />
      <path d="M9.5 3 C5 17 15 30.5 30 30.5 C45 30.5 55 17 50.5 3" fill="none" stroke={EDGE} strokeWidth="5" strokeLinecap="round" />
      <path d="M9.5 3 C5 17 15 30.5 30 30.5 C45 30.5 55 17 50.5 3" fill="none" stroke={`url(#${u}-h)`} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M9.4 7 C8.4 17 16.5 27.6 30 28.4" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth=".9" strokeLinecap="round" />
      {/* Strap end folded over the ring, with a stitched seam. */}
      <rect x="10" y="-2" width="40" height="9.5" rx="1.2" fill="#D85A00" />
      <path d="M12 4.6 H48" stroke="rgba(255,255,255,.3)" strokeWidth=".7" strokeDasharray="2.4 1.8" />
      <path d="M10 7.3 H50" stroke="#000" strokeOpacity=".45" strokeWidth="1" />
    </svg>
  );
}

/**
 * Swivel snap hook. Lives inside the card's 3D layer so it twists and flips
 * with the card; the back copy is mirrored so it reads right from behind.
 * Its tip curls down through the slot cut into the card.
 */
function Clasp({ back = false }: { back?: boolean }) {
  const u = back ? "about-clasp-b" : "about-clasp-f";
  return (
    <svg
      aria-hidden="true"
      className="absolute overflow-visible"
      style={{
        left: CARD_W / 2 - 37.5,
        top: -72.5,
        transform: back ? "rotateY(180deg) translateZ(1px)" : "translateZ(1px)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        filter: "drop-shadow(0 1.5px 1.4px rgba(14,14,18,.4))",
      }}
      width="75"
      height="90"
      viewBox="0 0 60 72"
    >
      <MetalDefs id={u} />
      {/* Swivel eye through the ring. */}
      <ellipse cx="30" cy="2.4" rx="3.6" ry="3.8" fill="none" stroke={EDGE} strokeWidth="3.2" />
      <ellipse cx="30" cy="2.4" rx="3.6" ry="3.8" fill="none" stroke={`url(#${u}-h)`} strokeWidth="2" />
      {/* Swivel head and collar. */}
      <rect x="25.8" y="5.2" width="8.4" height="8.6" rx="2.2" fill={`url(#${u}-h)`} stroke={EDGE} strokeWidth=".7" />
      <path d="M27.4 6.6 V12.4" stroke="#fff" strokeOpacity=".8" strokeWidth=".8" strokeLinecap="round" />
      <rect x="24.4" y="12.8" width="11.2" height="2.8" rx="1.4" fill={`url(#${u}-v)`} stroke={EDGE} strokeWidth=".6" />
      {/* Shank curling into the hook. */}
      <path
        d="M26.4 15.4 L34.6 15.4 L36.2 26 C37.2 37.4 35.6 50.4 31.4 59.2 C29.1 64.1 25 67.2 20.8 65.7 C18.2 64.8 18.7 61.4 21.3 61.4 C24.4 61.4 26.4 57.1 27.4 50.4 L28.5 30 Z"
        fill={`url(#${u}-h)`}
        stroke={EDGE}
        strokeWidth=".8"
        strokeLinejoin="round"
      />
      <path d="M34.2 19 C35.3 31 34.6 44.6 31.4 54.4" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth=".9" strokeLinecap="round" />
      <path d="M29.6 18 L30.4 30" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth=".6" />
      {/* Spring gate. */}
      <path d="M27 19.4 L21.5 60.8" fill="none" stroke={EDGE} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M27 19.4 L21.5 60.8" fill="none" stroke={`url(#${u}-v)`} strokeWidth="1.6" strokeLinecap="round" />
      {/* Thumb tab and rivet. */}
      <path d="M35.4 28.6 L43.8 25 Q47 24 46.3 27.2 L36.4 37.2 Z" fill={`url(#${u}-v)`} stroke={EDGE} strokeWidth=".7" strokeLinejoin="round" />
      <path d="M37 29.6 L43.6 26.6" stroke="#fff" strokeOpacity=".7" strokeWidth=".6" strokeLinecap="round" />
      <circle cx="32.2" cy="25.4" r="1.7" fill="#1b1d22" />
      <circle cx="31.8" cy="24.9" r=".6" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Card faces                                                                */
/* ------------------------------------------------------------------------ */

/** Cuts the lanyard slot out of the card so the background shows through. */
const SLOT_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 430'%3E%3Cpath fill-rule='evenodd' d='M0 0H300V430H0Z M133.2 7H166.8A3 3 0 0 1 166.8 13H133.2A3 3 0 0 1 133.2 7Z'/%3E%3C/svg%3E\") 0 0/100% 100% no-repeat";

function Face({ back = false, children }: { back?: boolean; children: ReactNode }) {
  return (
    <section
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{
        borderRadius: 22,
        padding: "30px 16px 16px",
        color: "var(--g-ink)",
        // Near-opaque frosted face: on the dark About section clear glass
        // turns muddy grey, so only a hint of the background shows through.
        background: "linear-gradient(160deg,rgba(255,255,255,.98),rgba(248,246,244,.94) 46%,rgba(242,239,236,.96))",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.95), inset 0 0 0 1px rgba(255,255,255,.6), 0 1px 1px rgba(14,14,18,.05), 0 22px 44px -18px rgba(60,40,30,.3), 0 50px 90px -40px rgba(60,40,30,.22)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        WebkitMask: SLOT_MASK,
        mask: SLOT_MASK,
      }}
    >
      {/* Iridescent rim. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          borderRadius: "inherit",
          padding: 1.5,
          background: "conic-gradient(from var(--rim,0deg),#c9f1ff,#e7d4ff,#ffe1f0,#fff3c8,#d2ffe8,#c9f1ff)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: 0.45,
        }}
      />
      {/* Moving glare. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-[2] mix-blend-soft-light"
        style={{
          inset: "-30%",
          background:
            "radial-gradient(40% 30% at 30% 20%,rgba(255,255,255,.9),rgba(255,255,255,0) 70%),linear-gradient(115deg,rgba(255,255,255,0) 35%,rgba(255,255,255,.6) 48%,rgba(255,255,255,0) 60%)",
          transform: "translateX(var(--shine,0%))",
          opacity: 0.35,
        }}
      />
      {/* Shadowed inner edge of the slot. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-[3]"
        style={{
          left: 130.2,
          top: 7,
          width: 39.6,
          height: 6,
          borderRadius: 3,
          boxShadow:
            "inset 0 1.4px 1.6px -0.4px rgba(14,14,18,.55), inset 0 -1px 0 rgba(255,255,255,.95), inset 0 -1.7px 0 rgba(200,204,218,.95)",
        }}
      />
      {children}
    </section>
  );
}

const small = "text-[11px] uppercase tracking-[0.09em]";
const rowCls = `flex items-center justify-between px-1 pb-2.5 ${small} text-[var(--g-ink-3)]`;
const footCls = `mt-auto flex items-center justify-between border-t border-[var(--g-line)] px-1 pt-3 ${small} text-[var(--g-ink-2)]`;
const disp = { fontFamily: "var(--g-disp)" } as const;

function RoundButton({ label, onClick, dir }: { label: string; onClick: () => void; dir: "out" | "in" }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative z-[3] grid h-7 w-7 place-items-center rounded-full bg-[var(--g-ink)] text-white transition-transform active:scale-90"
    >
      <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3" aria-hidden="true">
        <path
          d={dir === "out" ? "M3 9L9 3M9 3H4.2M9 3V7.8" : "M9 3L3 9M3 9H7.8M3 9V4.2"}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function Front({ onFlip }: { onFlip: () => void }) {
  return (
    <>
      <div className={rowCls}>
        <span>Website &amp; System Strategist</span>
        <span>#01</span>
      </div>
      <div className="aspect-square overflow-hidden rounded-[15px] bg-[var(--g-soft)]">
        <img
          src="/gate/portrait.jpg"
          alt="Illustrated portrait of Sahil Patra"
          draggable={false}
          className="pointer-events-none block h-full w-full select-none object-cover"
        />
      </div>
      <p className="mx-1 mt-3.5 text-[26px] font-medium leading-[1.1] tracking-[-0.025em]" style={disp}>
        Sahil Patra
      </p>
      <p className="mx-1 mt-1 text-[13.5px] text-[var(--g-ink-2)]">Websites · Sales Systems · Automation</p>
      <div className={footCls}>
        <span>View contact</span>
        <RoundButton label="Show contact details" onClick={onFlip} dir="out" />
      </div>
    </>
  );
}

function Back({ onFlip }: { onFlip: () => void }) {
  return (
    <>
      <div className={rowCls}>
        <span>Contact</span>
        <span>#01</span>
      </div>
      <p className="mx-1 mt-[42px] text-[30px] font-semibold leading-none tracking-[-0.025em]" style={disp}>
        Sahil Patra<span className="text-[var(--g-dot)]">.</span>
      </p>
      <p className="mx-1 mt-1.5 text-[13.5px] text-[var(--g-ink-2)]">Website &amp; System Strategist</p>

      <div className="relative z-[3] mt-5 grid border-b border-[var(--g-line)]">
        <ContactRow k="Email" v={contactEmail} copy={contactEmail} />
        <LinkRow k="Insta" v={`@${instagramHandle}`} href={instagramUrl} />
      </div>

      <div className="relative z-[3] mt-auto grid grid-cols-[92px_minmax(0,1fr)] grid-rows-[1fr_auto] gap-x-3.5 px-1">
        <QR value={instagramUrl} />
        <div className="grid content-start gap-1">
          <span className="text-[12.5px] text-[var(--g-ink)]">Scan for Instagram</span>
          <span className="text-[11.5px] leading-snug text-[var(--g-ink-2)]">Work, process &amp; reels</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`${small} text-[var(--g-ink-3)]`}>Issued 2026</span>
          <RoundButton label="Show front of card" onClick={onFlip} dir="in" />
        </div>
      </div>
    </>
  );
}

function ContactRow({ k, v, copy }: { k: string; v: string; copy: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 1600);
    return () => window.clearTimeout(timer);
  }, [done]);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(copy);
      setDone(true);
    } catch {
      if (k === "Email") window.location.href = `mailto:${copy}`;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Copy ${k.toLowerCase()}`}
      className="-mx-0.5 grid grid-cols-[50px_minmax(0,1fr)_16px] items-center gap-2 rounded-lg border-t border-[var(--g-line)] px-1.5 py-[11px] text-left text-[var(--g-ink)] transition-colors active:bg-black/[0.08]"
    >
      <span className={`${small} ${done ? "text-[var(--g-ink)]" : "text-[var(--g-ink-3)]"}`}>{done ? "Copied" : k}</span>
      <span className="truncate text-[13px]">{v}</span>
      <svg
        viewBox="0 0 16 16"
        className="h-[15px] w-[15px] fill-none stroke-current text-[var(--g-ink-3)]"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {done ? (
          <path d="M3.5 8.5l3 3 6-7" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.6" />
            <path d="M10.5 3.5V3a.5.5 0 0 0-.5-.5H3.5a1 1 0 0 0-1 1V10a.5.5 0 0 0 .5.5h.5" />
          </>
        )}
      </svg>
    </button>
  );
}

function LinkRow({ k, v, href }: { k: string; v: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${v} on Instagram`}
      className="-mx-0.5 grid grid-cols-[50px_minmax(0,1fr)_16px] items-center gap-2 rounded-lg border-t border-[var(--g-line)] px-1.5 py-[11px] text-left text-[var(--g-ink)] transition-colors active:bg-black/[0.08]"
    >
      <span className={`${small} text-[var(--g-ink-3)]`}>{k}</span>
      <span className="truncate text-[13px]">{v}</span>
      <svg viewBox="0 0 16 16" className="h-[15px] w-[15px] fill-none stroke-current text-[var(--g-ink-3)]" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 11l6-6M6 5h5v5" />
      </svg>
    </a>
  );
}

/** QR code, drawn as a single SVG path. */
function QR({ value }: { value: string }) {
  const { d, n } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value || "https://");
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    }
    return { d, n };
  }, [value]);

  return (
    <svg
      // Quiet zone + solid white backing: the glass card is see-through, so
      // the code needs its own opaque ground to scan reliably.
      viewBox={`-1.5 -1.5 ${n + 3} ${n + 3}`}
      className="row-span-2 block h-[92px] w-[92px] text-[var(--g-ink)]"
      role="img"
      aria-label="QR code that opens Sahil Patra on Instagram"
      shapeRendering="crispEdges"
    >
      <rect x="-1.5" y="-1.5" width={n + 3} height={n + 3} rx="1.2" fill="#fff" />
      <path d={d} fill="currentColor" />
    </svg>
  );
}
