import { createClient } from "@/lib/supabase/server";

import ContentManager from "./ContentManager";


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
     RENDER
     ======================================================= */

  return (
    <ContentManager
      initialPosts={posts || []}
    />
  );

}