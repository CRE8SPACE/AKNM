import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/* =========================================================
   TYPES
   ========================================================= */

type InitializeHardcopyRequest = {
  bookId?: string;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryCountry?: string;

  quantity?: number;

  notes?: string | null;
};

type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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
        "HARDCOPY INITIALIZE ERROR: PAYSTACK_SECRET_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment service is not configured.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       REQUEST BODY
       ===================================================== */

    let body: InitializeHardcopyRequest;

    try {
      body =
        (await request.json()) as InitializeHardcopyRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const bookId = cleanString(body.bookId);

    const customerName = cleanString(
      body.customerName
    );

    const customerEmail = cleanString(
      body.customerEmail
    ).toLowerCase();

    const customerPhone = cleanString(
      body.customerPhone
    );

    const deliveryAddress = cleanString(
      body.deliveryAddress
    );

    const deliveryCity = cleanString(
      body.deliveryCity
    );

    const deliveryState = cleanString(
      body.deliveryState
    );

    const deliveryCountry =
      cleanString(body.deliveryCountry) || "Nigeria";

    const notes = body.notes
      ? cleanString(body.notes)
      : null;

    const quantity =
      typeof body.quantity === "number"
        ? body.quantity
        : Number(body.quantity);

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!bookId || !isValidUUID(bookId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid book ID is required.",
        },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (customerName.length > 200) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer name is too long.",
        },
        { status: 400 }
      );
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid customer email is required.",
        },
        { status: 400 }
      );
    }

    if (customerEmail.length > 320) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer email is too long.",
        },
        { status: 400 }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery address is required.",
        },
        { status: 400 }
      );
    }

    if (!deliveryCity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery city is required.",
        },
        { status: 400 }
      );
    }

    if (!deliveryState) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery state is required.",
        },
        { status: 400 }
      );
    }

    if (!deliveryCountry) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery country is required.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Quantity must be a whole number between 1 and 100.",
        },
        { status: 400 }
      );
    }

    if (notes && notes.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order notes are too long.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       SUPABASE
       ===================================================== */

    const supabase = await createClient();

    /* =====================================================
       FETCH BOOK
       ===================================================== */

    const { data: book, error: bookError } =
      await supabase
        .from("books")
        .select(
          `
            id,
            title,
            slug,
            hardcopy_available,
            hardcopy_price,
            hardcopy_currency,
            hardcopy_status
          `
        )
        .eq("id", bookId)
        .single();

    if (bookError) {
      console.error(
        "HARDCOPY INITIALIZE BOOK ERROR:",
        bookError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not retrieve the book.",
        },
        { status: 500 }
      );
    }

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Book not found.",
        },
        { status: 404 }
      );
    }

    /* =====================================================
       HARD COPY AVAILABILITY
       ===================================================== */

    if (!book.hardcopy_available) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The hardcopy edition is not currently available.",
        },
        { status: 400 }
      );
    }

    const hardcopyStatus =
      book.hardcopy_status;

    if (
      hardcopyStatus !== "available" &&
      hardcopyStatus !== "preorder"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The hardcopy edition cannot currently be ordered.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       AUTHORITATIVE PRICE
       ===================================================== */

    const unitPrice = Number(
      book.hardcopy_price
    );

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      console.error(
        "HARDCOPY INITIALIZE PRICE ERROR:",
        {
          bookId,
          hardcopyPrice:
            book.hardcopy_price,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "The hardcopy price has not been configured correctly.",
        },
        { status: 400 }
      );
    }

    if (unitPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The hardcopy price must be greater than zero.",
        },
        { status: 400 }
      );
    }

    const currency =
      cleanString(book.hardcopy_currency)
        .toUpperCase() || "NGN";

    /* =====================================================
       AMOUNT CALCULATION
       ===================================================== */

    const subtotal =
      unitPrice * quantity;

    /*
     * Delivery pricing has not yet been implemented.
     *
     * Therefore delivery_fee is intentionally 0.
     *
     * Do not accept a delivery fee from the browser.
     */

    const deliveryFee = 0;

    const totalAmount =
      subtotal + deliveryFee;

    /* =====================================================
       CREATE ORDER
       ===================================================== */

    const { data: order, error: orderError } =
      await supabase
        .from("book_orders")
        .insert({
          book_id: book.id,

          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,

          delivery_address:
            deliveryAddress,
          delivery_city: deliveryCity,
          delivery_state: deliveryState,
          delivery_country:
            deliveryCountry,

          quantity,

          unit_price: unitPrice,
          currency,

          subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,

          status: "pending_payment",
          payment_status: "unpaid",

          notes,
        })
        .select(
          `
            id,
            book_id,
            quantity,
            unit_price,
            currency,
            subtotal,
            delivery_fee,
            total_amount,
            status,
            payment_status
          `
        )
        .single();

    if (orderError || !order) {
      console.error(
        "HARDCOPY INITIALIZE ORDER ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Could not create your order.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       PAYSTACK REFERENCE
       ===================================================== */

    const reference =
      `book_${order.id}_${Date.now()}`;

    /* =====================================================
       PAYSTACK INITIALIZATION
       ===================================================== */

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: customerEmail,

            /*
             * Paystack expects the amount in the
             * currency's smallest unit.
             *
             * NGN 10,000 = 1,000,000 kobo.
             */
            amount: Math.round(
              totalAmount * 100
            ),

            currency,

            reference,

            metadata: {
              order_type:
                "hardcopy_book",

              order_id:
                order.id,

              book_id:
                book.id,

              book_title:
                book.title,

              book_slug:
                book.slug,

              customer_name:
                customerName,

              customer_phone:
                customerPhone,

              quantity,

              unit_price:
                unitPrice,

              subtotal,

              delivery_fee:
                deliveryFee,

              total_amount:
                totalAmount,

              hardcopy_status:
                hardcopyStatus,
            },
          }),
        }
      );

    let paystackResult: PaystackInitializeResponse;

    try {
      paystackResult =
        (await paystackResponse.json()) as PaystackInitializeResponse;
    } catch {
      console.error(
        "HARDCOPY INITIALIZE PAYSTACK JSON ERROR"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment service returned an invalid response.",
        },
        { status: 502 }
      );
    }

    if (
      !paystackResponse.ok ||
      !paystackResult.status ||
      !paystackResult.data?.access_code ||
      !paystackResult.data?.reference
    ) {
      console.error(
        "HARDCOPY PAYSTACK INITIALIZE ERROR:",
        paystackResult
      );

      /*
       * The order exists, but payment initialization
       * failed. Keep it as pending_payment so it can
       * be inspected/retried rather than silently
       * deleting the order.
       */

      return NextResponse.json(
        {
          success: false,
          message:
            paystackResult.message ||
            "Could not initialize payment.",
        },
        { status: 502 }
      );
    }

    /* =====================================================
       SAVE PAYMENT REFERENCE
       ===================================================== */

    const paystackReference =
      paystackResult.data.reference;

    const { error: referenceError } =
      await supabase
        .from("book_orders")
        .update({
          payment_reference:
            paystackReference,
        })
        .eq("id", order.id);

    if (referenceError) {
      console.error(
        "HARDCOPY PAYMENT REFERENCE SAVE ERROR:",
        referenceError
      );

      /*
       * Do not continue if we cannot associate
       * the Paystack reference with the order.
       *
       * Verification later depends on this
       * relationship.
       */
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not prepare the order for payment verification.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       SUCCESS
       ===================================================== */

    return NextResponse.json({
      success: true,

      orderId: order.id,

      reference:
        paystackReference,

      accessCode:
        paystackResult.data.access_code,

      amount:
        totalAmount,

      currency,

      status:
        hardcopyStatus,
    });
  } catch (error) {
    console.error(
      "HARDCOPY INITIALIZE UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while preparing your order.",
      },
      { status: 500 }
    );
  }
}