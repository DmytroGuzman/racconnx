"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaXTwitter,
  FaTelegram,
  FaXmark,
} from "react-icons/fa6";

import { T } from "./i18n/LanguageProvider";
import { siteConfig } from "../config/siteConfig";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is RaccoonX?",
    answer:
      "RaccoonX is a community-driven meme token built on the Solana network, combining cyberpunk aesthetics with a strong focus on community, growth and long-term development.",
  },
  {
    question: "What is the RaccoonX token?",
    answer:
      "RaccoonX, represented by the ticker RCX, is the native token of the ecosystem. The total supply is fixed at 1,000,000,000 RCX.",
  },
  {
    question: "Why is RaccoonX built on Solana?",
    answer:
      "Solana provides fast transactions and low network fees, making it a natural fit for a community-focused token designed for frequent interaction and broad accessibility.",
  },
  {
    question: "Where can I buy RCX?",
    answer:
      "Trading availability will be announced through the official RaccoonX channels as liquidity and exchange listings become available.",
  },
  {
    question: "Is there a transaction tax?",
    answer:
      "RaccoonX is designed with a 0% transaction tax. Always verify the official contract address through our verified channels before making a purchase.",
  },
  {
    question: "How can I become part of the community?",
    answer:
      "Follow the official RaccoonX social channels, join the community and participate in discussions, campaigns and future ecosystem initiatives.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [communityOpen, setCommunityOpen] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
    <>
      <section
        id="faq"
        className="relative overflow-hidden px-6 py-32 lg:py-40"
      >
        <div className="mx-auto max-w-4xl">

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
              <T>FAQ</T>
            </div>

            <h2 className="section-title">
              <span className="gradient-text">
                <T>Frequently Asked</T>
              </span>
            </h2>

            <p className="section-description">
              <T>
                Everything you need to know about RaccoonX, the token and the ecosystem.
              </T>
            </p>
          </motion.div>

          {/* FAQ LIST */}

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
              amount: 0.15,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="mt-16 space-y-3"
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/[0.08]
                    bg-[#090C13]/70
                    backdrop-blur-xl
                    transition-colors
                    duration-300
                    hover:border-white/[0.14]
                  "
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-6
                      px-6
                      py-6
                      text-left
                      md:px-7
                    "
                  >
                    <span
                      className={`
                        text-base
                        font-bold
                        transition-colors
                        duration-300
                        md:text-lg
                        ${
                          isOpen
                            ? "text-white"
                            : "text-white/70"
                        }
                      `}
                    >
                      <T>{faq.question}</T>
                    </span>

                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/[0.08]
                        bg-white/[0.03]
                        text-xs
                        text-white/40
                        transition-all
                        duration-300
                        ${
                          isOpen
                            ? "rotate-45 border-purple-400/30 text-purple-400"
                            : ""
                        }
                      `}
                    >
                      <FaPlus />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                      >
                        <div className="border-t border-white/[0.06] px-6 pb-6 pt-5 md:px-7">
                          <p className="max-w-3xl text-sm leading-7 text-white/40 md:text-base">
                            <T>{faq.answer}</T>
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>

          {/* BOTTOM */}

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
            className="mt-10 text-center"
          >
            <p className="text-sm text-white/25">
              <T>Still have questions?</T>
            </p>

            <button
              type="button"
              onClick={() => setCommunityOpen(true)}
              className="
                mt-2
                inline-flex
                text-sm
                font-semibold
                text-purple-400
                transition-colors
                duration-300
                hover:text-green-400
              "
            >
              <T>Join the community →</T>
            </button>
          </motion.div>
        </div>
      </section>

      {/* COMMUNITY MODAL */}

      <AnimatePresence>
        {communityOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommunityOpen(false)}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/75
              px-5
              backdrop-blur-md
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) => event.stopPropagation()}
              className="
                relative
                w-full
                max-w-md
                overflow-hidden
                rounded-3xl
                border
                border-purple-400/20
                bg-[#09090d]
                p-7
                shadow-2xl
                shadow-purple-500/10
              "
            >
              {/* BACKGROUND GLOWS */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -left-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  bg-purple-500/10
                  blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -right-20
                  h-48
                  w-48
                  rounded-full
                  bg-green-400/10
                  blur-3xl
                "
              />

              {/* CLOSE */}

              <button
                type="button"
                onClick={() => setCommunityOpen(false)}
                aria-label="Close"
                className="
                  absolute
                  right-5
                  top-5
                  z-10
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-white/[0.03]
                  text-white/40
                  transition
                  hover:bg-white/[0.07]
                  hover:text-white
                "
              >
                <FaXmark />
              </button>

              <div className="relative">
                <p
                  className="
                    font-['Orbitron']
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.25em]
                    text-purple-400
                  "
                >
                  RaccoonX
                </p>

                <h3
                  className="
                    mt-3
                    pr-10
                    font-['Orbitron']
                    text-2xl
                    font-black
                    text-white
                  "
                >
                  Join the community
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  Choose your platform and join the official RaccoonX community.
                </p>

                {/* SOCIAL OPTIONS */}

                <div className="mt-7 space-y-3">

                  {/* X */}

                  <a
                    href={siteConfig.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      p-4
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-purple-400/30
                      hover:bg-purple-400/[0.06]
                    "
                  >
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/[0.05]
                        text-lg
                        text-white
                      "
                    >
                      <FaXTwitter />
                    </span>

                    <div>
                      <p className="font-semibold text-white">
                        X / Twitter
                      </p>

                      <p className="mt-0.5 text-xs text-white/30">
                        @RaccoonX_SOL
                      </p>
                    </div>

                    <span className="ml-auto text-white/20 transition group-hover:text-purple-400">
                      →
                    </span>
                  </a>

                  {/* TELEGRAM */}

                  <a
                    href={siteConfig.links.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      group
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-white/[0.025]
                      p-4
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-green-400/30
                      hover:bg-green-400/[0.06]
                    "
                  >
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/[0.05]
                        text-lg
                        text-white
                      "
                    >
                      <FaTelegram />
                    </span>

                    <div>
                      <p className="font-semibold text-white">
                        Telegram
                      </p>

                      <p className="mt-0.5 text-xs text-white/30">
                        @raccoonx_rcx
                      </p>
                    </div>

                    <span className="ml-auto text-white/20 transition group-hover:text-green-400">
                      →
                    </span>
                  </a>
                </div>

                <p className="mt-6 text-center text-[11px] text-white/20">
                  Official RaccoonX channels
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}