import { NextRequest, NextResponse } from "next/server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";


export async function POST(
  request: NextRequest
) {

  try {

    const {
      reference,
    } =
      await request.json();


    if (
      !reference ||
      typeof reference !==
        "string"
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment reference is required.",
        },
        {
          status: 400,
        }
      );

    }


    const secretKey =
      process.env.PAYSTACK_SECRET_KEY;


    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;


    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;


    if (
      !secretKey ||
      !serviceRoleKey ||
      !supabaseUrl
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification is not configured.",
        },
        {
          status: 500,
        }
      );

    }


    const admin =
      createSupabaseClient(
        supabaseUrl,
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
       GET PAYMENT
       ======================================================= */

    const {
      data: payment,
      error: paymentError,
    } =
      await admin
        .from("book_payments")
        .select(`
          id,
          book_id,
          customer_email,
          payment_reference,
          amount,
          currency,
          status
        `)
        .eq(
          "payment_reference",
          reference
        )
        .maybeSingle();


    if (
      paymentError
    ) {

      console.error(
        "Payment lookup error:",
        paymentError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Could not find payment.",
        },
        {
          status: 500,
        }
      );

    }


    if (
      !payment
    ) {

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment record not found.",
        },
        {
          status: 404,
        }
      );

    }


    /* =======================================================
       PAYSTACK VERIFY
       ======================================================= */

    const response =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method:
            "GET",

          headers: {

            Authorization:
              `Bearer ${secretKey}`,

          },

          cache:
            "no-store",

        }
      );


    const result =
      await response.json();


    if (
      !response.ok ||
      !result?.status ||
      !result?.data
    ) {

      await admin
        .from("book_payments")
        .update({

          status:
            "failed",

          gateway_status:
            "verification_failed",

          verification_data:
            result,

        })
        .eq(
          "id",
          payment.id
        );


      return NextResponse.json(
        {
          success: false,
          error:
            result?.message ||
            "Payment could not be verified.",
        },
        {
          status: 400,
        }
      );

    }


    const transaction =
      result.data;


    /* =======================================================
       VERIFY AMOUNT
       ======================================================= */

    const expectedAmount =
      Math.round(
        Number(payment.amount) *
        100
      );


    const receivedAmount =
      Number(
        transaction.amount
      );


    if (
      receivedAmount !==
      expectedAmount
    ) {

      console.error(
        "Payment amount mismatch:",
        {
          reference,
          expectedAmount,
          receivedAmount,
        }
      );


      await admin
        .from("book_payments")
        .update({

          status:
            "failed",

          gateway_status:
            "amount_mismatch",

          verification_data:
            transaction,

        })
        .eq(
          "id",
          payment.id
        );


      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match the book price.",
        },
        {
          status: 400,
        }
      );

    }


    /* =======================================================
       VERIFY CURRENCY
       ======================================================= */

    const receivedCurrency =
      String(
        transaction.currency ||
        ""
      ).toUpperCase();


    const expectedCurrency =
      String(
        payment.currency
      ).toUpperCase();


    if (
      receivedCurrency !==
      expectedCurrency
    ) {

      await admin
        .from("book_payments")
        .update({

          status:
            "failed",

          gateway_status:
            "currency_mismatch",

          verification_data:
            transaction,

        })
        .eq(
          "id",
          payment.id
        );


      return NextResponse.json(
        {
          success: false,
          error:
            "Payment currency does not match the book price.",
        },
        {
          status: 400,
        }
      );

    }


    /* =======================================================
       VERIFY STATUS
       ======================================================= */

    const isSuccessful =
      transaction.status ===
      "success";


    if (
      !isSuccessful
    ) {

      await admin
        .from("book_payments")
        .update({

          status:
            transaction.status ===
            "failed"
              ? "failed"
              : "processing",

          gateway_status:
            transaction.status,

          verification_data:
            transaction,

        })
        .eq(
          "id",
          payment.id
        );


      return NextResponse.json(
        {
          success: false,
          paid: false,
          status:
            transaction.status,
          error:
            "Payment has not been completed.",
        },
        {
          status: 400,
        }
      );

    }


    /* =======================================================
       IDEMPOTENT SUCCESS
       ======================================================= */

    const paidAt =
      transaction.paid_at ||
      new Date().toISOString();


    const {
      error: updateError,
    } =
      await admin
        .from("book_payments")
        .update({

          status:
            "paid",

          gateway_status:
            transaction.status,

          paystack_transaction_id:
            transaction.id ??
            null,

          paystack_customer_code:
            transaction.customer?.customer_code ??
            null,

          payment_channel:
            transaction.channel ??
            null,

          paid_at:
            paidAt,

          verified_at:
            new Date().toISOString(),

          access_granted:
            true,

          verification_data:
            transaction,

        })
        .eq(
          "id",
          payment.id
        );


    if (
      updateError
    ) {

      console.error(
        "Payment success update error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment was verified but could not update the purchase record.",
        },
        {
          status: 500,
        }
      );

    }


    /* =======================================================
       GET BOOK FILE
       ======================================================= */

    const {
      data: book,
      error: bookError,
    } =
      await admin
        .from("books")
        .select(`
          id,
          title,
          pdf_bucket,
          pdf_path,
          reading_access,
          download_access
        `)
        .eq(
          "id",
          payment.book_id
        )
        .maybeSingle();


    if (
      bookError ||
      !book
    ) {

      return NextResponse.json(
        {
          success: true,
          paid: true,
          accessGranted: true,
          error:
            "Payment confirmed, but the book file could not be loaded yet.",
        }
      );

    }


    /* =======================================================
       SIGNED URLS
       ======================================================= */

    let readingUrl:
      string | null =
      null;

    let downloadUrl:
      string | null =
      null;


    if (
      book.pdf_bucket &&
      book.pdf_path
    ) {

      const {
        data: readData,
        error: readError,
      } =
        await admin.storage
          .from(
            book.pdf_bucket
          )
          .createSignedUrl(
            book.pdf_path,
            60 * 60
          );


      if (
        !readError
      ) {

        readingUrl =
          readData?.signedUrl ??
          null;

      }


      const {
        data: downloadData,
        error: downloadError,
      } =
        await admin.storage
          .from(
            book.pdf_bucket
          )
          .createSignedUrl(
            book.pdf_path,
            60 * 60,
            {
              download:
                true,
            }
          );


      if (
        !downloadError
      ) {

        downloadUrl =
          downloadData?.signedUrl ??
          null;

      }

    }


    return NextResponse.json({

      success:
        true,

      paid:
        true,

      accessGranted:
        true,

      reference,

      readingUrl,

      downloadUrl,

    });

  } catch (
    error
  ) {

    console.error(
      "Payment verification error:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        error:
          "Payment verification failed.",
      },
      {
        status: 500,
      }
    );

  }

}