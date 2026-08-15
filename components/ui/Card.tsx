"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className={`
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/[0.08]
        bg-[#090C13]/75
        backdrop-blur-xl
        transition-colors
        duration-300
        hover:border-white/[0.14]
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}