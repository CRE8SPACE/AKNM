import Link from "next/link";

import "./Currently.css";


/* =========================================================
   TYPES
   ========================================================= */

type CurrentItem = {
  number: string;
  category: string;
  title: string;
  description: string;
  href: string;
  status: string;
  featured?: boolean;
};


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
   CURRENT FOCUS
   ========================================================= */

const currentItems: CurrentItem[] = [
  {
    number: "01",
    category: "BUILDING",
    title: "CRE8SPACE LAB",
    description:
      "Building technology, businesses and infrastructure for the next generation of entrepreneurs.",
    href: "/ventures",
    status: "ACTIVE",
    featured: true,
  },

  {
    number: "02",
    category: "MEDIA",
    title: "DOCUMENTING",
    description:
      "Sharing ideas, projects, experiences and the realities of building in public.",
    href: "/media",
    status: "ACTIVE",
  },

  {
    number: "03",
    category: "MUSIC",
    title: "EXPLORING SOUND",
    description:
      "Exploring music, sound and creative expression as another form of storytelling.",
    href: "/music",
    status: "EXPLORING",
  },

  {
    number: "04",
    category: "IDEAS",
    title: "BOOKS & WRITING",
    description:
      "Developing ideas, writing about business, technology, creativity and the things worth thinking about.",
    href: "/books",
    status: "CREATING",
  },
];


/* =========================================================
   COMPONENT
   ========================================================= */

export default function Currently() {
  return (
    <section
      className="currently"
      id="currently"
      aria-labelledby="currently-title"
    >

      <div className="currently__container">

        {/* =================================================
            SECTION HEADER
            ================================================= */}

        <header className="currently__header">

          <div className="currently__label">

            <span className="currently__label-line" />

            <span>
              CURRENTLY
            </span>

          </div>


          <div className="currently__heading">

            <div className="currently__heading-main">

              <span className="currently__index">
                01 / NOW
              </span>

              <h2 id="currently-title">
                What has
                <br />
                my attention.
              </h2>

            </div>


            <div className="currently__heading-copy">

              <p>
                A living snapshot of the companies,
                ideas and creative work currently
                occupying my time.
              </p>

              <span className="currently__signal">
                <span className="currently__signal-dot" />
                LIVE FOCUS
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            FEATURED FOCUS
            ================================================= */}

        <div className="currently__featured">

          <Link
            href={currentItems[0].href}
            className="currently__featured-card"
          >

            <div className="currently__featured-top">

              <div className="currently__meta">

                <span className="currently__number">
                  {currentItems[0].number}
                </span>

                <span className="currently__category">
                  {currentItems[0].category}
                </span>

              </div>


              <span className="currently__status">
                <span className="currently__status-dot" />

                {currentItems[0].status}
              </span>

            </div>


            <div className="currently__featured-content">

              <span className="currently__featured-kicker">
                PRIMARY FOCUS
              </span>

              <h3>
                {currentItems[0].title}
              </h3>

              <p>
                {currentItems[0].description}
              </p>

            </div>


            <div className="currently__featured-footer">

              <span>
                Explore projects
              </span>

              <span
                className="currently__featured-arrow"
                aria-hidden="true"
              >
                <ArrowUpRightIcon />
              </span>

            </div>


            <div className="currently__featured-glow" />

          </Link>

        </div>


        {/* =================================================
            OTHER CURRENT FOCUS
            ================================================= */}

        <div className="currently__secondary">

          <div className="currently__secondary-header">

            <span>
              OTHER FOCUS
            </span>

            <span>
              03 AREAS
            </span>

          </div>


          <div className="currently__grid">

            {currentItems
              .slice(1)
              .map((item) => (

                <Link
                  key={item.number}
                  href={item.href}
                  className="currently__card"
                >

                  <div className="currently__card-top">

                    <span className="currently__number">
                      {item.number}
                    </span>

                    <span className="currently__category">
                      {item.category}
                    </span>

                  </div>


                  <div className="currently__card-content">

                    <div className="currently__card-status">

                      <span className="currently__card-status-dot" />

                      {item.status}

                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                  </div>


                  <div className="currently__card-footer">

                    <span>
                      Explore
                    </span>

                    <span
                      className="currently__card-arrow"
                      aria-hidden="true"
                    >
                      <ArrowUpRightIcon />
                    </span>

                  </div>


                  <div className="currently__card-glow" />

                </Link>

              ))}

          </div>

        </div>


        {/* =================================================
            SECTION FOOTER
            ================================================= */}

        <footer className="currently__footer">

          <div className="currently__footer-line" />

          <div className="currently__footer-content">

            <span>
              AKNM.PRO
            </span>

            <span>
              CURRENT FOCUS
            </span>

            <span>
              CONTINUOUSLY EVOLVING
            </span>

          </div>

        </footer>

      </div>

    </section>
  );
}