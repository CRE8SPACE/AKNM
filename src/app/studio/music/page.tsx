import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import "./music.css";


/* =========================================================
   TYPES
   ========================================================= */

type MusicTrack = {
  id: string;
};


type MusicCategory = {
  id: string;

  name: string;

  slug: string;
};


type MusicRelease = {
  id: string;

  title: string;

  slug: string;

  artist_name: string;

  category_id: string | null;

  status: string;

  description: string | null;

  cover_media_id: string | null;

  release_date: string | null;

  published_at: string | null;

  created_at: string;

  cover: {
    public_url: string | null;

    alt_text: string | null;
  } | null;

  category: MusicCategory | null;

  tracks: MusicTrack[];
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  date: string | null
) {
  if (!date) {
    return "No date";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-US",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  );
}


function getCategoryInitial(
  categoryName: string | null
) {
  if (!categoryName) {
    return "MUS";
  }

  return categoryName
    .slice(0, 3)
    .toUpperCase();
}


/* =========================================================
   MUSIC PAGE
   ========================================================= */

export default async function MusicPage() {

  const supabase =
    await createClient();


  /* =======================================================
     LOAD MUSIC RELEASES
     ======================================================= */

  const {
    data,
    error,
  } =
    await supabase
      .from("music_releases")
      .select(`
        id,
        title,
        slug,
        artist_name,
        category_id,
        status,
        description,
        cover_media_id,
        release_date,
        published_at,
        created_at,

        category:music_categories!music_releases_category_id_fkey (
          id,
          name,
          slug
        ),

        cover:media!music_releases_cover_media_id_fkey (
          public_url,
          alt_text
        ),

        tracks:music_tracks (
          id
        )
      `)
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      );


  if (error) {
    console.error(
      "All music error:",
      error
    );
  }


  const releases =
    (data ??
      []) as unknown as MusicRelease[];


  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalCount =
    releases.length;


  const publishedCount =
    releases.filter(
      (release) =>
        release.status ===
        "published"
    ).length;


  const draftCount =
    releases.filter(
      (release) =>
        release.status ===
        "draft"
    ).length;


  const totalTracks =
    releases.reduce(
      (
        total,
        release
      ) =>
        total +
        (
          release.tracks?.length ??
          0
        ),
      0
    );


  return (
    <main className="music-page">


      {/* =================================================
          HEADER
          ================================================= */}

      <section className="music-header">

        <div className="music-header__intro">

          <span className="music-header__eyebrow">
            AKNM STUDIO / MUSIC
          </span>


          <h1>
            All Music
          </h1>


          <p>
            Manage every music release
            in your AKNM music library.
          </p>

        </div>


        <Link
          href="/studio/music/new"
          className="music-header__create"
        >

          <span>
            New Music
          </span>

          <span>
            +
          </span>

        </Link>

      </section>


      {/* =================================================
          STATS
          ================================================= */}

      <section
        className="music-stats"
        aria-label="Music statistics"
      >

        <div className="music-stat">

          <span>
            RELEASES
          </span>

          <strong>
            {totalCount}
          </strong>

          <small>
            Total music releases
          </small>

        </div>


        <div className="music-stat">

          <span>
            PUBLISHED
          </span>

          <strong>
            {publishedCount}
          </strong>

          <small>
            Live releases
          </small>

        </div>


        <div className="music-stat">

          <span>
            DRAFTS
          </span>

          <strong>
            {draftCount}
          </strong>

          <small>
            Work in progress
          </small>

        </div>


        <div className="music-stat">

          <span>
            TRACKS
          </span>

          <strong>
            {totalTracks}
          </strong>

          <small>
            Songs in library
          </small>

        </div>

      </section>


      {/* =================================================
          MUSIC LIBRARY
          ================================================= */}

      <section className="music-library">

        <div className="music-library__header">

          <div>

            <span>
              ALL MUSIC
            </span>


            <h2>
              Music releases
            </h2>

          </div>


          <span className="music-library__count">

            {totalCount}{" "}

            {totalCount === 1
              ? "RELEASE"
              : "RELEASES"}

          </span>

        </div>


        {/* =================================================
            ERROR
            ================================================= */}

        {error && (

          <div className="music-error">

            <strong>
              Could not load your music.
            </strong>


            <p>
              {
                error.message ||
                "There was a problem loading your music releases."
              }
            </p>

          </div>

        )}


        {/* =================================================
            EMPTY
            ================================================= */}

        {!error &&
          releases.length ===
            0 && (

            <div className="music-empty">

              <div className="music-empty__icon">
                ♪
              </div>


              <h3>
                No music yet.
              </h3>


              <p>
                Create your first music
                release and begin building
                your AKNM music library.
              </p>


              <Link
                href="/studio/music/new"
                className="music-empty__button"
              >

                Create music

                <span>
                  ↗
                </span>

              </Link>

            </div>

          )}


        {/* =================================================
            RELEASE LIST
            ================================================= */}

        {!error &&
          releases.length >
            0 && (

            <div className="music-list">

              {releases.map(
                (release) => {

                  const trackCount =
                    release.tracks?.length ??
                    0;


                  const categoryName =
                    release.category
                      ?.name ??
                    "Uncategorized";


                  return (

                    <article
                      key={release.id}
                      className="music-item"
                    >


                      {/* =================================
                          COVER
                          ================================= */}

                      <Link
                        href={`/studio/music/${release.id}`}
                        className="music-item__cover"
                        aria-label={`Open ${release.title}`}
                      >

                        {release.cover
                          ?.public_url ? (

                          <img
                            src={
                              release.cover
                                .public_url
                            }
                            alt={
                              release.cover
                                .alt_text ||
                              `${release.title} cover`
                            }
                          />

                        ) : (

                          <span>
                            {getCategoryInitial(
                              release.category
                                ?.name ??
                              null
                            )}
                          </span>

                        )}

                      </Link>


                      {/* =================================
                          MAIN
                          ================================= */}

                      <div className="music-item__main">

                        <Link
                          href={`/studio/music/${release.id}`}
                          className="music-item__title-link"
                        >

                          <h3>
                            {release.title}
                          </h3>

                        </Link>


                        <div className="music-item__meta">

                          <span>
                            {release.artist_name}
                          </span>


                          <span>
                            /
                          </span>


                          <span>
                            {categoryName}
                          </span>


                          <span>
                            /
                          </span>


                          <span>
                            {trackCount}{" "}

                            {trackCount === 1
                              ? "track"
                              : "tracks"}
                          </span>


                          <span>
                            /
                          </span>


                          <span>
                            {formatDate(
                              release.release_date ||
                              release.created_at
                            )}
                          </span>

                        </div>

                      </div>


                      {/* =================================
                          STATUS
                          ================================= */}

                      <div
                        className={`
                          music-item__status
                          music-item__status--${release.status}
                        `}
                      >

                        {release.status}

                      </div>


                      {/* =================================
                          ACTIONS
                          ================================= */}

                      <div className="music-item__actions">

                        <Link
                          href={`/studio/music/${release.id}`}
                          className="music-item__action"
                        >
                          Manage
                        </Link>


                        <Link
                          href={`/studio/music/${release.id}/edit`}
                          className="music-item__action"
                        >
                          Edit
                        </Link>

                      </div>


                      {/* =================================
                          ARROW
                          ================================= */}

                      <Link
                        href={`/studio/music/${release.id}`}
                        className="music-item__arrow"
                        aria-label={`Open ${release.title}`}
                      >
                        ↗
                      </Link>

                    </article>

                  );

                }
              )}

            </div>

          )}

      </section>

    </main>
  );
}