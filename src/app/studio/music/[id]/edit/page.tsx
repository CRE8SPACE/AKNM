"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
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

import "./music-edit.css";


/* =========================================================
   TYPES
   ========================================================= */

type MusicCategory = {
  id: string;

  name: string;

  slug: string;
};


type MusicRelease = {
  id: string;

  category_id: string | null;

  title: string;

  slug: string;

  artist_name: string;

  status: string;

  description: string | null;

  genre: string | null;

  language: string | null;

  record_label: string | null;

  copyright_owner: string | null;

  production_year: number | null;

  upc: string | null;

  cover_media_id: string | null;

  release_date: string | null;

  published_at: string | null;

  access_type:
    | "free"
    | "support"
    | "paid"
    | "preview_paid";

  preview_enabled: boolean;

  preview_duration: number | null;

  streaming_price: number | null;

  currency: string | null;

  download_enabled: boolean;

  download_price: number | null;

  donations_enabled: boolean;

  minimum_donation: number | null;
};


type MusicTrack = {
  id: string;

  owner_id: string | null;

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

  isNew?: boolean;
};


type EditableTrack =
  MusicTrack & {
    audioMedia:
      | MediaItem
      | null;

    isNew?: boolean;
  };


type MediaPickerMode =
  | "cover"
  | "audio"
  | null;


type AccessType =
  | "free"
  | "support"
  | "paid"
  | "preview_paid";


/* =========================================================
   COMPONENT
   ========================================================= */

