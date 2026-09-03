import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EditContentEditor from "./EditContentEditor";


/* =========================================================
   TYPES
   ========================================================= */

type EditContentPageProps = {

  params: Promise<{
    id: string;
  }>;

};


/* =========================================================
   PAGE
   ========================================================= */

export default async function EditContentPage({
  params,
}: EditContentPageProps) {

  const {
    id,
  } = await params;


  /* =======================================================
     SUPABASE
     ======================================================= */

  const supabase =
    await createClient();


  /* =======================================================
     FETCH POST
     ======================================================= */

  const {
    data: post,
    error: postError,
  } =
    await supabase
      .from("posts")
      .select(`
        id,
        author_id,
        category_id,
        title,
        slug,
        excerpt,
        content,
        post_type,
        status,
        featured,
        scheduled_at,
        published_at,
        created_at,
        cover_media_id
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();


  /* =======================================================
     POST ERROR
     ======================================================= */

  if (postError) {

    console.error(
      "EDIT CONTENT FETCH ERROR:",
      postError
    );

    throw new Error(
      "Could not load content."
    );

  }


  /* =======================================================
     POST NOT FOUND
     ======================================================= */

  if (!post) {

    notFound();

  }


  /* =======================================================
     FETCH POST MEDIA RELATIONSHIPS
     ======================================================= */

  const {
    data: postMediaRows,
    error: postMediaError,
  } =
    await supabase
      .from("post_media")
      .select(`
        media_id,
        sort_order,
        is_featured
      `)
      .eq(
        "post_id",
        post.id
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );


  /* =======================================================
     POST MEDIA ERROR
     ======================================================= */

  if (postMediaError) {

    console.error(
      "EDIT CONTENT MEDIA RELATIONSHIP ERROR:",
      postMediaError
    );

    throw new Error(
      "Could not load content media."
    );

  }


  /* =======================================================
     MEDIA IDS
     ======================================================= */

  const mediaIds =
    (postMediaRows || [])
      .map(
        (
          item
        ) =>
          item.media_id
      );


  /* =======================================================
     FETCH MEDIA
     ======================================================= */

  let mediaRows:
    {
      id: string;
      title: string | null;
      description: string | null;
      media_type:
        | "image"
        | "video"
        | "audio"
        | "document";
      public_url: string | null;
      thumbnail_url: string | null;
      mime_type: string | null;
      file_size: number | null;
      width: number | null;
      height: number | null;
      duration_seconds: number | null;
      alt_text: string | null;
      created_at: string;
    }[] = [];


  if (
    mediaIds.length >
    0
  ) {

    const {
      data,
      error:
        mediaError,
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
          file_size,
          width,
          height,
          duration_seconds,
          alt_text,
          created_at
        `)
        .in(
          "id",
          mediaIds
        );


    if (
      mediaError
    ) {

      console.error(
        "EDIT CONTENT MEDIA FETCH ERROR:",
        mediaError
      );

      throw new Error(
        "Could not load content media."
      );

    }


    mediaRows =
      (data || []) as typeof mediaRows;

  }


  /* =======================================================
     CREATE MEDIA LOOKUP
     ======================================================= */

  const mediaById =
    new Map(
      mediaRows.map(
        (
          media
        ) => [
          media.id,
          media,
        ]
      )
    );


  /* =======================================================
     BUILD POST MEDIA
     ======================================================= */

  const postMedia =
    (postMediaRows || [])
      .map(
        (
          item
        ) => ({

          media_id:
            item.media_id,

          sort_order:
            item.sort_order,

          is_featured:
            item.is_featured,

          media:
            mediaById.get(
              item.media_id
            ) || null,

        })
      );


  /* =======================================================
     FETCH COVER MEDIA
     ======================================================= */

  let coverMedia =
    null;


  if (
    post.cover_media_id
  ) {

    const {
      data,
      error:
        coverError,
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
          file_size,
          width,
          height,
          duration_seconds,
          alt_text,
          created_at
        `)
        .eq(
          "id",
          post.cover_media_id
        )
        .maybeSingle();


    if (
      coverError
    ) {

      console.error(
        "EDIT CONTENT COVER MEDIA ERROR:",
        coverError
      );

      throw new Error(
        "Could not load cover artwork."
      );

    }


    coverMedia =
      data || null;

  }


  /* =======================================================
     FETCH POST TAGS
     
     Tags are loaded for display only.
     Tag persistence remains deferred.
     ======================================================= */

  const {
    data: postTags,
    error: postTagsError,
  } =
    await supabase
      .from("post_tags")
      .select(`
        tag_id,

        tags (
          id,
          name,
          slug
        )
      `)
      .eq(
        "post_id",
        post.id
      );


  if (
    postTagsError
  ) {

    console.error(
      "EDIT CONTENT TAG FETCH ERROR:",
      postTagsError
    );

    /*
     * Tags are not part of the critical
     * editing workflow, so don't prevent
     * the editor from loading.
     */

  }


  /* =======================================================
     NORMALIZE TAGS
     ======================================================= */

  const normalizedPostTags =
    (postTags || [])
      .map(
        (
          item
        ) => {

          const tag =
            Array.isArray(
              item.tags
            )
              ? item.tags[0] ||
                null
              : item.tags ||
                null;


          return {

            tag_id:
              item.tag_id,

            tags:
              tag,

          };

        }
      );


  /* =======================================================
     FETCH ACTIVE CATEGORIES
     ======================================================= */

  const {
    data: categories,
    error: categoryError,
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
      );


  /* =======================================================
     CATEGORY ERROR
     ======================================================= */

  if (
    categoryError
  ) {

    console.error(
      "EDIT CONTENT CATEGORIES FETCH ERROR:",
      categoryError
    );

    throw new Error(
      "Could not load content categories."
    );

  }


  /* =======================================================
     NORMALIZED POST
     ======================================================= */

  const normalizedPost = {

    id:
      post.id,

    author_id:
      post.author_id,

    category_id:
      post.category_id,

    title:
      post.title,

    slug:
      post.slug,

    excerpt:
      post.excerpt,

    content:
      post.content,

    post_type:
      post.post_type,

    status:
      post.status,

    featured:
      post.featured,

    scheduled_at:
      post.scheduled_at,

    published_at:
      post.published_at,

    created_at:
      post.created_at,

    cover_media:
      coverMedia,

    post_media:
      postMedia,

    post_tags:
      normalizedPostTags,

  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <EditContentEditor
      post={
        normalizedPost
      }
      categories={
        categories || []
      }
    />

  );

}