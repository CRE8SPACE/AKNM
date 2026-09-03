"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import "./MediaUploader.css";


/* =========================================================
   TYPES
   ========================================================= */

export type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";


export type MediaCategory = {
  id: string;
  name: string;
  slug: string;
};


export type UploadedMediaItem = {
  id: string;

  title: string | null;

  description: string | null;

  media_type: MediaType;

  category_id: string | null;

  category: MediaCategory | null;

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


type MediaUploaderProps = {
  mediaType?: MediaType;

  onUploaded?: (
    media: UploadedMediaItem
  ) => void;

  onClose?: () => void;

  title?: string;

  description?: string;
};


/* =========================================================
   BUCKETS
   ========================================================= */

const BUCKETS = {
  image: "aknm-images",

  video: "aknm-videos",

  audio: "aknm-audio",

  document: "aknm-documents",
} as const;


/* =========================================================
   AUDIO EXTENSIONS
   ========================================================= */

const AUDIO_EXTENSIONS = [
  "mp3",
  "mpeg",
  "mp2",
  "mp1",
  "wav",
  "wave",
  "m4a",
  "aac",
  "flac",
  "ogg",
  "oga",
  "opus",
  "webm",
  "weba",
  "aiff",
  "aif",
  "aifc",
  "wma",
  "amr",
  "3gp",
  "3gpp",
];


/* =========================================================
   ACCEPT TYPES
   ========================================================= */

const ACCEPT_TYPES: Record<
  MediaType,
  string
> = {
  image:
    "image/*",

  video:
    "video/*",

  audio: [
    "audio/*",

    ".mp3",
    ".mpeg",
    ".mp2",
    ".mp1",

    ".wav",
    ".wave",

    ".m4a",

    ".aac",

    ".flac",

    ".ogg",
    ".oga",

    ".opus",

    ".webm",
    ".weba",

    ".aiff",
    ".aif",
    ".aifc",

    ".wma",

    ".amr",

    ".3gp",
    ".3gpp",
  ].join(","),

  document:
    ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
};


/* =========================================================
   FILE EXTENSION
   ========================================================= */

function getFileExtension(
  fileName: string
): string {

  const extension =
    fileName
      .split(".")
      .pop()
      ?.trim()
      .toLowerCase();

  return extension || "";

}


/* =========================================================
   AUDIO FILE CHECK
   ========================================================= */

function isAudioFile(
  file: File
): boolean {

  const extension =
    getFileExtension(
      file.name
    );


  if (
    AUDIO_EXTENSIONS.includes(
      extension
    )
  ) {

    return true;

  }


  const mimeType =
    file.type
      .toLowerCase()
      .trim();


  const audioMimeTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/x-mp3",
    "audio/x-mpeg",
    "audio/mp2",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/x-wave",
    "audio/mp4",
    "audio/x-m4a",
    "audio/aac",
    "audio/x-aac",
    "audio/flac",
    "audio/x-flac",
    "audio/ogg",
    "audio/opus",
    "audio/webm",
    "audio/x-ms-wma",
    "audio/amr",
    "audio/aiff",
    "audio/x-aiff",
  ];


  if (
    mimeType.startsWith(
      "audio/"
    )
  ) {

    return true;

  }


  return audioMimeTypes.includes(
    mimeType
  );

}


/* =========================================================
   MEDIA TYPE DETECTION
   ========================================================= */

function detectMediaType(
  file: File
): MediaType {

  /*
   * AUDIO FIRST
   */

  if (
    isAudioFile(
      file
    )
  ) {

    return "audio";

  }


  /*
   * IMAGE
   */

  if (
    file.type.startsWith(
      "image/"
    )
  ) {

    return "image";

  }


  /*
   * VIDEO
   */

  if (
    file.type.startsWith(
      "video/"
    )
  ) {

    return "video";

  }


  /*
   * DOCUMENT
   */

  return "document";

}


/* =========================================================
   SAFE FILE NAME
   ========================================================= */

function createSafeFileName(
  fileName: string
): string {

  const extension =
    getFileExtension(
      fileName
    );


  const baseName =
    fileName
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  const unique =
    crypto.randomUUID();


  return extension
    ? `${baseName || "media"}-${unique}.${extension}`
    : `${baseName || "media"}-${unique}`;

}


/* =========================================================
   MEDIA DIMENSIONS / DURATION
   ========================================================= */

