import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./Media.css";


/* =========================================================
   TYPES
   ========================================================= */

type MediaItem = {
  id: string;

  title: string | null;

  description: string | null;

  media_type: string;

  public_url: string | null;

  thumbnail_url: string | null;

  mime_type: string | null;

  duration_seconds: number | null;

  alt_text: string | null;

  created_at: string;

  category_id: string | null;
};


/* =========================================================
   ICONS
   ========================================================= */

/**
 * AKNM.PRO Header ArrowUpRight icon.
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
      className="media__arrow-icon"
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


/**
 * AKNM.PRO Media Play icon.
 *
 * SVG version of the play button.
 */
function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="media__play-icon"
    >
      <path
        d="M9 6.5L17 12L9 17.5V6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatDuration(
  seconds: number | null
) {
  if (
    seconds === null ||
    !Number.isFinite(seconds)
  ) {
    return null;
  }

  const totalSeconds =
    Math.floor(seconds);

  const minutes =
    Math.floor(
      totalSeconds / 60
    );

  const remainingSeconds =
    totalSeconds % 60;

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function Media() {
  const supabase =
    await createClient();


  /* =======================================================
     LATEST VIDEOS
     ======================================================= */

  const {
    data,
    error,
  } = await supabase
    .from("media")
    .select(`
      id,
      title,
      description,
      media_type,
      public_url,
      thumbnail_url,
      mime_type,
      duration_seconds,
      alt_text,
      created_at,
      category_id
    `)
    .eq(
      "media_type",
      "video"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(5);


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    console.error(
      "Landing page latest media error:",
      error
    );
  }


  /* =======================================================
     VALUES
     ======================================================= */

  const mediaItems =
    (data ?? []) as MediaItem[];


  return (
    <section
      className="media"
    >

      <div
        className="media__container"
      >


        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className="media__header"
        >

          <div
            className="media__eyebrow"
          >

            <span
              className="media__line"
            />

            <span>
              Latest Media
            </span>

          </div>


          <div
            className="media__header-right"
          >

            <div>

              <h2>
                See what&apos;s
                <br />
                happening.
              </h2>

              <p
                className="media__header-description"
              >
                The latest videos from my
                work, ideas, experiences and
                life.
              </p>

            </div>


            <Link
              href="/media"
              className="media__view-all"
            >

              <span>
                View all media
              </span>

              <span
                className="media__view-all-icon"
                aria-hidden="true"
              >
                <ArrowUpRightIcon />
              </span>

            </Link>

          </div>

        </div>


        {/* =================================================
            MEDIA
            ================================================= */}

        {mediaItems.length > 0 ? (

          <div
            className="media__grid"
          >

            {mediaItems.map(
              (item, index) => {

                const duration =
                  formatDuration(
                    item.duration_seconds
                  );


                const title =
                  item.title?.trim() ||
                  "Untitled video";


                const description =
                  item.description?.trim() ||
                  "A video from AKNM.";


                const destination =
                  item.public_url ||
                  "/media";


                return (
                  <a
                    key={item.id}
                    href={destination}
                    className={`
                      media__card
                      ${
                        index === 0
                          ? "media__card--featured"
                          : ""
                      }
                    `}
                    target={
                      item.public_url
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      item.public_url
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >


                    {/* ===================================
                        VISUAL
                        =================================== */}

                    <div
                      className="media__visual"
                    >

                      {item.thumbnail_url ? (

                        <img
                          src={
                            item.thumbnail_url
                          }
                          alt={
                            item.alt_text ||
                            title
                          }
                        />

                      ) : (

                        <div
                          className="media__placeholder"
                        >

                          <div
                            className="media__placeholder-glow"
                          />

                          <span
                            className="media__placeholder-mark"
                          >
                            AKNM
                          </span>

                          <span
                            className="media__placeholder-label"
                          >
                            VIDEO
                          </span>

                        </div>

                      )}


                      <div
                        className="media__overlay"
                      />


                      {/* =================================
                          PLAY
                          ================================= */}

                      <div
                        className="media__play"
                        aria-hidden="true"
                      >

                        <PlayIcon />

                      </div>


                      {/* =================================
                          TYPE
                          ================================= */}

                      <span
                        className="media__type"
                      >
                        VIDEO
                      </span>


                      {/* =================================
                          DURATION
                          ================================= */}

                      {duration && (

                        <span
                          className="media__duration"
                        >
                          {duration}
                        </span>

                      )}

                    </div>


                    {/* ===================================
                        CONTENT
                        =================================== */}

                    <div
                      className="media__content"
                    >

                      <div
                        className="media__meta"
                      >

                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span>
                          {formatDate(
                            item.created_at
                          )}
                        </span>

                      </div>


                      <h3>
                        {title}
                      </h3>


                      <p>
                        {description}
                      </p>


                      {/* =================================
                          AKNM HEADER SVG ARROW
                          ================================= */}

                      <span
                        className="media__arrow"
                        aria-hidden="true"
                      >
                        <ArrowUpRightIcon />
                      </span>

                    </div>

                  </a>
                );
              }
            )}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div
            className="media__empty"
          >

            <div
              className="media__empty-mark"
            >
              +
            </div>

            <span>
              LATEST MEDIA
            </span>

            <h3>
              Nothing to show yet.
            </h3>

            <p>
              New videos will appear here
              as they are published.
            </p>

          </div>

        )}


        {/* =================================================
            FOOTER
            ================================================= */}

        <div
          className="media__footer"
        >

          <span>
            Latest 5 videos
          </span>


          <Link
            href="/media"
          >

            <span>
              Explore AKNM Media
            </span>

            <span
              aria-hidden="true"
            >
              <ArrowUpRightIcon />
            </span>

          </Link>

        </div>

      </div>

    </section>
  );
}