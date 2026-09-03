"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";


/* =========================================================
   TYPES
   ========================================================= */

export type MusicTrack = {
  id: string;

  title: string;

  duration: number | null;

  audioUrl: string | null;

  releaseId: string;

  releaseTitle: string;

  artistName: string;

  coverUrl: string | null;
};


type RepeatMode =
  | "off"
  | "all"
  | "one";


type MusicPlayerContextValue = {
  queue: MusicTrack[];

  currentTrack: MusicTrack | null;

  currentIndex: number;

  isPlaying: boolean;

  currentTime: number;

  duration: number;

  volume: number;

  isShuffle: boolean;

  repeatMode: RepeatMode;

  setQueue: (
    tracks: MusicTrack[],
    startTrackId?: string
  ) => void;

  playTrack: (
    track: MusicTrack,
    queue?: MusicTrack[]
  ) => void;

  togglePlayback: () => void;

  playNext: () => void;

  playPrevious: () => void;

  replayTrack: () => void;

  seekTo: (
    time: number
  ) => void;

  setVolume: (
    volume: number
  ) => void;

  toggleShuffle: () => void;

  cycleRepeatMode: () => void;

  stopPlayback: () => void;

  dismissPlayer: () => void;
};


/* =========================================================
   CONTEXT
   ========================================================= */

const MusicPlayerContext =
  createContext<MusicPlayerContextValue | null>(
    null
  );


/* =========================================================
   PROVIDER
   ========================================================= */

