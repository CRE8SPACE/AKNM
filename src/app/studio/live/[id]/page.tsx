"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import "./live-session.css";

/* =========================================================
   TYPES
   ========================================================= */

type LiveStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "ended"
  | "published"
  | "cancelled"
  | "archived";

type LiveSession = {
  id: string;

  host_id: string | null;

  title: string;

  slug: string;

  description: string | null;

  status: string;

  session_type: string;

  cover_media_id: string | null;

  scheduled_at: string | null;

  started_at: string | null;

  ended_at: string | null;

  stream_url: string | null;

  replay_url: string | null;

  recording_media_id: string | null;

  featured: boolean;

  created_at: string;

  updated_at: string;
};

type DeviceInfo = {
  deviceId: string;

  label: string;
};


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(
  status: string
): LiveStatus {
  if (
    status === "draft" ||
    status === "scheduled" ||
    status === "live" ||
    status === "ended" ||
    status === "published" ||
    status === "cancelled" ||
    status === "archived"
  ) {
    return status;
  }

  return "draft";
}


/* =========================================================
   TIME
   ========================================================= */

function formatTime(
  totalSeconds: number
) {
  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  return `${String(
    hours
  ).padStart(
    2,
    "0"
  )}:${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}


/* =========================================================
   MEDIA RECORDER SUPPORT
   ========================================================= */

function getSupportedMimeType() {
  if (
    typeof MediaRecorder ===
    "undefined"
  ) {
    return "";
  }

  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return (
    types.find(
      (type) =>
        MediaRecorder.isTypeSupported(
          type
        )
    ) || ""
  );
}


function getFileExtension(
  mimeType: string
) {
  if (
    mimeType.includes(
      "mp4"
    )
  ) {
    return "mp4";
  }

  return "webm";
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function LiveSessionPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const sessionId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  /* =======================================================
     VIDEO / STREAM REFS
     ======================================================= */

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const brandingCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );

  const logoImageRef =
    useRef<HTMLImageElement | null>(
      null
    );

  const streamRef =
    useRef<MediaStream | null>(
      null
    );

  /*
   * This is the stream that MediaRecorder
   * actually records.
   *
   * Video comes from the branded canvas.
   * Audio comes from the microphone.
   */
  const brandedStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const recorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const chunksRef =
    useRef<Blob[]>([]);

  const brandingAnimationRef =
    useRef<number | null>(
      null
    );

  const startedAtRef =
    useRef<number | null>(
      null
    );

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  const mountedRef =
    useRef(true);


  /* =======================================================
     STATE
     ======================================================= */

  const [
    session,
    setSession,
  ] =
    useState<LiveSession | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    starting,
    setStarting,
  ] = useState(false);

  const [
    ending,
    setEnding,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    isLive,
    setIsLive,
  ] = useState(false);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    cameraEnabled,
    setCameraEnabled,
  ] = useState(true);

  const [
    microphoneEnabled,
    setMicrophoneEnabled,
  ] = useState(true);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    cameraDevices,
    setCameraDevices,
  ] = useState<
    DeviceInfo[]
  >([]);

  const [
    microphoneDevices,
    setMicrophoneDevices,
  ] = useState<
    DeviceInfo[]
  >([]);

  const [
    selectedCamera,
    setSelectedCamera,
  ] = useState("");

  const [
    selectedMicrophone,
    setSelectedMicrophone,
  ] = useState("");

  const [
    showSettings,
    setShowSettings,
  ] = useState(false);


  /* =======================================================
     LOAD SESSION
     ======================================================= */

  const loadSession =
    useCallback(
      async () => {
        if (!sessionId) {
          return;
        }

        setLoading(true);
        setError("");

        const supabase =
          createClient();

        const {
          data,
          error:
            sessionError,
        } =
          await supabase
            .from(
              "live_sessions"
            )
            .select(`
              id,
              host_id,
              title,
              slug,
              description,
              status,
              session_type,
              cover_media_id,
              scheduled_at,
              started_at,
              ended_at,
              stream_url,
              replay_url,
              recording_media_id,
              featured,
              created_at,
              updated_at
            `)
            .eq(
              "id",
              sessionId
            )
            .single();

        if (
          !mountedRef.current
        ) {
          return;
        }

        if (sessionError) {
          console.error(
            "Live studio session error:",
            sessionError
          );

          setError(
            sessionError.message ||
              "Could not load live session."
          );

          setLoading(false);

          return;
        }

        setSession(
          data as LiveSession
        );

        setLoading(false);
      },
      [sessionId]
    );


  useEffect(() => {
    mountedRef.current =
      true;

    void loadSession();

    return () => {
      mountedRef.current =
        false;
    };
  }, [
    loadSession,
  ]);


  /* =======================================================
     LOAD AKNM LOGO
     ======================================================= */

  useEffect(() => {
    const image =
      new Image();

    image.src =
      "/branding/aknm-logo.png";

    image.onload =
      () => {
        logoImageRef.current =
          image;
      };

    image.onerror =
      () => {
        console.error(
          "Could not load AKNM branding logo from /branding/aknm-logo.png"
        );
      };

    return () => {
      logoImageRef.current =
        null;
    };
  }, []);


  /* =======================================================
     ENUMERATE DEVICES
     ======================================================= */

  const enumerateDevices =
    useCallback(
      async () => {
        if (
          !navigator
            .mediaDevices
            ?.enumerateDevices
        ) {
          return;
        }

        try {
          const devices =
            await navigator.mediaDevices.enumerateDevices();

          const cameras =
            devices
              .filter(
                (device) =>
                  device.kind ===
                  "videoinput"
              )
              .map(
                (device) => ({
                  deviceId:
                    device.deviceId,

                  label:
                    device.label ||
                    "Camera",
                })
              );

          const microphones =
            devices
              .filter(
                (device) =>
                  device.kind ===
                  "audioinput"
              )
              .map(
                (device) => ({
                  deviceId:
                    device.deviceId,

                  label:
                    device.label ||
                    "Microphone",
                })
              );

          setCameraDevices(
            cameras
          );

          setMicrophoneDevices(
            microphones
          );

          setSelectedCamera(
            (current) =>
              current ||
              cameras[0]
                ?.deviceId ||
              ""
          );

          setSelectedMicrophone(
            (current) =>
              current ||
              microphones[0]
                ?.deviceId ||
              ""
          );
        } catch (err) {
          console.error(
            "Device enumeration error:",
            err
          );
        }
      },
      []
    );


  /* =======================================================
     ATTACH CAMERA STREAM TO PREVIEW
     ======================================================= */

  useEffect(() => {
    const video =
      videoRef.current;

    const stream =
      streamRef.current;

    if (
      !video ||
      !stream
    ) {
      return;
    }

    if (
      video.srcObject !==
      stream
    ) {
      video.srcObject =
        stream;
    }

    video
      .play()
      .catch(() => {
        /*
         * Browser autoplay restrictions
         * may require a user gesture.
         */
      });
  }, [
    cameraEnabled,
    isLive,
  ]);


  /* =======================================================
     STOP BRANDING RENDERER
     ======================================================= */

  function stopBrandingRenderer() {
    if (
      brandingAnimationRef.current !==
      null
    ) {
      cancelAnimationFrame(
        brandingAnimationRef.current
      );

      brandingAnimationRef.current =
        null;
    }
  }


  /* =======================================================
     DRAW BRANDED FRAME
     ======================================================= */

  function drawBrandedFrame() {
    const video =
      videoRef.current;

    const canvas =
      brandingCanvasRef.current;

    if (
      !video ||
      !canvas
    ) {
      return;
    }

    const context =
      canvas.getContext(
        "2d"
      );

    if (!context) {
      return;
    }

    const width =
      video.videoWidth ||
      1280;

    const height =
      video.videoHeight ||
      720;

    if (
      canvas.width !==
        width ||
      canvas.height !==
        height
    ) {
      canvas.width =
        width;

      canvas.height =
        height;
    }


    /* =====================================================
       CAMERA
       ===================================================== */

    context.clearRect(
      0,
      0,
      width,
      height
    );

    /*
     * Match the camera preview's
     * normal mirrored appearance.
     */
    context.save();

    context.translate(
      width,
      0
    );

    context.scale(
      -1,
      1
    );

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    context.restore();


    /* =====================================================
       AKNM LOGO
       ===================================================== */

    const logo =
      logoImageRef.current;

    const margin =
      Math.round(
        width * 0.035
      );

    const logoWidth =
      Math.round(
        width * 0.085
      );

    const logoHeight =
      logoWidth;

    const logoX =
      width -
      logoWidth -
      margin;

    const logoY =
      height -
      logoHeight -
      margin -
      Math.round(
        height * 0.025
      );

    if (
      logo &&
      logo.complete &&
      logo.naturalWidth >
        0
    ) {
      context.save();

      context.globalAlpha =
        0.82;

      context.drawImage(
        logo,
        logoX,
        logoY,
        logoWidth,
        logoHeight
      );

      context.restore();
    }


    /* =====================================================
       WEBSITE
       ===================================================== */

    const websiteSize =
      Math.max(
        14,
        Math.round(
          width * 0.018
        )
      );

    context.save();

    context.globalAlpha =
      0.82;

    context.font =
      `600 ${websiteSize}px Arial, sans-serif`;

    context.textAlign =
      "right";

    context.textBaseline =
      "bottom";

    context.fillStyle =
      "#ffffff";

    context.shadowColor =
      "rgba(0, 0, 0, 0.7)";

    context.shadowBlur =
      Math.max(
        3,
        Math.round(
          width * 0.004
        )
      );

    context.fillText(
      "aknm.pro",
      width - margin,
      height - margin
    );

    context.restore();


    /* =====================================================
       NEXT FRAME
       ===================================================== */

    brandingAnimationRef.current =
      requestAnimationFrame(
        drawBrandedFrame
      );
  }


  /* =======================================================
     STOP STREAM
     ======================================================= */

  const stopStream =
    useCallback(() => {
      const stream =
        streamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }

      streamRef.current =
        null;

      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          null;
      }
    }, []);


  /* =======================================================
     CLEANUP
     ======================================================= */

  useEffect(() => {
    return () => {
      stopBrandingRenderer();

      if (
        timerRef.current
      ) {
        clearInterval(
          timerRef.current
        );
      }

      if (
        recorderRef.current &&
        recorderRef.current
          .state !==
          "inactive"
      ) {
        try {
          recorderRef.current.stop();
        } catch {
          // Recorder already stopped.
        }
      }

      if (
        brandedStreamRef.current
      ) {
        brandedStreamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        brandedStreamRef.current =
          null;
      }

      stopStream();
    };
  }, [
    stopStream,
  ]);


  /* =======================================================
     REQUEST CAMERA + MICROPHONE
     ======================================================= */

  async function requestCameraAndMicrophone() {
    if (
      !navigator
        .mediaDevices
        ?.getUserMedia
    ) {
      throw new Error(
        "Your browser does not support camera and microphone access."
      );
    }

    const videoConstraint =
      selectedCamera
        ? {
            deviceId: {
              exact:
                selectedCamera,
            },
          }
        : true;

    const audioConstraint =
      selectedMicrophone
        ? {
            deviceId: {
              exact:
                selectedMicrophone,
            },
          }
        : true;

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video:
              videoConstraint,

            audio:
              audioConstraint,
          }
        );

      streamRef.current =
        stream;

      const videoTrack =
        stream.getVideoTracks()[0];

      const audioTrack =
        stream.getAudioTracks()[0];

      setCameraEnabled(
        videoTrack
          ? videoTrack.enabled
          : false
      );

      setMicrophoneEnabled(
        audioTrack
          ? audioTrack.enabled
          : false
      );

      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();
      }

      await enumerateDevices();

      return stream;
    } catch (err) {
      console.error(
        "Camera/microphone error:",
        err
      );

      if (
        err instanceof DOMException
      ) {
        if (
          err.name ===
          "NotAllowedError"
        ) {
          throw new Error(
            "Camera or microphone permission was denied. Allow access in your browser and try again."
          );
        }

        if (
          err.name ===
          "NotFoundError"
        ) {
          throw new Error(
            "No camera or microphone could be found."
          );
        }

        if (
          err.name ===
          "NotReadableError"
        ) {
          throw new Error(
            "The camera or microphone is already being used by another application."
          );
        }
      }

      throw new Error(
        "Could not access the camera and microphone."
      );
    }
  }


  /* =======================================================
     MARK SESSION LIVE
     ======================================================= */

  async function markSessionLive() {
    if (!session) {
      throw new Error(
        "Live session is unavailable."
      );
    }

    const supabase =
      createClient();

    const startedAt =
      new Date().toISOString();

    const {
      data,
      error:
        updateError,
    } =
      await supabase
        .from(
          "live_sessions"
        )
        .update({
          status:
            "live",

          started_at:
            startedAt,
        })
        .eq(
          "id",
          session.id
        )
        .select(`
          id,
          host_id,
          title,
          slug,
          description,
          status,
          session_type,
          cover_media_id,
          scheduled_at,
          started_at,
          ended_at,
          stream_url,
          replay_url,
          recording_media_id,
          featured,
          created_at,
          updated_at
        `)
        .single();

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    setSession(
      data as LiveSession
    );

    return data as LiveSession;
  }


  /* =======================================================
     START RECORDER
     ======================================================= */

  function startRecorder(
    sourceStream: MediaStream
  ) {
    if (
      typeof MediaRecorder ===
      "undefined"
    ) {
      throw new Error(
        "Your browser does not support video recording."
      );
    }

    const video =
      videoRef.current;

    const canvas =
      brandingCanvasRef.current;

    if (
      !video ||
      !canvas
    ) {
      throw new Error(
        "The recording studio is not ready."
      );
    }


    /* =====================================================
       WAIT FOR VIDEO DIMENSIONS
       ===================================================== */

    const width =
      video.videoWidth ||
      1280;

    const height =
      video.videoHeight ||
      720;

    canvas.width =
      width;

    canvas.height =
      height;


    /* =====================================================
       START BRANDING
       ===================================================== */

    stopBrandingRenderer();

    drawBrandedFrame();


    /* =====================================================
       CAPTURE BRANDED VIDEO
       ===================================================== */

    const canvasStream =
      canvas.captureStream(
        30
      );


    /* =====================================================
       ADD MICROPHONE AUDIO
       ===================================================== */

    const audioTrack =
      sourceStream.getAudioTracks()[0];

    if (audioTrack) {
      canvasStream.addTrack(
        audioTrack
      );
    }


    brandedStreamRef.current =
      canvasStream;


    /* =====================================================
       MIME TYPE
       ===================================================== */

    const mimeType =
      getSupportedMimeType();


    /* =====================================================
       CREATE RECORDER
       ===================================================== */

    const recorder =
      mimeType
        ? new MediaRecorder(
            canvasStream,
            {
              mimeType,

              videoBitsPerSecond:
                6_000_000,

              audioBitsPerSecond:
                128_000,
            }
          )
        : new MediaRecorder(
            canvasStream
          );


    chunksRef.current =
      [];


    /* =====================================================
       DATA
       ===================================================== */

    recorder.ondataavailable =
      (event) => {
        if (
          event.data &&
          event.data.size >
            0
        ) {
          chunksRef.current.push(
            event.data
          );
        }
      };


    /* =====================================================
       START
       ===================================================== */

    recorder.onstart =
      () => {
        setIsRecording(
          true
        );
      };


    /* =====================================================
       ERROR
       ===================================================== */

    recorder.onerror =
      (event) => {
        console.error(
          "Branded MediaRecorder error:",
          event
        );

        setError(
          "The browser encountered an error while recording."
        );
      };


    /* =====================================================
       STOP
       ===================================================== */

    recorder.onstop =
      () => {
        setIsRecording(
          false
        );

        stopBrandingRenderer();

        const brandedStream =
          brandedStreamRef.current;

        if (
          brandedStream
        ) {
          brandedStream
            .getVideoTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        }

        brandedStreamRef.current =
          null;
      };


    recorder.start(
      1000
    );

    recorderRef.current =
      recorder;
  }


  /* =======================================================
     TIMER
     ======================================================= */

  function startTimer(
    startedAt: string
  ) {
    const start =
      new Date(
        startedAt
      ).getTime();

    startedAtRef.current =
      start;

    setElapsedSeconds(
      0
    );

    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );
    }

    timerRef.current =
      setInterval(
        () => {
          if (
            startedAtRef.current ===
            null
          ) {
            return;
          }

          const elapsed =
            Math.floor(
              (Date.now() -
                startedAtRef.current) /
                1000
            );

          setElapsedSeconds(
            elapsed
          );
        },
        1000
      );
  }


  function stopTimer() {
    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    startedAtRef.current =
      null;
  }


  /* =======================================================
     GO LIVE
     ======================================================= */

  async function handleGoLive() {
    if (
      !session ||
      starting ||
      isLive
    ) {
      return;
    }

    setError("");
    setMessage("");

    setStarting(
      true
    );

    try {
      const status =
        normalizeStatus(
          session.status
        );

      if (
        status ===
          "ended" ||
        status ===
          "published" ||
        status ===
          "cancelled" ||
        status ===
          "archived"
      ) {
        throw new Error(
          "This session cannot be started."
        );
      }


      /*
       * Camera and microphone
       * must be activated first.
       */

      const stream =
        await requestCameraAndMicrophone();


      /*
       * Update database.
       */

      const liveSession =
        await markSessionLive();


      try {
        /*
         * Ensure the video has
         * dimensions before canvas
         * capture begins.
         */

        const video =
          videoRef.current;

        if (
          video &&
          video.readyState <
            2
        ) {
          await new Promise<void>(
            (
              resolve
            ) => {
              const handleLoaded =
                () => {
                  video.removeEventListener(
                    "loadeddata",
                    handleLoaded
                  );

                  resolve();
                };

                video.addEventListener(
                  "loadeddata",
                  handleLoaded
                );

                window.setTimeout(
                  resolve,
                  1500
                );
              }
          );
        }

        startRecorder(
          stream
        );
      } catch (
        recordError
      ) {
        /*
         * Do not leave the
         * database saying LIVE
         * if recording failed.
         */

        const supabase =
          createClient();

        await supabase
          .from(
            "live_sessions"
          )
          .update({
            status:
              session.scheduled_at
                ? "scheduled"
                : "draft",

            started_at:
              null,
          })
          .eq(
            "id",
            session.id
          );

        stopBrandingRenderer();

        stopStream();

        throw recordError;
      }


      const liveStartedAt =
        liveSession.started_at ||
        new Date().toISOString();

      startTimer(
        liveStartedAt
      );

      setIsLive(
        true
      );

      setMessage(
        "You are live. Camera, microphone and branded recording are active."
      );

      await enumerateDevices();
    } catch (err) {
      console.error(
        "Go live error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not start the broadcast."
      );

      setIsLive(
        false
      );

      setIsRecording(
        false
      );
    } finally {
      setStarting(
        false
      );
    }
  }


  /* =======================================================
     TOGGLE CAMERA
     ======================================================= */

  function toggleCamera() {
    const stream =
      streamRef.current;

    if (!stream) {
      return;
    }

    const tracks =
      stream.getVideoTracks();

    if (
      tracks.length ===
      0
    ) {
      return;
    }

    const next =
      !cameraEnabled;

    tracks.forEach(
      (track) => {
        track.enabled =
          next;
      }
    );

    setCameraEnabled(
      next
    );
  }


  /* =======================================================
     TOGGLE MICROPHONE
     ======================================================= */

  function toggleMicrophone() {
    const stream =
      streamRef.current;

    if (!stream) {
      return;
    }

    const tracks =
      stream.getAudioTracks();

    if (
      tracks.length ===
      0
    ) {
      return;
    }

    const next =
      !microphoneEnabled;

    tracks.forEach(
      (track) => {
        track.enabled =
          next;
      }
    );

    setMicrophoneEnabled(
      next
    );
  }


  /* =======================================================
     CHANGE CAMERA
     ======================================================= */

  async function changeCamera(
    deviceId: string
  ) {
    setSelectedCamera(
      deviceId
    );

    if (!isLive) {
      return;
    }

    try {
      const currentStream =
        streamRef.current;

      if (!currentStream) {
        return;
      }

      const oldVideoTrack =
        currentStream.getVideoTracks()[0];

      const newStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              deviceId: {
                exact:
                  deviceId,
              },
            },

            audio: false,
          }
        );

      const newTrack =
        newStream.getVideoTracks()[0];

      if (!newTrack) {
        throw new Error(
          "Could not access the selected camera."
        );
      }


      /*
       * Replace the camera
       * track in the preview stream.
       */

      if (
        oldVideoTrack
      ) {
        currentStream.removeTrack(
          oldVideoTrack
        );

        oldVideoTrack.stop();
      }

      currentStream.addTrack(
        newTrack
      );


      /*
       * Video element reads from
       * currentStream, therefore the
       * canvas automatically captures
       * the new camera.
       */

      if (
        videoRef.current
      ) {
        videoRef.current.srcObject =
          currentStream;

        await videoRef.current.play();
      }

      await enumerateDevices();
    } catch (err) {
      console.error(
        "Camera switch error:",
        err
      );

      setError(
        "Could not switch camera."
      );
    }
  }


  /* =======================================================
     CHANGE MICROPHONE
     ======================================================= */

  async function changeMicrophone(
    deviceId: string
  ) {
    setSelectedMicrophone(
      deviceId
    );

    if (!isLive) {
      return;
    }

    try {
      const currentStream =
        streamRef.current;

      if (!currentStream) {
        return;
      }

      const oldAudioTrack =
        currentStream.getAudioTracks()[0];

      const newStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: false,

            audio: {
              deviceId: {
                exact:
                  deviceId,
              },
            },
          }
        );

      const newTrack =
        newStream.getAudioTracks()[0];

      if (!newTrack) {
        throw new Error(
          "Could not access the selected microphone."
        );
      }


      /*
       * Replace the microphone
       * in the source stream.
       */

      if (
        oldAudioTrack
      ) {
        currentStream.removeTrack(
          oldAudioTrack
        );

        oldAudioTrack.stop();
      }

      currentStream.addTrack(
        newTrack
      );


      /*
       * IMPORTANT:
       *
       * MediaRecorder is recording
       * a separate branded stream.
       *
       * Replace its audio track too.
       */

      const brandedStream =
        brandedStreamRef.current;

      if (
        brandedStream
      ) {
        const oldRecordedAudio =
          brandedStream.getAudioTracks()[0];

        if (
          oldRecordedAudio
        ) {
          brandedStream.removeTrack(
            oldRecordedAudio
          );
        }

        brandedStream.addTrack(
          newTrack
        );
      }

      await enumerateDevices();
    } catch (err) {
      console.error(
        "Microphone switch error:",
        err
      );

      setError(
        "Could not switch microphone."
      );
    }
  }


  /* =======================================================
     FINALIZE RECORDER
     ======================================================= */

  function finalizeRecording() {
    return new Promise<Blob>(
      (
        resolve,
        reject
      ) => {
        const recorder =
          recorderRef.current;

        if (!recorder) {
          reject(
            new Error(
              "No recording was found."
            )
          );

          return;
        }

        const mimeType =
          recorder.mimeType ||
          "video/webm";


        const finish =
          () => {
            stopBrandingRenderer();

            const blob =
              new Blob(
                chunksRef.current,
                {
                  type:
                    mimeType,
                }
              );

            chunksRef.current =
              [];

            recorderRef.current =
              null;

            resolve(
              blob
            );
          };


        recorder.onstop =
          finish;


        recorder.onerror =
          () => {
            stopBrandingRenderer();

            reject(
              new Error(
                "The recording could not be finalized."
              )
            );
          };


        try {
          if (
            recorder.state !==
            "inactive"
          ) {
            recorder.stop();
          } else {
            finish();
          }
        } catch (err) {
          stopBrandingRenderer();

          reject(
            err instanceof Error
              ? err
              : new Error(
                  "Could not stop recording."
                )
          );
        }
      }
    );
  }


  /* =======================================================
     UPLOAD RECORDING
     ======================================================= */

  async function uploadRecording(
    blob: Blob
  ) {
    if (!session) {
      throw new Error(
        "Session unavailable."
      );
    }

    const supabase =
      createClient();

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
        "You must be signed in to save the recording."
      );
    }

    if (
      blob.size ===
      0
    ) {
      throw new Error(
        "The recording is empty."
      );
    }

    const mimeType =
      blob.type ||
      "video/webm";

    const extension =
      getFileExtension(
        mimeType
      );

    const safeSlug =
      session.slug
        .replace(
          /[^a-z0-9-]/gi,
          "-"
        )
        .toLowerCase();

    const path =
      `${user.id}/live/${session.id}/${safeSlug}-${Date.now()}.${extension}`;


    /*
     * Existing AKNM video bucket.
     */

    const bucket =
      "aknm-videos";


    /* =====================================================
       UPLOAD
       ===================================================== */

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(bucket)
        .upload(
          path,
          blob,
          {
            cacheControl:
              "3600",

            upsert:
              false,

            contentType:
              mimeType,
          }
        );

    if (uploadError) {
      throw new Error(
        uploadError.message
      );
    }


    /* =====================================================
       PUBLIC URL
       ===================================================== */

    const {
      data:
        publicData,
    } =
      supabase.storage
        .from(bucket)
        .getPublicUrl(
          path
        );


    /* =====================================================
       MEDIA RECORD
       ===================================================== */

    const {
      data:
        media,
      error:
        mediaError,
    } =
      await supabase
        .from("media")
        .insert({
          owner_id:
            user.id,

          title:
            `${session.title} — Recording`,

          description:
            session.description,

          media_type:
            "video",

          storage_bucket:
            bucket,

          storage_path:
            path,

          public_url:
            publicData.publicUrl,

          mime_type:
            mimeType,

          file_size:
            blob.size,

          alt_text:
            session.title,

          metadata: {
            source:
              "aknm-live",

            live_session_id:
              session.id,

            branded:
              true,

            branding: {
              logo:
                "AKNM",

              website:
                "aknm.pro",
            },
          },
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
        .from(bucket)
        .remove([
          path,
        ]);

      throw new Error(
        mediaError?.message ||
          "Could not create recording media record."
      );
    }

    return media;
  }


  /* =======================================================
     END LIVE
     ======================================================= */

  async function handleEndLive() {
    if (
      !session ||
      ending ||
      uploading ||
      !isLive
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "End this live session? Your recording will be finalized and uploaded."
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    setEnding(
      true
    );

    try {
      stopTimer();


      /* ===================================================
         FINALIZE RECORDING
         =================================================== */

      const recording =
        await finalizeRecording();

      setIsRecording(
        false
      );


      /* ===================================================
         UPLOAD
         =================================================== */

      setUploading(
        true
      );

      setMessage(
        "Broadcast ended. Finalizing and uploading the branded recording..."
      );


      /*
       * The recorder has now completely
       * stopped, so it is safe to stop
       * the physical camera/microphone.
       */

      stopStream();


      const media =
        await uploadRecording(
          recording
        );


      /* ===================================================
         UPDATE SESSION
         =================================================== */

      const supabase =
        createClient();

      const endedAt =
        new Date().toISOString();

      const {
        data:
          updated,
        error:
          updateError,
      } =
        await supabase
          .from(
            "live_sessions"
          )
          .update({
            status:
              "ended",

            ended_at:
              endedAt,

            recording_media_id:
              media.id,
          })
          .eq(
            "id",
            session.id
          )
          .select(`
            id,
            host_id,
            title,
            slug,
            description,
            status,
            session_type,
            cover_media_id,
            scheduled_at,
            started_at,
            ended_at,
            stream_url,
            replay_url,
            recording_media_id,
            featured,
            created_at,
            updated_at
          `)
          .single();

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }


      setSession(
        updated as LiveSession
      );

      setIsLive(
        false
      );

      setMessage(
        "Recording uploaded successfully. Opening the edit page..."
      );


      /* ===================================================
         EDIT PAGE
         =================================================== */

      window.setTimeout(
        () => {
          router.push(
            `/studio/live/${session.id}/edit`
          );

          router.refresh();
        },
        700
      );
    } catch (err) {
      console.error(
        "End live error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not finish the live session."
      );

      /*
       * Keep the UI live because
       * the session was not safely
       * completed.
       */

      setIsLive(
        true
      );
    } finally {
      setEnding(
        false
      );

      setUploading(
        false
      );
    }
  }


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="live-session-page">

        <div className="live-session-state">

          <div className="live-session-loader" />

          <p>
            Loading broadcast studio...
          </p>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR / NOT FOUND
     ======================================================= */

  if (!session) {
    return (
      <main className="live-session-page">

        <div className="live-session-state live-session-state--error">

          <span>
            AKNM LIVE
          </span>

          <h1>
            Session unavailable.
          </h1>

          <p>
            {error ||
              "This live session could not be found."}
          </p>

          <Link
            href="/studio/live"
            className="live-session-back"
          >
            ← Back to Live
          </Link>

        </div>

      </main>
    );
  }


  const status =
    normalizeStatus(
      session.status
    );


  /* =======================================================
     MAIN STUDIO
     ======================================================= */

  return (
    <main className="live-session-page">

      {/* =================================================
          TOP BAR
          ================================================= */}

      <header className="live-session-topbar">

        <div className="live-session-brand">

          <Link
            href="/studio/live"
            className="live-session-back"
          >
            ←
          </Link>

          <div>

            <span>
              AKNM LIVE
            </span>

            <strong>
              {session.title}
            </strong>

          </div>

        </div>


        <div className="live-session-top-status">

          {isLive ? (

            <span className="live-session-live-indicator">

              <i />

              LIVE

            </span>

          ) : (

            <span
              className={`
                live-session-status
                live-session-status--${status}
              `}
            >
              {status.toUpperCase()}
            </span>

          )}

        </div>

      </header>


      {/* =================================================
          STUDIO
          ================================================= */}

      <section className="live-session-studio">

        {/* ===============================================
            PREVIEW
            =============================================== */}

        <div className="live-session-preview">

          <div className="live-session-preview__screen">

            <video
              ref={
                videoRef
              }
              autoPlay
              muted
              playsInline
              className={
                cameraEnabled
                  ? "is-camera-on"
                  : "is-camera-off"
              }
            />

            {/*
             * Invisible recording canvas.
             *
             * This canvas is what MediaRecorder
             * actually records.
             */}

            <canvas
              ref={
                brandingCanvasRef
              }
              className="live-session-branding-canvas"
            />


            {!cameraEnabled && (

              <div className="live-session-camera-off">

                <div className="live-session-camera-off__icon">
                  CAM
                </div>

                <span>
                  Camera is off
                </span>

              </div>

            )}


            {!isLive && (

              <div className="live-session-preview__placeholder">

                <div className="live-session-preview__placeholder-icon">
                  CAM
                </div>

                <strong>
                  Camera preview
                </strong>

                <span>
                  Your camera will appear here
                  when you go live.
                </span>

              </div>

            )}


            {isLive && (

              <div className="live-session-recording-badge">

                <i />

                RECORDING

              </div>

            )}

          </div>


          {/* =============================================
              TIMER
              ============================================= */}

          <div className="live-session-timer">

            <span>
              {isLive
                ? "ON AIR"
                : "READY"}
            </span>

            <strong>
              {formatTime(
                elapsedSeconds
              )}
            </strong>

          </div>

        </div>


        {/* ===============================================
            CONTROL PANEL
            =============================================== */}

        <aside className="live-session-controls">

          <div className="live-session-controls__header">

            <span>
              BROADCAST CONTROL
            </span>

            <strong>
              {isLive
                ? "You are broadcasting"
                : "Studio ready"}
            </strong>

          </div>


          {/* =============================================
              DEVICE SETTINGS
              ============================================= */}

          {showSettings && (

            <div className="live-session-settings">

              <label>

                <span>
                  CAMERA
                </span>

                <select
                  value={
                    selectedCamera
                  }
                  onChange={(
                    event
                  ) =>
                    void changeCamera(
                      event.target
                        .value
                    )
                  }
                >

                  {cameraDevices.length ===
                    0 && (
                    <option value="">
                      No camera detected
                    </option>
                  )}

                  {cameraDevices.map(
                    (
                      device
                    ) => (
                      <option
                        key={
                          device.deviceId
                        }
                        value={
                          device.deviceId
                        }
                      >
                        {
                          device.label
                        }
                      </option>
                    )
                  )}

                </select>

              </label>


              <label>

                <span>
                  MICROPHONE
                </span>

                <select
                  value={
                    selectedMicrophone
                  }
                  onChange={(
                    event
                  ) =>
                    void changeMicrophone(
                      event.target
                        .value
                    )
                  }
                >

                  {microphoneDevices.length ===
                    0 && (
                    <option value="">
                      No microphone detected
                    </option>
                  )}

                  {microphoneDevices.map(
                    (
                      device
                    ) => (
                      <option
                        key={
                          device.deviceId
                        }
                        value={
                          device.deviceId
                        }
                      >
                        {
                          device.label
                        }
                      </option>
                    )
                  )}

                </select>

              </label>

            </div>

          )}


          {/* =============================================
              MEDIA CONTROLS
              ============================================= */}

          <div className="live-session-media-controls">

            <button
              type="button"
              className={
                !cameraEnabled
                  ? "is-off"
                  : ""
              }
              onClick={
                toggleCamera
              }
              disabled={
                !isLive
              }
            >

              <span>
                {cameraEnabled
                  ? "CAM"
                  : "OFF"}
              </span>

              <strong>
                Camera
              </strong>

            </button>


            <button
              type="button"
              className={
                !microphoneEnabled
                  ? "is-off"
                  : ""
              }
              onClick={
                toggleMicrophone
              }
              disabled={
                !isLive
              }
            >

              <span>
                {microphoneEnabled
                  ? "MIC"
                  : "OFF"}
              </span>

              <strong>
                Microphone
              </strong>

            </button>


            <button
              type="button"
              onClick={() =>
                setShowSettings(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >

              <span>
                CFG
              </span>

              <strong>
                Settings
              </strong>

            </button>

          </div>


          {/* =============================================
              PRIMARY ACTION
              ============================================= */}

          {!isLive ? (

            <button
              type="button"
              className="live-session-go-live"
              onClick={
                handleGoLive
              }
              disabled={
                starting ||
                status ===
                  "ended" ||
                status ===
                  "published" ||
                status ===
                  "cancelled" ||
                status ===
                  "archived"
              }
            >

              <span className="live-session-go-live__dot" />

              <strong>
                {starting
                  ? "Starting studio..."
                  : "Go Live"}
              </strong>

              <small>
                Camera + microphone + recording
              </small>

            </button>

          ) : (

            <button
              type="button"
              className="live-session-end"
              onClick={
                handleEndLive
              }
              disabled={
                ending ||
                uploading
              }
            >

              <span />

              <strong>
                {uploading
                  ? "Uploading recording..."
                  : ending
                  ? "Ending broadcast..."
                  : "End Live"}
              </strong>

            </button>

          )}


          {/* =============================================
              CONTROL INFO
              ============================================= */}

          <div className="live-session-control-info">

            <div>

              <span>
                SESSION
              </span>

              <strong>
                {session.session_type.toUpperCase()}
              </strong>

            </div>


            <div>

              <span>
                RECORDING
              </span>

              <strong>
                {isRecording
                  ? "ACTIVE"
                  : "READY"}
              </strong>

            </div>

          </div>

        </aside>

      </section>


      {/* =================================================
          MESSAGE
          ================================================= */}

      {message && (

        <div className="live-session-message live-session-message--success">
          {message}
        </div>

      )}


      {error && (

        <div className="live-session-message live-session-message--error">

          <strong>
            Broadcast error
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="live-session-footer">

        <div>

          <span>
            BROADCAST
          </span>

          <strong>
            {isLive
              ? "ON AIR"
              : "OFF AIR"}
          </strong>

        </div>


        <div>

          <span>
            CAMERA
          </span>

          <strong>
            {cameraEnabled
              ? "ON"
              : "OFF"}
          </strong>

        </div>


        <div>

          <span>
            MICROPHONE
          </span>

          <strong>
            {microphoneEnabled
              ? "ON"
              : "MUTED"}
          </strong>

        </div>


        <div>

          <span>
            RECORDING
          </span>

          <strong>
            {isRecording
              ? "ACTIVE"
              : "INACTIVE"}
          </strong>

        </div>

      </footer>

    </main>
  );
}