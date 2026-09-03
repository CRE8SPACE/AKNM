"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import {
  useMusicPlayer,
  type MusicTrack as GlobalMusicTrack,
} from "@/components/MusicPlayer/MusicPlayerProvider";

import "./music.css";

/* =========================================================
   TYPES
   ========================================================= */

type MusicCategory = {
  id: string;
  name: string;
  slug: string;
};

type Media = {
  id: string;
  title: string | null;
  public_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  alt_text: string | null;
};

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

  status: string;

  access_type:
    | "free"
    | "support"
    | "paid"
    | "preview_paid";

  preview_enabled: boolean;

  preview_duration: number | null;

  streaming_price: number | null;

  currency: string;

  download_enabled: boolean;

  download_price: number | null;

  donations_enabled: boolean;

  minimum_donation: number | null;

  category: MusicCategory | null;

  cover: Media | null;
};

type MusicTrack = {
  id: string;

  release_id: string;

  title: string;

  slug: string;

  artist_name: string;

  track_number: number;

  disc_number: number;

  audio_media_id: string;

  cover_media_id: string | null;

  explicit: boolean;

  audio: Media | null;

  release: MusicRelease | null;
};

type MusicLink = {
  id: string;

  release_id: string;

  platform: string;

  url: string;
};

type PlayerTrack = MusicTrack & {
  release: MusicRelease;
};

type SupportAction =
  | "artist"
  | "release"
  | "download";

/* =========================================================
   CONSTANTS
   ========================================================= */

const BANK_NAME =
  "United Bank for Africa";

const ACCOUNT_NUMBER =
  "2213821058";

const ACCOUNT_NAME =
  "Agha Dominic Nkemakonam";

const SUPPORT_AMOUNTS = [
  1000,
  2500,
  5000,
  10000,
  25000,
  50000,
];

/* =========================================================
   HELPERS
   ========================================================= */

