"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./BookHardcopyOrderButton.css";

/* =========================================================
   TYPES
   ========================================================= */

type HardcopyStatus =
  | "available"
  | "preorder"
  | "unavailable";

type BookHardcopyOrderButtonProps = {
  bookId: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  price: number;
  currency: string;
  status: string;
};

type InitializeResponse = {
  success?: boolean;
  message?: string;
  orderId?: string;
  reference?: string;
  accessCode?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

type VerifyResponse = {
  success?: boolean;
  paid?: boolean;
  status?: string;
  message?: string;
  orderId?: string;
  reference?: string;
};

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeStatus(
  status: string
): HardcopyStatus {
  switch (status) {
    case "available":
      return "available";

    case "preorder":
      return "preorder";

    default:
      return "unavailable";
  }
}

function formatMoney(
  amount: number,
  currency: string
): string {
  const safeAmount = Number.isFinite(amount)
    ? amount
    : 0;

  return `${currency.toUpperCase()} ${safeAmount.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function BookHardcopyOrderButton({
  bookId,
  title,
  slug,
  coverUrl,
  price,
  currency,
  status,
}: BookHardcopyOrderButtonProps) {
  const normalizedStatus =
    normalizeStatus(status);

  const [open, setOpen] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [customerPhone, setCustomerPhone] =
    useState("");

  const [deliveryAddress, setDeliveryAddress] =
    useState("");

  const [deliveryCity, setDeliveryCity] =
    useState("");

  const [deliveryState, setDeliveryState] =
    useState("");

  const [deliveryCountry, setDeliveryCountry] =
    useState("Nigeria");

  const [quantity, setQuantity] =
    useState(1);

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const subtotal = useMemo(() => {
    return price * quantity;
  }, [price, quantity]);

  /*
   * Delivery pricing has not yet been implemented.
   *
   * The server currently records delivery_fee = 0.
   */
  const deliveryFee = 0;

  const total = subtotal + deliveryFee;

  /* =======================================================
     MODAL BODY LOCK
     ======================================================= */

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape" &&
        !loading &&
        !paymentLoading
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
    loading,
    paymentLoading,
  ]);

  /* =======================================================
     OPEN
     ======================================================= */

  function openModal() {
    if (
      normalizedStatus ===
      "unavailable"
    ) {
      return;
    }

    setError("");
    setSuccess(false);
    setOrderId("");

    setOpen(true);
  }

  /* =======================================================
     CLOSE
     ======================================================= */

  function closeModal() {
    if (
      loading ||
      paymentLoading
    ) {
      return;
    }

    setOpen(false);
  }

  /* =======================================================
     RESET
     ======================================================= */

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");

    setDeliveryAddress("");
    setDeliveryCity("");
    setDeliveryState("");
    setDeliveryCountry(
      "Nigeria"
    );

    setQuantity(1);
    setNotes("");

    setError("");
    setSuccess(false);
    setOrderId("");
  }

  function finishOrder() {
    if (
      loading ||
      paymentLoading
    ) {
      return;
    }

    setOpen(false);
    resetForm();
  }

  /* =======================================================
     VALIDATION
     ======================================================= */

  function validateForm(): string {
    if (!customerName.trim()) {
      return "Please enter your full name.";
    }

    if (!customerEmail.trim()) {
      return "Please enter your email address.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (!customerPhone.trim()) {
      return "Please enter your phone number.";
    }

    if (!deliveryAddress.trim()) {
      return "Please enter your delivery address.";
    }

    if (!deliveryCity.trim()) {
      return "Please enter your delivery city.";
    }

    if (!deliveryState.trim()) {
      return "Please enter your delivery state.";
    }

    if (!deliveryCountry.trim()) {
      return "Please enter your delivery country.";
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return "Quantity must be at least 1.";
    }

    return "";
  }

  /* =======================================================
     INITIALIZE PAYMENT
     ======================================================= */

  async function initializePayment() {
    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/books/hardcopy/initialize",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            bookId,

            customerName:
              customerName.trim(),

            customerEmail:
              customerEmail
                .trim()
                .toLowerCase(),

            customerPhone:
              customerPhone.trim(),

            deliveryAddress:
              deliveryAddress.trim(),

            deliveryCity:
              deliveryCity.trim(),

            deliveryState:
              deliveryState.trim(),

            deliveryCountry:
              deliveryCountry.trim(),

            quantity,

            notes:
              notes.trim() || null,
          }),
        }
      );

      const result =
        (await response.json()) as InitializeResponse;

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Could not initialize payment."
        );
      }

      if (!result.accessCode) {
        throw new Error(
          "Paystack did not return an access code."
        );
      }

      if (!result.reference) {
        throw new Error(
          "Paystack did not return a payment reference."
        );
      }

      const reference =
        result.reference;

      setLoading(false);
      setPaymentLoading(true);

      /*
       * IMPORTANT:
       *
       * Paystack is dynamically imported here.
       *
       * Do NOT move this import to the
       * module level. Doing so can cause
       * "window is not defined" in Next.js.
       */
      const paystackModule =
        await import(
          "@paystack/inline-js"
        );

      const PaystackPop =
        paystackModule.default;

      const paystack =
        new PaystackPop();

      paystack.resumeTransaction(
        result.accessCode,
        {
          onSuccess: async (
            transaction: {
              reference: string;
            }
          ) => {
            try {
              const paymentReference =
                transaction.reference ||
                reference;

              const verifyResponse =
                await fetch(
                  "/api/books/hardcopy/verify",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({
                      reference:
                        paymentReference,
                    }),
                  }
                );

              const verification =
                (await verifyResponse.json()) as VerifyResponse;

              if (
                !verifyResponse.ok ||
                !verification.success ||
                !verification.paid
              ) {
                throw new Error(
                  verification.message ||
                    "Payment could not be verified."
                );
              }

              setOrderId(
                verification.orderId ||
                  result.orderId ||
                  ""
              );

              setSuccess(true);
              setPaymentLoading(false);
              setError("");
            } catch (verificationError) {
              console.error(
                "HARDCOPY PAYMENT VERIFICATION ERROR:",
                verificationError
              );

              setError(
                verificationError instanceof
                  Error
                  ? verificationError.message
                  : "Payment verification failed."
              );

              setPaymentLoading(false);
            }
          },

          onCancel: () => {
            setError(
              "Payment was cancelled. Your order has not been completed."
            );

            setPaymentLoading(false);
          },
        }
      );
    } catch (paymentError) {
      console.error(
        "HARDCOPY PAYMENT INITIALIZATION ERROR:",
        paymentError
      );

      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Could not start payment."
      );

      setLoading(false);
      setPaymentLoading(false);
    }
  }

  /* =======================================================
     UNAVAILABLE
     ======================================================= */

  if (
    normalizedStatus ===
    "unavailable"
  ) {
    return (
      <span className="book-hardcopy-unavailable">
        Hardcopy edition currently unavailable
      </span>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <button
        type="button"
        className="book-hardcopy-trigger"
        onClick={openModal}
        aria-haspopup="dialog"
      >
        {normalizedStatus ===
        "preorder"
          ? "Pre-order hardcopy"
          : "Order hardcopy"}
      </button>

      {open && (
        <div
          className="book-hardcopy-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-hardcopy-title"
        >
          {/* =================================================
              BACKDROP
              ================================================= */}

          <button
            type="button"
            className="book-hardcopy-backdrop"
            aria-label="Close order window"
            onClick={closeModal}
            disabled={
              loading ||
              paymentLoading
            }
          />

          {/* =================================================
              DIALOG
              ================================================= */}

          <div className="book-hardcopy-dialog">
            {/* =================================================
                HEADER
                ================================================= */}

            <header className="book-hardcopy-header">
              <div>
                <span className="book-hardcopy-kicker">
                  {normalizedStatus ===
                  "preorder"
                    ? "Pre-order"
                    : "Hardcopy edition"}
                </span>

                <h2
                  id="book-hardcopy-title"
                  className="book-hardcopy-title"
                >
                  {success
                    ? "Order confirmed"
                    : "Order hardcopy"}
                </h2>
              </div>

              <button
                type="button"
                className="book-hardcopy-close"
                onClick={closeModal}
                disabled={
                  loading ||
                  paymentLoading
                }
                aria-label="Close"
              >
                <span />
                <span />
              </button>
            </header>

            {/* =================================================
                SUCCESS
                ================================================= */}

            {success ? (
              <div className="book-hardcopy-success">
                <div className="book-hardcopy-success-icon">
                  <span>✓</span>
                </div>

                <span className="book-hardcopy-kicker">
                  Payment successful
                </span>

                <h3>
                  Your order has
                  been received.
                </h3>

                <p>
                  Your hardcopy order
                  for{" "}
                  <strong>
                    {title}
                  </strong>{" "}
                  has been successfully
                  paid for.
                </p>

                {orderId && (
                  <div className="book-hardcopy-order-id">
                    <span>
                      Order ID
                    </span>

                    <strong>
                      {orderId}
                    </strong>
                  </div>
                )}

                <p className="book-hardcopy-success-note">
                  Your order details have
                  been recorded using the
                  email address you provided.
                </p>

                <button
                  type="button"
                  className="book-hardcopy-primary"
                  onClick={
                    finishOrder
                  }
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* =============================================
                    PRODUCT
                    ============================================= */}

                <section className="book-hardcopy-product">
                  <div className="book-hardcopy-cover">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt=""
                      />
                    ) : (
                      <div className="book-hardcopy-cover-empty">
                        No cover
                      </div>
                    )}
                  </div>

                  <div className="book-hardcopy-product-details">
                    <span>
                      {normalizedStatus ===
                      "preorder"
                        ? "Pre-order edition"
                        : "Printed edition"}
                    </span>

                    <h3>
                      {title}
                    </h3>

                    <strong>
                      {formatMoney(
                        price,
                        currency
                      )}
                    </strong>
                  </div>
                </section>

                {/* =============================================
                    FORM
                    ============================================= */}

                <div className="book-hardcopy-body">
                  {/* ===========================================
                      CUSTOMER
                      =========================================== */}

                  <section className="book-hardcopy-section">
                    <div className="book-hardcopy-section-heading">
                      <span>
                        01
                      </span>

                      <h3>
                        Customer
                      </h3>
                    </div>

                    <div className="book-hardcopy-fields">
                      <label className="book-hardcopy-field">
                        <span>
                          Full name
                        </span>

                        <input
                          type="text"
                          value={
                            customerName
                          }
                          onChange={(event) =>
                            setCustomerName(
                              event.target
                                .value
                            )
                          }
                          placeholder="Your full name"
                          autoComplete="name"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>

                      <label className="book-hardcopy-field">
                        <span>
                          Email address
                        </span>

                        <input
                          type="email"
                          value={
                            customerEmail
                          }
                          onChange={(event) =>
                            setCustomerEmail(
                              event.target
                                .value
                            )
                          }
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>

                      <label className="book-hardcopy-field">
                        <span>
                          Phone number
                        </span>

                        <input
                          type="tel"
                          value={
                            customerPhone
                          }
                          onChange={(event) =>
                            setCustomerPhone(
                              event.target
                                .value
                            )
                          }
                          placeholder="+234..."
                          autoComplete="tel"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>
                    </div>
                  </section>

                  {/* ===========================================
                      DELIVERY
                      =========================================== */}

                  <section className="book-hardcopy-section">
                    <div className="book-hardcopy-section-heading">
                      <span>
                        02
                      </span>

                      <h3>
                        Delivery
                      </h3>
                    </div>

                    <div className="book-hardcopy-fields">
                      <label className="book-hardcopy-field book-hardcopy-field-full">
                        <span>
                          Delivery address
                        </span>

                        <textarea
                          value={
                            deliveryAddress
                          }
                          onChange={(event) =>
                            setDeliveryAddress(
                              event.target
                                .value
                            )
                          }
                          placeholder="Street address and delivery details"
                          rows={3}
                          autoComplete="street-address"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>

                      <label className="book-hardcopy-field">
                        <span>
                          City
                        </span>

                        <input
                          type="text"
                          value={
                            deliveryCity
                          }
                          onChange={(event) =>
                            setDeliveryCity(
                              event.target
                                .value
                            )
                          }
                          placeholder="City"
                          autoComplete="address-level2"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>

                      <label className="book-hardcopy-field">
                        <span>
                          State
                        </span>

                        <input
                          type="text"
                          value={
                            deliveryState
                          }
                          onChange={(event) =>
                            setDeliveryState(
                              event.target
                                .value
                            )
                          }
                          placeholder="State"
                          autoComplete="address-level1"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>

                      <label className="book-hardcopy-field">
                        <span>
                          Country
                        </span>

                        <input
                          type="text"
                          value={
                            deliveryCountry
                          }
                          onChange={(event) =>
                            setDeliveryCountry(
                              event.target
                                .value
                            )
                          }
                          placeholder="Country"
                          autoComplete="country-name"
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>
                    </div>
                  </section>

                  {/* ===========================================
                      ORDER
                      =========================================== */}

                  <section className="book-hardcopy-section">
                    <div className="book-hardcopy-section-heading">
                      <span>
                        03
                      </span>

                      <h3>
                        Order
                      </h3>
                    </div>

                    <div className="book-hardcopy-fields">
                      <label className="book-hardcopy-field">
                        <span>
                          Quantity
                        </span>

                        <div className="book-hardcopy-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                (
                                  current
                                ) =>
                                  Math.max(
                                    1,
                                    current -
                                      1
                                  )
                              )
                            }
                            disabled={
                              loading ||
                              paymentLoading ||
                              quantity <=
                                1
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span>
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(
                                (
                                  current
                                ) =>
                                  current +
                                  1
                              )
                            }
                            disabled={
                              loading ||
                              paymentLoading
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </label>

                      <label className="book-hardcopy-field book-hardcopy-field-full">
                        <span>
                          Notes{" "}
                          <em>
                            Optional
                          </em>
                        </span>

                        <textarea
                          value={
                            notes
                          }
                          onChange={(event) =>
                            setNotes(
                              event.target
                                .value
                            )
                          }
                          placeholder="Additional delivery instructions"
                          rows={3}
                          disabled={
                            loading ||
                            paymentLoading
                          }
                        />
                      </label>
                    </div>
                  </section>
                </div>

                {/* =============================================
                    SUMMARY
                    ============================================= */}

                <section className="book-hardcopy-summary">
                  <div className="book-hardcopy-summary-row">
                    <span>
                      Unit price
                    </span>

                    <strong>
                      {formatMoney(
                        price,
                        currency
                      )}
                    </strong>
                  </div>

                  <div className="book-hardcopy-summary-row">
                    <span>
                      Quantity
                    </span>

                    <strong>
                      {quantity}
                    </strong>
                  </div>

                  <div className="book-hardcopy-summary-row">
                    <span>
                      Delivery
                    </span>

                    <strong>
                      {deliveryFee ===
                      0
                        ? "Free"
                        : formatMoney(
                            deliveryFee,
                            currency
                          )}
                    </strong>
                  </div>

                  <div className="book-hardcopy-summary-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      {formatMoney(
                        total,
                        currency
                      )}
                    </strong>
                  </div>
                </section>

                {/* =============================================
                    ERROR
                    ============================================= */}

                {error && (
                  <div
                    className="book-hardcopy-error"
                    role="alert"
                  >
                    <span>
                      !
                    </span>

                    <p>
                      {error}
                    </p>
                  </div>
                )}

                {/* =============================================
                    FOOTER
                    ============================================= */}

                <footer className="book-hardcopy-footer">
                  <div className="book-hardcopy-footer-copy">
                    <span>
                      Secure payment
                    </span>

                    <p>
                      Payment is processed
                      securely through
                      Paystack.
                    </p>
                  </div>

                  <div className="book-hardcopy-footer-actions">
                    <button
                      type="button"
                      className="book-hardcopy-secondary"
                      onClick={
                        closeModal
                      }
                      disabled={
                        loading ||
                        paymentLoading
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="book-hardcopy-primary"
                      onClick={
                        initializePayment
                      }
                      disabled={
                        loading ||
                        paymentLoading
                      }
                    >
                      {loading
                        ? "Preparing..."
                        : paymentLoading
                          ? "Verifying..."
                          : normalizedStatus ===
                              "preorder"
                            ? `Pre-order · ${formatMoney(
                                total,
                                currency
                              )}`
                            : `Pay · ${formatMoney(
                                total,
                                currency
                              )}`}
                    </button>
                  </div>
                </footer>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}