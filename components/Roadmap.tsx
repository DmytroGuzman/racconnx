"use client";

import { motion } from "framer-motion";
import {
  FaRocket,
  FaChartLine,
  FaGlobe,
  FaLayerGroup,
} from "react-icons/fa";

import type { IconType } from "react-icons";

type RoadmapPhase = {
  phase: string;
  title: string;
  description: string;
  items: string[];
  icon: IconType;
  color: string;
};

const phases: RoadmapPhase[] = [
  {
    phase: "PHASE 01",
    title: "Launch",
    description:
      "Establish the RACCOONX foundation and bring the first members into the ecosystem.",
    items: [
      "Website launch",
      "Social media launch",
      "Token creation",
      "Community building",
    ],
    icon: FaRocket,
    color: "#9945FF",
  },
  {
    phase: "PHASE 02",
    title: "Growth",
    description:
      "Expand visibility, increase community activity and establish RACCOONX across major platforms.",
    items: [
      "DEX listing",
      "Marketing campaign",
      "5,000 holders",
      "CoinGecko listing",
    ],
    icon: FaChartLine,
    color: "#14F195",
  },
  {
    phase: "PHASE 03",
    title: "Expansion",
    description:
      "Move beyond the initial launch and build strategic relationships around the ecosystem.",
    items: [
      "CEX applications",
      "NFT collection",
      "Strategic partnerships",
      "25,000 holders",
    ],
    icon: FaGlobe,
    color: "#5D9CFF",
  },
  {
    phase: "PHASE 04",
    title: "Ecosystem",
    description:
      "Introduce additional utilities and community-driven mechanisms for the next stage of RACCOONX.",
    items: [
      "Staking",
      "DAO governance",
      "Utility expansion",
      "Global marketing",
    ],
    icon: FaLayerGroup,
    color: "#FFB547",
  },
];

export default function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative overflow-hidden px-6 py-32 lg:py-40"
    >
      <div className="mx-auto max-w-6xl">

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
            ROADMAP
          </div>

          <h2 className="section-title">
            <span className="gradient-text">
              The Journey
            </span>
          </h2>

          <p className="section-description">
            A long-term roadmap focused on building a strong community,
            expanding the ecosystem and creating sustainable growth.
          </p>
        </motion.div>

        {/* ROADMAP */}

        <div className="relative mt-24">

          {/* CENTRAL LINE */}

          <div
            className="
              absolute
              bottom-0
              left-5
              top-0
              w-px
              bg-gradient-to-b
              from-purple-500/0
              via-white/10
              to-green-400/0
              lg:left-1/2
            "
          />

          <div className="space-y-12 lg:space-y-0">

            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={phase.phase}
                  initial={{
                    opacity: 0,
                    y: 50,
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
                    duration: 0.65,
                    delay: index * 0.08,
                  }}
                  className="
                    relative
                    lg:grid
                    lg:min-h-[340px]
                    lg:grid-cols-2
                    lg:gap-20
                  "
                >

                  {/* CONTENT */}

                  <div
                    className={`
                      ml-14
                      lg:ml-0
                      ${
                        isLeft
                          ? "lg:pr-12"
                          : "lg:col-start-2 lg:pl-12"
                      }
                    `}
                  >
                    <div
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
                        hover:-translate-y-1
                        hover:border-white/[0.14]
                      "
                    >

                      {/* TOP ACCENT */}

                      <div
                        className="absolute left-8 right-8 top-0 h-px opacity-60"
                        style={{
                          backgroundColor: phase.color,
                        }}
                      />

                      {/* HEADER */}

                      <div className="flex items-start justify-between gap-6">

                        <div>

                          <span
                            className="
                              text-xs
                              font-bold
                              uppercase
                              tracking-[0.3em]
                            "
                            style={{
                              color: phase.color,
                            }}
                          >
                            {phase.phase}
                          </span>

                          <h3 className="mt-2 text-3xl font-black">
                            {phase.title}
                          </h3>

                        </div>

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-white/[0.08]
                            bg-white/[0.035]
                            text-lg
                          "
                          style={{
                            color: phase.color,
                          }}
                        >
                          <Icon />
                        </div>

                      </div>

                      {/* DESCRIPTION */}

                      <p className="mt-6 text-sm leading-7 text-white/40">
                        {phase.description}
                      </p>

                      {/* ITEMS */}

                      <div className="mt-7 grid gap-3 sm:grid-cols-2">

                        {phase.items.map((item) => (
                          <div
                            key={item}
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              border
                              border-white/[0.05]
                              bg-white/[0.02]
                              px-4
                              py-3
                              text-sm
                              text-white/55
                            "
                          >
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: phase.color,
                              }}
                            />

                            {item}
                          </div>
                        ))}

                      </div>

                    </div>
                  </div>

                  {/* CENTER NODE */}

                  <div
                    className="
                      absolute
                      left-[8px]
                      top-10
                      z-10
                      flex
                      h-6
                      w-6
                      items-center
                      justify-center
                      rounded-full
                      border-[5px]
                      border-[#05050a]
                      lg:left-1/2
                      lg:top-10
                      lg:-translate-x-1/2
                    "
                    style={{
                      backgroundColor: phase.color,
                      boxShadow: `0 0 16px ${phase.color}55`,
                    }}
                  />

                </motion.div>
              );
            })}

          </div>

        </div>

        {/* BOTTOM NOTE */}

        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="
            mt-12
            text-center
            text-sm
            text-white/30
          "
        >
          <span>
            Roadmap milestones may evolve as the RACCOONX community grows.
          </span>
        </motion.div>

      </div>
    </section>
  );
}