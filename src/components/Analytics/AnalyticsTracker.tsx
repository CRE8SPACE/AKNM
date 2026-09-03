"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getVisitorId() {
  const key = "aknm_visitor_id";

  let visitorId =
    localStorage.getItem(key);

  if (!visitorId) {
    visitorId =
      crypto.randomUUID();

    localStorage.setItem(
      key,
      visitorId,
    );
  }

  return visitorId;
}

function getSessionId() {
  const key = "aknm_session_id";

  let sessionId =
    sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId =
      crypto.randomUUID();

    sessionStorage.setItem(
      key,
      sessionId,
    );
  }

  return sessionId;
}

function getDeviceType() {
  const width =
    window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width < 1024) {
    return "tablet";
  }

  return "desktop";
}

function getBrowser() {
  const userAgent =
    navigator.userAgent;

  if (
    userAgent.includes("Edg")
  ) {
    return "Edge";
  }

  if (
    userAgent.includes("Chrome")
  ) {
    return "Chrome";
  }

  if (
    userAgent.includes("Firefox")
  ) {
    return "Firefox";
  }

  if (
    userAgent.includes("Safari")
  ) {
    return "Safari";
  }

  return "Other";
}

function getOS() {
  const userAgent =
    navigator.userAgent;

  if (
    userAgent.includes("Windows")
  ) {
    return "Windows";
  }

  if (
    userAgent.includes("Mac OS")
  ) {
    return "macOS";
  }

  if (
    userAgent.includes("Android")
  ) {
    return "Android";
  }

  if (
    userAgent.includes("iPhone") ||
    userAgent.includes("iPad")
  ) {
    return "iOS";
  }

  if (
    userAgent.includes("Linux")
  ) {
    return "Linux";
  }

  return "Other";
}

export default function AnalyticsTracker() {
  const pathname =
    usePathname();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const payload = {
      event_type:
        "page_view",

      path:
        pathname,

      page_title:
        document.title,

      referrer:
        document.referrer || null,

      visitor_id:
        getVisitorId(),

      session_id:
        getSessionId(),

      device_type:
        getDeviceType(),

      browser:
        getBrowser(),

      os:
        getOS(),

      metadata: {
        screen_width:
          window.screen.width,

        screen_height:
          window.screen.height,

        language:
          navigator.language,
      },
    };

    fetch("/api/analytics", {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(payload),

      keepalive: true,
    }).catch(() => {
      /*
       * Analytics must never
       * interfere with the website.
       */
    });
  }, [pathname]);

  return null;
}