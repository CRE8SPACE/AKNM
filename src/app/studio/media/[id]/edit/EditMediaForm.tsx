"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type MediaRecord = {
  id: string;
  title: string | null;
  description: string | null;
  media_type:
    | "image"
    | "video"
    | "audio"
    | "document";
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type Props = {
  media: MediaRecord;
};

function formatFileSize(
  bytes: number | null
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "Unknown";
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
    1024 * 1024 * 1024
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
    Math.round(seconds);

  const minutes =
    Math.floor(
      total / 60
    );

  const remaining =
    total % 60;

  return `${minutes
    .toString()
    .padStart(
      2,
      "0"
    )}:${remaining
    .toString()
    .padStart(
      2,
      "0"
    )}`;
}

function getFileName(
  path: string
) {
  const parts =
    path.split("/");

  return (
    parts[
      parts.length - 1
    ] || path
  );
}

function getMediaLabel(
  type: MediaRecord["media_type"]
) {
  return type
    .charAt(0)
    .toUpperCase() +
    type.slice(1);
}

export default function EditMediaForm({
  media,
}: Props) {
  const [title, setTitle] =
    useState(
      media.title ?? ""
    );

  const [
    description,
    setDescription,
  ] = useState(
    media.description ?? ""
  );

  const [
    altText,
    setAltText,
  ] = useState(
    media.alt_text ?? ""
  );

  const [
    thumbnailUrl,
    setThumbnailUrl,
  ] = useState(
    media.thumbnail_url ?? ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const supabase =
        createClient();

      const {
        error: updateError,
      } = await supabase
        .from("media")
        .update({
          title:
            title.trim() ||
            null,

          description:
            description.trim() ||
            null,

          alt_text:
            altText.trim() ||
            null,

          thumbnail_url:
            thumbnailUrl.trim() ||
            null,
        })
        .eq(
          "id",
          media.id
        );

      if (updateError) {
        console.error(
          "Media update error:",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      setSuccess(true);

      /*
       * Give the user a brief
       * confirmation before returning
       * to the detail page.
       */

      setTimeout(() => {
        window.location.href =
          `/studio/media/${media.id}`;
      }, 700);

    } catch (err) {
      console.error(
        "Save media error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the media."
      );

      setSaving(false);
    }
  }


  return (
    <div className="edit-media">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="edit-media__header">

        <div>

          <Link
            href={`/studio/media/${media.id}`}
            className="edit-media__back"
          >
            <span>
              ←
            </span>

            Back to media
          </Link>

          <span className="edit-media__eyebrow">
            MEDIA ASSET
          </span>

          <h1>
            Edit media
          </h1>

          <p>
            Update the information associated
            with this media asset.
          </p>

        </div>

      </header>


      {/* =================================================
          FORM
          ================================================= */}

      <form
        className="edit-media__form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            MAIN
            ================================================= */}

        <div className="edit-media__main">

          {/* TITLE */}

          <section className="edit-media__section">

            <div className="edit-media__section-heading">

              <span>
                01
              </span>

              <div>
                <h2>
                  Basic information
                </h2>

                <p>
                  Give this asset a clear identity.
                </p>
              </div>

            </div>


            <div className="edit-media__fields">

              <label className="edit-media__field">

                <span>
                  TITLE
                </span>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="Enter a media title"
                  maxLength={200}
                />

              </label>


              <label className="edit-media__field">

                <span>
                  DESCRIPTION
                </span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe this media asset..."
                  rows={7}
                  maxLength={2000}
                />

              </label>

            </div>

          </section>


          {/* ACCESSIBILITY */}

          <section className="edit-media__section">

            <div className="edit-media__section-heading">

              <span>
                02
              </span>

              <div>
                <h2>
                  Accessibility
                </h2>

                <p>
                  Help people understand your media.
                </p>
              </div>

            </div>


            <div className="edit-media__fields">

              <label className="edit-media__field">

                <span>
                  ALT TEXT
                </span>

                <textarea
                  value={altText}
                  onChange={(event) =>
                    setAltText(
                      event.target.value
                    )
                  }
                  placeholder="Describe the image for people using screen readers..."
                  rows={5}
                  maxLength={500}
                />

                <small>
                  Recommended for images.
                </small>

              </label>

            </div>

          </section>


          {/* VIDEO */}

          {media.media_type ===
            "video" && (
            <section className="edit-media__section">

              <div className="edit-media__section-heading">

                <span>
                  03
                </span>

                <div>
                  <h2>
                    Video presentation
                  </h2>

                  <p>
                    Optional thumbnail for this video.
                  </p>
                </div>

              </div>


              <div className="edit-media__fields">

                <label className="edit-media__field">

                  <span>
                    THUMBNAIL URL
                  </span>

                  <input
                    type="url"
                    value={
                      thumbnailUrl
                    }
                    onChange={(
                      event
                    ) =>
                      setThumbnailUrl(
                        event.target
                          .value
                      )
                    }
                    placeholder="https://..."
                  />

                  <small>
                    The thumbnail will be used
                    when the video is displayed.
                  </small>

                </label>

              </div>

            </section>
          )}


          {/* STATUS */}

          {error && (
            <div className="edit-media__message edit-media__message--error">
              <strong>
                Unable to save
              </strong>

              <span>
                {error}
              </span>
            </div>
          )}

          {success && (
            <div className="edit-media__message edit-media__message--success">
              <strong>
                Saved
              </strong>

              <span>
                Your media has been updated.
              </span>
            </div>
          )}


          {/* ACTIONS */}

          <div className="edit-media__actions">

            <Link
              href={`/studio/media/${media.id}`}
              className="edit-media__cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="edit-media__save"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save changes"}

              {!saving && (
                <span>
                  ↗
                </span>
              )}
            </button>

          </div>

        </div>


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="edit-media__sidebar">

          {/* PREVIEW */}

          <section className="edit-media__preview">

            <div className="edit-media__preview-header">

              <span>
                CURRENT ASSET
              </span>

              <span>
                {media.media_type.toUpperCase()}
              </span>

            </div>


            <div className="edit-media__preview-body">

              {media.public_url &&
                media.media_type ===
                  "image" && (
                  <img
                    src={
                      media.public_url
                    }
                    alt={
                      media.alt_text ||
                      media.title ||
                      "Media preview"
                    }
                  />
                )}


              {media.public_url &&
                media.media_type ===
                  "video" && (
                  <video
                    src={
                      media.public_url
                    }
                    poster={
                      media.thumbnail_url ||
                      undefined
                    }
                    controls
                    preload="metadata"
                  />
                )}


              {media.public_url &&
                media.media_type ===
                  "audio" && (
                  <div className="edit-media__audio">

                    <div>
                      AUDIO
                    </div>

                    <strong>
                      {media.title ||
                        "Untitled audio"}
                    </strong>

                    <audio
                      src={
                        media.public_url
                      }
                      controls
                    />

                  </div>
                )}


              {media.public_url &&
                media.media_type ===
                  "document" && (
                  <div className="edit-media__document">

                    <strong>
                      DOC
                    </strong>

                    <span>
                      {getFileName(
                        media.storage_path
                      )}
                    </span>

                  </div>
                )}


              {!media.public_url && (
                <div className="edit-media__no-preview">
                  No preview available
                </div>
              )}

            </div>

          </section>


          {/* FILE INFORMATION */}

          <section className="edit-media__file-info">

            <span className="edit-media__sidebar-label">
              FILE INFORMATION
            </span>


            <div className="edit-media__info-row">

              <span>
                Type
              </span>

              <strong>
                {getMediaLabel(
                  media.media_type
                )}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                File
              </span>

              <strong>
                {getFileName(
                  media.storage_path
                )}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                Size
              </span>

              <strong>
                {formatFileSize(
                  media.file_size
                )}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                Dimensions
              </span>

              <strong>
                {media.width &&
                media.height
                  ? `${media.width} × ${media.height}px`
                  : "—"}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                Duration
              </span>

              <strong>
                {formatDuration(
                  media.duration_seconds
                )}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                MIME
              </span>

              <strong>
                {media.mime_type ||
                  "—"}
              </strong>

            </div>


            <div className="edit-media__info-row">

              <span>
                Bucket
              </span>

              <strong>
                {media.storage_bucket}
              </strong>

            </div>

          </section>


          {/* STORAGE WARNING */}

          <div className="edit-media__notice">

            <span>
              STORAGE
            </span>

            <p>
              The original file is stored
              securely in Supabase Storage.
              Editing this page changes
              metadata only.
            </p>

          </div>

        </aside>

      </form>

    </div>
  );
}