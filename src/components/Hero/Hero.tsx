import "./Hero.css";


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
   HERO
   ========================================================= */

export default function Hero() {

  return (

    <section className="hero">


      {/* =====================================================
          ATMOSPHERIC BACKGROUND
          ===================================================== */}

      <div className="hero__background" />

      <div className="hero__blue-glow" />

      <div className="hero__atmosphere" />


      {/* =====================================================
          HERO CONTENT
          ===================================================== */}

      <div className="hero__content">


        {/* =================================================
            EYEBROW
            ================================================= */}

        <div className="hero__eyebrow">

          <span className="hero__status">

            <span className="hero__status-dot" />

            <span className="hero__status-ring" />

          </span>

          AKNM.PRO

        </div>


        {/* =================================================
            MAIN
            ================================================= */}

        <div className="hero__main">


          {/* =================================================
              TITLE
              ================================================= */}

          <h1 className="hero__title">
            AKONAM
          </h1>


          {/* =================================================
              IDENTITY
              ================================================= */}

          <div className="hero__identity">


            {/* =================================================
                STATEMENT
                ================================================= */}

            <p className="hero__statement">

              Founder.
              <br />

              Entrepreneur.
              <br />

              Creator.
              <br />

              Builder.

            </p>


            {/* =================================================
                RIGHT CONTENT
                ================================================= */}

            <div className="hero__right">


              {/* =================================================
                  DESCRIPTION
                  ================================================= */}

              <p className="hero__description">

                Building companies, products,
                brands and ideas across technology,
                business and creativity.

              </p>


              {/* =================================================
                  PRIMARY ACTIONS
                  ================================================= */}

              <div className="hero__actions">


                {/* =============================================
                    EXPLORE
                    ============================================= */}

                <a
                  href="/about"
                  className="hero__cta hero__cta--primary"
                >

                  <span>
                    Explore my world
                  </span>


                  <span
                    className="hero__cta-icon"
                    aria-hidden="true"
                  >

                    <ArrowUpRightIcon />

                  </span>

                </a>


                {/* =============================================
                    DEVELOPER PORTFOLIO
                    ============================================= */}

                <a
                  href="https://aknm-portfolio.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero__cta"
                >

                  <span>
                    Developer portfolio
                  </span>


                  <span
                    className="hero__cta-icon"
                    aria-hidden="true"
                  >

                    <ArrowUpRightIcon />

                  </span>

                </a>


                {/* =============================================
                    CONNECT
                    ============================================= */}

                <a
                  href="/contact"
                  className="hero__cta"
                >

                  <span>
                    Let's connect
                  </span>


                  <span
                    className="hero__cta-icon"
                    aria-hidden="true"
                  >

                    <ArrowUpRightIcon />

                  </span>

                </a>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          HERO META
          ===================================================== */}

      <div className="hero__bottom">


        {/* =================================================
            LOCATION
            ================================================= */}

        <div className="hero__location">

          <span className="hero__meta-label">
            Based in
          </span>

          <span>
            United States of America
          </span>

        </div>


        {/* =================================================
            SCROLL
            ================================================= */}

        <div className="hero__scroll">

          <span>
            Scroll to explore
          </span>


          <span className="hero__scroll-line">

            <span />

          </span>

        </div>


        {/* =================================================
            YEAR
            ================================================= */}

        <div className="hero__year">
          © 2026
        </div>

      </div>

    </section>

  );

}