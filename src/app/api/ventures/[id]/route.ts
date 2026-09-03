import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";


/* =========================================================
   GET — SINGLE VENTURE
   ========================================================= */

export async function GET(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Venture ID is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ventures")
      .select(
        `
          id,
          number,
          type,
          name,
          slug,
          description,
          status,
          year,
          href,
          featured,
          is_visible,
          display_order,
          created_at,
          updated_at
        `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "GET /api/studio/ventures/[id] error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.code === "PGRST116"
              ? "Venture not found."
              : error.message,
        },
        {
          status:
            error.code === "PGRST116"
              ? 404
              : 500,
        }
      );
    }

    return NextResponse.json({
      venture: data,
    });

  } catch (error) {
    console.error(
      "GET /api/studio/ventures/[id] exception:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not load venture.",
      },
      { status: 500 }
    );
  }
}


/* =========================================================
   PATCH — UPDATE VENTURE
   ========================================================= */

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Venture ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      number,
      type,
      name,
      slug,
      description,
      status,
      year,
      href,
      featured,
      is_visible,
      display_order,
    } = body;


    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (
      number === undefined ||
      !Number.isInteger(Number(number)) ||
      Number(number) < 1
    ) {
      return NextResponse.json(
        {
          error:
            "A valid venture number is required.",
        },
        { status: 400 }
      );
    }

    const validTypes = [
      "COMPANY",
      "PRODUCT",
      "BRAND",
      "EXPERIMENT",
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          error: "Invalid venture type.",
        },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Venture name is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Venture slug is required.",
        },
        { status: 400 }
      );
    }


    /* -------------------------------------------------------
       SUPABASE
       ------------------------------------------------------- */

    const supabase = await createClient();


    /* -------------------------------------------------------
       CHECK EXISTING VENTURE
       ------------------------------------------------------- */

    const { data: existing, error: existingError } =
      await supabase
        .from("ventures")
        .select("id")
        .eq("id", id)
        .single();

    if (existingError || !existing) {
      return NextResponse.json(
        {
          error: "Venture not found.",
        },
        { status: 404 }
      );
    }


    /* -------------------------------------------------------
       CHECK SLUG COLLISION
       ------------------------------------------------------- */

    const { data: slugMatch, error: slugError } =
      await supabase
        .from("ventures")
        .select("id")
        .eq("slug", slug.trim())
        .neq("id", id)
        .maybeSingle();

    if (slugError) {
      console.error(
        "Slug check error:",
        slugError
      );

      return NextResponse.json(
        {
          error:
            "Could not validate venture slug.",
        },
        { status: 500 }
      );
    }

    if (slugMatch) {
      return NextResponse.json(
        {
          error:
            "Another venture already uses this slug.",
        },
        { status: 409 }
      );
    }


    /* -------------------------------------------------------
       UPDATE
       ------------------------------------------------------- */

    const { data, error } = await supabase
      .from("ventures")
      .update({
        number: Number(number),
        type,
        name: name.trim(),
        slug: slug.trim(),
        description:
          typeof description === "string" &&
          description.trim()
            ? description.trim()
            : null,
        status:
          typeof status === "string" &&
          status.trim()
            ? status.trim().toUpperCase()
            : "BUILDING",
        year:
          typeof year === "string" &&
          year.trim()
            ? year.trim()
            : null,
        href:
          typeof href === "string" &&
          href.trim()
            ? href.trim()
            : null,
        featured:
          typeof featured === "boolean"
            ? featured
            : false,
        is_visible:
          typeof is_visible === "boolean"
            ? is_visible
            : true,
        display_order:
          Number.isInteger(
            Number(display_order)
          )
            ? Number(display_order)
            : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
          id,
          number,
          type,
          name,
          slug,
          description,
          status,
          year,
          href,
          featured,
          is_visible,
          display_order,
          created_at,
          updated_at
        `
      )
      .single();

    if (error) {
      console.error(
        "PATCH /api/studio/ventures/[id] error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.code === "23505"
              ? "A venture with this slug already exists."
              : error.message ||
                "Could not update venture.",
        },
        {
          status:
            error.code === "23505"
              ? 409
              : 500,
        }
      );
    }


    /* -------------------------------------------------------
       RESPONSE
       ------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      venture: data,
    });

  } catch (error) {
    console.error(
      "PATCH /api/studio/ventures/[id] exception:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not update venture.",
      },
      { status: 500 }
    );
  }
}


/* =========================================================
   DELETE — DELETE VENTURE
   ========================================================= */

export async function DELETE(
  _request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Venture ID is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("ventures")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error(
        "DELETE /api/studio/ventures/[id] error:",
        error
      );

      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "Venture not found.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error:
            error.message ||
            "Could not delete venture.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });

  } catch (error) {
    console.error(
      "DELETE /api/studio/ventures/[id] exception:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not delete venture.",
      },
      { status: 500 }
    );
  }
}