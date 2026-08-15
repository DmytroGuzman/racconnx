"use client";

import { motion } from "framer-motion";

export default function SectionDivider() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scaleX: 0,
      }}
      whileInView={{
        opacity: 1,
        scaleX: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 1,
      }}
      className="max-w-7xl mx-auto px-6"
    >
      <div className="relative h-px w-full bg-white/5">

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            top-1/2
            -translate-y-1/2
            h-px
            w-64
            bg-gradient-to-r
            from-transparent
            via-purple-500
            to-transparent
          "
        />

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            top-1/2
            -translate-y-1/2
            h-3
            w-3
            rounded-full
            bg-green-400
            shadow-[0_0_20px_#14F195]
          "
        />

      </div>
    </motion.div>
  );
}