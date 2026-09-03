
"use client";

import Link from "next/link";

import {
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./ContentEditor.css";


/* =========================================================
   TYPES
   ========================================================= */

type PostType =
  | "article"
  | "image"
  | "video";


type Category = {

  id: string;

  name: string;

  slug: string;

};


type ContentEditorProps = {

  categories:
    Category[];

};


/* =========================================================
   CONTENT TYPES
   ========================================================= */

const contentTypes = [

  {
    type: "article" as const,

    symbol: "✦",

    label: "Article",

    description:
      "Write an idea, story, observation or something worth returning to.",

  },

  {
    type: "image" as const,

    symbol: "◉",

    label: "Image",

    description:
      "Share a visual moment, photograph or collection of images.",

  },

  {
    type: "video" as const,

    symbol: "▶",

    label: "Video",

    description:
      "Publish movement, updates, stories and visual experiences.",

  },

];


/* =========================================================
   SLUG
   ========================================================= */

function createSlug(
  value: string
) {

  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function ContentEditor({
  categories,
}: ContentEditorProps) {


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    createClient();


  /* =======================================================
     STATE
     ======================================================= */

  const [
    postType,
    setPostType,
  ] = useState<
    PostType | null
  >(null);


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    slug,
    setSlug,
  ] = useState("");


  const [
    excerpt,
    setExcerpt,
  ] = useState("");


  const [
    content,
    setContent,
  ] = useState("");


  const [
    categoryId,
    setCategoryId,
  ] = useState("");


  const [
    tags,
    setTags,
  ] = useState<
    string[]
  >([]);


  const [
    tagInput,
    setTagInput,
  ] = useState("");


  const [
    featured,
    setFeatured,
  ] = useState(false);


  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<
    MediaItem[]
  >([]);


  const [
    coverMedia,
    setCoverMedia,
  ] = useState<
    MediaItem | null
  >(null);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    saveError,
    setSaveError,
  ] = useState("");


  const [
    saveSuccess,
    setSaveSuccess,
  ] = useState("");


  /* =======================================================
     SLUG
     ======================================================= */

  const generatedSlug =
    useMemo(
      () =>
        slug ||
        createSlug(
          title
        ),
      [
        slug,
        title,
      ]
    );


  /* =======================================================
     TAGS
     ======================================================= */

  function addTag() {

    const value =
      tagInput
        .trim()
        .toLowerCase();


    if (!value) {
      return;
    }


    if (
      tags.includes(
        value
      )
    ) {

      setTagInput("");

      return;

    }


    setTags(
      (current) => [

        ...current,

        value,

      ]
    );


    setTagInput("");

  }


  function removeTag(
    tag: string
  ) {

    setTags(
      (current) =>
        current.filter(
          (item) =>
            item !== tag
        )
    );

  }


  /* =======================================================
     RESET
     ======================================================= */

  function resetEditor() {

    setPostType(null);

    setTitle("");

    setSlug("");

    setExcerpt("");

    setContent("");

    setCategoryId("");

    setTags([]);

    setTagInput("");

    setFeatured(false);

    setSelectedMedia([]);

    setCoverMedia(null);

    setSaveError("");

    setSaveSuccess("");

  }


  /* =======================================================
     SAVE / PUBLISH
     ======================================================= */

  async function savePost(
    targetStatus:
      | "draft"
      | "published"
  ) {

    if (!postType) {
      return;
    }


    /* =====================================================
       RESET MESSAGES
       ===================================================== */

    setSaving(true);

    setSaveError("");

    setSaveSuccess("");


    try {


      /* ===================================================
         VALIDATION
         =================================================== */

      const cleanTitle =
        title.trim();


      if (!cleanTitle) {

        throw new Error(
          "Please enter a title."
        );

      }


      const cleanSlug =
        generatedSlug.trim();


      if (!cleanSlug) {

        throw new Error(
          "A valid URL slug is required."
        );

      }


      /* ===================================================
         AUTH
         =================================================== */

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase
          .auth
          .getUser();


      if (
        userError ||
        !user
      ) {

        throw new Error(
          "You must be signed in to publish content."
        );

      }


      /* ===================================================
         IMAGE VALIDATION
         =================================================== */

      if (
        postType === "image" &&
        selectedMedia.length === 0
      ) {

        throw new Error(
          "Please select at least one image."
        );

      }


      /* ===================================================
         VIDEO VALIDATION
         =================================================== */

      if (
        postType === "video"
      ) {

        const hasVideo =
          selectedMedia.some(
            (item) =>
              item.media_type ===
              "video"
          );


        if (!hasVideo) {

          throw new Error(
            "Please select a video."
          );

        }

      }


      /* ===================================================
         COVER
         =================================================== */

      const selectedCover =
        coverMedia ||
        (
          postType === "image"
            ? selectedMedia[0] ||
              null
            : null
        );


      /* ===================================================
         PUBLISHED DATE
         =================================================== */

      const publishedAt =
        targetStatus ===
        "published"
          ? new Date()
              .toISOString()
          : null;


      /* ===================================================
         CREATE POST
         =================================================== */

      const {
        data: post,
        error:
          postError,
      } =
        await supabase
          .from("posts")
          .insert({

            author_id:
              user.id,

            category_id:
              categoryId ||
              null,

            title:
              cleanTitle,

            slug:
              cleanSlug,

            excerpt:
              excerpt.trim() ||
              null,

            content:
              content.trim() ||
              null,

            post_type:
              postType,

            status:
              targetStatus,

            featured,

            cover_media_id:
              selectedCover?.id ||
              null,

            scheduled_at:
              null,

            published_at:
              publishedAt,

          })
          .select("id")
          .single();


      if (
        postError ||
        !post
      ) {

        throw new Error(
          postError?.message ||
          "Could not create post."
        );

      }


      /* ===================================================
         POST MEDIA RELATIONSHIPS
         =================================================== */

      if (
        selectedMedia.length >
        0
      ) {

        const mediaRows =
          selectedMedia.map(
            (
              media,
              index
            ) => ({

              post_id:
                post.id,

              media_id:
                media.id,

              sort_order:
                index,

              is_featured:
                selectedCover?.id ===
                media.id,

            })
          );


        const {
          error:
            mediaError,
        } =
          await supabase
            .from("post_media")
            .insert(
              mediaRows
            );


        /* ===============================================
           ROLLBACK POST
           =============================================== */

        if (
          mediaError
        ) {

          await supabase
            .from("posts")
            .delete()
            .eq(
              "id",
              post.id
            );


          throw new Error(
            mediaError.message
          );

        }

      }


      /* ===================================================
         SUCCESS
         =================================================== */

      setSaveSuccess(

        targetStatus ===
          "published"

          ? "Content published successfully."

          : "Draft saved successfully."

      );


      /* ===================================================
         RETURN TO CONTENT MANAGER
         =================================================== */

      window.setTimeout(
        () => {

          window.location.href =
            "/studio/content";

        },
        700
      );


    } catch (
      error
    ) {

      console.error(
        "CONTENT SAVE ERROR:",
        error
      );


      setSaveError(

        error instanceof
        Error

          ? error.message

          : "Could not save content."

      );

    } finally {

      setSaving(false);

    }

  }


  /* =======================================================
     TYPE SELECTOR
     ======================================================= */

  if (!postType) {

    return (

      <section
        className="content-editor"
      >

        <header
          className="content-editor__intro"
        >

          <div>

            <div
              className="content-editor__eyebrow"
            >

              <span />

              <span>
                CREATE CONTENT
              </span>

            </div>


            <h1>
              Create something.
            </h1>


            <p>
              Choose what you want
              to publish to AKNM.PRO.
            </p>

          </div>


          <Link
            href="/studio/content"
            className="content-editor__back"
          >
            ← All Content
          </Link>

        </header>


        <div
          className="content-type-grid"
        >

          {contentTypes.map(
            (item) => (

              <button
                key={
                  item.type
                }
                type="button"
                className="content-type-card"
                onClick={() =>
                  setPostType(
                    item.type
                  )
                }
              >

                <span
                  className="content-type-card__symbol"
                >
                  {item.symbol}
                </span>


                <span
                  className="content-type-card__label"
                >
                  {item.label}
                </span>


                <span
                  className="content-type-card__description"
                >
                  {
                    item.description
                  }
                </span>


                <span
                  className="content-type-card__arrow"
                >
                  ↗
                </span>

              </button>

            )
          )}

        </div>

      </section>

    );

  }


  /* =======================================================
     EDITOR
     ======================================================= */

  return (

    <section
      className="content-editor"
    >


      {/* =================================================
          TOP BAR
          ================================================= */}

      <header
        className="content-editor__topbar"
      >

        <div
          className="content-editor__topbar-left"
        >

          <button
            type="button"
            className="content-editor__change"
            onClick={
              resetEditor
            }
            disabled={
              saving
            }
          >
            ← Change type
          </button>


          <div
            className="content-editor__type"
          >

            {
              contentTypes.find(
                (item) =>
                  item.type ===
                  postType
              )?.symbol
            }

            <span>

              {
                contentTypes.find(
                  (item) =>
                    item.type ===
                    postType
                )?.label
              }

            </span>

          </div>

        </div>


        <Link
          href="/studio/content"
          className="content-editor__close"
        >
          Close ×
        </Link>

      </header>



      {/* =================================================
          WORKSPACE
          ================================================= */}

      <div
        className="content-editor__workspace"
      >


        {/* ===============================================
            MAIN EDITOR
            =============================================== */}

        <main
          className="content-editor__main"
        >


          {/* =============================================
              TITLE
              ============================================= */}

          <div
            className="content-field
              content-field--title"
          >

            <label>
              TITLE
            </label>


            <input
              type="text"
              value={
                title
              }
              onChange={(
                event
              ) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder={

                postType ===
                "article"

                  ? "Give your story a title."

                  : postType ===
                    "image"

                    ? "What is this moment called?"

                    : "What is this video about?"

              }
              disabled={
                saving
              }
            />

          </div>



          {/* =============================================
              EXCERPT
              ============================================= */}

          <div
            className="content-field"
          >

            <label>
              EXCERPT
            </label>


            <textarea
              value={
                excerpt
              }
              onChange={(
                event
              ) =>
                setExcerpt(
                  event.target.value
                )
              }
              placeholder={

                postType ===
                "article"

                  ? "A short introduction to what you are writing..."

                  : postType ===
                    "image"

                    ? "Tell people something about this moment..."

                    : "Give people a reason to watch..."

              }
              rows={
                3
              }
              disabled={
                saving
              }
            />

          </div>



          {/* =============================================
              ARTICLE CONTENT
              ============================================= */}

          {postType ===
            "article" && (

            <div
              className="content-field
                content-field--body"
            >

              <label>
                STORY
              </label>


              <textarea
                value={
                  content
                }
                onChange={(
                  event
                ) =>
                  setContent(
                    event.target.value
                  )
                }
                placeholder="Start writing..."
                rows={
                  18
                }
                disabled={
                  saving
                }
              />

            </div>

          )}



          {/* =============================================
              IMAGE MEDIA
              ============================================= */}

          {postType ===
            "image" && (

            <div
              className="content-media-section"
            >

              <div
                className="content-media-section__header"
              >

                <label>
                  IMAGES
                </label>


                <span>

                  {
                    selectedMedia.length
                  }

                  {" SELECTED"}

                </span>

              </div>


              <MediaPicker
                mode="multiple"
                mediaType="image"
                selectedIds={
                  selectedMedia.map(
                    (item) =>
                      item.id
                  )
                }
                onChange={
                  setSelectedMedia
                }
              />

            </div>

          )}



          {/* =============================================
              VIDEO MEDIA
              ============================================= */}

          {postType ===
            "video" && (

            <div
              className="content-media-section"
            >

              <div
                className="content-media-section__header"
              >

                <label>
                  VIDEO
                </label>


                <span>

                  {
                    selectedMedia.some(
                      (item) =>
                        item.media_type ===
                        "video"
                    )

                      ? "READY"

                      : "NO VIDEO"

                  }

                </span>

              </div>


              <MediaPicker
                mode="multiple"
                mediaType="video"
                selectedIds={
                  selectedMedia
                    .filter(
                      (item) =>
                        item.media_type ===
                        "video"
                    )
                    .map(
                      (item) =>
                        item.id
                    )
                }
                onChange={
                  setSelectedMedia
                }
              />

            </div>

          )}



          {/* =============================================
              COVER ARTWORK
              ============================================= */}

          <div
            className="content-media-section"
          >

            <div
              className="content-media-section__header"
            >

              <label>
                COVER ARTWORK
              </label>


              <span>

                {
                  coverMedia
                    ? "SELECTED"
                    : "OPTIONAL"
                }

              </span>

            </div>


            <MediaPicker
              mode="cover"
              selectedIds={
                coverMedia
                  ? [
                      coverMedia.id,
                    ]
                  : []
              }
              onChange={(
                media
              ) =>
                setCoverMedia(
                  media[0] ||
                  null
                )
              }
            />

          </div>

        </main>



        {/* ===============================================
            SIDEBAR
            =============================================== */}

        <aside
          className="content-editor__sidebar"
        >


          {/* =============================================
              SLUG
              ============================================= */}

          <div
            className="content-editor-panel"
          >

            <label>
              URL
            </label>


            <div
              className="content-slug"
            >

              <span>
                /feed/
              </span>


              <input
                type="text"
                value={
                  generatedSlug
                }
                onChange={(
                  event
                ) =>
                  setSlug(
                    event.target.value
                  )
                }
                disabled={
                  saving
                }
              />

            </div>

          </div>



          {/* =============================================
              CATEGORY
              ============================================= */}

          <div
            className="content-editor-panel"
          >

            <label>
              CATEGORY
            </label>


            <select
              value={
                categoryId
              }
              onChange={(
                event
              ) =>
                setCategoryId(
                  event.target.value
                )
              }
              disabled={
                saving
              }
            >

              <option value="">
                Select category
              </option>


              {categories.map(
                (category) => (

                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >

                    {
                      category.name
                    }

                  </option>

                )
              )}

            </select>

          </div>



          {/* =============================================
              TAGS
              ============================================= */}

          <div
            className="content-editor-panel"
          >

            <label>
              TAGS
            </label>


            <div
              className="content-tags-input"
            >

              {tags.map(
                (tag) => (

                  <span
                    key={
                      tag
                    }
                  >

                    #{tag}


                    <button
                      type="button"
                      onClick={() =>
                        removeTag(
                          tag
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      ×
                    </button>

                  </span>

                )
              )}


              <input
                value={
                  tagInput
                }
                onChange={(
                  event
                ) =>
                  setTagInput(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {

                  if (
                    event.key ===
                    "Enter"
                  ) {

                    event.preventDefault();

                    addTag();

                  }

                }}
                placeholder="Add tag..."
                disabled={
                  saving
                }
              />

            </div>


            <button
              type="button"
              className="content-tag-add"
              onClick={
                addTag
              }
              disabled={
                saving
              }
            >
              + Add tag
            </button>

          </div>



          {/* =============================================
              FEATURED
              ============================================= */}

          <div
            className="content-editor-panel"
          >

            <label>
              DISPLAY
            </label>


            <label
              className="content-toggle"
            >

              <input
                type="checkbox"
                checked={
                  featured
                }
                onChange={(
                  event
                ) =>
                  setFeatured(
                    event.target.checked
                  )
                }
                disabled={
                  saving
                }
              />


              <span
                className="content-toggle__control"
              />


              <span>
                Featured post
              </span>

            </label>

          </div>



          {/* =============================================
              STATUS
              ============================================= */}

          <div
            className="content-editor-panel
              content-editor-panel--actions"
          >

            <label>
              PUBLISHING
            </label>


            {saveError && (

              <div
                className="content-save-message
                  content-save-message--error"
              >

                {
                  saveError
                }

              </div>

            )}


            {saveSuccess && (

              <div
                className="content-save-message
                  content-save-message--success"
              >

                {
                  saveSuccess
                }

              </div>

            )}


            <button
              type="button"
              className="content-save-draft"
              onClick={() =>
                void savePost(
                  "draft"
                )
              }
              disabled={
                saving
              }
            >

              {
                saving
                  ? "Saving..."
                  : "Save Draft"
              }

            </button>


            <button
              type="button"
              className="content-publish"
              onClick={() =>
                void savePost(
                  "published"
                )
              }
              disabled={
                saving
              }
            >

              <span>

                {
                  saving
                    ? "Publishing..."
                    : "Publish"
                }

              </span>


              <span>
                ↗
              </span>

            </button>

          </div>

        </aside>

      </div>

    </section>

  );

}

