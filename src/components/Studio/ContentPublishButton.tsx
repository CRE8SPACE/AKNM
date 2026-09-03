"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ContentPublishButtonProps = {
  postId: string;
  title: string;
};

export default function ContentPublishButton({
  postId,
  title,
}: ContentPublishButtonProps) {
  const router = useRouter();

  const supabase = createClient();

  const [publishing, setPublishing] =
    useState(false);

  async function handlePublish() {
    const confirmed = window.confirm(
      `Publish "${title}" now?`
    );

    if (!confirmed) {
      return;
    }

    setPublishing(true);

    try {
      const {
        error,
      } = await supabase
        .from("posts")
        .update({
          status: "published",
          published_at:
            new Date().toISOString(),
        })
        .eq("id", postId);

      if (error) {
        throw new Error(
          error.message
        );
      }

      router.refresh();

    } catch (error) {
      console.error(
        "Publish error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Could not publish this post."
      );

    } finally {
      setPublishing(false);
    }
  }

  return (
    <button
      type="button"
      className="content-item__action content-item__action--publish"
      onClick={handlePublish}
      disabled={publishing}
    >
      {publishing
        ? "Publishing..."
        : "Publish"}
    </button>
  );
}