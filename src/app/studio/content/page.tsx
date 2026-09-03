import { createClient } from "@/lib/supabase/server";

import ContentManager from "./ContentManager";

import type { ComponentProps } from "react";


/* =========================================================
   TYPES
   ========================================================= */

/*
 * Use the exact type expected by ContentManager.
 *
 * This prevents page.tsx and ContentManager.tsx
 * from having competing definitions of ContentPost.
 */
type ContentPost =
  ComponentProps<typeof ContentManager>["initialPosts"][number];


/* =========================================================
   PAGE
   ========================================================= */

export default async function ContentPage() {

  const supabase = await createClient();


  /* =======================================================
     FETCH CONTENT
     ======================================================= */

  const {
    data: posts,
    error,
  } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      post_type,
      status,
      featured,
      scheduled_at,
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
        media_type
      ),

      post_tags (
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .order("created_at", {
      ascending: false,
    });


  /* =======================================================
     ERROR HANDLING
     ======================================================= */

  if (error) {

    console.error(
      "STUDIO CONTENT FETCH ERROR:",
      error
    );

    throw new Error(
      "Could not load studio content."
    );

  }


  /* =======================================================
     NORMALIZE POSTS
     ======================================================= */

  const normalizedPosts: ContentPost[] =
    (posts ?? []).map((post) => {

      /*
       * Supabase can return relationship fields as arrays
       * depending on the generated relationship type.
       *
       * ContentManager expects:
       *
       * categories  → ContentCategory[]
       * cover_media → ContentMedia | null
       * post_tags   → ContentPostTag[]
       */

      const rawCategories =
        post.categories;


      const categories =
        Array.isArray(rawCategories)
          ? rawCategories
          : rawCategories
            ? [rawCategories]
            : [];


      const rawCoverMedia =
        post.cover_media;


      const coverMedia =
        Array.isArray(rawCoverMedia)
          ? rawCoverMedia[0] ?? null
          : rawCoverMedia ?? null;


      const postTags =
  Array.isArray(post.post_tags)
    ? post.post_tags.map((postTag) => {

        const rawTags = postTag.tags;

        const tag =
          Array.isArray(rawTags)
            ? rawTags[0] ?? null
            : rawTags ?? null;

        return {
          tags: tag,
        };

      })
    : [];


      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,

        post_type:
          post.post_type as ContentPost["post_type"],

        status:
          post.status as ContentPost["status"],

        featured: post.featured,

        scheduled_at:
          post.scheduled_at,

        published_at:
          post.published_at,

        created_at:
          post.created_at,

        categories:
          categories as ContentPost["categories"],

        cover_media:
          coverMedia as ContentPost["cover_media"],

        post_tags: postTags,
      };

    });


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <ContentManager
      initialPosts={normalizedPosts}
    />
  );

}