import { createClient } from "@/lib/supabase/server";

import ContentEditor from "./ContentEditor";


/* =========================================================
   PAGE
   ========================================================= */

export default async function NewContentPage() {

  const supabase = await createClient();


  /* =======================================================
     FETCH ACTIVE CATEGORIES
     ======================================================= */

  const {
    data: categories,
    error,
  } = await supabase
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
     ERROR HANDLING
     ======================================================= */

  if (error) {

    console.error(
      "CONTENT CATEGORIES FETCH ERROR:",
      error
    );

    throw new Error(
      "Could not load content categories."
    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <ContentEditor
      categories={categories || []}
    />
  );

}