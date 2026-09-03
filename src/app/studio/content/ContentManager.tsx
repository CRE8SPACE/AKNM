"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import "./ContentManager.css";


/* =========================================================
   TYPES
   ========================================================= */

type PostType =
  | "article"
  | "image"
  | "video";


type PostStatus =
  | "draft"
  | "published"
  | "scheduled";


type ContentCategory = {

  id: string;

  name: string;

  slug: string;

};


type ContentMedia = {

  id: string;

  public_url: string | null;

  thumbnail_url: string | null;

  alt_text: string | null;

  media_type: string;

};


type ContentTag = {

  id: string;

  name: string;

  slug: string;

};


type ContentPostTag = {

  tags: ContentTag | null;

};


type ContentPost = {

  id: string;

  title: string;

  slug: string;

  excerpt: string | null;

  post_type: PostType;

  status: PostStatus;

  featured: boolean;

  scheduled_at: string | null;

  published_at: string | null;

  created_at: string;

  categories: ContentCategory | null;

  cover_media: ContentMedia | null;

  post_tags: ContentPostTag[];

};


type ContentManagerProps = {

  initialPosts: ContentPost[];

};


/* =========================================================
   FILTER TYPES
   ========================================================= */

type TypeFilter =
  | "all"
  | PostType;


type StatusFilter =
  | "all"
  | PostStatus;


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  value: string | null
): string {

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
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  )
    .format(date)
    .toUpperCase();

}


