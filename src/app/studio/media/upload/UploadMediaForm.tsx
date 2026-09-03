"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import "./upload-media.css";

type MediaType =
  | "image"
  | "video"
  | "audio"
  | "document";

type SelectedFile = {
  file: File;
  mediaType: MediaType;
  previewUrl: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
};

const BUCKETS: Record<
  MediaType,
  string
> = {
  image: "aknm-images",
  video: "aknm-videos",
  audio: "aknm-audio",
  document: "aknm-documents",
};


const MAX_FILE_SIZE = {
  image: 50 * 1024 * 1024,
  video: 2 * 1024 * 1024 * 1024,
  audio: 500 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};


function detectMediaType(
  file: File
): MediaType | null {

  if (
    file.type.startsWith(
      "image/"
    )
  ) {
    return "image";
  }

  if (
    file.type.startsWith(
      "video/"
    )
  ) {
    return "video";
  }

  if (
    file.type.startsWith(
      "audio/"
    )
  ) {
    return "audio";
  }

  if (
    file.type ===
      "application/pdf" ||
    file.type.includes(
      "document"
    ) ||
    file.type.includes(
      "word"
    ) ||
    file.type.includes(
      "presentation"
    ) ||
    file.type.includes(
      "spreadsheet"
    ) ||
    file.type ===
      "text/plain"
  ) {
    return "document";
  }

  return null;
}


function createSafeFileName(
  fileName: string
) {
  const extension =
    fileName.includes(".")
      ? "." +
        fileName
          .split(".")
          .pop()
          ?.toLowerCase()
      : "";

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

  const randomPart =
    Math.random()
      .toString(36)
      .substring(
        2,
        10
      );

  return `${baseName || "media"}-${Date.now()}-${randomPart}${extension}`;
}


