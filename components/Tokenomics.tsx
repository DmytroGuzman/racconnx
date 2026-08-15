"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaCoins,
  FaChartPie,
  FaLock,
  FaCopy,
  FaCheck,
} from "react-icons/fa6";

import { siteConfig } from "../config/siteConfig";

const allocations = [
  {
    label: "Liquidity",
    value: "40%",
    amount: "400M RCX",
    description:
      "Deep liquidity designed to provide a stable trading environment.",
    icon: FaChartPie,
  },
  {
    label: "Community",
    value: "30%",
    amount: "300M RCX",
    description:
      "Reserved for community growth, rewards and ecosystem incentives.",
    icon: FaCoins,
  },
  {
    label: "Marketing",
    value: "15%",
    amount: "150M RCX",
    description:
      "Used to expand the RACCOONX brand and reach new communities.",
    icon: FaChartPie,
  },
  {
    label: "Team",
    value: "10%",
    amount: "100M RCX",
    description:
      "Long-term allocation with a focus on sustainable development.",
    icon: FaLock,
  },
  {
    label: "CEX / Partnerships",
    value: "5%",
    amount: "50M RCX",
    description:
      "Reserved for future listings and strategic partnerships.",
    icon: FaCoins,
  },
];

export default function Tokenomics() {
  const [copied, setCopied] = useState(false);

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(
        siteConfig.token.contract
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy contract:", error);
    }
  };

  return (
    <section
      id="tokenomics"
      className="relative overflow-hidden px-6 py-32"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

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
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-purple-400">
            Token Economics
          </p>

          <h2 className="text-5xl font-black tracking-tight text-white md:text-6xl">
            Tokenomics
          </h2>

          <p className="mt-6 text-lg leading-8 text-white/40">
            A simple and transparent distribution designed to
            support the long-term RACCOONX ecosystem.
          </p>
        </motion.div>

        {/* TOKEN INFO */}

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
          }}
          transition={{
            duration: 0.6,
            delay: 0.1,
          }}
          className="
            mt-20
            grid
            gap-4
            md:grid-cols-2
            lg:grid-cols-4
          "
        >

          {/* TOTAL SUPPLY */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-7
            "
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              Total Supply
            </p>

            <p className="mt-3 font-['Orbitron'] text-2xl font-black text-white">
              {siteConfig.token.totalSupply}
            </p>

            <p className="mt-2 text-sm text-white/30">
              {siteConfig.symbol}
            </p>
          </div>

          {/* NETWORK */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-7
            "
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              Network
            </p>

            <p className="mt-3 font-['Orbitron'] text-2xl font-black text-purple-400">
              {siteConfig.token.network.toUpperCase()}
            </p>

            <p className="mt-2 text-sm text-white/30">
              Fast & low-cost transactions
            </p>
          </div>

          {/* TAX */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-7
            "
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              Tax
            </p>

            <p className="mt-3 font-['Orbitron'] text-2xl font-black text-green-400">
              {siteConfig.token.tax}
            </p>

            <p className="mt-2 text-sm text-white/30">
              No buy or sell tax
            </p>
          </div>

          {/* TOKEN */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-7
            "
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              Token
            </p>

            <p className="mt-3 font-['Orbitron'] text-2xl font-black text-white">
              {siteConfig.symbol}
            </p>

            <p className="mt-2 text-sm text-white/30">
              {siteConfig.name}
            </p>
          </div>

        </motion.div>

        {/* CONTRACT */}

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
          }}
          transition={{
            duration: 0.6,
            delay: 0.15,
          }}
          className="
            mt-6
            rounded-2xl
            border
            border-white/[0.07]
            bg-white/[0.025]
            p-6
            md:p-7
          "
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                Contract Address
              </p>

              <p className="mt-2 text-xs text-white/30 md:text-sm">
                Official {siteConfig.symbol} token contract on{" "}
                {siteConfig.token.network}.
              </p>
            </div>

            <button
              type="button"
              onClick={copyContract}
              className="
                flex
                items-center
                justify-center
                gap-3
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.03]
                px-5
                py-3
                text-sm
                font-bold
                text-white/60
                transition-all
                duration-300
                hover:border-purple-400/30
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              {copied ? (
                <>
                  <FaCheck className="text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <FaCopy />
                  Copy Contract
                </>
              )}
            </button>

          </div>

          <div
            className="
              mt-5
              overflow-hidden
              rounded-xl
              border
              border-white/[0.06]
              bg-black/30
              px-4
              py-4
            "
          >
            <code className="block overflow-x-auto whitespace-nowrap text-xs text-white/40 md:text-sm">
              {siteConfig.token.contract}
            </code>
          </div>
        </motion.div>

        {/* DISTRIBUTION */}

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
          }}
          transition={{
            duration: 0.6,
            delay: 0.2,
          }}
          className="mt-20"
        >

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/25">
                Distribution
              </p>

              <h3 className="mt-2 text-3xl font-black text-white">
                Where the supply goes
              </h3>
            </div>

            <span className="hidden text-sm text-white/25 md:block">
              100% allocated
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {allocations.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
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
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="
                    group
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    p-7
                    transition-all
                    duration-300
                    hover:border-white/[0.12]
                    hover:bg-white/[0.035]
                  "
                >

                  <div className="flex items-start justify-between">

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-white/[0.07]
                        bg-white/[0.03]
                        text-purple-400
                        transition-colors
                        duration-300
                        group-hover:text-green-400
                      "
                    >
                      <Icon />
                    </div>

                    <span className="font-['Orbitron'] text-2xl font-black text-white">
                      {item.value}
                    </span>

                  </div>

                  <h4 className="mt-7 text-xl font-black text-white">
                    {item.label}
                  </h4>

                  <p className="mt-2 font-['Orbitron'] text-xs font-bold tracking-[0.12em] text-purple-400">
                    {item.amount}
                  </p>

                  <p className="mt-4 text-sm leading-7 text-white/35">
                    {item.description}
                  </p>

                  <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: item.value,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.2 + index * 0.08,
                        ease: "easeOut",
                      }}
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-purple-500
                        to-green-400
                      "
                    />
                  </div>

                </motion.div>
              );
            })}

          </div>
        </motion.div>

      </div>
    </section>
  );
}