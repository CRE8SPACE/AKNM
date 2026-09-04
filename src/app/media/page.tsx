import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { createClient } from "@/lib/supabase/server";

import "./media.css";


/* =========================================================
   TYPES
   ========================================================= */

type MediaCategory = {
  id: string;
  name: string;
  slug: string;
};


type VideoMedia = {
  id: string;
  title: string | null;
  description: string | null;
  media_type: "video";
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  duration_seconds: number | null;
  created_at: string;
  category: MediaCategory | null;
};


/* =========================================================
   PARAMS
   ========================================================= */

type MediaPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};


/* =========================================================
   SVG ICONS
   ========================================================= */

function ArrowIcon() {
  return (
    <svg
      className="media-page__arrow-icon"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 13L13 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M5 3H13V11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function PlayIcon() {
  return (
    <svg
      className="media-page__play-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 6.5L17 12L9 17.5V6.5Z"
        fill="currentColor"
      />
    </svg>
  );
}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value: string
): string {

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(
      new Date(value)
    )
    .toUpperCase();

}


/* =========================================================
   DURATION
   ========================================================= */

function formatDuration(
  seconds: number | null
): string {

  if (
    seconds === null ||
    !Number.isFinite(seconds)
  ) {

    return "";

  }


  const total =
    Math.round(
      seconds
    );


  const minutes =
    Math.floor(
      total / 60
    );


  const remaining =
    total % 60;


  return `${minutes}:${remaining
    .toString()
    .padStart(
      2,
      "0"
    )}`;

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function MediaPage({

  searchParams,

}: MediaPageProps) {


  /* =======================================================
     PARAMS
     ======================================================= */

  const {
    category:
      categorySlug,
  } =
    await searchParams;


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    await createClient();


  /* =======================================================
     FETCH ACTIVE CATEGORIES
     ======================================================= */

  const {
    data:
      categoriesData,

    error:
      categoriesError,

  } =
    await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug
      `)
      .eq(
        "is_active",
        true
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      )
      .order(
        "name",
        {
          ascending: true,
        }
      );


  /* =======================================================
     CATEGORY ERROR
     ======================================================= */

  if (
    categoriesError
  ) {

    console.error(
      "PUBLIC MEDIA CATEGORY FETCH ERROR:",
      categoriesError
    );

  }


  const categories =
    categoriesData ??
    [];


  /* =======================================================
     CURRENT CATEGORY
     ======================================================= */

  const selectedCategory =
    categorySlug
      ? categories.find(
          (
            category
          ) =>
            category.slug ===
            categorySlug
        ) || null
      : null;


  /* =======================================================
     FETCH VIDEOS
     ======================================================= */

  const {
    data,
    error,
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
        duration_seconds,
        created_at,

        category:categories (
          id,
          name,
          slug
        )
      `)
      .eq(
        "media_type",
        "video"
      )
      .not(
        "public_url",
        "is",
        null
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {

    console.error(
      "PUBLIC VIDEO MEDIA FETCH ERROR:",
      error
    );

  }


  /* =======================================================
     NORMALIZE
     ======================================================= */

  const videos: VideoMedia[] =
    (data ?? [])
      .filter(
        (
          item
        ) =>
          item.media_type ===
          "video"
      )
      .map(
        (
          item
        ) => {

          const category =
            Array.isArray(
              item.category
            )
              ? item.category[0] ||
                null
              : item.category ||
                null;


          return {

            id:
              item.id,

            title:
              item.title,

            description:
              item.description,

            media_type:
              "video",

            public_url:
              item.public_url,

            thumbnail_url:
              item.thumbnail_url,

            mime_type:
              item.mime_type,

            duration_seconds:
              item.duration_seconds,

            created_at:
              item.created_at,

            category,

          };

        }
      );


  /* =======================================================
     FILTER BY CATEGORY
     ======================================================= */

  const filteredVideos =
    selectedCategory
      ? videos.filter(
          (
            video
          ) =>
            video.category?.id ===
            selectedCategory.id
        )
      : videos;


  /* =======================================================
     FEATURED VIDEO
     ======================================================= */

  const featuredVideo =
    filteredVideos.length >
    0
      ? filteredVideos[0]
      : null;


  /* =======================================================
     LATEST VIDEOS
     ======================================================= */

  const latestVideos =
    filteredVideos.length >
    1
      ? filteredVideos.slice(
          1
        )
      : [];


  /* =======================================================
     CATEGORY URL
     ======================================================= */

  function getCategoryUrl(
    slug?: string
  ) {

    if (!slug) {

      return "/media";

    }


    return `/media?category=${encodeURIComponent(
      slug
    )}`;

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <>

      <Header />


      <main className="media-page">


        {/* =================================================
            HERO
            ================================================= */}

        <section
          className="media-page__hero"
        >

          <div
            className="media-page__container"
          >

            <div
              className="media-page__eyebrow"
            >

              <span
                className="media-page__line"
              />


              <span>
                AKNM Media
              </span>

            </div>


            <div
              className="media-page__hero-content"
            >

              <h1>

                What I&apos;m
                <br />
                creating.

              </h1>


              <p>

                Videos, conversations,
                ideas and visual stories
                from the journey.

              </p>

            </div>

          </div>

        </section>



        {/* =================================================
            VIDEO LIBRARY
            ================================================= */}

        <section
          className="media-page__library"
        >

          <div
            className="media-page__container"
          >


            {/* =============================================
                LIBRARY BAR
                ============================================= */}

            <div
              className="media-page__library-bar"
            >

              <div>

                <span>
                  VIDEO LIBRARY
                </span>

                <strong>

                  {filteredVideos.length}

                  {" "}

                  {filteredVideos.length ===
                    1
                    ? "VIDEO"
                    : "VIDEOS"}

                </strong>

              </div>


              <span>
                {selectedCategory
                  ? selectedCategory.name.toUpperCase()
                  : "ALL CATEGORIES"}
              </span>

            </div>



            {/* =============================================
                CATEGORY FILTERS
                ============================================= */}

            <nav
              className="media-page__categories"
              aria-label="Video categories"
            >

              <Link
                href="/media"
                className={`
                  media-page__category
                  ${
                    !selectedCategory
                      ? "media-page__category--active"
                      : ""
                  }
                `}
              >

                ALL

              </Link>


              {categories.map(
                (
                  category
                ) => (

                  <Link
                    key={
                      category.id
                    }
                    href={getCategoryUrl(
                      category.slug
                    )}
                    className={`
                      media-page__category
                      ${
                        selectedCategory?.id ===
                        category.id
                          ? "media-page__category--active"
                          : ""
                      }
                    `}
                  >

                    {
                      category.name.toUpperCase()
                    }

                  </Link>

                )
              )}

            </nav>



            {/* =================================================
                ACTIVE CATEGORY
                ================================================= */}

            {selectedCategory && (

              <div
                className="media-page__active-category"
              >

                <span>
                  CATEGORY
                </span>


                <strong>

                  {
                    selectedCategory.name
                  }

                </strong>


                <Link
                  href="/media"
                >

                  View all

                  <span
                    className="media-page__inline-arrow"
                    aria-hidden="true"
                  >
                    <ArrowIcon />
                  </span>

                </Link>

              </div>

            )}



            {/* =================================================
                FEATURED
                ================================================= */}

            {featuredVideo && (

              <section
                className="media-page__featured"
              >

                <div
                  className="media-page__section-heading"
                >

                  <div>

                    <span>
                      {selectedCategory
                        ? `Latest in ${selectedCategory.name}`
                        : "Most Recent"}
                    </span>

                    <h2>
                      Latest video.
                    </h2>

                  </div>


                  <span>
                    01
                  </span>

                </div>


                <Link
                  href={`/media/${featuredVideo.id}`}
                  className="media-page__featured-card"
                >

                  <div
                    className="media-page__featured-visual"
                  >

                    {featuredVideo.thumbnail_url ? (

                      <img
                        src={
                          featuredVideo.thumbnail_url
                        }
                        alt={
                          featuredVideo.title ||
                          "AKNM video"
                        }
                      />

                    ) : (

                      <div
                        className="media-page__visual-placeholder"
                      >

                        <span>
                          AKNM
                        </span>

                      </div>

                    )}


                    <div
                      className="media-page__visual-shade"
                    />


                    <span
                      className="media-page__video-label"
                    >
                      VIDEO
                    </span>


                    {featuredVideo.category && (

                      <span
                        className="media-page__video-category"
                      >

                        {
                          featuredVideo.category.name
                        }

                      </span>

                    )}


                    {formatDuration(
                      featuredVideo.duration_seconds
                    ) && (

                      <span
                        className="media-page__duration"
                      >

                        {
                          formatDuration(
                            featuredVideo.duration_seconds
                          )
                        }

                      </span>

                    )}


                    <span
                      className="media-page__play"
                      aria-hidden="true"
                    >
                      <PlayIcon />
                    </span>

                  </div>


                  <div
                    className="media-page__featured-content"
                  >

                    <div
                      className="media-page__meta"
                    >

                      <span>
                        {
                          featuredVideo.category?.name ||
                          "GENERAL"
                        }
                      </span>


                      <span>
                        {
                          formatDate(
                            featuredVideo.created_at
                          )
                        }
                      </span>

                    </div>


                    <h3>

                      {
                        featuredVideo.title ||
                        "Untitled video"
                      }

                    </h3>


                    {featuredVideo.description && (

                      <p>

                        {
                          featuredVideo.description
                        }

                      </p>

                    )}


                    <span
                      className="media-page__watch"
                    >

                      Watch video

                      <span
                        className="media-page__inline-arrow"
                        aria-hidden="true"
                      >
                        <ArrowIcon />
                      </span>

                    </span>

                  </div>

                </Link>

              </section>

            )}



            {/* =================================================
                LATEST VIDEO LIBRARY
                ================================================= */}

            {latestVideos.length > 0 && (

              <section
                className="media-page__latest"
              >

                <div
                  className="
                    media-page__section-heading
                    media-page__section-heading--latest
                  "
                >

                  <div>

                    <span>
                      {selectedCategory
                        ? selectedCategory.name
                        : "Library"}
                    </span>

                    <h2>
                      More videos.
                    </h2>

                  </div>


                  <span>

                    {
                      String(
                        latestVideos.length
                      ).padStart(
                        2,
                        "0"
                      )
                    }

                  </span>

                </div>


                <div
                  className="media-page__grid"
                >

                  {latestVideos.map(
                    (
                      video
                    ) => (

                      <Link
                        key={
                          video.id
                        }
                        href={`/media/${video.id}`}
                        className="media-page__card"
                      >

                        <div
                          className="media-page__card-visual"
                        >

                          {video.thumbnail_url ? (

                            <img
                              src={
                                video.thumbnail_url
                              }
                              alt={
                                video.title ||
                                "AKNM video"
                              }
                            />

                          ) : (

                            <div
                              className="
                                media-page__visual-placeholder
                                media-page__visual-placeholder--small
                              "
                            >

                              <span>
                                AKNM
                              </span>

                            </div>

                          )}


                          <div
                            className="media-page__card-shade"
                          />


                          <span
                            className="media-page__video-label"
                          >
                            VIDEO
                          </span>


                          {video.category && (

                            <span
                              className="media-page__video-category"
                            >

                              {
                                video.category.name
                              }

                            </span>

                          )}


                          {formatDuration(
                            video.duration_seconds
                          ) && (

                            <span
                              className="media-page__duration"
                            >

                              {
                                formatDuration(
                                  video.duration_seconds
                                )
                              }

                            </span>

                          )}


                          <span
                            className="
                              media-page__play
                              media-page__play--small
                            "
                            aria-hidden="true"
                          >
                            <PlayIcon />
                          </span>

                        </div>


                        <div
                          className="media-page__card-content"
                        >

                          <div
                            className="media-page__meta"
                          >

                            <span>

                              {
                                video.category?.name ||
                                "GENERAL"
                              }

                            </span>


                            <span>

                              {
                                formatDate(
                                  video.created_at
                                )
                              }

                            </span>

                          </div>


                          <h3>

                            {
                              video.title ||
                              "Untitled video"
                            }

                          </h3>


                          {video.description && (

                            <p>

                              {
                                video.description
                              }

                            </p>

                          )}


                          <span
                            className="media-page__card-arrow"
                            aria-hidden="true"
                          >
                            <ArrowIcon />
                          </span>

                        </div>

                      </Link>

                    )
                  )}

                </div>

              </section>

            )}



            {/* =================================================
                EMPTY
                ================================================= */}

            {filteredVideos.length ===
              0 && (

              <section
                className="media-page__empty"
              >

                <span>
                  {
                    selectedCategory
                      ? selectedCategory.name.toUpperCase()
                      : "VIDEO LIBRARY"
                  }
                </span>


                <h2>

                  {
                    selectedCategory
                      ? "No videos in this category yet."
                      : "Nothing here yet."
                  }

                </h2>


                <p>

                  {
                    selectedCategory
                      ? `Videos added to ${selectedCategory.name} will appear here.`
                      : "Videos published through AKNM.PRO will appear here."
                  }

                </p>


                {selectedCategory && (

                  <Link
                    href="/media"
                  >

                    View all videos

                    <span
                      className="media-page__inline-arrow"
                      aria-hidden="true"
                    >
                      <ArrowIcon />
                    </span>

                  </Link>

                )}

              </section>

            )}



            {/* =================================================
                CLOSING
                ================================================= */}

            <section
              className="media-page__closing"
            >

              <div>

                <span>
                  AKNM MEDIA
                </span>


                <h2>

                  Stories worth
                  <br />
                  watching.

                </h2>

              </div>


              <p>

                A growing collection of
                conversations, experiments,
                updates and visual stories
                from the journey.

              </p>

            </section>

          </div>

        </section>

      </main>


      <Footer />

    </>

  );

}