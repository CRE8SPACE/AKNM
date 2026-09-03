"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./new-track.css";


/* =========================================================
   TYPES
   ========================================================= */

type MusicRelease = {
  id: string;
  title: string;
  artist_name: string;
  cover_media_id: string | null;
};


export default function NewMusicTrackPage() {

  const router =
    useRouter();

  const params =
    useParams();


  /* =========================================================
     PARAMS
     ========================================================= */

  const releaseId =
    typeof params.id === "string"
      ? params.id
      : "";


  /* =========================================================
     RELEASE
     ========================================================= */

  const [release, setRelease] =
    useState<MusicRelease | null>(
      null
    );


  /* =========================================================
     FORM STATE
     ========================================================= */

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [artistName, setArtistName] =
    useState("");

  const [
    featuredArtists,
    setFeaturedArtists,
  ] =
    useState("");

  const [
    trackNumber,
    setTrackNumber,
  ] =
    useState("1");

  const [
    discNumber,
    setDiscNumber,
  ] =
    useState("1");

  const [genre, setGenre] =
    useState("");

  const [language, setLanguage] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [lyrics, setLyrics] =
    useState("");

  const [explicit, setExplicit] =
    useState(false);

  const [isrc, setIsrc] =
    useState("");

  const [producer, setProducer] =
    useState("");

  const [composer, setComposer] =
    useState("");

  const [songwriter, setSongwriter] =
    useState("");

  const [
    releaseDate,
    setReleaseDate,
  ] =
    useState("");


  /* =========================================================
     MEDIA
     ========================================================= */

  const [
    audioMedia,
    setAudioMedia,
  ] =
    useState<MediaItem | null>(
      null
    );

  const [
    coverMedia,
    setCoverMedia,
  ] =
    useState<MediaItem | null>(
      null
    );

  const [
    showAudioPicker,
    setShowAudioPicker,
  ] =
    useState(false);

  const [
    showCoverPicker,
    setShowCoverPicker,
  ] =
    useState(false);


  /* =========================================================
     UI STATE
     ========================================================= */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     SLUG
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


  /* =========================================================
     FEATURED ARTISTS
     ========================================================= */

  const featuredArtistsArray =
    useMemo(() => {

      return featuredArtists
        .split(",")
        .map(
          (artist) =>
            artist.trim()
        )
        .filter(
          Boolean
        );

    }, [
      featuredArtists,
    ]);


  /* =========================================================
     LOAD RELEASE
     ========================================================= */

  useEffect(() => {

    if (!releaseId) {
      return;
    }

    let cancelled =
      false;


    async function loadRelease() {

      setLoading(true);

      setError("");

      const supabase =
        createClient();


      const {
        data,
        error: releaseError,
      } =
        await supabase
          .from("music_releases")
          .select(`
            id,
            title,
            artist_name,
            cover_media_id
          `)
          .eq(
            "id",
            releaseId
          )
          .maybeSingle();


      if (cancelled) {
        return;
      }


      if (
        releaseError ||
        !data
      ) {

        console.error(
          "New track release load error:",
          releaseError
        );

        setError(
          releaseError?.message ||
          "Could not load this music release."
        );

        setLoading(false);

        return;

      }


      const musicRelease =
        data as MusicRelease;


      setRelease(
        musicRelease
      );


      /* -----------------------------------------------
         DEFAULT ARTIST
         ----------------------------------------------- */

      setArtistName(
        musicRelease.artist_name ||
        ""
      );


      /* -----------------------------------------------
         NEXT TRACK NUMBER
         ----------------------------------------------- */

      const {
        data: tracks,
        error: tracksError,
      } =
        await supabase
          .from("music_tracks")
          .select(`
            track_number,
            disc_number
          `)
          .eq(
            "release_id",
            releaseId
          )
          .order(
            "disc_number",
            {
              ascending:
                false,
            }
          )
          .order(
            "track_number",
            {
              ascending:
                false,
            }
          )
          .limit(1);


      if (!tracksError) {

        const latestTrack =
          tracks?.[0];


        if (latestTrack) {

          setDiscNumber(
            String(
              latestTrack.disc_number
            )
          );

          setTrackNumber(
            String(
              latestTrack.track_number +
              1
            )
          );

        }

      }


      setLoading(false);

    }


    void loadRelease();


    return () => {
      cancelled = true;
    };

  }, [
    releaseId,
  ]);


  /* =========================================================
     CREATE TRACK
     ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    /* -----------------------------------------------
       VALIDATION
       ----------------------------------------------- */

    if (!title.trim()) {

      setError(
        "Please enter a track title."
      );

      return;

    }


    if (!slug.trim()) {

      setError(
        "Please enter a valid slug."
      );

      return;

    }


    if (!artistName.trim()) {

      setError(
        "Please enter the artist name."
      );

      return;

    }


    if (!audioMedia) {

      setError(
        "Please select an audio file for this track."
      );

      return;

    }


    if (
      !releaseId ||
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


      /* -----------------------------------------------
         AUTH
         ----------------------------------------------- */

      const {
        data: {
          user,
        },
        error: userError,
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


      /* -----------------------------------------------
         CHECK SLUG
         ----------------------------------------------- */

      const {
        data: existingTrack,
        error: slugError,
      } =
        await supabase
          .from("music_tracks")
          .select("id")
          .eq(
            "slug",
            slug.trim()
          )
          .maybeSingle();


      if (slugError) {

        throw new Error(
          slugError.message
        );

      }


      if (existingTrack) {

        throw new Error(
          "Another music track already uses this slug."
        );

      }


      /* -----------------------------------------------
         CREATE
         ----------------------------------------------- */

      const {
        error: insertError,
      } =
        await supabase
          .from("music_tracks")
          .insert({

            owner_id:
              user.id,

            release_id:
              releaseId,

            title:
              title.trim(),

            slug:
              slug.trim(),

            artist_name:
              artistName.trim(),

            featured_artists:
              featuredArtistsArray.length >
              0
                ? featuredArtistsArray
                : null,

            track_number:
              Number(
                trackNumber
              ) || 1,

            disc_number:
              Number(
                discNumber
              ) || 1,

            audio_media_id:
              audioMedia.id,

            cover_media_id:
              coverMedia?.id ??
              null,

            genre:
              genre.trim() ||
              null,

            language:
              language.trim() ||
              null,

            description:
              description.trim() ||
              null,

            lyrics:
              lyrics.trim() ||
              null,

            explicit,

            isrc:
              isrc.trim() ||
              null,

            producer:
              producer.trim() ||
              null,

            composer:
              composer.trim() ||
              null,

            songwriter:
              songwriter.trim() ||
              null,

            release_date:
              releaseDate ||
              null,

          });


      if (insertError) {

        throw new Error(
          insertError.message
        );

      }


      router.push(
        `/studio/music/${releaseId}/edit`
      );

      router.refresh();


    } catch (err) {

      console.error(
        "Create music track error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the track."
      );


    } finally {

      setSaving(
        false
      );

    }

  }


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {

    return (

      <main className="new-track-page">

        <div className="new-track-loading">

          <span />

          Loading release...

        </div>

      </main>

    );

  }


  /* =========================================================
     ERROR
     ========================================================= */

  if (!release) {

    return (

      <main className="new-track-page">

        <div className="new-track-error">

          <span>
            AKNM STUDIO / MUSIC
          </span>

          <h1>
            Release not found.
          </h1>

          <p>
            The music release you are trying
            to add a track to could not be found.
          </p>

          <Link
            href="/studio/music"
          >
            ← Back to Music
          </Link>

        </div>

      </main>

    );

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <main className="new-track-page">


      {/* ===================================================
          HEADER
          =================================================== */}

      <header className="new-track-header">

        <div>

          <Link
            href={`/studio/music/${releaseId}/edit`}
            className="new-track-back"
          >
            ← Back to Edit Release
          </Link>


          <span className="new-track-eyebrow">

            AKNM STUDIO / MUSIC / NEW TRACK

          </span>


          <h1>
            Add a track.
          </h1>


          <p>

            Add a new track to
            <strong>
              {" "}
              {release.title}
            </strong>.

          </p>

        </div>

      </header>


      {/* ===================================================
          FORM
          =================================================== */}

      <form
        className="new-track-form"
        onSubmit={handleSubmit}
      >


        {/* ===============================================
            AUDIO
            =============================================== */}

        <section className="new-track-section">

          <div className="new-track-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Audio file
              </h2>

              <p>
                Select the audio file for this track.
              </p>

            </div>

          </div>


          {audioMedia ? (

            <div className="new-track-media-selected">

              <div className="new-track-audio-icon">
                AUDIO
              </div>


              <div className="new-track-media-info">

                <strong>
                  {audioMedia.title ||
                    "Untitled audio"}
                </strong>

                <small>
                  Selected audio file
                </small>

              </div>


              <button
                type="button"
                onClick={() =>
                  setAudioMedia(
                    null
                  )
                }
                disabled={saving}
              >
                Remove
              </button>

            </div>

          ) : (

            <button
              type="button"
              className="new-track-media-button"
              onClick={() =>
                setShowAudioPicker(
                  true
                )
              }
              disabled={saving}
            >

              <span>
                +
              </span>

              <strong>
                Select audio
              </strong>

              <small>
                Choose an audio file from
                your AKNM media library
              </small>

            </button>

          )}


          {audioMedia && (

            <button
              type="button"
              className="new-track-change-media"
              onClick={() =>
                setShowAudioPicker(
                  true
                )
              }
              disabled={saving}
            >

              Change audio

              <span>
                ↗
              </span>

            </button>

          )}

        </section>


        {/* ===============================================
            TRACK INFORMATION
            =============================================== */}

        <section className="new-track-section">

          <div className="new-track-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                Track information
              </h2>

              <p>
                Add the main information for this track.
              </p>

            </div>

          </div>


          <div className="new-track-fields">


            <label>

              <span>
                TRACK TITLE
              </span>

              <input
                type="text"
                value={title}
                onChange={(event) => {

                  const value =
                    event.target.value;

                  setTitle(
                    value
                  );

                  if (!slug) {

                    setSlug(
                      generateSlug(
                        value
                      )
                    );

                  }

                }}
                disabled={saving}
              />

            </label>


            <label>

              <span>
                SLUG
              </span>

              <input
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                disabled={saving}
              />

            </label>


            <div className="new-track-two-columns">

              <label>

                <span>
                  ARTIST
                </span>

                <input
                  type="text"
                  value={artistName}
                  onChange={(event) =>
                    setArtistName(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>


              <label>

                <span>
                  FEATURED ARTISTS
                </span>

                <input
                  type="text"
                  value={featuredArtists}
                  onChange={(event) =>
                    setFeaturedArtists(
                      event.target.value
                    )
                  }
                  placeholder="Separate names with commas"
                  disabled={saving}
                />

              </label>

            </div>


            <div className="new-track-three-columns">

              <label>

                <span>
                  DISC NUMBER
                </span>

                <input
                  type="number"
                  min="1"
                  value={discNumber}
                  onChange={(event) =>
                    setDiscNumber(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>


              <label>

                <span>
                  TRACK NUMBER
                </span>

                <input
                  type="number"
                  min="1"
                  value={trackNumber}
                  onChange={(event) =>
                    setTrackNumber(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>


              <label>

                <span>
                  LANGUAGE
                </span>

                <input
                  type="text"
                  value={language}
                  onChange={(event) =>
                    setLanguage(
                      event.target.value
                    )
                  }
                  placeholder="e.g. English"
                  disabled={saving}
                />

              </label>

            </div>


            <label>

              <span>
                GENRE
              </span>

              <input
                type="text"
                value={genre}
                onChange={(event) =>
                  setGenre(
                    event.target.value
                  )
                }
                placeholder="e.g. Afrobeats"
                disabled={saving}
              />

            </label>


            <label>

              <span>
                RELEASE DATE
              </span>

              <input
                type="date"
                value={releaseDate}
                onChange={(event) =>
                  setReleaseDate(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                DESCRIPTION
              </span>

              <textarea
                rows={5}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>

          </div>

        </section>


        {/* ===============================================
            ARTWORK
            =============================================== */}

        <section className="new-track-section">

          <div className="new-track-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Track artwork
              </h2>

              <p>
                Optionally add artwork specifically
                for this track.
              </p>

            </div>

          </div>


          {coverMedia ? (

            <div className="new-track-cover-selected">

              <div className="new-track-cover-preview">

                {coverMedia.public_url ? (

                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      "Track artwork"
                    }
                  />

                ) : (

                  <span>
                    ART
                  </span>

                )}

              </div>


              <div className="new-track-cover-info">

                <strong>
                  {coverMedia.title ||
                    "Untitled artwork"}
                </strong>

                <small>
                  Custom track artwork
                </small>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCoverMedia(
                    null
                  )
                }
                disabled={saving}
              >
                Remove
              </button>

            </div>

          ) : (

            <button
              type="button"
              className="new-track-media-button"
              onClick={() =>
                setShowCoverPicker(
                  true
                )
              }
              disabled={saving}
            >

              <span>
                +
              </span>

              <strong>
                Choose artwork
              </strong>

              <small>
                Optional custom artwork
                for this track
              </small>

            </button>

          )}


          {coverMedia && (

            <button
              type="button"
              className="new-track-change-media"
              onClick={() =>
                setShowCoverPicker(
                  true
                )
              }
              disabled={saving}
            >

              Change artwork

              <span>
                ↗
              </span>

            </button>

          )}

        </section>


        {/* ===============================================
            CREDITS
            =============================================== */}

        <section className="new-track-section">

          <div className="new-track-section-heading">

            <span>
              04
            </span>

            <div>

              <h2>
                Credits & metadata
              </h2>

              <p>
                Add professional credits and identifiers.
              </p>

            </div>

          </div>


          <div className="new-track-fields">


            <div className="new-track-two-columns">

              <label>

                <span>
                  ISRC
                </span>

                <input
                  type="text"
                  value={isrc}
                  onChange={(event) =>
                    setIsrc(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>


              <label>

                <span>
                  PRODUCER
                </span>

                <input
                  type="text"
                  value={producer}
                  onChange={(event) =>
                    setProducer(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>

            </div>


            <div className="new-track-two-columns">

              <label>

                <span>
                  COMPOSER
                </span>

                <input
                  type="text"
                  value={composer}
                  onChange={(event) =>
                    setComposer(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>


              <label>

                <span>
                  SONGWRITER
                </span>

                <input
                  type="text"
                  value={songwriter}
                  onChange={(event) =>
                    setSongwriter(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>

            </div>


            <label className="new-track-checkbox">

              <input
                type="checkbox"
                checked={explicit}
                onChange={(event) =>
                  setExplicit(
                    event.target.checked
                  )
                }
                disabled={saving}
              />

              <span>
                This track contains explicit content
              </span>

            </label>

          </div>

        </section>


        {/* ===============================================
            LYRICS
            =============================================== */}

        <section className="new-track-section">

          <div className="new-track-section-heading">

            <span>
              05
            </span>

            <div>

              <h2>
                Lyrics
              </h2>

              <p>
                Add the complete lyrics for this track.
              </p>

            </div>

          </div>


          <div className="new-track-fields">

            <label>

              <span>
                LYRICS
              </span>

              <textarea
                rows={16}
                value={lyrics}
                onChange={(event) =>
                  setLyrics(
                    event.target.value
                  )
                }
                placeholder="Enter lyrics..."
                disabled={saving}
              />

            </label>

          </div>

        </section>


        {/* ===============================================
            ERROR
            =============================================== */}

        {error && (

          <div className="new-track-message">

            {error}

          </div>

        )}


        {/* ===============================================
            ACTIONS
            =============================================== */}

        <footer className="new-track-actions">

          <Link
            href={`/studio/music/${releaseId}/edit`}
            className="new-track-cancel"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="new-track-save"
            disabled={saving}
          >

            {saving
              ? "Adding track..."
              : "Add Track"}

            {!saving && (
              <span>
                ↗
              </span>
            )}

          </button>

        </footer>

      </form>


      {/* ===================================================
          AUDIO PICKER
          =================================================== */}

      {showAudioPicker && (

        <div className="new-track-modal">

          <div
            className="new-track-modal__backdrop"
            onClick={() =>
              setShowAudioPicker(
                false
              )
            }
          />


          <div className="new-track-modal__panel">

            <MediaPicker
              mode="audio"
              selectedIds={
                audioMedia
                  ? [audioMedia.id]
                  : []
              }
              onChange={(media) => {

                setAudioMedia(
                  media[0] ?? null
                );

                setShowAudioPicker(
                  false
                );

              }}
              onClose={() =>
                setShowAudioPicker(
                  false
                )
              }
            />

          </div>

        </div>

      )}


      {/* ===================================================
          COVER PICKER
          =================================================== */}

      {showCoverPicker && (

        <div className="new-track-modal">

          <div
            className="new-track-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
          />


          <div className="new-track-modal__panel">

            <MediaPicker
              mode="cover"
              selectedIds={
                coverMedia
                  ? [coverMedia.id]
                  : []
              }
              onChange={(media) => {

                setCoverMedia(
                  media[0] ?? null
                );

                setShowCoverPicker(
                  false
                );

              }}
              onClose={() =>
                setShowCoverPicker(
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