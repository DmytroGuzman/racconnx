"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  title: string;
  value: ReactNode;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        p-6
        text-center
      "
    >
      <div
        className="
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-500
          bg-gradient-to-br
          from-purple-500/10
          via-transparent
          to-green-400/10
        "
      />

      <div className="relative z-10">

        <div className="text-4xl font-black gradient-text">
          {value}
        </div>

        <div className="mt-3 text-sm uppercase tracking-[0.2em] text-gray-400">
          {title}
        </div>

      </div>
    </motion.div>
  );
}