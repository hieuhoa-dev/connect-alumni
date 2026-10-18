"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const Tabs = ({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) => {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
};

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-xl p-1 text-muted-foreground group-data-horizontal/tabs:h-10 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default:
          "bg-pine-100/80 dark:bg-pine-900/60 border border-pine-200/80 dark:border-pine-800 text-pine-800/80 shadow-xs",
        line: "gap-2 bg-transparent border-b border-border rounded-none p-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const TabsList = ({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) => {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
};

const TabsTrigger = ({ className, ...props }: TabsPrimitive.Tab.Props) => {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Inactive tab styling
        "text-pine-800/70 hover:text-pine-950 hover:bg-white/50 dark:text-pine-200/70 dark:hover:text-white",
        // Active tab styling (Default): Solid DLU Pine green, crisp white text, bold, elevated with brand shadow
        "group-data-[variant=default]/tabs-list:data-active:bg-primary group-data-[variant=default]/tabs-list:data-active:text-primary-foreground group-data-[variant=default]/tabs-list:data-active:font-bold group-data-[variant=default]/tabs-list:data-active:shadow-brand",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-primary group-data-[variant=default]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=default]/tabs-list:data-[state=active]:font-bold group-data-[variant=default]/tabs-list:data-[state=active]:shadow-brand",
        // Active tab styling (Line variant): Underline with Sun-500 orange accent and Pine text
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:pb-2.5",
        "group-data-[variant=line]/tabs-list:data-active:border-sun-500 group-data-[variant=line]/tabs-list:data-active:text-primary group-data-[variant=line]/tabs-list:data-active:font-bold",
        "group-data-[variant=line]/tabs-list:data-[state=active]:border-sun-500 group-data-[variant=line]/tabs-list:data-[state=active]:text-primary group-data-[variant=line]/tabs-list:data-[state=active]:font-bold",
        className,
      )}
      {...props}
    />
  );
};

const TabsContent = ({ className, ...props }: TabsPrimitive.Panel.Props) => {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none mt-2", className)}
      {...props}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
