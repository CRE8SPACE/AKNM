import MediaUploader from "@/components/Studio/MediaUploader/MediaUploader";
import MediaCard from "@/components/Studio/MediaCard/MediaCard";

import { createClient } from "@/lib/supabase/server";

import "./media.css";


/* =========================================================
   TYPES
   ========================================================= */

type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";


type MediaCategory = {
  id: string;
  name: string;
  slug: string;
};


/* =========================================================
   PAGE
   ========================================================= */

export default async function MediaPage() {

  const supabase =
    await createClient();


  /* =======================================================
     FETCH MEDIA
     ======================================================= */

  const {
    data: media,
    error,
  } =
    await supabase
      .from("media")
      .select(`
        id,
        title,
        description,
        media_type,

        category_id,

        category:categories (
          id,
          name,
          slug
        ),

        public_url,
        thumbnail_url,
        mime_type,
        file_size,
        duration_seconds,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {

    console.error(
      "Media fetch error:",
      error
    );

  }


  /* =======================================================
     NORMALIZE
     ======================================================= */

  const allMedia =
    (media ?? []).map(
      (item) => {

        const rawCategory =
          item.category;


        const category =
          Array.isArray(
            rawCategory
          )
            ? rawCategory[0] ||
              null
            : rawCategory ||
              null;


        return {

          ...item,

          category:
            category as
              | MediaCategory
              | null,

        };

      }
    );


  /* =======================================================
     STATISTICS
     ======================================================= */

  const imageCount =
    allMedia.filter(
      (item) =>
        item.media_type ===
        "image"
    ).length;


  const videoCount =
    allMedia.filter(
      (item) =>
        item.media_type ===
        "video"
    ).length;


  const audioCount =
    allMedia.filter(
      (item) =>
        item.media_type ===
        "audio"
    ).length;


  const documentCount =
    allMedia.filter(
      (item) =>
        item.media_type ===
        "document"
    ).length;


  /* =======================================================
     CATEGORIES
     ======================================================= */

  const categoryCount =
    new Set(
      allMedia
        .map(
          (item) =>
            item.category_id
        )
        .filter(
          Boolean
        )
    ).size;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <main className="media-page">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="media-header">

        <div className="media-header__intro">

          <span className="media-header__eyebrow">
            MEDIA ASSETS
          </span>


          <h1>
            Media
          </h1>


          <p>
            Your central library for
            every image, video, audio
            file and document published
            through AKNM.PRO.
          </p>

        </div>

      </header>



      {/* =================================================
          STATS
          ================================================= */}

      <section
        className="media-stats"
        aria-label="Media statistics"
      >

        <div className="media-stat">

          <span>
            ALL
          </span>


          <strong>
            {allMedia.length}
          </strong>


          <small>
            Total assets
          </small>

        </div>


        <div className="media-stat">

          <span>
            IMAGES
          </span>


          <strong>
            {imageCount}
          </strong>


          <small>
            Photography & graphics
          </small>

        </div>


        <div className="media-stat">

          <span>
            VIDEOS
          </span>


          <strong>
            {videoCount}
          </strong>


          <small>
            Video content
          </small>

        </div>


        <div className="media-stat">

          <span>
            AUDIO
          </span>


          <strong>
            {audioCount}
          </strong>


          <small>
            Music & recordings
          </small>

        </div>


        <div className="media-stat">

          <span>
            DOCUMENTS
          </span>


          <strong>
            {documentCount}
          </strong>


          <small>
            PDFs & documents
          </small>

        </div>

      </section>



      {/* =================================================
          UPLOAD
          ================================================= */}

      <section className="media-upload-section">

        <MediaUploader />

      </section>



      {/* =================================================
          LIBRARY
          ================================================= */}

      <section className="media-library">


        {/* =================================================
            LIBRARY HEADER
            ================================================= */}

        <div className="media-library__header">

          <div>

            <span>
              YOUR LIBRARY
            </span>


            <h2>
              Recent media
            </h2>

          </div>


          <div className="media-library__header-meta">

            <span className="media-library__categories">
              {categoryCount} CATEGORIES
            </span>


            <span className="media-library__count">
              {allMedia.length} ITEMS
            </span>

          </div>

        </div>



        {/* =================================================
            MEDIA
            ================================================= */}

        {allMedia.length ===
        0 ? (

          <div className="media-empty">

            <div className="media-empty__icon">
              +
            </div>


            <h3>
              Your media library is empty.
            </h3>


            <p>
              Upload your first image,
              video, audio file or
              document above.
            </p>

          </div>

        ) : (

          <div className="media-grid">

            {allMedia.map(
              (
                item
              ) => (

                <MediaCard
                  key={
                    item.id
                  }

                  id={
                    item.id
                  }

                  title={
                    item.title
                  }

                  mediaType={
                    item.media_type as MediaType
                  }

                  publicUrl={
                    item.public_url
                  }

                  thumbnailUrl={
                    item.thumbnail_url
                  }

                  mimeType={
                    item.mime_type
                  }

                  fileSize={
                    item.file_size
                  }

                  durationSeconds={
                    item.duration_seconds
                  }

                  createdAt={
                    item.created_at
                  }

                  category={
                    item.category
                  }

                />

              )
            )}

          </div>

        )}

      </section>

    </main>

  );

}