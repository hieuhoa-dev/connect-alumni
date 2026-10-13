"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LiveSearchProps {
  initialValue?: string;
  label: string;
  placeholder?: string;
  className?: string;
}

export const LiveSearch = ({
  initialValue = "",
  label,
  placeholder = "Nhập từ khóa để tìm kiếm...",
  className,
}: LiveSearchProps) => {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composing = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const requested = useRef(initialValue);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // URL changes (category, pagination, back/forward) update the input once
  // active typing and navigation have finished, preserving focus and newer text.
  useEffect(() => {
    if (!timer.current && !isPending && !composing.current)
      setValue(initialValue);
  }, [initialValue, isPending]);

  const search = (text: string, immediately = false) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        timer.current = null;
        const url = new URL(window.location.href);
        const keyword = text.trim();
        if (
          (url.searchParams.get("search") ?? "") === keyword &&
          requested.current === keyword
        )
          return;
        requested.current = keyword;
        if (keyword) url.searchParams.set("search", keyword);
        else url.searchParams.delete("search");
        url.searchParams.delete("page");
        startTransition(() =>
          router.replace(`${url.pathname}${url.search}`, { scroll: false }),
        );
      },
      immediately || !text.trim() ? 0 : 350,
    );
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <InputGroup>
        <InputGroupInput
          ref={input}
          type="search"
          className="[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          name="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          maxLength={160}
          autoComplete="off"
          onChange={(event) => {
            setValue(event.target.value);
            if (!composing.current) search(event.target.value);
          }}
          onCompositionStart={() => {
            composing.current = true;
            if (timer.current) clearTimeout(timer.current);
            timer.current = null;
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            search(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !composing.current) {
              event.preventDefault();
              search(value, true);
            }
          }}
        />
        <InputGroupAddon>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          {isPending && <Spinner aria-label="Đang tìm kiếm" />}
          {value && (
            <InputGroupButton
              size="icon-xs"
              aria-label="Xóa từ khóa"
              onClick={() => {
                setValue("");
                search("", true);
                input.current?.focus();
              }}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 6 12 12M6 18 18 6" />
              </svg>
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
      <output
        aria-live="polite"
        aria-atomic="true"
        aria-busy={isPending || value.trim() !== initialValue.trim()}
        data-slot="live-search-results"
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          !value.trim() && "sr-only",
        )}
      >
        {value.trim() && (
          <>
            Kết quả cho “
            <span className="font-medium text-foreground">{value.trim()}</span>”
            {(isPending || value.trim() !== initialValue.trim()) && (
              <span className="sr-only"> Đang cập nhật kết quả.</span>
            )}
          </>
        )}
      </output>
    </div>
  );
};
