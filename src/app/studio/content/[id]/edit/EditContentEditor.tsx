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

import "../../new/ContentEditor.css";


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


type Category = {

  id: string;

  name: string;

  slug: string;

};


type PostMedia = {

  media_id: string;

  sort_order: number;

  is_featured: boolean;

  media:
    | MediaItem
    | null;

};


type PostTag = {

  tag_id: string;

  tags: {

    id: string;

    name: string;

    slug: string;

  } | null;

};


type EditPost = {

  id: string;

  author_id: string;

  category_id: string | null;

  title: string;

  slug: string;

  excerpt: string | null;

  content: string | null;

  post_type: PostType;

  status: PostStatus;

  featured: boolean;

  scheduled_at: string | null;

  published_at: string | null;

  created_at: string;

  cover_media:
    | MediaItem
    | null;

  post_media: PostMedia[];

  post_tags: PostTag[];

};


type EditContentEditorProps = {

  post: EditPost;

  categories: Category[];

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
): string {

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
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function EditContentEditor({
  post,
  categories,
}: EditContentEditorProps) {


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    createClient();


  /* =======================================================
     INITIAL MEDIA
     ======================================================= */

  const initialMedia =
    useMemo(
      () => {

        return [
          ...post.post_media,
        ]
          .sort(
            (
              a,
              b
            ) =>
              a.sort_order -
              b.sort_order
          )
          .map(
            (
              item
            ) =>
              item.media
          )
          .filter(
            (
              media
            ): media is MediaItem =>
              media !== null
          );

      },
      [
        post.post_media,
      ]
    );


  /* =======================================================
     INITIAL TAGS
     ======================================================= */

  const initialTags =
    useMemo(
      () => {

        return post.post_tags
          .map(
            (
              item
            ) =>
              item.tags?.name
          )
          .filter(
            (
              tag
            ): tag is string =>
              Boolean(tag)
          )
          .map(
            (
              tag
            ) =>
              tag
                .trim()
                .toLowerCase()
          );

      },
      [
        post.post_tags,
      ]
    );


  /* =======================================================
     STATE
     ======================================================= */

  const [
    title,
    setTitle,
  ] = useState(
    post.title
  );


  const [
    slug,
    setSlug,
  ] = useState(
    post.slug
  );


  const [
    excerpt,
    setExcerpt,
  ] = useState(
    post.excerpt || ""
  );


  const [
    content,
    setContent,
  ] = useState(
    post.content || ""
  );


  const [
    categoryId,
    setCategoryId,
  ] = useState(
    post.category_id || ""
  );


  const [
    tags,
    setTags,
  ] = useState<string[]>(
    initialTags
  );


  const [
    tagInput,
    setTagInput,
  ] = useState("");


  const [
    featured,
    setFeatured,
  ] = useState(
    post.featured
  );


  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<MediaItem[]>(
    initialMedia
  );


  const [
    coverMedia,
    setCoverMedia,
  ] = useState<
    MediaItem | null
  >(
    post.cover_media || null
  );


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
     GENERATED SLUG
     ======================================================= */

  const generatedSlug =
    useMemo(
      () =>
        slug.trim() ||
        createSlug(title),
      [
        slug,
        title,
      ]
    );


  /* =======================================================
     CURRENT TYPE
     ======================================================= */

  const currentType =
    contentTypes.find(
      (
        item
      ) =>
        item.type ===
        post.post_type
    );


  /* =======================================================
     TAGS
     ======================================================= */

  function addTag() {

    const value =
      tagInput
        .trim()
        .toLowerCase()
        .replace(
          /^#/,
          ""
        );


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
      (
        current
      ) => [
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
      (
        current
      ) =>
        current.filter(
          (
            item
          ) =>
            item !== tag
        )
    );

  }


  /* =======================================================
     SAVE
     ======================================================= */

  async function savePost(
    targetStatus:
      | "draft"
      | "published"
  ) {

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
        createSlug(
          generatedSlug
        );


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
          "You must be signed in to edit content."
        );

      }


      /* ===================================================
         AUTHOR PROTECTION
         =================================================== */

      if (
        post.author_id &&
        post.author_id !==
          user.id
      ) {

        throw new Error(
          "You do not have permission to edit this content."
        );

      }


      /* ===================================================
         IMAGE VALIDATION
         =================================================== */

      if (
        post.post_type === "image" &&
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
        post.post_type === "video"
      ) {

        const videoMedia =
          selectedMedia.filter(
            (
              item
            ) =>
              item.media_type ===
              "video"
          );


        if (
          videoMedia.length === 0
        ) {

          throw new Error(
            "Please select a video."
          );

        }


        if (
          videoMedia.length > 1
        ) {

          throw new Error(
            "Please select only one video."
          );

        }

      }


      /* ===================================================
         COVER
         =================================================== */

      const selectedCover =
        coverMedia ||
        (
          post.post_type === "image"
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

          ? (
              post.status ===
                "published" &&
              post.published_at
            ) ||
            new Date()
              .toISOString()

          : null;


      /* ===================================================
         UPDATE POST
         =================================================== */

      const {
        error:
          postError,
      } =
        await supabase
          .from("posts")
          .update({

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
          .eq(
            "id",
            post.id
          );


      if (
        postError
      ) {

        throw new Error(
          postError.message
        );

      }


     /* ===================================================
   REBUILD MEDIA RELATIONSHIPS
   =================================================== */

/*
 * Remove all existing media relationships
 * for this post first.
 */

const {
  error:
    deleteMediaError,
} =
  await supabase
    .from("post_media")
    .delete()
    .eq(
      "post_id",
      post.id
    );


if (
  deleteMediaError
) {

  throw new Error(
    deleteMediaError.message
  );

}


const uniqueMedia =
  Array.from(
    new Map(
      selectedMedia.map(
        (
          media
        ) => [
          media.id,
          media,
        ]
      )
    ).values()
  );


if (
  uniqueMedia.length >
  0
) {

  const mediaRows =
    uniqueMedia.map(
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
      mediaInsertError,
  } =
    await supabase
      .from("post_media")
      .insert(
        mediaRows
      );


  if (
    mediaInsertError
  ) {

    throw new Error(
      mediaInsertError.message
    );

  }

}


      /* ===================================================
         REBUILD TAG RELATIONSHIPS
         =================================================== */

      const {
        error:
          deleteTagRelationsError,
      } =
        await supabase
          .from("post_tags")
          .delete()
          .eq(
            "post_id",
            post.id
          );


      if (
        deleteTagRelationsError
      ) {

        throw new Error(
          deleteTagRelationsError.message
        );

      }


      for (
        const tagName of tags
      ) {

        const tagSlug =
          createSlug(
            tagName
          );


        if (!tagSlug) {
          continue;
        }


        /* -----------------------------------------------
           FIND EXISTING TAG
           ----------------------------------------------- */

        const {
          data: existingTag,
          error:
            tagLookupError,
        } =
          await supabase
            .from("tags")
            .select(
              "id"
            )
            .eq(
              "slug",
              tagSlug
            )
            .maybeSingle();


        if (
          tagLookupError
        ) {

          throw new Error(
            tagLookupError.message
          );

        }


        let tagId =
          existingTag?.id ||
          null;


        /* -----------------------------------------------
           CREATE TAG
           ----------------------------------------------- */

        if (!tagId) {

          const {
            data: newTag,
            error:
              tagCreateError,
          } =
            await supabase
              .from("tags")
              .insert({

                name:
                  tagName,

                slug:
                  tagSlug,

              })
              .select(
                "id"
              )
              .single();


          if (
            tagCreateError ||
            !newTag
          ) {

            throw new Error(
              tagCreateError?.message ||
              "Could not create tag."
            );

          }


          tagId =
            newTag.id;

        }


        /* -----------------------------------------------
           CREATE POST TAG
           ----------------------------------------------- */

        const {
          error:
            postTagError,
        } =
          await supabase
            .from("post_tags")
            .insert({

              post_id:
                post.id,

              tag_id:
                tagId,

            });


        if (
          postTagError
        ) {

          throw new Error(
            postTagError.message
          );

        }

      }


      /* ===================================================
         SUCCESS
         =================================================== */

      setSaveSuccess(

        targetStatus ===
          "published"

          ? "Content updated and published successfully."

          : "Changes saved as draft successfully."

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
        "CONTENT UPDATE ERROR:",
        error
      );


      setSaveError(

        error instanceof
        Error

          ? error.message

          : "Could not update content."

      );

    } finally {

      setSaving(false);

    }

  }


  /* =======================================================
     RENDER
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

          <Link
            href="/studio/content"
            className="content-editor__change"
          >
            ← All Content
          </Link>


          <div
            className="content-editor__type"
          >

            {currentType?.symbol}

            <span>
              Edit {currentType?.label}
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
            className="
              content-field
              content-field--title
            "
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
              placeholder="Give your story a title."
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
              placeholder="A short introduction..."
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

          {post.post_type ===
            "article" && (

            <div
              className="
                content-field
                content-field--body
              "
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

          {post.post_type ===
            "image" && (

            <div
              className="content-media-section"
            >

              <div
                className="
                  content-media-section__header
                "
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
                    (
                      item
                    ) =>
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

          {post.post_type ===
            "video" && (

            <div
              className="content-media-section"
            >

              <div
                className="
                  content-media-section__header
                "
              >

                <label>
                  VIDEO
                </label>


                <span>

                  {
                    selectedMedia.some(
                      (
                        item
                      ) =>
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
                      (
                        item
                      ) =>
                        item.media_type ===
                        "video"
                    )
                    .map(
                      (
                        item
                      ) =>
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
              className="
                content-media-section__header
              "
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
              URL
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
                (
                  category
                ) => (

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
                (
                  tag
                ) => (

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
              DISPLAY
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
                className="
                  content-toggle__control
                "
              />


              <span>
                Featured post
              </span>

            </label>

          </div>



          {/* =============================================
              PUBLISHING
              ============================================= */}

          <div
            className="
              content-editor-panel
              content-editor-panel--actions
            "
          >

            <label>
              PUBLISHING
            </label>


            {saveError && (

              <div
                className="
                  content-save-message
                  content-save-message--error
                "
              >

                {
                  saveError
                }

              </div>

            )}


            {saveSuccess && (

              <div
                className="
                  content-save-message
                  content-save-message--success
                "
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
                    : post.status ===
                      "published"

                      ? "Update & Publish"

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