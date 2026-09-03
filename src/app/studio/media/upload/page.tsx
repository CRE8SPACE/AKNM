import Link from "next/link";

import "./upload-media.css";
import UploadMediaForm from "./UploadMediaForm";

export default function UploadMediaPage() {
  return (
    <main className="upload-media-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="upload-media__header">

        <div>

          <Link
            href="/studio/media"
            className="upload-media__back"
          >
            <span>←</span>
            Back to Media
          </Link>

          <span className="upload-media__eyebrow">
            MEDIA LIBRARY
          </span>

          <h1>
            Upload media.
          </h1>

          <p>
            Add images, videos, audio and documents
            to your AKNM media library.
          </p>

        </div>

      </header>


      {/* =================================================
          FORM
          ================================================= */}

      <UploadMediaForm />

    </main>
  );
}