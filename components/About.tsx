"use client";

import { motion } from "framer-motion";
import {
  FaRocket,
  FaUsers,
  FaBolt,
  FaShieldAlt,
} from "react-icons/fa";

import type { IconType } from "react-icons";
import { siteConfig } from "../config/siteConfig";

type Feature = {
  icon: IconType;
  title: string;
  text: string;
};

const features: Feature[] = [
  {
    icon: FaRocket,
    title: "Lightning Fast",
    text: "Built on Solana for ultra-fast transactions with minimal fees.",
  },
  {
    icon: FaUsers,
    title: "Community Driven",
    text: "Every holder helps shape the future of the RACCOONX ecosystem.",
  },
  {
    icon: FaBolt,
    title: "Meme Energy",
    text: "Cyberpunk aesthetics combined with serious viral potential.",
  },
  {
    icon: FaShieldAlt,
    title: "Secure",
    text: "Transparent tokenomics and a long-term vision for sustainable growth.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="section-shell relative overflow-hidden px-6 py-32 lg:py-40"
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          section-glow
          section-glow-purple
          left-[-180px]
          top-[20%]
        "
      />

      <div
        className="
          section-glow
          section-glow-green
          right-[-180px]
          bottom-[10%]
        "
      />

      <div className="section-container">

        {/* HEADER */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
          }}
        >
          <div className="text-center">

            <div className="section-label justify-center">
              THE ECOSYSTEM
            </div>

            <h2 className="section-title">
              <span className="gradient-text">
                Why RACCOONX?
              </span>
            </h2>

            <p className="section-description">
              RACCOONX isn't just another meme coin.
              It's a cyberpunk brand built for speed, community,
              and long-term growth inside the Solana ecosystem.
            </p>

          </div>
        </motion.div>

        {/* FEATURES */}

        <div className="mt-20 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -6,
                }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/[0.08]
                  bg-[#090C13]/70
                  p-8
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-purple-400/20
                  hover:bg-[#0c1018]/80
                  hover:shadow-[0_15px_50px_rgba(0,0,0,.25)]
                "
              >

                {/* TOP ACCENT */}

                <div
                  className="
                    absolute
                    left-8
                    right-8
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-purple-500/60
                    to-transparent
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                  "
                />

                {/* ICON */}

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-white/[0.035]
                    text-xl
                    text-purple-400
                    transition-all
                    duration-300
                    group-hover:border-purple-400/30
                    group-hover:bg-purple-400/[0.06]
                    group-hover:text-green-400
                  "
                >
                  <Icon />
                </div>

                {/* CONTENT */}

                <div className="mt-8">

                  <h3 className="text-2xl font-black tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-[15px] leading-7 text-white/45">
                    {feature.text}
                  </p>

                </div>

                {/* NUMBER */}

                <div
                  className="
                    absolute
                    bottom-6
                    right-7
                    select-none
                    font-['Orbitron']
                    text-5xl
                    font-black
                    text-white/[0.025]
                    transition-colors
                    duration-500
                    group-hover:text-purple-400/[0.06]
                  "
                >
                  0{index + 1}
                </div>

              </motion.article>
            );
          })}

        </div>

        {/* BOTTOM STAT BAR */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            delay: 0.2,
          }}
          className="
            mt-5
            grid
            overflow-hidden
            rounded-[28px]
            border
            border-white/[0.08]
            bg-[#090C13]/60
            backdrop-blur-xl
            sm:grid-cols-3
          "
        >

          <div className="px-8 py-7 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">
              Network
            </span>

            <p className="mt-2 font-['Orbitron'] text-xl font-bold text-white">
              {siteConfig.token.network}
            </p>
          </div>

          <div
            className="
              border-t
              border-white/[0.06]
              px-8
              py-7
              text-center
              sm:border-l
              sm:border-t-0
            "
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">
              Transaction Tax
            </span>

            <p className="mt-2 font-['Orbitron'] text-xl font-bold text-green-400">
              {siteConfig.token.tax}
            </p>
          </div>

          <div
            className="
              border-t
              border-white/[0.06]
              px-8
              py-7
              text-center
              sm:border-l
              sm:border-t-0
            "
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/35">
              Community
            </span>

            <p className="mt-2 font-['Orbitron'] text-xl font-bold text-white">
              Global
            </p>
          </div>

        </motion.div>

      </div>
    </section>
  );
}