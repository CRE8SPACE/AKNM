"use client";

import Link from "next/link";

import "./MediaCard.css";


/* =========================================================
   TYPES
   ========================================================= */

type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";


type MediaCategory = {
  id: string;
  name: string;
  slug: string;
} | null;


type MediaCardProps = {
  id: string;

  title: string | null;

  mediaType: MediaType;

  publicUrl: string | null;

  thumbnailUrl: string | null;

  mimeType: string | null;

  fileSize: number | null;

  durationSeconds: number | null;

  createdAt: string;

  category?: MediaCategory;
};


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(
  bytes: number | null
) {

  if (!bytes) {

    return "—";

  }


  if (
    bytes <
    1024
  ) {

    return `${bytes} B`;

  }


  if (
    bytes <
    1024 * 1024
  ) {

    return `${(
      bytes /
      1024
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
      1024 /
      1024
    ).toFixed(1)} MB`;

  }


  return `${(
    bytes /
    1024 /
    1024 /
    1024
  ).toFixed(1)} GB`;

}


/* =========================================================
   DURATION
   ========================================================= */

function formatDuration(
  seconds: number | null
) {

  if (
    seconds === null ||
    seconds === undefined
  ) {

    return null;

  }


  const totalSeconds =
    Math.floor(
      seconds
    );


  const minutes =
    Math.floor(
      totalSeconds /
      60
    );


  const remainingSeconds =
    totalSeconds %
    60;


  return `${minutes}:${String(
    remainingSeconds
  ).padStart(
    2,
    "0"
  )}`;

}


/* =========================================================
   TYPE LABEL
   ========================================================= */

function getTypeLabel(
  mediaType: MediaType
) {

  return mediaType
    .slice(
      0,
      3
    )
    .toUpperCase();

}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value: string
) {

  return new Date(
    value
  ).toLocaleDateString(
    "en-US",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  );

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function MediaCard({

  id,

  title,

  mediaType,

  publicUrl,

  thumbnailUrl,

  mimeType,

  fileSize,

  durationSeconds,

  createdAt,

  category,

}: MediaCardProps) {


  const duration =
    formatDuration(
      durationSeconds
    );


  const displayTitle =
    title ||
    mimeType ||
    "Untitled media";


  const categoryName =
    category?.name ||
    null;


  return (

    <article
      className="media-card"
    >


      {/* =================================================
          PREVIEW
          ================================================= */}

      <Link
        href={`/studio/media/${id}`}
        className="media-card__preview"
      >

        {mediaType ===
          "image" &&
        publicUrl ? (

          <img
            src={
              publicUrl
            }
            alt={
              displayTitle
            }
            loading="lazy"
          />

        ) : mediaType ===
            "video" &&
          (
            thumbnailUrl ||
            publicUrl
          ) ? (

          <div
            className="media-card__video"
          >

            {thumbnailUrl ? (

              <img
                src={
                  thumbnailUrl
                }
                alt={
                  displayTitle
                }
                loading="lazy"
              />

            ) : (

              <video
                src={
                  publicUrl ||
                  ""
                }
                preload="metadata"
                muted
                playsInline
              />

            )}


            <span
              className="media-card__play"
            >
              ▶
            </span>


            {duration && (

              <span
                className="media-card__duration"
              >
                {duration}
              </span>

            )}

          </div>

        ) : mediaType ===
          "audio" ? (

          <div
            className="
              media-card__generic
              media-card__generic--audio
            "
          >

            <span>
              AUDIO
            </span>

          </div>

        ) : (

          <div
            className="media-card__generic"
          >

            <span>
              {
                getTypeLabel(
                  mediaType
                )
              }
            </span>

          </div>

        )}


        {/* =================================================
            TYPE
            ================================================= */}

        <span
          className="media-card__type"
        >

          {
            getTypeLabel(
              mediaType
            )
          }

        </span>


        {/* =================================================
            CATEGORY
            ================================================= */}

        {categoryName && (

          <span
            className="media-card__category"
          >

            {
              categoryName
            }

          </span>

        )}

      </Link>



      {/* =================================================
          INFORMATION
          ================================================= */}

      <div
        className="media-card__information"
      >


        <Link
          href={`/studio/media/${id}`}
          className="media-card__title"
        >

          {
            displayTitle
          }

        </Link>


        {/* =================================================
            CATEGORY / META
            ================================================= */}

        <div
          className="media-card__meta"
        >

          {categoryName && (

            <>

              <span
                className="media-card__meta-category"
              >

                {
                  categoryName
                }

              </span>


              <span>
                /
              </span>

            </>

          )}


          <span>
            {
              formatFileSize(
                fileSize
              )
            }
          </span>


          <span>
            /
          </span>


          <span>
            {
              formatDate(
                createdAt
              )
            }
          </span>

        </div>

      </div>

    </article>

  );

}