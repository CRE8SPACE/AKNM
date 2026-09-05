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
   ICONS
   ========================================================= */

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}


function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}


function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}


/* =========================================================
   SIDEBAR STRUCTURE
   ========================================================= */

const navigation: SidebarParent[] = [
  {
    label: "Overview",
    number: "01",
    href: "/studio",
  },

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

  {
    label: "Media",
    number: "07",
    href: "/studio/media",
  },

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

function isPathActive(
  pathname: string,
  href: string,
) {
  if (href === "/studio") {
    return pathname === "/studio";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}


/* =========================================================
   INITIAL OPEN STATE
   ========================================================= */

function getInitialOpenState(
  pathname: string,
) {
  const state: Record<string, boolean> = {};

  navigation.forEach((item) => {
    if (!item.children) {
      return;
    }

    state[item.label] =
      item.children.some((child) =>
        isPathActive(
          pathname,
          child.href,
        ),
      );
  });

  return state;
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function StudioSidebar() {
  const pathname = usePathname();

  const [
    openMenus,
    setOpenMenus,
  ] = useState<Record<string, boolean>>(
    () =>
      getInitialOpenState(pathname),
  );

  const [
    isDrawerOpen,
    setIsDrawerOpen,
  ] = useState(false);


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

        const hasActiveChild =
          item.children.some((child) =>
            isPathActive(
              pathname,
              child.href,
            ),
          );

        if (hasActiveChild) {
          next[item.label] = true;
        }
      });

      return next;
    });

    /* Close mobile drawer after navigation */
    setIsDrawerOpen(false);
  }, [pathname]);


  /* =======================================================
     LOCK PAGE SCROLL WHILE DRAWER IS OPEN
     ======================================================= */

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.classList.remove(
        "studio-drawer-open",
      );

      return;
    }

    document.body.classList.add(
      "studio-drawer-open",
    );

    return () => {
      document.body.classList.remove(
        "studio-drawer-open",
      );
    };
  }, [isDrawerOpen]);


  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isDrawerOpen]);


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
    <>
      {/* ===================================================
          MOBILE MENU BUTTON
         =================================================== */}

      <button
        type="button"
        className="studio-mobile-menu"
        onClick={() =>
          setIsDrawerOpen(true)
        }
        aria-label="Open Studio navigation"
        aria-expanded={isDrawerOpen}
      >
        <MenuIcon />
      </button>


      {/* ===================================================
          MOBILE BACKDROP
         =================================================== */}

      <button
        type="button"
        className={[
          "studio-sidebar__backdrop",
          isDrawerOpen
            ? "is-visible"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() =>
          setIsDrawerOpen(false)
        }
        aria-label="Close Studio navigation"
        tabIndex={
          isDrawerOpen ? 0 : -1
        }
      />


      {/* ===================================================
          SIDEBAR
         =================================================== */}

      <aside
        className={[
          "studio-sidebar",
          isDrawerOpen
            ? "is-drawer-open"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="AKNM Studio"
      >
        {/* ===============================================
            MOBILE DRAWER HEADER
           =============================================== */}

        <div className="studio-sidebar__mobile-header">
          <Link
            href="/studio"
            className="studio-sidebar__mobile-brand"
            aria-label="AKNM Studio"
          >
            <Logo />
          </Link>

          <button
            type="button"
            className="studio-sidebar__close"
            onClick={() =>
              setIsDrawerOpen(false)
            }
            aria-label="Close Studio navigation"
          >
            <CloseIcon />
          </button>
        </div>


        {/* ===============================================
            BRAND
           =============================================== */}

        <Link
          href="/studio"
          className="studio-sidebar__brand"
          aria-label="AKNM Studio"
        >
          <Logo />
        </Link>


        {/* ===============================================
            LABEL
           =============================================== */}

        <div className="studio-sidebar__label">
          AKNM STUDIO
        </div>


        {/* ===============================================
            NAVIGATION
           =============================================== */}

        <nav
          className="studio-sidebar__navigation"
          aria-label="Studio navigation"
        >
          {navigation.map((item) => {
            const hasChildren =
              Boolean(
                item.children?.length,
              );

            const directActive =
              item.href
                ? isPathActive(
                    pathname,
                    item.href,
                  )
                : false;

            const childActive =
              item.children?.some(
                (child) =>
                  isPathActive(
                    pathname,
                    child.href,
                  ),
              ) ?? false;

            const isActive =
              directActive ||
              childActive;

            const isOpen =
              openMenus[item.label] ??
              false;


            /* =========================================
               DIRECT LINK
               ========================================= */

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={
                    item.href ||
                    "/studio"
                  }
                  className={[
                    "studio-sidebar__link",
                    isActive
                      ? "is-active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="studio-sidebar__number">
                    {item.number}
                  </span>

                  <span className="studio-sidebar__name">
                    {item.label}
                  </span>

                  <span
                    className="studio-sidebar__arrow"
                    aria-hidden="true"
                  >
                    <ExternalLinkIcon />
                  </span>
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
                  isOpen
                    ? "is-open"
                    : "",
                  isActive
                    ? "is-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className="studio-sidebar__parent"
                  onClick={() =>
                    toggleMenu(
                      item.label,
                    )
                  }
                  aria-expanded={
                    isOpen
                  }
                >
                  <span className="studio-sidebar__number">
                    {item.number}
                  </span>

                  <span className="studio-sidebar__name">
                    {item.label}
                  </span>

                  <span
                    className="studio-sidebar__toggle"
                    aria-hidden="true"
                  >
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
                    isOpen
                      ? "is-open"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="studio-sidebar__children">
                    {item.children?.map(
                      (
                        child,
                        index,
                      ) => {
                        const childIsActive =
                          isPathActive(
                            pathname,
                            child.href,
                          );

                        return (
                          <Link
                            key={
                              child.href
                            }
                            href={
                              child.href
                            }
                            className={[
                              "studio-sidebar__child",
                              childIsActive
                                ? "is-active"
                                : "",
                            ]
                              .filter(
                                Boolean,
                              )
                              .join(
                                " ",
                              )}
                          >
                            <span className="studio-sidebar__child-branch">
                              <span />
                            </span>

                            <span className="studio-sidebar__child-number">
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <span className="studio-sidebar__child-name">
                              {
                                child.label
                              }
                            </span>

                            {childIsActive && (
                              <span className="studio-sidebar__child-active" />
                            )}
                          </Link>
                        );
                      },
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </nav>


        {/* ===============================================
            BOTTOM
           =============================================== */}

        <div className="studio-sidebar__bottom">
          <Link
            href="/"
            className="studio-sidebar__website"
          >
            <span>
              View website
            </span>

            <span
              aria-hidden="true"
            >
              <ExternalLinkIcon />
            </span>
          </Link>

          <div className="studio-sidebar__version">
            AKNM.PRO / STUDIO
          </div>
        </div>
      </aside>
    </>
  );
}