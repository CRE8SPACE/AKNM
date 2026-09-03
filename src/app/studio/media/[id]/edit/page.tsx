import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EditMediaForm from "./EditMediaForm";
import "./edit-media.css";

type MediaRecord = {
  id: string;
  title: string | null;
  description: string | null;
  media_type: "image" | "video" | "audio" | "document";
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("media")
    .select(`
      id,
      title,
      description,
      media_type,
      storage_bucket,
      storage_path,
      public_url,
      thumbnail_url,
      mime_type,
      file_size,
      width,
      height,
      duration_seconds,
      alt_text,
      metadata,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Edit media fetch error:",
      error
    );

    notFound();
  }

  if (!data) {
    notFound();
  }

  return (
    <main className="edit-media-page">
      <EditMediaForm
        media={data as MediaRecord}
      />
    </main>
  );
}