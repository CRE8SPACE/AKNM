"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import "./StudioHeader.css";

type StudioHeaderProps = {
  displayName: string;
};

export default function StudioHeader({
  displayName,
}: StudioHeaderProps) {
  const router = useRouter();

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="studio-topbar">

      <div className="studio-topbar__left">

        <span className="studio-topbar__mobile-title">
          AKNM STUDIO
        </span>

        <span className="studio-topbar__separator">
          /
        </span>

        <span className="studio-topbar__current">
          Overview
        </span>

      </div>


      <div className="studio-topbar__right">

        <div className="studio-topbar__user">
          <span className="studio-topbar__status" />

          <span>
            {displayName}
          </span>
        </div>


        <button
          type="button"
          className="studio-topbar__logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut
            ? "Signing out..."
            : "Sign out"}

          <span>
            ↗
          </span>
        </button>

      </div>

    </header>
  );
}