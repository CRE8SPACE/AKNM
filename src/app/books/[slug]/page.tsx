import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import BookPurchaseButton from "@/components/Books/BookPurchaseButton";
import BookHardcopyOrderButton from "@/components/Books/BookHardcopyOrderButton";

import { createClient } from "@/lib/supabase/server";

import "./book-detail.css";


/* =========================================================
   ICONS
   ========================================================= */

/**
 * AKNM.PRO standard ArrowUpRight icon.
 *
 * IMPORTANT:
 * This is the same arrow SVG used throughout the
 * AKNM.PRO interface.
 *
 * Do not replace with:
 * - Unicode arrows
 * - emoji arrows
 * - text characters
 * - CSS-drawn arrows
 */
function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="book-public__arrow-icon"
    >
      <path
        d="M3 13L13 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 3H13V10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


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

  pdf_bucket: string | null;
  pdf_path: string | null;
  pdf_mime_type: string | null;
  pdf_file_size: number | null;

  price: number | null;
  currency: string;
  pricing_type: string;

  reading_access: string;
  download_access: string;

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

function formatType(
  value: string
) {

  return value
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

}


function formatDate(
  value: string | null
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    date
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


function formatPrice(
  price: number | null,
  currency: string,
  pricingType: string
) {

  if (
    pricingType ===
    "free"
  ) {
    return "FREE";
  }


  if (
    price === null ||
    price === undefined
  ) {
    return "PRICE NOT SET";
  }


  return `${currency} ${Number(
    price
  ).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  )}`;

}


function formatHardcopyPrice(
  price: number | null,
  currency: string
) {

  if (
    price === null ||
    price === undefined
  ) {
    return "PRICE NOT SET";
  }


  return `${currency} ${Number(
    price
  ).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  )}`;

}


function getCover(
  media: Media | null
) {

  return (
    media?.public_url ||
    media?.thumbnail_url ||
    null
  );

}


/* =========================================================
   ACCESS HELPERS
   ========================================================= */

function canRead(
  book: Book
) {

  return (
    book.reading_access ===
    "free"
  );

}


function canDownload(
  book: Book
) {

  return (
    book.download_access ===
    "free"
  );

}


/* =========================================================
   HARDCOPY HELPERS
   ========================================================= */

function hasHardcopy(
  book: Book
) {

  return Boolean(
    book.hardcopy_available
  );

}


function canOrderHardcopy(
  book: Book
) {

  return (
    book.hardcopy_available &&
    (
      book.hardcopy_status ===
        "available" ||
      book.hardcopy_status ===
        "preorder"
    ) &&
    book.hardcopy_price !==
      null &&
    Number(
      book.hardcopy_price
    ) > 0
  );

}


function getHardcopyStatusLabel(
  status: string
) {

  if (
    status ===
    "available"
  ) {
    return "Available for order";
  }


  if (
    status ===
    "preorder"
  ) {
    return "Available for pre-order";
  }


  if (
    status ===
    "unavailable"
  ) {
    return "Temporarily unavailable";
  }


  return formatType(
    status
  );

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function PublicBookPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {

  const {
    slug,
  } =
    await params;


  const supabase =
    await createClient();


  /* =======================================================
     BOOK
     ======================================================= */

  const {
    data: bookData,
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
        "slug",
        slug
      )
      .eq(
        "status",
        "published"
      )
      .maybeSingle();


  if (
    bookError
  ) {

    console.error(
      "Public book fetch error:",
      bookError
    );

  }


  if (!bookData) {
    notFound();
  }


  const book =
    bookData as Book;


  /* =======================================================
     COVER
     ======================================================= */

  let coverMedia:
    Media | null =
    null;


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
        "Public book cover error:",
        coverError
      );

    }


    coverMedia =
      cover as Media | null;

  }


  /* =======================================================
     ATTACHED MEDIA
     ======================================================= */

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
          ascending: true,
        }
      );


  if (
    mediaError
  ) {

    console.error(
      "Public book media error:",
      mediaError
    );

  }


  const attachedMedia =
    (bookMediaRows ?? []) as unknown as BookMedia[];


  const audioEditions =
    attachedMedia.filter(
      (item) =>
        item.media_role ===
        "audio"
    );


  /* =======================================================
     AUTHOR
     ======================================================= */

  let authorName =
    "Akonam";


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
        "Public book author error:",
        authorError
      );

    }


    if (
      author
    ) {

      authorName =
        author.display_name ||
        author.username ||
        "Akonam";

    }

  }


  /* =======================================================
     COVER URL
     ======================================================= */

  const coverUrl =
    getCover(
      coverMedia
    );


  /* =======================================================
     ACCESS
     ======================================================= */

  const readingFree =
    canRead(
      book
    );


  const downloadAvailable =
    canDownload(
      book
    );


  /* =======================================================
     PDF ACCESS
     ======================================================= */

  let readingUrl:
    string | null =
    null;

  let downloadUrl:
    string | null =
    null;


  if (
    book.pdf_bucket &&
    book.pdf_path
  ) {

    if (
      readingFree
    ) {

      const {
        data:
          signedRead,
        error:
          readUrlError,
      } =
        await supabase.storage
          .from(
            book.pdf_bucket
          )
          .createSignedUrl(
            book.pdf_path,
            60 * 60
          );


      if (
        readUrlError
      ) {

        console.error(
          "Public book reading URL error:",
          readUrlError
        );

      } else {

        readingUrl =
          signedRead?.signedUrl ??
          null;

      }

    }


    if (
      downloadAvailable
    ) {

      const {
        data:
          signedDownload,
        error:
          downloadUrlError,
      } =
        await supabase.storage
          .from(
            book.pdf_bucket
          )
          .createSignedUrl(
            book.pdf_path,
            60 * 60,
            {
              download:
                true,
            }
          );


      if (
        downloadUrlError
      ) {

        console.error(
          "Public book download URL error:",
          downloadUrlError
        );

      } else {

        downloadUrl =
          signedDownload?.signedUrl ??
          null;

      }

    }

  }


  /* =======================================================
     FILE STATE
     ======================================================= */

  const hasPdf =
    Boolean(
      book.pdf_bucket &&
      book.pdf_path
    );


  const canReadNow =
    Boolean(
      readingFree &&
      readingUrl
    );


  const canDownloadNow =
    Boolean(
      downloadAvailable &&
      downloadUrl
    );


  /* =======================================================
     PAID BOOK STATE
     ======================================================= */

  const isPaidBook =
    book.pricing_type ===
      "paid" &&
    book.price !== null &&
    Number(book.price) > 0;


  /* =======================================================
     HARDCOPY STATE
     ======================================================= */

  const hardcopyAvailable =
    hasHardcopy(
      book
    );


  const hardcopyOrderable =
    canOrderHardcopy(
      book
    );


  const hardcopyStatusLabel =
    getHardcopyStatusLabel(
      book.hardcopy_status
    );


  const hardcopyStatusClass =
    book.hardcopy_status ===
      "preorder"
      ? "book-public-hardcopy--preorder"
      : book.hardcopy_status ===
          "unavailable"
        ? "book-public-hardcopy--unavailable"
        : "";


  /* =======================================================
     RETURN
     ======================================================= */

  return (
    <>

      <Header />


      <main className="book-public-page">


        {/* =================================================
            HERO
            ================================================= */}

        <section className="book-public-hero">

          <div className="book-public-container">


            <Link
              href="/books"
              className="book-public-back"
            >
              <span>
                Back to Books
              </span>

              <ArrowUpRightIcon />
            </Link>


            <div className="book-public-hero-grid">


              {/* =================================================
                  COVER
                  ================================================= */}

              <div className="book-public-cover">

                {coverUrl ? (

                  <img
                    src={coverUrl}
                    alt={
                      coverMedia?.alt_text ||
                      book.title
                    }
                  />

                ) : (

                  <div className="book-public-cover-empty">

                    <span>
                      AKNM
                    </span>


                    <strong>
                      {
                        book.title
                      }
                    </strong>

                  </div>

                )}

              </div>


              {/* =================================================
                  INTRO
                  ================================================= */}

              <div className="book-public-intro">

                <div className="book-public-eyebrow">

                  <span>
                    {
                      formatType(
                        book.book_type
                      ).toUpperCase()
                    }
                  </span>


                  <span>
                    PUBLISHED
                  </span>

                </div>


                <h1>
                  {
                    book.title
                  }
                </h1>


                {book.subtitle && (

                  <p className="book-public-subtitle">
                    {
                      book.subtitle
                    }
                  </p>

                )}


                <div className="book-public-author">

                  <span>
                    Written by
                  </span>


                  <strong>
                    {
                      authorName
                    }
                  </strong>

                </div>


                <div className="book-public-price">

                  <span>
                    {
                      formatPrice(
                        book.price,
                        book.currency,
                        book.pricing_type
                      )
                    }
                  </span>


                  {readingFree && (

                    <small>
                      Free to read
                    </small>

                  )}

                </div>


                {/* =================================================
                    DIGITAL ACTIONS
                    ================================================= */}

                <div className="book-public-actions">


                  {canReadNow && (

                    <a
                      href={
                        readingUrl as string
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="book-public-primary-action"
                    >

                      <span>
                        Read book
                      </span>

                      <ArrowUpRightIcon />

                    </a>

                  )}


                  {!readingFree &&
                    isPaidBook && (

                    <BookPurchaseButton
                      bookId={
                        book.id
                      }

                      title={
                        book.title
                      }

                      coverUrl={
                        coverUrl
                      }

                      price={
                        Number(
                          book.price
                        )
                      }

                      currency={
                        book.currency
                      }
                    />

                  )}


                  {!readingFree &&
                    !isPaidBook && (

                    <span
                      className="book-public-access-note"
                    >
                      Purchase access is
                      not currently available.
                    </span>

                  )}


                  {canDownloadNow && (

                    <a
                      href={
                        downloadUrl as string
                      }
                      download
                      className="book-public-secondary-action"
                    >

                      <span>
                        Download PDF
                      </span>

                      <ArrowUpRightIcon />

                    </a>

                  )}


                  {readingFree &&
                    !hasPdf && (

                    <span
                      className="book-public-access-note"
                    >
                      Digital reading file
                      unavailable.
                    </span>

                  )}

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTENT
            ================================================= */}

        <section className="book-public-content">

          <div className="book-public-container">


            {/* =================================================
                ABOUT
                ================================================= */}

            <section className="book-public-section">

              <div className="book-public-section-heading">

                <span>
                  01
                </span>


                <div>

                  <span>
                    About the book
                  </span>


                  <h2>
                    The work.
                  </h2>

                </div>

              </div>


              <div className="book-public-description">

                {book.description ? (

                  <p>
                    {
                      book.description
                    }
                  </p>

                ) : (

                  <p>
                    No description has
                    been provided for
                    this publication.
                  </p>

                )}

              </div>

            </section>


            {/* =================================================
                ACCESS
                ================================================= */}

            <section className="book-public-section">

              <div className="book-public-section-heading">

                <span>
                  02
                </span>


                <div>

                  <span>
                    Access
                  </span>


                  <h2>
                    How to access it.
                  </h2>

                </div>

              </div>


              <div className="book-public-access-grid">

                <div>

                  <span>
                    READING
                  </span>


                  <strong>
                    {
                      readingFree
                        ? "Free"
                        : "Purchase required"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    DOWNLOAD
                  </span>


                  <strong>
                    {
                      downloadAvailable
                        ? "Available"
                        : book.download_access ===
                            "purchase_required"
                          ? "Purchase required"
                          : "Not available"
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    PRICE
                  </span>


                  <strong>
                    {
                      formatPrice(
                        book.price,
                        book.currency,
                        book.pricing_type
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    FORMAT
                  </span>


                  <strong>
                    {
                      hasPdf
                        ? "PDF"
                        : "Digital"
                    }
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                HARDCOPY
                ================================================= */}

            {hardcopyAvailable && (

              <section className="book-public-section">

                <div className="book-public-section-heading">

                  <span>
                    03
                  </span>


                  <div>

                    <span>
                      Hardcopy edition
                    </span>


                    <h2>
                      The physical book.
                    </h2>

                  </div>

                </div>


                <div
                  className={`book-public-hardcopy ${hardcopyStatusClass}`}
                >

                  <div className="book-public-hardcopy-info">


                    <div>

                      <span>
                        EDITION
                      </span>


                      <strong>
                        Printed book
                      </strong>

                    </div>


                    <div>

                      <span>
                        PRICE
                      </span>


                      <strong>
                        {
                          formatHardcopyPrice(
                            book.hardcopy_price,
                            book.hardcopy_currency
                          )
                        }
                      </strong>

                    </div>


                    <div>

                      <span>
                        STATUS
                      </span>


                      <strong>
                        {
                          hardcopyStatusLabel
                        }
                      </strong>

                    </div>

                  </div>


                  <div className="book-public-hardcopy-action">

                    {hardcopyOrderable ? (

                      <BookHardcopyOrderButton
                        bookId={
                          book.id
                        }

                        title={
                          book.title
                        }

                        slug={
                          book.slug
                        }

                        coverUrl={
                          coverUrl
                        }

                        price={
                          Number(
                            book.hardcopy_price
                          )
                        }

                        currency={
                          book.hardcopy_currency
                        }

                        status={
                          book.hardcopy_status
                        }
                      />

                    ) : (

                      <span
                        className="book-public-access-note"
                      >
                        Hardcopy ordering is
                        currently unavailable.
                      </span>

                    )}

                  </div>

                </div>

              </section>

            )}


            {/* =================================================
                AUDIO
                ================================================= */}

            {audioEditions.length >
              0 && (

              <section className="book-public-section">

                <div className="book-public-section-heading">

                  <span>
                    04
                  </span>


                  <div>

                    <span>
                      Audio
                    </span>


                    <h2>
                      Listen instead.
                    </h2>

                  </div>

                </div>


                <div className="book-public-audio-list">

                  {audioEditions.map(
                    (
                      edition
                    ) => {

                      const media =
                        edition.media;


                      return (

                        <article
                          key={
                            edition.id
                          }
                          className="book-public-audio"
                        >

                          <div>

                            <span>
                              AUDIO
                            </span>


                            <h3>
                              {
                                edition.title ||
                                media?.title ||
                                "Audio edition"
                              }
                            </h3>

                          </div>


                          {media?.public_url && (

                            <a
                              href={
                                media.public_url
                              }
                              target="_blank"
                              rel="noreferrer"
                            >

                              <span>
                                Listen
                              </span>

                              <ArrowUpRightIcon />

                            </a>

                          )}

                        </article>

                      );

                    }
                  )}

                </div>

              </section>

            )}


            {/* =================================================
                PUBLICATION INFO
                ================================================= */}

            <section className="book-public-section">

              <div className="book-public-section-heading">

                <span>
                  05
                </span>


                <div>

                  <span>
                    Publication
                  </span>


                  <h2>
                    Publication details.
                  </h2>

                </div>

              </div>


              <div className="book-public-meta">

                <div>

                  <span>
                    TYPE
                  </span>


                  <strong>
                    {
                      formatType(
                        book.book_type
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    AUTHOR
                  </span>


                  <strong>
                    {
                      authorName
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    PUBLISHED
                  </span>


                  <strong>
                    {
                      formatDate(
                        book.published_at
                      )
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    FILE
                  </span>


                  <strong>
                    {
                      book.pdf_file_size
                        ? formatFileSize(
                            book.pdf_file_size
                          )
                        : "—"
                    }
                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                CLOSING
                ================================================= */}

            <section className="book-public-closing">

              <span>
                AKNM PUBLISHING
              </span>


              <h2>
                Ideas worth
                <br />
                reading.
              </h2>


              <Link
                href="/books"
              >

                <span>
                  Explore the library
                </span>

                <ArrowUpRightIcon />

              </Link>

            </section>


          </div>

        </section>

      </main>


      <Footer />

    </>
  );

}