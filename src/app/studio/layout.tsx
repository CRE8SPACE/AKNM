import type { Viewport } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import StudioSidebar from "./components/StudioSidebar/StudioSidebar";
import StudioHeader from "./components/StudioHeader/StudioHeader";

import "./studio-layout.css";

/* =========================================================
   VIEWPORT
   Prevent mobile browsers from automatically zooming the
   Studio interface when interacting with form controls.
   ========================================================= */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/* =========================================================
   LAYOUT
   ========================================================= */

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  /* =======================================================
     AUTHENTICATION
     ======================================================= */

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /* =======================================================
     PROFILE
     ======================================================= */

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  /* =======================================================
     ADMIN ACCESS
     ======================================================= */

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="studio-layout">
      <StudioSidebar />

      <div className="studio-layout__main">
        <StudioHeader
          displayName={
            profile.display_name ||
            "Akonam"
          }
        />

        <main className="studio-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}