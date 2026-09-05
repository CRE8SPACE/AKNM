import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import "./about.css";


/* =========================================================
   ICONS
   ========================================================= */

/**
 * AKNM.PRO standard ArrowUpRight icon.
 *
 * IMPORTANT:
 * This is the standard AKNM arrow SVG.
 *
 * Do not replace with:
 * - Unicode arrows
 * - emoji arrows
 * - text characters
 * - CSS-drawn arrows
 */
function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="about-page__arrow-icon"
    >
      <path
        d="M3 13L13 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 3H13V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* =========================================================
   ABOUT PAGE
   ========================================================= */

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="about-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="about-page__hero">

          <div className="about-page__container">

            <div className="about-page__hero-top">

              <span className="about-page__eyebrow">
                About AKNM
              </span>

              <span className="about-page__hero-index">
                01 / 12
              </span>

            </div>


            <div className="about-page__hero-content">

              <h1>
                Akonam
                <br />
                Agha.
              </h1>

              <div className="about-page__hero-description">

                <span>
                  Entrepreneur / Builder / Creator
                </span>

                <p>
                  I&apos;m Akonam — an entrepreneur,
                  technology builder, creator, author,
                  music artist and founder developing
                  businesses, products, media and
                  intellectual property around ideas
                  I believe should exist.
                </p>

                <p>
                  I am interested in more than starting
                  businesses. I want to build companies,
                  systems and assets that can become
                  larger than the person who started
                  them.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            INTRODUCTION
            ================================================= */}

        <section className="about-page__intro">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                02 / The entrepreneur
              </span>

              <span>
                AKNM
              </span>

            </div>


            <div className="about-page__intro-grid">

              <div className="about-page__intro-title">

                <h2>
                  I&apos;m interested in
                  <br />
                  building things
                  <br />
                  that outlive me.
                </h2>

              </div>


              <div className="about-page__intro-copy">

                <p>
                  Entrepreneurship is at the centre
                  of my work.
                </p>

                <p>
                  I like taking an idea from its
                  earliest form — sometimes just a
                  thought or an observation — and
                  turning it into something structured:
                  a business, product, platform,
                  company, publication, experience or
                  body of work.
                </p>

                <p>
                  My interests move across technology,
                  commerce, media, publishing, music,
                  hospitality and other forms of
                  creative enterprise. The industries
                  may change, but the underlying
                  objective remains the same: create
                  something useful, own it, improve it
                  and give it room to grow.
                </p>

                <p>
                  I am especially interested in the
                  relationship between entrepreneurship
                  and technology — how software,
                  systems, media and intellectual
                  property can turn a small operation
                  into something capable of reaching
                  far beyond its original environment.
                </p>

                <p>
                  I am not trying to build a collection
                  of disconnected projects. I am building
                  a body of companies, products and
                  intellectual property that can compound
                  over time.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ENTREPRENEURIAL APPROACH
            ================================================= */}

        <section className="about-page__ecosystem">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                03 / How I think
              </span>

              <span>
                Founder / Operator
              </span>

            </div>


            <div className="about-page__ecosystem-intro">

              <h2>
                I think in
                <br />
                systems and possibilities.
              </h2>

              <p>
                I am naturally drawn to the space between
                an idea and what it could eventually
                become. I look for ways to turn individual
                activities into systems, systems into
                products and products into businesses
                that can operate and grow independently.
              </p>

            </div>


            <div className="about-page__ecosystem-grid">

              <article>

                <span>
                  01
                </span>

                <h3>
                  Build
                </h3>

                <p>
                  I like creating things from the ground
                  up — businesses, software, platforms,
                  media properties and intellectual
                  property.
                </p>

              </article>


              <article>

                <span>
                  02
                </span>

                <h3>
                  Own
                </h3>

                <p>
                  I value ownership of the underlying
                  assets, technology, brand, customer
                  relationship and intellectual property
                  behind what I build.
                </p>

              </article>


              <article>

                <span>
                  03
                </span>

                <h3>
                  Systemise
                </h3>

                <p>
                  I am interested in turning manual
                  operations into repeatable systems
                  that can function, improve and scale
                  without depending entirely on me.
                </p>

              </article>


              <article>

                <span>
                  04
                </span>

                <h3>
                  Scale
                </h3>

                <p>
                  The long-term objective is not simply
                  to make something work. It is to create
                  structures capable of reaching more
                  people, generating more value and
                  becoming increasingly independent.
                </p>

              </article>

            </div>

          </div>

        </section>


        {/* =================================================
            VENTURES
            ================================================= */}

        <section className="about-page__building">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                04 / Ventures
              </span>

              <span>
                Companies / Businesses
              </span>

            </div>


            <div className="about-page__building-grid">

              <div>

                <h2>
                  I build
                  <br />
                  businesses,
                  <br />
                  not just brands.
                </h2>

              </div>


              <div className="about-page__building-copy">

                <p>
                  My entrepreneurial work extends
                  beyond technology.
                </p>

                <p>
                  I am interested in building companies
                  across different industries where
                  strong ideas can be transformed into
                  commercially viable businesses,
                  systems and long-term assets.
                </p>

                <p>
                  One example is CRETESPACE — a business
                  centre operation being transformed into
                  a technology-enabled service platform.
                  The larger ambition is to move beyond
                  the traditional business centre model
                  and build infrastructure that can
                  support how people and businesses
                  access services, technology and
                  operations.
                </p>

                <p>
                  Other ventures and concepts explore
                  different markets and experiences. I
                  do not expect every idea to become a
                  company. The objective is to identify
                  the ideas with real potential, build
                  them properly and allow the strongest
                  ones to compound.
                </p>

                <Link
                  href="/ventures"
                  className="about-page__text-link"
                >
                  Explore the ventures

                  <span
                    aria-hidden="true"
                  >
                    <ArrowUpRightIcon />
                  </span>

                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CRETESPACE
            ================================================= */}

        <section className="about-page__platform">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                05 / Building companies
              </span>

              <span>
                CRETESPACE
              </span>

            </div>


            <div className="about-page__platform-content">

              <span className="about-page__platform-label">
                Business / Technology
              </span>

              <h2>
                Turning a business
                <br />
                centre into
                <br />
                infrastructure.
              </h2>

              <p>
                CRETESPACE represents an important
                part of my entrepreneurial journey:
                taking a traditional service business
                and asking what it could become when
                technology is placed at its centre.
              </p>

              <p>
                What began as a physical business
                centre has evolved into a broader
                technology and service-platform
                vision — connecting customers,
                services, ordering, payments,
                fulfilment and business operations
                through software.
              </p>

              <p>
                The objective is not simply to operate
                another business centre. It is to build
                systems that can make this type of
                business more efficient, accessible,
                scalable and increasingly independent
                of physical location.
              </p>

              <p>
                CRETESPACE is therefore both a business
                and an experiment in a larger question:
                <strong>
                  {" "}
                  how much of a traditional service
                  business can be transformed into
                  technology infrastructure?
                </strong>
              </p>

              <Link
                href="/ventures"
                className="about-page__platform-link"
              >
                Explore what I&apos;m building

                <span
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            TECHNOLOGY
            ================================================= */}

        <section className="about-page__creative">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                06 / Technology
              </span>

              <span>
                Products / Infrastructure
              </span>

            </div>


            <div className="about-page__creative-grid">

              <div>

                <span className="about-page__creative-number">
                  01
                </span>

                <h2>
                  Product
                </h2>

                <p>
                  I build software around real-world
                  problems — platforms that connect
                  people, services, content, commerce
                  and operations.
                </p>

              </div>


              <div>

                <span className="about-page__creative-number">
                  02
                </span>

                <h2>
                  Infrastructure
                </h2>

                <p>
                  My long-term technology work extends
                  into systems such as CRETO, CREVA and
                  BICEN — ideas focused on intelligence,
                  automation and operating infrastructure
                  for businesses and digital environments.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            AKODIA / AKNM.PRO
            ================================================= */}

        <section className="about-page__platform">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                07 / The bigger idea
              </span>

              <span>
                AKNM.PRO / AKODIA
              </span>

            </div>


            <div className="about-page__platform-content">

              <span className="about-page__platform-label">
                Web Media
              </span>

              <h2>
                The internet should
                <br />
                give people more
                <br />
                ownership.
              </h2>

              <p>
                AKNM.PRO is the company and technology
                environment through which I am developing
                a broader vision for personal digital
                ownership.
              </p>

              <p>
                The long-term product vision is
                <strong> AKODIA</strong> — a Web Media
                platform designed around the idea that
                a person&apos;s presence on the internet
                should be capable of becoming something
                closer to an owned digital property than
                a profile inside someone else&apos;s
                network.
              </p>

              <p>
                Instead of reducing identity to a
                username, follower count or profile
                inside a closed social network, AKODIA
                explores a model where individuals can
                have a customisable digital home through
                which they can publish, communicate,
                build an audience and develop their own
                media presence.
              </p>

              <p>
                This is part of a broader belief that
                technology should not only make people
                more connected. It should also give them
                greater control over what they create
                and how they exist digitally.
              </p>

              <Link
                href="/ventures"
                className="about-page__platform-link"
              >
                Discover the vision

                <span
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            MEDIA
            ================================================= */}

        <section className="about-page__media">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                08 / Media
              </span>

              <span>
                AKNM TV / Live / Journal
              </span>

            </div>


            <div className="about-page__media-intro">

              <h2>
                I am building
                <br />
                an independent
                <br />
                media presence.
              </h2>

              <p>
                Entrepreneurship and media increasingly
                intersect. I want to build an audience
                around the ideas, businesses, experiments
                and perspectives behind my work rather
                than relying entirely on traditional
                advertising or third-party platforms.
              </p>

              <p>
                AKNM is becoming a place for video,
                conversations, podcasts, broadcasts,
                writing, documentation and original
                programming.
              </p>

            </div>


            <div className="about-page__media-links">

              <Link href="/media">

                <span>
                  AKNM TV
                </span>

                <strong>
                  Watch original media
                </strong>

                <span
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </Link>


              <Link href="/live">

                <span>
                  AKNM Live
                </span>

                <strong>
                  Watch live broadcasts
                </strong>

                <span
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </Link>


              <Link href="/feed">

                <span>
                  Journal
                </span>

                <strong>
                  Read the latest
                </strong>

                <span
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            PUBLISHING
            ================================================= */}

        <section className="about-page__creative">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                09 / Intellectual property
              </span>

              <span>
                Books / Publishing
              </span>

            </div>


            <div className="about-page__creative-grid">

              <div>

                <span className="about-page__creative-number">
                  01
                </span>

                <h2>
                  Author
                </h2>

                <p>
                  Writing is one of the ways I turn
                  ideas, experiences and observations
                  into intellectual property that can
                  exist independently of me.
                </p>

                <Link
                  href="/books"
                  className="about-page__text-link"
                >
                  Explore the books

                  <span
                    aria-hidden="true"
                  >
                    <ArrowUpRightIcon />
                  </span>

                </Link>

              </div>


              <div>

                <span className="about-page__creative-number">
                  02
                </span>

                <h2>
                  Publisher
                </h2>

                <p>
                  Through AKNM Publishing, I am building
                  a home for original books, ideas and
                  other intellectual property across
                  digital and physical formats.
                </p>

                <Link
                  href="/books"
                  className="about-page__text-link"
                >
                  Enter the library

                  <span
                    aria-hidden="true"
                  >
                    <ArrowUpRightIcon />
                  </span>

                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            MUSIC & CULTURE
            ================================================= */}

        <section className="about-page__music">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                10 / Culture
              </span>

              <span>
                Music / Experiences
              </span>

            </div>


            <div className="about-page__music-grid">

              <div>

                <h2>
                  Business is
                  <br />
                  not the whole
                  <br />
                  story.
                </h2>

              </div>


              <div>

                <p>
                  I am also interested in the cultural
                  and creative side of building.
                </p>

                <p>
                  Music, books, hospitality, experiences
                  and other creative projects provide
                  different ways of expressing ideas,
                  creating communities and building
                  intellectual and cultural value.
                </p>

                <p>
                  AKNM Records provides a home for music,
                  releases and the wider creative work
                  surrounding them.
                </p>

                <Link
                  href="/music"
                  className="about-page__text-link"
                >
                  Explore the music

                  <span
                    aria-hidden="true"
                  >
                    <ArrowUpRightIcon />
                  </span>

                </Link>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PHILOSOPHY
            ================================================= */}

        <section className="about-page__philosophy">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                11 / Philosophy
              </span>

              <span>
                How I work
              </span>

            </div>


            <div className="about-page__philosophy-content">

              <h2>
                Ownership.
                <br />
                Independence.
                <br />
                Execution.
              </h2>

              <div>

                <p>
                  I believe ownership matters.
                </p>

                <p>
                  I want to understand the businesses,
                  products and systems I build and retain
                  meaningful control over the assets that
                  make them valuable.
                </p>

                <p>
                  I value independence because it creates
                  room to think differently, experiment
                  and build without having to follow
                  somebody else&apos;s formula.
                </p>

                <p>
                  I believe technology should create
                  leverage — allowing people and businesses
                  to accomplish more without simply
                  adding more complexity.
                </p>

                <p>
                  I also believe ambition has to be matched
                  by discipline. Ideas are abundant.
                  Execution, customer value, revenue,
                  systems and persistence are what turn
                  them into companies.
                </p>

                <p>
                  Ultimately, I am interested in building
                  things that can continue to create value
                  long after the excitement of starting
                  them has passed.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CURRENT FOCUS
            ================================================= */}

        <section className="about-page__focus">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                12 / Now
              </span>

              <span>
                Current focus
              </span>

            </div>


            <div className="about-page__focus-grid">

              <div>

                <span>
                  01
                </span>

                <h3>
                  CRETESPACE
                </h3>

                <p>
                  Transforming a traditional business
                  centre into a technology-enabled service
                  platform and building the systems required
                  to operate and scale it beyond a single
                  physical location.
                </p>

              </div>


              <div>

                <span>
                  02
                </span>

                <h3>
                  AKNM.PRO
                </h3>

                <p>
                  Building the technology, media and
                  digital infrastructure that connects
                  my entrepreneurial, creative and
                  publishing work.
                </p>

              </div>


              <div>

                <span>
                  03
                </span>

                <h3>
                  AKODIA
                </h3>

                <p>
                  Developing a long-term Web Media vision
                  for a more owned, customisable and
                  independent digital presence.
                </p>

              </div>


              <div>

                <span>
                  04
                </span>

                <h3>
                  Technology
                </h3>

                <p>
                  Exploring the next generation of
                  software and operating infrastructure
                  through projects including CRETO,
                  CREVA and BICEN.
                </p>

              </div>


              <div>

                <span>
                  05
                </span>

                <h3>
                  Media
                </h3>

                <p>
                  Growing AKNM TV, AKNM Live, Journal,
                  podcasts, video and original programming
                  as an independent media operation.
                </p>

              </div>


              <div>

                <span>
                  06
                </span>

                <h3>
                  Intellectual Property
                </h3>

                <p>
                  Developing books, music, publishing
                  projects, creative work and other
                  original assets that can exist and
                  compound independently.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CLOSING
            ================================================= */}

        <section className="about-page__closing">

          <div className="about-page__container">

            <span>
              Beyond the beginning
            </span>

            <h2>
              I am not building
              <br />
              one thing.
            </h2>

            <p>
              I am building the capacity to build many
              things — companies, technology, media,
              intellectual property and experiences that
              can create value independently and together.
            </p>

            <p>
              AKNM is the environment in which those
              ideas come together. The work is still
              early, but the direction is deliberate:
              build, own, systemise, execute and keep
              going.
            </p>

            <Link
              href="/contact"
              className="about-page__closing-link"
            >
              Start a conversation

              <span
                aria-hidden="true"
              >
                <ArrowUpRightIcon />
              </span>

            </Link>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}