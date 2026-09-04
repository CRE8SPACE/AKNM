import Link from "next/link";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { createClient } from "@/lib/supabase/server";

import "./feed.css";


/* =========================================================
   TYPES
   ========================================================= */

type PostType =
  | "article"
  | "image"
  | "video";


type FeedPost = {

  id: string;

  slug: string;

  date: string;

  category: string;

  title: string | null;

  content: string | null;

  type: PostType;

  image: string | null;

  imageAlt: string | null;

  video: string | null;

  videoThumbnail: string | null;

  videoMimeType: string | null;

};


/* =========================================================
   ICONS
   ========================================================= */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feed-page__arrow-icon"
    >
      <path
        d="M5 12h13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="m13 6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function ExternalArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feed-page__arrow-icon"
    >
      <path
        d="M7 17 17 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M9 7h8v8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function VideoPlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="feed-page__video-play-icon"
    >
      <path
        d="M9 6.5v11L18 12z"
        fill="currentColor"
      />
    </svg>
  );
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function FeedPage() {

  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    await createClient();


  /* =======================================================
     FETCH PUBLISHED POSTS
     ======================================================= */

  const {
    data: posts,
    error,
  } =
    await supabase
      .from("posts")
      .select(`
        id,
        slug,
        title,
        excerpt,
        content,
        post_type,
        featured,
        published_at,
        created_at,

        categories (
          id,
          name,
          slug
        ),

        cover_media:media!posts_cover_media_id_fkey (
          id,
          public_url,
          thumbnail_url,
          alt_text,
          media_type,
          mime_type
        ),

        post_media (
          media_id,
          sort_order,
          is_featured,

          media (
            id,
            public_url,
            thumbnail_url,
            alt_text,
            media_type,
            mime_type
          )
        )
      `)
      .eq(
        "status",
        "published"
      )
      .order(
        "published_at",
        {
          ascending: false,
          nullsFirst: false,
        }
      );


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {

    console.error(
      "FEED FETCH ERROR:",
      error
    );

  }


  /* =======================================================
     NORMALIZE POSTS
     ======================================================= */

  const feedPosts: FeedPost[] =
    (posts || []).map(
      (
        post
      ) => {

        const category =
          Array.isArray(
            post.categories
          )
            ? post.categories[0] ||
              null
            : post.categories ||
              null;


        const coverMedia =
          Array.isArray(
            post.cover_media
          )
            ? post.cover_media[0] ||
              null
            : post.cover_media ||
              null;


        const postMedia =
          Array.isArray(
            post.post_media
          )
            ? [
                ...post.post_media,
              ].sort(
                (
                  a,
                  b
                ) =>
                  (
                    a.sort_order ||
                    0
                  ) -
                  (
                    b.sort_order ||
                    0
                  )
              )
            : [];


        const firstImageMedia =
          postMedia.find(
            (
              item
            ) => {

              const media =
                Array.isArray(
                  item.media
                )
                  ? item.media[0] ||
                    null
                  : item.media ||
                    null;


              return (
                media?.media_type ===
                "image"
              );

            }
          );


        const firstVideoMedia =
          postMedia.find(
            (
              item
            ) => {

              const media =
                Array.isArray(
                  item.media
                )
                  ? item.media[0] ||
                    null
                  : item.media ||
                    null;


              return (
                media?.media_type ===
                "video"
              );

            }
          );


        const imageMedia =
          firstImageMedia
            ? (
                Array.isArray(
                  firstImageMedia.media
                )
                  ? firstImageMedia.media[0] ||
                    null
                  : firstImageMedia.media ||
                    null
              )
            : null;


        const videoMedia =
          firstVideoMedia
            ? (
                Array.isArray(
                  firstVideoMedia.media
                )
                  ? firstVideoMedia.media[0] ||
                    null
                  : firstVideoMedia.media ||
                    null
              )
            : null;


        const imageSource =
          coverMedia?.media_type ===
          "image"

            ? (
                coverMedia.thumbnail_url ||
                coverMedia.public_url ||
                null
              )

            : (
                imageMedia?.thumbnail_url ||
                imageMedia?.public_url ||
                null
              );


        const videoSource =
          videoMedia?.public_url ||
          (
            coverMedia?.media_type ===
            "video"
              ? coverMedia.public_url
              : null
          );


        const videoThumbnail =
          videoMedia?.thumbnail_url ||
          (
            coverMedia?.media_type ===
            "video"
              ? coverMedia.thumbnail_url
              : null
          );


        const videoMimeType =
          videoMedia?.mime_type ||
          (
            coverMedia?.media_type ===
            "video"
              ? coverMedia.mime_type
              : null
          );


        return {

          id:
            post.id,

          slug:
            post.slug,

          date:
            post.published_at ||
            post.created_at,

          category:
            category?.name ||
            "GENERAL",

          title:
            post.title,

          content:
            post.excerpt ||
            post.content,

          type:
            post.post_type,

          image:
            imageSource,

          imageAlt:
            coverMedia?.alt_text ||
            imageMedia?.alt_text ||
            post.title ||
            "AKNM media",

          video:
            videoSource,

          videoThumbnail:
            videoThumbnail,

          videoMimeType:
            videoMimeType,

        };

      }
    );


  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categories = [

    "ALL",

    ...Array.from(
      new Set(
        feedPosts
          .map(
            (
              post
            ) =>
              post.category
                .toUpperCase()
          )
      )
    ),

  ];


  /* =======================================================
     DATE FORMATTER
     ======================================================= */

  function formatDate(
    value: string
  ) {

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


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <>
      <Header />


      <main className="feed-page">


        {/* =================================================
            HERO
            ================================================= */}

        <section
          className="feed-page__hero"
        >

          <div
            className="feed-page__container"
          >

            <div
              className="feed-page__eyebrow"
            >

              <span
                className="feed-page__line"
              />


              <span>
                AKNM Feed
              </span>

            </div>


            <div
              className="feed-page__hero-content"
            >

              <h1>

                Follow the
                <br />
                journey.

              </h1>


              <p>

                Thoughts, updates,
                observations,
                moments and everything
                happening along the way.

              </p>

            </div>

          </div>

        </section>



        {/* =================================================
            FEED AREA
            ================================================= */}

        <section
          className="feed-page__content"
        >

          <div
            className="feed-page__container"
          >


            {/* FILTERS */}

            <div
              className="feed-page__filters"
            >

              <span
                className="feed-page__filter-label"
              >
                Filter
              </span>


              <div
                className="feed-page__filter-list"
              >

                {categories.map(
                  (
                    category,
                    index
                  ) => (

                    <button
                      key={
                        category
                      }
                      type="button"
                      className={`
                        feed-page__filter
                        ${
                          index === 0
                            ? "feed-page__filter--active"
                            : ""
                        }
                      `}
                    >

                      {
                        category
                      }

                    </button>

                  )
                )}

              </div>

            </div>



            {/* =================================================
                FEED LAYOUT
                ================================================= */}

            <div
              className="feed-page__layout"
            >


              {/* POSTS */}

              <div
                className="feed-page__posts"
              >

                {feedPosts.map(
                  (
                    post
                  ) => (

                    <article
                      key={
                        post.id
                      }
                      className="feed-page__post"
                    >


                      {/* POST HEADER */}

                      <div
                        className="feed-page__post-header"
                      >

                        <div
                          className="feed-page__post-author"
                        >

                          <div
                            className="feed-page__avatar"
                          >
                            A
                          </div>


                          <div>

                            <strong>
                              AKNM
                            </strong>


                            <span>

                              {
                                formatDate(
                                  post.date
                                )
                              }

                            </span>

                          </div>

                        </div>


                        <span
                          className="feed-page__post-category"
                        >

                          {
                            post.category
                              .toUpperCase()
                          }

                        </span>

                      </div>



                      {/* POST CONTENT */}

                      <div
                        className="feed-page__post-body"
                      >

                        {post.title && (

                          <Link
                            href={
                              `/feed/${post.slug}`
                            }
                            className="feed-page__post-title-link"
                          >

                            <h2>

                              {
                                post.title
                              }

                            </h2>

                          </Link>

                        )}


                        {post.content && (

                          <p>

                            {
                              post.content
                            }

                          </p>

                        )}



                        {/* IMAGE */}

                        {post.type ===
                          "image" &&
                          post.image && (

                          <Link
                            href={
                              `/feed/${post.slug}`
                            }
                            className="feed-page__post-media-link"
                            aria-label={
                              `View ${post.title || "image post"}`
                            }
                          >

                            <div
                              className="feed-page__post-image"
                            >

                              <img
                                src={
                                  post.image
                                }
                                alt={
                                  post.imageAlt ||
                                  "AKNM media"
                                }
                              />

                            </div>

                          </Link>

                        )}



                        {/* VIDEO */}

                        {post.type ===
                          "video" &&
                          post.video && (

                          <div
                            className="feed-page__post-video"
                          >

                            <video
                              controls
                              playsInline
                              preload="metadata"
                              poster={
                                post.videoThumbnail ||
                                undefined
                              }
                            >

                              <source
                                src={
                                  post.video
                                }
                                type={
                                  post.videoMimeType ||
                                  "video/mp4"
                                }
                              />

                              Your browser does not
                              support video playback.

                            </video>

                          </div>

                        )}



                        {/* VIDEO WITHOUT DIRECT SOURCE */}

                        {post.type ===
                          "video" &&
                          !post.video &&
                          post.videoThumbnail && (

                          <Link
                            href={
                              `/feed/${post.slug}`
                            }
                            className="feed-page__post-media-link"
                            aria-label={
                              `View ${post.title || "video post"}`
                            }
                          >

                            <div
                              className="
                                feed-page__post-image
                                feed-page__post-image--video
                              "
                            >

                              <img
                                src={
                                  post.videoThumbnail
                                }
                                alt={
                                  post.title ||
                                  "AKNM video"
                                }
                              />

                              <span
                                className="feed-page__video-play"
                              >
                                <VideoPlayIcon />
                              </span>

                            </div>

                          </Link>

                        )}



                        {/* VIDEO WITHOUT MEDIA */}

                        {post.type ===
                          "video" &&
                          !post.video &&
                          !post.videoThumbnail && (

                          <Link
                            href={
                              `/feed/${post.slug}`
                            }
                            className="feed-page__post-media-link"
                            aria-label={
                              `View ${post.title || "video post"}`
                            }
                          >

                            <div
                              className="
                                feed-page__post-image
                                feed-page__post-image--video
                              "
                            >

                              <div>

                                <span>
                                  AKNM
                                </span>

                              </div>


                              <span
                                className="feed-page__video-play"
                              >
                                <VideoPlayIcon />
                              </span>

                            </div>

                          </Link>

                        )}

                      </div>



                      {/* VIEW POST */}

                      <div
                        className="feed-page__post-view"
                      >

                        <Link
                          href={
                            `/feed/${post.slug}`
                          }
                        >

                          View post

                          <span>
                            <ArrowIcon />
                          </span>

                        </Link>

                      </div>



                      {/* ACTIONS */}

                      <div
                        className="feed-page__actions"
                      >

                        <button
                          type="button"
                          aria-label={
                            `Like ${post.title || "post"}`
                          }
                        >

                          <span>
                            ♡
                          </span>

                          Like

                        </button>


                        <button
                          type="button"
                          aria-label={
                            `Comment on ${post.title || "post"}`
                          }
                        >

                          <span>
                            ○
                          </span>

                          Comment

                        </button>


                        <button
                          type="button"
                          aria-label={
                            `Share ${post.title || "post"}`
                          }
                        >

                          <span>
                            <ExternalArrowIcon />
                          </span>

                          Share

                        </button>

                      </div>

                    </article>

                  )
                )}



                {/* =================================================
                    EMPTY STATE
                    ================================================= */}

                {feedPosts.length ===
                  0 && (

                  <div
                    className="feed-page__post"
                  >

                    <div
                      className="feed-page__post-body"
                    >

                      <h2>
                        Nothing published yet.
                      </h2>


                      <p>

                        New stories,
                        observations and
                        moments will appear
                        here when they are
                        published.

                      </p>

                    </div>

                  </div>

                )}

              </div>



              {/* SIDEBAR */}

              <aside
                className="feed-page__sidebar"
              >

                <div
                  className="feed-page__sidebar-card"
                >

                  <span
                    className="feed-page__sidebar-label"
                  >
                    About this feed
                  </span>


                  <h3>

                    Follow what
                    I&apos;m doing.

                  </h3>


                  <p>

                    This is the informal side
                    of AKNM — thoughts, updates,
                    experiments, moments and
                    things I find worth sharing.

                  </p>

                </div>



                <div
                  className="feed-page__sidebar-card"
                >

                  <span
                    className="feed-page__sidebar-label"
                  >
                    Elsewhere
                  </span>


                  <div
                    className="feed-page__social-list"
                  >

                    <a href="#">
                      Instagram

                      <span>
                        <ExternalArrowIcon />
                      </span>
                    </a>


                    <a href="#">
                      YouTube

                      <span>
                        <ExternalArrowIcon />
                      </span>
                    </a>


                    <a href="#">
                      X

                      <span>
                        <ExternalArrowIcon />
                      </span>
                    </a>


                    <a href="#">
                      LinkedIn

                      <span>
                        <ExternalArrowIcon />
                      </span>
                    </a>

                  </div>

                </div>

              </aside>

            </div>

          </div>

        </section>

      </main>


      <Footer />

    </>

  );

}