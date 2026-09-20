"use client";

import { useEffect, useRef, useState } from "react";
import { languages, useLanguage, type Language } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((item) => item.code === language) ?? languages[0];

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-bold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
        aria-label="Language">
        <span>{current.flag}</span><span>{current.code.toUpperCase()}</span><span className="text-[10px] text-white/30">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-[80] w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#080a0f]/95 p-2 shadow-2xl backdrop-blur-2xl">
          {languages.map((item) => (
            <button key={item.code} type="button"
              onClick={() => { setLanguage(item.code as Language); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.06] ${language === item.code ? "bg-white/[0.06] text-white" : "text-white/55"}`}>
              <span className="text-lg">{item.flag}</span><span className="flex-1">{item.name}</span>
              <span className="text-[10px] uppercase text-white/25">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
