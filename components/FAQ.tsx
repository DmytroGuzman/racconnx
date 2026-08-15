"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus } from "react-icons/fa6";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is RACCOONX?",
    answer:
      "RACCOONX is a community-driven meme token built on the Solana network, combining cyberpunk aesthetics with a strong focus on community, growth and long-term development.",
  },
  {
    question: "What is the RACCOONX token?",
    answer:
      "RACCOONX, represented by the ticker RCX, is the native token of the ecosystem. The total supply is fixed at 1,000,000,000 RCX.",
  },
  {
    question: "Why is RACCOONX built on Solana?",
    answer:
      "Solana provides fast transactions and low network fees, making it a natural fit for a community-focused token designed for frequent interaction and broad accessibility.",
  },
  {
    question: "Where can I buy RCX?",
    answer:
      "Trading availability will be announced through the official RACCOONX channels as liquidity and exchange listings become available.",
  },
  {
    question: "Is there a transaction tax?",
    answer:
      "RACCOONX is designed with a 0% transaction tax. Always verify the official contract address through our verified channels before making a purchase.",
  },
  {
    question: "How can I become part of the community?",
    answer:
      "Follow the official RACCOONX social channels, join the community and participate in discussions, campaigns and future ecosystem initiatives.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) =>
      current === index ? null : index
    );
  };

  return (
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
            FAQ
          </div>

          <h2 className="section-title">
            <span className="gradient-text">
              Frequently Asked
            </span>
          </h2>

          <p className="section-description">
            Everything you need to know about RACCOONX,
            the token and the ecosystem.
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
                    {faq.question}
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
                          {faq.answer}
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
            Still have questions?
          </p>

          <a
            href="#"
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
            Join the community →
          </a>
        </motion.div>

      </div>
    </section>
  );
}