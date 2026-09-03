"use client";

import {
  useEffect,
  useState,
} from "react";


type BookPurchaseModalProps = {
  bookId: string;
  title: string;
  coverUrl: string | null;

  price: number;
  currency: string;

  open: boolean;

  onClose: () => void;
};


/* =========================================================
   HELPERS
   ========================================================= */

function formatPrice(
  price: number,
  currency: string
) {

  return `${currency} ${Number(
    price
  ).toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        2,

      maximumFractionDigits:
        2,
    }
  )}`;

}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function BookPurchaseModal({
  bookId,
  title,
  coverUrl,
  price,
  currency,
  open,
  onClose,
}: BookPurchaseModalProps) {


  /* =======================================================
     STATE
     ======================================================= */

  const [
    email,
    setEmail,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    verifying,
    setVerifying,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState(false);


  const [
    readingUrl,
    setReadingUrl,
  ] = useState<
    string | null
  >(null);


  const [
    downloadUrl,
    setDownloadUrl,
  ] = useState<
    string | null
  >(null);


  /* =======================================================
     RESET WHEN CLOSED
     ======================================================= */

  useEffect(
    () => {

      if (!open) {

        setEmail("");

        setError("");

        setLoading(false);

        setVerifying(false);

        setSuccess(false);

        setReadingUrl(null);

        setDownloadUrl(null);

      }

    },
    [open]
  );


  /* =======================================================
     PAYMENT
     ======================================================= */

  async function startPayment() {

    setError("");

    setSuccess(false);


    /* -----------------------------------------------------
       EMAIL
       ----------------------------------------------------- */

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !normalizedEmail ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
      )
    ) {

      setError(
        "Enter a valid email address."
      );

      return;

    }


    /* -----------------------------------------------------
       PREVENT DUPLICATE ACTIONS
       ----------------------------------------------------- */

    if (
      loading ||
      verifying
    ) {

      return;

    }


    /* -----------------------------------------------------
       BROWSER CHECK
       ----------------------------------------------------- */

    if (
      typeof window ===
      "undefined"
    ) {

      return;

    }


    /* -----------------------------------------------------
       PAYSTACK PUBLIC KEY
       ----------------------------------------------------- */

    const publicKey =
      process.env
        .NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;


    if (!publicKey) {

      setError(
        "Paystack is not configured."
      );

      return;

    }


    setLoading(true);


    try {

      /* ===================================================
         LOAD PAYSTACK ONLY IN THE BROWSER
         
         IMPORTANT:
         @paystack/inline-js accesses window during
         module evaluation. It must therefore NOT be
         imported at the top of this file.
         =================================================== */

      const {
        default:
          PaystackPop,
      } =
        await import(
          "@paystack/inline-js"
        );


      /* ===================================================
         INITIALIZE PAYMENT ON SERVER
         =================================================== */

      const response =
        await fetch(
          "/api/books/payment/initialize",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                bookId,

                email:
                  normalizedEmail,
              }),
          }
        );


      let result:
        {
          success?: boolean;
          error?: string;
          accessCode?: string;
        } = {};


      try {

        result =
          await response.json();

      } catch {

        throw new Error(
          "The payment server returned an invalid response."
        );

      }


      if (
        !response.ok ||
        !result.success ||
        !result.accessCode
      ) {

        throw new Error(
          result.error ||
          "Could not initialize payment."
        );

      }


      /* ===================================================
         OPEN PAYSTACK CHECKOUT
         =================================================== */

      const paystack =
        new PaystackPop();


      paystack.resumeTransaction(
        result.accessCode,
        {

          /* ===============================================
             SUCCESS
             =============================================== */

          onSuccess:
            async (
              transaction
            ) => {

              setLoading(false);

              setVerifying(true);

              setError("");


              try {

                /* =========================================
                   SERVER VERIFICATION
                   ========================================= */

                const verifyResponse =
                  await fetch(
                    "/api/books/payment/verify",
                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",
                      },

                      body:
                        JSON.stringify({
                          reference:
                            transaction.reference,
                        }),
                    }
                  );


                let verifyResult:
                  {
                    success?: boolean;
                    paid?: boolean;
                    error?: string;

                    readingUrl?:
                      string | null;

                    downloadUrl?:
                      string | null;
                  } = {};


                try {

                  verifyResult =
                    await verifyResponse.json();

                } catch {

                  throw new Error(
                    "The payment verification server returned an invalid response."
                  );

                }


                if (
                  !verifyResponse.ok ||
                  !verifyResult.success ||
                  !verifyResult.paid
                ) {

                  throw new Error(
                    verifyResult.error ||
                    "Payment could not be verified."
                  );

                }


                /* =========================================
                   ACCESS URLS
                   ========================================= */

                setReadingUrl(
                  verifyResult.readingUrl ??
                  null
                );


                setDownloadUrl(
                  verifyResult.downloadUrl ??
                  null
                );


                /* =========================================
                   SUCCESS
                   ========================================= */

                setSuccess(
                  true
                );

              } catch (
                verificationError
              ) {

                console.error(
                  "Payment verification error:",
                  verificationError
                );


                setError(
                  verificationError instanceof
                    Error
                    ? verificationError.message
                    : "Payment verification failed."
                );

              } finally {

                setVerifying(
                  false
                );

              }

            },


          /* ===============================================
             CANCEL
             =============================================== */

          onCancel:
            () => {

              setLoading(false);

              setVerifying(false);

            },

        }
      );

    } catch (
      paymentError
    ) {

      console.error(
        "Payment initialization error:",
        paymentError
      );


      setError(
        paymentError instanceof
          Error
          ? paymentError.message
          : "Could not start payment."
      );


      setLoading(false);

    }

  }


  /* =======================================================
     CLOSED
     ======================================================= */

  if (!open) {

    return null;

  }


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className="book-payment-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-payment-title"
    >


      {/* ===================================================
          BACKDROP
          =================================================== */}

      <button
        type="button"
        className="book-payment-modal__backdrop"
        aria-label="Close payment"
        onClick={
          !loading &&
          !verifying
            ? onClose
            : undefined
        }
        tabIndex={
          !loading &&
          !verifying
            ? 0
            : -1
        }
      />


      {/* ===================================================
          PANEL
          =================================================== */}

      <div
        className="book-payment-modal__panel"
      >


        {/* =================================================
            CLOSE
            ================================================= */}

        <button
          type="button"
          className="book-payment-modal__close"
          onClick={
            !loading &&
            !verifying
              ? onClose
              : undefined
          }
          disabled={
            loading ||
            verifying
          }
          aria-label="Close payment"
        >
          ×
        </button>


        {!success ? (

          <>


            {/* =============================================
                HEADER
                ============================================= */}

            <div className="book-payment-modal__header">

              <span>
                AKNM.PRO / PUBLISHING
              </span>


              <h2 id="book-payment-title">
                Complete your purchase.
              </h2>


              <p>
                Secure checkout powered by
                Paystack.
              </p>

            </div>


            {/* =============================================
                BOOK
                ============================================= */}

            <div className="book-payment-modal__book">

              <div className="book-payment-modal__cover">

                {coverUrl ? (

                  <img
                    src={
                      coverUrl
                    }
                    alt=""
                  />

                ) : (

                  <span>
                    AKNM
                  </span>

                )}

              </div>


              <div>

                <span>
                  DIGITAL PUBLICATION
                </span>


                <h3>
                  {title}
                </h3>


                <strong>
                  {formatPrice(
                    price,
                    currency
                  )}
                </strong>

              </div>

            </div>


            {/* =============================================
                EMAIL
                ============================================= */}

            <label className="book-payment-modal__field">

              <span>
                EMAIL ADDRESS
              </span>


              <input
                type="email"
                value={
                  email
                }
                onChange={
                  event =>
                    setEmail(
                      event.target.value
                    )
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={
                  loading ||
                  verifying
                }
              />

            </label>


            {/* =============================================
                ERROR
                ============================================= */}

            {error && (

              <div
                className="book-payment-modal__error"
                role="alert"
              >
                {error}
              </div>

            )}


            {/* =============================================
                PAYMENT
                ============================================= */}

            <button
              type="button"
              className="book-payment-modal__pay"
              onClick={
                startPayment
              }
              disabled={
                loading ||
                verifying
              }
            >

              {verifying
                ? "Verifying payment..."
                : loading
                  ? "Opening secure checkout..."
                  : `Pay ${formatPrice(
                      price,
                      currency
                    )}`}


              {!loading &&
                !verifying && (

                <span>
                  ↗
                </span>

              )}

            </button>


            {/* =============================================
                SECURITY
                ============================================= */}

            <div className="book-payment-modal__secure">

              <span>
                SECURE PAYMENT
              </span>


              <p>
                Payment is processed securely
                by Paystack. AKNM.PRO does not
                receive or store your card details.
              </p>

            </div>

          </>

        ) : (

          /* =================================================
             SUCCESS
             ================================================= */

          <div
            className="book-payment-modal__success"
          >


            <div className="book-payment-modal__success-mark">
              ✓
            </div>


            <span>
              PAYMENT CONFIRMED
            </span>


            <h2>
              Your book is ready.
            </h2>


            <p>
              Your payment has been verified
              successfully. You can now access
              the publication.
            </p>


            <div className="book-payment-modal__success-actions">

              {readingUrl && (

                <a
                  href={
                    readingUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="book-payment-modal__pay"
                >
                  Read book

                  <span>
                    ↗
                  </span>
                </a>

              )}


              {downloadUrl && (

                <a
                  href={
                    downloadUrl
                  }
                  download
                  className="book-payment-modal__download"
                >
                  Download PDF

                  <span>
                    ↓
                  </span>
                </a>

              )}

            </div>


            <button
              type="button"
              className="book-payment-modal__done"
              onClick={
                onClose
              }
            >
              Done
            </button>

          </div>

        )}

      </div>

    </div>

  );

}