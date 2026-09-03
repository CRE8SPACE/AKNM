import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./Feed.css";


/* =========================================================
   TYPES
   ========================================================= */

interface FeedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  published_at: string | null;
  category: {
    name: string;
  } | null;
}


/* =========================================================
   ARROW ICON
   ========================================================= */

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 13L13 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M6 3H13V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(date: string | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(date))
    .toUpperCase();
}


function getExcerpt(post: FeedPost) {
  if (post.excerpt?.trim()) {
    return post.excerpt.trim();
  }

  if (post.content?.trim()) {
    const plainText = post.content
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (plainText.length > 180) {
      return `${plainText.slice(0, 180).trim()}…`;
    }

    return plainText;
  }

  return "Read the latest from AKNM.";
}


/* =========================================================
   FEED
   ========================================================= */

export default async function Feed() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      published_at,
      category:categories (
        name
      )
    `)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", {
      ascending: false,
    })
    .limit(5);

  if (error) {
    console.error("Feed loading error:", error);
  }

  const posts: FeedPost[] = (data ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    published_at: post.published_at,
    category: Array.isArray(post.category)
      ? post.category[0] ?? null
      : post.category ?? null,
  }));


  return (
    <section className="feed">
      <div className="feed__container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="feed__header">

          <div className="feed__eyebrow">
            <span className="feed__line" />

            <span>
              Feed
            </span>
          </div>


          <div className="feed__heading">

            <h2>
              Thinking.
              <br />
              Building.
              <br />
              Becoming.
            </h2>

            <p>
              A running record of ideas,
              observations, projects and
              moments along the way.
            </p>

          </div>

        </div>


        {/* =================================================
            POSTS
            ================================================= */}

        {posts.length > 0 ? (

          <div className="feed__posts">

            {posts.map((post, index) => {

              const category =
                post.category?.name ||
                "GENERAL";

              return (
                <article
                  key={post.id}
                  className="feed__post"
                >

                  {/* INDEX */}

                  <div className="feed__post-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>


                  {/* MAIN */}

                  <div className="feed__post-main">

                    <div className="feed__post-meta">

                      <span>
                        {formatDate(
                          post.published_at
                        )}
                      </span>

                      <span className="feed__post-category">
                        {category}
                      </span>

                    </div>


                    <Link
                      href={`/feed/${post.slug}`}
                      className="feed__post-title"
                    >
                      {post.title}
                    </Link>


                    <p className="feed__post-content">
                      {getExcerpt(post)}
                    </p>

                  </div>


                  {/* ARROW */}

                  <Link
                    href={`/feed/${post.slug}`}
                    className="feed__post-arrow"
                    aria-label={`Read ${post.title}`}
                  >
                    <ArrowUpRightIcon />
                  </Link>

                </article>
              );
            })}

          </div>

        ) : (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div className="feed__empty">

            <span className="feed__empty-index">
              00
            </span>

            <div className="feed__empty-content">

              <span className="feed__empty-label">
                Nothing published yet
              </span>

              <h3>
                The next thought
                <br />
                is still being written.
              </h3>

              <p>
                New ideas, stories and observations
                will appear here as they are published.
              </p>

            </div>

          </div>

        )}


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="feed__footer">

          <span className="feed__footer-note">
            Latest thoughts &amp; ideas
          </span>

          <Link
            href="/feed"
            className="feed__button"
          >
            <span>
              Explore the full feed
            </span>

            <span className="feed__button-icon">
              <ArrowUpRightIcon />
            </span>
          </Link>

        </div>

      </div>
    </section>
  );
}