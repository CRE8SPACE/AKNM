"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./live-edit.css";

/* =========================================================
   TYPES
   ========================================================= */

type LiveStatus =
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
  status: LiveStatus;
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

type RecordingMedia = MediaItem & {
  public_url: string | null;
};

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeStatus(
  value: string
): LiveStatus {
  if (
    value === "draft" ||
    value === "scheduled" ||
    value === "live" ||
    value === "ended" ||
    value === "published" ||
    value === "cancelled" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

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

function formatDateTime(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatFileSize(
  bytes: number | null
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
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

function formatDuration(
  seconds: number | null
) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const total =
    Math.floor(seconds);

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

/* =========================================================
   PAGE
   ========================================================= */

export default function LiveEditPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const sessionId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;

  /* =======================================================
     STATE
     ======================================================= */

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
    useState<RecordingMedia | null>(
      null
    );

  const [
    coverMedia,
    setCoverMedia,
  ] =
    useState<MediaItem | null>(
      null
    );

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    sessionType,
    setSessionType,
  ] = useState("live");

  const [
    featured,
    setFeatured,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    showCoverPicker,
    setShowCoverPicker,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  /* =======================================================
     LOAD SESSION
     ======================================================= */

  const loadSession =
    useCallback(
      async () => {
        if (!sessionId) {
          return;
        }

        setLoading(true);
        setError("");

        const supabase =
          createClient();

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
              "id",
              sessionId
            )
            .single();

        if (sessionError) {
          console.error(
            "Live edit session error:",
            sessionError
          );

          setError(
            sessionError.message ||
              "Could not load live session."
          );

          setLoading(false);

          return;
        }

        const loaded =
          {
            ...data,
            status:
              normalizeStatus(
                data.status
              ),
          } as LiveSession;

        setSession(
          loaded
        );

        setTitle(
          loaded.title
        );

        setDescription(
          loaded.description ||
            ""
        );

        setSessionType(
          loaded.session_type
        );

        setFeatured(
          loaded.featured
        );

        /*
         * LOAD RECORDING
         */

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
              .eq(
                "id",
                loaded.recording_media_id
              )
              .single();

          if (
            recordingError
          ) {
            console.error(
              "Recording media error:",
              recordingError
            );
          } else {
            setRecording(
              recordingData as RecordingMedia
            );
          }
        }

        /*
         * LOAD COVER
         */

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
              .eq(
                "id",
                loaded.cover_media_id
              )
              .single();

          if (
            coverError
          ) {
            console.error(
              "Cover media error:",
              coverError
            );
          } else {
            setCoverMedia(
              coverData as MediaItem
            );
          }
        }

        setLoading(false);
      },
      [sessionId]
    );

  useEffect(() => {
    void loadSession();
  }, [
    loadSession,
  ]);

  /* =======================================================
     SAVE EDITS
     ======================================================= */

  async function handleSave() {
    if (
      !session ||
      saving ||
      publishing
    ) {
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a title."
      );

      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const supabase =
        createClient();

      const {
        data,
        error:
          updateError,
      } =
        await supabase
          .from(
            "live_sessions"
          )
          .update({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,

            session_type:
              sessionType,

            cover_media_id:
              coverMedia?.id ??
              null,

            featured,
          })
          .eq(
            "id",
            session.id
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
          .single();

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSession(
        {
          ...data,
          status:
            normalizeStatus(
              data.status
            ),
        } as LiveSession
      );

      setMessage(
        "Changes saved successfully."
      );
    } catch (err) {
      console.error(
        "Live edit save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     PUBLISH
     ======================================================= */

  async function handlePublish() {
    if (
      !session ||
      publishing ||
      saving
    ) {
      return;
    }

    if (
      !session.recording_media_id
    ) {
      setError(
        "This live session has no recording to publish."
      );

      return;
    }

    if (
      !title.trim()
    ) {
      setError(
        "Please enter a title before publishing."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Publish this recording? It will become publicly available on AKNM."
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setPublishing(true);

    try {
      const supabase =
        createClient();

      /*
       * Save the latest editorial
       * changes first.
       */

      const {
        error:
          contentError,
      } =
        await supabase
          .from(
            "live_sessions"
          )
          .update({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,

            session_type:
              sessionType,

            cover_media_id:
              coverMedia?.id ??
              null,

            featured,
          })
          .eq(
            "id",
            session.id
          );

      if (contentError) {
        throw new Error(
          contentError.message
        );
      }

      /*
       * Publish.
       */

      const {
        data,
        error:
          publishError,
      } =
        await supabase
          .from(
            "live_sessions"
          )
          .update({
            status:
              "published",
          })
          .eq(
            "id",
            session.id
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
          .single();

      if (publishError) {
        throw new Error(
          publishError.message
        );
      }

      setSession(
        {
          ...data,
          status:
            normalizeStatus(
              data.status
            ),
        } as LiveSession
      );

      setMessage(
        "Published successfully. Opening the public replay..."
      );

      window.setTimeout(
        () => {
          router.push(
            `/live/${data.slug}`
          );

          router.refresh();
        },
        900
      );
    } catch (err) {
      console.error(
        "Live publish error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not publish this live session."
      );
    } finally {
      setPublishing(false);
    }
  }

  /* =======================================================
     REMOVE COVER
     ======================================================= */

  function removeCover() {
    setCoverMedia(
      null
    );
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="live-edit-page">

        <div className="live-edit-state">

          <div className="live-edit-loader" />

          <p>
            Loading recording editor...
          </p>

        </div>

      </main>
    );
  }

  /* =======================================================
     NOT FOUND
     ======================================================= */

  if (!session) {
    return (
      <main className="live-edit-page">

        <div className="live-edit-state live-edit-state--error">

          <span>
            AKNM LIVE
          </span>

          <h1>
            Session unavailable.
          </h1>

          <p>
            {error ||
              "This live session could not be found."}
          </p>

          <Link
            href="/studio/live"
            className="live-edit-back"
          >
            ← Back to Live
          </Link>

        </div>

      </main>
    );
  }

  const status =
    normalizeStatus(
      session.status
    );

  const canPublish =
    status === "ended" &&
    Boolean(
      session.recording_media_id
    );

  /* =======================================================
     MAIN
     ======================================================= */

  return (
    <main className="live-edit-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="live-edit-header">

        <div className="live-edit-header__left">

          <Link
            href="/studio/live"
            className="live-edit-back"
          >
            ← Back to Live
          </Link>

          <span className="live-edit-eyebrow">
            AKNM LIVE / POST-PRODUCTION
          </span>

          <h1>
            Edit recording.
          </h1>

          <p>
            Review the broadcast, refine its
            information and publish it to AKNM.
          </p>

        </div>

        <div className="live-edit-header__status">

          <span>
            STATUS
          </span>

          <strong
            className={`live-edit-status live-edit-status--${status}`}
          >
            {status.toUpperCase()}
          </strong>

        </div>

      </header>


      {/* =================================================
          WORKSPACE
          ================================================= */}

      <section className="live-edit-workspace">

        {/* ===============================================
            MAIN COLUMN
            =============================================== */}

        <div className="live-edit-main">

          {/* =============================================
              RECORDING
              ============================================= */}

          <section className="live-edit-card live-edit-recording-card">

            <div className="live-edit-card-heading">

              <div>

                <span>
                  01
                </span>

                <div>

                  <h2>
                    Recording
                  </h2>

                  <p>
                    Your completed live broadcast.
                  </p>

                </div>

              </div>

              {recording && (
                <span className="live-edit-recording-status">
                  RECORDED
                </span>
              )}

            </div>


            {recording?.public_url ? (

              <div className="live-edit-video-wrapper">

                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={
                    coverMedia?.public_url ||
                    recording.thumbnail_url ||
                    undefined
                  }
                  src={
                    recording.public_url
                  }
                  className="live-edit-video"
                />

                <div className="live-edit-video-overlay">

                  <span>
                    AKNM ORIGINAL
                  </span>

                </div>

              </div>

            ) : (

              <div className="live-edit-no-recording">

                <div>
                  REC
                </div>

                <strong>
                  Recording unavailable
                </strong>

                <p>
                  No recording media is attached
                  to this live session.
                </p>

              </div>

            )}


            {recording && (

              <div className="live-edit-recording-meta">

                <div>

                  <span>
                    FILE
                  </span>

                  <strong>
                    {
                      recording.title ||
                      "Live recording"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    FORMAT
                  </span>

                  <strong>
                    {
                      recording.mime_type ||
                      "VIDEO"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    SIZE
                  </span>

                  <strong>
                    {formatFileSize(
                      recording.file_size
                    )}
                  </strong>

                </div>

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

              </div>

            )}

          </section>


          {/* =============================================
              CONTENT
              ============================================= */}

          <section className="live-edit-card">

            <div className="live-edit-card-heading">

              <div>

                <span>
                  02
                </span>

                <div>

                  <h2>
                    Content
                  </h2>

                  <p>
                    Control how this broadcast is
                    presented to your audience.
                  </p>

                </div>

              </div>

            </div>


            <div className="live-edit-fields">

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
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Broadcast title..."
                  disabled={
                    saving ||
                    publishing
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
                      event.target.value
                    )
                  }
                  disabled={
                    saving ||
                    publishing
                  }
                >

                  <option value="live">
                    Live
                  </option>

                  <option value="premiere">
                    Premiere
                  </option>

                  <option value="webinar">
                    Webinar
                  </option>

                  <option value="interview">
                    Interview
                  </option>

                  <option value="event">
                    Event
                  </option>

                  <option value="podcast">
                    Podcast
                  </option>

                  <option value="discussion">
                    Discussion
                  </option>

                </select>

              </label>


              <label>

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
                  placeholder="Describe this broadcast..."
                  rows={8}
                  disabled={
                    saving ||
                    publishing
                  }
                />

              </label>


              <label className="live-edit-featured">

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
                    saving ||
                    publishing
                  }
                />

                <span>

                  <strong>
                    Feature this broadcast
                  </strong>

                  <small>
                    Highlight this recording in
                    AKNM Live and featured content.
                  </small>

                </span>

              </label>

            </div>

          </section>


          {/* =============================================
              COVER
              ============================================= */}

          <section className="live-edit-card">

            <div className="live-edit-card-heading">

              <div>

                <span>
                  03
                </span>

                <div>

                  <h2>
                    Cover image
                  </h2>

                  <p>
                    Choose the artwork used to
                    represent this recording.
                  </p>

                </div>

              </div>

            </div>


            {coverMedia ? (

              <div className="live-edit-cover-selected">

                <div className="live-edit-cover-preview">

                  {coverMedia.public_url && (
                    <img
                      src={
                        coverMedia.public_url
                      }
                      alt={
                        coverMedia.alt_text ||
                        coverMedia.title ||
                        title
                      }
                    />
                  )}

                </div>

                <div className="live-edit-cover-info">

                  <strong>
                    {
                      coverMedia.title ||
                      "Selected cover"
                    }
                  </strong>

                  <small>
                    Image selected from
                    your media library.
                  </small>

                  <button
                    type="button"
                    onClick={
                      removeCover
                    }
                    disabled={
                      saving ||
                      publishing
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            ) : (

              <button
                type="button"
                className="live-edit-cover-empty"
                onClick={() =>
                  setShowCoverPicker(
                    true
                  )
                }
                disabled={
                  saving ||
                  publishing
                }
              >

                <span>
                  +
                </span>

                <strong>
                  Choose cover image
                </strong>

                <small>
                  Select an image from the
                  AKNM media library.
                </small>

              </button>

            )}

          </section>


          {/* =============================================
              SESSION INFORMATION
              ============================================= */}

          <section className="live-edit-card">

            <div className="live-edit-card-heading">

              <div>

                <span>
                  04
                </span>

                <div>

                  <h2>
                    Broadcast information
                  </h2>

                  <p>
                    Technical information about
                    this session.
                  </p>

                </div>

              </div>

            </div>


            <div className="live-edit-info-grid">

              <div>

                <span>
                  SLUG
                </span>

                <strong>
                  /live/{session.slug}
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
                  CREATED
                </span>

                <strong>
                  {formatDate(
                    session.created_at
                  )}
                </strong>

              </div>

            </div>

          </section>

        </div>


        {/* ===============================================
            SIDEBAR
            =============================================== */}

        <aside className="live-edit-sidebar">

          <div className="live-edit-publish-card">

            <span className="live-edit-publish-eyebrow">
              PUBLICATION
            </span>

            <h2>
              Ready to publish?
            </h2>

            <p>
              Your broadcast has been recorded.
              Save your final information, then
              publish it to make the replay public.
            </p>


            <div className="live-edit-checklist">

              <div
                className={
                  title.trim()
                    ? "is-ready"
                    : ""
                }
              >
                <span>
                  {title.trim()
                    ? "✓"
                    : "01"}
                </span>

                <strong>
                  Title
                </strong>
              </div>


              <div
                className={
                  session.recording_media_id
                    ? "is-ready"
                    : ""
                }
              >
                <span>
                  {session.recording_media_id
                    ? "✓"
                    : "02"}
                </span>

                <strong>
                  Recording
                </strong>
              </div>


              <div
                className={
                  session.ended_at
                    ? "is-ready"
                    : ""
                }
              >
                <span>
                  {session.ended_at
                    ? "✓"
                    : "03"}
                </span>

                <strong>
                  Broadcast ended
                </strong>
              </div>

            </div>


            <button
              type="button"
              className="live-edit-publish-button"
              onClick={
                handlePublish
              }
              disabled={
                !canPublish ||
                publishing ||
                saving
              }
            >

              <span>
                {publishing
                  ? "Publishing..."
                  : "Publish Recording"}
              </span>

              {!publishing && (
                <span>
                  ↗
                </span>
              )}

            </button>


            <button
              type="button"
              className="live-edit-save-button"
              onClick={
                handleSave
              }
              disabled={
                saving ||
                publishing
              }
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>


            <Link
              href={`/studio/live/${session.id}`}
              className="live-edit-studio-link"
            >
              ← Return to studio
            </Link>

          </div>


          {/* =============================================
              STATUS CARD
              ============================================= */}

          <div className="live-edit-status-card">

            <span>
              CURRENT STATUS
            </span>

            <strong
              className={`live-edit-status live-edit-status--${status}`}
            >
              {status.toUpperCase()}
            </strong>

            <p>
              {status === "ended"
                ? "This broadcast is recorded and ready for editorial review."
                : status === "published"
                ? "This broadcast has been published."
                : "This session is not currently ready for publication."}
            </p>

          </div>

        </aside>

      </section>


      {/* =================================================
          MESSAGES
          ================================================= */}

      {message && (

        <div className="live-edit-message live-edit-message--success">
          {message}
        </div>

      )}

      {error && (

        <div className="live-edit-message live-edit-message--error">

          <strong>
            Editor error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="live-edit-footer">

        <div>

          <span>
            AKNM LIVE
          </span>

          <strong>
            POST-PRODUCTION
          </strong>

        </div>

        <div>

          <span>
            RECORDING
          </span>

          <strong>
            {recording
              ? "AVAILABLE"
              : "MISSING"}
          </strong>

        </div>

        <div>

          <span>
            STATUS
          </span>

          <strong>
            {status.toUpperCase()}
          </strong>

        </div>

      </footer>


      {/* =================================================
          COVER PICKER
          ================================================= */}

      {showCoverPicker && (

        <div className="live-edit-modal">

          <div
            className="live-edit-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
          />

          <div className="live-edit-modal__panel">

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