"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./book-new.css";


/* =========================================================
   TYPES
   ========================================================= */

type BookType =
  | "book"
  | "ebook"
  | "publication"
  | "report"
  | "magazine";


type PricingType =
  | "free"
  | "paid";


type ReadingAccess =
  | "free"
  | "purchase_required";


type DownloadAccess =
  | "not_available"
  | "free"
  | "purchase_required";


type HardcopyStatus =
  | "available"
  | "preorder"
  | "unavailable";


type AudioEdition = {
  id: string;
  title: string;
  media: MediaItem;
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


function getFileExtension(
  filename: string
) {
  const parts =
    filename.split(".");

  return parts.length > 1
    ? parts.pop()?.toLowerCase() || ""
    : "";
}


function formatFileSize(
  bytes: number
) {
  if (
    bytes < 1024
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
    Math.floor(seconds);

  const hours =
    Math.floor(
      total / 3600
    );

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const secs =
    total % 60;

  if (
    hours > 0
  ) {
    return `${hours}:${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;
  }

  return `${minutes}:${String(
    secs
  ).padStart(
    2,
    "0"
  )}`;
}


/* =========================================================
   PAGE
   ========================================================= */

export default function NewBookPage() {

  const router =
    useRouter();


  /*
   * =====================================================
   * BOOK INFORMATION
   * =====================================================
   */

  const [
    title,
    setTitle,
  ] = useState("");


  const [
    slug,
    setSlug,
  ] = useState("");


  const [
    subtitle,
    setSubtitle,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    bookType,
    setBookType,
  ] = useState<BookType>(
    "book"
  );


  /*
   * =====================================================
   * COVER
   * =====================================================
   */

  const [
    coverMedia,
    setCoverMedia,
  ] = useState<MediaItem | null>(
    null
  );


  const [
    showCoverPicker,
    setShowCoverPicker,
  ] = useState(false);


  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false);


  /*
   * =====================================================
   * PDF
   * =====================================================
   */

  const [
    pdfFile,
    setPdfFile,
  ] = useState<File | null>(
    null
  );


  const [
    uploadingPdf,
    setUploadingPdf,
  ] = useState(false);


  const [
    pdfBucket,
    setPdfBucket,
  ] = useState<string | null>(
    null
  );


  const [
    pdfPath,
    setPdfPath,
  ] = useState<string | null>(
    null
  );


  /*
   * =====================================================
   * AUDIO
   * =====================================================
   */

  const [
    audioEditions,
    setAudioEditions,
  ] = useState<AudioEdition[]>(
    []
  );


  const [
    audioPickerOpen,
    setAudioPickerOpen,
  ] = useState(false);


  const [
    uploadingAudio,
    setUploadingAudio,
  ] = useState(false);


  /*
   * =====================================================
   * DIGITAL COMMERCE / ACCESS
   * =====================================================
   */

  const [
    pricingType,
    setPricingType,
  ] = useState<PricingType>(
    "free"
  );


  const [
    price,
    setPrice,
  ] = useState("");


  const [
    currency,
    setCurrency,
  ] = useState("NGN");


  const [
    readingAccess,
    setReadingAccess,
  ] = useState<ReadingAccess>(
    "free"
  );


  const [
    downloadAccess,
    setDownloadAccess,
  ] =
    useState<DownloadAccess>(
      "not_available"
    );


  /*
   * =====================================================
   * HARDCOPY EDITION
   * =====================================================
   */

  const [
    hardcopyAvailable,
    setHardcopyAvailable,
  ] = useState(false);


  const [
    hardcopyPrice,
    setHardcopyPrice,
  ] = useState("");


  const [
    hardcopyCurrency,
    setHardcopyCurrency,
  ] = useState("NGN");


  const [
    hardcopyStatus,
    setHardcopyStatus,
  ] = useState<HardcopyStatus>(
    "available"
  );


  /*
   * =====================================================
   * FORM STATE
   * =====================================================
   */

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =====================================================
     TITLE / SLUG
     ===================================================== */

  function handleTitleChange(
    value: string
  ) {

    setTitle(
      value
    );

    setSlug(
      generateSlug(
        value
      )
    );

  }


  /* =====================================================
     COVER UPLOAD
     ===================================================== */

  async function handleCoverUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      setError(
        "Book covers must be image files."
      );

      return;
    }

    setError("");
    setSuccess("");
    setUploadingCover(
      true
    );

    const supabase =
      createClient();

    try {

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


      const extension =
        getFileExtension(
          file.name
        ) || "jpg";


      const path =
        `${user.id}/books/covers/${crypto.randomUUID()}.${extension}`;


      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "aknm-images"
          )
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            }
          );


      if (
        uploadError
      ) {
        throw new Error(
          uploadError.message
        );
      }


      const {
        data:
          publicData,
      } =
        supabase.storage
          .from(
            "aknm-images"
          )
          .getPublicUrl(
            path
          );


      const {
        data:
          media,

        error:
          mediaError,
      } =
        await supabase
          .from(
            "media"
          )
          .insert({

            owner_id:
              user.id,

            title:
              file.name,

            media_type:
              "image",

            storage_bucket:
              "aknm-images",

            storage_path:
              path,

            public_url:
              publicData.publicUrl,

            mime_type:
              file.type,

            file_size:
              file.size,

            alt_text:
              title.trim() ||
              file.name,

            metadata:
              {},

          })
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
          .single();


      if (
        mediaError ||
        !media
      ) {

        await supabase.storage
          .from(
            "aknm-images"
          )
          .remove([
            path,
          ]);

        throw new Error(
          mediaError?.message ||
          "Could not create media record."
        );

      }


      setCoverMedia(
        media as MediaItem
      );

    } catch (
      err
    ) {

      console.error(
        "Book cover upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload cover."
      );

    } finally {

      setUploadingCover(
        false
      );

    }

  }


  /* =====================================================
     PDF UPLOAD
     ===================================================== */

  async function handlePdfUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }


    if (
      file.type !==
        "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {

      setError(
        "The book file must be a PDF."
      );

      return;
    }


    setError("");
    setSuccess("");
    setUploadingPdf(
      true
    );


    const supabase =
      createClient();


    try {

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
          "You must be signed in."
        );

      }


      const extension =
        getFileExtension(
          file.name
        ) || "pdf";


      const path =
        `${user.id}/books/pdf/${crypto.randomUUID()}.${extension}`;


      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "aknm-documents"
          )
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                "application/pdf",
            }
          );


      if (
        uploadError
      ) {

        throw new Error(
          uploadError.message
        );

      }


      setPdfFile(
        file
      );

      setPdfBucket(
        "aknm-documents"
      );

      setPdfPath(
        path
      );


    } catch (
      err
    ) {

      console.error(
        "Book PDF upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload book PDF."
      );

    } finally {

      setUploadingPdf(
        false
      );

    }

  }


  /* =====================================================
     REMOVE PDF
     ===================================================== */

  async function removePdf() {

    if (
      !pdfPath ||
      !pdfBucket
    ) {

      setPdfFile(
        null
      );

      return;

    }


    const supabase =
      createClient();


    const {
      error:
        removeError,
    } =
      await supabase.storage
        .from(
          pdfBucket
        )
        .remove([
          pdfPath,
        ]);


    if (
      removeError
    ) {

      setError(
        removeError.message
      );

      return;

    }


    setPdfFile(
      null
    );

    setPdfBucket(
      null
    );

    setPdfPath(
      null
    );

  }


  /* =====================================================
     AUDIO UPLOAD
     ===================================================== */

  async function handleAudioUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const files =
      Array.from(
        event.target.files ?? []
      );

    event.target.value =
      "";

    if (
      files.length ===
      0
    ) {
      return;
    }


    setError("");
    setSuccess("");
    setUploadingAudio(
      true
    );


    const supabase =
      createClient();


    try {

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
          "You must be signed in."
        );

      }


      const uploaded:
        AudioEdition[] =
        [];


      for (
        const file of
          files
      ) {

        if (
          !file.type.startsWith(
            "audio/"
          )
        ) {
          continue;
        }


        const extension =
          getFileExtension(
            file.name
          ) || "mp3";


        const path =
          `${user.id}/books/audio/${crypto.randomUUID()}.${extension}`;


        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "aknm-audio"
            )
            .upload(
              path,
              file,
              {
                cacheControl:
                  "3600",

                upsert:
                  false,

                contentType:
                  file.type,
              }
            );


        if (
          uploadError
        ) {

          throw new Error(
            uploadError.message
          );

        }


        const {
          data:
            publicData,
        } =
          supabase.storage
            .from(
              "aknm-audio"
            )
            .getPublicUrl(
              path
            );


        const {
          data:
            media,

          error:
            mediaError,
        } =
          await supabase
            .from(
              "media"
            )
            .insert({

              owner_id:
                user.id,

              title:
                file.name,

              media_type:
                "audio",

              storage_bucket:
                "aknm-audio",

              storage_path:
                path,

              public_url:
                publicData.publicUrl,

              mime_type:
                file.type,

              file_size:
                file.size,

              metadata:
                {},

            })
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
            .single();


        if (
          mediaError ||
          !media
        ) {

          await supabase.storage
            .from(
              "aknm-audio"
            )
            .remove([
              path,
            ]);

          throw new Error(
            mediaError?.message ||
            "Could not create audio media record."
          );

        }


        uploaded.push({

          id:
            crypto.randomUUID(),

          title:
            file.name.replace(
              /\.[^/.]+$/,
              ""
            ),

          media:
            media as MediaItem,

        });

      }


      if (
        uploaded.length ===
        0
      ) {

        throw new Error(
          "No valid audio files were selected."
        );

      }


      setAudioEditions(
        current => [
          ...current,
          ...uploaded,
        ]
      );

    } catch (
      err
    ) {

      console.error(
        "Book audio upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload audio."
      );

    } finally {

      setUploadingAudio(
        false
      );

    }

  }


  /* =====================================================
     ADD AUDIO FROM LIBRARY
     ===================================================== */

  function addAudioFromLibrary(
    media: MediaItem[]
  ) {

    const audio =
      media.filter(
        item =>
          item.media_type ===
          "audio"
      );


    setAudioEditions(
      current => {

        const existingIds =
          new Set(
            current.map(
              item =>
                item.media.id
            )
          );


        const additions =
          audio
            .filter(
              item =>
                !existingIds.has(
                  item.id
                )
            )
            .map(
              item => ({
                id:
                  crypto.randomUUID(),

                title:
                  item.title ||
                  "Audio edition",

                media:
                  item,

              })
            );


        return [
          ...current,
          ...additions,
        ];

      }
    );


    setAudioPickerOpen(
      false
    );

  }


  /* =====================================================
     REMOVE AUDIO
     ===================================================== */

  function removeAudio(
    id: string
  ) {

    setAudioEditions(
      current =>
        current.filter(
          item =>
            item.id !== id
        )
    );

  }


  /* =====================================================
     UPDATE AUDIO TITLE
     ===================================================== */

  function updateAudioTitle(
    id: string,
    value: string
  ) {

    setAudioEditions(
      current =>
        current.map(
          item =>
            item.id === id
              ? {
                  ...item,
                  title:
                    value,
                }
              : item
        )
    );

  }


  /* =====================================================
     SAVE / PUBLISH
     ===================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    publish = false
  ) {

    event.preventDefault();


    setError("");
    setSuccess("");


    if (
      !title.trim()
    ) {

      setError(
        "Please enter a book title."
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
      pricingType ===
        "paid" &&
      (
        !price.trim() ||
        Number(price) <= 0
      )
    ) {

      setError(
        "Enter a valid price for a paid book."
      );

      return;

    }


    /*
     * -----------------------------------------------------
     * HARDCOPY VALIDATION
     * -----------------------------------------------------
     */

    if (
      hardcopyAvailable &&
      (
        !hardcopyPrice.trim() ||
        Number(hardcopyPrice) <= 0
      )
    ) {

      setError(
        "Enter a valid price for the hardcopy edition."
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
          "You must be signed in."
        );

      }


      /* ===============================================
         SLUG
         =============================================== */

      const {
        data:
          existingBook,

        error:
          slugError,

      } =
        await supabase
          .from(
            "books"
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
        slugError
      ) {

        throw new Error(
          slugError.message
        );

      }


      if (
        existingBook
      ) {

        throw new Error(
          "A book with this slug already exists."
        );

      }


      const status =
        publish
          ? "published"
          : "draft";


      const publishedAt =
        publish
          ? new Date()
              .toISOString()
          : null;


      /* ===============================================
         CREATE BOOK
         =============================================== */

      const {
        data:
          book,

        error:
          bookError,

      } =
        await supabase
          .from(
            "books"
          )
          .insert({

            author_id:
              user.id,

            title:
              title.trim(),

            slug:
              slug.trim(),

            subtitle:
              subtitle.trim() ||
              null,

            description:
              description.trim() ||
              null,

            book_type:
              bookType,

            status,

            cover_media_id:
              coverMedia?.id ??
              null,

            published_at:
              publishedAt,

            pdf_bucket:
              pdfBucket,

            pdf_path:
              pdfPath,

            pdf_mime_type:
              pdfFile
                ? "application/pdf"
                : null,

            pdf_file_size:
              pdfFile
                ? pdfFile.size
                : null,

            price:
              pricingType ===
                "paid"
                ? Number(price)
                : null,

            currency,

            pricing_type:
              pricingType,

            reading_access:
              readingAccess,

            download_access:
              downloadAccess,

            /*
             * =================================================
             * HARDCOPY
             * =================================================
             */

            hardcopy_available:
              hardcopyAvailable,

            hardcopy_price:
              hardcopyAvailable
                ? Number(
                    hardcopyPrice
                  )
                : null,

            hardcopy_currency:
              hardcopyAvailable
                ? hardcopyCurrency
                : "NGN",

            hardcopy_status:
              hardcopyAvailable
                ? hardcopyStatus
                : "unavailable",

          })
          .select(
            "id"
          )
          .single();


      if (
        bookError ||
        !book
      ) {

        /*
         * Clean up PDF if the
         * database insert failed.
         */

        if (
          pdfBucket &&
          pdfPath
        ) {

          await supabase.storage
            .from(
              pdfBucket
            )
            .remove([
              pdfPath,
            ]);

        }


        throw new Error(
          bookError?.message ||
          "Could not create book."
        );

      }


      /* ===============================================
         ATTACH AUDIO
         =============================================== */

      if (
        audioEditions.length >
        0
      ) {

        const rows =
          audioEditions.map(
            (
              edition,
              index
            ) => ({

              book_id:
                book.id,

              media_id:
                edition.media.id,

              media_role:
                "audio",

              title:
                edition.title.trim() ||
                edition.media.title ||
                "Audio edition",

              sort_order:
                index,

            })
          );


        const {
          error:
            audioError,

        } =
          await supabase
            .from(
              "book_media"
            )
            .insert(
              rows
            );


        if (
          audioError
        ) {

          await supabase
            .from(
              "books"
            )
            .delete()
            .eq(
              "id",
              book.id
            );


          if (
            pdfBucket &&
            pdfPath
          ) {

            await supabase.storage
              .from(
                pdfBucket
              )
              .remove([
                pdfPath,
              ]);

          }


          throw new Error(
            audioError.message
          );

        }

      }


      /* ===============================================
         SUCCESS
         =============================================== */

      setSuccess(
        publish
          ? "Book published successfully."
          : "Book draft saved successfully."
      );


      setTimeout(
        () => {

          router.push(
            `/studio/books/${book.id}`
          );

          router.refresh();

        },
        500
      );


    } catch (
      err
    ) {

      console.error(
        "Book save error:",
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


  /* =====================================================
     RENDER
     ===================================================== */

  return (

    <main className="book-new-page">

      <header className="book-new-header">

        <div>

          <Link
            href="/studio/books"
            className="book-new-back"
          >
            ← Back to Books
          </Link>

          <span className="book-new-eyebrow">
            AKNM STUDIO / BOOKS
          </span>

          <h1>
            Create a book.
          </h1>

          <p>
            Create, organize and publish
            a new AKNM publication.
          </p>

        </div>

      </header>


      <form
        className="book-new-form"
        onSubmit={
          event =>
            handleSubmit(
              event,
              false
            )
        }
      >

        {/* =================================================
            01 — BOOK INFORMATION
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Book information
              </h2>

              <p>
                Define the basic information
                for this publication.
              </p>

            </div>

          </div>


          <div className="book-new-fields">

            <label>

              <span>
                TITLE
              </span>

              <input
                type="text"
                value={title}
                onChange={
                  event =>
                    handleTitleChange(
                      event.target.value
                    )
                }
                placeholder="Enter book title..."
                disabled={
                  saving ||
                  uploadingCover ||
                  uploadingAudio ||
                  uploadingPdf
                }
              />

            </label>


            <label>

              <span>
                SLUG
              </span>

              <input
                type="text"
                value={slug}
                onChange={
                  event =>
                    setSlug(
                      generateSlug(
                        event.target.value
                      )
                    )
                }
                placeholder="book-slug"
                disabled={
                  saving
                }
              />

            </label>


            <label>

              <span>
                PUBLICATION TYPE
              </span>

              <select
                value={bookType}
                onChange={
                  event =>
                    setBookType(
                      event.target.value as BookType
                    )
                }
                disabled={
                  saving
                }
              >

                <option value="book">
                  Book
                </option>

                <option value="ebook">
                  eBook
                </option>

                <option value="publication">
                  Publication
                </option>

                <option value="report">
                  Report
                </option>

                <option value="magazine">
                  Magazine
                </option>

              </select>

            </label>


            <label>

              <span>
                SUBTITLE
              </span>

              <input
                type="text"
                value={subtitle}
                onChange={
                  event =>
                    setSubtitle(
                      event.target.value
                    )
                }
                placeholder="Optional subtitle..."
                disabled={
                  saving
                }
              />

            </label>


            <label>

              <span>
                DESCRIPTION
              </span>

              <textarea
                value={description}
                onChange={
                  event =>
                    setDescription(
                      event.target.value
                    )
                }
                placeholder="Describe this book..."
                rows={8}
                disabled={
                  saving
                }
              />

            </label>

          </div>

        </section>


        {/* =================================================
            02 — COVER
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                Book cover
              </h2>

              <p>
                Upload a new cover or choose
                an existing image from your
                media library.
              </p>

            </div>

          </div>


          {coverMedia ? (

            <div className="book-new-selected-cover">

              <div className="book-new-cover-preview">

                {coverMedia.public_url && (

                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      title ||
                      "Book cover"
                    }
                  />

                )}

              </div>


              <div className="book-new-cover-info">

                <strong>
                  {
                    coverMedia.title ||
                    "Book cover"
                  }
                </strong>

                <small>
                  Cover image
                </small>

              </div>


              <button
                type="button"
                onClick={() =>
                  setCoverMedia(
                    null
                  )
                }
                disabled={
                  saving ||
                  uploadingCover
                }
              >
                Remove
              </button>

            </div>

          ) : (

            <div className="book-new-cover-options">

              <button
                type="button"
                className="book-new-cover-option"
                onClick={() =>
                  setShowCoverPicker(
                    true
                  )
                }
                disabled={
                  saving ||
                  uploadingCover
                }
              >

                <span>
                  +
                </span>

                <strong>
                  Media Library
                </strong>

                <small>
                  Choose an existing cover
                </small>

              </button>


              <label className="book-new-cover-option">

                <span>
                  ↑
                </span>

                <strong>
                  {
                    uploadingCover
                      ? "Uploading..."
                      : "Upload Cover"
                  }
                </strong>

                <small>
                  Upload a new image
                </small>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleCoverUpload
                  }
                  disabled={
                    saving ||
                    uploadingCover
                  }
                />

              </label>

            </div>

          )}

        </section>


        {/* =================================================
            03 — BOOK FILE
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Book file
              </h2>

              <p>
                Upload the actual publication
                file that readers will access.
              </p>

            </div>

          </div>


          {pdfFile ? (

            <div className="book-new-pdf-selected">

              <div className="book-new-pdf-icon">
                PDF
              </div>


              <div className="book-new-pdf-info">

                <strong>
                  {pdfFile.name}
                </strong>

                <small>
                  PDF ·{" "}
                  {formatFileSize(
                    pdfFile.size
                  )}
                </small>

              </div>


              <button
                type="button"
                onClick={
                  removePdf
                }
                disabled={
                  saving ||
                  uploadingPdf
                }
              >
                Remove
              </button>

            </div>

          ) : (

            <label className="book-new-pdf-upload">

              <span>
                ↑
              </span>

              <strong>
                {
                  uploadingPdf
                    ? "Uploading PDF..."
                    : "Upload Book PDF"
                }
              </strong>

              <small>
                PDF files only
              </small>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={
                  handlePdfUpload
                }
                disabled={
                  saving ||
                  uploadingPdf
                }
              />

            </label>

          )}

        </section>


        {/* =================================================
            04 — PRICING & ACCESS
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              04
            </span>

            <div>

              <h2>
                Pricing & access
              </h2>

              <p>
                Control how this publication
                can be read and downloaded.
              </p>

            </div>

          </div>


          <div className="book-new-fields">

            <div className="book-new-two-columns">

              <label>

                <span>
                  PRICING
                </span>

                <select
                  value={
                    pricingType
                  }
                  onChange={
                    event =>
                      setPricingType(
                        event.target.value as PricingType
                      )
                  }
                  disabled={
                    saving
                  }
                >

                  <option value="free">
                    Free
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                </select>

              </label>


              <label>

                <span>
                  CURRENCY
                </span>

                <select
                  value={
                    currency
                  }
                  onChange={
                    event =>
                      setCurrency(
                        event.target.value
                      )
                  }
                  disabled={
                    saving ||
                    pricingType ===
                      "free"
                  }
                >

                  <option value="NGN">
                    Nigerian Naira (₦)
                  </option>

                  <option value="USD">
                    US Dollar ($)
                  </option>

                  <option value="GBP">
                    British Pound (£)
                  </option>

                  <option value="EUR">
                    Euro (€)
                  </option>

                </select>

              </label>

            </div>


            {pricingType ===
              "paid" && (

              <label>

                <span>
                  PRICE
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    price
                  }
                  onChange={
                    event =>
                      setPrice(
                        event.target.value
                      )
                  }
                  placeholder="0.00"
                  disabled={
                    saving
                  }
                />

              </label>

            )}


            <label>

              <span>
                READING ACCESS
              </span>

              <select
                value={
                  readingAccess
                }
                onChange={
                  event =>
                    setReadingAccess(
                      event.target.value as ReadingAccess
                    )
                }
                disabled={
                  saving
                }
              >

                <option value="free">
                  Free to read
                </option>

                <option value="purchase_required">
                  Purchase required
                </option>

              </select>

            </label>


            <label>

              <span>
                DOWNLOAD ACCESS
              </span>

              <select
                value={
                  downloadAccess
                }
                onChange={
                  event =>
                    setDownloadAccess(
                      event.target.value as DownloadAccess
                    )
                }
                disabled={
                  saving
                }
              >

                <option value="not_available">
                  Download unavailable
                </option>

                <option value="free">
                  Free download
                </option>

                <option value="purchase_required">
                  Purchase required
                </option>

              </select>

            </label>

          </div>

        </section>


        {/* =================================================
            05 — HARDCOPY EDITION
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              05
            </span>

            <div>

              <h2>
                Hardcopy edition
              </h2>

              <p>
                Offer a physical printed edition
                that customers can order through
                AKNM.PRO.
              </p>

            </div>

          </div>


          {/* =================================================
              ENABLE HARDCOPY
              ================================================= */}

          <div className="book-new-hardcopy-toggle">

            <label className="book-new-switch">

              <input
                type="checkbox"
                checked={
                  hardcopyAvailable
                }
                onChange={
                  event =>
                    setHardcopyAvailable(
                      event.target.checked
                    )
                }
                disabled={
                  saving
                }
              />

              <span className="book-new-switch__track">

                <span className="book-new-switch__thumb" />

              </span>

            </label>


            <div>

              <strong>
                Offer a hardcopy edition
              </strong>

              <p>
                Customers will be able to order
                a physical copy of this publication.
              </p>

            </div>

          </div>


          {/* =================================================
              HARDCOPY SETTINGS
              ================================================= */}

          {hardcopyAvailable && (

            <div className="book-new-fields">

              <div className="book-new-two-columns">

                <label>

                  <span>
                    HARDCOPY PRICE
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      hardcopyPrice
                    }
                    onChange={
                      event =>
                        setHardcopyPrice(
                          event.target.value
                        )
                    }
                    placeholder="0.00"
                    disabled={
                      saving
                    }
                  />

                </label>


                <label>

                  <span>
                    CURRENCY
                  </span>

                  <select
                    value={
                      hardcopyCurrency
                    }
                    onChange={
                      event =>
                        setHardcopyCurrency(
                          event.target.value
                        )
                    }
                    disabled={
                      saving
                    }
                  >

                    <option value="NGN">
                      Nigerian Naira (₦)
                    </option>

                    <option value="USD">
                      US Dollar ($)
                    </option>

                    <option value="GBP">
                      British Pound (£)
                    </option>

                    <option value="EUR">
                      Euro (€)
                    </option>

                  </select>

                </label>

              </div>


              <label>

                <span>
                  ORDER STATUS
                </span>

                <select
                  value={
                    hardcopyStatus
                  }
                  onChange={
                    event =>
                      setHardcopyStatus(
                        event.target.value as HardcopyStatus
                      )
                  }
                  disabled={
                    saving
                  }
                >

                  <option value="available">
                    Available for order
                  </option>

                  <option value="preorder">
                    Available for pre-order
                  </option>

                  <option value="unavailable">
                    Temporarily unavailable
                  </option>

                </select>

              </label>


              {/* =================================================
                  HARDCOPY INFORMATION CARD
                  ================================================= */}

              <div className="book-new-hardcopy-note">

                <div className="book-new-hardcopy-note__mark">
                  PRINT
                </div>


                <div>

                  <strong>
                    Physical edition enabled
                  </strong>

                  <p>
                    Customers will see a separate
                    hardcopy option on the public
                    book page. Payment and delivery
                    details will be collected during
                    hardcopy checkout.
                  </p>

                </div>

              </div>

            </div>

          )}

        </section>


        {/* =================================================
            06 — AUDIO
            ================================================= */}

        <section className="book-new-section">

          <div className="book-new-section-heading">

            <span>
              06
            </span>

            <div>

              <h2>
                Audio editions
              </h2>

              <p>
                Add the audiobook or individual
                audio editions associated with
                this book.
              </p>

            </div>

          </div>


          {audioEditions.length >
            0 && (

            <div className="book-new-audio-list">

              {audioEditions.map(
                (
                  edition,
                  index
                ) => (

                  <div
                    key={
                      edition.id
                    }
                    className="book-new-audio-item"
                  >

                    <div className="book-new-audio-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    <div className="book-new-audio-main">

                      <input
                        type="text"
                        value={
                          edition.title
                        }
                        onChange={
                          event =>
                            updateAudioTitle(
                              edition.id,
                              event.target.value
                            )
                        }
                        placeholder="Audio edition title"
                        disabled={
                          saving
                        }
                      />


                      <div className="book-new-audio-meta">

                        <span>
                          {
                            edition.media
                              .mime_type ||
                            "AUDIO"
                          }
                        </span>

                        <span>
                          /
                        </span>

                        <span>
                          {
                            formatDuration(
                              edition.media
                                .duration_seconds
                            )
                          }
                        </span>

                        <span>
                          /
                        </span>

                        <span>
                          {
                            edition.media
                              .title ||
                            "Audio file"
                          }
                        </span>

                      </div>

                    </div>


                    <button
                      type="button"
                      className="book-new-audio-remove"
                      onClick={() =>
                        removeAudio(
                          edition.id
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

          )}


          <div className="book-new-audio-actions">

            <button
              type="button"
              className="book-new-audio-add"
              onClick={() =>
                setAudioPickerOpen(
                  true
                )
              }
              disabled={
                saving ||
                uploadingAudio
              }
            >

              <span>
                +
              </span>

              Add from Media Library

            </button>


            <label className="book-new-audio-upload">

              <span>
                ↑
              </span>

              {
                uploadingAudio
                  ? "Uploading..."
                  : "Upload Audio"
              }

              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={
                  handleAudioUpload
                }
                disabled={
                  saving ||
                  uploadingAudio
                }
              />

            </label>

          </div>

        </section>


        {/* =================================================
            MESSAGES
            ================================================= */}

        {error && (

          <div className="book-new-message book-new-message--error">
            {error}
          </div>

        )}


        {success && (

          <div className="book-new-message book-new-message--success">
            {success}
          </div>

        )}


        {/* =================================================
            ACTIONS
            ================================================= */}

        <footer className="book-new-actions">

          <Link
            href="/studio/books"
            className="book-new-cancel"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="book-new-draft"
            disabled={
              saving ||
              uploadingCover ||
              uploadingAudio ||
              uploadingPdf
            }
          >

            {saving
              ? "Saving..."
              : "Save Draft"}

          </button>


          <button
            type="button"
            className="book-new-publish"
            disabled={
              saving ||
              uploadingCover ||
              uploadingAudio ||
              uploadingPdf
            }
            onClick={
              event =>
                handleSubmit(
                  event as unknown as FormEvent<HTMLFormElement>,
                  true
                )
            }
          >

            {saving
              ? "Publishing..."
              : "Publish"}

            {!saving && (
              <span>
                ↗
              </span>
            )}

          </button>

        </footer>

      </form>


      {/* =================================================
          COVER PICKER
          ================================================= */}

      {showCoverPicker && (

        <div className="book-new-modal">

          <div
            className="book-new-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
          />

          <div className="book-new-modal__panel">

            <MediaPicker
              mode="cover"
              selectedIds={
                coverMedia
                  ? [
                      coverMedia.id,
                    ]
                  : []
              }
              onChange={
                media => {

                  setCoverMedia(
                    media[0] ??
                    null
                  );

                  setShowCoverPicker(
                    false
                  );

                }
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
          AUDIO PICKER
          ================================================= */}

      {audioPickerOpen && (

        <div className="book-new-modal">

          <div
            className="book-new-modal__backdrop"
            onClick={() =>
              setAudioPickerOpen(
                false
              )
            }
          />

          <div className="book-new-modal__panel">

            <MediaPicker
              mode="multiple"
              mediaType="audio"
              selectedIds={
                audioEditions.map(
                  edition =>
                    edition.media.id
                )
              }
              onChange={
                addAudioFromLibrary
              }
              onClose={() =>
                setAudioPickerOpen(
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