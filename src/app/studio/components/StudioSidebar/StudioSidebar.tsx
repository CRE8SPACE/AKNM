"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Logo from "@/components/Logo/Logo";

import "./StudioSidebar.css";

/* =========================================================
   TYPES
   ========================================================= */

type SidebarChild = {
  label: string;
  href: string;
};

type SidebarParent = {
  label: string;
  number: string;
  href?: string;
  children?: SidebarChild[];
};

/* =========================================================
   SIDEBAR STRUCTURE
   ========================================================= */

const navigation: SidebarParent[] = [
  /* =======================================================
     OVERVIEW
     ======================================================= */

  {
    label: "Overview",
    number: "01",
    href: "/studio",
  },

  /* =======================================================
     PAGES
     Public website page management
     ======================================================= */

  {
    label: "Pages",
    number: "02",

    children: [
      {
        label: "Connect",
        href: "/studio/connect",
      },
    ],
  },

  /* =======================================================
     VENTURES
     Companies, products and projects
     ======================================================= */

  {
    label: "Ventures",
    number: "03",

    children: [
      {
        label: "All Ventures",
        href: "/studio/ventures",
      },

      {
        label: "New Venture",
        href: "/studio/ventures/new",
      },
    ],
  },

  /* =======================================================
     CONTENT
     Journal / editorial content
     ======================================================= */

  {
    label: "Content",
    number: "04",

    children: [
      {
        label: "All Content",
        href: "/studio/content",
      },

      {
        label: "Create Post",
        href: "/studio/content/new",
      },

      {
        label: "Categories",
        href: "/studio/content/categories",
      },
    ],
  },

  /* =======================================================
     BOOKS
     ======================================================= */

  {
    label: "Books",
    number: "05",

    children: [
      {
        label: "All Books",
        href: "/studio/books",
      },

      {
        label: "New Book",
        href: "/studio/books/new",
      },
    ],
  },

  /* =======================================================
     MUSIC
     ======================================================= */

  {
    label: "Music",
    number: "06",

    children: [
      {
        label: "All Music",
        href: "/studio/music",
      },

      {
        label: "New Music",
        href: "/studio/music/new",
      },
    ],
  },

  /* =======================================================
     MEDIA
     ======================================================= */

  {
    label: "Media",
    number: "07",

    href: "/studio/media",
  },

  /* =======================================================
     LIVE
     ======================================================= */

  {
    label: "Live",
    number: "08",

    children: [
      {
        label: "Go Live",
        href: "/studio/live",
      },

      {
        label: "Live History",
        href: "/studio/live/history",
      },
    ],
  },

  /* =======================================================
     PUBLISHING
     ======================================================= */

  {
    label: "Publishing",
    number: "09",

    children: [
      {
        label: "Publishing",
        href: "/studio/publishing",
      },

      {
        label: "Distribution",
        href: "/studio/publishing/channels",
      },
    ],
  },

  /* =======================================================
     INSIGHTS
     ======================================================= */

  {
    label: "Insights",
    number: "10",

    children: [
      {
        label: "Analytics",
        href: "/studio/insights",
      },

      {
        label: "Content Analytics",
        href: "/studio/insights/content",
      },

      {
        label: "Audience",
        href: "/studio/insights/audience",
      },
    ],
  },
];

/* =========================================================
   ACTIVE PATH
   ========================================================= */

function isPathActive(pathname: string, href: string) {
  /*
   * Overview should only be active
   * on the exact Studio homepage.
   */

  if (href === "/studio") {
    return pathname === "/studio";
  }

  /*
   * Other routes are active when the
   * current pathname matches the route
   * or sits beneath it.
   */

  return pathname === href || pathname.startsWith(`${href}/`);
}

/* =========================================================
   INITIAL OPEN STATE
   ========================================================= */

