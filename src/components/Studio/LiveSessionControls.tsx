"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LiveSessionControlsProps = {
  session: {
    id: string;
    status: string;
    scheduled_at: string | null;
    started_at: string | null;
    ended_at: string | null;
    stream_url: string | null;
    replay_url: string | null;
    recording_media_id: string | null;
  };
};

export default function LiveSessionControls({
  session,
}: LiveSessionControlsProps) {
  const router = useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  async function updateSession(
    status: string,
    extra: Record<
      string,
      unknown
    > = {}
  ) {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const supabase =
      createClient();

    try {
      const {
        error: updateError,
      } =
        await supabase
          .from("live")
          .update({
            status,
            ...extra,
          })
          .eq(
            "id",
            session.id
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      setSuccess(
        status === "live"
          ? "Live session started."
          : status === "ended"
          ? "Live session ended."
          : "Session updated."
      );

      router.refresh();

    } catch (err) {
      console.error(
        "Live session update error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not update session."
      );
    } finally {
      setLoading(false);
    }
  }


  async function startLive() {
    await updateSession(
      "live",
      {
        started_at:
          new Date().toISOString(),
      }
    );
  }


  async function endLive() {
    await updateSession(
      "ended",
      {
        ended_at:
          new Date().toISOString(),
      }
    );
  }


  async function cancelSession() {
    await updateSession(
      "cancelled"
    );
  }


  return (
    <div className="live-controls">

      <div className="live-controls__actions">

        {session.status ===
          "scheduled" && (
          <>
            <button
              type="button"
              className="live-controls__start"
              onClick={
                startLive
              }
              disabled={loading}
            >
              <span className="live-controls__dot" />

              {loading
                ? "Starting..."
                : "Start Live"}
            </button>

            <button
              type="button"
              className="live-controls__cancel"
              onClick={
                cancelSession
              }
              disabled={loading}
            >
              Cancel Session
            </button>
          </>
        )}


        {session.status ===
          "draft" && (
          <div className="live-controls__notice">
            Schedule this session before
            starting the broadcast.
          </div>
        )}


        {session.status ===
          "live" && (
          <button
            type="button"
            className="live-controls__end"
            onClick={
              endLive
            }
            disabled={loading}
          >
            {loading
              ? "Ending..."
              : "End Live"}
          </button>
        )}


        {session.status ===
          "ended" && (
          <div className="live-controls__ended">
            This live session has ended.
          </div>
        )}


        {session.status ===
          "cancelled" && (
          <div className="live-controls__ended">
            This session was cancelled.
          </div>
        )}

      </div>


      {error && (
        <div className="live-controls__message live-controls__message--error">
          {error}
        </div>
      )}

      {success && (
        <div className="live-controls__message live-controls__message--success">
          {success}
        </div>
      )}

    </div>
  );
}