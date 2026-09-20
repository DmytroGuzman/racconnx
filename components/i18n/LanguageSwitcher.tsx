"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  languages,
  useLanguage,
  type Language,
} from "./LanguageProvider";

const flags: Record<Language, string> = {
  en: "/flags/gb.svg",
  uk: "/flags/ua.svg",
  de: "/flags/de.svg",
  fr: "/flags/fr.svg",
  es: "/flags/es.svg",
  it: "/flags/it.svg",
  pl: "/flags/pl.svg",
  pt: "/flags/pt.svg",
  nl: "/flags/nl.svg",
  cs: "/flags/cz.svg",
};

function Flag({ code }: { code: Language }) {
  return (
    <span className="relative h-[18px] w-7 shrink-0 overflow-hidden rounded-[4px] border border-white/10">
      <Image
        src={flags[code]}
        alt=""
        fill
        sizes="28px"
        className="object-cover"
      />
    </span>
  );
}

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    languages.find((item) => item.code === language) ?? languages[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Select language"
        aria-expanded={open}
        className="
          flex h-11 items-center gap-2.5
          rounded-xl border border-white/10
          bg-white/[0.03] px-3
          text-sm font-bold text-white/70
          transition
          hover:border-white/20
          hover:bg-white/[0.07]
          hover:text-white
        "
      >
        <Flag code={current.code as Language} />

        <span>{current.code.toUpperCase()}</span>

        <span
          className={`
            ml-0.5 text-[9px] text-white/30
            transition-transform duration-200
            ${open ? "rotate-180" : ""}
          `}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-14 z-[100]
            w-64
            rounded-2xl
            border border-white/10
            bg-[#080a0f]/95
            p-2
            shadow-2xl
            backdrop-blur-2xl
          "
        >
          {languages.map((item) => {
            const active = language === item.code;

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code as Language);
                  setOpen(false);
                }}
                className={`
                  flex w-full items-center gap-3
                  rounded-xl
                  px-3 py-2
                  text-left text-sm
                  transition
                  ${
                    active
                      ? "bg-white/[0.07] text-white"
                      : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                  }
                `}
              >
                <Flag code={item.code as Language} />

                <span className="flex-1">
                  {item.name}
                </span>

                {active && (
                  <span className="text-sm font-black text-green-400">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}