function getInitialOpenState(pathname: string) {
  const state: Record<string, boolean> = {};

  navigation.forEach((item) => {
    /*
     * Direct links do not have
     * expandable state.
     */

    if (!item.children) {
      return;
    }

    /*
     * Automatically open the section
     * containing the active page.
     */

    state[item.label] = item.children.some((child) =>
      isPathActive(pathname, child.href),
    );
  });

  return state;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function StudioSidebar() {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenState(pathname),
  );

  /* =======================================================
     AUTO OPEN ACTIVE SECTION
     ======================================================= */

  useEffect(() => {
    setOpenMenus((current) => {
      const next = {
        ...current,
      };

      navigation.forEach((item) => {
        if (!item.children) {
          return;
        }

        const hasActiveChild = item.children.some((child) =>
          isPathActive(pathname, child.href),
        );

        /*
         * If the current page belongs
         * to a section, keep that section
         * open after navigation.
         */

        if (hasActiveChild) {
          next[item.label] = true;
        }
      });

      return next;
    });
  }, [pathname]);

  /* =======================================================
     TOGGLE MENU
     ======================================================= */

  function toggleMenu(label: string) {
    setOpenMenus((current) => ({
      ...current,

      [label]: !current[label],
    }));
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <aside className="studio-sidebar">
      {/* =================================================
          BRAND
          ================================================= */}

      <Link
        href="/studio"
        className="studio-sidebar__brand"
        aria-label="AKNM Studio"
      >
        <Logo />
      </Link>

      {/* =================================================
          LABEL
          ================================================= */}

      <div className="studio-sidebar__label">AKNM STUDIO</div>

      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav
        className="studio-sidebar__navigation"
        aria-label="Studio navigation"
      >
        {navigation.map((item) => {
          const hasChildren = Boolean(item.children?.length);

          const directActive = item.href
            ? isPathActive(pathname, item.href)
            : false;

          const childActive =
            item.children?.some((child) =>
              isPathActive(pathname, child.href),
            ) ?? false;

          const isActive = directActive || childActive;

          const isOpen = openMenus[item.label] ?? false;

          /* =========================================
               DIRECT LINK
               ========================================= */

          if (!hasChildren) {
            return (
              <Link
                key={item.label}
                href={item.href || "/studio"}
                className={["studio-sidebar__link", isActive ? "is-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="studio-sidebar__number">{item.number}</span>

                <span className="studio-sidebar__name">{item.label}</span>

                <span className="studio-sidebar__arrow">↗</span>
              </Link>
            );
          }

          /* =========================================
               PARENT
               ========================================= */

          return (
            <section
              key={item.label}
              className={[
                "studio-sidebar__group",
                isOpen ? "is-open" : "",
                isActive ? "is-active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* =====================================
                    PARENT BUTTON
                    ===================================== */}

              <button
                type="button"
                className="studio-sidebar__parent"
                onClick={() => toggleMenu(item.label)}
                aria-expanded={isOpen}
              >
                <span className="studio-sidebar__number">{item.number}</span>

                <span className="studio-sidebar__name">{item.label}</span>

                <span className="studio-sidebar__toggle" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>

              {/* =====================================
                    CHILDREN
                    ===================================== */}

              <div
                className={[
                  "studio-sidebar__children-wrapper",
                  isOpen ? "is-open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="studio-sidebar__children">
                  {item.children?.map((child, index) => {
                    const childIsActive = isPathActive(pathname, child.href);

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={[
                          "studio-sidebar__child",
                          childIsActive ? "is-active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className="studio-sidebar__child-branch">
                          <span />
                        </span>

                        <span className="studio-sidebar__child-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="studio-sidebar__child-name">
                          {child.label}
                        </span>

                        {childIsActive && (
                          <span className="studio-sidebar__child-active" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </nav>

      {/* =================================================
          BOTTOM
          ================================================= */}

      <div className="studio-sidebar__bottom">
        <Link href="/" className="studio-sidebar__website">
          <span>View website</span>

          <span>↗</span>
        </Link>

        <div className="studio-sidebar__version">AKNM.PRO / STUDIO</div>
      </div>
    </aside>
  );
}
