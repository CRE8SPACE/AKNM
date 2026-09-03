"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import "./content-detail.css";


/* =========================================================
   TYPES
   ========================================================= */

type Post = {
  id: string;
  author_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  post_type:
    | "article"
    | "video"
    | "image"
    | "gallery"
    | "document"
    | "announcement";
  status:
    | "draft"
    | "published";
  featured: boolean;
  cover_media_id: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Media = {
  id: string;
  title: string | null;
  description: string | null;
  media_type:
    | "image"
    | "video"
    | "audio"
    | "document";
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(value)
  );
}


function formatFileSize(
  bytes: number | null
) {
  if (!bytes) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  if (
    bytes <
    1024 * 1024 * 1024
  ) {
    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(1)} MB`;
  }

  return `${(
    bytes /
    1024 /
    1024 /
    1024
  ).toFixed(1)} GB`;
}


/* =========================================================
   PAGE
   ========================================================= */

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();

  const supabase = createClient();

  const postId =
    typeof params.id === "string"
      ? params.id
      : "";


  /* =======================================================
     STATE
     ======================================================= */

  const [post, setPost] =
    useState<Post | null>(null);

  const [category, setCategory] =
    useState<Category | null>(null);

  const [media, setMedia] =
    useState<Media | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);


  /* =======================================================
     LOAD POST
     ======================================================= */

  useEffect(() => {
    if (!postId) {
      return;
    }

    async function loadPost() {
      setLoading(true);
      setError("");

      try {

        /* ---------------------------------------------------
           POST
           --------------------------------------------------- */

        const {
          data: postData,
          error: postError,
        } =
          await supabase
            .from("posts")
            .select("*")
            .eq(
              "id",
              postId
            )
            .single();

        if (postError) {
          throw new Error(
            postError.message
          );
        }

        setPost(
          postData as Post
        );


        /* ---------------------------------------------------
           CATEGORY
           --------------------------------------------------- */

        if (
          postData.category_id
        ) {
          const {
            data:
              categoryData,
            error:
              categoryError,
          } =
            await supabase
              .from("categories")
              .select(
                "id, name, slug"
              )
              .eq(
                "id",
                postData.category_id
              )
              .maybeSingle();

          if (
            categoryError
          ) {
            console.warn(
              "Could not load category:",
              categoryError.message
            );
          }

          setCategory(
            categoryData
              ? (categoryData as Category)
              : null
          );
        }


        /* ---------------------------------------------------
           MEDIA
           --------------------------------------------------- */

        if (
          postData.cover_media_id
        ) {
          const {
            data:
              mediaData,
            error:
              mediaError,
          } =
            await supabase
              .from("media")
              .select("*")
              .eq(
                "id",
                postData.cover_media_id
              )
              .maybeSingle();

          if (
            mediaError
          ) {
            console.warn(
              "Could not load media:",
              mediaError.message
            );
          }

          setMedia(
            mediaData
              ? (mediaData as Media)
              : null
          );
        }

      } catch (
        loadError
      ) {

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load this post."
        );

      } finally {

        setLoading(false);

      }
    }

    loadPost();

  }, [
    postId,
    supabase,
  ]);


  /* =======================================================
     DELETE
     ======================================================= */

  async function handleDelete() {
    if (!post) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${post.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {

      const {
        error:
          deleteError,
      } =
        await supabase
          .from("posts")
          .delete()
          .eq(
            "id",
            post.id
          );

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      router.push(
        "/studio/content"
      );

      router.refresh();

    } catch (
      deleteError
    ) {

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this post."
      );

      setDeleting(false);
    }
  }

  async function handlePublish() {
  if (!post) {
    return;
  }

  const confirmed = window.confirm(
    `Publish "${post.title}" now?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");

    const {
      error: publishError,
    } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at:
          post.published_at ||
          new Date().toISOString(),
      })
      .eq("id", post.id);

    if (publishError) {
      throw new Error(
        publishError.message
      );
    }

    setPost((current) =>
      current
        ? {
            ...current,
            status: "published",
            published_at:
              current.published_at ||
              new Date().toISOString(),
          }
        : current
    );
  } catch (publishError) {
    setError(
      publishError instanceof Error
        ? publishError.message
        : "Could not publish this post."
    );
  }
}


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="content-detail-page">

        <div className="content-detail-loading">

          <span className="content-detail-loading__dot" />

          <span>
            Loading content...
          </span>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR
     ======================================================= */

  if (
    error ||
    !post
  ) {
    return (
      <main className="content-detail-page">

        <div className="content-detail-error">

          <span>
            CONTENT ERROR
          </span>

          <h1>
            This content could not be found.
          </h1>

          <p>
            {error ||
              "The post may have been deleted or you may not have permission to view it."}
          </p>

          <Link
            href="/studio/content"
            className="content-detail-error__back"
          >
            ← Back to Content
          </Link>

        </div>

      </main>
    );
  }


  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <main className="content-detail-page">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="content-detail-header">

        <div>

          <Link
            href="/studio/content"
            className="content-detail-header__back"
          >
            ← Content
          </Link>

          <span className="content-detail-header__eyebrow">
            {post.status ===
            "published"
              ? "PUBLISHED"
              : "DRAFT"}
          </span>

          <h1>
            {post.title}
          </h1>

          <p>
            {post.excerpt ||
              "No excerpt has been added to this post yet."}
          </p>

        </div>


        <div className="content-detail-header__actions">

            {post.status === "draft" && (
                <button
                type="button"
                className="content-detail-button content-detail-button--publish"
                onClick={handlePublish}
                >
                Publish Now
                </button>
            )}

            <Link
                href={`/studio/content/${post.id}/edit`}
                className="content-detail-button content-detail-button--secondary"
            >
                Edit
            </Link>

            <button
                type="button"
                className="content-detail-button content-detail-button--danger"
                onClick={handleDelete}
                disabled={deleting}
            >
                {deleting
                ? "Deleting..."
                : "Delete"}
            </button>

            </div>

      </header>


      {/* =================================================
          META
          ================================================= */}

      <section className="content-detail-meta">

        <div>

          <span>
            TYPE
          </span>

          <strong>
            {post.post_type}
          </strong>

        </div>


        <div>

          <span>
            CATEGORY
          </span>

          <strong>
            {category?.name ||
              "Uncategorized"}
          </strong>

        </div>


        <div>

          <span>
            CREATED
          </span>

          <strong>
            {formatDate(
              post.created_at
            )}
          </strong>

        </div>


        <div>

          <span>
            UPDATED
          </span>

          <strong>
            {formatDate(
              post.updated_at
            )}
          </strong>

        </div>


        <div>

          <span>
            FEATURED
          </span>

          <strong>
            {post.featured
              ? "Yes"
              : "No"}
          </strong>

        </div>

      </section>


      {/* =================================================
          MEDIA
          ================================================= */}

      {media && (

        <section className="content-detail-media">

          <div className="content-detail-section-label">
            COVER MEDIA
          </div>


          <div className="content-detail-media__frame">

            {media.media_type ===
              "image" &&
              media.public_url && (

                <img
                  src={
                    media.public_url
                  }
                  alt={
                    media.alt_text ||
                    post.title
                  }
                />

              )}


            {media.media_type ===
              "video" &&
              media.public_url && (

                <video
                  src={
                    media.public_url
                  }
                  controls
                  playsInline
                />

              )}


            {media.media_type ===
              "document" &&
              media.public_url && (

                <div className="content-detail-document">

                  <div className="content-detail-document__icon">
                    DOC
                  </div>

                  <strong>
                    {media.title ||
                      post.title}
                  </strong>

                  <span>
                    {media.mime_type ||
                      "Document"}
                    {" · "}
                    {formatFileSize(
                      media.file_size
                    )}
                  </span>

                  <a
                    href={
                      media.public_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Document ↗
                  </a>

                </div>

              )}

          </div>

        </section>

      )}


      {/* =================================================
          CONTENT
          ================================================= */}

      <section className="content-detail-body">

        <div className="content-detail-section-label">
          CONTENT
        </div>

        <article>

          {post.content ? (
            post.content
              .split("\n")
              .map(
                (
                  paragraph,
                  index
                ) => (

                  paragraph.trim() ? (
                    <p
                      key={
                        index
                      }
                    >
                      {
                        paragraph
                      }
                    </p>
                  ) : null

                )
              )
          ) : (

            <p className="content-detail-body__empty">
              No written content has been added.
            </p>

          )}

        </article>

      </section>


      {/* =================================================
          MEDIA DETAILS
          ================================================= */}

      {media && (

        <section className="content-detail-information">

          <div>

            <span>
              MEDIA TYPE
            </span>

            <strong>
              {media.media_type}
            </strong>

          </div>

          <div>

            <span>
              FILE SIZE
            </span>

            <strong>
              {formatFileSize(
                media.file_size
              )}
            </strong>

          </div>

          <div>

            <span>
              MIME TYPE
            </span>

            <strong>
              {media.mime_type ||
                "—"}
            </strong>

          </div>

          <div>

            <span>
              STORAGE
            </span>

            <strong>
              {media.storage_bucket}
            </strong>

          </div>

        </section>

      )}

    </main>
  );
}