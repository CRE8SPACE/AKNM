import Link from "next/link";

import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import "./post.css";


/* =========================================================
   TYPES
   ========================================================= */

type PostType =
  | "article"
  | "image"
  | "video";


type FeedCategory = {

  id: string;

  name: string;

  slug: string;

} | null;


type FeedMedia = {

  id: string;

  public_url: string | null;

  thumbnail_url: string | null;

  alt_text: string | null;

  media_type: string;

  mime_type: string | null;

};


type FeedPostMedia = {

  media_id: string;

  sort_order: number;

  is_featured: boolean;

  media: FeedMedia | null;

};


type FeedPost = {

  id: string;

  slug: string;

  title: string;

  excerpt: string | null;

  content: string | null;

  post_type: PostType;

  featured: boolean;

  published_at: string | null;

  created_at: string;

  category: FeedCategory;

  cover_media: FeedMedia | null;

  post_media: FeedPostMedia[];

};


/* =========================================================
   PARAMS
   ========================================================= */

type FeedPostPageProps = {

  params: Promise<{
    slug: string;
  }>;

};


/* =========================================================
   SUPABASE RESULT TYPES
   ========================================================= */

type RawPost = {

  id: string;

  slug: string;

  title: string;

  excerpt: string | null;

  content: string | null;

  post_type: PostType;

  featured: boolean;

  published_at: string | null;

  created_at: string;

  categories:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;

  cover_media:
    | FeedMedia
    | FeedMedia[]
    | null;

  post_media:
    | {
        media_id: string;
        sort_order: number;
        is_featured: boolean;
        media:
          | FeedMedia
          | FeedMedia[]
          | null;
      }[]
    | null;

};


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  value: string | null
): string {

  if (!value) {

    return "—";

  }


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
   NORMALIZE RELATION
   ========================================================= */

function normalizeSingle<T>(
  value:
    | T
    | T[]
    | null
    | undefined
): T | null {

  if (!value) {

    return null;

  }


  if (Array.isArray(value)) {

    return value[0] || null;

  }


  return value;

}


/* =========================================================
   NORMALIZE POST
   ========================================================= */

function normalizePost(
  raw: RawPost
): FeedPost {

  const category =
    normalizeSingle(
      raw.categories
    );


  const coverMedia =
    normalizeSingle(
      raw.cover_media
    );


  const postMedia =
    (raw.post_media || [])
      .map(
        (
          item
        ): FeedPostMedia => ({

          media_id:
            item.media_id,

          sort_order:
            item.sort_order,

          is_featured:
            item.is_featured,

          media:
            normalizeSingle(
              item.media
            ),

        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.sort_order -
          b.sort_order
      );


  return {

    id:
      raw.id,

    slug:
      raw.slug,

    title:
      raw.title,

    excerpt:
      raw.excerpt,

    content:
      raw.content,

    post_type:
      raw.post_type,

    featured:
      raw.featured,

    published_at:
      raw.published_at,

    created_at:
      raw.created_at,

    category,

    cover_media:
      coverMedia,

    post_media:
      postMedia,

  };

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function FeedPostPage({
  params,
}: FeedPostPageProps) {

  const {
    slug,
  } =
    await params;


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    await createClient();


  /* =======================================================
     FETCH
     ======================================================= */

  const {
    data,
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
        "slug",
        slug
      )
      .eq(
        "status",
        "published"
      )
      .maybeSingle();


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {

    console.error(
      "FEED POST FETCH ERROR:",
      error
    );

    throw new Error(
      "Could not load this content."
    );

  }


  /* =======================================================
     NOT FOUND
     ======================================================= */

  if (!data) {

    notFound();

  }


  /* =======================================================
     NORMALIZE
     ======================================================= */

  const post =
    normalizePost(
      data as RawPost
    );


  const imageMedia =
    post.post_media.filter(
      (
        item
      ) =>
        item.media?.media_type ===
        "image"
    );


  const videoMedia =
    post.post_media.filter(
      (
        item
      ) =>
        item.media?.media_type ===
        "video"
    );


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <>
      <main className="feed-post">


        {/* =================================================
            TOP BAR
            ================================================= */}

        <nav className="feed-post__nav">

          <div
            className="feed-post__nav-inner"
          >

            <Link
              href="/feed"
              className="feed-post__back"
            >

              <span>
                ←
              </span>

              <span>
                All Content
              </span>

            </Link>


            <span
              className="feed-post__brand"
            >
              AKNM.PRO
            </span>

          </div>

        </nav>



        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className="feed-post__header"
        >

          <div
            className="feed-post__eyebrow"
          >

            <span
              className="feed-post__line"
            />

            <span>
              AKNM Feed
            </span>

          </div>


          <div
            className="feed-post__meta"
          >

            <span>
              {
                post.category?.name ||
                "GENERAL"
              }
            </span>


            <span>
              /
            </span>


            <span>
              {
                formatDate(
                  post.published_at ||
                  post.created_at
                )
              }
            </span>

          </div>


          <h1
            className="feed-post__title"
          >

            {
              post.title
            }

          </h1>


          {post.excerpt && (

            <p
              className="feed-post__excerpt"
            >

              {
                post.excerpt
              }

            </p>

          )}

        </header>



        {/* =================================================
            COVER
            ================================================= */}

        {post.cover_media?.public_url && (

          <figure
            className="feed-post__cover"
          >

            <img
              src={
                post.cover_media.public_url
              }
              alt={
                post.cover_media.alt_text ||
                post.title
              }
            />

          </figure>

        )}



        {/* =================================================
            ARTICLE
            ================================================= */}

        {post.post_type ===
          "article" && (

          <article
            className="feed-post__article"
          >

            {post.content ? (

              post.content
                .split(
                  /\n\s*\n/
                )
                .map(
                  (
                    paragraph,
                    index
                  ) => {

                    const clean =
                      paragraph.trim();


                    if (!clean) {

                      return null;

                    }


                    return (

                      <p
                        key={
                          `${post.id}-${index}`
                        }
                      >

                        {
                          clean
                        }

                      </p>

                    );

                  }
                )

            ) : (

              <p>

                {
                  post.excerpt ||
                  "No story content."
                }

              </p>

            )}

          </article>

        )}



        {/* =================================================
            IMAGE GALLERY
            ================================================= */}

        {post.post_type ===
          "image" && (

          <section
            className={`
              feed-post__gallery
              ${
                imageMedia.length === 1
                  ? "feed-post__gallery--single"
                  : ""
              }
            `}
          >

            {imageMedia.map(
              (
                item
              ) => {

                const media =
                  item.media;


                if (
                  !media?.public_url
                ) {

                  return null;

                }


                return (

                  <figure
                    key={
                      `${post.id}-${item.media_id}`
                    }
                    className="feed-post__gallery-item"
                  >

                    <img
                      src={
                        media.public_url
                      }
                      alt={
                        media.alt_text ||
                        post.title
                      }
                    />

                  </figure>

                );

              }
            )}

          </section>

        )}



        {/* =================================================
            VIDEO
            ================================================= */}

        {post.post_type ===
          "video" && (

          <section
            className="feed-post__video"
          >

            {videoMedia.map(
              (
                item
              ) => {

                const media =
                  item.media;


                if (
                  !media?.public_url
                ) {

                  return null;

                }


                return (

                  <video
                    key={
                      `${post.id}-${item.media_id}`
                    }
                    controls
                    playsInline
                    preload="metadata"
                    poster={
                      media.thumbnail_url ||
                      undefined
                    }
                  >

                    <source
                      src={
                        media.public_url
                      }
                      type={
                        media.mime_type ||
                        "video/mp4"
                      }
                    />

                    Your browser does not
                    support video playback.

                  </video>

                );

              }
            )}

          </section>

        )}



        {/* =================================================
            FOOTER
            ================================================= */}

        <footer
          className="feed-post__footer"
        >

          <div
            className="feed-post__footer-line"
          />


          <div
            className="feed-post__footer-meta"
          >

            <span>
              AKNM.PRO
            </span>


            <span>
              {
                post.post_type
                  .toUpperCase()
              }
            </span>

          </div>


          <Link
            href="/feed"
            className="feed-post__more"
          >

            More from the feed

            <span>
              →
            </span>

          </Link>

        </footer>

      </main>
    </>

  );

}