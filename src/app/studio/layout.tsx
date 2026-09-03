import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import StudioSidebar from "./components/StudioSidebar/StudioSidebar";
import StudioHeader from "./components/StudioHeader/StudioHeader";

import "./studio-layout.css";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(
      "display_name, role"
    )
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/");
  }

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

        <div className="studio-layout__content">
          {children}
        </div>

      </div>

    </div>
  );
}