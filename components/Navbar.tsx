"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaXmark } from "react-icons/fa6";
import { siteConfig } from "../config/siteConfig";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 top-0 z-50 w-full px-4 py-4 md:px-6 md:py-5"
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
          className="font-['Orbitron'] text-xl font-black tracking-[0.08em] md:text-2xl"
        >
          <span className="text-white">RACCOON</span>
          <span className="text-purple-400">X</span>
        </a>

        {/* DESKTOP NAVIGATION */}

        <div className="hidden items-center gap-7 md:flex lg:gap-8">
          {siteConfig.navigation.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="
                text-sm
                font-medium
                text-white/55
                transition-colors
                duration-300
                hover:text-white
              "
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* BUY BUTTON */}

        <a
          href={siteConfig.links.buy}
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
          Buy RCX
        </a>

        {/* MOBILE BUTTON */}

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
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
          {menuOpen ? <FaXmark /> : <FaBars />}
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
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-black/90
              p-3
              shadow-2xl
              backdrop-blur-2xl
              md:hidden
            "
          >
            <div className="flex flex-col">
              {siteConfig.navigation.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="
                    rounded-xl
                    px-4
                    py-4
                    text-sm
                    font-medium
                    text-white/60
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  {link.label}
                </a>
              ))}

              <a
                href={siteConfig.links.buy}
                onClick={closeMenu}
                className="
                  mt-2
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
                Buy RCX
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}