import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import MusicReleaseActions from "@/components/Studio/MusicReleaseActions";

import "./music-detail.css";


/* =========================================================
   TYPES
   ========================================================= */

type MusicRelease = {
  id: string;

  category_id: string | null;

  title: string;

  slug: string;

  artist_name: string;

  description: string | null;

  genre: string | null;

  language: string | null;

  release_date: string | null;

  cover_media_id: string | null;

  record_label: string | null;

  copyright_owner: string | null;

  production_year: number | null;

  upc: string | null;

  status: string;

  published_at: string | null;

  access_type: string;

  preview_enabled: boolean;

  preview_duration: number | null;

  streaming_price: number | null;

  currency: string;

  download_enabled: boolean;

  download_price: number | null;

  donations_enabled: boolean;

  minimum_donation: number | null;

  created_at: string;

  updated_at: string;
};


type MusicCategory = {
  id: string;

  name: string;

  slug: string;

  description: string | null;
};


type MediaItem = {
  id: string;

  title: string | null;

  public_url: string | null;

  thumbnail_url: string | null;

  alt_text: string | null;

  media_type: string;

  duration_seconds: number | null;

  mime_type: string | null;

  file_size: number | null;
};


type MusicTrack = {
  id: string;

  release_id: string;

  title: string;

  slug: string;

  artist_name: string;

  featured_artists: string[] | null;

  track_number: number;

  disc_number: number;

  audio_media_id: string;

  cover_media_id: string | null;

  genre: string | null;

  language: string | null;

  description: string | null;

  lyrics: string | null;

  explicit: boolean;

  isrc: string | null;

  producer: string | null;

  composer: string | null;

  songwriter: string | null;

  release_date: string | null;

  published_at: string | null;

  created_at: string;

  updated_at: string;
};


type MusicLink = {
  id: string;

  release_id: string;

  platform: string;

  url: string;

  created_at: string;
};


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatDate(
  date: string | null
) {

  if (!date) {
    return "—";
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


function formatDateTime(
  date: string | null
) {

  if (!date) {
    return "—";
  }

  return new Date(
    date
  ).toLocaleString(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );

}


function formatDuration(
  seconds: number | null
) {

  if (
    seconds === null ||
    seconds === undefined ||
    !Number.isFinite(seconds)
  ) {
    return "—";
  }


  const total =
    Math.round(seconds);


  const minutes =
    Math.floor(
      total / 60
    );


  const remaining =
    total % 60;


  return `${minutes}:${remaining
    .toString()
    .padStart(
      2,
      "0"
    )}`;

}


function formatCurrency(
  amount: number | null,
  currency: string
) {

  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }


  try {

    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(
      Number(amount)
    );

  } catch {

    return `${currency} ${Number(
      amount
    ).toLocaleString()}`;

  }

}


function getStatusLabel(
  value: string
) {

  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );

}


function getAccessDescription(
  accessType: string
) {

  if (
    accessType ===
    "free"
  ) {
    return "Listeners can access this release for free.";
  }


  if (
    accessType ===
    "support"
  ) {
    return "Listeners can access the release and optionally support the artist.";
  }


  if (
    accessType ===
    "paid"
  ) {
    return "Listeners must pay before accessing this release.";
  }


  if (
    accessType ===
    "preview_paid"
  ) {
    return "Listeners can preview the release before purchasing access.";
  }


  return "Access configuration is not available.";

}


function getDisplayUrl(
  url: string
) {

  try {

    const parsed =
      new URL(url);

    return `${parsed.hostname}${parsed.pathname}`;

  } catch {

    return url;

  }

}


/* =========================================================
   PAGE
   ========================================================= */

