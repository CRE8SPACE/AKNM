"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { createClient } from "@/lib/supabase/client";

import "./live.css";


/* =========================================================
   TYPES
   ========================================================= */

type LiveSessionStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "ended"
  | "published"
  | "cancelled"
  | "archived";

type LiveSession = {
  id: string;

  host_id: string | null;

  title: string;

  slug: string;

  description: string | null;

  status: LiveSessionStatus | string;

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


type SessionWithMedia = LiveSession & {
  cover?: MediaItem | null;

  recording?: MediaItem | null;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatScheduleDate(
  value: string | null
) {
  if (!value) {
    return "COMING SOON";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).toUpperCase();
}


function formatScheduleTime(
  value: string | null
) {
  if (!value) {
    return "";
  }

  return new Date(
    value
  ).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


function formatRecordedDate(
  value: string | null
) {
  if (!value) {
    return "RECORDED";
  }

  return new Date(
    value
  ).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).toUpperCase();
}


function formatSessionType(
  value: string
) {
  if (!value) {
    return "LIVE";
  }

  return value
    .replace(
      /[-_]/g,
      " "
    )
    .toUpperCase();
}


function getSessionDescription(
  session: LiveSession
) {
  return (
    session.description?.trim() ||
    "Conversations, interviews, events and experiences from AKNM Live."
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function LivePage() {

  const [
    sessions,
    setSessions,
  ] =
    useState<SessionWithMedia[]>(
      []
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
    refreshKey,
    setRefreshKey,
  ] = useState(0);


  /* =======================================================
     LOAD LIVE SESSIONS
     ======================================================= */

  const loadSessions =
    useCallback(
      async () => {

        setLoading(true);

        setError("");

        const supabase =
          createClient();


        /*
         * We deliberately load only public-facing
         * lifecycle states.
         *
         * Draft/private sessions never reach
         * the public Live page.
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
            .in(
              "status",
              [
                "live",
                "scheduled",
                "published",
              ]
            )
            .order(
              "featured",
              {
                ascending:
                  false,
              }
            )
            .order(
              "scheduled_at",
              {
                ascending:
                  true,
                nullsFirst:
                  false,
              }
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            );


        if (sessionError) {

          console.error(
            "Public live sessions error:",
            sessionError
          );

          setError(
            sessionError.message ||
              "Could not load AKNM Live."
          );

          setSessions([]);

          setLoading(false);

          return;
        }


        const loaded =
          (data ??
            []) as LiveSession[];


        /*
         * Collect media IDs.
         */

        const coverIds =
          loaded
            .map(
              (
                session
              ) =>
                session.cover_media_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            );


        const recordingIds =
          loaded
            .map(
              (
                session
              ) =>
                session.recording_media_id
            )
            .filter(
              (
                id
              ): id is string =>
                Boolean(id)
            );


        const mediaIds =
          Array.from(
            new Set([
              ...coverIds,
              ...recordingIds,
            ])
          );


        let mediaMap =
          new Map<
            string,
            MediaItem
          >();


        if (
          mediaIds.length >
          0
        ) {

          const {
            data:
              mediaData,
            error:
              mediaError,
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
                file_size,
                width,
                height,
                duration_seconds,
                alt_text,
                created_at
              `)
              .in(
                "id",
                mediaIds
              );


          if (mediaError) {

            console.error(
              "Public live media error:",
              mediaError
            );

          } else {

            mediaMap =
              new Map(
                (
                  (mediaData ??
                    []) as MediaItem[]
                ).map(
                  (
                    item
                  ) => [
                    item.id,
                    item,
                  ]
                )
              );

          }
        }


        const enriched =
          loaded.map(
            (
              session
            ) => ({
              ...session,

              cover:
                session.cover_media_id
                  ? mediaMap.get(
                      session.cover_media_id
                    ) ??
                    null
                  : null,

              recording:
                session.recording_media_id
                  ? mediaMap.get(
                      session.recording_media_id
                    ) ??
                    null
                  : null,
            })
          );


        setSessions(
          enriched
        );

        setLoading(false);

      },
      []
    );


  useEffect(() => {

    void loadSessions();

  }, [
    loadSessions,
    refreshKey,
  ]);


  /* =======================================================
     OPTIONAL LIVE REFRESH
     ======================================================= */

  useEffect(() => {

    const interval =
      window.setInterval(
        () => {
          setRefreshKey(
            (
              current
            ) =>
              current + 1
          );
        },
        30_000
      );


    return () => {
      window.clearInterval(
        interval
      );
    };

  }, []);


  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const liveSession =
    useMemo(
      () =>
        sessions.find(
          (
            session
          ) =>
            session.status ===
            "live"
        ) ??
        null,
      [
        sessions,
      ]
    );


  const upcomingSessions =
    useMemo(
      () =>
        sessions
          .filter(
            (
              session
            ) =>
              session.status ===
              "scheduled"
          )
          .sort(
            (
              a,
              b
            ) => {

              if (
                !a.scheduled_at
              ) {
                return 1;
              }

              if (
                !b.scheduled_at
              ) {
                return -1;
              }

              return (
                new Date(
                  a.scheduled_at
                ).getTime() -
                new Date(
                  b.scheduled_at
                ).getTime()
              );

            }
          ),
      [
        sessions,
      ]
    );


  const recordedSessions =
    useMemo(
      () =>
        sessions
          .filter(
            (
              session
            ) =>
              session.status ===
              "published"
          )
          .sort(
            (
              a,
              b
            ) => {

              const aDate =
                a.ended_at ||
                a.updated_at;

              const bDate =
                b.ended_at ||
                b.updated_at;

              return (
                new Date(
                  bDate
                ).getTime() -
                new Date(
                  aDate
                ).getTime()
              );

            }
          ),
      [
        sessions,
      ]
    );


  const nextSession =
    upcomingSessions[0] ??
    null;


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <Header />

      <main className="live-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="live-page__hero">

          <div className="live-page__container">

            <div className="live-page__eyebrow">

              <span className="live-page__line" />

              <span>
                AKNM Live
              </span>

            </div>


            <div className="live-page__hero-content">

              <div>

                <div className="live-page__status">

                  <span
                    className={`
                      live-page__status-dot
                      ${
                        liveSession
                          ? "is-live"
                          : ""
                      }
                    `}
                  />

                  <span>
                    {liveSession
                      ? "LIVE NOW"
                      : "LIVE PLATFORM"}
                  </span>

                </div>


                <h1>
                  Conversations
                  <br />
                  live.
                </h1>

              </div>


              <p>
                Interviews, conversations,
                events and experiences —
                broadcast live from AKNM
                and preserved as media
                afterwards.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            LIVE PLAYER
            ================================================= */}

        <section className="live-page__player-section">

          <div className="live-page__container">

            <div className="live-page__section-label">

              <span>
                AKNM Live
              </span>

              <span>
                {liveSession
                  ? "ON AIR"
                  : "OFFLINE"}
              </span>

            </div>


            <div
              className={`
                live-page__player
                ${
                  liveSession
                    ? "is-live"
                    : ""
                }
              `}
            >

              {liveSession ? (

                <>
                  <div className="live-page__player-background">

                    {liveSession.cover?.public_url ? (

                      <img
                        src={
                          liveSession
                            .cover
                            .public_url
                        }
                        alt={
                          liveSession
                            .cover
                            .alt_text ||
                          liveSession.title
                        }
                      />

                    ) : (

                      <div className="live-page__player-background-default">

                        <div className="live-page__player-ring" />

                        <span>
                          AKNM
                        </span>

                      </div>

                    )}

                  </div>


                  <div className="live-page__live-overlay">

                    <span className="live-page__live-badge">

                      <i />

                      LIVE NOW

                    </span>


                    <div>

                      <span>
                        {
                          formatSessionType(
                            liveSession.session_type
                          )
                        }
                      </span>

                      <h2>
                        {
                          liveSession.title
                        }
                      </h2>

                      <p>
                        {
                          getSessionDescription(
                            liveSession
                          )
                        }
                      </p>

                    </div>

                  </div>


                  <div className="live-page__player-controls">

                    <Link
                      href={`/live/${liveSession.slug}`}
                      className="live-page__watch-live"
                    >
                      Watch live
                      <span>
                        ↗
                      </span>
                    </Link>

                    <div className="live-page__progress">
                      <span />
                    </div>

                    <span>
                      LIVE
                    </span>

                  </div>
                </>

              ) : (

                <>
                  <div className="live-page__player-background">

                    <div className="live-page__player-ring" />

                    <span>
                      AKNM
                    </span>

                  </div>


                  <div className="live-page__offline">

                    <span>
                      We&apos;re not live right now.
                    </span>

                    <strong>
                      {nextSession
                        ? "The next conversation is coming soon."
                        : "Check back for the next conversation."}
                    </strong>

                  </div>


                  <div className="live-page__player-controls">

                    <span className="live-page__player-disabled">
                      OFFLINE
                    </span>

                    <div className="live-page__progress">
                      <span />
                    </div>

                    <span>
                      AKNM LIVE
                    </span>

                  </div>
                </>

              )}

            </div>


            <div className="live-page__player-footer">

              <div>

                <span>
                  NEXT LIVE EVENT
                </span>

                <strong>
                  {nextSession
                    ? nextSession.title
                    : "Coming soon"}
                </strong>

                {nextSession?.scheduled_at && (

                  <small>
                    {formatScheduleDate(
                      nextSession.scheduled_at
                    )}

                    {" · "}

                    {formatScheduleTime(
                      nextSession.scheduled_at
                    )}
                  </small>

                )}

              </div>


              {nextSession ? (

                <button
                  type="button"
                  onClick={() => {
                    window.alert(
                      "Reminder notifications will be connected to this event shortly."
                    );
                  }}
                >
                  Get notified
                  <span>
                    ↗
                  </span>
                </button>

              ) : (

                <span className="live-page__player-footer-empty">
                  No event scheduled
                </span>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            UPCOMING
            ================================================= */}

        <section className="live-page__upcoming">

          <div className="live-page__container">

            <div className="live-page__section-heading">

              <div>

                <span>
                  Schedule
                </span>

                <h2>
                  Upcoming.
                </h2>

              </div>

              <span>
                {String(
                  upcomingSessions.length
                ).padStart(
                  2,
                  "0"
                )}
              </span>

            </div>


            {loading ? (

              <div className="live-page__empty">

                <span>
                  LOADING
                </span>

                <p>
                  Loading the AKNM Live schedule...
                </p>

              </div>

            ) : upcomingSessions.length ===
              0 ? (

              <div className="live-page__empty">

                <span>
                  NO SCHEDULED EVENTS
                </span>

                <p>
                  There are currently no upcoming
                  live broadcasts scheduled.
                </p>

              </div>

            ) : (

              <div className="live-page__events">

                {upcomingSessions.map(
                  (
                    event
                  ) => (

                    <article
                      key={
                        event.id
                      }
                      className="live-page__event"
                    >

                      <div className="live-page__event-date">

                        <span>
                          {formatScheduleDate(
                            event.scheduled_at
                          )}
                        </span>

                        {event.scheduled_at && (

                          <small>
                            {formatScheduleTime(
                              event.scheduled_at
                            )}
                          </small>

                        )}

                      </div>


                      <div className="live-page__event-info">

                        <span>
                          {formatSessionType(
                            event.session_type
                          )}
                        </span>

                        <h3>
                          {event.title}
                        </h3>

                        <p>
                          {getSessionDescription(
                            event
                          )}
                        </p>

                      </div>


                      <button
                        type="button"
                        className="live-page__remind"
                        onClick={() => {
                          window.alert(
                            "Reminder notifications will be connected to this event shortly."
                          );
                        }}
                      >
                        Remind me
                        <span>
                          ↗
                        </span>
                      </button>

                    </article>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            THE EXPERIENCE
            ================================================= */}

        <section className="live-page__experience">

          <div className="live-page__container">

            <div className="live-page__experience-content">

              <span>
                More than a livestream
              </span>

              <h2>
                A conversation
                becomes a story.
              </h2>

              <p>
                Every live conversation can
                become something more — a
                recording, a podcast, an article,
                a short clip, photographs and a
                permanent part of the AKNM media
                library.
              </p>

            </div>


            <div className="live-page__pipeline">

              <div>
                <span>
                  01
                </span>

                <strong>
                  LIVE
                </strong>

                <small>
                  Broadcast
                </small>
              </div>


              <div>
                <span>
                  02
                </span>

                <strong>
                  RECORD
                </strong>

                <small>
                  Capture
                </small>
              </div>


              <div>
                <span>
                  03
                </span>

                <strong>
                  EDIT
                </strong>

                <small>
                  Process
                </small>
              </div>


              <div>
                <span>
                  04
                </span>

                <strong>
                  PUBLISH
                </strong>

                <small>
                  Media
                </small>
              </div>


              <div>
                <span>
                  05
                </span>

                <strong>
                  SHARE
                </strong>

                <small>
                  Distribution
                </small>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            RECORDED
            ================================================= */}

        <section className="live-page__recorded">

          <div className="live-page__container">

            <div className="live-page__section-heading">

              <div>

                <span>
                  Archive
                </span>

                <h2>
                  Recent lives.
                </h2>

              </div>

              <Link
                href="/media"
              >
                View media
                <span>
                  ↗
                </span>
              </Link>

            </div>


            {loading ? (

              <div className="live-page__empty">

                <span>
                  LOADING
                </span>

                <p>
                  Loading the AKNM Live archive...
                </p>

              </div>

            ) : recordedSessions.length ===
              0 ? (

              <div className="live-page__empty">

                <span>
                  NO PUBLISHED RECORDINGS
                </span>

                <p>
                  Published AKNM Live recordings
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="live-page__recorded-grid">

                {recordedSessions.map(
                  (
                    event
                  ) => (

                    <article
                      key={
                        event.id
                      }
                      className="live-page__recorded-card"
                    >

                      <div className="live-page__recorded-visual">

                        {(
                          event.cover?.public_url ||
                          event.recording?.thumbnail_url
                        ) ? (

                          <img
                            src={
                              event.cover?.public_url ||
                              event.recording?.thumbnail_url ||
                              ""
                            }
                            alt={
                              event.cover?.alt_text ||
                              event.title
                            }
                          />

                        ) : (

                          <span>
                            AKNM
                          </span>

                        )}


                        <Link
                          href={`/live/${event.slug}`}
                          aria-label={`Watch ${event.title}`}
                        >
                          ▶
                        </Link>

                      </div>


                      <div className="live-page__recorded-body">

                        <div>

                          <span>
                            RECORDED
                          </span>

                          <small>
                            {formatRecordedDate(
                              event.ended_at ||
                              event.updated_at
                            )}
                          </small>

                        </div>


                        <h3>
                          {event.title}
                        </h3>


                        <p>
                          {getSessionDescription(
                            event
                          )}
                        </p>


                        <Link
                          href={`/live/${event.slug}`}
                        >
                          Watch recording
                          <span>
                            ↗
                          </span>
                        </Link>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            GUEST CTA
            ================================================= */}

        <section className="live-page__guest">

          <div className="live-page__container">

            <div className="live-page__guest-content">

              <span>
                Have a story?
              </span>

              <h2>
                Let&apos;s have
                <br />
                a conversation.
              </h2>

              <p>
                AKNM Live will feature
                conversations with
                entrepreneurs, creators,
                artists, innovators and
                people doing interesting
                work.
              </p>

              <Link
                href="/contact"
              >
                Get in touch
                <span>
                  ↗
                </span>
              </Link>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}