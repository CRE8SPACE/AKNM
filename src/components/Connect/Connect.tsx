import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./Connect.css";

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
   OPPORTUNITIES
   ========================================================= */

const opportunities = [
  {
    number: "01",
    title: "Business",
    description:
      "Business opportunities, partnerships, investments and ventures.",
  },
  {
    number: "02",
    title: "Media",
    description:
      "Interviews, press, podcasts, documentaries and media appearances.",
  },
  {
    number: "03",
    title: "Speaking",
    description:
      "Conferences, events, workshops and conversations.",
  },
  {
    number: "04",
    title: "Collaboration",
    description:
      "Creative projects, products, technology and interesting ideas.",
  },
];


/* =========================================================
   CONNECT
   ========================================================= */

export default async function Connect() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("connect_settings")
    .select(`
      primary_email,
      business_email,
      phone,
      whatsapp,
      instagram,
      youtube,
      x,
      facebook,
      linkedin,
      tiktok,
      github,
      form_enabled
    `)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Connect settings loading error:", error);
  }

  const settings = data as ConnectSettings | null;

  const email =
    settings?.primary_email ||
    settings?.business_email ||
    "hello@aknm.pro";


  return (
    <section className="connect">

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div
        className="connect__ambient"
        aria-hidden="true"
      />

      <div
        className="connect__grid"
        aria-hidden="true"
      />


      <div className="connect__container">

        {/* =================================================
            EYEBROW
            ================================================= */}

        <div className="connect__eyebrow">

          <span className="connect__line" />

          <span>
            Connect
          </span>

        </div>


        {/* =================================================
            HERO
            ================================================= */}

        <div className="connect__hero">

          <div className="connect__hero-label">
            Open to interesting things.
          </div>


          <h2 className="connect__title">

            Let&apos;s make
            <br />

            <span>
              something happen.
            </span>

          </h2>


          <div className="connect__hero-bottom">

            <p className="connect__intro">
              Have an idea, opportunity, project or
              conversation worth having? Get in touch.
            </p>


            <a
              href={`mailto:${email}`}
              className="connect__email"
            >

              <span className="connect__email-label">
                Start with an email
              </span>

              <span className="connect__email-address">

                {email}

                <span
                  className="connect__email-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>

              </span>

            </a>

          </div>

        </div>


        {/* =================================================
            OPPORTUNITIES
            ================================================= */}

        <div className="connect__section-label">

          <span>
            What we can talk about
          </span>

          <span>
            01 — 04
          </span>

        </div>


        <div className="connect__opportunities">

          {opportunities.map((item) => (

            <div
              key={item.number}
              className="connect__opportunity"
            >

              <span className="connect__number">
                {item.number}
              </span>


              <div className="connect__opportunity-content">

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

              </div>


              <span
                className="connect__opportunity-arrow"
                aria-hidden="true"
              >
                <ArrowUpRightIcon />
              </span>

            </div>

          ))}

        </div>


        {/* =================================================
            BOTTOM
            ================================================= */}

        <div className="connect__bottom">

          {/* SOCIALS */}

          <div className="connect__socials">

            {settings?.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  Instagram
                </span>

                <span
                  className="connect__social-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>
              </a>
            )}


            {settings?.x && (
              <a
                href={settings.x}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  X
                </span>

                <span
                  className="connect__social-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>
              </a>
            )}


            {settings?.youtube && (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  YouTube
                </span>

                <span
                  className="connect__social-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>
              </a>
            )}


            {settings?.linkedin && (
              <a
                href={settings.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>
                  LinkedIn
                </span>

                <span
                  className="connect__social-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRightIcon />
                </span>
              </a>
            )}

          </div>


          {/* CONTACT BUTTON */}

          {settings?.form_enabled !== false && (
            <Link
              href="/contact"
              className="connect__button"
            >

              <span>
                Start a conversation
              </span>

              <span
                className="connect__button-icon"
                aria-hidden="true"
              >
                <ArrowUpRightIcon />
              </span>

            </Link>
          )}

        </div>


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="connect__footer">

          <span>
            AKNM.PRO
          </span>

          <span>
            Ideas · Work · People
          </span>

          <span>
            © {new Date().getFullYear()}
          </span>

        </div>

      </div>

    </section>
  );
}