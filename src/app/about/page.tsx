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
                01 / 11
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
                  Entrepreneur / Creator / Builder
                </span>

                <p>
                  I&apos;m Akonam — an entrepreneur,
                  creator, author, music artist and
                  technology builder developing
                  businesses, products, media and
                  experiences around ideas I believe
                  should exist.
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
                02 / The person
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
                  that matter.
                </h2>

              </div>


              <div className="about-page__intro-copy">

                <p>
                  My work sits at the intersection
                  of entrepreneurship, technology,
                  creativity and media.
                </p>

                <p>
                  I enjoy taking an idea from its
                  earliest form — often just a
                  thought — and turning it into a
                  structured business, product,
                  experience or body of work.
                </p>

                <p>
                  That has led me across different
                  fields: technology, business,
                  publishing, music, digital media,
                  hospitality and creative work.
                </p>

                <p>
                  I am not interested in building
                  simply for the sake of being busy.
                  I want to build assets, systems,
                  companies and intellectual property
                  that can continue to exist and grow
                  beyond me.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ECOSYSTEM
            ================================================= */}

        <section className="about-page__ecosystem">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                03 / The ecosystem
              </span>

              <span>
                AKNM
              </span>

            </div>


            <div className="about-page__ecosystem-intro">

              <h2>
                One person.
                <br />
                Multiple worlds.
              </h2>

              <p>
                AKNM is the broader ecosystem through
                which I organise my work across
                technology, business, media,
                publishing, music and experiences.
              </p>

            </div>


            <div className="about-page__ecosystem-grid">

              <article>

                <span>
                  01
                </span>

                <h3>
                  Technology
                </h3>

                <p>
                  Building digital products,
                  platforms and systems that solve
                  practical problems and create new
                  ways for people to work, discover
                  and transact.
                </p>

              </article>


              <article>

                <span>
                  02
                </span>

                <h3>
                  Ventures
                </h3>

                <p>
                  Developing businesses across
                  different industries with a focus
                  on ownership, systems, scalability
                  and long-term value.
                </p>

              </article>


              <article>

                <span>
                  03
                </span>

                <h3>
                  Media
                </h3>

                <p>
                  Building an independent media
                  presence through writing, video,
                  live broadcasts, conversations and
                  original content.
                </p>

              </article>


              <article>

                <span>
                  04
                </span>

                <h3>
                  Culture
                </h3>

                <p>
                  Music, books, creative projects and
                  experiences that allow ideas to exist
                  beyond conventional business.
                </p>

              </article>

            </div>

          </div>

        </section>


        {/* =================================================
            BUILDING
            ================================================= */}

        <section className="about-page__building">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                04 / Building
              </span>

              <span>
                Products / Systems
              </span>

            </div>


            <div className="about-page__building-grid">

              <div>

                <h2>
                  I build
                  <br />
                  systems,
                  <br />
                  not just ideas.
                </h2>

              </div>


              <div className="about-page__building-copy">

                <p>
                  A significant part of my work is
                  technology.
                </p>

                <p>
                  I design and build digital platforms
                  that bring together content,
                  commerce, identity, media and
                  business operations.
                </p>

                <p>
                  I am particularly interested in
                  software that gives individuals and
                  businesses more ownership over their
                  digital presence rather than forcing
                  everything into someone else&apos;s
                  platform.
                </p>

                <p>
                  That thinking is behind the broader
                  AKNM.PRO vision and the products I am
                  developing around it.
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
            AKODIA / AKNM.PRO
            ================================================= */}

        <section className="about-page__platform">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                05 / The bigger idea
              </span>

              <span>
                AKNM.PRO
              </span>

            </div>


            <div className="about-page__platform-content">

              <span className="about-page__platform-label">
                Web Media
              </span>

              <h2>
                The internet should
                <br />
                belong to the people
                <br />
                using it.
              </h2>

              <p>
                AKNM.PRO is the company and
                technology environment behind a
                larger idea: giving people a more
                owned, customisable and independent
                way to exist on the web.
              </p>

              <p>
                The long-term product vision is
                <strong> AKODIA</strong> — a Web Media
                platform where a person&apos;s digital
                presence can become something closer
                to an owned website and media property
                than a traditional social-media
                profile.
              </p>

              <p>
                Instead of reducing identity to a
                username inside someone else&apos;s
                network, the idea is to give people a
                digital home that they can shape,
                publish through and build upon.
              </p>

              <Link
                href="/ventures"
                className="about-page__platform-link"
              >
                Discover what I&apos;m building

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
                06 / Publishing
              </span>

              <span>
                Books / Ideas
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
                  into something permanent.
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
                  Through AKNM Publishing, the goal is
                  to create and distribute original
                  intellectual property across digital
                  and physical formats.
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
            MUSIC
            ================================================= */}

        <section className="about-page__music">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                07 / Music
              </span>

              <span>
                AKNM Records
              </span>

            </div>


            <div className="about-page__music-grid">

              <div>

                <h2>
                  Music is
                  <br />
                  another language.
                </h2>

              </div>


              <div>

                <p>
                  Music is an important part of my
                  creative identity.
                </p>

                <p>
                  AKNM Records provides a home for
                  music, releases and the wider creative
                  work surrounding them.
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
            MEDIA
            ================================================= */}

        <section className="about-page__media">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                08 / Media
              </span>

              <span>
                AKNM TV / Live
              </span>

            </div>


            <div className="about-page__media-intro">

              <h2>
                I&apos;m building
                <br />
                my own media
                <br />
                infrastructure.
              </h2>

              <p>
                AKNM is not only a place to publish
                written work. It is becoming an
                independent media environment for
                video, broadcasts, conversations,
                updates and original programming.
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
            PHILOSOPHY
            ================================================= */}

        <section className="about-page__philosophy">

          <div className="about-page__container">

            <div className="about-page__section-heading">

              <span>
                09 / Philosophy
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
                  I want to build things I can
                  understand, control and continue
                  developing over time.
                </p>

                <p>
                  I value independence because it
                  creates room to think differently,
                  experiment and build without having
                  to follow somebody else&apos;s formula.
                </p>

                <p>
                  And ultimately, ideas only matter
                  when they become reality. The goal
                  is always execution.
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
                10 / Now
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
                  AKNM.PRO
                </h3>

                <p>
                  Building the technology and digital
                  infrastructure for the wider AKNM
                  ecosystem.
                </p>

              </div>


              <div>

                <span>
                  02
                </span>

                <h3>
                  AKODIA
                </h3>

                <p>
                  Developing the long-term Web Media
                  vision for a more owned and
                  customisable internet presence.
                </p>

              </div>


              <div>

                <span>
                  03
                </span>

                <h3>
                  Publishing
                </h3>

                <p>
                  Expanding books, digital publishing
                  and original intellectual property.
                </p>

              </div>


              <div>

                <span>
                  04
                </span>

                <h3>
                  Media
                </h3>

                <p>
                  Growing AKNM TV, AKNM Live, Journal
                  and the broader independent media
                  operation.
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
              11 / Continue
            </span>

            <h2>
              This is only
              <br />
              the beginning.
            </h2>

            <p>
              I&apos;m building businesses, products,
              media and intellectual property for the
              long term. AKNM is the environment in
              which those ideas come together.
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