function getPostTypeLabel(
  type: PostType
): string {

  switch (type) {

    case "article":
      return "Article";

    case "image":
      return "Image";

    case "video":
      return "Video";

    default:
      return type;

  }

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function ContentManager({
  initialPosts,
}: ContentManagerProps) {


  /* =======================================================
     STATE
     ======================================================= */

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    activeType,
    setActiveType,
  ] = useState<TypeFilter>(
    "all"
  );


  const [
    activeStatus,
    setActiveStatus,
  ] = useState<StatusFilter>(
    "all"
  );


  /* =======================================================
     STATS
     ======================================================= */

  const totalContent =
    initialPosts.length;


  const publishedCount =
    initialPosts.filter(
      (post) =>
        post.status === "published"
    ).length;


  const draftCount =
    initialPosts.filter(
      (post) =>
        post.status === "draft"
    ).length;


  const scheduledCount =
    initialPosts.filter(
      (post) =>
        post.status === "scheduled"
    ).length;


  /* =======================================================
     FILTERED POSTS
     ======================================================= */

  const filteredPosts =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();


      return initialPosts.filter(
        (post) => {

          /* -----------------------------------------------
             SEARCH
             ----------------------------------------------- */

          const matchesSearch =
            !normalizedSearch ||

            post.title
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||

            (
              post.excerpt
                ?.toLowerCase()
                .includes(
                  normalizedSearch
                ) ??
              false
            ) ||

            (
              post.categories
                ?.name
                .toLowerCase()
                .includes(
                  normalizedSearch
                ) ??
              false
            );


          /* -----------------------------------------------
             TYPE
             ----------------------------------------------- */

          const matchesType =
            activeType === "all"
              ? true
              : post.post_type ===
                activeType;


          /* -----------------------------------------------
             STATUS
             ----------------------------------------------- */

          const matchesStatus =
            activeStatus === "all"
              ? true
              : post.status ===
                activeStatus;


          return (
            matchesSearch &&
            matchesType &&
            matchesStatus
          );

        }
      );

    }, [
      initialPosts,
      search,
      activeType,
      activeStatus,
    ]);


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <section
      className="content-manager"
    >


      {/* =================================================
          HEADER
          ================================================= */}

      <header
        className="content-manager__header"
      >

        <div
          className="content-manager__header-content"
        >

          <div
            className="content-manager__eyebrow"
          >

            <span />

            <span>
              AKNM STUDIO
            </span>

          </div>


          <h1>
            Content.
          </h1>


          <p>
            Manage the ideas,
            stories, visuals and
            moments that appear
            across AKNM.PRO.
          </p>

        </div>


        <Link
          href="/studio/content/new"
          className="content-manager__create"
        >

          <span>
            Create Post
          </span>

          <span
            className="content-manager__create-icon"
          >
            ↗
          </span>

        </Link>

      </header>



      {/* =================================================
          STATS
          ================================================= */}

      <div
        className="content-manager__stats"
      >

        <div
          className="content-stat"
        >

          <span>
            TOTAL CONTENT
          </span>

          <strong>
            {totalContent}
          </strong>

        </div>


        <div
          className="content-stat"
        >

          <span>
            PUBLISHED
          </span>

          <strong>
            {publishedCount}
          </strong>

        </div>


        <div
          className="content-stat"
        >

          <span>
            DRAFTS
          </span>

          <strong>
            {draftCount}
          </strong>

        </div>


        <div
          className="content-stat"
        >

          <span>
            SCHEDULED
          </span>

          <strong>
            {scheduledCount}
          </strong>

        </div>

      </div>



      {/* =================================================
          CONTROLS
          ================================================= */}

      <div
        className="content-manager__controls"
      >


        {/* SEARCH */}

        <div
          className="content-search"
        >

          <span>
            ⌕
          </span>

          <input
            type="search"
            placeholder="Search content..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>



        {/* TYPE FILTER */}

        <div
          className="content-filter"
        >

          <span
            className="content-filter__label"
          >
            TYPE
          </span>


          {[
            "all",
            "article",
            "image",
            "video",
          ].map(
            (type) => (

              <button
                key={type}
                type="button"
                className={
                  activeType === type
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setActiveType(
                    type as TypeFilter
                  )
                }
              >

                {type}

              </button>

            )
          )}

        </div>



        {/* STATUS FILTER */}

        <div
          className="content-filter"
        >

          <span
            className="content-filter__label"
          >
            STATUS
          </span>


          {[
            "all",
            "published",
            "draft",
            "scheduled",
          ].map(
            (status) => (

              <button
                key={status}
                type="button"
                className={
                  activeStatus === status
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setActiveStatus(
                    status as StatusFilter
                  )
                }
              >

                {status}

              </button>

            )
          )}

        </div>

      </div>



      {/* =================================================
          CONTENT TABLE
          ================================================= */}

      <div
        className="content-table"
      >


        {/* TABLE HEADER */}

        <div
          className="content-table__header"
        >

          <span>
            CONTENT
          </span>

          <span>
            TYPE
          </span>

          <span>
            STATUS
          </span>

          <span>
            DATE
          </span>

          <span />

        </div>



        {/* POSTS */}

        <div
          className="content-table__body"
        >

          {filteredPosts.map(
            (post, index) => {

              /* -------------------------------------------
                 MEDIA
                 ------------------------------------------- */

              const imageUrl =
                post.cover_media
                  ?.thumbnail_url ||
                post.cover_media
                  ?.public_url ||
                null;


              /* -------------------------------------------
                 TAGS
                 ------------------------------------------- */

              const tags =
                post.post_tags
                  .map(
                    (item) =>
                      item.tags
                  )
                  .filter(
                    (
                      tag
                    ): tag is ContentTag =>
                      tag !== null
                  );


              /* -------------------------------------------
                 DISPLAY DATE
                 ------------------------------------------- */

              const displayDate =
                post.status === "scheduled"

                  ? post.scheduled_at

                  : post.status ===
                    "published"

                    ? post.published_at

                    : post.created_at;


              return (

                <article
                  key={post.id}
                  className="content-row"
                >


                  {/* =====================================
                      INDEX
                      ===================================== */}

                  <div
                    className="content-row__index"
                  >

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>



                  {/* =====================================
                      CONTENT
                      ===================================== */}

                  <div
                    className="content-row__content"
                  >


                    {/* MEDIA */}

                    <div
                      className={`
                        content-row__media
                        content-row__media--${post.post_type}
                      `}
                    >

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={
                            post.cover_media
                              ?.alt_text ||
                            post.title
                          }
                        />

                      ) : (

                        <span>

                          {post.post_type ===
                          "article"

                            ? "✦"

                            : post.post_type ===
                              "image"

                              ? "◉"

                              : "▶"}

                        </span>

                      )}


                      {post.post_type ===
                        "video" && (

                        <span
                          className="content-row__play"
                        >
                          ▶
                        </span>

                      )}

                    </div>



                    {/* COPY */}

                    <div
                      className="content-row__copy"
                    >

                      <div
                        className="content-row__title-row"
                      >

                        <Link
                          href={
                            `/studio/content/${post.id}/edit`
                          }
                          className="content-row__title"
                        >

                          {post.title}

                        </Link>


                        {post.featured && (

                          <span
                            className="content-row__featured"
                          >
                            FEATURED
                          </span>

                        )}

                      </div>


                      {post.excerpt && (

                        <p>
                          {post.excerpt}
                        </p>

                      )}


                      <div
                        className="content-row__meta"
                      >

                        {post.categories && (

                          <span
                            className="content-row__category"
                          >
                            {
                              post.categories
                                .name
                            }
                          </span>

                        )}


                        {tags.length > 0 && (

                          <div
                            className="content-row__tags"
                          >

                            {tags
                              .slice(0, 3)
                              .map(
                                (tag) => (

                                  <span
                                    key={
                                      tag.id
                                    }
                                  >

                                    #
                                    {tag.name}

                                  </span>

                                )
                              )}

                          </div>

                        )}

                      </div>

                    </div>

                  </div>



                  {/* =====================================
                      TYPE
                      ===================================== */}

                  <div
                    className="content-row__type"
                  >

                    <span
                      className={`
                        content-type
                        content-type--${post.post_type}
                      `}
                    >

                      {
                        getPostTypeLabel(
                          post.post_type
                        )
                      }

                    </span>

                  </div>



                  {/* =====================================
                      STATUS
                      ===================================== */}

                  <div
                    className="content-row__status"
                  >

                    <span
                      className={`
                        content-status
                        content-status--${post.status}
                      `}
                    >

                      {post.status}

                    </span>

                  </div>



                  {/* =====================================
                      DATE
                      ===================================== */}

                  <div
                    className="content-row__date"
                  >

                    {
                      formatDate(
                        displayDate
                      )
                    }

                  </div>



                  {/* =====================================
                      ACTION
                      ===================================== */}

                  <div
                    className="content-row__action"
                  >

                    <Link
                      href={
                        `/studio/content/${post.id}/edit`
                      }
                      aria-label={
                        `Edit ${post.title}`
                      }
                    >
                      ↗
                    </Link>

                  </div>

                </article>

              );

            }
          )}


          {/* =============================================
              EMPTY STATE
              ============================================= */}

          {filteredPosts.length === 0 && (

            <div
              className="content-empty"
            >

              <span>
                ✦
              </span>

              <h2>
                No content found.
              </h2>

              <p>
                Try changing your
                filters or create
                something new.
              </p>

              <Link
                href="/studio/content/new"
              >
                Create Post
              </Link>

            </div>

          )}

        </div>

      </div>



      {/* =================================================
          FOOTER
          ================================================= */}

      <div
        className="content-manager__footer"
      >

        <span>

          SHOWING{" "}

          {
            filteredPosts.length
          }

          {" "}OF{" "}

          {
            totalContent
          }

        </span>

      </div>

    </section>

  );

}