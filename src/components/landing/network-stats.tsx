"use client";

import * as React from "react";
import Image from "next/image";
import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { Reveal } from "@/components/motion/reveal";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
}

const CountUp = ({ value, suffix = "", prefix = "" }: CounterProps) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const reduce = useReducedMotion();
  const motionVal = useMotionValue(0);

  React.useEffect(() => {
    if (reduce) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString("vi-VN")}${suffix}`;
      }
      return;
    }

    if (isInView && ref.current) {
      const controls = animate(motionVal, value, {
        duration: 1.4,
        ease: EASE_OUT,
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString("vi-VN")}${suffix}`;
          }
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value, prefix, suffix, motionVal, reduce]);

  return (
    <span
      ref={ref}
      className="font-mono tabular-nums text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gold-300"
    >
      {reduce ? `${prefix}${value.toLocaleString("vi-VN")}${suffix}` : "0"}
    </span>
  );
};

export const NetworkStats = () => {
  const stats = [
    {
      value: 5000,
      suffix: "+",
      label: "Cựu Sinh Viên DLU",
      desc: "Trải dài trên khắp các tỉnh thành & quốc tế",
    },
    {
      value: 50,
      suffix: "+",
      label: "Doanh Nghiệp Đối Tác",
      desc: "Hợp tác tuyển dụng, đào tạo & thực tập",
    },
    {
      value: 500,
      suffix: "M+",
      prefix: "₫",
      label: "Quỹ Học Bổng Đồng Hành",
      desc: "Trao hàng năm cho sinh viên khó khăn",
    },
    {
      value: 98,
      suffix: "%",
      label: "Sinh Viên Có Việc Làm",
      desc: "Sau 6 tháng kể từ khi tốt nghiệp",
    },
  ];

  return (
    <section className="relative w-full py-16 sm:py-20 overflow-hidden text-white">
      {/* Background image: Dalat campus with bg-photo-tint */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80"
          alt="Trường Đại học Đà Lạt giảng đường và hội trường"
          fill
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-photo-tint" />
        <div className="absolute inset-0 bg-pine-950/40 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="fade" className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-lime-300">
            SỨC MẠNH MẠNG LƯỚI
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
            Những Con Số Khẳng Định Vị Thế DLU
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-sans">
            Kết tinh từ sự nỗ lực bền bỉ của Thầy trò và tinh thần tương thân tương ái của các thế hệ Cựu sinh viên Đại học Đà Lạt.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((item, idx) => (
            <Reveal
              key={item.label}
              index={idx}
              variant="up"
              className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-brand hover:border-pine-400/50 transition-all duration-300 group"
            >
              {/* Number */}
              <CountUp value={item.value} suffix={item.suffix} prefix={item.prefix} />

              {/* Short lime divider */}
              <div className="w-8 h-1 bg-lime-300 rounded-full my-3 group-hover:w-12 transition-all duration-300" />

              {/* Label */}
              <h3 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                {item.label}
              </h3>

              {/* Description */}
              <p className="text-[11px] sm:text-xs text-emerald-200/70 mt-1 line-clamp-2">
                {item.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
