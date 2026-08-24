import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useIntroReady } from "../lib/introReady";

const TAGS = ["Branding", "Optimized Code", "Modern UI", "Webflow Development"];

function CountUp({
  end,
  suffix = "",
  duration = 6400,
  start,
  className,
}: {
  end: number;
  suffix?: string;
  duration?: number;
  start: boolean;
  className?: string;
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, start]);

  return (
    <span className={className}>
      {value}
      {suffix}
    </span>
  );
}

function BadgeIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="11"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.4"
      />
      <path
        d="M7 9l5 3 5-3M7 15l5-3 5 3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function SkillsStats() {
  const { ready } = useIntroReady();

  return (
    <div className="flex w-full max-w-[380px] flex-col gap-4">
      <motion.p
        variants={itemVariants}
        className="text-[11px] font-bold uppercase tracking-[0.1em] text-black"
      >
        What I bring to the table
      </motion.p>

      <div className="flex flex-wrap gap-2.5">
        {TAGS.map((tag) => (
          <motion.span
            key={tag}
            variants={itemVariants}
            className="rounded-full bg-white px-4 py-2 text-[13px] text-black transition-colors hover:bg-white/80"
          >
            {tag}
          </motion.span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="cursor-pointer rounded-2xl bg-white p-6"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[11px] text-[#4a4a4a]">
              <span className="text-[#E86100]">•</span> Experience
            </p>
            <BadgeIcon color="#111111" />
          </div>
          <p className="mt-12 text-4xl font-black tracking-tight text-[#111111]">
            <CountUp end={3} suffix="Y+" start={ready} />
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="cursor-pointer rounded-2xl bg-[#E86100] p-6"
        >
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[11px] text-white/80">
              <span className="text-white">•</span> Clients Satisfaction
            </p>
            <BadgeIcon color="#ffffff" />
          </div>
          <p className="mt-12 text-4xl font-black tracking-tight text-white">
            <CountUp end={98} suffix="%" start={ready} />
          </p>
        </motion.div>
      </div>
    </div>
  );
}
