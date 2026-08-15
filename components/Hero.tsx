"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import StatsCard from "./StatsCard";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden px-5 py-32 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            {/* BADGE */}
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-purple-500/30 bg-white/5 px-4 py-2 text-xs text-gray-300 backdrop-blur-xl sm:px-5 sm:text-sm">
              🦝 Cyberpunk Meme Coin • Solana
            </span>

            {/* TITLE */}
           <h1 className="mt-8 w-full">
  <span
    className="
      block
      bg-gradient-to-r
      from-purple-500
      to-green-400
      bg-clip-text
      text-[clamp(2.8rem,7vw,6rem)]
      font-black
      leading-none
      tracking-[-0.05em]
      text-transparent
    "
  >
    RACCOONX
  </span>
</h1>

            {/* SLOGAN */}
            <p className="mt-6 text-2xl font-bold sm:text-3xl">
              Stealing Profits.
              <br />
              Not Trash.
            </p>

            {/* DESCRIPTION */}
            <p className="mt-8 max-w-xl text-base leading-7 text-gray-400 sm:text-lg sm:leading-8">
              The next generation Solana meme coin combining community, speed
              and cyberpunk aesthetics.
            </p>

            {/* BUTTONS */}
            <div className="mt-10 flex flex-wrap gap-4 sm:gap-5">
              <button
                type="button"
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-green-400 px-6 py-3.5 font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(153,69,255,.55)] sm:px-8 sm:py-4"
              >
                Buy RCX
              </button>

              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-bold backdrop-blur-xl transition hover:bg-white/10 sm:px-8 sm:py-4"
              >
                Whitepaper
              </button>
            </div>

            {/* STATS */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-6">
              <StatsCard
                value={<>1B</>}
                title="Supply"
              />

              <StatsCard
                value={<>0%</>}
                title="Tax"
              />

              <StatsCard
                value="SOL"
                title="Network"
              />

              <StatsCard
                value="$1"
                title="Goal"
              />
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex w-full items-center justify-center"
          >
            {/* GLOW */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute h-[280px] w-[280px] rounded-full bg-gradient-to-r from-purple-500/40 to-green-400/30 blur-[90px] sm:h-[420px] sm:w-[420px] sm:blur-[120px] lg:h-[520px] lg:w-[520px]"
            />

            {/* LOGO */}
            <motion.div
              animate={{
                y: [-12, 12, -12],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 flex w-full justify-center"
            >
              <Image
  src="/logo.png"
  alt="RaccoonX"
  width={650}
  height={650}
  priority
  className="
    h-auto
    w-[260px]
    max-w-full
    select-none
    drop-shadow-[0_0_70px_rgba(153,69,255,.45)]
    sm:w-[400px]
    lg:w-[650px]
  "
/>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