export default function EditMusicReleasePage() {


  const router =
    useRouter();


  const params =
    useParams();


  const id =
    typeof params.id === "string"
      ? params.id
      : "";


  /* =======================================================
     RELEASE STATE
     ======================================================= */

  const [
    categories,
    setCategories,
  ] =
    useState<MusicCategory[]>(
      []
    );


  const [
    categoryId,
    setCategoryId,
  ] =
    useState("");


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


  const [
    releaseDate,
    setReleaseDate,
  ] =
    useState("");


  const [
    status,
    setStatus,
  ] =
    useState("draft");


  const [
    coverMedia,
    setCoverMedia,
  ] =
    useState<MediaItem | null>(
      null
    );


  /* =======================================================
     ACCESS STATE
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
    useState(false);


  const [
    previewDuration,
    setPreviewDuration,
  ] =
    useState("30");


  const [
    streamingPrice,
    setStreamingPrice,
  ] =
    useState("");


  const [
    currency,
    setCurrency,
  ] =
    useState("NGN");


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
     MUSIC LINKS
     ======================================================= */

  const [
    musicLinks,
    setMusicLinks,
  ] =
    useState<MusicLink[]>(
      []
    );


  /* =======================================================
     TRACK STATE
     ======================================================= */

  const [
    tracks,
    setTracks,
  ] =
    useState<EditableTrack[]>(
      []
    );


  const [
    activeTrackId,
    setActiveTrackId,
  ] =
    useState<string | null>(
      null
    );


  /* =======================================================
     PAGE STATE
     ======================================================= */

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


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


  const [
    showMediaPicker,
    setShowMediaPicker,
  ] =
    useState(false);


  const [
    mediaPickerMode,
    setMediaPickerMode,
  ] =
    useState<MediaPickerMode>(
      null
    );


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
     LOAD MEDIA
     ========================================================= */

  async function loadMediaById(
    mediaId: string
  ) {

    const supabase =
      createClient();


    const {
      data,
      error,
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
          mediaId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Media load error:",
        error
      );

      return null;

    }


    return (
      data as MediaItem | null
    );

  }


  /* =========================================================
     LOAD RELEASE
     ========================================================= */

  useEffect(() => {

    if (!id) {
      return;
    }


    let cancelled =
      false;


    async function loadRelease() {

      setLoading(
        true
      );


      setError(
        ""
      );


      const supabase =
        createClient();


      try {


        /* ---------------------------------------------------
           LOAD CATEGORIES
           --------------------------------------------------- */

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
              slug
            `)
            .order(
              "name",
              {
                ascending:
                  true,
              }
            );


        if (
          categoryError
        ) {

          console.error(
            "Music categories load error:",
            categoryError
          );

        }


        if (
          !cancelled
        ) {

          setCategories(
            (
              categoryData ||
              []
            ) as MusicCategory[]
          );

        }


        /* ---------------------------------------------------
           LOAD RELEASE
           --------------------------------------------------- */

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
              status,
              description,
              genre,
              language,
              record_label,
              copyright_owner,
              production_year,
              upc,
              cover_media_id,
              release_date,
              published_at,
              access_type,
              preview_enabled,
              preview_duration,
              streaming_price,
              currency,
              download_enabled,
              download_price,
              donations_enabled,
              minimum_donation
            `)
            .eq(
              "id",
              id
            )
            .maybeSingle();


        if (
          releaseError ||
          !release
        ) {

          throw new Error(
            releaseError?.message ||
            "Could not load this music release."
          );

        }


        if (cancelled) {
          return;
        }


        const musicRelease =
          release as MusicRelease;


        setCategoryId(
          musicRelease.category_id ||
          ""
        );


        setTitle(
          musicRelease.title
        );


        setSlug(
          musicRelease.slug
        );


        setArtistName(
          musicRelease.artist_name
        );


        setDescription(
          musicRelease.description ||
          ""
        );


        setGenre(
          musicRelease.genre ||
          ""
        );


        setLanguage(
          musicRelease.language ||
          ""
        );


        setRecordLabel(
          musicRelease.record_label ||
          ""
        );


        setCopyrightOwner(
          musicRelease.copyright_owner ||
          ""
        );


        setProductionYear(
          musicRelease.production_year
            ? String(
                musicRelease.production_year
              )
            : ""
        );


        setUpc(
          musicRelease.upc ||
          ""
        );


        setReleaseDate(
          musicRelease.release_date
            ? musicRelease.release_date.slice(
                0,
                10
              )
            : ""
        );


        setStatus(
          musicRelease.status
        );


        setAccessType(
          musicRelease.access_type ||
          "free"
        );


        setPreviewEnabled(
          Boolean(
            musicRelease.preview_enabled
          )
        );


        setPreviewDuration(
          musicRelease.preview_duration
            ? String(
                musicRelease.preview_duration
              )
            : "30"
        );


        setStreamingPrice(
          musicRelease.streaming_price !==
            null &&
          musicRelease.streaming_price !==
            undefined
            ? String(
                musicRelease.streaming_price
              )
            : ""
        );


        setCurrency(
          musicRelease.currency ||
          "NGN"
        );


        setDownloadEnabled(
          Boolean(
            musicRelease.download_enabled
          )
        );


        setDownloadPrice(
          musicRelease.download_price !==
            null &&
          musicRelease.download_price !==
            undefined
            ? String(
                musicRelease.download_price
              )
            : ""
        );


        setDonationsEnabled(
          Boolean(
            musicRelease.donations_enabled
          )
        );


        setMinimumDonation(
          musicRelease.minimum_donation !==
            null &&
          musicRelease.minimum_donation !==
            undefined
            ? String(
                musicRelease.minimum_donation
              )
            : ""
        );


        /* ---------------------------------------------------
           LOAD COVER
           --------------------------------------------------- */

        if (
          musicRelease.cover_media_id
        ) {

          const media =
            await loadMediaById(
              musicRelease.cover_media_id
            );


          if (
            !cancelled &&
            media
          ) {

            setCoverMedia(
              media
            );

          }

        }


        /* ---------------------------------------------------
           LOAD MUSIC LINKS
           --------------------------------------------------- */

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
              url
            `)
            .eq(
              "release_id",
              id
            );


        if (
          linksError
        ) {

          console.error(
            "Music links load error:",
            linksError
          );

        }


        if (
          !cancelled
        ) {

          setMusicLinks(
            (
              linksData ||
              []
            ) as MusicLink[]
          );

        }


        /* ---------------------------------------------------
           LOAD TRACKS
           --------------------------------------------------- */

        const {
          data: trackData,
          error: tracksError,
        } =
          await supabase
            .from(
              "music_tracks"
            )
            .select(`
              id,
              owner_id,
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
              id
            )
            .order(
              "disc_number",
              {
                ascending:
                  true,
              }
            )
            .order(
              "track_number",
              {
                ascending:
                  true,
              }
            );


        if (
          tracksError
        ) {

          throw new Error(
            tracksError.message
          );

        }


        if (
          trackData &&
          !cancelled
        ) {

          const loadedTracks =
            await Promise.all(

              (
                trackData as MusicTrack[]
              ).map(
                async (
                  track
                ) => {

                  const audioMedia =
                    await loadMediaById(
                      track.audio_media_id
                    );


                  return {

                    ...track,

                    audioMedia,

                  };

                }
              )

            );


          if (!cancelled) {

            setTracks(
              loadedTracks
            );

          }

        }


      } catch (err) {

        console.error(
          "Music edit load error:",
          err
        );


        if (!cancelled) {

          setError(
            err instanceof Error
              ? err.message
              : "Could not load this music release."
          );

        }

      } finally {

        if (!cancelled) {

          setLoading(
            false
          );

        }

      }

    }


    void loadRelease();


    return () => {

      cancelled =
        true;

    };

  }, [id]);


  /* =========================================================
     UPDATE TRACK
     ========================================================= */

  function updateTrack(
    trackId: string,
    updates: Partial<EditableTrack>
  ) {

    setTracks(
      (
        currentTracks
      ) =>
        currentTracks.map(
          (
            track
          ) => {

            if (
              track.id !==
              trackId
            ) {

              return track;

            }


            return {

              ...track,

              ...updates,

            };

          }
        )
    );

  }


  /* =========================================================
     ADD TRACK
     ========================================================= */

  function addTrack() {

    const nextTrackNumber =
      tracks.length + 1;


    const temporaryId =
      `new-${Date.now()}`;


    const newTrack:
      EditableTrack = {

        id:
          temporaryId,

        owner_id:
          null,

        release_id:
          id,

        title:
          "",

        slug:
          "",

        artist_name:
          artistName,

        featured_artists:
          null,

        track_number:
          nextTrackNumber,

        disc_number:
          1,

        audio_media_id:
          "",

        cover_media_id:
          null,

        genre:
          null,

        language:
          null,

        description:
          null,

        lyrics:
          null,

        explicit:
          false,

        isrc:
          null,

        producer:
          null,

        composer:
          null,

        songwriter:
          null,

        release_date:
          releaseDate ||
          null,

        published_at:
          null,

        created_at:
          new Date()
            .toISOString(),

        updated_at:
          new Date()
            .toISOString(),

        audioMedia:
          null,

        isNew:
          true,

      };


    setTracks(
      (
        currentTracks
      ) => [
        ...currentTracks,
        newTrack,
      ]
    );

  }


  /* =========================================================
     REMOVE TRACK
     ========================================================= */

  async function removeTrack(
    track: EditableTrack
  ) {

    if (saving) {
      return;
    }


    const confirmed =
      window.confirm(
        `Remove "${
          track.title ||
          "this track"
        }"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      if (
        !track.isNew
      ) {

        const supabase =
          createClient();


        const {
          error: deleteError,
        } =
          await supabase
            .from(
              "music_tracks"
            )
            .delete()
            .eq(
              "id",
              track.id
            );


        if (
          deleteError
        ) {

          throw deleteError;

        }

      }


      setTracks(
        (
          currentTracks
        ) =>
          currentTracks
            .filter(
              (
                currentTrack
              ) =>
                currentTrack.id !==
                track.id
            )
            .map(
              (
                currentTrack,
                index
              ) => ({

                ...currentTrack,

                track_number:
                  index + 1,

              })
            )
      );

    } catch (err) {

      console.error(
        "Track delete error:",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "Could not remove track."
      );

    }

  }


  /* =========================================================
     MUSIC LINKS
     ========================================================= */

  function addMusicLink() {

    setMusicLinks(
      (
        current
      ) => [

        ...current,

        {

          id:
            `new-${Date.now()}`,

          release_id:
            id,

          platform:
            "",

          url:
            "",

          isNew:
            true,

        },

      ]
    );

  }


  function updateMusicLink(
    linkId: string,
    updates: Partial<MusicLink>
  ) {

    setMusicLinks(
      (
        current
      ) =>
        current.map(
          (
            link
          ) => {

            if (
              link.id !==
              linkId
            ) {

              return link;

            }


            return {

              ...link,

              ...updates,

            };

          }
        )
    );

  }


  function removeMusicLink(
    linkId: string
  ) {

    setMusicLinks(
      (
        current
      ) =>
        current.filter(
          (
            link
          ) =>
            link.id !==
            linkId
        )
    );

  }


  /* =========================================================
     OPEN MEDIA PICKER
     ========================================================= */

  function openCoverPicker() {

    setMediaPickerMode(
      "cover"
    );


    setActiveTrackId(
      null
    );


    setShowMediaPicker(
      true
    );

  }


  function openAudioPicker(
    trackId: string
  ) {

    setMediaPickerMode(
      "audio"
    );


    setActiveTrackId(
      trackId
    );


    setShowMediaPicker(
      true
    );

  }


  /* =========================================================
     MEDIA PICKER CHANGE
     ========================================================= */

  function handleMediaChange(
    media: MediaItem[]
  ) {

    const selectedMedia =
      media[0] ??
      null;


    if (
      !selectedMedia
    ) {

      setShowMediaPicker(
        false
      );

      return;

    }


    /* -------------------------------------------------------
       COVER
       ------------------------------------------------------- */

    if (
      mediaPickerMode ===
      "cover"
    ) {

      setCoverMedia(
        selectedMedia
      );

    }


    /* -------------------------------------------------------
       AUDIO
       ------------------------------------------------------- */

    if (
      mediaPickerMode ===
        "audio" &&
      activeTrackId
    ) {

      updateTrack(
        activeTrackId,
        {

          audio_media_id:
            selectedMedia.id,

          audioMedia:
            selectedMedia,

        }
      );

    }


    setShowMediaPicker(
      false
    );


    setMediaPickerMode(
      null
    );


    setActiveTrackId(
      null
    );

  }


  /* =========================================================
     SAVE RELEASE
     ========================================================= */

  async function handleSubmit(
    event?: FormEvent<HTMLFormElement>,
    publish = false
  ) {

    event?.preventDefault();


    setError(
      ""
    );


    setSuccess(
      ""
    );


    /* -------------------------------------------------------
       VALIDATE RELEASE
       ------------------------------------------------------- */

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
      !slug.trim()
    ) {

      setError(
        "Please enter a valid slug."
      );

      return;

    }


    if (
      accessType ===
        "paid" &&
      (
        !streamingPrice ||
        Number(
          streamingPrice
        ) <= 0
      )
    ) {

      setError(
        "Please enter a valid streaming price."
      );

      return;

    }


    if (
      accessType ===
        "preview_paid" &&
      previewEnabled &&
      (
        !previewDuration ||
        Number(
          previewDuration
        ) <= 0
      )
    ) {

      setError(
        "Please enter a valid preview duration."
      );

      return;

    }


    if (
      downloadEnabled &&
      downloadPrice &&
      Number(
        downloadPrice
      ) < 0
    ) {

      setError(
        "Download price cannot be negative."
      );

      return;

    }


    if (
      donationsEnabled &&
      minimumDonation &&
      Number(
        minimumDonation
      ) < 0
    ) {

      setError(
        "Minimum donation cannot be negative."
      );

      return;

    }


    /* -------------------------------------------------------
       VALIDATE LINKS
       ------------------------------------------------------- */

    for (
      const link of musicLinks
    ) {

      const hasPlatform =
        Boolean(
          link.platform.trim()
        );


      const hasUrl =
        Boolean(
          link.url.trim()
        );


      if (
        hasPlatform !==
        hasUrl
      ) {

        setError(
          "Every streaming link must have both a platform name and URL."
        );

        return;

      }

    }


    /* -------------------------------------------------------
       VALIDATE TRACKS
       ------------------------------------------------------- */

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
        !track.audio_media_id
      ) {

        setError(
          `"${track.title}" does not have an audio file.`
        );

        return;

      }

    }


    if (
      !id ||
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


      /* -----------------------------------------------------
         AUTH
         ----------------------------------------------------- */

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {

        throw new Error(
          "You must be signed in."
        );

      }


      /* -----------------------------------------------------
         CHECK RELEASE SLUG
         ----------------------------------------------------- */

      const {
        data: existingRelease,
        error: slugError,
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
          .neq(
            "id",
            id
          )
          .maybeSingle();


      if (
        slugError
      ) {

        throw new Error(
          slugError.message
        );

      }


      if (
        existingRelease
      ) {

        throw new Error(
          "Another music release already uses this slug."
        );

      }


      /* -----------------------------------------------------
         UPDATE RELEASE
         ----------------------------------------------------- */

      const updateData:
        Record<
          string,
          unknown
        > = {

          category_id:
            categoryId ||
            null,

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

          cover_media_id:
            coverMedia?.id ??
            null,

          release_date:
            releaseDate ||
            null,

          access_type:
            accessType,

          preview_enabled:
            previewEnabled,

          preview_duration:
            previewEnabled &&
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
            currency ||
            "NGN",

          download_enabled:
            downloadEnabled,

          download_price:
            downloadEnabled &&
            downloadPrice
              ? Number(
                  downloadPrice
                )
              : null,

          donations_enabled:
            donationsEnabled,

          minimum_donation:
            donationsEnabled &&
            minimumDonation
              ? Number(
                  minimumDonation
                )
              : null,

        };


      if (
        publish
      ) {

        updateData.status =
          "published";


        updateData.published_at =
          new Date()
            .toISOString();

      }


      const {
        error: updateError,
      } =
        await supabase
          .from(
            "music_releases"
          )
          .update(
            updateData
          )
          .eq(
            "id",
            id
          );


      if (
        updateError
      ) {

        throw new Error(
          updateError.message
        );

      }


      /* =====================================================
         SAVE MUSIC LINKS
         ===================================================== */

      const validLinks =
        musicLinks.filter(
          (
            link
          ) =>
            link.platform.trim() &&
            link.url.trim()
        );


      const {
        error: deleteLinksError,
      } =
        await supabase
          .from(
            "music_links"
          )
          .delete()
          .eq(
            "release_id",
            id
          );


      if (
        deleteLinksError
      ) {

        throw new Error(
          deleteLinksError.message
        );

      }


      if (
        validLinks.length >
        0
      ) {

        const linksToInsert =
          validLinks.map(
            (
              link
            ) => ({

              release_id:
                id,

              platform:
                link.platform.trim(),

              url:
                link.url.trim(),

            })
          );


        const {
          error: insertLinksError,
        } =
          await supabase
            .from(
              "music_links"
            )
            .insert(
              linksToInsert
            );


        if (
          insertLinksError
        ) {

          throw new Error(
            insertLinksError.message
          );

        }

      }


      /* =====================================================
         SAVE TRACKS
         ===================================================== */

      for (
        const [
          index,
          track,
        ] of tracks.entries()
      ) {

        const trackNumber =
          index + 1;


        const trackSlug =
          generateSlug(
            track.title
          );


        /* ---------------------------------------------------
           UPDATE EXISTING TRACK
           --------------------------------------------------- */

        if (
          !track.isNew
        ) {

          const {
            error: trackUpdateError,
          } =
            await supabase
              .from(
                "music_tracks"
              )
              .update({

                title:
                  track.title.trim(),

                slug:
                  trackSlug,

                artist_name:
                  track.artist_name.trim() ||
                  artistName.trim(),

                track_number:
                  trackNumber,

                disc_number:
                  track.disc_number,

                audio_media_id:
                  track.audio_media_id,

                cover_media_id:
                  track.cover_media_id,

                updated_at:
                  new Date()
                    .toISOString(),

              })
              .eq(
                "id",
                track.id
              );


          if (
            trackUpdateError
          ) {

            throw new Error(
              trackUpdateError.message
            );

          }

        }


        /* ---------------------------------------------------
           CREATE NEW TRACK
           --------------------------------------------------- */

        if (
          track.isNew
        ) {

          const {
            error: trackInsertError,
          } =
            await supabase
              .from(
                "music_tracks"
              )
              .insert({

                owner_id:
                  user.id,

                release_id:
                  id,

                title:
                  track.title.trim(),

                slug:
                  trackSlug,

                artist_name:
                  track.artist_name.trim() ||
                  artistName.trim(),

                track_number:
                  trackNumber,

                disc_number:
                  track.disc_number,

                audio_media_id:
                  track.audio_media_id,

                cover_media_id:
                  track.cover_media_id,

                release_date:
                  releaseDate ||
                  null,

              });


          if (
            trackInsertError
          ) {

            throw new Error(
              trackInsertError.message
            );

          }

        }

      }


      /* -----------------------------------------------------
         SUCCESS
         ----------------------------------------------------- */

      setSuccess(
        publish
          ? "Music release and tracks published successfully."
          : "Music release updated successfully."
      );


      setTimeout(
        () => {

          router.push(
            `/studio/music/${id}`
          );


          router.refresh();

        },
        700
      );

    } catch (err) {

      console.error(
        "Music edit error:",
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


  /* =========================================================
     LOADING
     ========================================================= */

  if (
    loading
  ) {

    return (

      <main className="music-edit-page">

        <div className="music-edit-loading">

          <span>
            Loading release...
          </span>

        </div>

      </main>

    );

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <main className="music-edit-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="music-edit-header">

        <div>

          <Link
            href={`/studio/music/${id}`}
            className="music-edit-back"
          >
            ← Back to Release
          </Link>


          <span className="music-edit-eyebrow">

            AKNM STUDIO / MUSIC / EDIT

          </span>


          <h1>

            Edit release.

          </h1>


          <p>

            Update the release,
            artwork, tracks, access,
            platform links and publishing details.

          </p>

        </div>

      </header>


      {/* =====================================================
          FORM
          ===================================================== */}

      <form
        className="music-edit-form"
        onSubmit={(
          event
        ) =>
          handleSubmit(
            event,
            false
          )
        }
      >


        {/* ===================================================
            RELEASE INFORMATION
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              01
            </span>


            <div>

              <h2>
                Release information
              </h2>

              <p>
                Update the basic information
                for this release.
              </p>

            </div>

          </div>


          <div className="music-edit-fields">


            <label>

              <span>
                TITLE
              </span>

              <input
                type="text"
                value={title}
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
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
                onChange={(
                  event
                ) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                ARTIST
              </span>

              <input
                type="text"
                value={artistName}
                onChange={(
                  event
                ) =>
                  setArtistName(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                CATEGORY
              </span>

              <select
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
                      key={category.id}
                      value={category.id}
                    >

                      {category.name}

                    </option>

                  )
                )}

              </select>

            </label>


            <label>

              <span>
                GENRE
              </span>

              <input
                type="text"
                value={genre}
                onChange={(
                  event
                ) =>
                  setGenre(
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
                onChange={(
                  event
                ) =>
                  setLanguage(
                    event.target.value
                  )
                }
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
                onChange={(
                  event
                ) =>
                  setReleaseDate(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                PRODUCTION YEAR
              </span>

              <input
                type="number"
                min="1900"
                value={productionYear}
                onChange={(
                  event
                ) =>
                  setProductionYear(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                RECORD LABEL
              </span>

              <input
                type="text"
                value={recordLabel}
                onChange={(
                  event
                ) =>
                  setRecordLabel(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                COPYRIGHT OWNER
              </span>

              <input
                type="text"
                value={copyrightOwner}
                onChange={(
                  event
                ) =>
                  setCopyrightOwner(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </label>


            <label>

              <span>
                UPC
              </span>

              <input
                type="text"
                value={upc}
                onChange={(
                  event
                ) =>
                  setUpc(
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
                value={description}
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                rows={7}
                disabled={saving}
              />

            </label>

          </div>

        </section>


        {/* ===================================================
            COVER ART
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              02
            </span>


            <div>

              <h2>
                Cover artwork
              </h2>

              <p>
                Choose or replace the artwork
                from your AKNM media library.
              </p>

            </div>

          </div>


          {coverMedia ? (

            <div className="music-edit-cover-selected">

              <div className="music-edit-cover-preview">

                {coverMedia.public_url ? (

                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      "Release artwork"
                    }
                  />

                ) : (

                  <span>
                    ART
                  </span>

                )}

              </div>


              <div className="music-edit-cover-info">

                <strong>

                  {
                    coverMedia.title ||
                    "Untitled media"
                  }

                </strong>


                <small>
                  Current cover artwork
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
              className="music-edit-cover-button"
              onClick={
                openCoverPicker
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
                Select an image from your
                AKNM media library
              </small>

            </button>

          )}


          {coverMedia && (

            <button
              type="button"
              className="music-edit-change-cover"
              onClick={
                openCoverPicker
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


        {/* ===================================================
            ACCESS AND MONETIZATION
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              03
            </span>


            <div>

              <h2>
                Access and monetization
              </h2>

              <p>
                Control how listeners access,
                stream, download or support this release.
              </p>

            </div>

          </div>


          <div className="music-edit-fields">


            <label>

              <span>
                ACCESS TYPE
              </span>

              <select
                value={accessType}
                onChange={(
                  event
                ) =>
                  setAccessType(
                    event.target.value as AccessType
                  )
                }
                disabled={saving}
              >

                <option value="free">
                  Free
                </option>

                <option value="support">
                  Free with optional support
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="preview_paid">
                  Preview then paid
                </option>

              </select>

            </label>


            <label>

              <span>
                CURRENCY
              </span>

              <input
                type="text"
                value={currency}
                onChange={(
                  event
                ) =>
                  setCurrency(
                    event.target.value.toUpperCase()
                  )
                }
                maxLength={3}
                disabled={saving}
              />

            </label>


            {(
              accessType === "paid" ||
              accessType === "preview_paid"
            ) && (

              <label>

                <span>
                  STREAMING PRICE
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={streamingPrice}
                  onChange={(
                    event
                  ) =>
                    setStreamingPrice(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>

            )}


            {accessType ===
              "preview_paid" && (

              <>

                <label className="music-edit-toggle">

                  <input
                    type="checkbox"
                    checked={previewEnabled}
                    onChange={(
                      event
                    ) =>
                      setPreviewEnabled(
                        event.target.checked
                      )
                    }
                    disabled={saving}
                  />

                  <span>
                    Enable preview
                  </span>

                </label>


                {previewEnabled && (

                  <label>

                    <span>
                      PREVIEW DURATION (SECONDS)
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={previewDuration}
                      onChange={(
                        event
                      ) =>
                        setPreviewDuration(
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />

                  </label>

                )}

              </>

            )}


            <label className="music-edit-toggle">

              <input
                type="checkbox"
                checked={downloadEnabled}
                onChange={(
                  event
                ) =>
                  setDownloadEnabled(
                    event.target.checked
                  )
                }
                disabled={saving}
              />

              <span>
                Enable downloads
              </span>

            </label>


            {downloadEnabled && (

              <label>

                <span>
                  DOWNLOAD PRICE
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={downloadPrice}
                  onChange={(
                    event
                  ) =>
                    setDownloadPrice(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>

            )}


            <label className="music-edit-toggle">

              <input
                type="checkbox"
                checked={donationsEnabled}
                onChange={(
                  event
                ) =>
                  setDonationsEnabled(
                    event.target.checked
                  )
                }
                disabled={saving}
              />

              <span>
                Enable artist support
              </span>

            </label>


            {donationsEnabled && (

              <label>

                <span>
                  MINIMUM DONATION
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumDonation}
                  onChange={(
                    event
                  ) =>
                    setMinimumDonation(
                      event.target.value
                    )
                  }
                  disabled={saving}
                />

              </label>

            )}

          </div>

        </section>


        {/* ===================================================
            STREAMING LINKS
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              04
            </span>


            <div>

              <h2>
                Streaming platforms
              </h2>

              <p>
                Add links where this release
                is available across the web.
              </p>

            </div>

          </div>


          <div className="music-edit-links">


            {musicLinks.map(
              (
                link
              ) => (

                <div
                  className="music-edit-link"
                  key={link.id}
                >

                  <label>

                    <span>
                      PLATFORM
                    </span>

                    <input
                      type="text"
                      placeholder="Spotify"
                      value={link.platform}
                      onChange={(
                        event
                      ) =>
                        updateMusicLink(
                          link.id,
                          {
                            platform:
                              event.target.value,
                          }
                        )
                      }
                      disabled={saving}
                    />

                  </label>


                  <label>

                    <span>
                      URL
                    </span>

                    <input
                      type="url"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(
                        event
                      ) =>
                        updateMusicLink(
                          link.id,
                          {
                            url:
                              event.target.value,
                          }
                        )
                      }
                      disabled={saving}
                    />

                  </label>


                  <button
                    type="button"
                    onClick={() =>
                      removeMusicLink(
                        link.id
                      )
                    }
                    disabled={saving}
                  >

                    Remove

                  </button>

                </div>

              )
            )}


            {musicLinks.length === 0 && (

              <div className="music-edit-links-empty">

                <strong>
                  No platform links yet.
                </strong>

                <span>
                  Add Spotify, Apple Music,
                  Audiomack, YouTube or any other platform.
                </span>

              </div>

            )}


            <button
              type="button"
              className="music-edit-add-track"
              onClick={
                addMusicLink
              }
              disabled={saving}
            >

              <span>
                +
              </span>

              Add platform link

            </button>

          </div>

        </section>


        {/* ===================================================
            TRACKS
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              05
            </span>


            <div>

              <h2>
                Tracks
              </h2>

              <p>
                Add, update, replace or
                remove tracks from this release.
              </p>

            </div>

          </div>


          <div className="music-edit-tracks">


            {tracks.length === 0 && (

              <div className="music-edit-tracks-empty">

                <strong>
                  No tracks yet.
                </strong>

                <span>
                  Add the first track to this release.
                </span>

              </div>

            )}


            {tracks.map(
              (
                track,
                index
              ) => (

                <article
                  className="music-edit-track"
                  key={track.id}
                >


                  <div className="music-edit-track__number">

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>


                  <div className="music-edit-track__content">


                    <div className="music-edit-track__fields">


                      <label>

                        <span>
                          TRACK TITLE
                        </span>

                        <input
                          type="text"
                          value={track.title}
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              {
                                title:
                                  event.target.value,
                              }
                            )
                          }
                          disabled={saving}
                        />

                      </label>


                      <label>

                        <span>
                          ARTIST
                        </span>

                        <input
                          type="text"
                          value={
                            track.artist_name
                          }
                          onChange={(
                            event
                          ) =>
                            updateTrack(
                              track.id,
                              {
                                artist_name:
                                  event.target.value,
                              }
                            )
                          }
                          disabled={saving}
                        />

                      </label>


                    </div>


                    <div className="music-edit-track__audio">


                      <div className="music-edit-track__audio-info">

                        <span>
                          AUDIO FILE
                        </span>


                        <strong>

                          {
                            track.audioMedia
                              ?.title ||
                            "No audio selected"
                          }

                        </strong>


                        {track.audioMedia
                          ?.duration_seconds && (

                          <small>

                            Duration:{" "}

                            {
                              Math.floor(
                                track.audioMedia
                                  .duration_seconds /
                                60
                              )
                            }

                            :

                            {
                              String(
                                Math.floor(
                                  track.audioMedia
                                    .duration_seconds %
                                  60
                                )
                              ).padStart(
                                2,
                                "0"
                              )
                            }

                          </small>

                        )}

                      </div>


                      <button
                        type="button"
                        className="music-edit-track__change"
                        onClick={() =>
                          openAudioPicker(
                            track.id
                          )
                        }
                        disabled={saving}
                      >

                        {
                          track.audioMedia
                            ? "Replace audio"
                            : "Choose audio"
                        }

                        <span>
                          ↗
                        </span>

                      </button>

                    </div>


                    {track.audioMedia
                      ?.public_url && (

                      <audio
                        controls
                        className="music-edit-track__player"
                      >

                        <source
                          src={
                            track.audioMedia
                              .public_url
                          }
                        />

                        Your browser does not support audio.

                      </audio>

                    )}

                  </div>


                  <button
                    type="button"
                    className="music-edit-track__remove"
                    onClick={() =>
                      removeTrack(
                        track
                      )
                    }
                    disabled={saving}
                  >

                    Remove

                  </button>

                </article>

              )
            )}


            <button
              type="button"
              className="music-edit-add-track"
              onClick={
                addTrack
              }
              disabled={saving}
            >

              <span>
                +
              </span>

              Add track

            </button>


          </div>

        </section>


        {/* ===================================================
            STATUS
            =================================================== */}

        <section className="music-edit-section">

          <div className="music-edit-section-heading">

            <span>
              06
            </span>


            <div>

              <h2>
                Publishing status
              </h2>

              <p>
                Current publishing state of
                this release.
              </p>

            </div>

          </div>


          <div className="music-edit-status">

            <span className="music-edit-status__label">

              CURRENT STATUS

            </span>


            <strong
              className={`
                music-edit-status__value
                music-edit-status__value--${status}
              `}
            >

              {status}

            </strong>

          </div>

        </section>


        {/* ===================================================
            MESSAGES
            =================================================== */}

        {error && (

          <div className="music-edit-message music-edit-message--error">

            {error}

          </div>

        )}


        {success && (

          <div className="music-edit-message music-edit-message--success">

            {success}

          </div>

        )}


        {/* ===================================================
            ACTIONS
            =================================================== */}

        <footer className="music-edit-actions">


          <Link
            href={`/studio/music/${id}`}
            className="music-edit-cancel"
          >

            Cancel

          </Link>


          <button
            type="submit"
            className="music-edit-save"
            disabled={saving}
          >

            {
              saving
                ? "Saving..."
                : "Save Changes"
            }

          </button>


          {status !==
            "published" && (

            <button
              type="button"
              className="music-edit-publish"
              disabled={saving}
              onClick={() =>
                handleSubmit(
                  undefined,
                  true
                )
              }
            >

              {
                saving
                  ? "Publishing..."
                  : "Publish"
              }

              {!saving && (

                <span>
                  ↗
                </span>

              )}

            </button>

          )}

        </footer>

      </form>


      {/* =====================================================
          MEDIA PICKER
          ===================================================== */}

      {showMediaPicker && (

        <div className="music-edit-modal">


          <div
            className="music-edit-modal__backdrop"
            onClick={() =>
              setShowMediaPicker(
                false
              )
            }
          />


          <div className="music-edit-modal__panel">

            <MediaPicker
              mode={
                mediaPickerMode ===
                "audio"
                  ? "audio"
                  : "cover"
              }
              selectedIds={
                mediaPickerMode ===
                  "cover"
                  ? (
                    coverMedia
                      ? [coverMedia.id]
                      : []
                  )
                  : (
                    activeTrackId
                      ? tracks
                          .filter(
                            (
                              track
                            ) =>
                              track.id ===
                              activeTrackId
                          )
                          .map(
                            (
                              track
                            ) =>
                              track.audio_media_id
                          )
                      : []
                  )
              }
              onChange={
                handleMediaChange
              }
              onClose={() => {

                setShowMediaPicker(
                  false
                );


                setMediaPickerMode(
                  null
                );


                setActiveTrackId(
                  null
                );

              }}
            />

          </div>

        </div>

      )}

    </main>

  );

}