function formatDuration(
  seconds:
    | number
    | null
    | undefined,
) {
  if (
    !seconds ||
    !Number.isFinite(seconds)
  ) {
    return "00:00";
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remainingSeconds =
    Math.floor(
      seconds % 60,
    );

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    remainingSeconds,
  ).padStart(
    2,
    "0",
  )}`;
}

function formatTrackCount(
  count: number,
) {
  return `${count} ${
    count === 1
      ? "TRACK"
      : "TRACKS"
  }`;
}

function formatCurrency(
  value:
    | number
    | null
    | undefined,
  currency = "NGN",
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",

        currency:
          currency || "NGN",

        maximumFractionDigits: 0,
      },
    ).format(value);
  } catch {
    return `${
      currency || "NGN"
    } ${value}`;
  }
}

function formatReleaseDate(
  value:
    | string
    | null,
) {
  if (!value) {
    return "Upcoming";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",

      month: "short",
    },
  ).format(date);
}

/* =========================================================
   ICONS
   ========================================================= */

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M9 9h10v10H9z" />

      <path d="M5 15H4V5h10v1" />
    </svg>
  );
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function MusicPage() {
  /* =======================================================
     GLOBAL MUSIC PLAYER
     ======================================================= */

  const {
    currentTrack,
    isPlaying,
    togglePlayback,
    playTrack,
  } =
    useMusicPlayer();

  /* =======================================================
     DATA
     ======================================================= */

  const [
    releases,
    setReleases,
  ] =
    useState<
      MusicRelease[]
    >([]);

  const [
    tracks,
    setTracks,
  ] =
    useState<
      MusicTrack[]
    >([]);

  const [
    musicLinks,
    setMusicLinks,
  ] =
    useState<
      MusicLink[]
    >([]);

  /* =======================================================
     SUPPORT
     ======================================================= */

  const [
    showSupport,
    setShowSupport,
  ] =
    useState(false);

  const [
    supportAction,
    setSupportAction,
  ] =
    useState<
      SupportAction
      | null
    >(null);

  const [
    supportRelease,
    setSupportRelease,
  ] =
    useState<
      MusicRelease
      | null
    >(null);

  const [
    selectedAmount,
    setSelectedAmount,
  ] =
    useState<
      number
      | null
    >(null);

  const [
    customAmount,
    setCustomAmount,
  ] =
    useState("");

  const [
    copiedField,
    setCopiedField,
  ] =
    useState("");

  /* =======================================================
     PAGE STATE
     ======================================================= */

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    activeReleaseId,
    setActiveReleaseId,
  ] =
    useState<
      string
      | null
    >(null);

  /* =======================================================
     LOAD MUSIC
     ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadMusic() {
      setLoading(true);

      setError("");

      const supabase =
        createClient();

      /* ---------------------------------------------------
         RELEASES
         --------------------------------------------------- */

      const {
        data: releaseData,
        error:
          releasesError,
      } =
        await supabase
          .from(
            "music_releases",
          )
          .select(
            `
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
              status,
              access_type,
              preview_enabled,
              preview_duration,
              streaming_price,
              currency,
              download_enabled,
              download_price,
              donations_enabled,
              minimum_donation,
              music_categories (
                id,
                name,
                slug
              ),
              media!music_releases_cover_media_id_fkey (
                id,
                title,
                public_url,
                thumbnail_url,
                duration_seconds,
                alt_text
              )
            `,
          )
          .eq(
            "status",
            "published",
          )
          .order(
            "release_date",
            {
              ascending:
                false,
            },
          );

      if (
        releasesError
      ) {
        console.error(
          "Music releases load error:",
          releasesError,
        );

        if (
          !cancelled
        ) {
          setError(
            releasesError.message ||
              "Could not load music releases.",
          );

          setLoading(
            false,
          );
        }

        return;
      }

      const formattedReleases:
        MusicRelease[] =
        (
          releaseData ||
          []
        ).map(
          (
            release:
              any,
          ) => ({
            ...release,

            category:
              release.music_categories ||
              null,

            cover:
              release.media ||
              null,
          }),
        );

      if (
        cancelled
      ) {
        return;
      }

      setReleases(
        formattedReleases,
      );

      /* ---------------------------------------------------
         TRACKS
         --------------------------------------------------- */

      const {
        data: trackData,
        error:
          tracksError,
      } =
        await supabase
          .from(
            "music_tracks",
          )
          .select(
            `
              id,
              release_id,
              title,
              slug,
              artist_name,
              track_number,
              disc_number,
              audio_media_id,
              cover_media_id,
              explicit,
              media!music_tracks_audio_media_id_fkey (
                id,
                title,
                public_url,
                thumbnail_url,
                duration_seconds,
                alt_text
              )
            `,
          )
          .order(
            "disc_number",
            {
              ascending:
                true,
            },
          )
          .order(
            "track_number",
            {
              ascending:
                true,
            },
          );

      if (
        tracksError
      ) {
        console.error(
          "Music tracks load error:",
          tracksError,
        );

        if (
          !cancelled
        ) {
          setError(
            tracksError.message ||
              "Could not load music tracks.",
          );
        }
      }

      const formattedTracks:
        MusicTrack[] =
        (
          trackData ||
          []
        ).map(
          (
            track:
              any,
          ) => {
            const release =
              formattedReleases.find(
                (
                  item,
                ) =>
                  item.id ===
                  track.release_id,
              ) ||
              null;

            return {
              id:
                track.id,

              release_id:
                track.release_id,

              title:
                track.title,

              slug:
                track.slug,

              artist_name:
                track.artist_name,

              track_number:
                track.track_number,

              disc_number:
                track.disc_number,

              audio_media_id:
                track.audio_media_id,

              cover_media_id:
                track.cover_media_id,

              explicit:
                track.explicit,

              audio:
                track.media ||
                null,

              release,
            };
          },
        );

      if (
        !cancelled
      ) {
        setTracks(
          formattedTracks,
        );
      }

      /* ---------------------------------------------------
         MUSIC LINKS
         --------------------------------------------------- */

      const {
        data: linksData,
        error:
          linksError,
      } =
        await supabase
          .from(
            "music_links",
          )
          .select(
            `
              id,
              release_id,
              platform,
              url
            `,
          );

      if (
        linksError
      ) {
        console.error(
          "Music links load error:",
          linksError,
        );
      }

      if (
        !cancelled
      ) {
        setMusicLinks(
          (
            linksData ||
            []
          ) as MusicLink[],
        );

        setLoading(
          false,
        );
      }
    }

    void loadMusic();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     PLAYABLE TRACKS
     ======================================================= */

  const playableTracks =
    useMemo(
      () =>
        tracks.filter(
          (
            track,
          ): track is PlayerTrack =>
            Boolean(
              track.audio
                ?.public_url &&
                track.release,
            ),
        ),
      [
        tracks,
      ],
    );

  /* =======================================================
     ACTIVE RELEASE
     ======================================================= */

  const activeRelease =
    releases.find(
      (
        release,
      ) =>
        release.id ===
        activeReleaseId,
    ) ||
    releases.find(
      (
        release,
      ) =>
        release.id ===
        currentTrack?.releaseId,
    ) ||
    releases[0] ||
    null;

  const activeReleaseTracks =
    activeRelease
      ? playableTracks.filter(
          (
            track,
          ) =>
            track.release_id ===
            activeRelease.id,
        )
      : [];

  const activeReleaseLinks =
    activeRelease
      ? musicLinks.filter(
          (
            link,
          ) =>
            link.release_id ===
            activeRelease.id,
        )
      : [];

  /*
   * FEATURED RELEASE
   *
   * This continues to use the
   * automatic featured system.
   *
   * The newest published release
   * returned by the current ordering
   * becomes the featured release.
   */

  const featuredRelease =
    releases[0] ||
    null;

  /* =======================================================
     SUPPORT
     ======================================================= */

  function openSupport(
    action:
      SupportAction,
    release?:
      MusicRelease,
  ) {
    setSupportAction(
      action,
    );

    setSupportRelease(
      release ||
        null,
    );

    setSelectedAmount(
      null,
    );

    setCustomAmount(
      "",
    );

    setCopiedField(
      "",
    );

    setShowSupport(
      true,
    );
  }

  function closeSupport() {
    setShowSupport(
      false,
    );

    setSupportAction(
      null,
    );

    setSupportRelease(
      null,
    );

    setSelectedAmount(
      null,
    );

    setCustomAmount(
      "",
    );

    setCopiedField(
      "",
    );
  }

  async function copyText(
    text:
      string,
    field:
      string,
  ) {
    try {
      await navigator.clipboard.writeText(
        text,
      );

      setCopiedField(
        field,
      );

      window.setTimeout(
        () => {
          setCopiedField(
            "",
          );
        },
        2000,
      );
    } catch (error) {
      console.error(
        "Could not copy:",
        error,
      );
    }
  }

  const supportAmount =
    customAmount.trim()
      ? Number(
          customAmount,
        )
      : selectedAmount;

  /* =======================================================
     GLOBAL PLAYER QUEUE
     ======================================================= */

  const globalQueue =
    useMemo<
      GlobalMusicTrack[]
    >(
      () =>
        playableTracks.map(
          (
            track,
          ) => ({
            id:
              track.id,

            title:
              track.title,

            duration:
              track.audio
                ?.duration_seconds ||
              null,

            audioUrl:
              track.audio
                ?.public_url ||
              null,

            releaseId:
              track.release_id,

            releaseTitle:
              track.release.title,

            artistName:
              track.artist_name ||
              track.release
                .artist_name,

            coverUrl:
              track.release.cover
                ?.public_url ||
              track.release.cover
                ?.thumbnail_url ||
              null,
          }),
        ),
      [
        playableTracks,
      ],
    );

  /* =======================================================
     PLAY TRACK
     ======================================================= */

  function handlePlayTrack(
    track:
      PlayerTrack,
  ) {
    setActiveReleaseId(
      track.release_id,
    );

    const globalTrack =
      globalQueue.find(
        (
          item,
        ) =>
          item.id ===
          track.id,
      );

    if (
      !globalTrack
    ) {
      return;
    }

    playTrack(
      globalTrack,
      globalQueue,
    );
  }

  /* =======================================================
     PLAY RELEASE
     ======================================================= */

  function handlePlayRelease(
    release:
      MusicRelease,
  ) {
    setActiveReleaseId(
      release.id,
    );

    const releaseTracks =
      playableTracks.filter(
        (
          track,
        ) =>
          track.release_id ===
          release.id,
      );

    const firstTrack =
      releaseTracks[0];

    if (
      !firstTrack
    ) {
      return;
    }

    handlePlayTrack(
      firstTrack,
    );
  }

  /* =======================================================
     DOWNLOAD
     ======================================================= */

  function handleDownload(
    track:
      PlayerTrack,
  ) {
    const release =
      track.release;

    if (
      !release.download_enabled
    ) {
      return;
    }

    /*
     * Downloads are campaign-based.
     *
     * If a download price has been
     * configured, show the support
     * interface instead.
     */

    if (
      release.download_price &&
      release.download_price >
        0
    ) {
      openSupport(
        "download",
        release,
      );

      return;
    }

    const audioUrl =
      track.audio
        ?.public_url;

    if (
      !audioUrl
    ) {
      return;
    }

    window.open(
      audioUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  /* =======================================================
     LOADING
     ======================================================= */

  if (
    loading
  ) {
    return (
      <>
        <Header />

        <main className="music-page">

          <section className="music-page__hero">

            <div className="music-page__container">

              <p>
                Loading music...
              </p>

            </div>

          </section>

        </main>

        <Footer />
      </>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (
    error &&
    releases.length ===
      0
  ) {
    return (
      <>
        <Header />

        <main className="music-page">

          <section className="music-page__hero">

            <div className="music-page__container">

              <h1>
                Music unavailable.
              </h1>

              <p>
                {error}
              </p>

            </div>

          </section>

        </main>

        <Footer />
      </>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <Header />

      <main className="music-page">

        {/* ===============================================
            HERO
           =============================================== */}

        <section className="music-page__hero">

          <div className="music-page__container">

            <div className="music-page__eyebrow">

              <span className="music-page__line" />

              <span>
                Independent Music
              </span>

            </div>


            <div className="music-page__hero-content">

              <div>

                <span className="music-page__artist-label">

                  AKNM MUSIC PRESENTS

                </span>


                <h1>

                  DOM
                  <br />
                  CYPHERZ

                </h1>


                <p>

                  Music, ideas and stories
                  created to outlive the moment.

                </p>


                <div className="music-page__hero-actions">

                  {featuredRelease && (

                    <button
                      type="button"
                      className="music-page__listen-button"
                      onClick={() =>
                        handlePlayRelease(
                          featuredRelease,
                        )
                      }
                    >

                      <span>
                        Listen now
                      </span>

                      <span>

                        {currentTrack
                          ?.releaseId ===
                          featuredRelease.id &&
                        isPlaying ? (

                          <PauseIcon />

                        ) : (

                          <PlayIcon />

                        )}

                      </span>

                    </button>

                  )}


                  <button
                    type="button"
                    className="music-page__hero-support"
                    onClick={() =>
                      openSupport(
                        "artist",
                      )
                    }
                  >

                    Support the artist

                    <span>
                      ↗
                    </span>

                  </button>

                </div>

              </div>


              <div className="music-page__hero-side">

                <span>
                  CURRENT COLLECTION
                </span>


                <strong>

                  {
                    featuredRelease
                      ?.title ||
                    "Music"
                  }

                </strong>


                <small>

                  {
                    featuredRelease
                      ?.artist_name ||
                    "Dom Cypherz"
                  }

                </small>


                <p>

                  Independent music.
                  A bigger vision.
                  A legacy in progress.

                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ===============================================
            FEATURED RELEASE
           =============================================== */}

        {featuredRelease && (

          <section className="music-page__featured">

            <div className="music-page__container">

              <p className="music-page__section-label">

                Featured release

              </p>


              <div className="music-page__featured-card">

                <div className="music-page__cover">

                  {featuredRelease.cover
                    ?.public_url ? (

                    <img
                      src={
                        featuredRelease
                          .cover
                          .public_url
                      }
                      alt={
                        featuredRelease
                          .cover
                          .alt_text ||
                        featuredRelease
                          .title
                      }
                      className="music-page__cover-image"
                    />

                  ) : (

                    <>

                      <span className="music-page__cover-mark">

                        A

                      </span>


                      <span>

                        AKNM MUSIC

                      </span>

                    </>

                  )}

                </div>


                <div className="music-page__featured-info">

                  <div className="music-page__release-meta">

                    <span>

                      {
                        featuredRelease
                          .category
                          ?.name ||
                        "RELEASE"
                      }

                    </span>


                    <span>

                      {formatReleaseDate(
                        featuredRelease
                          .release_date,
                      )}

                    </span>

                  </div>


                  <h2>

                    {
                      featuredRelease
                        .title
                    }

                  </h2>


                  {featuredRelease
                    .description && (

                    <p>

                      {
                        featuredRelease
                          .description
                      }

                    </p>

                  )}


                  <div className="music-page__release-details">

                    {featuredRelease
                      .genre && (

                      <span>

                        {
                          featuredRelease
                            .genre
                        }

                      </span>

                    )}


                    <span>

                      {formatTrackCount(
                        playableTracks.filter(
                          (
                            track,
                          ) =>
                            track.release_id ===
                            featuredRelease.id,
                        ).length,
                      )}

                    </span>

                  </div>


                  <div className="music-page__featured-actions">

                    <button
                      type="button"
                      className="music-page__listen-button"
                      onClick={() =>
                        handlePlayRelease(
                          featuredRelease,
                        )
                      }
                    >

                      <span>
                        Listen now
                      </span>

                      <span>

                        {currentTrack
                          ?.releaseId ===
                          featuredRelease.id &&
                        isPlaying ? (

                          <PauseIcon />

                        ) : (

                          <PlayIcon />

                        )}

                      </span>

                    </button>


                    <button
                      type="button"
                      className="music-page__support-button"
                      onClick={() =>
                        openSupport(
                          "release",
                          featuredRelease,
                        )
                      }
                    >

                      Support this music

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ===============================================
            TRACKS
           =============================================== */}

        <section className="music-page__tracks">

          <div className="music-page__container">

            <div className="music-page__section-heading">

              <div>

                <span>
                  Listen freely
                </span>


                <h2>
                  Tracks
                </h2>

              </div>


              <span>

                {formatTrackCount(
                  playableTracks.length,
                )}

              </span>

            </div>


            <div className="music-page__track-list">

              {playableTracks.map(
                (
                  track,
                  index,
                ) => {

                  const isCurrentTrack =
                    currentTrack
                      ?.id ===
                    track.id;

                  return (

                    <div
                      className="music-page__track"
                      key={track.id}
                    >

                      <span className="music-page__track-number">

                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          "0",
                        )}

                      </span>


                      <button
                        type="button"
                        className="music-page__track-play"
                        onClick={() => {

                          if (
                            isCurrentTrack
                          ) {
                            togglePlayback();

                            return;
                          }

                          handlePlayTrack(
                            track,
                          );

                        }}
                        aria-label={
                          isCurrentTrack &&
                          isPlaying
                            ? `Pause ${track.title}`
                            : `Play ${track.title}`
                        }
                      >

                        {isCurrentTrack &&
                        isPlaying ? (

                          <PauseIcon />

                        ) : (

                          <PlayIcon />

                        )}

                      </button>


                      <button
                        type="button"
                        className="music-page__track-info"
                        onClick={() =>
                          handlePlayTrack(
                            track,
                          )
                        }
                      >

                        <strong>

                          {track.title}

                        </strong>


                        <small>

                          {
                            track.artist_name ||
                            track.release
                              .artist_name
                          }

                          {track.explicit && (

                            <>
                              {" · E"}
                            </>

                          )}

                        </small>

                      </button>


                      <span className="music-page__track-duration">

                        {formatDuration(
                          track.audio
                            ?.duration_seconds,
                        )}

                      </span>


                      <button
                        type="button"
                        className="music-page__track-arrow"
                        onClick={() =>
                          setActiveReleaseId(
                            track.release_id,
                          )
                        }
                        aria-label={`View ${track.release.title}`}
                      >

                        ↗

                      </button>

                    </div>

                  );

                },
              )}


              {playableTracks.length ===
                0 && (

                <div className="music-page__empty">

                  No music is available yet.

                </div>

              )}

            </div>

          </div>

        </section>


        {/* ===============================================
            RELEASES
           =============================================== */}

        {releases.length >
          0 && (

          <section className="music-page__releases">

            <div className="music-page__container">

              <div className="music-page__section-heading">

                <div>

                  <span>
                    Discography
                  </span>


                  <h2>
                    Releases
                  </h2>

                </div>


                <span>

                  {releases.length}

                </span>

              </div>


              <div className="music-page__release-grid">

                {releases.map(
                  (
                    release,
                  ) => {

                    const releaseTracks =
                      playableTracks.filter(
                        (
                          track,
                        ) =>
                          track.release_id ===
                          release.id,
                      );

                    const releaseIsPlaying =
                      currentTrack
                        ?.releaseId ===
                        release.id &&
                      isPlaying;

                    return (

                      <article
                        className="music-page__release"
                        key={release.id}
                      >

                        <div className="music-page__release-cover">

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
                                release.title
                              }
                              className="music-page__release-image"
                            />

                          ) : (

                            <>

                              <span>
                                A
                              </span>

                              <strong>
                                AKNM
                              </strong>

                            </>

                          )}


                          <small>

                            {formatTrackCount(
                              releaseTracks.length,
                            )}

                          </small>

                        </div>


                        <div className="music-page__release-body">

                          <div className="music-page__release-top">

                            <span>

                              {
                                release.category
                                  ?.name ||
                                "RELEASE"
                              }

                            </span>


                            <span>

                              {formatReleaseDate(
                                release.release_date,
                              )}

                            </span>

                          </div>


                          <h3>

                            {release.title}

                          </h3>


                          <p>

                            {
                              release.description ||
                              "Explore this release from AKNM Music."
                            }

                          </p>


                          <div className="music-page__release-bottom">

                            <span>

                              {
                                release.genre ||
                                release.artist_name
                              }

                            </span>


                            <button
                              type="button"
                              onClick={() => {

                                setActiveReleaseId(
                                  release.id,
                                );

                                if (
                                  currentTrack
                                    ?.releaseId ===
                                  release.id
                                ) {
                                  togglePlayback();

                                  return;
                                }

                                handlePlayRelease(
                                  release,
                                );

                              }}
                              aria-label={
                                releaseIsPlaying
                                  ? `Pause ${release.title}`
                                  : `Play ${release.title}`
                              }
                            >

                              {releaseIsPlaying ? (

                                <PauseIcon />

                              ) : (

                                <PlayIcon />

                              )}

                            </button>

                          </div>

                        </div>

                      </article>

                    );

                  },
                )}

              </div>

            </div>

          </section>

        )}


        {/* ===============================================
            ACTIVE RELEASE
           =============================================== */}

        {activeRelease && (

          <section className="music-page__active-release">

            <div className="music-page__container">

              <div className="music-page__section-heading">

                <div>

                  <span>
                    Selected release
                  </span>


                  <h2>

                    {
                      activeRelease
                        .title
                    }

                  </h2>

                </div>

              </div>


              <div className="music-page__active-release-grid">

                <div>

                  {activeRelease
                    .description && (

                    <p className="music-page__active-description">

                      {
                        activeRelease
                          .description
                      }

                    </p>

                  )}


                  <div className="music-page__active-tracks">

                    {activeReleaseTracks.map(
                      (
                        track,
                      ) => {

                        const isCurrentTrack =
                          currentTrack
                            ?.id ===
                          track.id;

                        return (

                          <div
                            className="music-page__active-track"
                            key={track.id}
                          >

                            <span>

                              {String(
                                track.track_number,
                              ).padStart(
                                2,
                                "0",
                              )}

                            </span>


                            <button
                              type="button"
                              onClick={() => {

                                if (
                                  isCurrentTrack
                                ) {
                                  togglePlayback();

                                  return;
                                }

                                handlePlayTrack(
                                  track,
                                );

                              }}
                            >

                              {isCurrentTrack &&
                              isPlaying ? (

                                <PauseIcon />

                              ) : (

                                <PlayIcon />

                              )}

                            </button>


                            <strong>

                              {track.title}

                            </strong>


                            <span>

                              {formatDuration(
                                track.audio
                                  ?.duration_seconds,
                              )}

                            </span>


                            {activeRelease
                              .download_enabled && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    track,
                                  )
                                }
                              >

                                Download

                              </button>

                            )}

                          </div>

                        );

                      },
                    )}

                  </div>


                  <button
                    type="button"
                    className="music-page__active-support"
                    onClick={() =>
                      openSupport(
                        "release",
                        activeRelease,
                      )
                    }
                  >

                    Support this music

                    <span>
                      ↗
                    </span>

                  </button>

                </div>


                {activeReleaseLinks.length >
                  0 && (

                  <div className="music-page__release-links">

                    <span>

                      Also available on

                    </span>


                    {activeReleaseLinks.map(
                      (
                        link,
                      ) => (

                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                        >

                          {link.platform}


                          <span>
                            ↗
                          </span>

                        </a>

                      ),
                    )}

                  </div>

                )}

              </div>

            </div>

          </section>

        )}


        {/* ===============================================
            ABOUT THE ARTIST
           =============================================== */}

        <section className="music-page__about">

          <div className="music-page__container">

            <div className="music-page__about-grid">

              <div className="music-page__about-label">

                <span>
                  01
                </span>

                <p>
                  ABOUT THE ARTIST
                </p>

              </div>


              <div className="music-page__about-content">

                <span className="music-page__section-label">

                  The story

                </span>


                <h2>

                  Music has always been
                  more than sound.

                </h2>


                <div className="music-page__about-copy">

                  <p>

                    Dom Cypherz is an
                    independent artist and
                    creative building music
                    around ideas, stories,
                    ambition and experience.

                  </p>


                  <p>

                    In an era increasingly
                    dominated by moments,
                    algorithms and whatever
                    is loud enough to become
                    a trend, the mission is
                    different.

                  </p>


                  <p>

                    To create music that
                    survives beyond the
                    moment in which it was
                    released.

                  </p>


                  <p>

                    Music people can return
                    to. Music that becomes
                    part of a memory. Music
                    that carries an idea,
                    tells a story and leaves
                    something behind.

                  </p>

                </div>


                <button
                  type="button"
                  className="music-page__about-support"
                  onClick={() =>
                    openSupport(
                      "artist",
                    )
                  }
                >

                  Support the artist

                  <span>
                    ↗
                  </span>

                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ===============================================
            AKNM RECORDS VISION
           =============================================== */}

        <section className="music-page__vision">

          <div className="music-page__container">

            <div className="music-page__vision-content">

              <span>

                AKNM RECORDS

              </span>


              <h2>

                Music that
                creates legacy.

              </h2>


              <p>

                AKNM Records is being built
                around a simple belief:
                good music should not
                disappear simply because
                it is not loud enough for
                an algorithm.

              </p>


              <p>

                The vision is to build an
                independent music ecosystem
                that gives meaningful
                artists, ambitious ideas
                and lasting music room to
                exist.

              </p>


              <div className="music-page__vision-statement">

                <span>
                  NOT JUST A VIBE.
                </span>

                <strong>
                  A LEGACY.
                </strong>

              </div>


              <button
                type="button"
                className="music-page__vision-support"
                onClick={() =>
                  openSupport(
                    "artist",
                  )
                }
              >

                Support the vision

                <span>
                  ↗
                </span>

              </button>

            </div>

          </div>

        </section>


        {/* ===============================================
            SUPPORT CTA
           =============================================== */}

        <section className="music-page__support-section">

          <div className="music-page__container">

            <div className="music-page__support-content">

              <span>
                INDEPENDENT MUSIC
              </span>


              <h2>

                If the music means
                something to you,
                help us create more.

              </h2>


              <p>

                Every contribution supports
                future music, creative
                projects and the journey
                toward building AKNM
                Records.

              </p>


              <button
                type="button"
                onClick={() =>
                  openSupport(
                    "artist",
                  )
                }
              >

                Support Dom Cypherz

                <span>
                  ↗
                </span>

              </button>

            </div>

          </div>

        </section>


        {/* ===============================================
            PLATFORMS
           =============================================== */}

        {musicLinks.length >
          0 && (

          <section className="music-page__platforms">

            <div className="music-page__container">

              <div className="music-page__platform-content">

                <span>
                  Everywhere
                </span>


                <h2>
                  Listen your way.
                </h2>


                <div className="music-page__platform-list">

                  {Array.from(
                    new Map(
                      musicLinks.map(
                        (
                          link,
                        ) => [
                          link.platform,
                          link,
                        ],
                      ),
                    ).values(),
                  ).map(
                    (
                      link,
                    ) => (

                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                      >

                        <span>

                          {
                            link.platform
                          }

                        </span>


                        <span>
                          ↗
                        </span>

                      </a>

                    ),
                  )}

                </div>

              </div>

            </div>

          </section>

        )}


        {/* ===============================================
            SUPPORT MODAL
           =============================================== */}

        {showSupport &&
          supportAction && (

          <div
            className="music-page__payment-backdrop"
            onClick={
              closeSupport
            }
          >

            <div
              className="music-page__payment-modal"
              onClick={(
                event,
              ) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="music-page__payment-close"
                onClick={
                  closeSupport
                }
                aria-label="Close support"
              >

                ×

              </button>


              <span className="music-page__payment-eyebrow">

                {supportAction ===
                "artist"
                  ? "SUPPORT THE ARTIST"
                  : supportAction ===
                      "release"
                    ? "SUPPORT THIS MUSIC"
                    : "DOWNLOAD CAMPAIGN"}

              </span>


              <h3>

                {supportAction ===
                "artist"
                  ? "Become part of the story."
                  : supportAction ===
                      "release"
                    ? supportRelease?.title
                    : "Support to download"}

              </h3>


              <p>

                {supportAction ===
                "artist"
                  ? "Your support helps fund future music, creative projects and the journey toward building AKNM Records."
                  : supportAction ===
                      "release"
                    ? `Support the music and the creative work behind ${supportRelease?.title || "this release"}.`
                    : "This download is part of a special campaign. Complete the support transfer using the amount below."}

              </p>


              {/* ===========================================
                  AMOUNT
                 =========================================== */}

              {supportAction ===
                "download" &&
                supportRelease
                  ?.download_price ? (

                <div className="music-page__support-fixed-amount">

                  <span>
                    SUPPORT AMOUNT
                  </span>


                  <strong>

                    {formatCurrency(
                      supportRelease
                        .download_price,
                      supportRelease
                        .currency,
                    )}

                  </strong>

                </div>

              ) : (

                <div className="music-page__support-amounts">

                  <span>
                    CHOOSE YOUR SUPPORT
                  </span>


                  <div className="music-page__support-options">

                    {SUPPORT_AMOUNTS.map(
                      (
                        amount,
                      ) => (

                        <button
                          type="button"
                          key={amount}
                          className={
                            selectedAmount ===
                            amount
                              ? "is-active"
                              : ""
                          }
                          onClick={() => {

                            setSelectedAmount(
                              amount,
                            );

                            setCustomAmount(
                              "",
                            );

                          }}
                        >

                          {formatCurrency(
                            amount,
                            "NGN",
                          )}

                        </button>

                      ),
                    )}

                  </div>


                  <label className="music-page__support-custom">

                    <span>
                      OR ENTER YOUR OWN AMOUNT
                    </span>


                    <div>

                      <span>
                        ₦
                      </span>


                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount"
                        value={
                          customAmount
                        }
                        onChange={(
                          event,
                        ) => {

                          setCustomAmount(
                            event.target
                              .value,
                          );

                          setSelectedAmount(
                            null,
                          );

                        }}
                      />

                    </div>

                  </label>

                </div>

              )}


              {/* ===========================================
                  BANK DETAILS
                 =========================================== */}

              <div className="music-page__bank-details">

                <span>
                  TRANSFER TO
                </span>


                <div className="music-page__bank-row">

                  <div>

                    <small>
                      BANK
                    </small>


                    <strong>

                      {BANK_NAME}

                    </strong>

                  </div>

                </div>


                <div className="music-page__bank-row">

                  <div>

                    <small>
                      ACCOUNT NUMBER
                    </small>


                    <strong>

                      {
                        ACCOUNT_NUMBER
                      }

                    </strong>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        ACCOUNT_NUMBER,
                        "account",
                      )
                    }
                  >

                    <CopyIcon />


                    {
                      copiedField ===
                      "account"
                        ? "Copied"
                        : "Copy"
                    }

                  </button>

                </div>


                <div className="music-page__bank-row">

                  <div>

                    <small>
                      ACCOUNT NAME
                    </small>


                    <strong>

                      {ACCOUNT_NAME}

                    </strong>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        ACCOUNT_NAME,
                        "name",
                      )
                    }
                  >

                    <CopyIcon />


                    {
                      copiedField ===
                      "name"
                        ? "Copied"
                        : "Copy"
                    }

                  </button>

                </div>

              </div>


              {/* ===========================================
                  SUPPORT SUMMARY
                 =========================================== */}

              {supportAmount &&
                supportAmount >
                  0 && (

                <div className="music-page__support-summary">

                  <span>
                    YOUR SUPPORT
                  </span>


                  <strong>

                    {formatCurrency(
                      supportAmount,
                      "NGN",
                    )}

                  </strong>

                </div>

              )}


              <div className="music-page__support-note">

                <p>

                  Thank you for supporting
                  independent music.

                </p>


                <span>

                  Your contribution helps
                  create more music,
                  develop new creative
                  projects and build the
                  future of AKNM Records.

                </span>

              </div>


              <button
                type="button"
                className="music-page__payment-confirm"
                onClick={
                  closeSupport
                }
              >

                I understand

              </button>

            </div>

          </div>

        )}

      </main>

      <Footer />
    </>
  );
}