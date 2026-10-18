"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

type RevealProps = {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  variant?: "up" | "fade" | "scale" | "left" | "right";
  className?: string;
};

const from = {
  up: { opacity: 0, y: 24 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.96 },
  left: { opacity: 0, x: -32 },
  right: { opacity: 0, x: 32 },
} as const;

export const Reveal = ({
  children,
  index = 0,
  delay,
  variant = "up",
  className,
}: RevealProps) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={from[variant]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        ease: EASE_OUT,
        delay: delay !== undefined ? delay : Math.min(index, 8) * 0.07,
      }}
    >
      {children}
    </motion.div>
  );
};
