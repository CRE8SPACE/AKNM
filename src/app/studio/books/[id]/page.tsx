import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import "./book-detail.css";


/* =========================================================
   TYPES
   ========================================================= */

type Book = {
  id: string;
  author_id: string | null;

  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;

  book_type: string;
  status: string;

  cover_media_id: string | null;

  published_at: string | null;
  created_at: string;
  updated_at: string;

  /*
   * BOOK FILE
   */

  pdf_bucket: string | null;
  pdf_path: string | null;
  pdf_mime_type: string | null;
  pdf_file_size: number | null;

  /*
   * COMMERCIAL / ACCESS
   */

  price: number | null;
  currency: string;
  pricing_type: string;

  reading_access: string;
  download_access: string;

  /*
   * HARDCOPY EDITION
   */

  hardcopy_available: boolean;
  hardcopy_price: number | null;
  hardcopy_currency: string;
  hardcopy_status: string;
};


type Media = {
  id: string;

  title: string | null;
  media_type: string;

  public_url: string | null;
  thumbnail_url: string | null;

  mime_type: string | null;

  file_size: number | null;

  duration_seconds: number | null;

  alt_text: string | null;
};


type BookMedia = {
  id: string;
  book_id: string;
  media_id: string;

  media_role: string;

  title: string | null;

  sort_order: number;

  created_at: string;

  media: Media | null;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  date: string | null
) {
  if (!date) {
    return "—";
  }

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


function formatFileSize(
  bytes: number | null
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
  }

  if (
    bytes < 1024
  ) {
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

  if (
    hours > 0
  ) {
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


function getStatusClass(
  status: string
) {
  return status
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    );
}


/*
 * =========================================================
 * ACCESS LABELS
 * =========================================================
 */

function getPricingLabel(
  pricingType: string,
  price: number | null,
  currency: string
) {
  if (
    pricingType ===
    "free"
  ) {
    return "Free";
  }

  if (
    price === null ||
    price === undefined
  ) {
    return "Paid";
  }

  return `${currency} ${Number(
    price
  ).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


function getReadingAccessLabel(
  access: string
) {
  switch (
    access
  ) {
    case "free":
      return "Free to read";

    case "purchase_required":
      return "Purchase required";

    default:
      return access
        .replace(
          /_/g,
          " "
        );
  }
}


function getDownloadAccessLabel(
  access: string
) {
  switch (
    access
  ) {
    case "not_available":
      return "Download unavailable";

    case "free":
      return "Free download";

    case "purchase_required":
      return "Purchase required";

    default:
      return access
        .replace(
          /_/g,
          " "
        );
  }
}


function getHardcopyStatusLabel(
  status: string
) {
  switch (
    status
  ) {
    case "available":
      return "Available for order";

    case "preorder":
      return "Available for pre-order";

    case "unavailable":
      return "Temporarily unavailable";

    default:
      return status
        .replace(
          /_/g,
          " "
        );
  }
}


function getHardcopyPriceLabel(
  available: boolean,
  price: number | null,
  currency: string
) {
  if (
    !available
  ) {
    return "Not available";
  }

  if (
    price === null ||
    price === undefined
  ) {
    return "Price not set";
  }

  return `${currency} ${Number(
    price
  ).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {

  const {
    id,
  } = await params;


  const supabase =
    await createClient();


  /*
   * =====================================================
   * BOOK
   * =====================================================
   */

  const {
    data: book,
    error: bookError,
  } =
    await supabase
      .from("books")
      .select(`
        id,
        author_id,

        title,
        slug,
        subtitle,
        description,

        book_type,
        status,

        cover_media_id,

        published_at,
        created_at,
        updated_at,

        pdf_bucket,
        pdf_path,
        pdf_mime_type,
        pdf_file_size,

        price,
        currency,
        pricing_type,

        reading_access,
        download_access,

        hardcopy_available,
        hardcopy_price,
        hardcopy_currency,
        hardcopy_status
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (
    bookError
  ) {

    console.error(
      "Book detail error:",
      bookError
    );

  }


  if (
    !book
  ) {
    notFound();
  }


  /*
   * =====================================================
   * COVER
   * =====================================================
   */

  let coverMedia:
    Media | null = null;


  if (
    book.cover_media_id
  ) {

    const {
      data: cover,
      error: coverError,
    } =
      await supabase
        .from("media")
        .select(`
          id,
          title,
          media_type,
          public_url,
          thumbnail_url,
          mime_type,
          file_size,
          duration_seconds,
          alt_text
        `)
        .eq(
          "id",
          book.cover_media_id
        )
        .maybeSingle();


    if (
      coverError
    ) {

      console.error(
        "Book cover error:",
        coverError
      );

    }


    coverMedia =
      cover as Media | null;

  }


  /*
   * =====================================================
   * ATTACHED MEDIA
   * =====================================================
   */

  const {
    data: bookMediaRows,
    error: mediaError,
  } =
    await supabase
      .from("book_media")
      .select(`
        id,
        book_id,
        media_id,
        media_role,
        title,
        sort_order,
        created_at,

        media (
          id,
          title,
          media_type,
          public_url,
          thumbnail_url,
          mime_type,
          file_size,
          duration_seconds,
          alt_text
        )
      `)
      .eq(
        "book_id",
        book.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      );


  if (
    mediaError
  ) {

    console.error(
      "Book media error:",
      mediaError
    );

  }


  const attachedMedia =
    (bookMediaRows ??
      []) as unknown as BookMedia[];


  const audioEditions =
    attachedMedia.filter(
      item =>
        item.media_role ===
        "audio"
    );


  /*
   * =====================================================
   * AUTHOR
   * =====================================================
   */

  let authorName =
    "Unknown author";


  if (
    book.author_id
  ) {

    const {
      data: author,
      error: authorError,
    } =
      await supabase
        .from("profiles")
        .select(
          "display_name, username"
        )
        .eq(
          "id",
          book.author_id
        )
        .maybeSingle();


    if (
      authorError
    ) {

      console.error(
        "Book author error:",
        authorError
      );

    }


    if (
      author
    ) {

      authorName =
        author.display_name ||
        author.username ||
        "Unknown author";

    }

  }


  /*
   * =====================================================
   * PDF URL
   * =====================================================
   *
   * The PDF is stored directly in Supabase Storage.
   *
   * For the Studio detail page we generate the
   * public URL from the stored bucket/path.
   *
   * IMPORTANT:
   * This assumes the configured PDF bucket is public.
   * If the bucket is private, the public page should
   * later use signed URLs instead.
   * =====================================================
   */

  let pdfUrl:
    string | null = null;


  if (
    book.pdf_bucket &&
    book.pdf_path
  ) {

    const {
      data:
        pdfPublicData,
    } =
      supabase.storage
        .from(
          book.pdf_bucket
        )
        .getPublicUrl(
          book.pdf_path
        );


    pdfUrl =
      pdfPublicData
        .publicUrl ||
      null;

  }


  const statusClass =
    getStatusClass(
      book.status
    );


  const hasPdf =
    Boolean(
      book.pdf_path &&
      book.pdf_bucket
    );


  const pricingLabel =
    getPricingLabel(
      book.pricing_type,
      book.price,
      book.currency
    );


  const readingAccessLabel =
    getReadingAccessLabel(
      book.reading_access
    );


  const downloadAccessLabel =
    getDownloadAccessLabel(
      book.download_access
    );


  /*
   * =====================================================
   * HARDCOPY
   * =====================================================
   */

  const hardcopyAvailable =
    Boolean(
      book.hardcopy_available
    );


  const hardcopyPriceLabel =
    getHardcopyPriceLabel(
      hardcopyAvailable,
      book.hardcopy_price,
      book.hardcopy_currency
    );


  const hardcopyStatusLabel =
    getHardcopyStatusLabel(
      book.hardcopy_status ||
      (
        hardcopyAvailable
          ? "available"
          : "unavailable"
      )
    );


  return (

    <main className="book-detail-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="book-detail-header">

        <div>

          <Link
            href="/studio/books"
            className="book-detail-back"
          >
            ← Back to Books
          </Link>


          <span className="book-detail-eyebrow">
            AKNM STUDIO / BOOKS
          </span>


          <div className="book-detail-title-row">

            <div>

              <h1>
                {book.title}
              </h1>


              {book.subtitle && (

                <p>
                  {book.subtitle}
                </p>

              )}

            </div>


            <span
              className={`
                book-detail-status
                book-detail-status--${statusClass}
              `}
            >
              {book.status}
            </span>

          </div>

        </div>


        <div className="book-detail-header-actions">

          <Link
            href={`/studio/books/${book.id}/edit`}
            className="book-detail-edit"
          >
            Edit
          </Link>

        </div>

      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <div className="book-detail-layout">

        {/* =================================================
            LEFT — COVER
            ================================================= */}

        <aside className="book-detail-cover-column">

          <div className="book-detail-cover">

            {coverMedia?.public_url ? (

              <img
                src={
                  coverMedia.public_url
                }
                alt={
                  coverMedia.alt_text ||
                  coverMedia.title ||
                  book.title
                }
              />

            ) : (

              <div className="book-detail-cover-empty">

                <span>
                  BOOK
                </span>

                <strong>
                  No cover
                </strong>

              </div>

            )}

          </div>


          <div className="book-detail-cover-meta">

            <span>
              COVER
            </span>

            <strong>
              {coverMedia
                ? "Available"
                : "Not uploaded"}
            </strong>

          </div>


          {/* =================================================
              PDF QUICK STATUS
              ================================================= */}

          <div className="book-detail-cover-meta">

            <span>
              BOOK FILE
            </span>

            <strong>
              {hasPdf
                ? "PDF available"
                : "Not uploaded"}
            </strong>

          </div>


          {/* =================================================
              HARDCOPY QUICK STATUS
              ================================================= */}

          <div className="book-detail-cover-meta">

            <span>
              HARDCOPY
            </span>

            <strong>
              {hardcopyAvailable
                ? hardcopyStatusLabel
                : "Not available"}
            </strong>

          </div>

        </aside>


        {/* =================================================
            RIGHT — INFORMATION
            ================================================= */}

        <section className="book-detail-content">

          {/* =================================================
              01 — PUBLICATION
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                01
              </span>


              <div>

                <h2>
                  Publication
                </h2>

                <p>
                  Information about this
                  publication.
                </p>

              </div>

            </div>


            <div className="book-detail-info-grid">

              <div className="book-detail-info">

                <span>
                  TITLE
                </span>

                <strong>
                  {book.title}
                </strong>

              </div>


              <div className="book-detail-info">

                <span>
                  TYPE
                </span>

                <strong>
                  {book.book_type}
                </strong>

              </div>


              <div className="book-detail-info">

                <span>
                  AUTHOR
                </span>

                <strong>
                  {authorName}
                </strong>

              </div>


              <div className="book-detail-info">

                <span>
                  STATUS
                </span>

                <strong>
                  {book.status}
                </strong>

              </div>


              <div className="book-detail-info">

                <span>
                  CREATED
                </span>

                <strong>
                  {formatDate(
                    book.created_at
                  )}
                </strong>

              </div>


              <div className="book-detail-info">

                <span>
                  PUBLISHED
                </span>

                <strong>
                  {formatDate(
                    book.published_at
                  )}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              02 — DESCRIPTION
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                02
              </span>


              <div>

                <h2>
                  Description
                </h2>

              </div>

            </div>


            {book.description ? (

              <div className="book-detail-description">

                {book.description}

              </div>

            ) : (

              <div className="book-detail-empty-text">

                No description has been added.

              </div>

            )}

          </section>


          {/* =================================================
              03 — BOOK FILE
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                03
              </span>


              <div>

                <h2>
                  Book file
                </h2>

                <p>
                  The digital publication
                  file associated with this book.
                </p>

              </div>

            </div>


            {hasPdf ? (

              <article className="book-detail-audio">

                <div className="book-detail-audio-icon">
                  PDF
                </div>


                <div className="book-detail-audio-main">

                  <h3>
                    {book.title}
                  </h3>


                  <div className="book-detail-audio-meta">

                    <span>
                      {
                        book.pdf_mime_type ||
                        "application/pdf"
                      }
                    </span>


                    <span>
                      /
                    </span>


                    <span>
                      {
                        formatFileSize(
                          book.pdf_file_size
                        )
                      }
                    </span>


                    <span>
                      /
                    </span>


                    <span>
                      PDF publication
                    </span>

                  </div>

                </div>


                {pdfUrl && (

                  <a
                    href={
                      pdfUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="book-detail-audio-open"
                  >
                    Open

                    <span>
                      ↗
                    </span>

                  </a>

                )}

              </article>

            ) : (

              <div className="book-detail-empty">

                <div className="book-detail-empty-icon">
                  +
                </div>


                <h3>
                  No book file
                </h3>


                <p>
                  A PDF publication file
                  has not been uploaded.
                </p>


                <Link
                  href={`/studio/books/${book.id}/edit`}
                  className="book-detail-audio-open"
                >
                  Upload PDF

                  <span>
                    ↗
                  </span>

                </Link>

              </div>

            )}

          </section>


          {/* =================================================
              04 — PRICING & ACCESS
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                04
              </span>


              <div>

                <h2>
                  Pricing & access
                </h2>

                <p>
                  Commercial model and
                  reader permissions.
                </p>

              </div>

            </div>


            <div className="book-detail-info-grid">

              {/* PRICING */}

              <div className="book-detail-info">

                <span>
                  PRICING
                </span>

                <strong>
                  {pricingLabel}
                </strong>

              </div>


              {/* PRICING TYPE */}

              <div className="book-detail-info">

                <span>
                  PRICING TYPE
                </span>

                <strong>
                  {book.pricing_type}
                </strong>

              </div>


              {/* CURRENCY */}

              <div className="book-detail-info">

                <span>
                  CURRENCY
                </span>

                <strong>
                  {book.currency}
                </strong>

              </div>


              {/* READING */}

              <div className="book-detail-info">

                <span>
                  READING ACCESS
                </span>

                <strong>
                  {readingAccessLabel}
                </strong>

              </div>


              {/* DOWNLOAD */}

              <div className="book-detail-info">

                <span>
                  DOWNLOAD ACCESS
                </span>

                <strong>
                  {downloadAccessLabel}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              05 — HARDCOPY EDITION
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                05
              </span>


              <div>

                <h2>
                  Hardcopy edition
                </h2>

                <p>
                  Physical edition availability
                  and ordering configuration.
                </p>

              </div>


              <span className="book-detail-section-count">

                {hardcopyAvailable
                  ? "ENABLED"
                  : "DISABLED"}

              </span>

            </div>


            {hardcopyAvailable ? (

              <div className="book-detail-info-grid">

                {/* PRICE */}

                <div className="book-detail-info">

                  <span>
                    HARDCOPY PRICE
                  </span>

                  <strong>
                    {hardcopyPriceLabel}
                  </strong>

                </div>


                {/* CURRENCY */}

                <div className="book-detail-info">

                  <span>
                    CURRENCY
                  </span>

                  <strong>
                    {book.hardcopy_currency}
                  </strong>

                </div>


                {/* STATUS */}

                <div className="book-detail-info">

                  <span>
                    AVAILABILITY
                  </span>

                  <strong>
                    {hardcopyStatusLabel}
                  </strong>

                </div>


                {/* ORDERING */}

                <div className="book-detail-info">

                  <span>
                    ORDERING
                  </span>

                  <strong>
                    {book.hardcopy_status ===
                    "unavailable"
                      ? "Orders disabled"
                      : "Orders enabled"}

                  </strong>

                </div>

              </div>

            ) : (

              <div className="book-detail-empty">

                <div className="book-detail-empty-icon">
                  —
                </div>


                <h3>
                  No hardcopy edition
                </h3>


                <p>
                  This publication is currently
                  configured as digital-only.
                </p>


                <Link
                  href={`/studio/books/${book.id}/edit`}
                  className="book-detail-audio-open"
                >
                  Enable Hardcopy

                  <span>
                    ↗
                  </span>

                </Link>

              </div>

            )}

          </section>


          {/* =================================================
              06 — AUDIO EDITIONS
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                06
              </span>


              <div>

                <h2>
                  Audio editions
                </h2>

                <p>
                  Audiobook and audio assets
                  associated with this book.
                </p>

              </div>


              <span className="book-detail-section-count">

                {audioEditions.length}{" "}

                {audioEditions.length ===
                1
                  ? "EDITION"
                  : "EDITIONS"}

              </span>

            </div>


            {audioEditions.length ===
            0 ? (

              <div className="book-detail-empty">

                <div className="book-detail-empty-icon">
                  +
                </div>


                <h3>
                  No audio edition
                </h3>


                <p>
                  No audiobook has been
                  attached to this publication.
                </p>

              </div>

            ) : (

              <div className="book-detail-audio-list">

                {audioEditions.map(
                  (
                    edition,
                    index
                  ) => {

                    const media =
                      edition.media;


                    return (

                      <article
                        key={
                          edition.id
                        }
                        className="book-detail-audio"
                      >

                        <div className="book-detail-audio-number">

                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>


                        <div className="book-detail-audio-icon">
                          AUD
                        </div>


                        <div className="book-detail-audio-main">

                          <h3>

                            {
                              edition.title ||
                              media?.title ||
                              "Audio edition"
                            }

                          </h3>


                          <div className="book-detail-audio-meta">

                            <span>
                              {
                                media?.mime_type ||
                                "AUDIO"
                              }
                            </span>


                            <span>
                              /
                            </span>


                            <span>
                              {
                                formatDuration(
                                  media?.duration_seconds ??
                                  null
                                )
                              }
                            </span>


                            <span>
                              /
                            </span>


                            <span>
                              {
                                formatFileSize(
                                  media?.file_size ??
                                  null
                                )
                              }
                            </span>

                          </div>

                        </div>


                        {media?.public_url && (

                          <a
                            href={
                              media.public_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="book-detail-audio-open"
                          >
                            Open

                            <span>
                              ↗
                            </span>

                          </a>

                        )}

                      </article>

                    );

                  }
                )}

              </div>

            )}

          </section>


          {/* =================================================
              07 — MEDIA SUMMARY
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                07
              </span>


              <div>

                <h2>
                  Media
                </h2>

                <p>
                  Media assets associated with
                  this publication.
                </p>

              </div>

            </div>


            <div className="book-detail-media-summary">

              <div>

                <span>
                  COVER
                </span>

                <strong>
                  {coverMedia
                    ? "1"
                    : "0"}
                </strong>

              </div>


              <div>

                <span>
                  PDF
                </span>

                <strong>
                  {hasPdf
                    ? "1"
                    : "0"}
                </strong>

              </div>


              <div>

                <span>
                  AUDIO
                </span>

                <strong>
                  {
                    audioEditions.length
                  }
                </strong>

              </div>


              <div>

                <span>
                  HARDCOPY
                </span>

                <strong>
                  {hardcopyAvailable
                    ? "1"
                    : "0"}
                </strong>

              </div>


              <div>

                <span>
                  TOTAL ATTACHED
                </span>

                <strong>
                  {
                    attachedMedia.length +
                    (hasPdf
                      ? 1
                      : 0)
                  }
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
              08 — METADATA
              ================================================= */}

          <section className="book-detail-section">

            <div className="book-detail-section-heading">

              <span>
                08
              </span>


              <div>

                <h2>
                  Metadata
                </h2>

              </div>

            </div>


            <div className="book-detail-metadata">

              <div>

                <span>
                  SLUG
                </span>

                <code>
                  {book.slug}
                </code>

              </div>


              <div>

                <span>
                  BOOK ID
                </span>

                <code>
                  {book.id}
                </code>

              </div>


              <div>

                <span>
                  PDF BUCKET
                </span>

                <code>
                  {book.pdf_bucket ||
                    "—"}
                </code>

              </div>


              <div>

                <span>
                  PDF PATH
                </span>

                <code>
                  {book.pdf_path ||
                    "—"}
                </code>

              </div>


              <div>

                <span>
                  LAST UPDATED
                </span>

                <strong>
                  {formatDate(
                    book.updated_at
                  )}
                </strong>

              </div>

            </div>

          </section>

        </section>

      </div>

    </main>

  );
}