function getMediaDimensions(
  file: File,
  mediaType: MediaType
): Promise<{
  width: number | null;
  height: number | null;
  duration: number | null;
}> {

  return new Promise(
    (
      resolve
    ) => {

      /*
       * IMAGE
       */

      if (
        mediaType ===
        "image"
      ) {

        const url =
          URL.createObjectURL(
            file
          );


        const image =
          new Image();


        image.onload = () => {

          URL.revokeObjectURL(
            url
          );


          resolve({
            width:
              image.naturalWidth ||
              null,

            height:
              image.naturalHeight ||
              null,

            duration:
              null,
          });

        };


        image.onerror = () => {

          URL.revokeObjectURL(
            url
          );


          resolve({
            width: null,
            height: null,
            duration: null,
          });

        };


        image.src =
          url;


        return;

      }


      /*
       * VIDEO
       */

      if (
        mediaType ===
        "video"
      ) {

        const url =
          URL.createObjectURL(
            file
          );


        const video =
          document.createElement(
            "video"
          );


        video.preload =
          "metadata";


        video.onloadedmetadata =
          () => {

            URL.revokeObjectURL(
              url
            );


            resolve({

              width:
                video.videoWidth ||
                null,

              height:
                video.videoHeight ||
                null,

              duration:
                Number.isFinite(
                  video.duration
                )
                  ? video.duration
                  : null,

            });

          };


        video.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );


            resolve({

              width: null,
              height: null,
              duration: null,

            });

          };


        video.src =
          url;


        return;

      }


      /*
       * AUDIO
       */

      if (
        mediaType ===
        "audio"
      ) {

        const url =
          URL.createObjectURL(
            file
          );


        const audio =
          document.createElement(
            "audio"
          );


        audio.preload =
          "metadata";


        audio.onloadedmetadata =
          () => {

            const duration =
              Number.isFinite(
                audio.duration
              )
                ? audio.duration
                : null;


            URL.revokeObjectURL(
              url
            );


            resolve({

              width: null,

              height: null,

              duration,

            });

          };


        audio.onerror =
          () => {

            URL.revokeObjectURL(
              url
            );


            resolve({

              width: null,

              height: null,

              duration: null,

            });

          };


        audio.src =
          url;


        return;

      }


      /*
       * DOCUMENT
       */

      resolve({

        width: null,

        height: null,

        duration: null,

      });

    }
  );

}


/* =========================================================
   DISPLAY HELPERS
   ========================================================= */

function getMediaLabel(
  mediaType?: MediaType
): string {

  if (
    mediaType ===
    "audio"
  ) {

    return "Audio";

  }


  if (
    mediaType ===
    "image"
  ) {

    return "Image";

  }


  if (
    mediaType ===
    "video"
  ) {

    return "Video";

  }


  if (
    mediaType ===
    "document"
  ) {

    return "Document";

  }


  return "Media";

}


