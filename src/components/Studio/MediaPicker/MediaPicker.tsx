"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaUploader, {
  UploadedMediaItem,
} from "@/components/Studio/MediaUploader/MediaUploader";

import "./MediaPicker.css";


/* =========================================================
   TYPES
   ========================================================= */

export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";


export type MediaItem = {
  id: string;

  title: string | null;

  description: string | null;

  media_type: MediaType;

  public_url: string | null;

  thumbnail_url: string | null;

  mime_type: string | null;

  file_size: number | null;

  width: number | null;

  height: number | null;

  duration_seconds: number | null;

  alt_text: string | null;

  created_at: string;
};


type MediaPickerMode =
  | "cover"
  | "audio"
  | "multiple";


type MediaPickerProps = {
  selectedIds?: string[];

  mode?: MediaPickerMode;

  /*
   * Optional explicit restriction.
   *
   * Example:
   *
   * mediaType="audio"
   *
   * When mode="cover" is used,
   * image is automatically enforced.
   */
  mediaType?: MediaType;

  onChange: (
    media: MediaItem[]
  ) => void;

  onClose?: () => void;

  /*
   * Allow direct upload.
   *
   * Defaults to true.
   */
  allowUpload?: boolean;
};


/* =========================================================
   FILTERS
   ========================================================= */

const filters: Array<{
  label: string;

  value:
    | "all"
    | MediaType;
}> = [
  {
    label: "All",
    value: "all",
  },

  {
    label: "Images",
    value: "image",
  },

  {
    label: "Videos",
    value: "video",
  },

  {
    label: "Audio",
    value: "audio",
  },

  {
    label: "Documents",
    value: "document",
  },
];


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(
  bytes: number | null
) {

  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
  }


  if (bytes < 1024) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }


  if (
    bytes <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }


  return `${(
    bytes /
    (1024 *
      1024 *
      1024)
  ).toFixed(1)} GB`;

}


/* =========================================================
   DATE
   ========================================================= */

