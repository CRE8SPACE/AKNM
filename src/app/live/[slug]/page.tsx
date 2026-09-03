"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import "./live-replay.css";


/* =========================================================
   TYPES
   ========================================================= */

type LiveSession = {
  id: string;

  host_id: string | null;

  title: string;

  slug: string;

  description: string | null;

  status: string;

  session_type: string;

  cover_media_id: string | null;

  scheduled_at: string | null;

  started_at: string | null;

  ended_at: string | null;

  stream_url: string | null;

  replay_url: string | null;

  recording_media_id: string | null;

  featured: boolean;

  created_at: string;

  updated_at: string;
};


type MediaItem = {
  id: string;

  title: string | null;

  description: string | null;

  media_type: string;

  public_url: string | null;

  thumbnail_url: string | null;

  mime_type: string | null;

  file_size: number | null;

  width: number | null;

  height: number | null;

  duration_seconds: number | null;

  alt_text: string | null;

  created_at: string;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "long",

      day: "2-digit",

      month: "long",

      year: "numeric",
    }
  );
}


function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleString(
    "en-US",
    {
      weekday: "short",

      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    }
  );
}


function formatDuration(
  seconds: number | null
) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "";
  }

  const total =
    Math.floor(
      seconds
    );

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;


  if (hours > 0) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }


  return `${minutes}:${String(
    secs
  ).padStart(
    2,
    "0"
  )}`;
}


