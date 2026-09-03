"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import "./contact.css";

/* =========================================================
   TYPES
   ========================================================= */

type ConnectSettings = {
  id: string;
  primary_email: string;
  business_email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  youtube: string;
  x: string;
  facebook: string;
  linkedin: string;
  tiktok: string;
  github: string;
  form_enabled: boolean;
};

type EnquiryType = {
  id: string;
  name: string;
  display_order: number;
  is_visible: boolean;
};

/* =========================================================
   DEFAULTS
   ========================================================= */

const defaultSettings: ConnectSettings = {
  id: "",
  primary_email: "",
  business_email: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  youtube: "",
  x: "",
  facebook: "",
  linkedin: "",
  tiktok: "",
  github: "",
  form_enabled: true,
};

/* =========================================================
   NORMALIZE SETTINGS
   ========================================================= */

function normalizeSettings(
  data: Partial<ConnectSettings> | null | undefined
): ConnectSettings {
  return {
    id: data?.id ?? "",

    primary_email:
      typeof data?.primary_email === "string"
        ? data.primary_email
        : "",

    business_email:
      typeof data?.business_email === "string"
        ? data.business_email
        : "",

    phone:
      typeof data?.phone === "string"
        ? data.phone
        : "",

    whatsapp:
      typeof data?.whatsapp === "string"
        ? data.whatsapp
        : "",

    instagram:
      typeof data?.instagram === "string"
        ? data.instagram
        : "",

    youtube:
      typeof data?.youtube === "string"
        ? data.youtube
        : "",

    x:
      typeof data?.x === "string"
        ? data.x
        : "",

    facebook:
      typeof data?.facebook === "string"
        ? data.facebook
        : "",

    linkedin:
      typeof data?.linkedin === "string"
        ? data.linkedin
        : "",

    tiktok:
      typeof data?.tiktok === "string"
        ? data.tiktok
        : "",

    github:
      typeof data?.github === "string"
        ? data.github
        : "",

    form_enabled:
      typeof data?.form_enabled === "boolean"
        ? data.form_enabled
        : true,
  };
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function ContactPage() {
  const supabase = createClient();

  const [settings, setSettings] =
    useState<ConnectSettings>(defaultSettings);

  const [enquiryTypes, setEnquiryTypes] =
    useState<EnquiryType[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     FORM STATE
     ======================================================= */

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    message: "",
  });

  /* =======================================================
     LOAD CONNECT DATA
     ======================================================= */

  useEffect(() => {
    loadConnect();
  }, []);

  async function loadConnect() {
    setLoading(true);
    setError("");

    try {
      const [
        settingsResponse,
        typesResponse,
      ] = await Promise.all([
        supabase
          .from("connect_settings")
          .select("*")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("enquiry_types")
          .select("*")
          .eq("is_visible", true)
          .order("display_order", {
            ascending: true,
          }),
      ]);

      if (settingsResponse.error) {
        throw settingsResponse.error;
      }

      if (typesResponse.error) {
        throw typesResponse.error;
      }

      setSettings(
        normalizeSettings(
          settingsResponse.data
        )
      );

      setEnquiryTypes(
        (typesResponse.data || []).map(
          (item) => ({
            id: item.id,
            name: item.name ?? "",
            display_order:
              Number(
                item.display_order
              ) || 0,
            is_visible:
              item.is_visible !== false,
          })
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load contact information."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     FORM INPUT
     ======================================================= */

  function updateForm(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* =======================================================
     SUBMIT ENQUIRY
     ======================================================= */

  async function submitEnquiry(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!settings.form_enabled) {
      setError(
        "The enquiry form is currently unavailable."
      );
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const type = form.type.trim();
    const message = form.message.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!type) {
      setError(
        "Please select what your enquiry is about."
      );
      return;
    }

    if (!message) {
      setError("Please enter your message.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await supabase
        .from("enquiries")
        .insert({
          name,
          email,
          phone: phone || null,
          type,
          message,
          status: "NEW",
        });

      if (response.error) {
        throw response.error;
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        type: "",
        message: "",
      });

      setSuccess(
        "Your message has been sent successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =======================================================
     SOCIAL CHANNELS
     ======================================================= */

  const socialLinks = [
    {
      name: "Instagram",
      url: settings.instagram,
    },
    {
      name: "YouTube",
      url: settings.youtube,
    },
    {
      name: "X",
      url: settings.x,
    },
    {
      name: "Facebook",
      url: settings.facebook,
    },
    {
      name: "LinkedIn",
      url: settings.linkedin,
    },
    {
      name: "TikTok",
      url: settings.tiktok,
    },
    {
      name: "GitHub",
      url: settings.github,
    },
  ].filter(
    (social) => social.url.trim() !== ""
  );

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <>
        <Header />

        <main className="contact-page">
          <section className="contact-page__hero">
            <div className="contact-page__container">
              <div className="contact-page__hero-content">
                <h1>
                  Let&apos;s
                  <br />
                  talk.
                </h1>

                <p>
                  Loading contact information...
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <Header />

      <main className="contact-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="contact-page__hero">

          <div className="contact-page__container">

            <div className="contact-page__eyebrow">

              <span className="contact-page__line" />

              <span>
                Contact
              </span>

            </div>

            <div className="contact-page__hero-content">

              <h1>
                Let&apos;s
                <br />
                talk.
              </h1>

              <p>
                Business, partnerships, media,
                music, ideas or something completely
                different — send me a message.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTACT AREA
            ================================================= */}

        <section className="contact-page__main">

          <div className="contact-page__container">

            <div className="contact-page__grid">

              {/* =========================================
                  INFORMATION
                  ========================================= */}

              <div className="contact-page__information">

                <div className="contact-page__information-block">

                  <span>
                    Direct
                  </span>

                  <h2>
                    Start a conversation.
                  </h2>

                  <p>
                    For serious enquiries, partnerships
                    and opportunities, use the form or
                    reach out through the appropriate
                    channel.
                  </p>

                </div>


                <div className="contact-page__channels">

                  {/* PRIMARY EMAIL */}

                  {settings.primary_email && (
                    <a
                      href={`mailto:${settings.primary_email}`}
                    >

                      <span>
                        EMAIL
                      </span>

                      <strong>
                        {settings.primary_email}
                      </strong>

                      <span>
                        ↗
                      </span>

                    </a>
                  )}


                  {/* BUSINESS EMAIL */}

                  {settings.business_email && (
                    <a
                      href={`mailto:${settings.business_email}`}
                    >

                      <span>
                        BUSINESS
                      </span>

                      <strong>
                        {settings.business_email}
                      </strong>

                      <span>
                        ↗
                      </span>

                    </a>
                  )}


                  {/* PHONE */}

                  {settings.phone && (
                    <a
                      href={`tel:${settings.phone}`}
                    >

                      <span>
                        PHONE
                      </span>

                      <strong>
                        {settings.phone}
                      </strong>

                      <span>
                        ↗
                      </span>

                    </a>
                  )}


                  {/* WHATSAPP */}

                  {settings.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >

                      <span>
                        WHATSAPP
                      </span>

                      <strong>
                        {settings.whatsapp}
                      </strong>

                      <span>
                        ↗
                      </span>

                    </a>
                  )}

                </div>

              </div>


              {/* =========================================
                  FORM
                  ========================================= */}

              <div className="contact-page__form-wrapper">

                {!settings.form_enabled ? (

                  <div className="contact-page__form-disabled">

                    <span>
                      ENQUIRY FORM
                    </span>

                    <h2>
                      The form is currently
                      unavailable.
                    </h2>

                    <p>
                      Please use one of the direct
                      contact channels instead.
                    </p>

                  </div>

                ) : (

                  <form
                    className="contact-page__form"
                    onSubmit={submitEnquiry}
                  >

                    {/* NAME */}

                    <div className="contact-page__field">

                      <label htmlFor="name">
                        Your name
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          updateForm(
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Enter your name"
                        autoComplete="name"
                        disabled={submitting}
                      />

                    </div>


                    {/* EMAIL */}

                    <div className="contact-page__field">

                      <label htmlFor="email">
                        Email
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateForm(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={submitting}
                      />

                    </div>


                    {/* PHONE */}

                    <div className="contact-page__field">

                      <label htmlFor="phone">
                        Phone
                        <span>
                          Optional
                        </span>
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) =>
                          updateForm(
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="+234..."
                        autoComplete="tel"
                        disabled={submitting}
                      />

                    </div>


                    {/* TYPE */}

                    <div className="contact-page__field">

                      <label htmlFor="type">
                        What is this about?
                      </label>

                      <select
                        id="type"
                        name="type"
                        value={form.type}
                        onChange={(event) =>
                          updateForm(
                            "type",
                            event.target.value
                          )
                        }
                        disabled={submitting}
                      >

                        <option
                          value=""
                          disabled
                        >
                          Select an option
                        </option>

                        {enquiryTypes.map(
                          (type) => (
                            <option
                              key={type.id}
                              value={type.name}
                            >
                              {type.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>


                    {/* MESSAGE */}

                    <div className="contact-page__field">

                      <label htmlFor="message">
                        Message
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        rows={7}
                        value={form.message}
                        onChange={(event) =>
                          updateForm(
                            "message",
                            event.target.value
                          )
                        }
                        placeholder="Tell me what you have in mind..."
                        disabled={submitting}
                      />

                    </div>


                    {/* ERROR */}

                    {error && (
                      <div className="contact-page__form-message contact-page__form-message--error">
                        {error}
                      </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                      <div className="contact-page__form-message contact-page__form-message--success">
                        {success}
                      </div>
                    )}


                    {/* SUBMIT */}

                    <button
                      type="submit"
                      className="contact-page__submit"
                      disabled={submitting}
                    >

                      <span>
                        {submitting
                          ? "Sending..."
                          : "Send message"}
                      </span>

                      {!submitting && (
                        <span>
                          ↗
                        </span>
                      )}

                    </button>

                  </form>

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            OPPORTUNITIES
            ================================================= */}

        <section className="contact-page__opportunities">

          <div className="contact-page__container">

            <div className="contact-page__opportunities-heading">

              <span>
                Opportunities
              </span>

              <h2>
                If you&apos;re building
                something interesting,
                let&apos;s talk.
              </h2>

            </div>


            <div className="contact-page__opportunities-grid">

              <article>

                <span>
                  01
                </span>

                <h3>
                  Business
                </h3>

                <p>
                  Companies, ventures and strategic
                  opportunities.
                </p>

              </article>


              <article>

                <span>
                  02
                </span>

                <h3>
                  Media
                </h3>

                <p>
                  Interviews, features, podcasts and
                  collaborations.
                </p>

              </article>


              <article>

                <span>
                  03
                </span>

                <h3>
                  Creative
                </h3>

                <p>
                  Music, writing, content and creative
                  projects.
                </p>

              </article>


              <article>

                <span>
                  04
                </span>

                <h3>
                  Partnerships
                </h3>

                <p>
                  Brands, organisations and people
                  interested in building together.
                </p>

              </article>

            </div>

          </div>

        </section>


        {/* =================================================
            SOCIAL
            ================================================= */}

        <section className="contact-page__social">

          <div className="contact-page__container">

            <span>
              Elsewhere
            </span>

            <h2>
              Follow the journey.
            </h2>

            <p>
              AKNM.PRO is the home base. Follow
              along across the platforms where I
              share the journey.
            </p>


            <div className="contact-page__social-links">

              {socialLinks.length === 0 ? (

                <p>
                  Social channels will appear here
                  when they are configured.
                </p>

              ) : (

                socialLinks.map((social) => (

                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                  >

                    {social.name}

                    <span>
                      ↗
                    </span>

                  </a>

                ))

              )}

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}