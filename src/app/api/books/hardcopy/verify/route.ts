import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
   ========================================================= */

type VerifyRequest = {
  reference?: string;
};

type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    id?: number;
    domain?: string;
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
    transaction_date?: string;
    channel?: string;
    customer?: {
      email?: string;
    };
    metadata?: Record<string, unknown>;
  };
};

/* =========================================================
   HELPERS
   ========================================================= */

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

/* =========================================================
   POST
   ========================================================= */

export async function POST(request: Request) {
  try {
    /* =====================================================
       ENVIRONMENT
       ===================================================== */

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error(
        "HARDCOPY VERIFY ERROR: PAYSTACK_SECRET_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment service is not configured.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       REQUEST BODY
       ===================================================== */

    let body: VerifyRequest;

    try {
      body =
        (await request.json()) as VerifyRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const reference = cleanString(
      body.reference
    );

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       BASIC REFERENCE VALIDATION
       ===================================================== */

    if (!reference.startsWith("book_")) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Invalid payment reference.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       SUPABASE
       ===================================================== */

    const supabase = await createClient();

    /* =====================================================
       FIND ORDER
       ===================================================== */

    const { data: order, error: orderError } =
      await supabase
        .from("book_orders")
        .select(
          `
            id,
            book_id,
            customer_email,
            quantity,
            unit_price,
            currency,
            subtotal,
            delivery_fee,
            total_amount,
            status,
            payment_reference,
            payment_status
          `
        )
        .eq("payment_reference", reference)
        .single();

    if (orderError) {
      console.error(
        "HARDCOPY VERIFY ORDER LOOKUP ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Could not locate the order associated with this payment.",
        },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       ALREADY PAID
       ===================================================== */

    if (
      order.payment_status === "paid" &&
      order.status === "paid"
    ) {
      return NextResponse.json({
        success: true,
        paid: true,
        status: "paid",
        orderId: order.id,
        message:
          "Payment has already been verified.",
      });
    }

    /* =====================================================
       PAYSTACK VERIFICATION
       ===================================================== */

    const paystackResponse =
      await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,

            "Content-Type":
              "application/json",
          },

          cache: "no-store",
        }
      );

    let paystackResult: PaystackVerifyResponse;

    try {
      paystackResult =
        (await paystackResponse.json()) as PaystackVerifyResponse;
    } catch {
      console.error(
        "HARDCOPY VERIFY PAYSTACK JSON ERROR"
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment service returned an invalid response.",
        },
        { status: 502 }
      );
    }

    if (
      !paystackResponse.ok ||
      !paystackResult.status ||
      !paystackResult.data
    ) {
      console.error(
        "HARDCOPY PAYSTACK VERIFY ERROR:",
        paystackResult
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            paystackResult.message ||
            "Could not verify the payment.",
        },
        { status: 502 }
      );
    }

    const transaction =
      paystackResult.data;

    /* =====================================================
       VERIFY REFERENCE
       ===================================================== */

    if (
      transaction.reference !==
      order.payment_reference
    ) {
      console.error(
        "HARDCOPY VERIFY REFERENCE MISMATCH:",
        {
          expected:
            order.payment_reference,
          received:
            transaction.reference,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment reference does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VERIFY PAYMENT STATUS
       ===================================================== */

    if (transaction.status !== "success") {
      return NextResponse.json({
        success: true,
        paid: false,
        status:
          transaction.status ||
          "unknown",
        orderId: order.id,
        message:
          "Payment has not been completed.",
      });
    }

    /* =====================================================
       VERIFY CUSTOMER EMAIL
       ===================================================== */

    const paystackEmail =
      cleanString(
        transaction.customer?.email
      ).toLowerCase();

    const orderEmail =
      cleanString(
        order.customer_email
      ).toLowerCase();

    if (
      paystackEmail &&
      orderEmail &&
      paystackEmail !== orderEmail
    ) {
      console.error(
        "HARDCOPY VERIFY EMAIL MISMATCH:",
        {
          orderEmail,
          paystackEmail,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment customer information does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VERIFY CURRENCY
       ===================================================== */

    const expectedCurrency =
      cleanString(
        order.currency
      ).toUpperCase();

    const paidCurrency =
      cleanString(
        transaction.currency
      ).toUpperCase();

    if (
      !paidCurrency ||
      paidCurrency !== expectedCurrency
    ) {
      console.error(
        "HARDCOPY VERIFY CURRENCY MISMATCH:",
        {
          expectedCurrency,
          paidCurrency,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment currency does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VERIFY AMOUNT
       ===================================================== */

    const expectedAmountKobo =
      Math.round(
        Number(order.total_amount) * 100
      );

    const paidAmount =
      Number(transaction.amount);

    if (
      !Number.isFinite(paidAmount) ||
      paidAmount !== expectedAmountKobo
    ) {
      console.error(
        "HARDCOPY VERIFY AMOUNT MISMATCH:",
        {
          expectedAmountKobo,
          paidAmount,
          orderId: order.id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment amount does not match the order.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       VERIFY ORDER CALCULATIONS
       ===================================================== */

    const quantity =
      Number(order.quantity);

    const unitPrice =
      Number(order.unit_price);

    const subtotal =
      Number(order.subtotal);

    const deliveryFee =
      Number(order.delivery_fee);

    const totalAmount =
      Number(order.total_amount);

    const calculatedSubtotal =
      unitPrice * quantity;

    const calculatedTotal =
      calculatedSubtotal +
      deliveryFee;

    if (
      !Number.isFinite(quantity) ||
      quantity < 1 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(subtotal) ||
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0 ||
      !Number.isFinite(totalAmount)
    ) {
      console.error(
        "HARDCOPY VERIFY INVALID ORDER AMOUNTS:",
        {
          orderId: order.id,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "The order contains invalid payment information.",
        },
        { status: 400 }
      );
    }

    /*
     * Use a small tolerance for decimal arithmetic.
     */

    const subtotalMatches =
      Math.abs(
        subtotal -
          calculatedSubtotal
      ) < 0.01;

    const totalMatches =
      Math.abs(
        totalAmount -
          calculatedTotal
      ) < 0.01;

    if (
      !subtotalMatches ||
      !totalMatches
    ) {
      console.error(
        "HARDCOPY VERIFY ORDER CALCULATION MISMATCH:",
        {
          orderId: order.id,
          subtotal,
          calculatedSubtotal,
          totalAmount,
          calculatedTotal,
        }
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "The order total could not be validated.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       MARK ORDER AS PAID
       ===================================================== */

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("book_orders")
        .update({
          payment_status: "paid",
          status: "paid",
        })
        .eq("id", order.id)
        .eq(
          "payment_status",
          "unpaid"
        )
        .select(
          `
            id,
            status,
            payment_status
          `
        )
        .single();

    if (updateError) {
      /*
       * The transaction is genuinely successful,
       * but our database update failed.
       */
      console.error(
        "HARDCOPY VERIFY ORDER UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          paid: false,
          message:
            "Payment was successful, but we could not finalize the order. Please contact support with your payment reference.",
          reference,
        },
        { status: 500 }
      );
    }

    /* =====================================================
       SUCCESS
       ===================================================== */

    return NextResponse.json({
      success: true,
      paid: true,
      status:
        updatedOrder?.status ||
        "paid",
      orderId: order.id,
      reference,
      message:
        "Payment successfully verified and order confirmed.",
    });
  } catch (error) {
    console.error(
      "HARDCOPY VERIFY UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        paid: false,
        message:
          "Something went wrong while verifying the payment.",
      },
      { status: 500 }
    );
  }
}