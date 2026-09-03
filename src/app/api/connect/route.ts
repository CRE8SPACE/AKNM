import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";


export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("connect_settings")
    .select(`
      primary_email,
      business_email,
      phone,
      whatsapp,
      instagram,
      youtube,
      x,
      facebook,
      linkedin,
      tiktok,
      github,
      form_enabled
    `)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Connect settings API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not load connect settings.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(data);
}