function formatFileSize(
  bytes: number
) {
  if (
    bytes <
    1024
  ) {
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


function formatDuration(
  seconds: number | null
) {
  if (
    seconds === null ||
    seconds === undefined
  ) {
    return "—";
  }

  const total =
    Math.round(seconds);

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const remaining =
    total % 60;

  if (hours > 0) {
    return `${hours
      .toString()
      .padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remaining
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes
    .toString()
    .padStart(2, "0")}:${remaining
    .toString()
    .padStart(2, "0")}`;
}


function getMediaLabel(
  type: MediaType
) {
  return (
    type.charAt(0).toUpperCase() +
    type.slice(1)
  );
}


export default function UploadMediaForm() {

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [
    selected,
    setSelected,
  ] =
    useState<SelectedFile | null>(
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
    dragging,
    setDragging,
  ] =
    useState(false);

  const [
    analyzing,
    setAnalyzing,
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
    useState(false);


  useEffect(() => {
    return () => {
      if (
        selected?.previewUrl
      ) {
        URL.revokeObjectURL(
          selected.previewUrl
        );
      }
    };
  }, [selected]);


  async function inspectFile(
    file: File
  ) {
    setError("");
    setAnalyzing(true);

    const mediaType =
      detectMediaType(file);

    if (!mediaType) {
      setAnalyzing(false);

      setError(
        "This file type is not supported. Please select an image, video, audio file or document."
      );

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE[
        mediaType
      ]
    ) {
      setAnalyzing(false);

      setError(
        `This ${mediaType} exceeds the maximum allowed file size.`
      );

      return;
    }


    let previewUrl:
      | string
      | null = null;

    let width:
      | number
      | null = null;

    let height:
      | number
      | null = null;

    let duration:
      | number
      | null = null;


    /*
     * IMAGE METADATA
     */

    if (
      mediaType ===
      "image"
    ) {
      previewUrl =
        URL.createObjectURL(
          file
        );

      const image =
        new Image();

      image.src =
        previewUrl;

      await new Promise<void>(
        (resolve) => {
          image.onload = () => {
            width =
              image.naturalWidth;

            height =
              image.naturalHeight;

            resolve();
          };

          image.onerror = () => {
            resolve();
          };
        }
      );
    }


    /*
     * VIDEO METADATA
     */

    if (
      mediaType ===
      "video"
    ) {
      previewUrl =
        URL.createObjectURL(
          file
        );

      const video =
        document.createElement(
          "video"
        );

      video.preload =
        "metadata";

      video.src =
        previewUrl;

      await new Promise<void>(
        (resolve) => {
          video.onloadedmetadata =
            () => {
              width =
                video.videoWidth;

              height =
                video.videoHeight;

              duration =
                video.duration;

              resolve();
            };

          video.onerror = () => {
            resolve();
          };
        }
      );
    }


    /*
     * AUDIO METADATA
     */

    if (
      mediaType ===
      "audio"
    ) {
      previewUrl =
        URL.createObjectURL(
          file
        );

      const audio =
        document.createElement(
          "audio"
        );

      audio.preload =
        "metadata";

      audio.src =
        previewUrl;

      await new Promise<void>(
        (resolve) => {
          audio.onloadedmetadata =
            () => {
              duration =
                audio.duration;

              resolve();
            };

          audio.onerror = () => {
            resolve();
          };
        }
      );
    }


    /*
     * DOCUMENT
     */

    if (
      mediaType ===
      "document"
    ) {
      previewUrl = null;
    }


    if (
      selected?.previewUrl
    ) {
      URL.revokeObjectURL(
        selected.previewUrl
      );
    }


    setSelected({
      file,
      mediaType,
      previewUrl,
      width,
      height,
      duration,
    });


    /*
     * Automatically suggest
     * a title from filename.
     */

    if (!title) {
      const suggestedTitle =
        file.name
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .replace(
            /[-_]+/g,
            " "
          )
          .trim();

      setTitle(
        suggestedTitle
      );
    }


    setAnalyzing(false);
  }


  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      void inspectFile(
        file
      );
    }
  }


  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragging(false);

    const file =
      event.dataTransfer
        .files?.[0];

    if (file) {
      void inspectFile(
        file
      );
    }
  }


  function resetUpload() {

    if (
      selected?.previewUrl
    ) {
      URL.revokeObjectURL(
        selected.previewUrl
      );
    }

    setSelected(null);
    setTitle("");
    setDescription("");
    setAltText("");
    setProgress(0);
    setError("");
    setSuccess(false);

    if (inputRef.current) {
      inputRef.current.value =
        "";
    }
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selected) {
      setError(
        "Please select a file first."
      );

      return;
    }

    if (uploading) {
      return;
    }


    setUploading(true);
    setProgress(5);
    setError("");
    setSuccess(false);


    let uploadedPath:
      | string
      | null = null;

    const supabase =
      createClient();


    try {

      /*
       * GET AUTHENTICATED USER
       */

      const {
        data: {
          user,
        },
        error:
          userError,
      } =
        await supabase.auth.getUser();


      if (
        userError ||
        !user
      ) {
        throw new Error(
          "You must be signed in to upload media."
        );
      }


      setProgress(10);


      /*
       * DETERMINE BUCKET
       */

      const bucket =
        BUCKETS[
          selected.mediaType
        ];


      /*
       * CREATE STORAGE PATH
       *
       * Organizing files by
       * user + year + month.
       */

      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const safeName =
        createSafeFileName(
          selected.file.name
        );


      uploadedPath =
        `${user.id}/${year}/${month}/${safeName}`;


      /*
       * UPLOAD FILE
       */

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(bucket)
          .upload(
            uploadedPath,
            selected.file,
            {
              cacheControl:
                "3600",
              upsert:
                false,
              contentType:
                selected.file.type ||
                undefined,
            }
          );


      if (uploadError) {
        throw new Error(
          uploadError.message
        );
      }


      setProgress(65);


      /*
       * GET PUBLIC URL
       */

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(bucket)
          .getPublicUrl(
            uploadedPath
          );


      const publicUrl =
        publicUrlData
          .publicUrl;


      if (!publicUrl) {
        throw new Error(
          "The file uploaded successfully, but a public URL could not be generated."
        );
      }


      setProgress(75);


      /*
       * CREATE DATABASE RECORD
       */

      const {
        data:
          mediaRecord,
        error:
          databaseError,
      } =
        await supabase
          .from("media")
          .insert({
            owner_id:
              user.id,

            title:
              title.trim() ||
              null,

            description:
              description.trim() ||
              null,

            media_type:
              selected.mediaType,

            storage_bucket:
              bucket,

            storage_path:
              uploadedPath,

            public_url:
              publicUrl,

            thumbnail_url:
              null,

            mime_type:
              selected.file
                .type ||
              null,

            file_size:
              selected.file
                .size,

            width:
              selected.width,

            height:
              selected.height,

            duration_seconds:
              selected.duration,

            alt_text:
              altText.trim() ||
              null,

            metadata: {
              original_name:
                selected.file
                  .name,

              uploaded_from:
                "aknm-studio",

              upload_source:
                "studio",

              bucket,
            },
          })
          .select(
            "id"
          )
          .single();


      /*
       * DATABASE INSERT FAILED
       *
       * Remove physical file
       * to prevent orphaned
       * storage objects.
       */

      if (
        databaseError ||
        !mediaRecord
      ) {

        console.error(
          "Media database insert error:",
          databaseError
        );


        await supabase.storage
          .from(bucket)
          .remove([
            uploadedPath,
          ]);


        throw new Error(
          databaseError?.message ||
            "The file uploaded, but the media record could not be created."
        );
      }


      setProgress(100);
      setSuccess(true);


      /*
       * REDIRECT TO MEDIA DETAIL
       */

      setTimeout(() => {
        window.location.href =
          `/studio/media/${mediaRecord.id}`;
      }, 700);


    } catch (err) {

      console.error(
        "Media upload error:",
        err
      );


      /*
       * If something failed after
       * upload but before the database
       * record was created, clean up.
       */

      if (
        uploadedPath
      ) {

        try {
          const bucket =
            selected
              ? BUCKETS[
                  selected.mediaType
                ]
              : null;

          if (bucket) {
            await supabase.storage
              .from(bucket)
              .remove([
                uploadedPath,
              ]);
          }

        } catch (
          cleanupError
        ) {
          console.error(
            "Storage cleanup error:",
            cleanupError
          );
        }
      }


      setProgress(0);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading the media."
      );

      setUploading(false);
    }
  }


  return (
    <form
      className="upload-media__form"
      onSubmit={
        handleSubmit
      }
    >

      {/* =================================================
          UPLOAD AREA
          ================================================= */}

      <section className="upload-media__section">

        <div className="upload-media__section-heading">

          <div>
            <span>
              01
            </span>
          </div>

          <div>
            <h2>
              Choose your media
            </h2>

            <p>
              Select the original file you
              want to add to AKNM.
            </p>
          </div>

        </div>


        {!selected ? (

          <div
            className={`
              upload-media__dropzone
              ${
                dragging
                  ? "is-dragging"
                  : ""
              }
            `}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragging(false);
            }}
            onDrop={
              handleDrop
            }
            onClick={() =>
              inputRef.current?.click()
            }
          >

            <input
              ref={inputRef}
              type="file"
              hidden
              accept="
                image/*,
                video/*,
                audio/*,
                application/pdf,
                application/msword,
                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                application/vnd.ms-powerpoint,
                application/vnd.openxmlformats-officedocument.presentationml.presentation,
                application/vnd.ms-excel,
                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                text/plain
              "
              onChange={
                handleFileChange
              }
            />


            <div className="upload-media__dropzone-icon">
              +
            </div>

            <strong>
              Drop your file here
            </strong>

            <span>
              or click to browse your computer
            </span>

            <small>
              Images · Videos · Audio · Documents
            </small>

          </div>

        ) : (

          <div className="upload-media__selected">

            <div className="upload-media__selected-preview">

              {selected.mediaType ===
                "image" &&
                selected.previewUrl && (
                  <img
                    src={
                      selected.previewUrl
                    }
                    alt=""
                  />
                )}


              {selected.mediaType ===
                "video" &&
                selected.previewUrl && (
                  <video
                    src={
                      selected.previewUrl
                    }
                    controls
                  />
                )}


              {selected.mediaType ===
                "audio" && (
                  <div className="upload-media__audio-preview">
                    AUDIO
                  </div>
                )}


              {selected.mediaType ===
                "document" && (
                  <div className="upload-media__document-preview">
                    DOC
                  </div>
                )}

            </div>


            <div className="upload-media__selected-info">

              <span className="upload-media__selected-type">
                {getMediaLabel(
                  selected.mediaType
                )}
              </span>

              <strong>
                {selected.file.name}
              </strong>

              <span>
                {formatFileSize(
                  selected.file.size
                )}
              </span>


              <div className="upload-media__selected-meta">

                {selected.width &&
                  selected.height && (
                    <span>
                      {selected.width}
                      {" × "}
                      {selected.height}
                      px
                    </span>
                  )}

                {selected.duration !==
                  null && (
                  <span>
                    {formatDuration(
                      selected.duration
                    )}
                  </span>
                )}

                <span>
                  {selected.file.type ||
                    "Unknown type"}
                </span>

              </div>


              <button
                type="button"
                className="upload-media__replace"
                onClick={() =>
                  inputRef.current?.click()
                }
                disabled={uploading}
              >
                Choose another file
              </button>

              <input
                ref={inputRef}
                type="file"
                hidden
                accept="
                  image/*,
                  video/*,
                  audio/*,
                  application/pdf,
                  application/msword,
                  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                  application/vnd.ms-powerpoint,
                  application/vnd.openxmlformats-officedocument.presentationml.presentation,
                  application/vnd.ms-excel,
                  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                  text/plain
                "
                onChange={
                  handleFileChange
                }
              />

            </div>

          </div>
        )}

        {analyzing && (
          <div className="upload-media__analyzing">
            Analyzing file...
          </div>
        )}

      </section>


      {/* =================================================
          INFORMATION
          ================================================= */}

      {selected && (
        <section className="upload-media__section">

          <div className="upload-media__section-heading">

            <div>
              <span>
                02
              </span>
            </div>

            <div>
              <h2>
                Describe your media
              </h2>

              <p>
                Add information that will help
                you organize and publish this asset.
              </p>
            </div>

          </div>


          <div className="upload-media__fields">

            <label className="upload-media__field">

              <span>
                TITLE
              </span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                placeholder="Give your media a title"
                maxLength={200}
                disabled={uploading}
              />

            </label>


            <label className="upload-media__field">

              <span>
                DESCRIPTION
              </span>

              <textarea
                value={
                  description
                }
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="What is this media about?"
                rows={6}
                maxLength={2000}
                disabled={uploading}
              />

            </label>


            {selected.mediaType ===
              "image" && (
              <label className="upload-media__field">

                <span>
                  ALT TEXT
                </span>

                <textarea
                  value={
                    altText
                  }
                  onChange={(event) =>
                    setAltText(
                      event.target
                        .value
                    )
                  }
                  placeholder="Describe the image for accessibility..."
                  rows={4}
                  maxLength={500}
                  disabled={
                    uploading
                  }
                />

                <small>
                  Alt text improves accessibility
                  and helps describe images to users
                  who cannot see them.
                </small>

              </label>
            )}

          </div>

        </section>
      )}


      {/* =================================================
          STORAGE DESTINATION
          ================================================= */}

      {selected && (
        <section className="upload-media__section">

          <div className="upload-media__section-heading">

            <div>
              <span>
                03
              </span>
            </div>

            <div>
              <h2>
                Storage
              </h2>

              <p>
                AKNM automatically selects the
                appropriate Supabase Storage bucket.
              </p>
            </div>

          </div>


          <div className="upload-media__storage">

            <div>

              <span>
                MEDIA TYPE
              </span>

              <strong>
                {getMediaLabel(
                  selected.mediaType
                )}
              </strong>

            </div>


            <div>

              <span>
                SUPABASE BUCKET
              </span>

              <strong>
                {
                  BUCKETS[
                    selected.mediaType
                  ]
                }
              </strong>

            </div>

          </div>

        </section>
      )}


      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="upload-media__message upload-media__message--error">

          <strong>
            Upload failed
          </strong>

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =================================================
          SUCCESS
          ================================================= */}

      {success && (
        <div className="upload-media__message upload-media__message--success">

          <strong>
            Upload complete
          </strong>

          <span>
            Your media has been added to AKNM.
            Opening the media page...
          </span>

        </div>
      )}


      {/* =================================================
          PROGRESS
          ================================================= */}

      {uploading && (
        <div className="upload-media__progress">

          <div className="upload-media__progress-top">

            <span>
              UPLOADING
            </span>

            <strong>
              {progress}%
            </strong>

          </div>

          <div className="upload-media__progress-track">

            <div
              className="upload-media__progress-bar"
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>

        </div>
      )}


      {/* =================================================
          ACTIONS
          ================================================= */}

      {selected && (
        <div className="upload-media__actions">

          <button
            type="button"
            className="upload-media__cancel"
            onClick={
              resetUpload
            }
            disabled={
              uploading
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="upload-media__submit"
            disabled={
              uploading ||
              analyzing ||
              !selected
            }
          >

            {uploading
              ? "Uploading..."
              : "Upload to AKNM"}

            {!uploading && (
              <span>
                ↗
              </span>
            )}

          </button>

        </div>
      )}

    </form>
  );
}