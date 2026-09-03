"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import "./Footer.css";


/* =========================================================
   TYPES
   ========================================================= */

interface ConnectSettings {
  primary_email: string | null;
  business_email: string | null;
  phone: string | null;
  whatsapp: string | null;

  instagram: string | null;
  youtube: string | null;
  x: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  github: string | null;

  form_enabled: boolean;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Media",
    href: "/media",
  },
  {
    label: "Feed",
    href: "/feed",
  },
  {
    label: "Ventures",
    href: "/ventures",
  },
];


const explore = [
  {
    label: "Music",
    href: "/music",
  },
  {
    label: "Writing",
    href: "/writing",
  },
  {
    label: "Books",
    href: "/books",
  },
  {
    label: "Speaking",
    href: "/speaking",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];


/* =========================================================
   HELPERS
   ========================================================= */

function isValidUrl(
  value: string | null
): value is string {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}


/* =========================================================
   FOOTER
   ========================================================= */

export default function Footer() {

  const [settings, setSettings] =
    useState<ConnectSettings | null>(null);


  /* =======================================================
     LOAD CONNECT SETTINGS
     ======================================================= */

  useEffect(() => {

    let cancelled = false;

    async function loadSettings() {

      try {

        const response =
          await fetch("/api/connect", {
            method: "GET",
            cache: "no-store",
          });


        if (!response.ok) {
          throw new Error(
            "Failed to load connect settings."
          );
        }


        const data =
          (await response.json()) as ConnectSettings;


        if (!cancelled) {
          setSettings(data);
        }

      } catch (error) {

        console.error(
          "Footer connect settings loading error:",
          error
        );

      }

    }


    loadSettings();


    return () => {
      cancelled = true;
    };

  }, []);


  /* =======================================================
     SOCIAL LINKS
     ======================================================= */

  const socials = [
    {
      label: "Instagram",
      href: settings?.instagram ?? null,
    },
    {
      label: "X",
      href: settings?.x ?? null,
    },
    {
      label: "YouTube",
      href: settings?.youtube ?? null,
    },
    {
      label: "LinkedIn",
      href: settings?.linkedin ?? null,
    },
    {
      label: "Facebook",
      href: settings?.facebook ?? null,
    },
    {
      label: "TikTok",
      href: settings?.tiktok ?? null,
    },
    {
      label: "GitHub",
      href: settings?.github ?? null,
    },
  ].filter(
    (
      item
    ): item is {
      label: string;
      href: string;
    } =>
      isValidUrl(item.href)
  );


  /* =======================================================
     EMAIL
     ======================================================= */

  const contactEmail =
    settings?.primary_email ||
    settings?.business_email ||
    null;


  return (
    <footer className="site-footer">

      <div className="site-footer__container">


        {/* =================================================
            TOP
            ================================================= */}

        <div className="site-footer__top">


          {/* =================================================
              BRAND
              ================================================= */}

          <div className="site-footer__brand">

            <Link
              href="/"
              className="site-footer__logo"
              aria-label="AKNM home"
            >
              AKNM
            </Link>


            <p className="site-footer__statement">
              Founder, entrepreneur, creator
              and builder.
            </p>


            <p className="site-footer__description">
              Building companies, products,
              brands and ideas across technology,
              business and creativity.
            </p>


            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="site-footer__email"
              >
                {contactEmail}

                <span>
                  ↗
                </span>
              </a>
            )}

          </div>


          {/* =================================================
              NAVIGATION
              ================================================= */}

          <div className="site-footer__navigation">


            {/* =================================================
                NAVIGATE
                ================================================= */}

            <div className="site-footer__column">

              <span className="site-footer__column-title">
                Navigate
              </span>


              <nav>

                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}

              </nav>

            </div>


            {/* =================================================
                EXPLORE
                ================================================= */}

            <div className="site-footer__column">

              <span className="site-footer__column-title">
                Explore
              </span>


              <nav>

                {explore.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                ))}

              </nav>

            </div>


            {/* =================================================
                FOLLOW
                ================================================= */}

            <div className="site-footer__column">

              <span className="site-footer__column-title">
                Follow
              </span>


              {socials.length > 0 ? (

                <nav>

                  {socials.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}

                      <span>
                        ↗
                      </span>
                    </a>
                  ))}

                </nav>

              ) : (

                <span className="site-footer__empty">
                  Social links coming soon
                </span>

              )}

            </div>

          </div>

        </div>


        {/* =================================================
            LARGE BRAND MARK
            ================================================= */}

        <div
          className="site-footer__mark"
          aria-hidden="true"
        >
          AKNM
        </div>


        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="site-footer__bottom">

          <div className="site-footer__meta">

            <span>
              © {new Date().getFullYear()} AKNM
            </span>

            <span>
              Nigeria
            </span>

          </div>


          <div className="site-footer__legal">

            <Link href="/privacy">
              Privacy
            </Link>

            <Link href="/terms">
              Terms
            </Link>

          </div>


          <a
            href="#top"
            className="site-footer__top-link"
            aria-label="Back to top"
          >
            <span>
              Back to top
            </span>

            <span>
              ↑
            </span>
          </a>

        </div>

      </div>

    </footer>
  );
}