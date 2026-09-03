"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./music-new.css";


/* =========================================================
   TYPES
   ========================================================= */

type MusicCategory = {
  id: string;
  name: string;
  slug: string;
};


type AccessType =
  | "free"
  | "support"
  | "paid"
  | "preview_paid";


type MusicLink = {
  platform: string;
  url: string;
};


type MusicTrackDraft = {
  id: string;

  audio: MediaItem;

  title: string;

  slug: string;

  artistName: string;

  featuredArtists: string;

  trackNumber: number;

  discNumber: number;

  coverMedia: MediaItem | null;

  genre: string;

  language: string;

  description: string;

  lyrics: string;

  explicit: boolean;

  isrc: string;

  producer: string;

  composer: string;

  songwriter: string;

  releaseDate: string;
};


/* =========================================================
   HELPERS
   ========================================================= */

function generateSlug(
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


function getDefaultTrackTitle(
  media: MediaItem
) {

  if (
    media.title &&
    media.title.trim()
  ) {
    return media.title.trim();
  }

  return "Untitled Track";

}


function createTrackDraft(
  media: MediaItem,
  index: number,
  artistName: string,
  genre: string,
  language: string,
  releaseDate: string
): MusicTrackDraft {

  const title =
    getDefaultTrackTitle(
      media
    );


  return {
    id: media.id,

    audio: media,

    title,

    slug:
      generateSlug(
        title
      ),

    artistName:
      artistName.trim(),

    featuredArtists: "",

    trackNumber:
      index + 1,

    discNumber:
      1,

    coverMedia:
      null,

    genre:
      genre.trim(),

    language:
      language.trim(),

    description: "",

    lyrics: "",

    explicit:
      false,

    isrc: "",

    producer: "",

    composer: "",

    songwriter: "",

    releaseDate:
      releaseDate,
  };

}


/* =========================================================
   PAGE
   ========================================================= */

export default function NewMusicPage() {

  const router =
    useRouter();


  /* =======================================================
     RELEASE
     ======================================================= */

  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    slug,
    setSlug,
  ] =
    useState("");


  const [
    artistName,
    setArtistName,
  ] =
    useState("");


  const [
    categoryId,
    setCategoryId,
  ] =
    useState("");


  const [
    categories,
    setCategories,
  ] =
    useState<MusicCategory[]>(
      []
    );


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    genre,
    setGenre,
  ] =
    useState("");


  const [
    language,
    setLanguage,
  ] =
    useState("");


  const [
    releaseDate,
    setReleaseDate,
  ] =
    useState("");


  /* =======================================================
     METADATA
     ======================================================= */

  const [
    recordLabel,
    setRecordLabel,
  ] =
    useState("");


  const [
    copyrightOwner,
    setCopyrightOwner,
  ] =
    useState("");


  const [
    productionYear,
    setProductionYear,
  ] =
    useState("");


  const [
    upc,
    setUpc,
  ] =
    useState("");


  /* =======================================================
     COVER
     ======================================================= */

  const [
    coverMedia,
    setCoverMedia,
  ] =
    useState<MediaItem | null>(
      null
    );


  const [
    showCoverPicker,
    setShowCoverPicker,
  ] =
    useState(false);


  /* =======================================================
     TRACKS
     ======================================================= */

  const [
    tracks,
    setTracks,
  ] =
    useState<MusicTrackDraft[]>(
      []
    );


  const [
    showTrackPicker,
    setShowTrackPicker,
  ] =
    useState(false);


  /* =======================================================
     ACCESS
     ======================================================= */

  const [
    accessType,
    setAccessType,
  ] =
    useState<AccessType>(
      "free"
    );


  const [
    previewEnabled,
    setPreviewEnabled,
  ] =
    useState(true);


  const [
    previewDuration,
    setPreviewDuration,
  ] =
    useState("");


  const [
    streamingPrice,
    setStreamingPrice,
  ] =
    useState("");


  const [
    downloadEnabled,
    setDownloadEnabled,
  ] =
    useState(false);


  const [
    downloadPrice,
    setDownloadPrice,
  ] =
    useState("");


  const [
    donationsEnabled,
    setDonationsEnabled,
  ] =
    useState(false);


  const [
    minimumDonation,
    setMinimumDonation,
  ] =
    useState("");


  /* =======================================================
     LINKS
     ======================================================= */

  const [
    links,
    setLinks,
  ] =
    useState<MusicLink[]>(
      [
        {
          platform: "",
          url: "",
        },
      ]
    );


  /* =======================================================
     UI
     ======================================================= */

  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    loadingCategories,
    setLoadingCategories,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  /* =======================================================
     LOAD CATEGORIES
     ======================================================= */

  useEffect(() => {

    async function loadCategories() {

      const supabase =
        createClient();


      const {
        data,
        error,
      } =
        await supabase
          .from(
            "music_categories"
          )
          .select(`
            id,
            name,
            slug
          `)
          .order(
            "name",
            {
              ascending:
                true,
            }
          );


      if (error) {

        console.error(
          "Music categories error:",
          error
        );

      } else {

        setCategories(
          data || []
        );

      }


      setLoadingCategories(
        false
      );

    }


    void loadCategories();

  }, []);


  /* =======================================================
     TITLE
     ======================================================= */

  function handleTitleChange(
    value: string
  ) {

    setTitle(value);

    setSlug(
      generateSlug(value)
    );

  }


  /* =======================================================
     LINKS
     ======================================================= */

  function updateLink(
    index: number,
    field: keyof MusicLink,
    value: string
  ) {

    setLinks(
      (current) =>
        current.map(
          (
            link,
            linkIndex
          ) =>
            linkIndex ===
            index
              ? {
                  ...link,
                  [field]:
                    value,
                }
              : link
        )
    );

  }


  function addLink() {

    setLinks(
      (current) => [
        ...current,
        {
          platform: "",
          url: "",
        },
      ]
    );

  }


  function removeLink(
    index: number
  ) {

    setLinks(
      (current) =>
        current.filter(
          (
            _,
            linkIndex
          ) =>
            linkIndex !==
            index
        )
    );

  }


  /* =======================================================
     COVER
     ======================================================= */

  function handleCoverChange(
    media: MediaItem[]
  ) {

    setCoverMedia(
      media[0] ??
      null
    );

    setShowCoverPicker(
      false
    );

  }


  /* =======================================================
     TRACKS
     ======================================================= */

  function handleTrackChange(
    selectedMedia: MediaItem[]
  ) {

    const audioMedia =
      selectedMedia.filter(
        (media) =>
          media.media_type ===
          "audio"
      );


    setTracks(
      (currentTracks) => {

        const existingMap =
          new Map(
            currentTracks.map(
              (track) => [
                track.audio.id,
                track,
              ]
            )
          );


        return audioMedia.map(
          (
            media,
            index
          ) => {

            const existing =
              existingMap.get(
                media.id
              );


            if (existing) {

              return {
                ...existing,

                trackNumber:
                  index + 1,
              };

            }


            return createTrackDraft(
              media,
              index,
              artistName,
              genre,
              language,
              releaseDate
            );

          }
        );

      }
    );

  }


  function updateTrack(
    trackId: string,
    field:
      keyof Omit<
        MusicTrackDraft,
        "id" | "audio"
      >,
    value:
      | string
      | number
      | boolean
      | MediaItem
      | null
  ) {

    setTracks(
      (current) =>
        current.map(
          (track) => {

            if (
              track.id !==
              trackId
            ) {
              return track;
            }


            const next = {
              ...track,
              [field]:
                value,
            };


            /*
             * Automatically regenerate
             * the track slug when title
             * changes.
             */

            if (
              field ===
              "title"
            ) {

              next.slug =
                generateSlug(
                  String(value)
                );

            }


            return next;

          }
        )
    );

  }


  function removeTrack(
    trackId: string
  ) {

    setTracks(
      (current) =>
        current
          .filter(
            (track) =>
              track.id !==
              trackId
          )
          .map(
            (
              track,
              index
            ) => ({
              ...track,

              trackNumber:
                index + 1,
            })
          )
    );

  }


  function moveTrack(
    trackId: string,
    direction:
      | "up"
      | "down"
  ) {

    setTracks(
      (current) => {

        const index =
          current.findIndex(
            (track) =>
              track.id ===
              trackId
          );


        if (
          index === -1
        ) {
          return current;
        }


        const nextIndex =
          direction === "up"
            ? index - 1
            : index + 1;


        if (
          nextIndex < 0 ||
          nextIndex >=
            current.length
        ) {
          return current;
        }


        const next =
          [...current];


        [
          next[index],
          next[nextIndex],
        ] =
          [
            next[nextIndex],
            next[index],
          ];


        return next.map(
          (
            track,
            trackIndex
          ) => ({
            ...track,

            trackNumber:
              trackIndex + 1,
          })
        );

      }
    );

  }


  /* =======================================================
     TRACK VALIDATION
     ======================================================= */

  const duplicateTrackSlugs =
    useMemo(() => {

      const counts =
        new Map<
          string,
          number
        >();


      tracks.forEach(
        (track) => {

          const trackSlug =
            track.slug.trim();


          if (
            !trackSlug
          ) {
            return;
          }


          counts.set(
            trackSlug,
            (
              counts.get(
                trackSlug
              ) ?? 0
            ) + 1
          );

        }
      );


      return new Set(
        Array.from(
          counts.entries()
        )
          .filter(
            ([, count]) =>
              count > 1
          )
          .map(
            ([trackSlug]) =>
              trackSlug
          )
      );

    }, [
      tracks,
    ]);


  /* =======================================================
     SAVE
     ======================================================= */

  async function handleSubmit(
    event:
      | FormEvent<
          HTMLFormElement
        >
      | React.MouseEvent<
          HTMLButtonElement
        >,
    publish = false
  ) {

    event.preventDefault();

    setError("");
    setSuccess("");


    /* ===============================================
       VALIDATION
       =============================================== */

    if (
      !title.trim()
    ) {

      setError(
        "Please enter a release title."
      );

      return;

    }


    if (
      !artistName.trim()
    ) {

      setError(
        "Please enter the artist name."
      );

      return;

    }


    if (
      !categoryId
    ) {

      setError(
        "Please select a music category."
      );

      return;

    }


    if (
      !slug.trim()
    ) {

      setError(
        "Please enter a valid release slug."
      );

      return;

    }


    if (
      tracks.length === 0
    ) {

      setError(
        "Please add at least one audio track."
      );

      return;

    }


    for (
      const track of tracks
    ) {

      if (
        !track.title.trim()
      ) {

        setError(
          "Every track must have a title."
        );

        return;

      }


      if (
        !track.slug.trim()
      ) {

        setError(
          `Please enter a valid slug for "${track.title}".`
        );

        return;

      }


      if (
        !track.artistName.trim()
      ) {

        setError(
          `Please enter an artist name for "${track.title}".`
        );

        return;

      }

    }


    if (
      duplicateTrackSlugs.size >
      0
    ) {

      setError(
        "Each track must have a unique slug."
      );

      return;

    }


    if (
      accessType ===
        "paid" &&
      !streamingPrice
    ) {

      setError(
        "Please enter a streaming price."
      );

      return;

    }


    if (
      accessType ===
        "preview_paid" &&
      !streamingPrice
    ) {

      setError(
        "Please enter a price to unlock the release."
      );

      return;

    }


    if (
      downloadEnabled &&
      !downloadPrice
    ) {

      setError(
        "Please enter a download price."
      );

      return;

    }


    if (
      saving
    ) {
      return;
    }


    setSaving(
      true
    );


    const supabase =
      createClient();


    try {

      /* ===============================================
         AUTH
         =============================================== */

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
          "You must be signed in."
        );

      }


      /* ===============================================
         CHECK RELEASE SLUG
         =============================================== */

      const {
        data:
          existingRelease,
        error:
          releaseSlugError,
      } =
        await supabase
          .from(
            "music_releases"
          )
          .select(
            "id"
          )
          .eq(
            "slug",
            slug.trim()
          )
          .maybeSingle();


      if (
        releaseSlugError
      ) {

        throw new Error(
          releaseSlugError.message
        );

      }


      if (
        existingRelease
      ) {

        throw new Error(
          "A music release with this slug already exists."
        );

      }


      /* ===============================================
         CHECK TRACK SLUGS
         =============================================== */

      const trackSlugs =
        tracks.map(
          (track) =>
            track.slug.trim()
        );


      const {
        data:
          existingTracks,
        error:
          trackSlugError,
      } =
        await supabase
          .from(
            "music_tracks"
          )
          .select(
            "slug"
          )
          .in(
            "slug",
            trackSlugs
          );


      if (
        trackSlugError
      ) {

        throw new Error(
          trackSlugError.message
        );

      }


      if (
        existingTracks &&
        existingTracks.length >
          0
      ) {

        throw new Error(
          `A track with the slug "${existingTracks[0].slug}" already exists.`
        );

      }


      const now =
        new Date()
          .toISOString();


      /* ===============================================
         CREATE RELEASE
         =============================================== */

      const {
        data:
          release,
        error:
          releaseError,
      } =
        await supabase
          .from(
            "music_releases"
          )
          .insert({

            owner_id:
              user.id,

            category_id:
              categoryId,

            title:
              title.trim(),

            slug:
              slug.trim(),

            artist_name:
              artistName.trim(),

            description:
              description.trim() ||
              null,

            genre:
              genre.trim() ||
              null,

            language:
              language.trim() ||
              null,

            release_date:
              releaseDate ||
              null,

            cover_media_id:
              coverMedia?.id ??
              null,


            record_label:
              recordLabel.trim() ||
              null,

            copyright_owner:
              copyrightOwner.trim() ||
              null,

            production_year:
              productionYear
                ? Number(
                    productionYear
                  )
                : null,

            upc:
              upc.trim() ||
              null,


            status:
              publish
                ? "published"
                : "draft",

            published_at:
              publish
                ? now
                : null,


            access_type:
              accessType,

            preview_enabled:
              previewEnabled,

            preview_duration:
              previewDuration
                ? Number(
                    previewDuration
                  )
                : null,


            streaming_price:
              streamingPrice
                ? Number(
                    streamingPrice
                  )
                : null,

            currency:
              "NGN",


            download_enabled:
              downloadEnabled,

            download_price:
              downloadPrice
                ? Number(
                    downloadPrice
                  )
                : null,


            donations_enabled:
              donationsEnabled,

            minimum_donation:
              minimumDonation
                ? Number(
                    minimumDonation
                  )
                : null,

          })
          .select(
            "id"
          )
          .single();


      if (
        releaseError ||
        !release
      ) {

        throw new Error(
          releaseError?.message ||
          "Could not create music release."
        );

      }


      /* ===============================================
         CREATE TRACKS
         =============================================== */

      const trackPayload =
        tracks.map(
          (
            track,
            index
          ) => ({

            owner_id:
              user.id,

            release_id:
              release.id,

            title:
              track.title.trim(),

            slug:
              track.slug.trim(),

            artist_name:
              track.artistName.trim(),

            featured_artists:
              track.featuredArtists
                .split(",")
                .map(
                  (artist) =>
                    artist.trim()
                )
                .filter(
                  Boolean
                ),

            track_number:
              index + 1,

            disc_number:
              track.discNumber ||
              1,

            audio_media_id:
              track.audio.id,

            cover_media_id:
              track.coverMedia?.id ??
              coverMedia?.id ??
              null,

            genre:
              track.genre.trim() ||
              genre.trim() ||
              null,

            language:
              track.language.trim() ||
              language.trim() ||
              null,

            description:
              track.description.trim() ||
              null,

            lyrics:
              track.lyrics.trim() ||
              null,

            explicit:
              track.explicit,

            isrc:
              track.isrc.trim() ||
              null,

            producer:
              track.producer.trim() ||
              null,

            composer:
              track.composer.trim() ||
              null,

            songwriter:
              track.songwriter.trim() ||
              null,

            release_date:
              track.releaseDate ||
              releaseDate ||
              null,

            published_at:
              publish
                ? now
                : null,

          })
        );


      const {
        error:
          tracksError,
      } =
        await supabase
          .from(
            "music_tracks"
          )
          .insert(
            trackPayload
          );


      if (
        tracksError
      ) {

        /*
         * Remove the release if
         * track creation fails.
         */

        await supabase
          .from(
            "music_releases"
          )
          .delete()
          .eq(
            "id",
            release.id
          );


        throw new Error(
          tracksError.message
        );

      }


      /* ===============================================
         CREATE MUSIC LINKS
         =============================================== */

      const validLinks =
        links.filter(
          (link) =>
            link.platform.trim() &&
            link.url.trim()
        );


      if (
        validLinks.length >
        0
      ) {

        const {
          error:
            linksError,
        } =
          await supabase
            .from(
              "music_links"
            )
            .insert(

              validLinks.map(
                (link) => ({
                  release_id:
                    release.id,

                  platform:
                    link.platform.trim(),

                  url:
                    link.url.trim(),
                })
              )

            );


        if (
          linksError
        ) {

          throw new Error(
            linksError.message
          );

        }

      }


      setSuccess(

        publish
          ? "Music release published successfully."
          : "Music release saved as draft."

      );


      setTimeout(
        () => {

          router.push(
            `/studio/music/${release.id}`
          );

          router.refresh();

        },
        500
      );


    } catch (
      err
    ) {

      console.error(
        "Music release save error:",
        err
      );


      setError(

        err instanceof Error
          ? err.message
          : "Something went wrong."

      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (
    loadingCategories
  ) {

    return (

      <main className="music-new-page">

        <div className="new-music-loading">

          Loading music editor...

        </div>

      </main>

    );

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <main className="music-new-page">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="music-new-header">

        <Link
          href="/studio/music"
          className="music-new-header__back"
        >
          ← Back to Music
        </Link>


        <span className="music-new-header__eyebrow">

          AKNM STUDIO / MUSIC

        </span>


        <h1>

          New music.

        </h1>


        <p>

          Create your release, add every
          track, define the metadata and
          control how listeners access it.

        </p>

      </header>


      <form
        className="music-editor"
        onSubmit={(
          event
        ) =>
          handleSubmit(
            event,
            false
          )
        }
      >


        {/* =================================================
            MAIN
            ================================================= */}

        <div className="music-editor__main">


          {/* =============================================
              RELEASE TITLE
              ============================================= */}

          <section className="music-editor-section">

            <label>
              RELEASE TITLE
            </label>


            <input
              type="text"
              value={title}
              onChange={(
                event
              ) =>
                handleTitleChange(
                  event.target.value
                )
              }
              placeholder="Give this release a name..."
              disabled={saving}
            />

          </section>


          {/* =============================================
              DESCRIPTION
              ============================================= */}

          <section className="music-editor-section">

            <label>
              DESCRIPTION
            </label>


            <textarea
              className="music-description"
              value={description}
              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Tell listeners about this release..."
              disabled={saving}
            />

          </section>


          {/* =============================================
              RELEASE INFORMATION
              ============================================= */}

          <section className="music-editor-section music-editor-section--form">

            <label>
              RELEASE INFORMATION
            </label>


            <div className="music-fields-grid">


              <input
                className="music-editor-input"
                type="text"
                value={artistName}
                onChange={(
                  event
                ) =>
                  setArtistName(
                    event.target.value
                  )
                }
                placeholder="Artist name"
                disabled={saving}
              />


              <select
                className="music-editor-input music-editor-select"
                value={categoryId}
                onChange={(
                  event
                ) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                disabled={saving}
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


              <input
                className="music-editor-input"
                type="text"
                value={genre}
                onChange={(
                  event
                ) =>
                  setGenre(
                    event.target.value
                  )
                }
                placeholder="Genre"
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="text"
                value={language}
                onChange={(
                  event
                ) =>
                  setLanguage(
                    event.target.value
                  )
                }
                placeholder="Language"
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="date"
                value={releaseDate}
                onChange={(
                  event
                ) =>
                  setReleaseDate(
                    event.target.value
                  )
                }
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="text"
                value={slug}
                onChange={(
                  event
                ) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                placeholder="release-slug"
                disabled={saving}
              />

            </div>

          </section>


          {/* =============================================
              TRACKS
              ============================================= */}

          <section className="music-editor-section">

            <div className="music-tracks-header">

              <div>

                <label>
                  TRACKS
                </label>


                <p>

                  Add the audio files that
                  belong to this release.

                </p>

              </div>


              <button
                type="button"
                className="music-add-track"
                onClick={() =>
                  setShowTrackPicker(
                    true
                  )
                }
                disabled={saving}
              >

                + Add tracks

              </button>

            </div>


            {tracks.length ===
              0 && (

              <div className="music-tracks-empty">

                <strong>
                  No tracks added.
                </strong>


                <p>

                  Select audio from your
                  media library or upload
                  new music from your
                  computer.

                </p>

              </div>

            )}


            {tracks.length >
              0 && (

              <div className="music-tracks-list">

                {tracks.map(
                  (
                    track,
                    index
                  ) => (

                    <article
                      key={
                        track.id
                      }
                      className="music-track-editor"
                    >

                      <div className="music-track-editor__top">

                        <div className="music-track-editor__number">

                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}

                        </div>


                        <div className="music-track-editor__audio">

                          <strong>

                            {
                              track.audio.title ||
                              "Audio track"
                            }

                          </strong>


                          {track.audio.duration_seconds !==
                            null && (

                            <small>

                              {Math.floor(
                                track.audio
                                  .duration_seconds /
                                  60
                              )}

                              :

                              {Math.floor(
                                track.audio
                                  .duration_seconds %
                                  60
                              )
                                .toString()
                                .padStart(
                                  2,
                                  "0"
                                )}

                            </small>

                          )}

                        </div>


                        <div className="music-track-editor__actions">

                          <button
                            type="button"
                            onClick={() =>
                              moveTrack(
                                track.id,
                                "up"
                              )
                            }
                            disabled={
                              saving ||
                              index ===
                                0
                            }
                          >
                            ↑
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              moveTrack(
                                track.id,
                                "down"
                              )
                            }
                            disabled={
                              saving ||
                              index ===
                                tracks.length -
                                  1
                            }
                          >
                            ↓
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              removeTrack(
                                track.id
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            Remove
                          </button>

                        </div>

                      </div>


                      <div className="music-fields-grid">

                        <input
                          className="music-editor-input"
                          value={
                            track.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "title",
                              event.target.value
                            )
                          }
                          placeholder="Track title"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.artistName
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "artistName",
                              event.target.value
                            )
                          }
                          placeholder="Artist name"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.featuredArtists
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "featuredArtists",
                              event.target.value
                            )
                          }
                          placeholder="Featured artists, separated by commas"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.slug
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "slug",
                              generateSlug(
                                event.target.value
                              )
                            )
                          }
                          placeholder="Track slug"
                          disabled={
                            saving
                          }
                        />

                      </div>


                      <div className="music-fields-grid">

                        <input
                          className="music-editor-input"
                          value={
                            track.genre
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "genre",
                              event.target.value
                            )
                          }
                          placeholder="Genre"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.language
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "language",
                              event.target.value
                            )
                          }
                          placeholder="Language"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.isrc
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "isrc",
                              event.target.value
                            )
                          }
                          placeholder="ISRC"
                          disabled={
                            saving
                          }
                        />


                        <label className="music-toggle">

                          <input
                            type="checkbox"
                            checked={
                              track.explicit
                            }
                            onChange={(
                              event
                            ) =>
                              updateTrack(
                                track.id,
                                "explicit",
                                event.target.checked
                              )
                            }
                            disabled={
                              saving
                            }
                          />

                          Explicit content

                        </label>

                      </div>


                      <textarea
                        className="music-description"
                        value={
                          track.description
                        }
                        onChange={(
                          event
                        ) =>
                          updateTrack(
                            track.id,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Track description..."
                        disabled={
                          saving
                        }
                      />


                      <textarea
                        className="music-description"
                        value={
                          track.lyrics
                        }
                        onChange={(
                          event
                        ) =>
                          updateTrack(
                            track.id,
                            "lyrics",
                            event.target.value
                          )
                        }
                        placeholder="Lyrics..."
                        disabled={
                          saving
                        }
                      />


                      <div className="music-fields-grid">

                        <input
                          className="music-editor-input"
                          value={
                            track.producer
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "producer",
                              event.target.value
                            )
                          }
                          placeholder="Producer"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.composer
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "composer",
                              event.target.value
                            )
                          }
                          placeholder="Composer"
                          disabled={
                            saving
                          }
                        />


                        <input
                          className="music-editor-input"
                          value={
                            track.songwriter
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              "songwriter",
                              event.target.value
                            )
                          }
                          placeholder="Songwriter"
                          disabled={
                            saving
                          }
                        />

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>


          {/* =============================================
              RELEASE METADATA
              ============================================= */}

          <section className="music-editor-section music-editor-section--form">

            <label>
              RELEASE METADATA
            </label>


            <div className="music-fields-grid">

              <input
                className="music-editor-input"
                type="text"
                value={recordLabel}
                onChange={(
                  event
                ) =>
                  setRecordLabel(
                    event.target.value
                  )
                }
                placeholder="Record label"
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="text"
                value={copyrightOwner}
                onChange={(
                  event
                ) =>
                  setCopyrightOwner(
                    event.target.value
                  )
                }
                placeholder="Copyright owner"
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="number"
                value={productionYear}
                onChange={(
                  event
                ) =>
                  setProductionYear(
                    event.target.value
                  )
                }
                placeholder="Production year"
                disabled={saving}
              />


              <input
                className="music-editor-input"
                type="text"
                value={upc}
                onChange={(
                  event
                ) =>
                  setUpc(
                    event.target.value
                  )
                }
                placeholder="UPC"
                disabled={saving}
              />

            </div>

          </section>


          {/* =============================================
              EXTERNAL LINKS
              ============================================= */}

          <section className="music-editor-section music-editor-section--form">

            <label>
              EXTERNAL MUSIC LINKS
            </label>


            <div className="music-links">

              {links.map(
                (
                  link,
                  index
                ) => (

                  <div
                    key={index}
                    className="music-link-row"
                  >

                    <input
                      className="music-editor-input"
                      value={
                        link.platform
                      }
                      onChange={(
                        event
                      ) =>
                        updateLink(
                          index,
                          "platform",
                          event.target.value
                        )
                      }
                      placeholder="Platform"
                      disabled={
                        saving
                      }
                    />


                    <input
                      className="music-editor-input"
                      type="url"
                      value={
                        link.url
                      }
                      onChange={(
                        event
                      ) =>
                        updateLink(
                          index,
                          "url",
                          event.target.value
                        )
                      }
                      placeholder="https://..."
                      disabled={
                        saving
                      }
                    />


                    <button
                      type="button"
                      onClick={() =>
                        removeLink(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>


            <button
              type="button"
              className="music-add-link"
              onClick={
                addLink
              }
              disabled={
                saving
              }
            >

              + Add streaming platform

            </button>

          </section>


          {/* =============================================
              MESSAGES
              ============================================= */}

          {error && (

            <div className="music-editor-message music-editor-message--error">

              {error}

            </div>

          )}


          {success && (

            <div className="music-editor-message music-editor-message--success">

              {success}

            </div>

          )}

        </div>


        {/* =================================================
            SIDEBAR
            ================================================= */}

        <aside className="music-editor__sidebar">


          {/* =============================================
              ARTWORK
              ============================================= */}

          <section className="music-editor-panel">

            <div className="music-editor-panel__heading">

              <span>
                ARTWORK
              </span>

              <strong>
                Cover artwork
              </strong>

            </div>


            {coverMedia ? (

              <div className="music-cover-selected">

                {coverMedia.public_url && (

                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      "Cover artwork"
                    }
                  />

                )}


                <div>

                  <strong>

                    {
                      coverMedia.title ||
                      "Selected artwork"
                    }

                  </strong>


                  <button
                    type="button"
                    onClick={() =>
                      setCoverMedia(
                        null
                      )
                    }
                    disabled={
                      saving
                    }
                  >

                    Remove

                  </button>

                </div>

              </div>

            ) : (

              <button
                type="button"
                className="music-media-upload"
                onClick={() =>
                  setShowCoverPicker(
                    true
                  )
                }
                disabled={
                  saving
                }
              >

                <span>
                  +
                </span>

                <strong>
                  Choose artwork
                </strong>

                <small>
                  Select artwork from your
                  AKNM media library.
                </small>

              </button>

            )}

          </section>


          {/* =============================================
              ACCESS
              ============================================= */}

          <section className="music-editor-panel">

            <div className="music-editor-panel__heading">

              <span>
                ACCESS
              </span>

              <strong>
                Listening access
              </strong>

            </div>


            <div className="music-access-grid">

              {(
                [
                  "free",
                  "support",
                  "paid",
                  "preview_paid",
                ] as AccessType[]
              ).map(
                (type) => (

                  <button
                    key={type}
                    type="button"
                    className={`music-access-button ${
                      accessType ===
                      type
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() =>
                      setAccessType(
                        type
                      )
                    }
                    disabled={
                      saving
                    }
                  >

                    {type.replace(
                      "_",
                      " "
                    )}

                  </button>

                )
              )}

            </div>


            {(accessType ===
              "paid" ||
              accessType ===
                "preview_paid") && (

              <input
                className="music-editor-input music-panel-input"
                type="number"
                min="0"
                step="0.01"
                value={
                  streamingPrice
                }
                onChange={(
                  event
                ) =>
                  setStreamingPrice(
                    event.target.value
                  )
                }
                placeholder="Streaming price ₦"
                disabled={
                  saving
                }
              />

            )}


            {accessType ===
              "preview_paid" && (

              <>

                <label className="music-toggle">

                  <input
                    type="checkbox"
                    checked={
                      previewEnabled
                    }
                    onChange={(
                      event
                    ) =>
                      setPreviewEnabled(
                        event.target.checked
                      )
                    }
                    disabled={
                      saving
                    }
                  />

                  Enable preview

                </label>


                {previewEnabled && (

                  <input
                    className="music-editor-input music-panel-input"
                    type="number"
                    min="1"
                    value={
                      previewDuration
                    }
                    onChange={(
                      event
                    ) =>
                      setPreviewDuration(
                        event.target.value
                      )
                    }
                    placeholder="Preview duration in seconds"
                    disabled={
                      saving
                    }
                  />

                )}

              </>

            )}

          </section>


          {/* =============================================
              DOWNLOAD
              ============================================= */}

          <section className="music-editor-panel">

            <label className="music-toggle">

              <input
                type="checkbox"
                checked={
                  downloadEnabled
                }
                onChange={(
                  event
                ) =>
                  setDownloadEnabled(
                    event.target.checked
                  )
                }
                disabled={
                  saving
                }
              />

              Enable paid downloads

            </label>


            {downloadEnabled && (

              <input
                className="music-editor-input music-panel-input"
                type="number"
                min="0"
                step="0.01"
                value={
                  downloadPrice
                }
                onChange={(
                  event
                ) =>
                  setDownloadPrice(
                    event.target.value
                  )
                }
                placeholder="Download price ₦"
                disabled={
                  saving
                }
              />

            )}

          </section>


          {/* =============================================
              DONATIONS
              ============================================= */}

          <section className="music-editor-panel">

            <label className="music-toggle">

              <input
                type="checkbox"
                checked={
                  donationsEnabled
                }
                onChange={(
                  event
                ) =>
                  setDonationsEnabled(
                    event.target.checked
                  )
                }
                disabled={
                  saving
                }
              />

              Allow listener support

            </label>


            {donationsEnabled && (

              <input
                className="music-editor-input music-panel-input"
                type="number"
                min="0"
                step="0.01"
                value={
                  minimumDonation
                }
                onChange={(
                  event
                ) =>
                  setMinimumDonation(
                    event.target.value
                  )
                }
                placeholder="Minimum donation ₦"
                disabled={
                  saving
                }
              />

            )}

          </section>


          {/* =============================================
              ACTIONS
              ============================================= */}

          <div className="music-editor-actions">

            <button
              type="submit"
              className="music-editor-action music-editor-action--draft"
              disabled={
                saving
              }
            >

              {saving
                ? "Saving..."
                : "Save Draft"}

            </button>


            <button
              type="button"
              className="music-editor-action music-editor-action--publish"
              disabled={
                saving
              }
              onClick={(
                event
              ) =>
                handleSubmit(
                  event,
                  true
                )
              }
            >

              <span>

                {saving
                  ? "Publishing..."
                  : "Publish"}

              </span>


              {!saving && (

                <span>
                  ↗
                </span>

              )}

            </button>

          </div>

        </aside>

      </form>


      {/* =================================================
          COVER PICKER
          ================================================= */}

      {showCoverPicker && (

        <div className="new-music-modal">

          <button
            type="button"
            className="new-music-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
            aria-label="Close media picker"
          />


          <div className="new-music-modal__panel">

            <MediaPicker
              mode="cover"
              mediaType="image"
              selectedIds={
                coverMedia
                  ? [
                      coverMedia.id,
                    ]
                  : []
              }
              onChange={
                handleCoverChange
              }
              onClose={() =>
                setShowCoverPicker(
                  false
                )
              }
            />

          </div>

        </div>

      )}


      {/* =================================================
          TRACK PICKER
          ================================================= */}

      {showTrackPicker && (

        <div className="new-music-modal">

          <button
            type="button"
            className="new-music-modal__backdrop"
            onClick={() =>
              setShowTrackPicker(
                false
              )
            }
            aria-label="Close track picker"
          />


          <div className="new-music-modal__panel">

            <MediaPicker
              mode="multiple"
              mediaType="audio"
              selectedIds={
                tracks.map(
                  (track) =>
                    track.audio.id
                )
              }
              onChange={
                handleTrackChange
              }
              onClose={() =>
                setShowTrackPicker(
                  false
                )
              }
            />

          </div>

        </div>

      )}

    </main>

  );

}