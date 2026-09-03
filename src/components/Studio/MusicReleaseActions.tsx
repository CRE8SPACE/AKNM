"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import "./MusicReleaseActions.css";

type Props = {
  releaseId: string;
  status: string;
};

export default function MusicReleaseActions({
  releaseId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function publishRelease() {
    if (loading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Publish this music release now?"
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase =
      createClient();

    try {
      const {
        error: updateError,
      } =
        await supabase
          .from("music_releases")
          .update({
            status: "published",
            published_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            releaseId
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      router.refresh();

    } catch (err) {
      console.error(
        "Music publish error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not publish release."
      );

    } finally {
      setLoading(false);
    }
  }


  async function archiveRelease() {
    if (loading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Archive this music release?"
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const supabase =
      createClient();

    try {
      const {
        error: updateError,
      } =
        await supabase
          .from("music_releases")
          .update({
            status: "archived",
          })
          .eq(
            "id",
            releaseId
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      router.refresh();

    } catch (err) {
      console.error(
        "Music archive error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not archive release."
      );

    } finally {
      setLoading(false);
    }
  }


  if (
    status === "draft"
  ) {
    return (
      <div className="music-release-actions">

        {error && (
          <span className="music-release-actions__error">
            {error}
          </span>
        )}

        <button
          type="button"
          className="music-release-actions__archive"
          onClick={archiveRelease}
          disabled={loading}
        >
          {loading
            ? "Working..."
            : "Archive"}
        </button>

        <button
          type="button"
          className="music-release-actions__publish"
          onClick={publishRelease}
          disabled={loading}
        >
          {loading
            ? "Publishing..."
            : "Publish"}

          {!loading && (
            <span>
              ↗
            </span>
          )}

        </button>

      </div>
    );
  }


  if (
    status === "published"
  ) {
    return (
      <div className="music-release-actions">

        {error && (
          <span className="music-release-actions__error">
            {error}
          </span>
        )}

        <button
          type="button"
          className="music-release-actions__archive"
          onClick={archiveRelease}
          disabled={loading}
        >
          {loading
            ? "Working..."
            : "Archive"}
        </button>

      </div>
    );
  }


  return null;
}