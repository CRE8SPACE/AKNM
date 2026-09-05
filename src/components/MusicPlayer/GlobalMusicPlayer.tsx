"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useMusicPlayer,
} from "./MusicPlayerProvider";

import "./music-player.css";


/* =========================================================
   ICONS
   ========================================================= */

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}


function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
    </svg>
  );
}


function PreviousIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 5h2v14H6zm3 7 9-7v14z" />
    </svg>
  );
}


function NextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M16 5h2v14h-2zm-1 7-9 7V5z" />
    </svg>
  );
}


function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M16 3h5v5h-2V6.41l-4.29 4.3-1.42-1.42L17.59 5H16V3zM3 6h3.59l10.7 10.71L19 15v-2l2 2v6h-6v-2h2.59L7.59 9H3V6zm0 12h3.59l4.29-4.29 1.42 1.42L7.41 20H3v-2z" />
    </svg>
  );
}


function RepeatIcon({
  mode,
}: {
  mode: "off" | "all" | "one";
}) {
  return (
    <div className="aknm-repeat-icon">

      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M7 7h11l-2.5-2.5L17 3l5 5-5 5-1.5-1.5L18 9H7a3 3 0 0 0-3 3v1H2v-1a5 5 0 0 1 5-5zm10 10H6l2.5 2.5L7 21l-5-5 5-5 1.5 1.5L6 15h11a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5z" />
      </svg>

      {mode === "one" && (
        <span>1</span>
      )}

    </div>
  );
}


function VolumeIcon({
  muted,
}: {
  muted: boolean;
}) {

  if (muted) {

    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3 3-3 1.5 1.5-3 3 3 3L19.5 15l-3-3z" />
      </svg>
    );

  }


  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 9v6h4l5 4V5L7 9H3zm12.5 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 15.5 12zm0-8.5v2.06a7 7 0 0 1 0 12.88v2.06a9 9 0 0 0 0-17z" />
    </svg>
  );
}


function MinimizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M7 14h10v2H7z" />
    </svg>
  );
}


function ExpandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M7 10h10v4H7z" />
    </svg>
  );
}


function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}


/* =========================================================
   TIME FORMATTER
   ========================================================= */

