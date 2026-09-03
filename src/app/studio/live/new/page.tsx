"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./live-new.css";


/* =========================================================
   TYPES
   ========================================================= */

type SessionType =
  | "live"
  | "interview"
  | "conversation"
  | "event"
  | "premiere";


/* =========================================================
   HELPERS
   ========================================================= */

function generateSlug(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}


/* =========================================================
   PAGE
   ========================================================= */

export default function NewLivePage() {

  const router =
    useRouter();

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    slug,
    setSlug,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    sessionType,
    setSessionType,
  ] = useState<SessionType>(
    "live"
  );

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState("");

  const [
    coverMedia,
    setCoverMedia,
  ] = useState<MediaItem | null>(
    null
  );

  const [
    featured,
    setFeatured,
  ] = useState(false);

  const [
    showCoverPicker,
    setShowCoverPicker,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState<
    "draft" |
    "schedule" |
    "live" |
    null
  >(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /* =======================================================
     TITLE
     ======================================================= */

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    setSlug(
      generateSlug(value)
    );
  }


  /* =======================================================
     CREATE SESSION
     ======================================================= */

  async function createSession(
    action:
      | "draft"
      | "schedule"
      | "live"
  ) {

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError(
        "Please enter a live session title."
      );

      return;
    }

    if (!slug.trim()) {
      setError(
        "Please enter a valid slug."
      );

      return;
    }

    if (
      action ===
        "schedule" &&
      !scheduledAt
    ) {
      setError(
        "Please choose a date and time for the live session."
      );

      return;
    }

    if (saving) {
      return;
    }

    setSaving(action);

    const supabase =
      createClient();

    try {

      /* ================================================
         USER
         ================================================ */

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "You must be signed in."
        );
      }


      /* ================================================
         CHECK SLUG
         ================================================ */

      const {
        data:
          existingSession,
        error:
          slugError,
      } =
        await supabase
          .from("live_sessions")
          .select("id")
          .eq(
            "slug",
            slug.trim()
          )
          .maybeSingle();

      if (slugError) {
        throw new Error(
          slugError.message
        );
      }

      if (existingSession) {
        throw new Error(
          "A live session with this slug already exists."
        );
      }


      /* ================================================
         STATUS
         ================================================ */

      let status =
        "draft";

      let scheduledValue:
        string | null =
        null;

      let startedValue:
        string | null =
        null;


      if (
        action ===
        "schedule"
      ) {
        status =
          "scheduled";

        scheduledValue =
          new Date(
            scheduledAt
          ).toISOString();
      }


      if (
        action ===
        "live"
      ) {
        status =
          "live";

        startedValue =
          new Date().toISOString();
      }


      /* ================================================
         CREATE
         ================================================ */

      const {
        data:
          session,
        error:
          insertError,
      } =
        await supabase
          .from("live_sessions")
          .insert({
            host_id:
              user.id,

            title:
              title.trim(),

            slug:
              slug.trim(),

            description:
              description.trim() ||
              null,

            status,

            session_type:
              sessionType,

            cover_media_id:
              coverMedia?.id ??
              null,

            scheduled_at:
              scheduledValue,

            started_at:
              startedValue,

            ended_at:
              null,

            stream_url:
              null,

            replay_url:
              null,

            recording_media_id:
              null,

            featured,
          })
          .select("id")
          .single();


      if (
        insertError ||
        !session
      ) {
        throw new Error(
          insertError?.message ||
            "Could not create live session."
        );
      }


      /* ================================================
         SUCCESS MESSAGE
         ================================================ */

      if (
        action ===
        "draft"
      ) {
        setSuccess(
          "Live session saved as draft."
        );
      }

      if (
        action ===
        "schedule"
      ) {
        setSuccess(
          "Live session scheduled successfully."
        );
      }

      if (
        action ===
        "live"
      ) {
        setSuccess(
          "Live session started."
        );
      }


      /* ================================================
         REDIRECT
         ================================================ */

      setTimeout(() => {

        /*
         * Drafts go to EDIT.
         *
         * This is where the creator can continue
         * preparing the session.
         */

        if (
          action ===
          "draft"
        ) {
          router.push(
            `/studio/live/${session.id}/edit`
          );

          router.refresh();

          return;
        }


        /*
         * Scheduled sessions go to the
         * session/control page.
         */

        if (
          action ===
          "schedule"
        ) {
          router.push(
            `/studio/live/${session.id}`
          );

          router.refresh();

          return;
        }


        /*
         * Go Live immediately opens
         * the live control room.
         */

        router.push(
          `/studio/live/${session.id}`
        );

        router.refresh();

      }, 500);

    } catch (err) {

      console.error(
        "Live creation error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the live session."
      );

    } finally {
      setSaving(null);
    }
  }


  /* =======================================================
     FORM SUBMIT
     ======================================================= */

  function handleDraftSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void createSession(
      "draft"
    );
  }


  return (
    <main className="live-new-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="live-new-header">

        <div>

          <Link
            href="/studio/live"
            className="live-new-back"
          >
            ← Back to Live
          </Link>

          <span className="live-new-eyebrow">
            AKNM STUDIO / LIVE
          </span>

          <h1>
            Create a live session.
          </h1>

          <p>
            Prepare a broadcast, schedule it for later,
            or go live immediately.
          </p>

        </div>

      </header>


      {/* =================================================
          FORM
          ================================================= */}

      <form
        className="live-new-form"
        onSubmit={
          handleDraftSubmit
        }
      >

        {/* =================================================
            01 — SESSION INFORMATION
            ================================================= */}

        <section className="live-new-section">

          <div className="live-new-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Session information
              </h2>

              <p>
                Define what this broadcast is about.
              </p>

            </div>

          </div>


          <div className="live-new-fields">

            <label>

              <span>
                TITLE
              </span>

              <input
                type="text"
                value={title}
                onChange={(
                  event
                ) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                placeholder="Enter live session title..."
                disabled={
                  saving !== null
                }
              />

            </label>


            <label>

              <span>
                SLUG
              </span>

              <input
                type="text"
                value={slug}
                onChange={(
                  event
                ) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="live-session-slug"
                disabled={
                  saving !== null
                }
              />

            </label>


            <label>

              <span>
                SESSION TYPE
              </span>

              <select
                value={
                  sessionType
                }
                onChange={(
                  event
                ) =>
                  setSessionType(
                    event.target
                      .value as SessionType
                  )
                }
                disabled={
                  saving !== null
                }
              >

                <option value="live">
                  Live Broadcast
                </option>

                <option value="interview">
                  Interview
                </option>

                <option value="conversation">
                  Conversation
                </option>

                <option value="event">
                  Event
                </option>

                <option value="premiere">
                  Premiere
                </option>

              </select>

            </label>


            <label className="live-new-field--full">

              <span>
                DESCRIPTION
              </span>

              <textarea
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what this live session is about..."
                rows={7}
                disabled={
                  saving !== null
                }
              />

            </label>

          </div>

        </section>


        {/* =================================================
            02 — COVER
            ================================================= */}

        <section className="live-new-section">

          <div className="live-new-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                Session cover
              </h2>

              <p>
                Choose an image to represent this
                live session.
              </p>

            </div>

          </div>


          {coverMedia ? (

            <div className="live-new-selected-cover">

              <div className="live-new-cover-preview">

                {coverMedia.public_url && (
                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      title ||
                      "Live session cover"
                    }
                  />
                )}

              </div>


              <div className="live-new-cover-info">

                <strong>
                  {
                    coverMedia.title ||
                    "Session cover"
                  }
                </strong>

                <small>
                  Cover image
                </small>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCoverMedia(
                    null
                  )
                }
                disabled={
                  saving !== null
                }
              >
                Remove
              </button>

            </div>

          ) : (

            <button
              type="button"
              className="live-new-cover-picker"
              onClick={() =>
                setShowCoverPicker(
                  true
                )
              }
              disabled={
                saving !== null
              }
            >

              <span>
                +
              </span>

              <div>

                <strong>
                  Choose Cover
                </strong>

                <small>
                  Select an image from the media library.
                </small>

              </div>

              <span className="live-new-cover-picker__arrow">
                ↗
              </span>

            </button>

          )}

        </section>


        {/* =================================================
            03 — SCHEDULE
            ================================================= */}

        <section className="live-new-section">

          <div className="live-new-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Schedule
              </h2>

              <p>
                Optional. You can schedule the broadcast
                now or start it immediately.
              </p>

            </div>

          </div>


          <div className="live-new-schedule">

            <label>

              <span>
                DATE & TIME
              </span>

              <input
                type="datetime-local"
                value={
                  scheduledAt
                }
                onChange={(
                  event
                ) =>
                  setScheduledAt(
                    event.target.value
                  )
                }
                disabled={
                  saving !== null
                }
              />

            </label>


            <div className="live-new-schedule-note">

              <span>
                SCHEDULED
              </span>

              <p>
                Leave this empty if you want to save
                the session as a draft or start it now.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            04 — VISIBILITY
            ================================================= */}

        <section className="live-new-section">

          <div className="live-new-section-heading">

            <span>
              04
            </span>

            <div>

              <h2>
                Featured
              </h2>

              <p>
                Highlight this live session in prominent
                AKNM.PRO live areas.
              </p>

            </div>

          </div>


          <label className="live-new-toggle">

            <input
              type="checkbox"
              checked={
                featured
              }
              onChange={(
                event
              ) =>
                setFeatured(
                  event.target.checked
                )
              }
              disabled={
                saving !== null
              }
            />

            <span className="live-new-toggle__switch">
              <span />
            </span>

            <span className="live-new-toggle__content">

              <strong>
                Feature this session
              </strong>

              <small>
                Make this session more prominent across
                the platform.
              </small>

            </span>

          </label>

        </section>


        {/* =================================================
            MESSAGES
            ================================================= */}

        {error && (

          <div className="live-new-message live-new-message--error">

            <strong>
              Could not create session
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {success && (

          <div className="live-new-message live-new-message--success">

            <strong>
              {success}
            </strong>

          </div>

        )}


        {/* =================================================
            ACTIONS
            ================================================= */}

        <footer className="live-new-actions">

          <Link
            href="/studio/live"
            className="live-new-cancel"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="live-new-draft"
            disabled={
              saving !== null
            }
          >
            {saving ===
            "draft"
              ? "Saving..."
              : "Save Draft"}
          </button>


          <button
            type="button"
            className="live-new-schedule"
            disabled={
              saving !== null
            }
            onClick={() =>
              void createSession(
                "schedule"
              )
            }
          >
            {saving ===
            "schedule"
              ? "Scheduling..."
              : "Schedule Live"}

            {saving !==
              "schedule" && (
              <span>
                +
              </span>
            )}

          </button>


          <button
            type="button"
            className="live-new-go-live"
            disabled={
              saving !== null
            }
            onClick={() =>
              void createSession(
                "live"
              )
            }
          >
            {saving ===
            "live"
              ? "Starting..."
              : "Go Live"}

            {saving !==
              "live" && (
              <span>
                ↗
              </span>
            )}

          </button>

        </footer>

      </form>


      {/* =================================================
          COVER PICKER
          ================================================= */}

      {showCoverPicker && (

        <div className="live-new-modal">

          <div
            className="live-new-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
          />


          <div className="live-new-modal__panel">

            <MediaPicker
              mode="cover"
              mediaType="image"
              selectedIds={
                coverMedia
                  ? [
                      coverMedia.id,
                    ]
                  : []
              }
              onChange={(
                media
              ) => {

                setCoverMedia(
                  media[0] ??
                    null
                );

                setShowCoverPicker(
                  false
                );

              }}
              onClose={() =>
                setShowCoverPicker(
                  false
                )
              }
            />

          </div>

        </div>

      )}

    </main>
  );
}