"use client";

import { motion } from "framer-motion";
import {
  FaXTwitter,
  FaTelegram,
  FaDiscord,
} from "react-icons/fa6";

import { siteConfig } from "../config/siteConfig";

const socials = [
  {
    label: "Twitter / X",
    icon: FaXTwitter,
    href: siteConfig.links.twitter,
  },
  {
    label: "Telegram",
    icon: FaTelegram,
    href: siteConfig.links.telegram,
  },
  {
    label: "Discord",
    icon: FaDiscord,
    href: siteConfig.links.discord,
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-24">

        <div className="grid gap-14 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">

          {/* BRAND */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
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
          >
            <a
              href="#"
              className="
                inline-block
                font-['Orbitron']
                text-2xl
                font-black
                tracking-[0.08em]
              "
            >
              <span className="text-white">
                RACCOON
              </span>

              <span className="text-purple-400">
                X
              </span>
            </a>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/35">
              A cyberpunk community-driven token built on Solana.
              Fast, transparent and designed for the long-term.
            </p>

            {/* SOCIALS */}

            <div className="mt-7 flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      text-white/40
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-white/[0.16]
                      hover:bg-white/[0.05]
                      hover:text-white
                    "
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* NAVIGATION */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
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
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">
              Navigation
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              {siteConfig.navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="
                    w-fit
                    text-sm
                    text-white/45
                    transition-colors
                    duration-300
                    hover:text-white
                  "
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* ECOSYSTEM */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
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
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/30">
              Ecosystem
            </h3>

            <div className="mt-6 space-y-5">

              <div>
                <span className="text-xs text-white/25">
                  Network
                </span>

                <p className="mt-1 font-['Orbitron'] text-sm font-bold text-white">
                  {siteConfig.token.network.toUpperCase()}
                </p>
              </div>

              <div>
                <span className="text-xs text-white/25">
                  Token
                </span>

                <p className="mt-1 font-['Orbitron'] text-sm font-bold text-purple-400">
                  {siteConfig.symbol}
                </p>
              </div>

              <div>
                <span className="text-xs text-white/25">
                  Tax
                </span>

                <p className="mt-1 font-['Orbitron'] text-sm font-bold text-green-400">
                  {siteConfig.token.tax}
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* BOTTOM */}

      <div className="border-t border-white/[0.06]">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-3
            px-6
            py-6
            text-xs
            text-white/25
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            © {new Date().getFullYear()} {siteConfig.name}.
            All rights reserved.
          </p>

          <p>
            Built on {siteConfig.token.network}.
          </p>
        </div>
      </div>

    </footer>
  );
}