import Link from "next/link";

import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import "./post.css";


/* =========================================================
   TYPES
   ========================================================= */

type VideoMedia = {

  id: string;

  title: string | null;

  description: string | null;

  media_type: "video";

  public_url: string | null;

  thumbnail_url: string | null;

  mime_type: string | null;

  duration_seconds: number | null;

  created_at: string;

};


type MediaPageProps = {

  params: Promise<{
    id: string;
  }>;

};


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value: string
): string {

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(
      new Date(value)
    )
    .toUpperCase();

}


/* =========================================================
   DURATION
   ========================================================= */

function formatDuration(
  seconds: number | null
): string {

  if (
    seconds === null ||
    !Number.isFinite(seconds)
  ) {

    return "";

  }


  const total =
    Math.round(
      seconds
    );


  const hours =
    Math.floor(
      total / 3600
    );


  const minutes =
    Math.floor(
      (
        total % 3600
      ) / 60
    );


  const remaining =
    total % 60;


  if (
    hours > 0
  ) {

    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;

  }


  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function MediaVideoPage({
  params,
}: MediaPageProps) {


  /* =======================================================
     PARAMS
     ======================================================= */

  const {
    id,
  } =
    await params;


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    await createClient();


  /* =======================================================
     FETCH CURRENT VIDEO
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase
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
        created_at
      `)
      .eq(
        "id",
        id
      )
      .eq(
        "media_type",
        "video"
      )
      .maybeSingle();


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {

    console.error(
      "PUBLIC VIDEO FETCH ERROR:",
      error
    );

    throw new Error(
      "Could not load this video."
    );

  }


  /* =======================================================
     NOT FOUND
     ======================================================= */

  if (
    !data
  ) {

    notFound();

  }


  const video =
    data as VideoMedia;


  /* =======================================================
     VIDEO URL PROTECTION
     ======================================================= */

  if (
    !video.public_url
  ) {

    throw new Error(
      "This video does not have a playable media URL."
    );

  }


  /* =======================================================
     FETCH RECOMMENDATIONS
     ======================================================= */

  const {
    data:
      recommendationData,
    error:
      recommendationError,
  } =
    await supabase
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
        created_at
      `)
      .eq(
        "media_type",
        "video"
      )
      .neq(
        "id",
        video.id
      )
      .not(
        "public_url",
        "is",
        null
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(
        6
      );


  if (
    recommendationError
  ) {

    console.error(
      "PUBLIC VIDEO RECOMMENDATIONS ERROR:",
      recommendationError
    );

  }


  const recommendations: VideoMedia[] =
    (
      recommendationData ??
      []
    )
      .filter(
        (
          item
        ) =>
          item.media_type ===
          "video" &&
          Boolean(
            item.public_url
          )
      )
      .map(
        (
          item
        ) => ({

          id:
            item.id,

          title:
            item.title,

          description:
            item.description,

          media_type:
            "video",

          public_url:
            item.public_url,

          thumbnail_url:
            item.thumbnail_url,

          mime_type:
            item.mime_type,

          duration_seconds:
            item.duration_seconds,

          created_at:
            item.created_at,

        })
      );


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <main className="media-video">


      {/* =================================================
          NAVIGATION
          ================================================= */}

      <nav className="media-video__nav">

        <div className="media-video__nav-inner">

          <Link
            href="/media"
            className="media-video__back"
          >

            <span>
              ←
            </span>

            <span>
              All Media
            </span>

          </Link>


          <Link
            href="/"
            className="media-video__brand"
          >
            AKNM.PRO
          </Link>

        </div>

      </nav>



      {/* =================================================
          HEADER
          ================================================= */}

      <header className="media-video__header">

        <div className="media-video__eyebrow">

          <span className="media-video__line" />

          <span>
            AKNM Media
          </span>

        </div>


        <div className="media-video__meta">

          <span>
            VIDEO
          </span>

          <span>
            /
          </span>

          <span>
            {
              formatDate(
                video.created_at
              )
            }
          </span>

          {video.duration_seconds !== null && (

            <>
              <span>
                /
              </span>

              <span>
                {
                  formatDuration(
                    video.duration_seconds
                  )
                }
              </span>
            </>

          )}

        </div>


        <h1>
          {
            video.title ||
            "Untitled video"
          }
        </h1>


        {video.description && (

          <p>

            {
              video.description
            }

          </p>

        )}

      </header>



      {/* =================================================
          PLAYER
          ================================================= */}

      <section className="media-video__player-section">

        <div className="media-video__player">

          <video
            controls
            playsInline
            preload="metadata"
            poster={
              video.thumbnail_url ||
              undefined
            }
          >

            <source
              src={
                video.public_url
              }
              type={
                video.mime_type ||
                "video/mp4"
              }
            />

            Your browser does not
            support video playback.

          </video>

        </div>

      </section>



      {/* =================================================
          VIDEO INFORMATION
          ================================================= */}

      <section className="media-video__information">

        <div className="media-video__information-label">
          ABOUT THIS VIDEO
        </div>


        <div className="media-video__information-content">

          <div>

            <span>
              AKNM.PRO
            </span>

            <strong>
              VIDEO
            </strong>

          </div>


          {video.description && (

            <p>

              {
                video.description
              }

            </p>

          )}

        </div>

      </section>



      {/* =================================================
          RECOMMENDATIONS
          ================================================= */}

      {recommendations.length > 0 && (

        <section
          className="media-video__recommendations"
        >

          <div
            className="media-video__section-heading"
          >

            <div>

              <span>
                Continue watching
              </span>

              <h2>
                More from AKNM.
              </h2>

            </div>


            <span>

              {
                String(
                  recommendations.length
                ).padStart(
                  2,
                  "0"
                )
              }

            </span>

          </div>


          <div
            className="media-video__recommendation-grid"
          >

            {recommendations.map(
              (
                recommendation
              ) => (

                <Link
                  key={
                    recommendation.id
                  }
                  href={
                    `/media/${recommendation.id}`
                  }
                  className="media-video__recommendation"
                >

                  <div
                    className="media-video__recommendation-visual"
                  >

                    {recommendation.thumbnail_url ? (

                      <img
                        src={
                          recommendation.thumbnail_url
                        }
                        alt={
                          recommendation.title ||
                          "AKNM video"
                        }
                      />

                    ) : (

                      <div
                        className="
                          media-video__recommendation-placeholder
                        "
                      >

                        <span>
                          AKNM
                        </span>

                      </div>

                    )}


                    <div
                      className="
                        media-video__recommendation-shade
                      "
                    />


                    <span
                      className="
                        media-video__recommendation-play
                      "
                    >
                      ▶
                    </span>


                    {formatDuration(
                      recommendation.duration_seconds
                    ) && (

                      <span
                        className="
                          media-video__recommendation-duration
                        "
                      >

                        {
                          formatDuration(
                            recommendation.duration_seconds
                          )
                        }

                      </span>

                    )}

                  </div>


                  <div
                    className="
                      media-video__recommendation-content
                    "
                  >

                    <div
                      className="
                        media-video__recommendation-meta
                      "
                    >

                      <span>
                        VIDEO
                      </span>

                      <span>
                        {
                          formatDate(
                            recommendation.created_at
                          )
                        }
                      </span>

                    </div>


                    <h3>

                      {
                        recommendation.title ||
                        "Untitled video"
                      }

                    </h3>


                    {recommendation.description && (

                      <p>

                        {
                          recommendation.description
                        }

                      </p>

                    )}

                  </div>

                </Link>

              )
            )}

          </div>

        </section>

      )}



      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="media-video__footer">

        <div
          className="media-video__footer-line"
        />


        <div
          className="media-video__footer-meta"
        >

          <span>
            AKNM.PRO
          </span>

          <span>
            MEDIA
          </span>

        </div>


        <Link
          href="/media"
          className="media-video__footer-link"
        >

          Explore all videos

          <span>
            →
          </span>

        </Link>

      </footer>

    </main>

  );

}