import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { createClient } from "@/lib/supabase/server";

import "./books.css";


/* =========================================================
   TYPES
   ========================================================= */

type Book = {
  id: string;

  title: string;
  slug: string;

  subtitle: string | null;
  description: string | null;

  book_type: string;

  status: string;

  published_at: string | null;

  cover_media: {
    public_url: string | null;
    thumbnail_url: string | null;
    alt_text: string | null;
  } | null;

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


function getCover(
  book: Book
) {
  return (
    book.cover_media?.public_url ||
    book.cover_media?.thumbnail_url ||
    null
  );
}


function getReadingLabel(
  access: string
) {
  if (
    access ===
    "free"
  ) {
    return "FREE READING";
  }

  if (
    access ===
    "paid"
  ) {
    return "PURCHASE REQUIRED";
  }

  return formatType(
    access
  ).toUpperCase();
}


function getDownloadLabel(
  access: string
) {
  if (
    access ===
    "available"
  ) {
    return "DOWNLOAD AVAILABLE";
  }

  if (
    access ===
    "paid"
  ) {
    return "DOWNLOAD AFTER PURCHASE";
  }

  if (
    access ===
    "not_available"
  ) {
    return "NO DOWNLOAD";
  }

  return formatType(
    access
  ).toUpperCase();
}


function getHardcopyLabel(
  available: boolean,
  status: string
) {
  if (!available) {
    return null;
  }

  if (
    status ===
    "available"
  ) {
    return "HARDCOPY AVAILABLE";
  }

  if (
    status ===
    "preorder"
  ) {
    return "PRE-ORDER";
  }

  if (
    status ===
    "unavailable"
  ) {
    return "HARDCOPY UNAVAILABLE";
  }

  return formatType(
    status
  ).toUpperCase();
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
  }>;
}) {

  const {
    type,
  } = await searchParams;


  const supabase =
    await createClient();


  /* =======================================================
     FETCH PUBLISHED BOOKS
     ======================================================= */

  let booksQuery =
    supabase
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

        price,
        currency,
        pricing_type,

        reading_access,
        download_access,

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
      .eq(
        "status",
        "published"
      );


  /* =======================================================
     TYPE FILTER
     ======================================================= */

  if (
    type &&
    type.trim()
  ) {

    booksQuery =
      booksQuery.eq(
        "book_type",
        type.trim()
      );

  }


  const {
    data,
    error,
  } =
    await booksQuery.order(
      "published_at",
      {
        ascending: false,
        nullsFirst: false,
      }
    );


  if (
    error
  ) {

    console.error(
      "Public books fetch error:",
      error
    );

  }


  /* =======================================================
     NORMALIZE
     ======================================================= */

  const books: Book[] =
    (data ?? []).map(
      (book) => ({

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
          book.status,

        published_at:
          book.published_at,

        price:
          book.price,

        currency:
          book.currency,

        pricing_type:
          book.pricing_type,

        reading_access:
          book.reading_access,

        download_access:
          book.download_access,

        hardcopy_available:
          Boolean(
            book.hardcopy_available
          ),

        hardcopy_price:
          book.hardcopy_price,

        hardcopy_currency:
          book.hardcopy_currency ||
          "NGN",

        hardcopy_status:
          book.hardcopy_status ||
          "unavailable",

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
     DYNAMIC TYPES
     ======================================================= */

  const bookTypes =
    Array.from(
      new Set(
        books.map(
          (book) =>
            book.book_type
        )
      )
    );


  /* =======================================================
     FEATURED BOOK
     ======================================================= */

  const featuredBook =
    books[0] ??
    null;


  const otherBooks =
    featuredBook
      ? books.filter(
          (book) =>
            book.id !==
            featuredBook.id
        )
      : [];


  return (
    <>

      <Header />


      <main className="books-page">


        {/* =================================================
            HERO
            ================================================= */}

        <section className="books-page__hero">

          <div className="books-page__container">


            <div className="books-page__eyebrow">

              <span className="books-page__line" />

              <span>
                Books & Writing
              </span>

            </div>


            <div className="books-page__hero-content">

              <h1>
                Ideas
                <br />
                in words.
              </h1>


              <p>
                Books, publications and
                written works created,
                collected and published
                through AKNM.PRO.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            LIBRARY
            ================================================= */}

        <section className="books-page__library">

          <div className="books-page__container">


            {/* =================================================
                FILTER
                ================================================= */}

            <div className="books-page__filters">

              <span>
                Explore
              </span>


              <div>


                {/* ALL */}

                <Link
                  href="/books"
                  className={
                    !type
                      ? "books-page__filter--active"
                      : ""
                  }
                >
                  ALL
                </Link>


                {/* DYNAMIC BOOK TYPES */}

                {bookTypes.map(
                  (
                    bookType
                  ) => (

                    <Link
                      key={
                        bookType
                      }
                      href={`/books?type=${encodeURIComponent(
                        bookType
                      )}`}
                      className={
                        type ===
                        bookType
                          ? "books-page__filter--active"
                          : ""
                      }
                    >
                      {
                        formatType(
                          bookType
                        ).toUpperCase()
                      }
                    </Link>

                  )
                )}

              </div>

            </div>


            {/* =================================================
                EMPTY LIBRARY
                ================================================= */}

            {books.length ===
              0 ? (

              <section className="books-page__featured">

                <div className="books-page__featured-label">
                  {type
                    ? `${formatType(
                        type
                      ).toUpperCase()} / AKNM PUBLISHING`
                    : "AKNM PUBLISHING"}
                </div>


                <div className="books-page__featured-card">

                  <div className="books-page__featured-content">

                    <div className="books-page__book-meta">

                      <span>
                        {type
                          ? formatType(
                              type
                            ).toUpperCase()
                          : "BOOKS"}
                      </span>


                      <span>
                        AKNM.PRO
                      </span>

                    </div>


                    <h2>
                      {type
                        ? "Nothing published here yet."
                        : "The library is beginning."}
                    </h2>


                    <p>
                      {type
                        ? `There are currently no published ${formatType(
                            type
                          ).toLowerCase()} items available through AKNM.PRO.`
                        : "Published books and publications will appear here as they are released through AKNM.PRO."}
                    </p>


                    {type && (

                      <Link
                        href="/books"
                        className="books-page__featured-actions"
                      >

                        <span>
                          View all books
                        </span>

                        <span>
                          ↗
                        </span>

                      </Link>

                    )}

                  </div>

                </div>

              </section>

            ) : (

              <>


                {/* =================================================
                    FEATURED BOOK
                    ================================================= */}

                {featuredBook && (

                  <section className="books-page__featured">

                    <div className="books-page__featured-label">
                      Published
                    </div>


                    <Link
                      href={`/books/${featuredBook.slug}`}
                      className="books-page__featured-card"
                    >


                      {/* =========================================
                          COVER
                          ========================================= */}

                      <div className="books-page__book-cover">

                        {getCover(
                          featuredBook
                        ) ? (

                          <img
                            src={
                              getCover(
                                featuredBook
                              ) as string
                            }
                            alt={
                              featuredBook
                                .cover_media
                                ?.alt_text ||
                              featuredBook.title
                            }
                          />

                        ) : (

                          <div className="books-page__cover-grid">

                            <div className="books-page__cover-title">

                              <span>
                                AKNM
                              </span>


                              <strong>
                                {
                                  featuredBook.title.toUpperCase()
                                }
                              </strong>

                            </div>


                            <div className="books-page__cover-author">
                              AKONAM
                            </div>

                          </div>

                        )}

                      </div>


                      {/* =========================================
                          CONTENT
                          ========================================= */}

                      <div className="books-page__featured-content">


                        <div className="books-page__book-meta">

                          <span>
                            {
                              formatType(
                                featuredBook.book_type
                              ).toUpperCase()
                            }
                          </span>


                          <span>
                            PUBLISHED
                          </span>

                        </div>


                        <h2>
                          {
                            featuredBook.title
                          }
                        </h2>


                        {featuredBook.subtitle && (

                          <p>
                            {
                              featuredBook.subtitle
                            }
                          </p>

                        )}


                        {featuredBook.description && (

                          <p>
                            {
                              featuredBook.description
                            }
                          </p>

                        )}


                        {/* =====================================
                            DIGITAL ACCESS
                            ===================================== */}

                        <div className="books-page__book-meta">

                          <span>
                            {
                              formatPrice(
                                featuredBook.price,
                                featuredBook.currency,
                                featuredBook.pricing_type
                              )
                            }
                          </span>


                          <span>
                            {
                              getReadingLabel(
                                featuredBook.reading_access
                              )
                            }
                          </span>


                          <span>
                            {
                              getDownloadLabel(
                                featuredBook.download_access
                              )
                            }
                          </span>

                        </div>


                        {/* =====================================
                            HARDCOPY
                            ===================================== */}

                        {featuredBook.hardcopy_available && (

                          <div className="books-page__book-meta">

                            <span>
                              HARDCOPY
                            </span>


                            <span>
                              {
                                formatHardcopyPrice(
                                  featuredBook.hardcopy_price,
                                  featuredBook.hardcopy_currency
                                )
                              }
                            </span>


                            <span>
                              {
                                getHardcopyLabel(
                                  featuredBook.hardcopy_available,
                                  featuredBook.hardcopy_status
                                )
                              }
                            </span>

                          </div>

                        )}


                        {/* =====================================
                            ACTION
                            ===================================== */}

                        <div className="books-page__featured-actions">

                          <span>
                            Explore book
                          </span>


                          <span>
                            ↗
                          </span>

                        </div>

                      </div>

                    </Link>

                  </section>

                )}


                {/* =================================================
                    MORE BOOKS
                    ================================================= */}

                {otherBooks.length >
                  0 && (

                  <section
                    className="books-page__works"
                    id="book-details"
                  >


                    <div className="books-page__section-heading">

                      <div>

                        <span>
                          The library
                        </span>


                        <h2>
                          More writing.
                        </h2>

                      </div>


                      <span>
                        {String(
                          otherBooks.length
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                    </div>


                    <div className="books-page__grid">

                      {otherBooks.map(
                        (
                          book,
                          index
                        ) => {

                          const cover =
                            getCover(
                              book
                            );

                          const hardcopyLabel =
                            getHardcopyLabel(
                              book.hardcopy_available,
                              book.hardcopy_status
                            );


                          return (

                            <Link
                              key={
                                book.id
                              }
                              href={`/books/${book.slug}`}
                              className="books-page__book"
                            >


                              {/* =================================
                                  COVER
                                  ================================= */}

                              <div className="books-page__small-cover">

                                {cover ? (

                                  <img
                                    src={
                                      cover
                                    }
                                    alt={
                                      book
                                        .cover_media
                                        ?.alt_text ||
                                      book.title
                                    }
                                  />

                                ) : (

                                  <>

                                    <span>
                                      {String(
                                        index +
                                        2
                                      ).padStart(
                                        2,
                                        "0"
                                      )}
                                    </span>


                                    <strong>
                                      AKNM
                                    </strong>

                                  </>

                                )}

                              </div>


                              {/* =================================
                                  BODY
                                  ================================= */}

                              <div className="books-page__book-body">


                                <div className="books-page__book-status">

                                  {
                                    formatType(
                                      book.book_type
                                    ).toUpperCase()
                                  }

                                </div>


                                <h3>
                                  {
                                    book.title
                                  }
                                </h3>


                                {book.subtitle && (

                                  <p>
                                    {
                                      book.subtitle
                                    }
                                  </p>

                                )}


                                {book.description && (

                                  <p>
                                    {
                                      book.description
                                    }
                                  </p>

                                )}


                                {/* =================================
                                    DIGITAL ACCESS
                                    ================================= */}

                                <div className="books-page__book-meta">

                                  <span>
                                    {
                                      formatPrice(
                                        book.price,
                                        book.currency,
                                        book.pricing_type
                                      )
                                    }
                                  </span>


                                  <span>
                                    {
                                      getReadingLabel(
                                        book.reading_access
                                      )
                                    }
                                  </span>


                                  <span>
                                    {
                                      getDownloadLabel(
                                        book.download_access
                                      )
                                    }
                                  </span>

                                </div>


                                {/* =================================
                                    HARDCOPY
                                    ================================= */}

                                {book.hardcopy_available && (

                                  <div className="books-page__book-meta">

                                    <span>
                                      HARDCOPY
                                    </span>


                                    <span>
                                      {
                                        formatHardcopyPrice(
                                          book.hardcopy_price,
                                          book.hardcopy_currency
                                        )
                                      }
                                    </span>


                                    <span>
                                      {
                                        hardcopyLabel
                                      }
                                    </span>

                                  </div>

                                )}


                                {/* =================================
                                    EXPLORE
                                    ================================= */}

                                <span>

                                  Explore

                                  <span>
                                    ↗
                                  </span>

                                </span>

                              </div>

                            </Link>

                          );

                        }
                      )}

                    </div>

                  </section>

                )}

              </>

            )}


            {/* =================================================
                BEYOND BOOKS
                ================================================= */}

            <section className="books-page__writing">


              <div className="books-page__writing-intro">

                <span>
                  Beyond books
                </span>


                <h2>
                  Not every idea
                  needs to become
                  a book.
                </h2>


                <p>
                  Some ideas are better expressed
                  as essays, short observations,
                  notes or conversations.
                </p>

              </div>


              <div className="books-page__writing-list">


                <article>

                  <span>
                    01
                  </span>


                  <div>

                    <small>
                      ESSAY
                    </small>


                    <h3>
                      Ideas in progress.
                    </h3>

                  </div>


                  <span>
                    ↗
                  </span>

                </article>


                <article>

                  <span>
                    02
                  </span>


                  <div>

                    <small>
                      NOTES
                    </small>


                    <h3>
                      Things worth thinking about.
                    </h3>

                  </div>


                  <span>
                    ↗
                  </span>

                </article>


                <article>

                  <span>
                    03
                  </span>


                  <div>

                    <small>
                      JOURNAL
                    </small>


                    <h3>
                      From the journey.
                    </h3>

                  </div>


                  <span>
                    ↗
                  </span>

                </article>

              </div>

            </section>


            {/* =================================================
                PUBLISHING CTA
                ================================================= */}

            <section className="books-page__publish">


              <div>

                <span>
                  The future of AKNM Publishing
                </span>


                <h2>
                  More books.
                  <br />
                  More ideas.
                </h2>

              </div>


              <p>
                Future books, manuscripts and
                publications will be released
                directly through AKNM.PRO.
              </p>

            </section>

          </div>

        </section>

      </main>


      <Footer />

    </>
  );
}