"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "cn";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  viewAllHref?: string;
  viewAllText?: string;
  className?: string;
}

export const SectionTitle = ({
  title,
  subtitle,
  icon: Icon,
  badge,
  viewAllHref,
  viewAllText = "Xem tất cả",
  className,
}: SectionTitleProps) => {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn(
        "relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-section-title border-l-4 border-pine-600 mb-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-pine-100 text-pine-700 shrink-0">
            <Icon className="size-5" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg sm:text-xl font-extrabold uppercase tracking-tight text-pine-800">
              {title}
            </h2>
            {badge && (
              <span className="rounded-full bg-star-500/10 text-star-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-sky-800 hover:text-sky-900 transition-colors self-end sm:self-center shrink-0"
        >
          <span className="group-hover:underline">{viewAllText}</span>
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};
