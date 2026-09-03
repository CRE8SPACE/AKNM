import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./live.css";


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


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}


function formatSchedule(
  value: string | null
) {
  if (!value) {
    return "Not scheduled";
  }

  const date = formatDate(value);
  const time = formatTime(value);

  return `${date} / ${time}`;
}


function getStatusLabel(
  status: string
) {
  switch (
    status.toLowerCase()
  ) {
    case "live":
      return "LIVE";

    case "scheduled":
      return "SCHEDULED";

    case "draft":
      return "DRAFT";

    case "ended":
      return "ENDED";

    case "cancelled":
      return "CANCELLED";

    default:
      return status.toUpperCase();
  }
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function LivePage() {

  const supabase =
    await createClient();


  /* =======================================================
     LOAD LIVE SESSIONS
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase
      .from("live_sessions")
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
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (error) {
    console.error(
      "Live sessions error:",
      {
        message:
          error.message,

        code:
          error.code,

        details:
          error.details,

        hint:
          error.hint,
      }
    );
  }


  const sessions =
    (data ??
      []) as LiveSession[];


  /* =======================================================
     CATEGORISE
     ======================================================= */

  const liveSessions =
    sessions.filter(
      (session) =>
        session.status ===
        "live"
    );


  const scheduledSessions =
    sessions.filter(
      (session) =>
        session.status ===
        "scheduled"
    );


  const draftSessions =
    sessions.filter(
      (session) =>
        session.status ===
        "draft"
    );


  const endedSessions =
    sessions.filter(
      (session) =>
        session.status ===
        "ended"
    );


  /* =======================================================
     RECENT SESSIONS
     ======================================================= */

  const recentSessions =
    [...sessions]
      .filter(
        (session) =>
          session.status ===
            "ended" ||
          session.status ===
            "live" ||
          session.status ===
            "scheduled"
      )
      .slice(
        0,
        8
      );


  return (
    <main className="live-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="live-header">

        <div className="live-header__intro">

          <span className="live-header__eyebrow">
            AKNM STUDIO / LIVE
          </span>

          <h1>
            Live.
          </h1>

          <p>
            Broadcast conversations, events and
            experiences directly through AKNM.PRO.
          </p>

        </div>


        <div className="live-header__actions">

          <Link
            href="/studio/live/new"
            className="live-header__secondary"
          >
            <span>
              Schedule Live
            </span>

            <span>
              +
            </span>
          </Link>


          <Link
            href="/studio/live/new"
            className="live-header__primary"
          >
            <span>
              Start Live
            </span>

            <span>
              ↗
            </span>
          </Link>

        </div>

      </header>


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (

        <div className="live-alert">

          <div>

            <strong>
              Could not load live sessions.
            </strong>

            <p>
              {error.message}
            </p>

          </div>

        </div>

      )}


      {/* =================================================
          OVERVIEW
          ================================================= */}

      <section className="live-overview">

        <div className="live-stat live-stat--live">

          <span className="live-stat__label">
            LIVE NOW
          </span>

          <strong>
            {liveSessions.length}
          </strong>

          <small>
            Active broadcasts
          </small>

        </div>


        <div className="live-stat">

          <span className="live-stat__label">
            SCHEDULED
          </span>

          <strong>
            {scheduledSessions.length}
          </strong>

          <small>
            Upcoming broadcasts
          </small>

        </div>


        <div className="live-stat">

          <span className="live-stat__label">
            DRAFTS
          </span>

          <strong>
            {draftSessions.length}
          </strong>

          <small>
            Sessions in preparation
          </small>

        </div>


        <div className="live-stat">

          <span className="live-stat__label">
            ENDED
          </span>

          <strong>
            {endedSessions.length}
          </strong>

          <small>
            Completed sessions
          </small>

        </div>

      </section>


      {/* =================================================
          LIVE NOW
          ================================================= */}

      <section className="live-section">

        <div className="live-section__header">

          <div>

            <span className="live-section__eyebrow">
              BROADCAST
            </span>

            <h2>
              Live now
            </h2>

          </div>


          <span className="live-section__count">
            {liveSessions.length} ACTIVE
          </span>

        </div>


        {liveSessions.length === 0 ? (

          <div className="live-empty">

            <div className="live-empty__indicator">
              <span />
            </div>

            <div className="live-empty__content">

              <h3>
                Nothing is live right now.
              </h3>

              <p>
                Start a live session when you are
                ready to broadcast.
              </p>

            </div>


            <Link
              href="/studio/live/new"
              className="live-empty__action"
            >
              Start a Live Session

              <span>
                ↗
              </span>
            </Link>

          </div>

        ) : (

          <div className="live-live-grid">

            {liveSessions.map(
              (session) => (

                <article
                  key={session.id}
                  className="live-live-card"
                >

                  <div className="live-live-card__top">

                    <span className="live-live-card__signal">
                      <span />
                      LIVE
                    </span>

                    <span>
                      {session.session_type}
                    </span>

                  </div>


                  <div className="live-live-card__body">

                    <h3>
                      {session.title}
                    </h3>

                    {session.description && (
                      <p>
                        {session.description}
                      </p>
                    )}

                  </div>


                  <div className="live-live-card__footer">

                    <span>
                      Started{" "}
                      {formatTime(
                        session.started_at
                      )}
                    </span>


                    <Link
                      href={`/studio/live/${session.id}`}
                    >
                      Open Live

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

      </section>


      {/* =================================================
          SCHEDULED
          ================================================= */}

      <section className="live-section">

        <div className="live-section__header">

          <div>

            <span className="live-section__eyebrow">
              UPCOMING
            </span>

            <h2>
              Scheduled
            </h2>

          </div>


          <span className="live-section__count">
            {scheduledSessions.length} SCHEDULED
          </span>

        </div>


        {scheduledSessions.length === 0 ? (

          <div className="live-simple-empty">

            <span>
              No upcoming live sessions.
            </span>

            <Link
              href="/studio/live/new"
            >
              Schedule one

              <span>
                ↗
              </span>
            </Link>

          </div>

        ) : (

          <div className="live-list">

            {scheduledSessions.map(
              (
                session,
                index
              ) => (

                <article
                  key={session.id}
                  className="live-list-item"
                >

                  <div className="live-list-item__number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div className="live-list-item__main">

                    <Link
                      href={`/studio/live/${session.id}`}
                      className="live-list-item__title"
                    >
                      {session.title}
                    </Link>


                    <div className="live-list-item__meta">

                      <span>
                        {session.session_type}
                      </span>

                      <span>
                        /
                      </span>

                      <span>
                        {formatSchedule(
                          session.scheduled_at
                        )}
                      </span>

                      {session.featured && (
                        <>
                          <span>
                            /
                          </span>

                          <span className="live-featured">
                            FEATURED
                          </span>
                        </>
                      )}

                    </div>

                  </div>


                  <div className="live-list-item__status live-list-item__status--scheduled">
                    {getStatusLabel(
                      session.status
                    )}
                  </div>


                  <Link
                    href={`/studio/live/${session.id}/edit`}
                    className="live-list-item__edit"
                  >
                    Edit
                  </Link>


                  <Link
                    href={`/studio/live/${session.id}`}
                    className="live-list-item__arrow"
                    aria-label={`Open ${session.title}`}
                  >
                    ↗
                  </Link>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          DRAFTS
          ================================================= */}

      <section className="live-section">

        <div className="live-section__header">

          <div>

            <span className="live-section__eyebrow">
              PREPARATION
            </span>

            <h2>
              Drafts
            </h2>

          </div>


          <span className="live-section__count">
            {draftSessions.length} DRAFTS
          </span>

        </div>


        {draftSessions.length === 0 ? (

          <div className="live-simple-empty">

            <span>
              No live sessions in draft.
            </span>

            <Link
              href="/studio/live/new"
            >
              Create one

              <span>
                ↗
              </span>
            </Link>

          </div>

        ) : (

          <div className="live-list">

            {draftSessions.map(
              (
                session,
                index
              ) => (

                <article
                  key={session.id}
                  className="live-list-item"
                >

                  <div className="live-list-item__number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div className="live-list-item__main">

                    <Link
                      href={`/studio/live/${session.id}/edit`}
                      className="live-list-item__title"
                    >
                      {session.title}
                    </Link>


                    <div className="live-list-item__meta">

                      <span>
                        {session.session_type}
                      </span>

                      <span>
                        /
                      </span>

                      <span>
                        Created{" "}
                        {formatDate(
                          session.created_at
                        )}
                      </span>

                    </div>

                  </div>


                  <div className="live-list-item__status live-list-item__status--draft">
                    DRAFT
                  </div>


                  <Link
                    href={`/studio/live/${session.id}/edit`}
                    className="live-list-item__edit"
                  >
                    Continue
                  </Link>


                  <Link
                    href={`/studio/live/${session.id}`}
                    className="live-list-item__arrow"
                    aria-label={`Open ${session.title}`}
                  >
                    ↗
                  </Link>

                </article>

              )
            )}

          </div>

        )}

      </section>


      {/* =================================================
          RECENT / ENDED
          ================================================= */}

      <section className="live-section live-section--last">

        <div className="live-section__header">

          <div>

            <span className="live-section__eyebrow">
              HISTORY
            </span>

            <h2>
              Recent sessions
            </h2>

          </div>


          <span className="live-section__count">
            {endedSessions.length} ENDED
          </span>

        </div>


        {endedSessions.length === 0 ? (

          <div className="live-simple-empty">

            <span>
              Completed live sessions will appear here.
            </span>

          </div>

        ) : (

          <div className="live-list">

            {endedSessions
              .slice(
                0,
                8
              )
              .map(
                (
                  session,
                  index
                ) => (

                  <article
                    key={
                      session.id
                    }
                    className="live-list-item"
                  >

                    <div className="live-list-item__number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>


                    <div className="live-list-item__main">

                      <Link
                        href={`/studio/live/${session.id}`}
                        className="live-list-item__title"
                      >
                        {
                          session.title
                        }
                      </Link>


                      <div className="live-list-item__meta">

                        <span>
                          {
                            session.session_type
                          }
                        </span>

                        <span>
                          /
                        </span>

                        <span>
                          Ended{" "}
                          {
                            formatDate(
                              session.ended_at
                            )
                          }
                        </span>

                        {session.replay_url && (
                          <>
                            <span>
                              /
                            </span>

                            <span className="live-replay">
                              REPLAY AVAILABLE
                            </span>
                          </>
                        )}

                      </div>

                    </div>


                    <div className="live-list-item__status live-list-item__status--ended">
                      ENDED
                    </div>


                    <Link
                      href={`/studio/live/${session.id}/edit`}
                      className="live-list-item__edit"
                    >
                      Edit
                    </Link>


                    <Link
                      href={`/studio/live/${session.id}`}
                      className="live-list-item__arrow"
                      aria-label={`Open ${session.title}`}
                    >
                      ↗
                    </Link>

                  </article>

                )
              )}

          </div>

        )}

      </section>


      {/* =================================================
          QUICK CREATE
          ================================================= */}

      <section className="live-create">

        <div className="live-create__copy">

          <span>
            READY WHEN YOU ARE
          </span>

          <h2>
            Start the next conversation.
          </h2>

          <p>
            Create a live session now, prepare it as
            a draft, schedule it for later, or go live
            immediately.
          </p>

        </div>


        <div className="live-create__actions">

          <Link
            href="/studio/live/new"
            className="live-create__schedule"
          >
            Schedule Live

            <span>
              +
            </span>
          </Link>


          <Link
            href="/studio/live/new"
            className="live-create__start"
          >
            Start Live

            <span>
              ↗
            </span>
          </Link>

        </div>

      </section>

    </main>
  );
}