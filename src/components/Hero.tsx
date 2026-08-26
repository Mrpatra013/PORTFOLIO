import { motion } from "framer-motion";
import CTAButton from "./CTAButton";
import LiquidReveal from "./LiquidReveal";
import SkillsStats from "./SkillsStats";
import { useIntroReady } from "../lib/introReady";

export default function Hero() {
  const { ready } = useIntroReady();

  return (
    <section className="relative h-full w-full overflow-hidden bg-black">
      <LiquidReveal />
      <motion.a
        // "#top" rather than "/": the delegated smooth-scroll handler in
        // useSmoothAnchors turns this into a glide back to the hero instead of
        // a full page reload (which would replay the intro loader).
        href="#top"
        aria-label="Back to top"
        initial={{ opacity: 0, y: -16 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-5 top-4 z-20 flex items-center gap-1 transition-transform hover:scale-105 md:left-10 md:top-[27px]"
      >
        <img src="/hero/logo.png" alt="Logo" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
        <span className="text-2xl font-bold text-white sm:text-3xl">
          TheDesk<span className="text-[#E86100]">.</span>
        </span>
      </motion.a>
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-between gap-8 px-5 md:px-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-black uppercase leading-[0.85] tracking-tight text-white text-[15vw] sm:text-[11vw] lg:text-[7.5vw]"
          >
            <span className="block">We</span>
            <span className="block">Don't</span>
            <span className="block">Do</span>
            <span className="block text-[#E86100]">Average.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mt-8"
          >
            <CTAButton />
          </motion.div>
        </div>
        <motion.div
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
          className="pointer-events-auto hidden xl:block"
        >
          <SkillsStats />
        </motion.div>
      </div>
    </section>
  );
}
