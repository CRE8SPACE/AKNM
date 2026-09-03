import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type AnalyticsPayload = {
  event_type?: string;
  path?: string;
  page_title?: string | null;
  referrer?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  country?: string | null;
  city?: string | null;
  metadata?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const body =
      (await request.json()) as AnalyticsPayload;

    if (!body.event_type) {
      return NextResponse.json(
        {
          error: "Missing event_type",
        },
        {
          status: 400,
        },
      );
    }

    if (!body.path) {
      return NextResponse.json(
        {
          error: "Missing path",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();

    const { error } =
      await supabase
        .from("analytics_events")
        .insert({
          event_type:
            body.event_type,

          path:
            body.path,

          page_title:
            body.page_title ?? null,

          referrer:
            body.referrer ?? null,

          visitor_id:
            body.visitor_id ?? null,

          session_id:
            body.session_id ?? null,

          user_id:
            user?.id ?? null,

          device_type:
            body.device_type ?? null,

          browser:
            body.browser ?? null,

          os:
            body.os ?? null,

          country:
            body.country ?? null,

          city:
            body.city ?? null,

          metadata:
            body.metadata ?? {},
        });

    if (error) {
      console.error(
        "Analytics insert error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Could not record analytics event",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Analytics API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Invalid analytics request",
      },
      {
        status: 400,
      },
    );
  }
}