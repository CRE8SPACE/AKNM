"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Logo from "../Logo/Logo";
import "./Header.css";


/* =========================================================
   NAVIGATION
   ========================================================= */

const navigation = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Ventures",
    href: "/ventures",
  },
  {
    label: "Books",
    href: "/books",
  },
  {
    label: "Music",
    href: "/music",
  },
  {
    label: "Journal",
    href: "/feed",
  },
  {
    label: "Watch",
    href: "/media",
  },
  {
    label: "Live",
    href: "/live",
  },
  {
    label: "Connect",
    href: "/contact",
  },
];


/* =========================================================
   ARROW ICON
   ========================================================= */

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 13L13 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M6 3H13V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* =========================================================
   HEADER
   ========================================================= */

export default function Header() {

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const [
    scrolled,
    setScrolled,
  ] = useState(false);


  /* =======================================================
     SCROLL STATE
     ======================================================= */

  useEffect(() => {

    const handleScroll = () => {

      setScrolled(
        window.scrollY > 40
      );

    };


    handleScroll();


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  /* =======================================================
     LOCK PAGE SCROLL WHEN MENU IS OPEN
     ======================================================= */

  useEffect(() => {

    document.body.style.overflow =
      menuOpen
        ? "hidden"
        : "";


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    menuOpen,
  ]);


  /* =======================================================
     CLOSE MENU
     ======================================================= */

  const closeMenu = () => {

    setMenuOpen(false);

  };


  /* =======================================================
     TOGGLE MENU
     ======================================================= */

  const toggleMenu = () => {

    setMenuOpen(
      (current) => !current
    );

  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <header
      className={[
        "site-header",

        scrolled
          ? "site-header--scrolled"
          : "",

        menuOpen
          ? "site-header--menu-open"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >

      {/* =================================================
          HEADER BAR
          ================================================= */}

      <div
        className="site-header__bar"
      >


        {/* ===============================================
            BRAND
            =============================================== */}

        <Link
          href="/"
          className="site-header__brand"
          aria-label="AKNM Home"
          onClick={closeMenu}
        >

          <Logo />

        </Link>


        {/* ===============================================
            DESKTOP NAVIGATION
            =============================================== */}

        <nav
          className="site-header__nav"
          aria-label="Main navigation"
        >

          {navigation.map(
            (item) => (

              <Link
                key={item.href}
                href={item.href}
                className="site-header__link"
                onClick={closeMenu}
              >

                {item.label}

              </Link>

            )
          )}

        </nav>


        {/* ===============================================
            HEADER MENU
            =============================================== */}

        <div
          className="site-header__actions"
        >

          <button
            type="button"
            className={[
              "site-header__menu",

              menuOpen
                ? "is-open"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}

            onClick={toggleMenu}

            aria-label={
              menuOpen
                ? "Close navigation"
                : "Open navigation"
            }

            aria-expanded={
              menuOpen
            }
          >

            <span />
            <span />

          </button>

        </div>

      </div>


      {/* =================================================
          MOBILE NAVIGATION
          ================================================= */}

      <div
        className={[
          "site-header__mobile",

          menuOpen
            ? "is-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}

        aria-hidden={
          !menuOpen
        }
      >

        <div
          className="site-header__mobile-inner"
        >


          {/* =============================================
              MOBILE HEADER
              ============================================= */}

          <div
            className="site-header__mobile-heading"
          >

            <span>
              AKNM
            </span>

            <span>
              Navigation
            </span>

          </div>


          {/* =============================================
              MOBILE NAVIGATION
              ============================================= */}

          <nav
            className="site-header__mobile-navigation"
            aria-label="Mobile navigation"
          >

            {navigation.map(
              (item, index) => (

                <Link
                  key={item.href}
                  href={item.href}
                  className="site-header__mobile-link"
                  onClick={closeMenu}
                  tabIndex={
                    menuOpen
                      ? 0
                      : -1
                  }
                >

                  {/* ===================================
                      NUMBER
                      =================================== */}

                  <span
                    className="site-header__mobile-number"
                  >

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </span>


                  {/* ===================================
                      LABEL
                      =================================== */}

                  <span
                    className="site-header__mobile-label"
                  >

                    {item.label}

                  </span>


                  {/* ===================================
                      ARROW
                      =================================== */}

                  <span
                    className="site-header__mobile-arrow"
                    aria-hidden="true"
                  >

                    <ArrowUpRightIcon />

                  </span>

                </Link>

              )
            )}

          </nav>


          {/* =============================================
              MOBILE FOOTER
              ============================================= */}

          <div
            className="site-header__mobile-bottom"
          >

            <span>
              AKNM.PRO
            </span>

            <span>
              Personal / Media / Ventures
            </span>

          </div>

        </div>

      </div>

    </header>

  );

}