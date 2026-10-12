"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const LandingReveal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      element.getBoundingClientRect().top < window.innerHeight
    )
      return;

    element.dataset.revealReady = "true";
    element.dataset.revealed = "false";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.revealed = "true";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -48px 0px", threshold: 0 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      element.dataset.revealed = "true";
    };
  }, []);

  return (
    <div ref={ref} className={cn("landing-reveal", className)}>
      {children}
    </div>
  );
};
