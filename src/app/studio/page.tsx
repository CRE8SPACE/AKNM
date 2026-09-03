import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./studio.css";


/* =========================================================
   TYPES
   ========================================================= */

type Post = {
  id: string;
  title: string;
  slug: string;
  post_type: string;
  status: string;
  created_at: string;
  published_at: string | null;
};


type Media = {
  id: string;
  title: string | null;
  media_type: string;
  mime_type: string | null;
  created_at: string;
};


type ActivityItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
  href: string;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatRelativeDate(date: string) {
  const now = new Date();
  const target = new Date(date);

  const difference =
    now.getTime() -
    target.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(date);
}


function getPostTypeLabel(type: string) {
  switch (type) {
    case "article":
      return "ARTICLE";

    case "video":
      return "VIDEO";

    case "image":
      return "IMAGE";

    case "gallery":
      return "GALLERY";

    case "document":
      return "DOCUMENT";

    case "announcement":
      return "ANNOUNCEMENT";

    default:
      return type
        .replaceAll("_", " ")
        .toUpperCase();
  }
}


function getMediaTypeLabel(type: string) {
  return type
    .replaceAll("_", " ")
    .toUpperCase();
}


/* =========================================================
   PAGE
   ========================================================= */

export default async function StudioPage() {
  const supabase =
    await createClient();


  /* =======================================================
     DATABASE QUERIES
     ======================================================= */

  const [
    postsResult,
    publishedResult,
    draftResult,
    scheduledResult,
    mediaResult,
    recentPostsResult,
    recentMediaResult,
  ] = await Promise.all([

    /* ALL POSTS */

    supabase
      .from("posts")
      .select("id", {
        count: "exact",
        head: true,
      }),


    /* PUBLISHED */

    supabase
      .from("posts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "published"),


    /* DRAFTS */

    supabase
      .from("posts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "draft"),


    /* SCHEDULED */

    supabase
      .from("posts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("status", "scheduled"),


    /* MEDIA */

    supabase
      .from("media")
      .select("id", {
        count: "exact",
        head: true,
      }),


    /* RECENT POSTS */

    supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        post_type,
        status,
        created_at,
        published_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(10),


    /* RECENT MEDIA */

    supabase
      .from("media")
      .select(`
        id,
        title,
        media_type,
        mime_type,
        created_at
      `)
      .order("created_at", {
        ascending: false,
      })
      .limit(10),
  ]);


  /* =======================================================
     ERROR LOGGING
     ======================================================= */

  if (postsResult.error) {
    console.error(
      "Studio posts count error:",
      postsResult.error
    );
  }

  if (publishedResult.error) {
    console.error(
      "Studio published count error:",
      publishedResult.error
    );
  }

  if (draftResult.error) {
    console.error(
      "Studio draft count error:",
      draftResult.error
    );
  }

  if (scheduledResult.error) {
    console.error(
      "Studio scheduled count error:",
      scheduledResult.error
    );
  }

  if (mediaResult.error) {
    console.error(
      "Studio media count error:",
      mediaResult.error
    );
  }

  if (recentPostsResult.error) {
    console.error(
      "Studio recent posts error:",
      recentPostsResult.error
    );
  }

  if (recentMediaResult.error) {
    console.error(
      "Studio recent media error:",
      recentMediaResult.error
    );
  }


  /* =======================================================
     VALUES
     ======================================================= */

  const totalPosts =
    postsResult.count ?? 0;

  const publishedPosts =
    publishedResult.count ?? 0;

  const draftPosts =
    draftResult.count ?? 0;

  const scheduledPosts =
    scheduledResult.count ?? 0;

  const totalMedia =
    mediaResult.count ?? 0;


  const totalAssets =
    totalPosts + totalMedia;


  const posts =
    (recentPostsResult.data ?? []) as Post[];


  const media =
    (recentMediaResult.data ?? []) as Media[];


  /* =======================================================
     RECENT ACTIVITY
     ======================================================= */

  const postActivity: ActivityItem[] =
    posts.map((post) => ({
      id: `post-${post.id}`,

      title: post.title,

      type:
        getPostTypeLabel(
          post.post_type
        ),

      status: post.status,

      created_at:
        post.created_at,

      href:
        `/studio/content/${post.id}`,
    }));


  const mediaActivity: ActivityItem[] =
    media.map((item) => ({
      id: `media-${item.id}`,

      title:
        item.title ||
        `Untitled ${getMediaTypeLabel(
          item.media_type
        ).toLowerCase()}`,

      type:
        getMediaTypeLabel(
          item.media_type
        ),

      status: "media",

      created_at:
        item.created_at,

      href:
        `/studio/media/${item.id}`,
    }));


  const recentActivity =
    [
      ...postActivity,
      ...mediaActivity,
    ]
      .sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      )
      .slice(0, 8);


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="studio-page">

      {/* =================================================
          INTRO / COMMAND HEADER
          ================================================= */}

      <section className="studio-intro">

        <div className="studio-intro__top">

          <div className="studio-intro__identity">

            <span className="studio-intro__eyebrow">
              AKNM STUDIO
            </span>

            <span className="studio-intro__system">
              PERSONAL MEDIA SYSTEM
            </span>

          </div>


          <div className="studio-intro__status">

            <span className="studio-intro__status-dot" />

            <span>
              SYSTEM ONLINE
            </span>

          </div>

        </div>


        <div className="studio-intro__content">

          <div>

            <h1>
              Create
              <br />
              Manage
              <br />
              Publish.
            </h1>

          </div>


          <div className="studio-intro__description">

            <p>
              Create, manage and publish
              everything that represents you
              across AKNM.PRO.
            </p>

            <span>
              LAST UPDATED
              <br />
              LIVE DATABASE
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          CORE OVERVIEW
          ================================================= */}

      <section
        className="studio-metrics"
        aria-label="Studio metrics"
      >

        <article className="studio-metric studio-metric--primary">

          <span>
            PUBLISHED
          </span>

          <strong>
            {publishedPosts}
          </strong>

          <p>
            Published pieces
          </p>

          <Link href="/studio/content">
            Manage content
            <span>↗</span>
          </Link>

        </article>


        <article className="studio-metric">

          <span>
            DRAFTS
          </span>

          <strong>
            {draftPosts}
          </strong>

          <p>
            Works in progress
          </p>

          <Link href="/studio/content?status=draft">
            View drafts
            <span>↗</span>
          </Link>

        </article>


        <article className="studio-metric">

          <span>
            SCHEDULED
          </span>

          <strong>
            {scheduledPosts}
          </strong>

          <p>
            Upcoming releases
          </p>

          <Link href="/studio/content?status=scheduled">
            View schedule
            <span>↗</span>
          </Link>

        </article>


        <article className="studio-metric">

          <span>
            MEDIA
          </span>

          <strong>
            {totalMedia}
          </strong>

          <p>
            Stored media assets
          </p>

          <Link href="/studio/media">
            Open library
            <span>↗</span>
          </Link>

        </article>

      </section>


      {/* =================================================
          WORKSPACE
          ================================================= */}

      <section className="studio-workspace">

        <div className="studio-workspace__header">

          <div>

            <span>
              WORKSPACE
            </span>

            <h2>
              Build your presence.
            </h2>

          </div>

          <p>
            AKNM.PRO is more than a publishing
            dashboard. It is the operating layer
            behind your public identity.
          </p>

        </div>


        <div className="studio-workspace__grid">

          {/* =================================================
              01 — CONTENT
              ================================================= */}

          <Link
            href="/studio/content"
            className="studio-module studio-module--large"
          >

            <div className="studio-module__top">

              <span>
                01
              </span>

              <span>
                CONTENT
              </span>

            </div>


            <div className="studio-module__body">

              <h3>
                Content
              </h3>

              <p>
                Articles, announcements, stories,
                videos and everything you publish.
              </p>

            </div>


            <div className="studio-module__footer">

              <span>
                {totalPosts} pieces
              </span>

              <span>
                ↗
              </span>

            </div>

          </Link>


          {/* =================================================
              02 — MEDIA
              ================================================= */}

          <Link
            href="/studio/media"
            className="studio-module"
          >

            <div className="studio-module__top">

              <span>
                02
              </span>

              <span>
                MEDIA
              </span>

            </div>


            <div className="studio-module__body">

              <h3>
                Media
              </h3>

              <p>
                Images, video, audio and
                supporting creative assets.
              </p>

            </div>


            <div className="studio-module__footer">

              <span>
                {totalMedia} assets
              </span>

              <span>
                ↗
              </span>

            </div>

          </Link>


          {/* =================================================
              03 — LIVE
              ================================================= */}

          <Link
            href="/studio/live"
            className="studio-module"
          >

            <div className="studio-module__top">

              <span>
                03
              </span>

              <span>
                LIVE
              </span>

            </div>


            <div className="studio-module__body">

              <h3>
                Live Studio
              </h3>

              <p>
                Interviews, broadcasts and
                live experiences.
              </p>

            </div>


            <div className="studio-module__footer">

              <span>
                Ready
              </span>

              <span>
                ↗
              </span>

            </div>

          </Link>


          {/* =================================================
              04 — PUBLICATIONS
              ================================================= */}

          <Link
            href="/studio/books"
            className="studio-module"
          >

            <div className="studio-module__top">

              <span>
                04
              </span>

              <span>
                PUBLICATIONS
              </span>

            </div>


            <div className="studio-module__body">

              <h3>
                Publications
              </h3>

              <p>
                Books, essays and long-form
                intellectual work.
              </p>

            </div>


            <div className="studio-module__footer">

              <span>
                Explore
              </span>

              <span>
                ↗
              </span>

            </div>

          </Link>


          {/* =================================================
              05 — INSIGHTS / AUDIENCE
              ================================================= */}

          <Link
            href="/studio/insights/audience"
            className="studio-module studio-module--insights"
          >

            <div className="studio-module__top">

              <span>
                05
              </span>

              <span>
                INSIGHTS
              </span>

            </div>


            <div className="studio-module__body">

              <h3>
                Audience
              </h3>

              <p>
                Understand reach, attention,
                engagement and growth.
              </p>

            </div>


            <div className="studio-module__footer">

              <span>
                View analytics
              </span>

              <span>
                ↗
              </span>

            </div>

          </Link>

        </div>

      </section>


      {/* =================================================
          CREATION
          ================================================= */}

      <section className="studio-create">

        <div className="studio-create__heading">

          <span>
            CREATE
          </span>

          <h2>
            What are you
            <br />
            making today?
          </h2>

        </div>


        <div className="studio-create__actions">

          <Link
            href="/studio/content/new"
            className="studio-create__action"
          >

            <span>
              01
            </span>

            <div>

              <strong>
                New Content
              </strong>

              <small>
                Write and publish
              </small>

            </div>

            <b>
              ↗
            </b>

          </Link>


          <Link
            href="/studio/media"
            className="studio-create__action"
          >

            <span>
              02
            </span>

            <div>

              <strong>
                Upload Media
              </strong>

              <small>
                Add creative assets
              </small>

            </div>

            <b>
              ↗
            </b>

          </Link>


          <Link
            href="/studio/live"
            className="studio-create__action"
          >

            <span>
              03
            </span>

            <div>

              <strong>
                Start Live
              </strong>

              <small>
                Broadcast or interview
              </small>

            </div>

            <b>
              ↗
            </b>

          </Link>


          <Link
            href="/studio/books/new"
            className="studio-create__action"
          >

            <span>
              04
            </span>

            <div>

              <strong>
                New Publication
              </strong>

              <small>
                Create long-form work
              </small>

            </div>

            <b>
              ↗
            </b>

          </Link>

        </div>

      </section>


      {/* =================================================
          CONTENT PIPELINE
          ================================================= */}

      <section className="studio-pipeline">

        <div className="studio-pipeline__header">

          <div>

            <span>
              PIPELINE
            </span>

            <h2>
              Publishing system
            </h2>

          </div>


          <Link
            href="/studio/content"
            className="studio-pipeline__link"
          >
            Manage content
            <span>↗</span>
          </Link>

        </div>


        <div className="studio-pipeline__grid">

          <div className="studio-pipeline__item">

            <span>
              PUBLISHED
            </span>

            <strong>
              {publishedPosts}
            </strong>

          </div>


          <div className="studio-pipeline__item">

            <span>
              DRAFTS
            </span>

            <strong>
              {draftPosts}
            </strong>

          </div>


          <div className="studio-pipeline__item">

            <span>
              SCHEDULED
            </span>

            <strong>
              {scheduledPosts}
            </strong>

          </div>


          <div className="studio-pipeline__item">

            <span>
              TOTAL
            </span>

            <strong>
              {totalPosts}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          RECENT ACTIVITY
          ================================================= */}

      <section className="studio-recent">

        <div className="studio-recent__heading">

          <div>

            <span>
              ACTIVITY
            </span>

            <h2>
              Recent work
            </h2>

          </div>


          <span className="studio-recent__count">

            {recentActivity.length}{" "}

            {recentActivity.length === 1
              ? "ITEM"
              : "ITEMS"}

          </span>

        </div>


        {recentActivity.length === 0 ? (

          <div className="studio-recent__empty">

            <div className="studio-recent__empty-icon">
              +
            </div>

            <h3>
              Your workspace is empty.
            </h3>

            <p>
              Create your first piece of content
              or upload a media asset to begin
              building your AKNM.PRO presence.
            </p>

            <Link
              href="/studio/content/new"
              className="studio-recent__empty-link"
            >
              Create something

              <span>
                ↗
              </span>

            </Link>

          </div>

        ) : (

          <div className="studio-recent__list">

            {recentActivity.map((item) => (

              <Link
                key={item.id}
                href={item.href}
                className="studio-recent__item"
              >

                <div className="studio-recent__item-type">
                  {item.type}
                </div>


                <div className="studio-recent__item-main">

                  <h3>
                    {item.title}
                  </h3>

                  <span>
                    {formatRelativeDate(
                      item.created_at
                    )}
                  </span>

                </div>


                <div
                  className={`
                    studio-recent__item-status
                    studio-recent__item-status--${item.status}
                  `}
                >
                  {item.status}
                </div>


                <span className="studio-recent__item-arrow">
                  ↗
                </span>

              </Link>

            ))}

          </div>

        )}

      </section>


      {/* =================================================
          SYSTEM FOOTER
          ================================================= */}

      <section className="studio-system">

        <div className="studio-system__identity">

          <span>
            AKNM STUDIO
          </span>

          <strong>
            {totalAssets}
          </strong>

          <p>
            Total content & media assets
          </p>

        </div>


        <div className="studio-system__status">

          <div>

            <span>
              DATABASE
            </span>

            <strong>
              CONNECTED
            </strong>

          </div>


          <div>

            <span>
              CONTENT
            </span>

            <strong>
              {totalPosts}
            </strong>

          </div>


          <div>

            <span>
              MEDIA
            </span>

            <strong>
              {totalMedia}
            </strong>

          </div>


          <div>

            <span>
              PLATFORM
            </span>

            <strong>
              AKNM.PRO
            </strong>

          </div>

        </div>

      </section>

    </main>
  );
}