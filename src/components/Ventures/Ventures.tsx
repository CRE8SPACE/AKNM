import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./Ventures.css";

/* =========================================================
   TYPES
   ========================================================= */

interface Venture {
  id: string;
  number: number;
  type: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  year: string | null;
  href: string | null;
  featured: boolean;
}


/* =========================================================
   HELPERS
   ========================================================= */

function getVentureHref(venture: Venture) {
  if (venture.href?.trim()) {
    return venture.href;
  }

  return `/ventures/${venture.slug}`;
}


function formatNumber(number: number) {
  return String(number).padStart(2, "0");
}


/* =========================================================
   VENTURES
   ========================================================= */

export default async function Ventures() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ventures")
    .select(`
      id,
      number,
      type,
      name,
      slug,
      description,
      status,
      year,
      href,
      featured
    `)
    .eq("is_visible", true)
    .order("display_order", {
      ascending: true,
    })
    .order("number", {
      ascending: true,
    })
    .limit(6);

  if (error) {
    console.error("Ventures loading error:", error);
  }

  const ventures: Venture[] = (data ?? []).map((venture) => ({
    id: venture.id,
    number: venture.number,
    type: venture.type,
    name: venture.name,
    slug: venture.slug,
    description: venture.description,
    status: venture.status,
    year: venture.year,
    href: venture.href,
    featured: venture.featured,
  }));


  return (
    <section className="ventures">
      <div className="ventures__container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="ventures__header">

          <div className="ventures__eyebrow">

            <span className="ventures__line" />

            <span>
              Work &amp; Ventures
            </span>

          </div>


          <div className="ventures__intro">

            <h2>
              Things I&apos;ve
              <br />
              built.
            </h2>

            <p>
              Companies, products and ideas
              created around a simple belief:
              useful things should exist.
            </p>

          </div>

        </div>


        {/* =================================================
            VENTURE LIST
            ================================================= */}

        {ventures.length > 0 ? (

          <div className="ventures__list">

            {ventures.map((venture) => {

              const href =
                getVentureHref(venture);

              const isExternal =
                href.startsWith("http://") ||
                href.startsWith("https://");


              return (
                <Link
                  key={venture.id}
                  href={href}
                  className={`
                    venture
                    ${
                      venture.featured
                        ? "venture--featured"
                        : ""
                    }
                  `}
                  {...(
                    isExternal
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {}
                  )}
                >

                  {/* NUMBER */}

                  <div className="venture__number">
                    {formatNumber(
                      venture.number
                    )}
                  </div>


                  {/* NAME */}

                  <div className="venture__name">

                    <h3>
                      {venture.name}
                    </h3>

                    <span>
                      {venture.type}
                    </span>

                  </div>


                  {/* DESCRIPTION */}

                  <p className="venture__description">
                    {venture.description ||
                      "A project currently being built."}
                  </p>


                  {/* STATUS */}

                  <div className="venture__status">

                    <span className="venture__status-dot" />

                    <span>
                      {venture.status}
                    </span>

                    {venture.year && (
                      <span className="venture__year">
                        {venture.year}
                      </span>
                    )}

                  </div>


                  {/* ARROW */}

                  <div className="venture__arrow">
                    ↗
                  </div>

                </Link>
              );
            })}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div className="ventures__empty">

            <span className="ventures__empty-number">
              00
            </span>

            <div className="ventures__empty-content">

              <span>
                Nothing here yet
              </span>

              <h3>
                The next venture
                <br />
                is being built.
              </h3>

              <p>
                New companies, products and
                experiments will appear here.
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="ventures__footer">

          <span>
            Companies · Products · Experiments
          </span>

          <Link href="/ventures">
            <span>
              Explore everything
            </span>

            <span>
              ↗
            </span>
          </Link>

        </div>

      </div>
    </section>
  );
}