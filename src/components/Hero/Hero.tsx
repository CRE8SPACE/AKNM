import "./Hero.css";

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

        {/* EYEBROW */}

        <div className="hero__eyebrow">

          <span className="hero__status">
            <span className="hero__status-dot" />
            <span className="hero__status-ring" />
          </span>

          AKNM.PRO

        </div>


        {/* MAIN */}

        <div className="hero__main">

          <h1 className="hero__title">
            AKONAM
          </h1>


          <div className="hero__identity">

            <p className="hero__statement">
              Founder.
              <br />
              Entrepreneur.
              <br />
              Creator.
              <br />
              Builder.
            </p>


            <div className="hero__right">

              <p className="hero__description">
                Building companies, products,
                brands and ideas across technology,
                business and creativity.
              </p>


              {/* =================================================
                  PRIMARY ACTIONS
                  ================================================= */}

              <div className="hero__actions">

                {/* EXPLORE */}

                <a
                  href="/about"
                  className="hero__cta hero__cta--primary"
                >
                  <span>
                    Explore my world
                  </span>

                  <span className="hero__cta-icon">
                    ↗
                  </span>
                </a>


                {/* DEVELOPER PORTFOLIO */}

                <a
                  href="https://aknm-portfolio.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero__cta"
                >
                  <span>
                    Developer portfolio
                  </span>

                  <span className="hero__cta-icon">
                    ↗
                  </span>
                </a>


                {/* CONNECT */}

                <a
                  href="/contact"
                  className="hero__cta"
                >
                  <span>
                    Let's connect
                  </span>

                  <span className="hero__cta-icon">
                    ↗
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

        <div className="hero__location">

          <span className="hero__meta-label">
            Based in
          </span>

          <span>
            United States of America
          </span>

        </div>


        <div className="hero__scroll">

          <span>
            Scroll to explore
          </span>

          <span className="hero__scroll-line">
            <span />
          </span>

        </div>


        <div className="hero__year">
          © 2026
        </div>

      </div>

    </section>
  );
}