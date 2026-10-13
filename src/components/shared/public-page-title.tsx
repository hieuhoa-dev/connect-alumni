import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const PublicPageTitle = ({
  children,
  className,
  ...props
}: ComponentProps<"h1">) => (
  <h1
    className={cn(
      "font-heading text-3xl font-semibold leading-tight tracking-tight text-foreground after:mt-4 after:block after:h-0.5 after:w-16 after:bg-primary sm:text-4xl",
      className,
    )}
    {...props}
  >
    {children}
  </h1>
);