function getAcceptedDescription(
  mediaType?: MediaType
): string {

  if (
    mediaType ===
    "audio"
  ) {

    return "MP3 · MPEG · WAV · M4A · AAC · FLAC · OGG · OPUS";

  }


  if (
    mediaType ===
    "image"
  ) {

    return "JPG · PNG · WEBP · GIF · SVG";

  }


  if (
    mediaType ===
    "video"
  ) {

    return "MP4 · MOV · WEBM · AVI";

  }


  if (
    mediaType ===
    "document"
  ) {

    return "PDF · DOC · DOCX · XLS · XLSX · PPT · TXT";

  }


  return "Images · Videos · Audio · Documents";

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function MediaUploader({

  mediaType,

  onUploaded,

  onClose,

  title: customTitle,

  description: customDescription,

}: MediaUploaderProps) {


  const supabase =
    createClient();


  const inputRef =
    useRef<HTMLInputElement>(
      null
    );


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null
    );


  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    altText,
    setAltText,
  ] =
    useState("");


  const [
    categories,
    setCategories,
  ] =
    useState<MediaCategory[]>(
      []
    );


  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] =
    useState("");


  const [
    categoriesLoading,
    setCategoriesLoading,
  ] =
    useState(false);


  const [
    uploading,
    setUploading,
  ] =
    useState(false);


  const [
    progress,
    setProgress,
  ] =
    useState(0);


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
    detectedType,
    setDetectedType,
  ] =
    useState<MediaType | null>(
      null
    );


  /* =======================================================
     LOAD CATEGORIES
     ======================================================= */

  useEffect(
    () => {

      let mounted = true;


      async function loadCategories() {

        setCategoriesLoading(
          true
        );


        const {
          data,
          error: categoryError,
        } =
          await supabase
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
            )
            .order(
              "name",
              {
                ascending: true,
              }
            );


        if (!mounted) {

          return;

        }


        if (
          categoryError
        ) {

          console.error(
            "MEDIA CATEGORY FETCH ERROR:",
            categoryError
          );


          setCategories([]);

          setCategoriesLoading(
            false
          );

          return;

        }


        setCategories(
          data || []
        );


        setCategoriesLoading(
          false
        );

      }


      loadCategories();


      return () => {

        mounted =
          false;

      };

    },
    []
  );


  /* =======================================================
     DISPLAY
     ======================================================= */

  const displayType =
    mediaType ||
    detectedType;


  const heading =
    customTitle ||
    (
      mediaType
        ? `Upload ${getMediaLabel(
            mediaType
          ).toLowerCase()}`
        : "Upload media"
    );


  const subtitle =
    customDescription ||
    (
      mediaType
        ? `Add ${getMediaLabel(
            mediaType
          ).toLowerCase()} to your AKNM media library.`
        : "Add images, videos, audio and documents to your AKNM media library."
    );


  /* =======================================================
     FILE CHANGE
     ======================================================= */

  function handleFileChange(
    event: ChangeEvent<
      HTMLInputElement
    >
  ) {

    const file =
      event.target.files?.[0];


    setError("");

    setSuccess("");


    if (!file) {

      setSelectedFile(
        null
      );


      setDetectedType(
        null
      );


      return;

    }


    const detected =
      detectMediaType(
        file
      );


    /*
     * Respect media type restriction.
     */

    if (
      mediaType &&
      detected !==
        mediaType
    ) {

      setSelectedFile(
        null
      );


      setDetectedType(
        null
      );


      if (
        inputRef.current
      ) {

        inputRef.current.value =
          "";

      }


      setError(
        `Please choose a ${mediaType} file.`
      );


      return;

    }


    setSelectedFile(
      file
    );


    setDetectedType(
      detected
    );


    /*
     * Automatically use filename
     * as initial title.
     */

    if (!title) {

      setTitle(
        file.name.replace(
          /\.[^/.]+$/,
          ""
        )
      );

    }

  }


  /* =======================================================
     UPLOAD
     ======================================================= */

  async function handleUpload() {

    if (
      !selectedFile
    ) {

      setError(
        "Please select a file first."
      );


      return;

    }


    const selectedMediaType =
      mediaType ||
      detectMediaType(
        selectedFile
      );


    /*
     * Final safety check.
     */

    if (
      mediaType &&
      selectedMediaType !==
        mediaType
    ) {

      setError(
        `This uploader only accepts ${mediaType} files.`
      );


      return;

    }


    /*
     * Category is optional.
     *
     * We intentionally allow an uncategorized
     * media asset because existing media records
     * and internal assets may not need a category.
     */

    setUploading(
      true
    );


    setProgress(
      10
    );


    setError("");

    setSuccess("");


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
          "You must be signed in to upload media."
        );

      }


      /* ===============================================
         BUCKET
         =============================================== */

      const bucket =
        BUCKETS[
          selectedMediaType
        ];


      /* ===============================================
         FILE NAME
         =============================================== */

      const fileName =
        createSafeFileName(
          selectedFile.name
        );


      const storagePath =
        `uploads/${new Date()
          .getFullYear()}/${fileName}`;


      setProgress(
        20
      );


      /* ===============================================
         STORAGE UPLOAD
         =============================================== */

      const {
        error:
          uploadError,
      } =
        await supabase
          .storage
          .from(
            bucket
          )
          .upload(
            storagePath,
            selectedFile,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                selectedFile.type ||
                undefined,
            }
          );


      if (
        uploadError
      ) {

        throw new Error(
          uploadError.message
        );

      }


      setProgress(
        55
      );


      /* ===============================================
         PUBLIC URL
         =============================================== */

      const {
        data:
          publicUrlData,
      } =
        supabase
          .storage
          .from(
            bucket
          )
          .getPublicUrl(
            storagePath
          );


      const publicUrl =
        publicUrlData
          .publicUrl;


      /* ===============================================
         METADATA
         =============================================== */

      const dimensions =
        await getMediaDimensions(
          selectedFile,
          selectedMediaType
        );


      setProgress(
        75
      );


      /* ===============================================
         DATABASE RECORD
         =============================================== */

      const {
        data:
          mediaData,

        error:
          mediaError,

      } =
        await supabase
          .from(
            "media"
          )
          .insert({

            title:
              title.trim() ||
              selectedFile.name,

            description:
              description.trim() ||
              null,

            media_type:
              selectedMediaType,

            category_id:
              selectedCategoryId ||
              null,

            storage_bucket:
              bucket,

            storage_path:
              storagePath,

            public_url:
              publicUrl,

            thumbnail_url:
              null,

            mime_type:
              selectedFile.type ||
              (
                selectedMediaType ===
                "audio"
                  ? "audio/mpeg"
                  : null
              ),

            file_size:
              selectedFile.size,

            width:
              dimensions.width,

            height:
              dimensions.height,

            duration_seconds:
              dimensions.duration,

            alt_text:
              altText.trim() ||
              null,

            metadata: {

              original_name:
                selectedFile.name,

              original_extension:
                getFileExtension(
                  selectedFile.name
                ),

              uploaded_by:
                user.id,

            },

          })
          .select(`
            id,
            title,
            description,
            media_type,
            category_id,
            public_url,
            thumbnail_url,
            mime_type,
            file_size,
            width,
            height,
            duration_seconds,
            alt_text,
            created_at,

            category:categories (
              id,
              name,
              slug
            )
          `)
          .single();


      /*
       * Remove uploaded file if database
       * record creation fails.
       */

      if (
        mediaError ||
        !mediaData
      ) {

        await supabase
          .storage
          .from(
            bucket
          )
          .remove([
            storagePath,
          ]);


        throw new Error(
          mediaError?.message ||
          "Could not create media record."
        );

      }


      setProgress(
        100
      );


      /*
       * Normalize category relation.
       *
       * Supabase can return a relation as either
       * an object or an array depending on the
       * generated relationship type.
       */

      const rawCategory =
        mediaData.category;


      const category =
        Array.isArray(
          rawCategory
        )
          ? rawCategory[0] ||
            null
          : rawCategory ||
            null;


      const uploadedMedia: UploadedMediaItem =
        {

          id:
            mediaData.id,

          title:
            mediaData.title,

          description:
            mediaData.description,

          media_type:
            mediaData.media_type as MediaType,

          category_id:
            mediaData.category_id ||
            null,

          category:
            category as
              | MediaCategory
              | null,

          public_url:
            mediaData.public_url,

          thumbnail_url:
            mediaData.thumbnail_url,

          mime_type:
            mediaData.mime_type,

          file_size:
            mediaData.file_size,

          width:
            mediaData.width,

          height:
            mediaData.height,

          duration_seconds:
            mediaData.duration_seconds,

          alt_text:
            mediaData.alt_text,

          created_at:
            mediaData.created_at,

        };


      setSuccess(
        "Media uploaded successfully."
      );


      /* ===============================================
         RESET
         =============================================== */

      setSelectedFile(
        null
      );


      setDetectedType(
        null
      );


      setTitle("");

      setDescription("");

      setAltText("");

      setSelectedCategoryId("");


      if (
        inputRef.current
      ) {

        inputRef.current.value =
          "";

      }


      /* ===============================================
         RETURN MEDIA
         =============================================== */

      onUploaded?.(
        uploadedMedia
      );


    } catch (
      uploadError
    ) {

      console.error(
        "Media upload error:",
        uploadError
      );


      setError(

        uploadError instanceof
        Error
          ? uploadError.message
          : "Could not upload media."

      );


    } finally {

      setUploading(
        false
      );


      window.setTimeout(
        () => {

          setProgress(
            0
          );

        },
        700
      );

    }

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <section
      className={`
        media-uploader
        ${
          mediaType
            ? `media-uploader--${mediaType}`
            : ""
        }
      `}
    >


      {/* =================================================
          HEADER
          ================================================= */}

      <div className="media-uploader__header">

        <div>

          <span>

            {mediaType
              ? `${getMediaLabel(
                  mediaType
                ).toUpperCase()} ASSET`
              : "MEDIA ASSET"}

          </span>


          <h2>

            {heading}

          </h2>


          <p>

            {subtitle}

          </p>

        </div>


        {onClose && (

          <button
            type="button"
            className="media-uploader__close"
            onClick={
              onClose
            }
            disabled={
              uploading
            }
            aria-label="Close uploader"
          >

            ×

          </button>

        )}

      </div>


      {/* =================================================
          DROPZONE
          ================================================= */}

      <button
        type="button"
        className="media-uploader__dropzone"
        onClick={() =>
          inputRef.current?.click()
        }
        disabled={
          uploading
        }
      >

        <span className="media-uploader__plus">

          +

        </span>


        <strong>

          {selectedFile
            ? selectedFile.name
            : mediaType ===
              "audio"
            ? "Choose an audio file"
            : "Choose a file"}

        </strong>


        <small>

          {getAcceptedDescription(
            mediaType
          )}

        </small>

      </button>


      <input
        ref={
          inputRef
        }
        type="file"
        className="media-uploader__input"
        accept={
          mediaType
            ? ACCEPT_TYPES[
                mediaType
              ]
            : undefined
        }
        onChange={
          handleFileChange
        }
        disabled={
          uploading
        }
      />


      {/* =================================================
          SELECTED FILE
          ================================================= */}

      {selectedFile && (

        <div className="media-uploader__details">


          <div className="media-uploader__file">

            <span>
              FILE
            </span>


            <strong>

              {
                selectedFile.name
              }

            </strong>


            <small>

              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(
                2
              )} MB

              {" · "}

              {selectedFile.type ||
                "Unknown type"}

              {displayType && (

                <>

                  {" · "}

                  {
                    displayType
                      .toUpperCase()
                  }

                </>

              )}

            </small>

          </div>


          {selectedMediaTypeForDisplay(
            selectedFile,
            mediaType
          ) === "audio" && (

            <div className="media-uploader__audio-note">

              <span>
                AUDIO
              </span>


              <strong>

                Audio duration will be detected automatically

              </strong>

            </div>

          )}


          {/* =============================================
              FIELDS
              ============================================= */}

          <div className="media-uploader__fields">


            {/* =========================================
                TITLE
                ========================================= */}

            <div className="media-uploader__field">

              <label
                htmlFor="media-title"
              >
                TITLE
              </label>


              <input
                id="media-title"
                type="text"
                value={
                  title
                }
                onChange={(
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Media title"
                disabled={
                  uploading
                }
              />

            </div>


            {/* =========================================
                DESCRIPTION
                ========================================= */}

            <div className="media-uploader__field">

              <label
                htmlFor="media-description"
              >
                DESCRIPTION
              </label>


              <textarea
                id="media-description"
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Optional description"
                rows={
                  3
                }
                disabled={
                  uploading
                }
              />

            </div>


            {/* =========================================
                CATEGORY
                ========================================= */}

            <div className="media-uploader__field">

              <label
                htmlFor="media-category"
              >
                CATEGORY
              </label>


              <select
                id="media-category"
                value={
                  selectedCategoryId
                }
                onChange={(
                  event
                ) =>
                  setSelectedCategoryId(
                    event.target.value
                  )
                }
                disabled={
                  uploading ||
                  categoriesLoading
                }
              >

                <option value="">
                  No category
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


              {!categoriesLoading &&
                categories.length ===
                  0 && (

                <small className="media-uploader__field-note">

                  No active categories
                  are currently available.

                </small>

              )}

            </div>


            {/* =========================================
                ALT TEXT
                ========================================= */}

            <div className="media-uploader__field">

              <label
                htmlFor="media-alt"
              >
                ALT TEXT
              </label>


              <input
                id="media-alt"
                type="text"
                value={
                  altText
                }
                onChange={(
                  event
                ) =>
                  setAltText(
                    event.target.value
                  )
                }
                placeholder={
                  mediaType ===
                  "audio"
                    ? "Optional accessibility description"
                    : "Describe the image or media"
                }
                disabled={
                  uploading
                }
              />

            </div>

          </div>


          {/* =============================================
              PROGRESS
              ============================================= */}

          {uploading && (

            <div className="media-uploader__progress">

              <div>

                <span>
                  Uploading...
                </span>


                <strong>

                  {progress}%

                </strong>

              </div>


              <div className="media-uploader__progress-track">

                <span
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

            </div>

          )}


          {/* =============================================
              ACTION
              ============================================= */}

          <button
            type="button"
            className="media-uploader__upload"
            onClick={
              handleUpload
            }
            disabled={
              uploading
            }
          >

            {uploading
              ? "Uploading..."
              : mediaType ===
                "audio"
              ? "Upload Audio ↗"
              : "Upload Media ↗"}

          </button>

        </div>

      )}


      {/* =================================================
          MESSAGES
          ================================================= */}

      {error && (

        <div className="media-uploader__message media-uploader__message--error">

          {error}

        </div>

      )}


      {success && (

        <div className="media-uploader__message media-uploader__message--success">

          {success}

        </div>

      )}

    </section>

  );

}


/* =========================================================
   DISPLAY MEDIA TYPE
   ========================================================= */

function selectedMediaTypeForDisplay(
  file: File,
  restrictedType?: MediaType
): MediaType {

  return (
    restrictedType ||
    detectMediaType(
      file
    )
  );

}