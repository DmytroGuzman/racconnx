"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaXmark } from "react-icons/fa6";
import { siteConfig } from "../config/siteConfig";
import LanguageSwitcher from "./i18n/LanguageSwitcher";
import {
  languages,
  useLanguage,
  type Language,
} from "./i18n/LanguageProvider";
import { T } from "./i18n/LanguageProvider";

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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const scrollToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (!href.startsWith("#")) {
      return;
    }

    event.preventDefault();

    if (href === "#") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setMenuOpen(false);
      return;
    }

    const element = document.querySelector(href);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setMenuOpen(false);
  };

  const selectMobileLanguage = (code: Language) => {
    setLanguage(code);
  };

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="
        fixed left-0 top-0 z-50
        w-full px-4 py-4
        md:px-6 md:py-5
      "
    >
      <nav
        className={`
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          rounded-2xl
          px-5
          py-4
          transition-all
          duration-300
          md:px-8
          md:py-5
          ${
            scrolled
              ? "border border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl"
              : "border border-transparent bg-transparent"
          }
        `}
      >
        {/* LOGO */}
<a
  href="#"
  onClick={closeMenu}
  className="
    group
    inline-flex
    items-center
    transition-transform
    duration-300
    hover:scale-[1.04]
  "
>
  <span
    className="
      block
      bg-gradient-to-r
      from-purple-500
      to-green-400
      bg-clip-text
      text-[30px]
      font-black
      leading-none
      tracking-[-0.05em]
      text-transparent
      md:text-[36px]
    "
  >
    <T>RaccoonX</T>
  </span>
</a>

        {/* DESKTOP NAVIGATION */}

        <div className="hidden items-center gap-7 md:flex lg:gap-8">
          {siteConfig.navigation.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) =>
                scrollToSection(event, link.href)
              }
              className="
                text-sm
                font-medium
                text-white/55
                transition-colors
                duration-300
                hover:text-white
              "
            >
              <T>{link.label}</T>
            </a>
          ))}
        </div>

        {/* DESKTOP LANGUAGE */}

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* DESKTOP BUY */}

        <a
          href={siteConfig.links.buy}
          onClick={(event) =>
            scrollToSection(
              event,
              siteConfig.links.buy
            )
          }
          className="
            hidden
            rounded-xl
            bg-gradient-to-r
            from-purple-500
            to-green-400
            px-6
            py-3
            font-bold
            text-black
            transition
            duration-300
            hover:scale-105
            md:block
          "
        >
          <T>Buy RCX</T>
        </a>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen((current) => !current)
          }
          aria-label={
            menuOpen
              ? "Close menu"
              : "Open menu"
          }
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            text-white
            transition
            hover:bg-white/[0.07]
            md:hidden
          "
        >
          {menuOpen ? (
            <FaXmark />
          ) : (
            <FaBars />
          )}
        </button>
      </nav>

      {/* MOBILE MENU */}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -15,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              mx-4
              mt-2
              max-h-[calc(100vh-110px)]
              overflow-y-auto
              rounded-2xl
              border
              border-white/10
              bg-black/95
              p-3
              shadow-2xl
              backdrop-blur-2xl
              md:hidden
            "
          >
            {/* NAV LINKS */}

            <div className="flex flex-col">
              {siteConfig.navigation.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) =>
                    scrollToSection(
                      event,
                      link.href
                    )
                  }
                  className="
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-white/60
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <T>{link.label}</T>
                </a>
              ))}
            </div>

            {/* MOBILE LANGUAGES */}

            <div className="mt-3 border-t border-white/[0.07] pt-4">
              <p
                className="
                  mb-3 px-1
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-white/25
                "
              >
                Language
              </p>

              <div className="grid grid-cols-2 gap-2">
                {languages.map((item) => {
                  const active =
                    language === item.code;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() =>
                        selectMobileLanguage(
                          item.code as Language
                        )
                      }
                      className={`
                        flex
                        min-w-0
                        items-center
                        gap-2
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-left
                        transition
                        ${
                          active
                            ? "border-purple-400/30 bg-purple-400/[0.10] text-white"
                            : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:bg-white/[0.06] hover:text-white"
                        }
                      `}
                    >
                      <span className="relative h-[18px] w-7 shrink-0 overflow-hidden rounded-[4px] border border-white/10">
  <Image
    src={flags[item.code as Language]}
    alt=""
    fill
    sizes="28px"
    className="object-cover"
  />
</span>

                      <span className="truncate text-xs font-bold">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MOBILE BUY */}

            <a
              href={siteConfig.links.buy}
              onClick={(event) =>
                scrollToSection(
                  event,
                  siteConfig.links.buy
                )
              }
              className="
                mt-4
                block
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-green-400
                px-4
                py-4
                text-center
                font-bold
                text-black
                transition
                hover:scale-[1.01]
              "
            >
              <T>Buy RCX</T>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}