function formatTime(
  value: number
) {

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return "0:00";
  }


  const minutes =
    Math.floor(
      value / 60
    );


  const seconds =
    Math.floor(
      value % 60
    );


  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function GlobalMusicPlayer() {

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    togglePlayback,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeatMode,
    dismissPlayer,
  } = useMusicPlayer();


  /* =======================================================
     PLAYER WINDOW STATE
     ======================================================= */

  const [
    isMinimized,
    setIsMinimized,
  ] = useState(false);


  const progressRef =
    useRef<HTMLDivElement | null>(
      null
    );


  /* =======================================================
     RESET WINDOW WHEN A NEW TRACK IS SELECTED
     ======================================================= */

  useEffect(() => {

    if (currentTrack) {

      setIsMinimized(false);

    }

  }, [
    currentTrack?.id,
  ]);


  /* =======================================================
     NO ACTIVE TRACK
     ======================================================= */

  if (!currentTrack) {
    return null;
  }


  /* =======================================================
     PROGRESS
     ======================================================= */

  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (
              currentTime /
              duration
            ) * 100
          )
        )
      : 0;


  /* =======================================================
     SEEK
     ======================================================= */

  const handleSeek = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {

    if (
      !progressRef.current ||
      duration <= 0
    ) {
      return;
    }


    const rect =
      progressRef.current
        .getBoundingClientRect();


    const position =
      event.clientX -
      rect.left;


    const percentage =
      Math.max(
        0,
        Math.min(
          1,
          position /
            rect.width
        )
      );


    seekTo(
      percentage *
        duration
    );

  };


  /* =======================================================
     KEYBOARD SEEK
     ======================================================= */

  const handleProgressKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {

    if (
      duration <= 0
    ) {
      return;
    }


    const step =
      event.shiftKey
        ? 10
        : 5;


    if (
      event.key ===
      "ArrowRight"
    ) {

      event.preventDefault();

      seekTo(
        Math.min(
          duration,
          currentTime + step
        )
      );

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      event.preventDefault();

      seekTo(
        Math.max(
          0,
          currentTime - step
        )
      );

    }


    if (
      event.key ===
      "Home"
    ) {

      event.preventDefault();

      seekTo(0);

    }


    if (
      event.key ===
      "End"
    ) {

      event.preventDefault();

      seekTo(duration);

    }

  };


  /* =======================================================
     CLOSE PLAYER
     ======================================================= */

  const handleClose = () => {

    dismissPlayer();

    setIsMinimized(false);

  };


  /* =======================================================
     MINI PLAYER
     ======================================================= */

  if (isMinimized) {

    return (
      <div className="aknm-mini-player">

        <button
          type="button"
          className="aknm-mini-cover"
          onClick={() =>
            setIsMinimized(false)
          }
          aria-label="Expand music player"
        >

          {currentTrack.coverUrl ? (

            <img
              src={
                currentTrack.coverUrl
              }
              alt={
                currentTrack.title
              }
            />

          ) : (

            <div className="aknm-cover-placeholder">
              ♪
            </div>

          )}

        </button>


        <button
          type="button"
          className="aknm-mini-track"
          onClick={() =>
            setIsMinimized(false)
          }
          aria-label="Expand music player"
        >

          <span className="aknm-mini-title">
            {currentTrack.title}
          </span>

          <span className="aknm-mini-artist">
            {currentTrack.artistName}
          </span>

        </button>


        <button
          type="button"
          className="aknm-mini-play"
          onClick={togglePlayback}
          aria-label={
            isPlaying
              ? "Pause"
              : "Play"
          }
        >

          {isPlaying ? (
            <PauseIcon />
          ) : (
            <PlayIcon />
          )}

        </button>


        <button
          type="button"
          className="aknm-mini-expand"
          onClick={() =>
            setIsMinimized(false)
          }
          aria-label="Expand player"
        >
          <ExpandIcon />
        </button>


        {/* =================================================
            MOBILE / MINI PLAYER CLOSE BUTTON
           ================================================= */}

        <button
          type="button"
          className="aknm-mini-close"
          onClick={handleClose}
          aria-label="Close music player"
          title="Close music player"
        >
          <CloseIcon />
        </button>


        <div className="aknm-mini-progress">

          <span
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>

      </div>
    );

  }


  /* =======================================================
     FULL STICKY PLAYER
     ======================================================= */

  return (
    <div
      className="aknm-global-player"
      role="region"
      aria-label="Music player"
    >

      {/* =================================================
          MOBILE CLOSE BUTTON
          
          Kept separately from the desktop action group
          so CSS can position it visibly on mobile.
         ================================================= */}

      <button
        type="button"
        className="aknm-mobile-close-button"
        onClick={handleClose}
        aria-label="Close music player"
        title="Close music player"
      >
        <CloseIcon />
      </button>


      {/* =================================================
          LEFT — TRACK INFORMATION
         ================================================= */}

      <div className="aknm-player-track">

        <div className="aknm-player-cover">

          {currentTrack.coverUrl ? (

            <img
              src={
                currentTrack.coverUrl
              }
              alt={
                currentTrack.title
              }
            />

          ) : (

            <div className="aknm-cover-placeholder">
              ♪
            </div>

          )}

        </div>


        <div className="aknm-player-meta">

          <span className="aknm-player-title">
            {currentTrack.title}
          </span>


          <span className="aknm-player-subtitle">

            {currentTrack.artistName}

            {currentTrack.releaseTitle && (
              <>

                <span className="aknm-meta-dot">
                  •
                </span>

                {currentTrack.releaseTitle}

              </>
            )}

          </span>

        </div>

      </div>


      {/* =================================================
          CENTER — PLAYBACK CONTROLS
         ================================================= */}

      <div className="aknm-player-center">

        <div className="aknm-player-controls">

          <button
            type="button"
            className={`aknm-control-button ${
              isShuffle
                ? "is-active"
                : ""
            }`}
            onClick={
              toggleShuffle
            }
            aria-label="Toggle shuffle"
            aria-pressed={
              isShuffle
            }
          >
            <ShuffleIcon />
          </button>


          <button
            type="button"
            className="aknm-control-button"
            onClick={
              playPrevious
            }
            aria-label="Previous track"
          >
            <PreviousIcon />
          </button>


          <button
            type="button"
            className="aknm-main-play-button"
            onClick={
              togglePlayback
            }
            aria-label={
              isPlaying
                ? "Pause"
                : "Play"
            }
          >

            {isPlaying ? (
              <PauseIcon />
            ) : (
              <PlayIcon />
            )}

          </button>


          <button
            type="button"
            className="aknm-control-button"
            onClick={
              playNext
            }
            aria-label="Next track"
          >
            <NextIcon />
          </button>


          <button
            type="button"
            className={`aknm-control-button ${
              repeatMode !==
              "off"
                ? "is-active"
                : ""
            }`}
            onClick={
              cycleRepeatMode
            }
            aria-label={
              `Repeat mode: ${repeatMode}`
            }
            aria-pressed={
              repeatMode !==
              "off"
            }
          >
            <RepeatIcon
              mode={repeatMode}
            />
          </button>

        </div>


        <div className="aknm-progress-row">

          <span className="aknm-time">

            {formatTime(
              currentTime
            )}

          </span>


          <div
            ref={progressRef}
            className="aknm-progress"
            onClick={handleSeek}
            onKeyDown={
              handleProgressKeyDown
            }
            role="slider"
            tabIndex={0}
            aria-label="Music progress"
            aria-valuemin={0}
            aria-valuemax={
              duration
            }
            aria-valuenow={
              currentTime
            }
          >

            <div
              className="aknm-progress-fill"
              style={{
                width:
                  `${progress}%`,
              }}
            />


            <div
              className="aknm-progress-thumb"
              style={{
                left:
                  `${progress}%`,
              }}
            />

          </div>


          <span className="aknm-time">

            {formatTime(
              duration
            )}

          </span>

        </div>

      </div>


      {/* =================================================
          RIGHT — VOLUME / PLAYER ACTIONS
         ================================================= */}

      <div className="aknm-player-actions">

        <div className="aknm-volume">

          <button
            type="button"
            className="aknm-control-button"
            onClick={() =>
              setVolume(
                volume > 0
                  ? 0
                  : 0.8
              )
            }
            aria-label={
              volume > 0
                ? "Mute"
                : "Unmute"
            }
          >

            <VolumeIcon
              muted={
                volume === 0
              }
            />

          </button>


          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) =>
              setVolume(
                Number(
                  event.target.value
                )
              )
            }
            aria-label="Volume"
          />

        </div>


        <button
          type="button"
          className="aknm-control-button"
          onClick={() =>
            setIsMinimized(true)
          }
          aria-label="Minimize player"
        >
          <MinimizeIcon />
        </button>


        {/* =================================================
            DESKTOP CLOSE BUTTON
           ================================================= */}

        <button
          type="button"
          className="aknm-control-button aknm-close-button"
          onClick={handleClose}
          aria-label="Close player"
          title="Close player"
        >
          <CloseIcon />
        </button>

      </div>

    </div>
  );
}