export default async function MusicReleasePage({
  params,
}: PageProps) {

  const {
    id,
  } =
    await params;


  const supabase =
    await createClient();


  /* =======================================================
     LOAD RELEASE
     ======================================================= */

  const {
    data: release,
    error: releaseError,
  } =
    await supabase
      .from(
        "music_releases"
      )
      .select(`
        id,
        category_id,
        title,
        slug,
        artist_name,
        description,
        genre,
        language,
        release_date,
        cover_media_id,
        record_label,
        copyright_owner,
        production_year,
        upc,
        status,
        published_at,
        access_type,
        preview_enabled,
        preview_duration,
        streaming_price,
        currency,
        download_enabled,
        download_price,
        donations_enabled,
        minimum_donation,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (
    releaseError
  ) {

    console.error(
      "Music release error:",
      releaseError
    );

  }


  if (!release) {
    notFound();
  }


  const musicRelease =
    release as MusicRelease;


  /* =======================================================
     LOAD CATEGORY
     ======================================================= */

  let category:
    | MusicCategory
    | null =
    null;


  if (
    musicRelease.category_id
  ) {

    const {
      data: categoryData,
      error: categoryError,
    } =
      await supabase
        .from(
          "music_categories"
        )
        .select(`
          id,
          name,
          slug,
          description
        `)
        .eq(
          "id",
          musicRelease.category_id
        )
        .maybeSingle();


    if (
      categoryError
    ) {

      console.error(
        "Music category error:",
        categoryError
      );

    }


    category =
      categoryData as
        | MusicCategory
        | null;

  }


  /* =======================================================
     LOAD COVER
     ======================================================= */

  let coverMedia:
    | MediaItem
    | null =
    null;


  if (
    musicRelease.cover_media_id
  ) {

    const {
      data: coverData,
      error: coverError,
    } =
      await supabase
        .from(
          "media"
        )
        .select(`
          id,
          title,
          public_url,
          thumbnail_url,
          alt_text,
          media_type,
          duration_seconds,
          mime_type,
          file_size
        `)
        .eq(
          "id",
          musicRelease.cover_media_id
        )
        .maybeSingle();


    if (
      coverError
    ) {

      console.error(
        "Music cover error:",
        coverError
      );

    }


    coverMedia =
      coverData as
        | MediaItem
        | null;

  }


  /* =======================================================
     LOAD TRACKS
     ======================================================= */

  const {
    data: tracksData,
    error: tracksError,
  } =
    await supabase
      .from(
        "music_tracks"
      )
      .select(`
        id,
        release_id,
        title,
        slug,
        artist_name,
        featured_artists,
        track_number,
        disc_number,
        audio_media_id,
        cover_media_id,
        genre,
        language,
        description,
        lyrics,
        explicit,
        isrc,
        producer,
        composer,
        songwriter,
        release_date,
        published_at,
        created_at,
        updated_at
      `)
      .eq(
        "release_id",
        musicRelease.id
      )
      .order(
        "disc_number",
        {
          ascending: true,
        }
      )
      .order(
        "track_number",
        {
          ascending: true,
        }
      );


  if (
    tracksError
  ) {

    console.error(
      "Music tracks error:",
      tracksError
    );

  }


  const tracks =
    (tracksData ??
      []) as MusicTrack[];


  /* =======================================================
     LOAD MUSIC LINKS
     ======================================================= */

  const {
    data: linksData,
    error: linksError,
  } =
    await supabase
      .from(
        "music_links"
      )
      .select(`
        id,
        release_id,
        platform,
        url,
        created_at
      `)
      .eq(
        "release_id",
        musicRelease.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );


  if (
    linksError
  ) {

    console.error(
      "Music links error:",
      linksError
    );

  }


  const musicLinks =
    (linksData ??
      []) as MusicLink[];


  /* =======================================================
     LOAD TRACK AUDIO
     ======================================================= */

  const audioIds =
    tracks.map(
      (
        track
      ) =>
        track.audio_media_id
    );


  const audioMap =
    new Map<
      string,
      MediaItem
    >();


  if (
    audioIds.length > 0
  ) {

    const {
      data: audioData,
      error: audioError,
    } =
      await supabase
        .from(
          "media"
        )
        .select(`
          id,
          title,
          public_url,
          thumbnail_url,
          alt_text,
          media_type,
          duration_seconds,
          mime_type,
          file_size
        `)
        .in(
          "id",
          audioIds
        );


    if (
      audioError
    ) {

      console.error(
        "Track audio error:",
        audioError
      );

    }


    (
      (audioData ??
        []) as MediaItem[]
    ).forEach(
      (
        audio
      ) => {

        audioMap.set(
          audio.id,
          audio
        );

      }
    );

  }


  /* =======================================================
     COVER URL
     ======================================================= */

  const coverUrl =
    coverMedia?.public_url ||
    coverMedia?.thumbnail_url ||
    null;


  /* =======================================================
     TOTAL DURATION
     ======================================================= */

  const totalDuration =
    tracks.reduce(
      (
        total,
        track
      ) => {

        const audio =
          audioMap.get(
            track.audio_media_id
          );


        return (
          total +
          (
            audio?.duration_seconds ||
            0
          )
        );

      },
      0
    );


  return (

    <main className="music-detail-page">


      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="music-detail-header">

        <div>

          <Link
            href="/studio/music"
            className="music-detail-back"
          >
            ← Back to Music
          </Link>


          <span className="music-detail-eyebrow">
            AKNM STUDIO / MUSIC
          </span>

        </div>


        <div className="music-detail-header-actions">

          <Link
            href={`/studio/music/${id}/edit`}
            className="music-detail-edit"
          >
            Edit Release
          </Link>


          <MusicReleaseActions
            releaseId={
              musicRelease.id
            }
            status={
              musicRelease.status
            }
          />

        </div>

      </header>


      {/* ===================================================
          HERO
          =================================================== */}

      <section className="music-detail-hero">


        <div className="music-detail-cover">

          {coverUrl ? (

            <img
              src={coverUrl}
              alt={
                coverMedia?.alt_text ||
                musicRelease.title
              }
            />

          ) : (

            <div className="music-detail-cover-empty">

              <span>

                {musicRelease.title
                  .slice(
                    0,
                    2
                  )
                  .toUpperCase()}

              </span>


              <small>
                NO ARTWORK
              </small>

            </div>

          )}

        </div>


        <div className="music-detail-hero-info">

          <div className="music-detail-type">

            {category?.name ||
              "Music Release"}

          </div>


          <h1>
            {musicRelease.title}
          </h1>


          <p className="music-detail-artist">

            {musicRelease.artist_name}

          </p>


          <div className="music-detail-hero-stats">

            <span>

              {tracks.length}{" "}

              {tracks.length ===
              1
                ? "Track"
                : "Tracks"}

            </span>


            <span>
              {formatDuration(
                totalDuration
              )}
            </span>


            {musicRelease.genre && (

              <span>
                {musicRelease.genre}
              </span>

            )}

          </div>


          <div
            className={`
              music-detail-status
              music-detail-status--${musicRelease.status}
            `}
          >

            <span />


            {getStatusLabel(
              musicRelease.status
            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          OVERVIEW
          =================================================== */}

      <section className="music-detail-information">

        <div className="music-detail-section-heading">

          <span>
            01
          </span>


          <div>

            <h2>
              Release information
            </h2>


            <p>
              Core details and classification
              for this release.
            </p>

          </div>

        </div>


        <div className="music-detail-meta-grid">


          <div className="music-detail-meta">

            <span>
              ARTIST
            </span>

            <strong>
              {musicRelease.artist_name}
            </strong>

          </div>


          <div className="music-detail-meta">

            <span>
              CATEGORY
            </span>

            <strong>
              {category?.name ||
                "—"}
            </strong>

          </div>


          <div className="music-detail-meta">

            <span>
              GENRE
            </span>

            <strong>
              {musicRelease.genre ||
                "—"}
            </strong>

          </div>


          <div className="music-detail-meta">

            <span>
              LANGUAGE
            </span>

            <strong>
              {musicRelease.language ||
                "—"}
            </strong>

          </div>


          <div className="music-detail-meta">

            <span>
              RELEASE DATE
            </span>

            <strong>

              {formatDate(
                musicRelease.release_date
              )}

            </strong>

          </div>


          <div className="music-detail-meta">

            <span>
              STATUS
            </span>

            <strong>

              {getStatusLabel(
                musicRelease.status
              )}

            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          TRACKLIST
          =================================================== */}

      <section className="music-detail-tracks">

        <div className="music-detail-section-heading">

          <span>
            02
          </span>


          <div>

            <h2>
              Tracklist
            </h2>


            <p>

              {tracks.length === 0
                ? "No tracks have been added to this release yet."
                : `${tracks.length} ${
                    tracks.length === 1
                      ? "track"
                      : "tracks"
                  } in this release.`}

            </p>

          </div>

        </div>


        {tracks.length === 0 ? (

          <div className="music-detail-empty">

            <strong>
              No tracks added
            </strong>


            <p>
              Add audio tracks to begin
              building this release.
            </p>


            <Link
              href={`/studio/music/${id}/edit`}
            >
              Add tracks
              <span>
                ↗
              </span>
            </Link>

          </div>

        ) : (

          <div className="music-detail-tracklist">

            {tracks.map(
              (
                track
              ) => {

                const audio =
                  audioMap.get(
                    track.audio_media_id
                  );


                return (

                  <article
                    key={track.id}
                    className="music-detail-track"
                  >


                    <div className="music-detail-track-number">

                      {String(
                        track.track_number
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    <div className="music-detail-track-main">

                      <div className="music-detail-track-title">

                        <h3>
                          {track.title}
                        </h3>


                        {track.explicit && (

                          <span>
                            E
                          </span>

                        )}

                      </div>


                      <p>

                        {track.artist_name}

                        {track.featured_artists &&
                          track.featured_artists.length >
                            0 && (

                          <>
                            {" "}
                            · feat.{" "}

                            {track.featured_artists.join(
                              ", "
                            )}

                          </>

                        )}

                      </p>


                      <div className="music-detail-track-tags">

                        {track.genre && (

                          <span>
                            {track.genre}
                          </span>

                        )}


                        {track.language && (

                          <span>
                            {track.language}
                          </span>

                        )}

                      </div>

                    </div>


                    <div className="music-detail-track-duration">

                      {formatDuration(
                        audio?.duration_seconds ??
                          null
                      )}

                    </div>


                    <Link
                      href={`/studio/music/${id}/edit`}
                      className="music-detail-track-edit"
                    >
                      Edit
                    </Link>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          EXTERNAL / STREAMING LINKS
          =================================================== */}

      <section className="music-detail-links">

        <div className="music-detail-section-heading">

          <span>
            03
          </span>


          <div>

            <h2>
              Music links
            </h2>


            <p>
              Streaming, listening and external
              links for this release.
            </p>

          </div>

        </div>


        {musicLinks.length === 0 ? (

          <div className="music-detail-empty">

            <strong>
              No music links added
            </strong>


            <p>
              Add links to streaming platforms,
              stores or other destinations.
            </p>


            <Link
              href={`/studio/music/${id}/edit`}
            >
              Add links
              <span>
                ↗
              </span>
            </Link>

          </div>

        ) : (

          <div className="music-detail-links-list">

            {musicLinks.map(
              (
                musicLink
              ) => (

                <a
                  key={
                    musicLink.id
                  }
                  href={
                    musicLink.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="music-detail-link"
                >

                  <div className="music-detail-link-platform">

                    <span>
                      PLATFORM
                    </span>

                    <strong>
                      {getStatusLabel(
                        musicLink.platform
                      )}
                    </strong>

                  </div>


                  <div className="music-detail-link-url">

                    <span>
                      {getDisplayUrl(
                        musicLink.url
                      )}
                    </span>

                  </div>


                  <span className="music-detail-link-arrow">
                    ↗
                  </span>

                </a>

              )
            )}

          </div>

        )}

      </section>


      {/* ===================================================
          DESCRIPTION
          =================================================== */}

      <section className="music-detail-description">

        <div className="music-detail-section-heading">

          <span>
            04
          </span>


          <div>

            <h2>
              About this release
            </h2>


            <p>
              Description and context.
            </p>

          </div>

        </div>


        <div className="music-detail-description-content">

          {musicRelease.description ? (

            <p>
              {musicRelease.description}
            </p>

          ) : (

            <div className="music-detail-description-empty">

              <span>
                —
              </span>


              <p>
                No description has been added
                to this release.
              </p>


              <Link
                href={`/studio/music/${id}/edit`}
              >
                Add description

                <span>
                  ↗
                </span>

              </Link>

            </div>

          )}

        </div>

      </section>


      {/* ===================================================
          RELEASE METADATA
          =================================================== */}

      <section className="music-detail-metadata">

        <div className="music-detail-section-heading">

          <span>
            05
          </span>


          <div>

            <h2>
              Release metadata
            </h2>


            <p>
              Label, ownership and release
              identification information.
            </p>

          </div>

        </div>


        <div className="music-detail-technical-grid">


          <div>

            <span>
              RECORD LABEL
            </span>

            <strong>
              {musicRelease.record_label ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              COPYRIGHT OWNER
            </span>

            <strong>
              {musicRelease.copyright_owner ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              PRODUCTION YEAR
            </span>

            <strong>
              {musicRelease.production_year ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              UPC
            </span>

            <strong>
              {musicRelease.upc ||
                "—"}
            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          ACCESS
          =================================================== */}

      <section className="music-detail-access">

        <div className="music-detail-section-heading">

          <span>
            06
          </span>


          <div>

            <h2>
              Listening access
            </h2>


            <p>
              Control how listeners access
              this release.
            </p>

          </div>

        </div>


        <div className="music-detail-access-card">

          <div>

            <span>
              ACCESS TYPE
            </span>


            <strong>

              {getStatusLabel(
                musicRelease.access_type
              )}

            </strong>


            <p>

              {getAccessDescription(
                musicRelease.access_type
              )}

            </p>

          </div>


          <div className="music-detail-access-values">


            {(musicRelease.access_type ===
              "paid" ||
              musicRelease.access_type ===
                "preview_paid") && (

              <div>

                <span>
                  STREAMING PRICE
                </span>

                <strong>

                  {formatCurrency(
                    musicRelease.streaming_price,
                    musicRelease.currency
                  )}

                </strong>

              </div>

            )}


            {musicRelease.access_type ===
              "preview_paid" && (

              <div>

                <span>
                  PREVIEW
                </span>

                <strong>

                  {musicRelease.preview_enabled
                    ? musicRelease.preview_duration
                      ? `${musicRelease.preview_duration}s`
                      : "Enabled"
                    : "Disabled"}

                </strong>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* ===================================================
          DOWNLOAD
          =================================================== */}

      <section className="music-detail-settings">

        <div className="music-detail-section-heading">

          <span>
            07
          </span>


          <div>

            <h2>
              Downloads
            </h2>


            <p>
              Download availability and
              pricing.
            </p>

          </div>

        </div>


        <div className="music-detail-setting-card">

          <div>

            <span>
              DOWNLOADS
            </span>


            <strong>

              {musicRelease.download_enabled
                ? "Enabled"
                : "Disabled"}

            </strong>

          </div>


          {musicRelease.download_enabled && (

            <div>

              <span>
                PRICE
              </span>


              <strong>

                {formatCurrency(
                  musicRelease.download_price,
                  musicRelease.currency
                )}

              </strong>

            </div>

          )}

        </div>

      </section>


      {/* ===================================================
          LISTENER SUPPORT
          =================================================== */}

      <section className="music-detail-settings">

        <div className="music-detail-section-heading">

          <span>
            08
          </span>


          <div>

            <h2>
              Listener support
            </h2>


            <p>
              Optional financial support
              from listeners.
            </p>

          </div>

        </div>


        <div className="music-detail-setting-card">

          <div>

            <span>
              SUPPORT
            </span>


            <strong>

              {musicRelease.donations_enabled
                ? "Enabled"
                : "Disabled"}

            </strong>

          </div>


          {musicRelease.donations_enabled && (

            <div>

              <span>
                MINIMUM SUPPORT
              </span>


              <strong>

                {formatCurrency(
                  musicRelease.minimum_donation,
                  musicRelease.currency
                )}

              </strong>

            </div>

          )}

        </div>

      </section>


      {/* ===================================================
          TECHNICAL DETAILS
          =================================================== */}

      <section className="music-detail-technical">

        <div className="music-detail-section-heading">

          <span>
            09
          </span>


          <div>

            <h2>
              Technical details
            </h2>


            <p>
              Internal identification and
              system information.
            </p>

          </div>

        </div>


        <div className="music-detail-technical-grid">


          <div>

            <span>
              RELEASE ID
            </span>

            <strong>
              {musicRelease.id}
            </strong>

          </div>


          <div>

            <span>
              SLUG
            </span>

            <strong>
              {musicRelease.slug}
            </strong>

          </div>


          <div>

            <span>
              COVER ARTWORK
            </span>

            <strong>

              {musicRelease.cover_media_id
                ? "Attached"
                : "None"}

            </strong>

          </div>


          <div>

            <span>
              PUBLISHED
            </span>

            <strong>

              {formatDateTime(
                musicRelease.published_at
              )}

            </strong>

          </div>


          <div>

            <span>
              CREATED
            </span>

            <strong>

              {formatDateTime(
                musicRelease.created_at
              )}

            </strong>

          </div>


          <div>

            <span>
              LAST UPDATED
            </span>

            <strong>

              {formatDateTime(
                musicRelease.updated_at
              )}

            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="music-detail-footer">

        <Link
          href="/studio/music"
          className="music-detail-footer-back"
        >
          ← Back to Music
        </Link>


        <div>

          <Link
            href={`/studio/music/${id}/edit`}
            className="music-detail-footer-edit"
          >
            Edit Release
          </Link>


          {musicRelease.status ===
            "draft" && (

            <MusicReleaseActions
              releaseId={
                musicRelease.id
              }
              status={
                musicRelease.status
              }
            />

          )}

        </div>

      </footer>


    </main>

  );

}