function formatDate(
  date: string
) {

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


/* =========================================================
   DURATION
   ========================================================= */

function formatDuration(
  seconds: number | null
) {

  if (
    seconds === null ||
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


/* =========================================================
   MEDIA INITIAL
   ========================================================= */

function getInitial(
  media: MediaItem
) {

  if (
    media.media_type ===
    "image"
  ) {
    return "IMG";
  }


  if (
    media.media_type ===
    "video"
  ) {
    return "VID";
  }


  if (
    media.media_type ===
    "audio"
  ) {
    return "AUD";
  }


  return "DOC";

}


/* =========================================================
   MEDIA PICKER
   ========================================================= */

export default function MediaPicker({
  selectedIds = [],

  mode = "multiple",

  mediaType,

  onChange,

  onClose,

  allowUpload = true,
}: MediaPickerProps) {


  /* =======================================================
     EFFECTIVE MEDIA TYPE
     ======================================================= */

  /*
   * Cover artwork must always be an image.
   *
   * This means:
   *
   * <MediaPicker mode="cover" />
   *
   * automatically becomes an image-only picker.
   */

  const effectiveMediaType:
  | MediaType
  | undefined =
  mode === "cover"
    ? "image"
    : mode === "audio"
    ? "audio"
    : mediaType;


  /* =======================================================
     STATE
     ======================================================= */

  const [
    media,
    setMedia,
  ] = useState<MediaItem[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState<
    "all" | MediaType
  >(
    effectiveMediaType ??
      "all"
  );


  const [
    selected,
    setSelected,
  ] = useState<string[]>(
    selectedIds
  );


  const [
    showUploader,
    setShowUploader,
  ] = useState(false);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  /* =======================================================
     KEEP SELECTION IN SYNC
     ======================================================= */

  useEffect(() => {

    setSelected(
      selectedIds
    );

  }, [
    selectedIds,
  ]);


  /* =======================================================
     FORCE FILTER WHEN TYPE IS RESTRICTED
     ======================================================= */

  useEffect(() => {

    if (
      effectiveMediaType
    ) {

      setFilter(
        effectiveMediaType
      );

    }

  }, [
    effectiveMediaType,
  ]);


  /* =======================================================
     LOAD MEDIA
     ======================================================= */

  async function loadMedia(
    showLoading = true
  ) {

    if (showLoading) {

      setLoading(true);

    } else {

      setRefreshing(true);

    }


    setError("");


    const supabase =
      createClient();


    const {
      data,

      error:
        fetchError,
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
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );


    if (
      fetchError
    ) {

      console.error(
        "Media picker error:",
        fetchError
      );


      setError(
        fetchError.message
      );


      setMedia(
        []
      );


      setLoading(
        false
      );


      setRefreshing(
        false
      );


      return;

    }


    setMedia(
      (data ??
        []) as MediaItem[]
    );


    setLoading(
      false
    );


    setRefreshing(
      false
    );

  }


  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {

    void loadMedia();

  }, []);


  /* =======================================================
     FILTER MEDIA
     ======================================================= */

  const filteredMedia =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return media.filter(
        (item) => {


          /* =============================================
             HARD MEDIA TYPE RESTRICTION
             ============================================= */

          if (
            effectiveMediaType &&
            item.media_type !==
              effectiveMediaType
          ) {

            return false;

          }


          /* =============================================
             UI FILTER
             ============================================= */

          const matchesType =
            filter ===
              "all" ||
            item.media_type ===
              filter;


          if (
            !matchesType
          ) {

            return false;

          }


          /* =============================================
             SEARCH
             ============================================= */

          if (!query) {
            return true;
          }


          return (

            item.title
              ?.toLowerCase()
              .includes(
                query
              ) ||

            item.description
              ?.toLowerCase()
              .includes(
                query
              ) ||

            item.mime_type
              ?.toLowerCase()
              .includes(
                query
              )

          );

        }
      );

    }, [
      media,

      search,

      filter,

      effectiveMediaType,
    ]);


  /* =======================================================
     SELECT MEDIA
     ======================================================= */

  function selectMedia(
    item: MediaItem
  ) {


    /* ===============================================
       SAFETY CHECK
       =============================================== */

    if (
      effectiveMediaType &&
      item.media_type !==
        effectiveMediaType
    ) {

      return;

    }


    /* ===============================================
       COVER MODE
       =============================================== */

    if (
      mode === "cover"
    ) {

      setSelected([
        item.id,
      ]);


      onChange([
        item,
      ]);


      onClose?.();


      return;

    }


    /* ===============================================
       MULTIPLE MODE
       =============================================== */

    const exists =
      selected.includes(
        item.id
      );


    const next =
      exists
        ? selected.filter(
            (id) =>
              id !==
              item.id
          )
        : [
            ...selected,
            item.id,
          ];


    const selectedMedia =
      media.filter(
        (mediaItem) =>
          next.includes(
            mediaItem.id
          )
      );


    setSelected(
      next
    );


    onChange(
      selectedMedia
    );

  }


  /* =======================================================
     HANDLE UPLOADED MEDIA
     ======================================================= */

  function handleUploaded(
    uploaded: UploadedMediaItem
  ) {

    const uploadedMedia =
      uploaded as MediaItem;


    /*
     * Safety:
     * Don't accept an incorrect file type.
     */

    if (
      effectiveMediaType &&
      uploadedMedia.media_type !==
        effectiveMediaType
    ) {

      console.error(
        "Uploaded media type does not match picker restriction."
      );

      return;

    }


    /*
     * Update the local library immediately.
     */

    setMedia(
      (current) => [

        uploadedMedia,

        ...current.filter(
          (item) =>
            item.id !==
            uploadedMedia.id
        ),

      ]
    );


    /* ===============================================
       COVER MODE
       =============================================== */

    if (
      mode === "cover"
    ) {

      setSelected([
        uploadedMedia.id,
      ]);


      onChange([
        uploadedMedia,
      ]);


      setShowUploader(
        false
      );


      onClose?.();


      return;

    }


    /* ===============================================
       MULTIPLE MODE
       =============================================== */

    setSelected(
      (current) => {

        if (
          current.includes(
            uploadedMedia.id
          )
        ) {

          return current;

        }


        const next = [
          ...current,
          uploadedMedia.id,
        ];


        setTimeout(
          () => {

            onChange([
              ...media.filter(
                (item) =>
                  next.includes(
                    item.id
                  )
              ),

              uploadedMedia,
            ].filter(
              (
                item,
                index,
                array
              ) =>
                array.findIndex(
                  (mediaItem) =>
                    mediaItem.id ===
                    item.id
                ) === index
            ));

          },
          0
        );


        return next;

      }
    );


    setShowUploader(
      false
    );

  }


  /* =======================================================
     CLEAR SELECTION
     ======================================================= */

  function clearSelection() {

    setSelected(
      []
    );


    onChange(
      []
    );

  }


  /* =======================================================
     HEADING
     ======================================================= */

  function getHeading() {

    if (
      mode === "cover"
    ) {
      return "Choose cover artwork";
    }


    if (
      effectiveMediaType ===
      "audio"
    ) {
      return "Choose audio";
    }


    if (
      effectiveMediaType ===
      "image"
    ) {
      return "Choose image";
    }


    if (
      effectiveMediaType ===
      "video"
    ) {
      return "Choose video";
    }


    if (
      effectiveMediaType ===
      "document"
    ) {
      return "Choose document";
    }


    return "Choose media";

  }


  /* =======================================================
     DESCRIPTION
     ======================================================= */

  function getDescription() {

    if (
      mode === "cover"
    ) {

      return "Choose one image from your media library or upload new artwork from your computer.";

    }


    if (
      effectiveMediaType ===
      "audio"
    ) {

      return "Choose an existing audio asset or upload a new audio file from your computer.";

    }


    if (
      effectiveMediaType ===
      "image"
    ) {

      return "Choose an existing image or upload a new image from your computer.";

    }


    if (
      effectiveMediaType ===
      "video"
    ) {

      return "Choose an existing video or upload a new video from your computer.";

    }


    if (
      effectiveMediaType ===
      "document"
    ) {

      return "Choose an existing document or upload a new document from your computer.";

    }


    return "Choose one or more assets from your AKNM media library.";

  }


  /* =======================================================
     EMPTY LABEL
     ======================================================= */

  function getEmptyLabel() {

    if (
      mode === "cover"
    ) {
      return "cover artwork";
    }


    return effectiveMediaType ??
      "media";

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <section className="media-picker">


      {/* =================================================
          HEADER
          ================================================= */}

      <header className="media-picker__header">

        <div>

          <span className="media-picker__eyebrow">

            MEDIA LIBRARY

          </span>


          <h2>

            {getHeading()}

          </h2>


          <p>

            {getDescription()}

          </p>

        </div>


        {onClose && (

          <button
            type="button"
            className="media-picker__close"
            onClick={onClose}
            aria-label="Close media picker"
          >

            ×

          </button>

        )}

      </header>


      {/* =================================================
          SOURCE SWITCHER
          ================================================= */}

      {allowUpload && (

        <div className="media-picker__source-bar">

          <div>

            <span>
              SOURCE
            </span>


            <strong>

              {showUploader
                ? "COMPUTER"
                : "MEDIA LIBRARY"}

            </strong>

          </div>


          <div className="media-picker__source-actions">

            <button
              type="button"
              className={
                !showUploader
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setShowUploader(
                  false
                )
              }
            >

              Media Library

            </button>


            <button
              type="button"
              className={
                showUploader
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setShowUploader(
                  true
                )
              }
            >

              Upload from Computer

            </button>

          </div>

        </div>

      )}


      {/* =================================================
          UPLOADER
          ================================================= */}

      {showUploader &&
        allowUpload && (

          <div className="media-picker__uploader">

            <MediaUploader
              mediaType={
                effectiveMediaType
              }
              onUploaded={
                handleUploaded
              }
              onClose={() =>
                setShowUploader(
                  false
                )
              }
            />

          </div>

        )}


      {/* =================================================
          MEDIA LIBRARY
          ================================================= */}

      {!showUploader && (

        <>


          {/* =============================================
              TOOLBAR
              ============================================= */}

          <div className="media-picker__toolbar">

            <div className="media-picker__search">

              <span>
                /
              </span>


              <input
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder={
                  effectiveMediaType ===
                  "audio"
                    ? "Search audio..."
                    : mode ===
                      "cover"
                    ? "Search artwork..."
                    : "Search media..."
                }
              />

            </div>


            {!effectiveMediaType && (

              <div className="media-picker__filters">

                {filters.map(
                  (item) => (

                    <button
                      type="button"
                      key={
                        item.value
                      }
                      className={`
                        media-picker__filter
                        ${
                          filter ===
                          item.value
                            ? "is-active"
                            : ""
                        }
                      `}
                      onClick={() =>
                        setFilter(
                          item.value
                        )
                      }
                    >

                      {
                        item.label
                      }

                    </button>

                  )
                )}

              </div>

            )}


            {effectiveMediaType && (

              <div className="media-picker__type-lock">

                <span>
                  FILTER
                </span>


                <strong>

                  {effectiveMediaType.toUpperCase()}

                </strong>

              </div>

            )}


            <button
              type="button"
              className="media-picker__refresh"
              onClick={() =>
                void loadMedia(
                  false
                )
              }
              disabled={
                refreshing
              }
              aria-label="Refresh media library"
            >

              {refreshing
                ? "..."
                : "↻"}

            </button>

          </div>


          {/* =============================================
              SELECTION BAR
              ============================================= */}

          <div className="media-picker__selection-bar">

            <span>

              {filteredMedia.length}{" "}

              {filteredMedia.length ===
              1
                ? "asset"
                : "assets"}

            </span>


            <div>

              <strong>

                {mode ===
                "cover"
                  ? selected.length > 0
                    ? "1 selected"
                    : "Select 1"
                  : `${selected.length} selected`}

              </strong>


              {mode ===
                "multiple" &&
                selected.length >
                  0 && (

                <button
                  type="button"
                  onClick={
                    clearSelection
                  }
                >

                  Clear

                </button>

              )}

            </div>

          </div>


          {/* =============================================
              LOADING
              ============================================= */}

          {loading && (

            <div className="media-picker__state">

              <div className="media-picker__loader" />


              <p>
                Loading your media...
              </p>

            </div>

          )}


          {/* =============================================
              ERROR
              ============================================= */}

          {!loading &&
            error && (

            <div className="media-picker__state media-picker__state--error">

              <strong>
                Could not load media
              </strong>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={() =>
                  void loadMedia()
                }
              >

                Try again

              </button>

            </div>

          )}


          {/* =============================================
              EMPTY
              ============================================= */}

          {!loading &&
            !error &&
            filteredMedia.length ===
              0 && (

            <div className="media-picker__state">

              <div className="media-picker__empty-icon">
                +
              </div>


              <strong>

                No{" "}

                {getEmptyLabel()}{" "}

                found

              </strong>


              <p>

                {search
                  ? "Try another search."
                  : mode ===
                    "cover"
                  ? "Upload an image from your computer to use as cover artwork."
                  : effectiveMediaType ===
                    "audio"
                  ? "Upload audio from your computer to add it to your media library."
                  : "Upload media from your computer to add it to your library."}

              </p>


              {allowUpload && (

                <button
                  type="button"
                  className="media-picker__empty-action"
                  onClick={() =>
                    setShowUploader(
                      true
                    )
                  }
                >

                  Upload from Computer

                  <span>
                    ↗
                  </span>

                </button>

              )}

            </div>

          )}


          {/* =============================================
              MEDIA GRID
              ============================================= */}

          {!loading &&
            !error &&
            filteredMedia.length >
              0 && (

            <div className="media-picker__grid">

              {filteredMedia.map(
                (item) => {

                  const isSelected =
                    selected.includes(
                      item.id
                    );


                  return (

                    <button
                      type="button"
                      key={
                        item.id
                      }
                      className={`
                        media-picker__item
                        ${
                          isSelected
                            ? "is-selected"
                            : ""
                        }
                      `}
                      onClick={() =>
                        selectMedia(
                          item
                        )
                      }
                    >


                      {/* =============================
                          PREVIEW
                          ============================= */}

                      <div className="media-picker__preview">


                        {item.media_type ===
                          "image" &&
                          item.public_url && (

                          <img
                            src={
                              item.public_url
                            }
                            alt={
                              item.alt_text ||
                              item.title ||
                              ""
                            }
                          />

                        )}


                        {item.media_type ===
                          "video" &&
                          (
                            item.thumbnail_url ||
                            item.public_url
                          ) && (

                          <img
                            src={
                              item.thumbnail_url ||
                              item.public_url ||
                              ""
                            }
                            alt=""
                          />

                        )}


                        {item.media_type ===
                          "audio" && (

                          <div className="media-picker__audio-preview">

                            <span>
                              AUD
                            </span>


                            <strong>
                              ♪
                            </strong>


                            {item.duration_seconds !==
                              null && (

                              <small>

                                {formatDuration(
                                  item.duration_seconds
                                )}

                              </small>

                            )}

                          </div>

                        )}


                        {item.media_type ===
                          "document" && (

                          <div className="media-picker__file-icon">

                            {
                              getInitial(
                                item
                              )
                            }

                          </div>

                        )}


                        {isSelected && (

                          <span className="media-picker__check">
                            ✓
                          </span>

                        )}

                      </div>


                      {/* =============================
                          INFORMATION
                          ============================= */}

                      <div className="media-picker__item-info">

                        <strong>

                          {
                            item.title ||
                            "Untitled media"
                          }

                        </strong>


                        <div>

                          <span>

                            {
                              item.media_type
                            }

                          </span>


                          <span>
                            /
                          </span>


                          <span>

                            {formatFileSize(
                              item.file_size
                            )}

                          </span>

                        </div>


                        {item.media_type ===
                          "audio" &&
                          item.duration_seconds !==
                            null && (

                          <small>

                            {formatDuration(
                              item.duration_seconds
                            )}

                          </small>

                        )}


                        {item.media_type !==
                          "audio" && (

                          <small>

                            {formatDate(
                              item.created_at
                            )}

                          </small>

                        )}

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          )}

        </>

      )}

    </section>

  );

}