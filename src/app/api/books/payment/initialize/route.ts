import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";


/* =========================================================
   TYPES
   ========================================================= */

type InitializeBody = {
  bookId?: string;
  email?: string;
};


/* =========================================================
   POST
   ========================================================= */

export async function POST(
  request: NextRequest
) {

  try {

    const body =
      (await request.json()) as InitializeBody;


    const bookId =
      body.bookId?.trim();


    const email =
      body.email?.trim().toLowerCase();


    if (!bookId) {

      return NextResponse.json(
        {
          success: false,
          error: "Book ID is required.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );

    }


    const supabase =
      await createClient();


    /* =======================================================
       GET BOOK
       ======================================================= */

    const {
      data: book,
      error: bookError,
    } =
      await supabase
        .from("books")
        .select(`
          id,
          title,
          slug,
          status,
          price,
          currency,
          pricing_type,
          reading_access,
          download_access
        `)
        .eq(
          "id",
          bookId
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();


    if (
      bookError
    ) {

      console.error(
        "Payment book lookup error:",
        bookError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Could not load the book.",
        },
        {
          status: 500,
        }
      );

    }


    if (!book) {

      return NextResponse.json(
        {
          success: false,
          error: "Book not found.",
        },
        {
          status: 404,
        }
      );

    }


    /* =======================================================
       PAYMENT VALIDATION
       ======================================================= */

    if (
      book.pricing_type !==
      "paid"
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "This book does not require payment.",
        },
        {
          status: 400,
        }
      );

    }


    if (
      book.price === null ||
      Number(book.price) <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "This book does not have a valid price.",
        },
        {
          status: 400,
        }
      );

    }


    const currency =
      String(
        book.currency ||
        "NGN"
      ).toUpperCase();


    /*
     * Paystack amount is supplied in the
     * smallest currency denomination.
     *
     * NGN 5,000 = 500000 kobo.
     */

    const amountSubunit =
      Math.round(
        Number(book.price) *
        100
      );


    if (
      amountSubunit <= 0
    ) {

      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment amount.",
        },
        {
          status: 400,
        }
      );

    }


    /* =======================================================
       SERVER ENVIRONMENT
       ======================================================= */

    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;


    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;


    if (
      !secretKey
    ) {

      console.error(
        "PAYSTACK_SECRET_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Payment service is not configured.",
        },
        {
          status: 500,
        }
      );

    }


    if (
      !serviceRoleKey
    ) {

      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Payment database service is not configured.",
        },
        {
          status: 500,
        }
      );

    }


    /* =======================================================
       SERVICE ROLE CLIENT
       ======================================================= */

    const { createClient: createAdminClient } =
      await import(
        "@supabase/supabase-js"
      );


    const admin =
      createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken:
              false,

            persistSession:
              false,
          },
        }
      );


    /* =======================================================
       EXISTING PURCHASE
       ======================================================= */

    const {
      data: existingPurchase,
      error: existingError,
    } =
      await admin
        .from("book_payments")
        .select(`
          id,
          status,
          payment_reference
        `)
        .eq(
          "book_id",
          bookId
        )
        .eq(
          "customer_email",
          email
        )
        .eq(
          "status",
          "paid"
        )
        .maybeSingle();


    if (
      existingError
    ) {

      console.error(
        "Existing purchase lookup error:",
        existingError
      );

    }


    if (
      existingPurchase
    ) {

      return NextResponse.json(
        {
          success: false,
          alreadyPurchased: true,
          error:
            "This book has already been purchased with this email address.",
        },
        {
          status: 409,
        }
      );

    }


    /* =======================================================
       REFERENCE
       ======================================================= */

    const reference =
      `AKNM-BOOK-${bookId}-${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;


    /* =======================================================
       CREATE PAYMENT RECORD
       ======================================================= */

    const {
      data: payment,
      error: paymentInsertError,
    } =
      await admin
        .from("book_payments")
        .insert({

          book_id:
            bookId,

          customer_email:
            email,

          payment_provider:
            "paystack",

          payment_reference:
            reference,

          amount:
            Number(book.price),

          currency,

          status:
            "pending",

        })
        .select(
          "id"
        )
        .single();


    if (
      paymentInsertError ||
      !payment
    ) {

      console.error(
        "Payment record creation error:",
        paymentInsertError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Could not create payment record.",
        },
        {
          status: 500,
        }
      );

    }


    /* =======================================================
       PAYSTACK INITIALIZATION
       ======================================================= */

    const origin =
      request.nextUrl.origin;


    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method:
            "POST",

          headers: {

            Authorization:
              `Bearer ${secretKey}`,

            "Content-Type":
              "application/json",

          },

          body:
            JSON.stringify({

              amount:
                String(
                  amountSubunit
                ),

              email,

              currency,

              reference,

              /*
               * AKNM is deliberately
               * using card payments only.
               */

              channels: [
                "card",
              ],

              metadata: {

                payment_id:
                  payment.id,

                book_id:
                  bookId,

                book_title:
                  book.title,

                customer_email:
                  email,

              },

              callback_url:
                `${origin}/books/${encodeURIComponent(
                  book.slug
                )}`,

            }),

        }
      );


    const paystackData =
      await paystackResponse.json();


    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
    ) {

      console.error(
        "Paystack initialization error:",
        paystackData
      );


      await admin
        .from("book_payments")
        .update({
          status:
            "failed",

          gateway_status:
            "initialization_failed",

          verification_data:
            paystackData,
        })
        .eq(
          "id",
          payment.id
        );


      return NextResponse.json(
        {
          success: false,
          error:
            paystackData?.message ||
            "Could not initialize payment.",
        },
        {
          status: 502,
        }
      );

    }


    /* =======================================================
       SAVE PAYSTACK ACCESS CODE
       ======================================================= */

    await admin
      .from("book_payments")
      .update({

        paystack_access_code:
          paystackData.data.access_code,

      })
      .eq(
        "id",
        payment.id
      );


    /* =======================================================
       RESPONSE
       ======================================================= */

    return NextResponse.json({

      success:
        true,

      paymentId:
        payment.id,

      reference:
        paystackData.data.reference,

      accessCode:
        paystackData.data.access_code,

      authorizationUrl:
        paystackData.data.authorization_url,

    });

  } catch (
    error
  ) {

    console.error(
      "Book payment initialization error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to initialize payment.",
      },
      {
        status: 500,
      }
    );

  }

}