"use client";

import { motion } from "framer-motion";
import {
  FaFileLines,
  FaArrowRight,
  FaDownload,
} from "react-icons/fa6";
import { siteConfig } from "../config/siteConfig";

export default function Whitepaper() {
  return (
    <section
      id="whitepaper"
      className="relative overflow-hidden px-6 py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">

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
          className="text-center"
        >
          <div className="section-label justify-center">
            WHITEPAPER
          </div>

          <h2 className="section-title">
            <span className="gradient-text">
              The Vision Behind RACCOONX
            </span>
          </h2>

          <p className="section-description">
            Learn more about the idea, tokenomics, roadmap and long-term
            direction of the RACCOONX ecosystem.
          </p>
        </motion.div>

        {/* WHITEPAPER CARD */}

        <motion.div
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
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="
            relative
            mt-20
            overflow-hidden
            rounded-[32px]
            border
            border-white/[0.08]
            bg-[#090C13]/70
            backdrop-blur-xl
          "
        >

          {/* DECORATIVE GRID */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.035]
            "
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(255,255,255,0.5) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative grid lg:grid-cols-[1.2fr_0.8fr]">

            {/* LEFT */}

            <div className="p-8 md:p-12 lg:p-16">

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-purple-400/20
                  bg-purple-500/[0.06]
                  text-2xl
                  text-purple-400
                "
              >
                <FaFileLines />
              </div>

              <h3 className="mt-8 max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
                Everything you need to know about RACCOONX.
              </h3>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/40">
                Our whitepaper explains the foundation of the project,
                token distribution, roadmap, community strategy and
                the future direction of the RACCOONX ecosystem.
              </p>

              {/* BUTTONS */}

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <a
                  href={siteConfig.links.whitepaper}
  download
                  className="
                    group
                    inline-flex
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-black
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-gray-100
                  "
                >
                  <FaDownload />

                  Download Whitepaper

                  <FaArrowRight
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </a>

                <a
                  href="#roadmap"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-white/[0.1]
                    bg-white/[0.03]
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-white/70
                    transition-all
                    duration-300
                    hover:border-white/[0.18]
                    hover:bg-white/[0.06]
                    hover:text-white
                  "
                >
                  Explore Roadmap
                </a>

              </div>

            </div>

            {/* RIGHT */}

            <div
              className="
                relative
                flex
                min-h-[360px]
                items-center
                justify-center
                border-t
                border-white/[0.06]
                p-8
                lg:border-l
                lg:border-t-0
              "
            >

              {/* DOCUMENT */}

              <motion.div
                initial={{
                  opacity: 0,
                  rotate: -5,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  rotate: -2,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.25,
                }}
                whileHover={{
                  rotate: 0,
                  y: -5,
                }}
                className="
                  relative
                  w-full
                  max-w-[280px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.1]
                  bg-[#0D111B]
                  p-7
                  shadow-2xl
                "
              >

                {/* DOCUMENT HEADER */}

                <div className="flex items-center justify-between">

                  <span className="font-['Orbitron'] text-xs font-bold tracking-wider text-purple-400">
                    RCX
                  </span>

                  <span className="text-[10px] text-white/25">
                    2026
                  </span>

                </div>

                {/* DOCUMENT TITLE */}

                <div className="mt-10">

                  <div className="h-2 w-24 rounded-full bg-white/10" />

                  <div className="mt-3 h-2 w-36 rounded-full bg-white/[0.06]" />

                  <div className="mt-8 space-y-2">

                    <div className="h-1.5 w-full rounded-full bg-white/[0.05]" />
                    <div className="h-1.5 w-[90%] rounded-full bg-white/[0.05]" />
                    <div className="h-1.5 w-[75%] rounded-full bg-white/[0.05]" />
                    <div className="h-1.5 w-[85%] rounded-full bg-white/[0.05]" />

                  </div>

                </div>

                {/* DOCUMENT FOOTER */}

                <div className="mt-10 flex items-end justify-between">

                  <div>
                    <div className="h-1.5 w-16 rounded-full bg-purple-400/40" />
                    <div className="mt-2 h-1 w-10 rounded-full bg-white/[0.08]" />
                  </div>

                  <span className="font-['Orbitron'] text-2xl font-black text-white/[0.08]">
                    01
                  </span>

                </div>

              </motion.div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}