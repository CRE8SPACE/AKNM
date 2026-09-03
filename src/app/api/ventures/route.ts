import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";


export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const supabase =
      await createClient();


    const {
      data,
      error,
    } =
      await supabase
        .from("ventures")
        .insert({
          number: body.number,
          type: body.type,
          name: body.name,
          slug: body.slug,
          description:
            body.description ?? null,
          status:
            body.status ?? "BUILDING",
          year:
            body.year ?? null,
          href:
            body.href ?? null,
          featured:
            body.featured ?? false,
          is_visible:
            body.is_visible ?? true,
          display_order:
            body.display_order ?? 0,
        })
        .select()
        .single();


    if (error) {
      console.error(
        "Create venture error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );
    }


    return NextResponse.json(
      {
        venture: data,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "Create venture error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the venture.",
      },
      {
        status: 500,
      }
    );
  }
}