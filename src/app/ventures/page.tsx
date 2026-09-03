import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { createClient } from "@/lib/supabase/server";

import "./ventures.css";


/* =========================================================
   TYPES
   ========================================================= */

type VentureType =
  | "COMPANY"
  | "PRODUCT"
  | "BRAND"
  | "EXPERIMENT";

type Venture = {
  id: string;
  number: number;
  type: VentureType;
  name: string;
  description: string | null;
  status: string;
  year: string | null;
  href: string | null;
  featured: boolean;
  is_visible: boolean;
  display_order: number;
};


/* =========================================================
   FILTERS
   ========================================================= */

const filters = [
  {
    label: "ALL",
    value: "ALL",
  },
  {
    label: "COMPANIES",
    value: "COMPANY",
  },
  {
    label: "PRODUCTS",
    value: "PRODUCT",
  },
  {
    label: "BRANDS",
    value: "BRAND",
  },
  {
    label: "EXPERIMENTS",
    value: "EXPERIMENT",
  },
];


/* =========================================================
   DATA
   ========================================================= */

async function getVentures(): Promise<Venture[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ventures")
    .select(`
      id,
      number,
      type,
      name,
      description,
      status,
      year,
      href,
      featured,
      is_visible,
      display_order
    `)
    .eq("is_visible", true)
    .order("display_order", {
      ascending: true,
    })
    .order("number", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Could not load ventures:",
      error
    );

    return [];
  }

  return (data ?? []) as Venture[];
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function VenturesPage() {
  const ventures = await getVentures();

  return (
    <>
      <Header />

      <main className="ventures-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="ventures-page__hero">

          <div className="ventures-page__container">

            <div className="ventures-page__eyebrow">

              <span className="ventures-page__line" />

              <span>
                Ventures
              </span>

            </div>


            <div className="ventures-page__hero-content">

              <h1>
                Things I&apos;m
                <br />
                building.
              </h1>

              <p>
                Companies, products, brands and
                experiments created around ideas
                worth pursuing.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FILTERS + LIBRARY
            ================================================= */}

        <section className="ventures-page__library">

          <div className="ventures-page__container">

            {/* =================================================
                FILTERS
                ================================================= */}

            <div className="ventures-page__filters">

              <span className="ventures-page__filter-label">
                Explore
              </span>

              <div className="ventures-page__filter-list">

                {filters.map((filter, index) => (

                  <Link
                    key={filter.value}
                    href={
                      filter.value === "ALL"
                        ? "/ventures"
                        : `/ventures?type=${filter.value}`
                    }
                    className={`
                      ventures-page__filter
                      ${
                        index === 0
                          ? "ventures-page__filter--active"
                          : ""
                      }
                    `}
                  >
                    {filter.label}
                  </Link>

                ))}

              </div>

            </div>


            {/* =================================================
                INTRO
                ================================================= */}

            <div className="ventures-page__intro">

              <div>

                <span>
                  Selected work
                </span>

                <h2>
                  Building ideas
                  <br />
                  into reality.
                </h2>

              </div>

              <p>
                I&apos;m interested in the space where
                technology, business and creativity
                intersect. Some ventures are established,
                others are still being built.
              </p>

            </div>


            {/* =================================================
                VENTURE LIST
                ================================================= */}

            <div className="ventures-page__list">

              {ventures.length === 0 ? (

                <div className="ventures-page__empty">

                  <span>
                    No ventures available.
                  </span>

                </div>

              ) : (

                ventures.map((venture) => {

                  const content = (
                    <>
                      <div className="ventures-page__number">
                        {String(venture.number).padStart(2, "0")}
                      </div>


                      <div className="ventures-page__identity">

                        <span className="ventures-page__type">
                          {venture.type}
                        </span>

                        <h3>
                          {venture.name}
                        </h3>

                      </div>


                      <div className="ventures-page__description">

                        <p>
                          {venture.description ||
                            "More information about this venture will be available soon."}
                        </p>

                      </div>


                      <div className="ventures-page__status">

                        <span>
                          {venture.status}
                        </span>

                        {venture.year && (
                          <small>
                            {venture.year}
                          </small>
                        )}

                      </div>


                      <div className="ventures-page__arrow">
                        ↗
                      </div>
                    </>
                  );


                  if (venture.href) {

                    return (
                      <a
                        key={venture.id}
                        href={venture.href}
                        className="ventures-page__item"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content}
                      </a>
                    );

                  }


                  return (
                    <article
                      key={venture.id}
                      className="ventures-page__item"
                    >
                      {content}
                    </article>
                  );

                })

              )}

            </div>


            {/* =================================================
                FOUNDER STATEMENT
                ================================================= */}

            <section className="ventures-page__statement">

              <span>
                The philosophy
              </span>

              <blockquote>
                &ldquo;I&apos;m less interested in
                building what already exists and
                more interested in exploring what
                could exist.&rdquo;
              </blockquote>

              <div className="ventures-page__signature">
                — AKNM
              </div>

            </section>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}