export function MusicPlayerProvider({
  children,
}: {
  children: ReactNode;
}) {


  /* =======================================================
     AUDIO ENGINE
     ONE AUDIO INSTANCE FOR THE ENTIRE APPLICATION
     ======================================================= */

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );


  /* =======================================================
     STATE
     ======================================================= */

  const [queue, setQueueState] =
    useState<MusicTrack[]>([]);


  const [currentTrack, setCurrentTrack] =
    useState<MusicTrack | null>(
      null
    );


  const [currentIndex, setCurrentIndex] =
    useState(-1);


  const [isPlaying, setIsPlaying] =
    useState(false);


  const [currentTime, setCurrentTime] =
    useState(0);


  const [duration, setDuration] =
    useState(0);


  const [volume, setVolumeState] =
    useState(1);


  const [isShuffle, setIsShuffle] =
    useState(false);


  const [repeatMode, setRepeatMode] =
    useState<RepeatMode>("off");


  /* =======================================================
     REFS FOR AUDIO EVENT LISTENERS
     ======================================================= */

  const queueRef =
    useRef<MusicTrack[]>([]);


  const currentIndexRef =
    useRef(-1);


  const shuffleRef =
    useRef(false);


  const repeatModeRef =
    useRef<RepeatMode>("off");


  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);


  useEffect(() => {
    currentIndexRef.current =
      currentIndex;
  }, [currentIndex]);


  useEffect(() => {
    shuffleRef.current =
      isShuffle;
  }, [isShuffle]);


  useEffect(() => {
    repeatModeRef.current =
      repeatMode;
  }, [repeatMode]);


  /* =======================================================
     CREATE AUDIO ENGINE

     This runs only once.

     The provider is mounted in RootLayout, so this audio
     instance survives client-side navigation.
     ======================================================= */

  useEffect(() => {

    const audio =
      new Audio();


    audio.preload =
      "metadata";


    audio.volume = 1;


    audioRef.current =
      audio;


    /* -----------------------------------------------------
       TIME UPDATE
       ----------------------------------------------------- */

    const handleTimeUpdate = () => {
      setCurrentTime(
        audio.currentTime || 0
      );
    };


    /* -----------------------------------------------------
       METADATA
       ----------------------------------------------------- */

    const handleLoadedMetadata = () => {

      const nextDuration =
        Number.isFinite(
          audio.duration
        )
          ? audio.duration
          : 0;


      setDuration(
        nextDuration
      );

    };


    /* -----------------------------------------------------
       PLAY
       ----------------------------------------------------- */

    const handlePlay = () => {
      setIsPlaying(true);
    };


    /* -----------------------------------------------------
       PAUSE
       ----------------------------------------------------- */

    const handlePause = () => {
      setIsPlaying(false);
    };


    /* -----------------------------------------------------
       ENDED
       ----------------------------------------------------- */

    const handleEnded = () => {

      const tracks =
        queueRef.current;


      const index =
        currentIndexRef.current;


      const shuffle =
        shuffleRef.current;


      const repeat =
        repeatModeRef.current;


      /*
      Repeat current track.
      */

      if (
        repeat === "one"
      ) {

        audio.currentTime = 0;


        audio.play().catch(() => {
          setIsPlaying(false);
        });


        return;

      }


      /*
      No queue.
      */

      if (
        tracks.length === 0
      ) {

        setIsPlaying(false);

        return;

      }


      /*
      Determine next track.
      */

      let nextIndex =
        index + 1;


      /*
      Shuffle.
      */

      if (
        shuffle &&
        tracks.length > 1
      ) {

        let randomIndex =
          Math.floor(
            Math.random() *
              tracks.length
          );


        while (
          randomIndex === index
        ) {

          randomIndex =
            Math.floor(
              Math.random() *
                tracks.length
            );

        }


        nextIndex =
          randomIndex;

      }


      /*
      End of queue.
      */

      if (
        nextIndex >= tracks.length
      ) {

        if (
          repeat === "all"
        ) {

          nextIndex = 0;

        } else {

          setIsPlaying(false);

          return;

        }

      }


      const nextTrack =
        tracks[nextIndex];


      if (
        !nextTrack?.audioUrl
      ) {

        setIsPlaying(false);

        return;

      }


      /*
      Switch to next track.

      The currentTrack effect below will load
      the new source and begin playback.
      */

      setCurrentIndex(
        nextIndex
      );


      setCurrentTrack(
        nextTrack
      );


      setCurrentTime(0);

      setIsPlaying(true);

    };


    /* -----------------------------------------------------
       ERROR
       ----------------------------------------------------- */

    const handleError = () => {

      console.error(
        "Music playback error.",
        audio.error
      );


      setIsPlaying(false);

    };


    /* -----------------------------------------------------
       EVENT LISTENERS
       ----------------------------------------------------- */

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );


    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );


    audio.addEventListener(
      "play",
      handlePlay
    );


    audio.addEventListener(
      "pause",
      handlePause
    );


    audio.addEventListener(
      "ended",
      handleEnded
    );


    audio.addEventListener(
      "error",
      handleError
    );


    /* -----------------------------------------------------
       CLEANUP
       ----------------------------------------------------- */

    return () => {

      audio.pause();


      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );


      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );


      audio.removeEventListener(
        "play",
        handlePlay
      );


      audio.removeEventListener(
        "pause",
        handlePause
      );


      audio.removeEventListener(
        "ended",
        handleEnded
      );


      audio.removeEventListener(
        "error",
        handleError
      );


      audio.src = "";


      audioRef.current =
        null;

    };

  }, []);


  /* =======================================================
     LOAD CURRENT TRACK
     ======================================================= */

  useEffect(() => {

    const audio =
      audioRef.current;


    if (
      !audio ||
      !currentTrack?.audioUrl
    ) {
      return;
    }


    /*
    Pause the existing source before replacement.
    */

    audio.pause();


    /*
    Reset the source.
    */

    audio.src =
      currentTrack.audioUrl;


    audio.currentTime = 0;


    setCurrentTime(0);


    setDuration(
      currentTrack.duration ?? 0
    );


    audio.load();


    /*
    Start playback automatically.

    A track can only reach this state after
    playTrack(), playNext(), playPrevious()
    or automatic queue progression.
    */

    const playAudio =
      async () => {

        try {

          await audio.play();

        } catch (error) {

          console.error(
            "Unable to start playback.",
            error
          );


          setIsPlaying(false);

        }

      };


    playAudio();

  }, [
    currentTrack?.id,
    currentTrack?.audioUrl,
  ]);


  /* =======================================================
     VOLUME
     ======================================================= */

  useEffect(() => {

    const audio =
      audioRef.current;


    if (!audio) {
      return;
    }


    audio.volume =
      volume;

  }, [volume]);


  /* =======================================================
     SET QUEUE
     ======================================================= */

  const setQueue =
    useCallback(
      (
        tracks: MusicTrack[],
        startTrackId?: string
      ) => {

        setQueueState(
          tracks
        );


        if (
          !startTrackId
        ) {
          return;
        }


        const index =
          tracks.findIndex(
            (track) =>
              track.id ===
              startTrackId
          );


        if (
          index < 0
        ) {
          return;
        }


        setCurrentIndex(
          index
        );


        setCurrentTrack(
          tracks[index]
        );

      },
      []
    );


  /* =======================================================
     PLAY TRACK
     ======================================================= */

  const playTrack =
    useCallback(
      (
        track: MusicTrack,
        nextQueue?: MusicTrack[]
      ) => {

        if (
          !track.audioUrl
        ) {
          return;
        }


        /*
        Use supplied queue when available.
        Otherwise preserve the existing queue.

        If there is no existing queue,
        use the selected track itself.
        */

        const tracks =
          nextQueue &&
          nextQueue.length > 0
            ? nextQueue
            : queue.length > 0
              ? queue
              : [track];


        const index =
          tracks.findIndex(
            (item) =>
              item.id ===
              track.id
          );


        /*
        Same track:
        simply toggle playback.
        */

        if (
          currentTrack?.id ===
          track.id
        ) {

          const audio =
            audioRef.current;


          if (!audio) {
            return;
          }


          if (
            audio.paused
          ) {

            audio.play().catch(() => {
              setIsPlaying(false);
            });

          } else {

            audio.pause();

          }


          return;

        }


        /*
        New track.
        */

        setQueueState(
          tracks
        );


        setCurrentIndex(
          index >= 0
            ? index
            : 0
        );


        setCurrentTrack(
          track
        );


        setCurrentTime(0);

        setIsPlaying(true);

      },
      [
        currentTrack?.id,
        queue,
      ]
    );


  /* =======================================================
     PLAY / PAUSE
     ======================================================= */

  const togglePlayback =
    useCallback(() => {

      const audio =
        audioRef.current;


      if (
        !audio ||
        !currentTrack
      ) {
        return;
      }


      if (
        audio.paused
      ) {

        audio.play().catch(() => {
          setIsPlaying(false);
        });

      } else {

        audio.pause();

      }

    }, [
      currentTrack,
    ]);


  /* =======================================================
     NEXT
     ======================================================= */

  const playNext =
    useCallback(() => {

      if (
        queue.length === 0
      ) {
        return;
      }


      let nextIndex =
        currentIndex + 1;


      /*
      Shuffle.
      */

      if (
        isShuffle &&
        queue.length > 1
      ) {

        let randomIndex =
          Math.floor(
            Math.random() *
              queue.length
          );


        while (
          randomIndex ===
          currentIndex
        ) {

          randomIndex =
            Math.floor(
              Math.random() *
                queue.length
            );

        }


        nextIndex =
          randomIndex;

      }


      /*
      End of queue.
      */

      if (
        nextIndex >=
        queue.length
      ) {

        if (
          repeatMode ===
          "all"
        ) {

          nextIndex = 0;

        } else {

          return;

        }

      }


      const nextTrack =
        queue[nextIndex];


      if (
        !nextTrack?.audioUrl
      ) {
        return;
      }


      setCurrentIndex(
        nextIndex
      );


      setCurrentTrack(
        nextTrack
      );


      setCurrentTime(0);

      setIsPlaying(true);

    }, [
      currentIndex,
      isShuffle,
      queue,
      repeatMode,
    ]);


  /* =======================================================
     PREVIOUS
     ======================================================= */

  const playPrevious =
    useCallback(() => {

      const audio =
        audioRef.current;


      /*
      Restart current track if more than
      three seconds have passed.
      */

      if (
        audio &&
        audio.currentTime > 3
      ) {

        audio.currentTime = 0;

        setCurrentTime(0);

        return;

      }


      if (
        queue.length === 0
      ) {
        return;
      }


      let previousIndex =
        currentIndex - 1;


      if (
        previousIndex < 0
      ) {

        if (
          repeatMode ===
          "all"
        ) {

          previousIndex =
            queue.length - 1;

        } else {

          previousIndex = 0;

        }

      }


      const previousTrack =
        queue[
          previousIndex
        ];


      if (
        !previousTrack?.audioUrl
      ) {
        return;
      }


      setCurrentIndex(
        previousIndex
      );


      setCurrentTrack(
        previousTrack
      );


      setCurrentTime(0);

      setIsPlaying(true);

    }, [
      currentIndex,
      queue,
      repeatMode,
    ]);


  /* =======================================================
     REPLAY
     ======================================================= */

  const replayTrack =
    useCallback(() => {

      const audio =
        audioRef.current;


      if (!audio) {
        return;
      }


      audio.currentTime = 0;


      setCurrentTime(0);


      audio.play().catch(() => {
        setIsPlaying(false);
      });

    }, []);


  /* =======================================================
     SEEK
     ======================================================= */

  const seekTo =
    useCallback(
      (
        time: number
      ) => {

        const audio =
          audioRef.current;


        if (!audio) {
          return;
        }


        const maxDuration =
          Number.isFinite(
            audio.duration
          )
            ? audio.duration
            : duration;


        const safeDuration =
          maxDuration > 0
            ? maxDuration
            : duration;


        const safeTime =
          Math.max(
            0,
            Math.min(
              time,
              safeDuration
            )
          );


        audio.currentTime =
          safeTime;


        setCurrentTime(
          safeTime
        );

      },
      [duration]
    );


  /* =======================================================
     SET VOLUME
     ======================================================= */

  const setVolume =
    useCallback(
      (
        nextVolume: number
      ) => {

        const safeVolume =
          Math.max(
            0,
            Math.min(
              1,
              nextVolume
            )
          );


        setVolumeState(
          safeVolume
        );

      },
      []
    );


  /* =======================================================
     SHUFFLE
     ======================================================= */

  const toggleShuffle =
    useCallback(() => {

      setIsShuffle(
        (previous) =>
          !previous
      );

    }, []);


  /* =======================================================
     REPEAT
     ======================================================= */

  const cycleRepeatMode =
    useCallback(() => {

      setRepeatMode(
        (previous) => {

          if (
            previous ===
            "off"
          ) {
            return "all";
          }


          if (
            previous ===
            "all"
          ) {
            return "one";
          }


          return "off";

        }
      );

    }, []);


  /* =======================================================
     STOP PLAYBACK

     Pause audio but preserve the selected track.
     ======================================================= */

  const stopPlayback =
    useCallback(() => {

      const audio =
        audioRef.current;


      if (audio) {

        audio.pause();

        audio.currentTime = 0;

      }


      setIsPlaying(false);

      setCurrentTime(0);

    }, []);


  /* =======================================================
     DISMISS PLAYER

     Completely closes the player.

     This clears the selected track so the
     GlobalMusicPlayer disappears.
     ======================================================= */

  const dismissPlayer =
    useCallback(() => {

      const audio =
        audioRef.current;


      if (audio) {

        audio.pause();

        audio.currentTime = 0;

        audio.removeAttribute(
          "src"
        );

        audio.load();

      }


      setIsPlaying(false);

      setCurrentTime(0);

      setDuration(0);

      setCurrentTrack(null);

      setCurrentIndex(-1);

    }, []);


  /* =======================================================
     CONTEXT VALUE
     ======================================================= */

  const value =
    useMemo<MusicPlayerContextValue>(
      () => ({
        queue,

        currentTrack,

        currentIndex,

        isPlaying,

        currentTime,

        duration,

        volume,

        isShuffle,

        repeatMode,

        setQueue,

        playTrack,

        togglePlayback,

        playNext,

        playPrevious,

        replayTrack,

        seekTo,

        setVolume,

        toggleShuffle,

        cycleRepeatMode,

        stopPlayback,

        dismissPlayer,
      }),
      [
        queue,
        currentTrack,
        currentIndex,
        isPlaying,
        currentTime,
        duration,
        volume,
        isShuffle,
        repeatMode,
        setQueue,
        playTrack,
        togglePlayback,
        playNext,
        playPrevious,
        replayTrack,
        seekTo,
        setVolume,
        toggleShuffle,
        cycleRepeatMode,
        stopPlayback,
        dismissPlayer,
      ]
    );


  return (
    <MusicPlayerContext.Provider
      value={value}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}


/* =========================================================
   HOOK
   ========================================================= */

export function useMusicPlayer() {

  const context =
    useContext(
      MusicPlayerContext
    );


  if (!context) {

    throw new Error(
      "useMusicPlayer must be used inside MusicPlayerProvider."
    );

  }


  return context;
}