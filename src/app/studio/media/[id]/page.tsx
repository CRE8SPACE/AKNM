import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import "./media-detail.css";

type MediaRecord = {
  id: string;
  owner_id: string | null;
  title: string | null;
  description: string | null;
  media_type: "image" | "video" | "audio" | "document";
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

  if (bytes < 1024 * 1024) {
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

  const totalSeconds =
    Math.round(seconds);

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const remainingSeconds =
    totalSeconds % 60;

  if (hours > 0) {
    return [
      hours
        .toString()
        .padStart(2, "0"),
      minutes
        .toString()
        .padStart(2, "0"),
      remainingSeconds
        .toString()
        .padStart(2, "0"),
    ].join(":");
  }

  return [
    minutes
      .toString()
      .padStart(2, "0"),
    remainingSeconds
      .toString()
      .padStart(2, "0"),
  ].join(":");
}


function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function getMediaLabel(
  type: MediaRecord["media_type"]
) {
  switch (type) {
    case "image":
      return "Image";

    case "video":
      return "Video";

    case "audio":
      return "Audio";

    case "document":
      return "Document";

    default:
      return "Media";
  }
}


function getFileName(
  path: string
) {
  const parts =
    path.split("/");

  return (
    parts[parts.length - 1] ||
    path
  );
}


function renderPreview(
  media: MediaRecord
) {
  if (!media.public_url) {
    return (
      <div className="media-detail__preview-empty">
        <span>
          NO PREVIEW
        </span>

        <p>
          This media does not have
          a public URL yet.
        </p>
      </div>
    );
  }


  if (
    media.media_type ===
    "image"
  ) {
    return (
      <div className="media-detail__image-preview">
        <img
          src={
            media.public_url
          }
          alt={
            media.alt_text ||
            media.title ||
            "AKNM media"
          }
        />
      </div>
    );
  }


  if (
    media.media_type ===
    "video"
  ) {
    return (
      <div className="media-detail__video-preview">
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
      </div>
    );
  }


  if (
    media.media_type ===
    "audio"
  ) {
    return (
      <div className="media-detail__audio-preview">

        <div className="media-detail__audio-icon">
          AUDIO
        </div>

        <div className="media-detail__audio-info">

          <strong>
            {media.title ||
              "Untitled audio"}
          </strong>

          <span>
            {formatDuration(
              media.duration_seconds
            )}
          </span>

        </div>

        <audio
          src={
            media.public_url
          }
          controls
        />

      </div>
    );
  }


  return (
    <div className="media-detail__document-preview">

      <div className="media-detail__document-icon">
        DOC
      </div>

      <strong>
        {media.title ||
          getFileName(
            media.storage_path
          )}
      </strong>

      <span>
        {media.mime_type ||
          "Document"}
      </span>

      <a
        href={
          media.public_url
        }
        target="_blank"
        rel="noreferrer"
      >
        Open document ↗
      </a>

    </div>
  );
}


export default async function MediaDetailPage(
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  const {
    id,
  } = await params;

  const supabase =
    await createClient();


  const {
    data,
    error,
  } = await supabase
    .from("media")
    .select(`
      id,
      owner_id,
      title,
      description,
      media_type,
      storage_bucket,
      storage_path,
      public_url,
      thumbnail_url,
      mime_type,
      file_size,
      width,
      height,
      duration_seconds,
      alt_text,
      metadata,
      created_at,
      updated_at
    `)
    .eq(
      "id",
      id
    )
    .single();


  if (error) {
    console.error(
      "Media detail fetch error:",
      error
    );

    notFound();
  }


  if (!data) {
    notFound();
  }


  const media =
    data as MediaRecord;


  const dimensions =
    media.width &&
    media.height
      ? `${media.width} × ${media.height}px`
      : "—";


  const fileName =
    getFileName(
      media.storage_path
    );


  return (
    <main className="media-detail-page">

      {/* =================================================
          TOP BAR
          ================================================= */}

      <header className="media-detail__header">

        <div>

          <Link
            href="/studio/media"
            className="media-detail__back"
          >
            <span>
              ←
            </span>

            Back to Media
          </Link>

          <span className="media-detail__eyebrow">
            MEDIA ASSET
          </span>

          <h1>
            {media.title ||
              "Untitled media"}
          </h1>

        </div>


        <div className="media-detail__header-actions">

          {media.public_url && (
            <a
              href={
                media.public_url
              }
              target="_blank"
              rel="noreferrer"
              className="media-detail__secondary-button"
            >
              Open media
              <span>
                ↗
              </span>
            </a>
          )}

          <Link
            href={`/studio/media/${media.id}/edit`}
            className="media-detail__primary-button"
          >
            Edit media
            <span>
              ↗
            </span>
          </Link>

        </div>

      </header>


      {/* =================================================
          MEDIA TYPE
          ================================================= */}

      <div className="media-detail__type-row">

        <span className="media-detail__type">
          {getMediaLabel(
            media.media_type
          )}
        </span>

        <span>
          /
        </span>

        <span>
          {media.mime_type ||
            "Unknown format"}
        </span>

        <span>
          /
        </span>

        <span>
          Added{" "}
          {formatDate(
            media.created_at
          )}
        </span>

      </div>


      {/* =================================================
          MAIN GRID
          ================================================= */}

      <section className="media-detail__layout">

        {/* =================================================
            PREVIEW
            ================================================= */}

        <div className="media-detail__preview">

          <div className="media-detail__preview-header">

            <span>
              PREVIEW
            </span>

            <span>
              {media.media_type.toUpperCase()}
            </span>

          </div>

          {renderPreview(
            media
          )}

        </div>


        {/* =================================================
            INFORMATION
            ================================================= */}

        <aside className="media-detail__information">

          {/* DESCRIPTION */}

          <section className="media-detail__section">

            <span className="media-detail__section-label">
              DESCRIPTION
            </span>

            <p className="media-detail__description">
              {media.description ||
                "No description has been added to this media."}
            </p>

          </section>


          {/* DETAILS */}

          <section className="media-detail__section">

            <span className="media-detail__section-label">
              FILE DETAILS
            </span>


            <div className="media-detail__details">

              <div>
                <span>
                  File name
                </span>

                <strong>
                  {fileName}
                </strong>
              </div>


              <div>
                <span>
                  File size
                </span>

                <strong>
                  {formatFileSize(
                    media.file_size
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Dimensions
                </span>

                <strong>
                  {dimensions}
                </strong>
              </div>


              <div>
                <span>
                  Duration
                </span>

                <strong>
                  {formatDuration(
                    media.duration_seconds
                  )}
                </strong>
              </div>


              <div>
                <span>
                  MIME type
                </span>

                <strong>
                  {media.mime_type ||
                    "—"}
                </strong>
              </div>


              <div>
                <span>
                  Bucket
                </span>

                <strong>
                  {media.storage_bucket}
                </strong>
              </div>

            </div>

          </section>


          {/* ALT TEXT */}

          <section className="media-detail__section">

            <span className="media-detail__section-label">
              ACCESSIBILITY
            </span>

            <div className="media-detail__alt">

              <span>
                ALT TEXT
              </span>

              <p>
                {media.alt_text ||
                  "No alt text has been added."}
              </p>

            </div>

          </section>


          {/* STORAGE */}

          <section className="media-detail__section">

            <span className="media-detail__section-label">
              STORAGE
            </span>

            <div className="media-detail__storage">

              <span>
                STORAGE PATH
              </span>

              <code>
                {media.storage_path}
              </code>

            </div>

          </section>

        </aside>

      </section>


      {/* =================================================
          PUBLIC URL
          ================================================= */}

      {media.public_url && (
        <section className="media-detail__url-section">

          <div>

            <span>
              PUBLIC URL
            </span>

            <code>
              {media.public_url}
            </code>

          </div>

          <a
            href={
              media.public_url
            }
            target="_blank"
            rel="noreferrer"
          >
            Open ↗
          </a>

        </section>
      )}


      {/* =================================================
          METADATA
          ================================================= */}

      <section className="media-detail__metadata">

        <div className="media-detail__metadata-header">

          <div>

            <span>
              SYSTEM
            </span>

            <h2>
              Media metadata
            </h2>

          </div>

          <span>
            ID: {media.id}
          </span>

        </div>


        <div className="media-detail__metadata-grid">

          <div>
            <span>
              Created
            </span>

            <strong>
              {formatDate(
                media.created_at
              )}
            </strong>
          </div>


          <div>
            <span>
              Last updated
            </span>

            <strong>
              {formatDate(
                media.updated_at
              )}
            </strong>
          </div>


          <div>
            <span>
              Media type
            </span>

            <strong>
              {media.media_type}
            </strong>
          </div>


          <div>
            <span>
              Owner
            </span>

            <strong>
              {media.owner_id ||
                "Unassigned"}
            </strong>
          </div>

        </div>

      </section>


      {/* =================================================
          FOOTER ACTIONS
          ================================================= */}

      <footer className="media-detail__footer">

        <Link
          href="/studio/media"
          className="media-detail__footer-link"
        >
          ← Media Library
        </Link>

        <span>
          AKNM STUDIO / MEDIA
        </span>

      </footer>

    </main>
  );
}