"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import MediaPicker, {
  MediaItem,
} from "@/components/Studio/MediaPicker/MediaPicker";

import "./book-edit.css";


/* =========================================================
   TYPES
   ========================================================= */

type BookType =
  | "book"
  | "ebook"
  | "publication"
  | "report"
  | "magazine";

type BookStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "archived";

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
  bytes: number | null
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
  }

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

export default function EditBookPage() {

  const router =
    useRouter();

  const params =
    useParams();


  const bookId =
    typeof params.id ===
    "string"
      ? params.id
      : "";


  /* =======================================================
     LOADING / SAVING
     ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    uploadingCover,
    setUploadingCover,
  ] = useState(false);


  const [
    uploadingPdf,
    setUploadingPdf,
  ] = useState(false);


  const [
    uploadingAudio,
    setUploadingAudio,
  ] = useState(false);


  /* =======================================================
     BOOK INFORMATION
     ======================================================= */

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


  const [
    status,
    setStatus,
  ] = useState<BookStatus>(
    "draft"
  );


  /* =======================================================
     COVER
     ======================================================= */

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


  /* =======================================================
     PDF
     ======================================================= */

  const [
    pdfFile,
    setPdfFile,
  ] = useState<File | null>(
    null
  );


  const [
    existingPdfBucket,
    setExistingPdfBucket,
  ] = useState<string | null>(
    null
  );


  const [
    existingPdfPath,
    setExistingPdfPath,
  ] = useState<string | null>(
    null
  );


  const [
    existingPdfMimeType,
    setExistingPdfMimeType,
  ] = useState<string | null>(
    null
  );


  const [
    existingPdfFileSize,
    setExistingPdfFileSize,
  ] = useState<number | null>(
    null
  );


  const [
    originalPdfBucket,
    setOriginalPdfBucket,
  ] = useState<string | null>(
    null
  );


  const [
    originalPdfPath,
    setOriginalPdfPath,
  ] = useState<string | null>(
    null
  );


  const [
    pdfRemoved,
    setPdfRemoved,
  ] = useState(false);


  /* =======================================================
     AUDIO
     ======================================================= */

  const [
    audioEditions,
    setAudioEditions,
  ] = useState<AudioEdition[]>(
    []
  );


  const [
    showAudioPicker,
    setShowAudioPicker,
  ] = useState(false);


  /* =======================================================
     PRICING / ACCESS
     ======================================================= */

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


  /* =======================================================
     HARDCOPY EDITION
     ======================================================= */

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
    "unavailable"
  );


  /* =======================================================
     MESSAGES
     ======================================================= */

  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =========================================================
     LOAD BOOK
     ========================================================= */

  useEffect(
    () => {

      if (
        !bookId
      ) {
        return;
      }


      let cancelled =
        false;


      async function loadBook() {

        setLoading(true);
        setError("");


        const supabase =
          createClient();


        try {

          const {
            data: book,
            error: bookError,
          } =
            await supabase
              .from("books")
              .select(`
                id,
                title,
                slug,
                subtitle,
                description,
                book_type,
                status,
                cover_media_id,

                pdf_bucket,
                pdf_path,
                pdf_mime_type,
                pdf_file_size,

                price,
                currency,
                pricing_type,
                reading_access,
                download_access,

                hardcopy_available,
                hardcopy_price,
                hardcopy_currency,
                hardcopy_status
              `)
              .eq(
                "id",
                bookId
              )
              .maybeSingle();


          if (
            bookError
          ) {

            throw new Error(
              bookError.message
            );

          }


          if (
            !book
          ) {

            throw new Error(
              "Book not found."
            );

          }


          if (
            cancelled
          ) {
            return;
          }


          /* =============================================
             BASIC INFORMATION
             ============================================= */

          setTitle(
            book.title ??
            ""
          );


          setSlug(
            book.slug ??
            ""
          );


          setSubtitle(
            book.subtitle ??
            ""
          );


          setDescription(
            book.description ??
            ""
          );


          setBookType(
            book.book_type as BookType
          );


          setStatus(
            book.status as BookStatus
          );


          /* =============================================
             PRICING
             ============================================= */

          setPricingType(
            (
              book.pricing_type ||
              "free"
            ) as PricingType
          );


          setPrice(
            book.price !== null &&
            book.price !== undefined
              ? String(
                  book.price
                )
              : ""
          );


          setCurrency(
            book.currency ||
            "NGN"
          );


          setReadingAccess(
            (
              book.reading_access ||
              "free"
            ) as ReadingAccess
          );


          setDownloadAccess(
            (
              book.download_access ||
              "not_available"
            ) as DownloadAccess
          );


          /* =============================================
             HARDCOPY EDITION
             ============================================= */

          setHardcopyAvailable(
            Boolean(
              book.hardcopy_available
            )
          );


          setHardcopyPrice(
            book.hardcopy_price !==
              null &&
            book.hardcopy_price !==
              undefined
              ? String(
                  book.hardcopy_price
                )
              : ""
          );


          setHardcopyCurrency(
            book.hardcopy_currency ||
            "NGN"
          );


          setHardcopyStatus(
            (
              book.hardcopy_status ||
              (
                book.hardcopy_available
                  ? "available"
                  : "unavailable"
              )
            ) as HardcopyStatus
          );


          /* =============================================
             EXISTING PDF
             ============================================= */

          const loadedPdfBucket =
            book.pdf_bucket ??
            null;

          const loadedPdfPath =
            book.pdf_path ??
            null;


          setExistingPdfBucket(
            loadedPdfBucket
          );


          setExistingPdfPath(
            loadedPdfPath
          );


          setOriginalPdfBucket(
            loadedPdfBucket
          );


          setOriginalPdfPath(
            loadedPdfPath
          );


          setExistingPdfMimeType(
            book.pdf_mime_type ??
            null
          );


          setExistingPdfFileSize(
            book.pdf_file_size ??
            null
          );


          setPdfFile(
            null
          );


          setPdfRemoved(
            false
          );


          /* =============================================
             COVER
             ============================================= */

          if (
            book.cover_media_id
          ) {

            const {
              data: cover,
              error: coverError,
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
                  book.cover_media_id
                )
                .maybeSingle();


            if (
              coverError
            ) {

              throw new Error(
                coverError.message
              );

            }


            if (
              !cancelled
            ) {

              setCoverMedia(
                cover as MediaItem | null
              );

            }

          } else {

            setCoverMedia(
              null
            );

          }


          /* =============================================
             AUDIO
             ============================================= */

          const {
            data: bookMedia,
            error: mediaError,
          } =
            await supabase
              .from("book_media")
              .select(`
                id,
                media_id,
                media_role,
                title,
                sort_order,
                media (
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
                )
              `)
              .eq(
                "book_id",
                bookId
              )
              .eq(
                "media_role",
                "audio"
              )
              .order(
                "sort_order",
                {
                  ascending:
                    true,
                }
              );


          if (
            mediaError
          ) {

            throw new Error(
              mediaError.message
            );

          }


          const editions:
            AudioEdition[] =
            [];


          for (
            const item of
              bookMedia ?? []
          ) {

            const mediaValue =
              Array.isArray(
                item.media
              )
                ? item.media[0]
                : item.media;


            if (
              !mediaValue
            ) {
              continue;
            }


            editions.push({

              id:
                item.id,

              title:
                item.title ||
                mediaValue.title ||
                "Audio edition",

              media:
                mediaValue as MediaItem,

            });

          }


          if (
            !cancelled
          ) {

            setAudioEditions(
              editions
            );

          }

        } catch (
          err
        ) {

          console.error(
            "Book edit load error:",
            err
          );


          if (
            !cancelled
          ) {

            setError(
              err instanceof Error
                ? err.message
                : "Could not load book."
            );

          }

        } finally {

          if (
            !cancelled
          ) {

            setLoading(
              false
            );

          }

        }

      }


      void loadBook();


      return () => {

        cancelled =
          true;

      };

    },
    [bookId]
  );


  /* =========================================================
     TITLE
     ========================================================= */

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


  /* =========================================================
     COVER UPLOAD
     ========================================================= */

  async function handleCoverUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    event.target.value =
      "";


    if (
      !file
    ) {
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


  /* =========================================================
     PDF UPLOAD
     ========================================================= */

  async function handlePdfUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    event.target.value =
      "";


    if (
      !file
    ) {
      return;
    }


    const isPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(
          ".pdf"
        );


    if (
      !isPdf
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


      setExistingPdfBucket(
        "aknm-documents"
      );


      setExistingPdfPath(
        path
      );


      setExistingPdfMimeType(
        "application/pdf"
      );


      setExistingPdfFileSize(
        file.size
      );


      setPdfRemoved(
        false
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


  /* =========================================================
     REMOVE PDF
     ========================================================= */

  function removePdf() {

    setError("");
    setSuccess("");


    setPdfFile(
      null
    );


    setExistingPdfBucket(
      null
    );


    setExistingPdfPath(
      null
    );


    setExistingPdfMimeType(
      null
    );


    setExistingPdfFileSize(
      null
    );


    setPdfRemoved(
      true
    );

  }


  /* =========================================================
     AUDIO UPLOAD
     ========================================================= */

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


  /* =========================================================
     ADD AUDIO FROM LIBRARY
     ========================================================= */

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


    setShowAudioPicker(
      false
    );

  }


  /* =========================================================
     REMOVE AUDIO
     ========================================================= */

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


  /* =========================================================
     UPDATE AUDIO TITLE
     ========================================================= */

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


  /* =========================================================
     SAVE
     ========================================================= */

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


    const previousPdfBucket =
      originalPdfBucket;

    const previousPdfPath =
      originalPdfPath;


    const stagedPdfBucket =
      pdfRemoved
        ? null
        : existingPdfBucket;

    const stagedPdfPath =
      pdfRemoved
        ? null
        : existingPdfPath;

    const stagedPdfMimeType =
      pdfRemoved
        ? null
        : existingPdfMimeType;

    const stagedPdfFileSize =
      pdfRemoved
        ? null
        : existingPdfFileSize;


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
          .neq(
            "id",
            bookId
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


      /* ===============================================
         STATUS
         =============================================== */

      const nextStatus =
        publish
          ? "published"
          : status;


      const publishedAt =
        nextStatus ===
          "published"
          ? new Date()
              .toISOString()
          : nextStatus ===
              "draft"
            ? null
            : undefined;


      /* ===============================================
         BOOK UPDATE
         =============================================== */

      const updatePayload: {
        title: string;
        slug: string;
        subtitle: string | null;
        description: string | null;
        book_type: BookType;
        status: BookStatus;
        cover_media_id: string | null;

        pdf_bucket: string | null;
        pdf_path: string | null;
        pdf_mime_type: string | null;
        pdf_file_size: number | null;

        price: number | null;
        currency: string;
        pricing_type: PricingType;
        reading_access: ReadingAccess;
        download_access: DownloadAccess;

        hardcopy_available: boolean;
        hardcopy_price: number | null;
        hardcopy_currency: string;
        hardcopy_status: HardcopyStatus;

        published_at?: string | null;
      } = {

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

        status:
          nextStatus,

        cover_media_id:
          coverMedia?.id ??
          null,


        pdf_bucket:
          stagedPdfBucket,

        pdf_path:
          stagedPdfPath,

        pdf_mime_type:
          stagedPdfMimeType,

        pdf_file_size:
          stagedPdfFileSize,


        price:
          pricingType ===
            "paid"
            ? Number(
                price
              )
            : null,

        currency,

        pricing_type:
          pricingType,

        reading_access:
          readingAccess,

        download_access:
          downloadAccess,


        /* =============================================
           HARDCOPY
           ============================================= */

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

      };


      if (
        publishedAt !==
        undefined
      ) {

        updatePayload.published_at =
          publishedAt;

      }


      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "books"
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            bookId
          );


      if (
        updateError
      ) {

        throw new Error(
          updateError.message
        );

      }


      /* ===============================================
         SYNC AUDIO
         =============================================== */

      const {
        error:
          deleteMediaError,
      } =
        await supabase
          .from(
            "book_media"
          )
          .delete()
          .eq(
            "book_id",
            bookId
          )
          .eq(
            "media_role",
            "audio"
          );


      if (
        deleteMediaError
      ) {

        throw new Error(
          deleteMediaError.message
        );

      }


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
                bookId,

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

          throw new Error(
            audioError.message
          );

        }

      }


      /* ===============================================
         CLEAN UP PREVIOUS PDF
         =============================================== */

      const pdfChanged =
        previousPdfBucket !==
          stagedPdfBucket ||
        previousPdfPath !==
          stagedPdfPath;


      if (
        pdfChanged &&
        previousPdfBucket &&
        previousPdfPath
      ) {

        const {
          error:
            oldPdfError,
        } =
          await supabase.storage
            .from(
              previousPdfBucket
            )
            .remove([
              previousPdfPath,
            ]);


        if (
          oldPdfError
        ) {

          console.warn(
            "Could not remove previous book PDF:",
            oldPdfError
          );

        }

      }


      /* ===============================================
         SUCCESS
         =============================================== */

      setSuccess(
        nextStatus ===
          "published"
          ? "Book published successfully."
          : "Book updated successfully."
      );


      setOriginalPdfBucket(
        stagedPdfBucket
      );


      setOriginalPdfPath(
        stagedPdfPath
      );


      setPdfRemoved(
        false
      );


      setTimeout(
        () => {

          router.push(
            `/studio/books/${bookId}`
          );

          router.refresh();

        },
        500
      );


    } catch (
      err
    ) {

      console.error(
        "Book update error:",
        err
      );


      const stagedIsNewPdf =
        Boolean(
          stagedPdfBucket &&
          stagedPdfPath &&
          (
            stagedPdfBucket !==
              previousPdfBucket ||
            stagedPdfPath !==
              previousPdfPath
          )
        );


      if (
        stagedIsNewPdf &&
        stagedPdfBucket &&
        stagedPdfPath
      ) {

        await supabase.storage
          .from(
            stagedPdfBucket
          )
          .remove([
            stagedPdfPath,
          ]);

      }


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

      <main className="book-edit-page">

        <div className="book-edit-loading">
          Loading book...
        </div>

      </main>

    );

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <main className="book-edit-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="book-edit-header">

        <div>

          <Link
            href={`/studio/books/${bookId}`}
            className="book-edit-back"
          >
            ← Back to Book
          </Link>


          <span className="book-edit-eyebrow">
            AKNM STUDIO / BOOKS / EDIT
          </span>


          <h1>
            Edit book.
          </h1>


          <p>
            Update the publication,
            file, cover, pricing,
            access, hardcopy and
            audio editions.
          </p>

        </div>

      </header>


      {/* =================================================
          FORM
          ================================================= */}

      <form
        className="book-edit-form"
        onSubmit={
          event =>
            handleSubmit(
              event,
              false
            )
        }
      >

        {/* =================================================
            01 — INFORMATION
            ================================================= */}

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Book information
              </h2>

              <p>
                Update the publication
                information.
              </p>

            </div>

          </div>


          <div className="book-edit-fields">

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
                disabled={
                  saving
                }
              />

            </label>


            <div className="book-edit-two-columns">

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
                  STATUS
                </span>

                <select
                  value={status}
                  onChange={
                    event =>
                      setStatus(
                        event.target.value as BookStatus
                      )
                  }
                  disabled={
                    saving
                  }
                >

                  <option value="draft">
                    Draft
                  </option>

                  <option value="scheduled">
                    Scheduled
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="archived">
                    Archived
                  </option>

                </select>

              </label>

            </div>


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
                rows={9}
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

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                Book cover
              </h2>

              <p>
                Replace or remove the
                publication cover.
              </p>

            </div>

          </div>


          {coverMedia ? (

            <div className="book-edit-cover-selected">

              <div className="book-edit-cover-preview">

                {coverMedia.public_url && (

                  <img
                    src={
                      coverMedia.public_url
                    }
                    alt={
                      coverMedia.alt_text ||
                      coverMedia.title ||
                      title
                    }
                  />

                )}

              </div>


              <div className="book-edit-cover-info">

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

            <div className="book-edit-cover-options">

              <button
                type="button"
                className="book-edit-option"
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
                  Choose an existing image
                </small>

              </button>


              <label className="book-edit-option">

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

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              03
            </span>

            <div>

              <h2>
                Book file
              </h2>

              <p>
                Manage the PDF publication
                file associated with this book.
              </p>

            </div>

          </div>


          {!pdfRemoved &&
            (
              pdfFile ||
              existingPdfPath
            ) ? (

            <div className="book-edit-pdf-selected">

              <div className="book-edit-pdf-icon">
                PDF
              </div>


              <div className="book-edit-pdf-info">

                <strong>

                  {pdfFile
                    ? pdfFile.name
                    : "Book PDF"}

                </strong>


                <small>

                  {
                    pdfFile
                      ? `PDF · ${formatFileSize(
                          pdfFile.size
                        )}`
                      : `${
                          existingPdfMimeType ||
                          "application/pdf"
                        } · ${formatFileSize(
                          existingPdfFileSize
                        )}`
                  }

                </small>

              </div>


              <div className="book-edit-pdf-actions">

                <label className="book-edit-pdf-replace">

                  {
                    uploadingPdf
                      ? "Uploading..."
                      : "Replace"
                  }

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

            </div>

          ) : (

            <label className="book-edit-pdf-upload">

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

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              04
            </span>

            <div>

              <h2>
                Pricing & access
              </h2>

              <p>
                Control the commercial model
                and reader permissions.
              </p>

            </div>

          </div>


          <div className="book-edit-fields">

            <div className="book-edit-two-columns">

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

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              05
            </span>

            <div>

              <h2>
                Hardcopy edition
              </h2>

              <p>
                Make a physical edition available
                for readers to order.
              </p>

            </div>

          </div>


          <div className="book-edit-hardcopy">

            <div className="book-edit-hardcopy-toggle">

              <div>

                <strong>
                  Offer a hardcopy edition
                </strong>

                <small>
                  Readers can order a physical
                  copy of this publication.
                </small>

              </div>


              <button
                type="button"
                className={
                  hardcopyAvailable
                    ? "book-edit-switch book-edit-switch--active"
                    : "book-edit-switch"
                }
                onClick={() =>
                  setHardcopyAvailable(
                    current =>
                      !current
                  )
                }
                disabled={
                  saving
                }
                aria-pressed={
                  hardcopyAvailable
                }
              >

                <span />

              </button>

            </div>


            {hardcopyAvailable && (

              <div className="book-edit-fields book-edit-hardcopy-fields">

                <div className="book-edit-two-columns">

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
                    AVAILABILITY
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


                <div className="book-edit-hardcopy-note">

                  <strong>
                    Physical edition enabled
                  </strong>

                  <p>
                    Readers will see an option to
                    order a physical copy from the
                    public book page. Payment and
                    delivery details will be collected
                    during checkout.
                  </p>

                </div>

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            06 — AUDIO
            ================================================= */}

        <section className="book-edit-section">

          <div className="book-edit-section-heading">

            <span>
              06
            </span>

            <div>

              <h2>
                Audio editions
              </h2>

              <p>
                Manage audiobook and other
                audio versions of this book.
              </p>

            </div>

          </div>


          {audioEditions.length >
            0 && (

            <div className="book-edit-audio-list">

              {audioEditions.map(
                (
                  edition,
                  index
                ) => (

                  <div
                    key={
                      edition.id
                    }
                    className="book-edit-audio-item"
                  >

                    <div className="book-edit-audio-number">

                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}

                    </div>


                    <div className="book-edit-audio-main">

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
                        disabled={
                          saving
                        }
                      />


                      <div className="book-edit-audio-meta">

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
                      className="book-edit-audio-remove"
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


          <div className="book-edit-audio-actions">

            <button
              type="button"
              className="book-edit-option"
              onClick={() =>
                setShowAudioPicker(
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

              <strong>
                Media Library
              </strong>

              <small>
                Add existing audio
              </small>

            </button>


            <label className="book-edit-option">

              <span>
                ↑
              </span>

              <strong>

                {
                  uploadingAudio
                    ? "Uploading..."
                    : "Upload Audio"
                }

              </strong>

              <small>
                Add new audio files
              </small>

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

          <div className="book-edit-message book-edit-message--error">
            {error}
          </div>

        )}


        {success && (

          <div className="book-edit-message book-edit-message--success">
            {success}
          </div>

        )}


        {/* =================================================
            ACTIONS
            ================================================= */}

        <footer className="book-edit-actions">

          <Link
            href={`/studio/books/${bookId}`}
            className="book-edit-cancel"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="book-edit-save"
            disabled={
              saving ||
              uploadingCover ||
              uploadingAudio ||
              uploadingPdf
            }
          >

            {
              saving
                ? "Saving..."
                : "Save Changes"
            }

          </button>


          <button
            type="button"
            className="book-edit-publish"
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

        </footer>

      </form>


      {/* =================================================
          COVER PICKER
          ================================================= */}

      {showCoverPicker && (

        <div className="book-edit-modal">

          <div
            className="book-edit-modal__backdrop"
            onClick={() =>
              setShowCoverPicker(
                false
              )
            }
          />


          <div className="book-edit-modal__panel">

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

      {showAudioPicker && (

        <div className="book-edit-modal">

          <div
            className="book-edit-modal__backdrop"
            onClick={() =>
              setShowAudioPicker(
                false
              )
            }
          />


          <div className="book-edit-modal__panel">

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
                setShowAudioPicker(
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