function formatFileSize(
  bytes: number | null
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  if (
    bytes <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;
}


/* =========================================================
   PAGE
   ========================================================= */

export default function LiveReplayPage() {
  const params =
    useParams();

  const slug =
    Array.isArray(
      params.slug
    )
      ? params.slug[0]
      : params.slug;


  const [
    session,
    setSession,
  ] =
    useState<LiveSession | null>(
      null
    );


  const [
    recording,
    setRecording,
  ] =
    useState<MediaItem | null>(
      null
    );


  const [
    cover,
    setCover,
  ] =
    useState<MediaItem | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    copied,
    setCopied,
  ] = useState(false);


  /* =======================================================
     LOAD SESSION
     ======================================================= */

  const loadPage =
    useCallback(
      async () => {

        if (!slug) {
          return;
        }


        setLoading(true);

        setError("");

        setSession(null);

        setRecording(null);

        setCover(null);


        const supabase =
          createClient();


        /*
         * ===================================================
         * LOAD ONLY PUBLISHED SESSIONS
         *
         * This is important.
         *
         * A guest should never be able to open a draft,
         * scheduled, live, ended or archived session through
         * the public replay route.
         * ===================================================
         */

        const {
          data,
          error:
            sessionError,
        } =
          await supabase
            .from(
              "live_sessions"
            )
            .select(`
              id,
              host_id,
              title,
              slug,
              description,
              status,
              session_type,
              cover_media_id,
              scheduled_at,
              started_at,
              ended_at,
              stream_url,
              replay_url,
              recording_media_id,
              featured,
              created_at,
              updated_at
            `)
            .eq(
              "slug",
              slug
            )
            .eq(
              "status",
              "published"
            )
            .single();


        if (sessionError) {

          console.error(
            "Public live replay error:",
            sessionError
          );


          setError(
            "This broadcast could not be found."
          );


          setLoading(false);

          return;
        }


        const loaded =
          data as LiveSession;


        setSession(
          loaded
        );


        /* =================================================
           RECORDING
           ================================================= */

        if (
          loaded.recording_media_id
        ) {

          const {
            data:
              recordingData,
            error:
              recordingError,
          } =
            await supabase
              .from(
                "media"
              )
              .select(`
                id,
                title,
                description,
                media_type,
                public_url,
                thumbnail_url,
                mime_type,
                file_size,
                width,
                height,
                duration_seconds,
                alt_text,
                created_at
              `)
              .eq(
                "id",
                loaded.recording_media_id
              )
              .single();


          if (
            recordingError
          ) {

            console.error(
              "Public recording error:",
              recordingError
            );

          } else {

            setRecording(
              recordingData as MediaItem
            );

          }
        }


        /* =================================================
           COVER
           ================================================= */

        if (
          loaded.cover_media_id
        ) {

          const {
            data:
              coverData,
            error:
              coverError,
          } =
            await supabase
              .from(
                "media"
              )
              .select(`
                id,
                title,
                description,
                media_type,
                public_url,
                thumbnail_url,
                mime_type,
                file_size,
                width,
                height,
                duration_seconds,
                alt_text,
                created_at
              `)
              .eq(
                "id",
                loaded.cover_media_id
              )
              .single();


          if (
            coverError
          ) {

            console.error(
              "Public cover error:",
              coverError
            );

          } else {

            setCover(
              coverData as MediaItem
            );

          }
        }


        setLoading(false);
      },
      [slug]
    );


  useEffect(() => {
    void loadPage();
  }, [
    loadPage,
  ]);


  /* =======================================================
     SHARE
     ======================================================= */

  async function handleShare() {

    try {

      if (
        navigator.share &&
        session
      ) {

        await navigator.share({
          title:
            session.title,

          text:
            session.description ||
            "Watch this broadcast on AKNM.",

          url:
            window.location.href,
        });

        return;
      }


      await navigator.clipboard.writeText(
        window.location.href
      );


      setCopied(true);


      window.setTimeout(
        () => {
          setCopied(false);
        },
        2200
      );

    } catch {
      /*
       * Native share dialog can be
       * cancelled by the visitor.
       */
    }
  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {

    return (
      <main className="live-replay-page">

        <div className="live-replay-state">

          <div className="live-replay-loader" />

          <span>
            AKNM LIVE
          </span>

          <p>
            Loading broadcast...
          </p>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR
     ======================================================= */

  if (
    !session ||
    error
  ) {

    return (
      <main className="live-replay-page">

        <header className="live-replay-nav">

          <div className="live-replay-nav__left">

            <Link
              href="/"
              className="live-replay-logo"
            >
              AKNM
            </Link>

            <span className="live-replay-nav__divider" />

            <Link
              href="/live"
              className="live-replay-nav__live"
            >
              LIVE
            </Link>

          </div>

        </header>


        <div className="live-replay-state live-replay-state--error">

          <span>
            AKNM LIVE
          </span>

          <h1>
            Broadcast unavailable.
          </h1>

          <p>
            {error ||
              "This broadcast could not be found."}
          </p>

          <Link
            href="/live"
            className="live-replay-button"
          >
            Explore AKNM Live
          </Link>

        </div>

      </main>
    );
  }


  /* =======================================================
     MEDIA URLS
     ======================================================= */

  const videoUrl =
    recording?.public_url ||
    session.replay_url ||
    null;


  const posterUrl =
    cover?.public_url ||
    recording?.thumbnail_url ||
    null;


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="live-replay-page">

      {/* =================================================
          PUBLIC NAVIGATION
          ================================================= */}

      <header className="live-replay-nav">

        <div className="live-replay-nav__left">

          <Link
            href="/"
            className="live-replay-logo"
          >
            AKNM
          </Link>


          <span className="live-replay-nav__divider" />


          <Link
            href="/live"
            className="live-replay-nav__live"
          >
            LIVE
          </Link>

        </div>


        <div className="live-replay-nav__right">

          <span className="live-replay-original">
            AKNM ORIGINAL
          </span>

        </div>

      </header>


      {/* =================================================
          HERO
          ================================================= */}

      <section className="live-replay-hero">

        <div className="live-replay-hero__glow" />


        <div className="live-replay-content">

          {/* =============================================
              CATEGORY
              ============================================= */}

          <div className="live-replay-kicker">

            <span className="live-replay-kicker__dot" />

            <span>
              AKNM LIVE REPLAY
            </span>

            <span>
              /
            </span>

            <strong>
              {session.session_type.toUpperCase()}
            </strong>

          </div>


          {/* =============================================
              TITLE
              ============================================= */}

          <h1>
            {session.title}
          </h1>


          {/* =============================================
              DATE
              ============================================= */}

          <div className="live-replay-date">

            <span>
              BROADCAST
            </span>

            <strong>
              {formatDate(
                session.started_at
              )}
            </strong>


            {session.started_at &&
              session.ended_at && (
                <>

                  <i>
                    •
                  </i>

                  <span>
                    {
                      formatDateTime(
                        session.started_at
                      ).split(
                        ","
                      )[1]?.trim()
                    }
                  </span>

                </>
              )}

          </div>

        </div>

      </section>


      {/* =================================================
          PLAYER
          ================================================= */}

      <section className="live-replay-player-section">

        <div className="live-replay-player">

          {videoUrl ? (

            <video
              className="live-replay-video"
              controls
              playsInline
              preload="metadata"
              poster={
                posterUrl ||
                undefined
              }
            >

              <source
                src={
                  videoUrl
                }
                type={
                  recording?.mime_type ||
                  undefined
                }
              />

              Your browser does not
              support video playback.

            </video>

          ) : (

            <div className="live-replay-no-video">

              <div>
                VIDEO
              </div>

              <strong>
                Replay unavailable
              </strong>

              <p>
                The recording for this
                broadcast is currently
                unavailable.
              </p>

            </div>

          )}


          {/* =============================================
              PUBLIC BRANDING
              ============================================= */}

          <div className="live-replay-player-brand">

            <span>
              AKNM
            </span>

            <small>
              aknm.pro
            </small>

          </div>

        </div>


        {/* ===============================================
            PLAYER META
            =============================================== */}

        <div className="live-replay-player-meta">

          <div>

            <span>
              STATUS
            </span>

            <strong>
              PUBLISHED
            </strong>

          </div>


          <div>

            <span>
              TYPE
            </span>

            <strong>
              {session.session_type.toUpperCase()}
            </strong>

          </div>


          {recording?.duration_seconds !==
            null &&
            recording?.duration_seconds !==
              undefined && (

            <div>

              <span>
                DURATION
              </span>

              <strong>
                {formatDuration(
                  recording.duration_seconds
                )}
              </strong>

            </div>

          )}


          {recording?.file_size !==
            null &&
            recording?.file_size !==
              undefined && (

            <div>

              <span>
                FILE
              </span>

              <strong>
                {formatFileSize(
                  recording.file_size
                )}
              </strong>

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          CONTENT
          ================================================= */}

      <section className="live-replay-body">

        <div className="live-replay-description">

          <span className="live-replay-section-label">
            ABOUT THIS BROADCAST
          </span>


          <h2>
            {session.title}
          </h2>


          {session.description ? (

            <p>
              {session.description}
            </p>

          ) : (

            <p className="is-muted">
              No description was provided
              for this broadcast.
            </p>

          )}

        </div>


        <aside className="live-replay-side">

          {/* =============================================
              COVER
              ============================================= */}

          {cover?.public_url && (

            <div className="live-replay-cover">

              <img
                src={
                  cover.public_url
                }
                alt={
                  cover.alt_text ||
                  session.title
                }
              />

            </div>

          )}


          {/* =============================================
              SHARE
              ============================================= */}

          <div className="live-replay-share">

            <span>
              SHARE THIS BROADCAST
            </span>


            <button
              type="button"
              onClick={
                handleShare
              }
            >

              {copied
                ? "Link copied"
                : "Share replay"}

              <strong>
                ↗
              </strong>

            </button>

          </div>

        </aside>

      </section>


      {/* =================================================
          BROADCAST DETAILS
          ================================================= */}

      <section className="live-replay-details">

        <div className="live-replay-details__heading">

          <span>
            BROADCAST RECORD
          </span>

          <strong>
            SESSION INFORMATION
          </strong>

        </div>


        <div className="live-replay-details__grid">

          <div>

            <span>
              SESSION TYPE
            </span>

            <strong>
              {session.session_type}
            </strong>

          </div>


          <div>

            <span>
              BROADCAST DATE
            </span>

            <strong>
              {formatDate(
                session.started_at
              )}
            </strong>

          </div>


          <div>

            <span>
              STARTED
            </span>

            <strong>
              {formatDateTime(
                session.started_at
              )}
            </strong>

          </div>


          <div>

            <span>
              ENDED
            </span>

            <strong>
              {formatDateTime(
                session.ended_at
              )}
            </strong>

          </div>


          <div>

            <span>
              SESSION
            </span>

            <strong>
              {session.slug}
            </strong>

          </div>


          <div>

            <span>
              SOURCE
            </span>

            <strong>
              AKNM LIVE
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="live-replay-footer">

        <div className="live-replay-footer__brand">

          <strong>
            AKNM
          </strong>

          <span>
            aknm.pro
          </span>

        </div>


        <div className="live-replay-footer__copy">

          <span>
            ORIGINAL BROADCAST
          </span>

          <p>
            This recording was produced and
            published through AKNM Live.
          </p>

        </div>


        <Link
          href="/live"
          className="live-replay-footer__link"
        >
          More from AKNM Live →
        </Link>

      </footer>

    </main>
  );
}