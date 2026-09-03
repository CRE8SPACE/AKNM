import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./books.css";


/* =========================================================
   TYPES
   ========================================================= */

type BookStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";


type HardcopyStatus =
  | "available"
  | "preorder"
  | "unavailable";


type Book = {
  id: string;

  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;

  book_type: string;

  status:
    | BookStatus;

  published_at: string | null;
  created_at: string;

  /*
   * HARDCOPY
   */

  hardcopy_available: boolean;
  hardcopy_price: number | null;
  hardcopy_currency: string;
  hardcopy_status: HardcopyStatus;

  cover_media: {
    public_url: string | null;
    thumbnail_url: string | null;
    alt_text: string | null;
  } | null;
};


/* =========================================================
   HELPERS
   ========================================================= */

function getHardcopyStatusLabel(
  available: boolean,
  status: HardcopyStatus
) {

  if (
    !available
  ) {
    return "Digital only";
  }


  switch (
    status
  ) {

    case "available":
      return "Available";

    case "preorder":
      return "Pre-order";

    case "unavailable":
      return "Unavailable";

    default:
      return "Unavailable";

  }

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function BooksPage() {

  const supabase =
    await createClient();


  /* =======================================================
     LOAD BOOKS
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase
      .from("books")
      .select(`
        id,
        title,
        slug,
        subtitle,
        description,
        book_type,
        status,
        published_at,
        created_at,

        hardcopy_available,
        hardcopy_price,
        hardcopy_currency,
        hardcopy_status,

        cover_media:media!books_cover_media_id_fkey (
          public_url,
          thumbnail_url,
          alt_text
        )
      `)
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (
    error
  ) {

    console.error(
      "Books library error:",
      error
    );

  }


  const books:
    Book[] =
    (data ?? []).map(
      (
        book
      ) => ({

        id:
          book.id,

        title:
          book.title,

        slug:
          book.slug,

        subtitle:
          book.subtitle,

        description:
          book.description,

        book_type:
          book.book_type,

        status:
          book.status as BookStatus,

        published_at:
          book.published_at,

        created_at:
          book.created_at,

        hardcopy_available:
          Boolean(
            book.hardcopy_available
          ),

        hardcopy_price:
          book.hardcopy_price !==
            null &&
          book.hardcopy_price !==
            undefined
            ? Number(
                book.hardcopy_price
              )
            : null,

        hardcopy_currency:
          book.hardcopy_currency ||
          "NGN",

        hardcopy_status:
          (
            book.hardcopy_status ||
            (
              book.hardcopy_available
                ? "available"
                : "unavailable"
            )
          ) as HardcopyStatus,

        cover_media:
          Array.isArray(
            book.cover_media
          )
            ? book.cover_media[0] ??
              null
            : book.cover_media ??
              null,

      })
    );


  /* =======================================================
     STATISTICS
     ======================================================= */

  const publishedCount =
    books.filter(
      (
        book
      ) =>
        book.status ===
        "published"
    ).length;


  const draftCount =
    books.filter(
      (
        book
      ) =>
        book.status ===
        "draft"
    ).length;


  const scheduledCount =
    books.filter(
      (
        book
      ) =>
        book.status ===
        "scheduled"
    ).length;


  const archivedCount =
    books.filter(
      (
        book
      ) =>
        book.status ===
        "archived"
    ).length;


  const hardcopyCount =
    books.filter(
      (
        book
      ) =>
        book.hardcopy_available
    ).length;


  const preorderCount =
    books.filter(
      (
        book
      ) =>
        book.hardcopy_available &&
        book.hardcopy_status ===
          "preorder"
    ).length;


  return (

    <main className="books-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <section className="books-header">

        <div className="books-header__intro">

          <span className="books-header__eyebrow">
            AKNM STUDIO / BOOKS
          </span>


          <h1>
            Books
          </h1>


          <p>
            Create, manage and publish
            your books and publications.
          </p>

        </div>


        <Link
          href="/studio/books/new"
          className="books-header__create"
        >

          <span>
            New Book
          </span>


          <span>
            +
          </span>

        </Link>

      </section>


      {/* =================================================
          STATS
          ================================================= */}

      <section
        className="books-stats"
        aria-label="Books statistics"
      >

        <div className="books-stat">

          <span>
            ALL
          </span>


          <strong>
            {books.length}
          </strong>


          <small>
            Total books
          </small>

        </div>


        <div className="books-stat">

          <span>
            PUBLISHED
          </span>


          <strong>
            {publishedCount}
          </strong>


          <small>
            Published books
          </small>

        </div>


        <div className="books-stat">

          <span>
            DRAFTS
          </span>


          <strong>
            {draftCount}
          </strong>


          <small>
            Work in progress
          </small>

        </div>


        <div className="books-stat">

          <span>
            SCHEDULED
          </span>


          <strong>
            {scheduledCount}
          </strong>


          <small>
            Waiting to publish
          </small>

        </div>


        <div className="books-stat">

          <span>
            HARDCOPY
          </span>


          <strong>
            {hardcopyCount}
          </strong>


          <small>
            Physical editions
          </small>

        </div>


        <div className="books-stat">

          <span>
            PRE-ORDER
          </span>


          <strong>
            {preorderCount}
          </strong>


          <small>
            Awaiting release
          </small>

        </div>


        <div className="books-stat">

          <span>
            ARCHIVED
          </span>


          <strong>
            {archivedCount}
          </strong>


          <small>
            Archived books
          </small>

        </div>

      </section>


      {/* =================================================
          LIBRARY
          ================================================= */}

      <section className="books-library">

        <div className="books-library__header">

          <div>

            <span>
              YOUR LIBRARY
            </span>


            <h2>
              Recent books
            </h2>

          </div>


          <span className="books-library__count">

            {books.length}{" "}

            {books.length ===
            1
              ? "BOOK"
              : "BOOKS"}

          </span>

        </div>


        {books.length ===
        0 ? (

          <div className="books-empty">

            <div className="books-empty__icon">
              +
            </div>


            <h3>
              Your library starts here.
            </h3>


            <p>
              Create your first book and
              begin building your
              publication library.
            </p>


            <Link
              href="/studio/books/new"
              className="books-empty__button"
            >

              Create your first book

              <span>
                ↗
              </span>

            </Link>

          </div>

        ) : (

          <div className="books-list">

            {books.map(
              (
                book
              ) => {

                const cover =
                  book.cover_media
                    ?.thumbnail_url ||
                  book.cover_media
                    ?.public_url ||
                  null;


                const hardcopyLabel =
                  getHardcopyStatusLabel(
                    book.hardcopy_available,
                    book.hardcopy_status
                  );


                return (

                  <article
                    key={
                      book.id
                    }
                    className="book-item"
                  >

                    {/* =================================
                        COVER
                        ================================= */}

                    <Link
                      href={`/studio/books/${book.id}`}
                      className="book-item__cover"
                    >

                      {cover ? (

                        <img
                          src={
                            cover
                          }
                          alt={
                            book.cover_media
                              ?.alt_text ||
                            book.title
                          }
                        />

                      ) : (

                        <div className="book-item__cover-empty">
                          BOOK
                        </div>

                      )}

                    </Link>


                    {/* =================================
                        TYPE
                        ================================= */}

                    <div className="book-item__type">

                      {book.book_type
                        .slice(
                          0,
                          3
                        )
                        .toUpperCase()}

                    </div>


                    {/* =================================
                        MAIN
                        ================================= */}

                    <div className="book-item__main">

                      <Link
                        href={`/studio/books/${book.id}`}
                        className="book-item__title-link"
                      >

                        <h3>
                          {book.title}
                        </h3>

                      </Link>


                      {book.subtitle && (

                        <p className="book-item__subtitle">
                          {book.subtitle}
                        </p>

                      )}


                      <div className="book-item__meta">

                        <span>

                          {new Date(
                            book.created_at
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
                          )}

                        </span>


                        <span>
                          /
                        </span>


                        <span>
                          {book.book_type}
                        </span>


                        <span>
                          /
                        </span>


                        <span
                          className={`
                            book-item__hardcopy
                            book-item__hardcopy--${book.hardcopy_available
                              ? book.hardcopy_status
                              : "unavailable"}
                          `}
                        >

                          {hardcopyLabel}

                        </span>

                      </div>

                    </div>


                    {/* =================================
                        HARDCOPY
                        ================================= */}

                    <div
                      className={`
                        book-item__hardcopy-status
                        book-item__hardcopy-status--${
                          book.hardcopy_available
                            ? book.hardcopy_status
                            : "unavailable"
                        }
                      `}
                    >

                      <span>
                        HARDCOPY
                      </span>


                      <strong>
                        {hardcopyLabel}
                      </strong>


                      {book.hardcopy_available &&
                        book.hardcopy_price !==
                          null && (

                        <small>

                          {book.hardcopy_currency}{" "}

                          {book.hardcopy_price.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits:
                                2,

                              maximumFractionDigits:
                                2,
                            }
                          )}

                        </small>

                      )}

                    </div>


                    {/* =================================
                        STATUS
                        ================================= */}

                    <div
                      className={`
                        book-item__status
                        book-item__status--${book.status}
                      `}
                    >

                      {book.status}

                    </div>


                    {/* =================================
                        ACTIONS
                        ================================= */}

                    <div className="book-item__actions">

                      <Link
                        href={`/studio/books/${book.id}`}
                        className="book-item__action"
                      >
                        View
                      </Link>


                      <Link
                        href={`/studio/books/${book.id}/edit`}
                        className="book-item__action"
                      >
                        Edit
                      </Link>

                    </div>


                    {/* =================================
                        ARROW
                        ================================= */}

                    <Link
                      href={`/studio/books/${book.id}`}
                      className="book-item__arrow"
                      aria-label={`Open ${book.title}`}
                    >
                      ↗
                    </Link>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>

    </main>

  );

}