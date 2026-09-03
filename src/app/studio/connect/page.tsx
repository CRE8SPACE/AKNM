"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import "./connect.css";

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

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  type: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  created_at: string;
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

const emptyType = {
  name: "",
  display_order: "0",
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

export default function ConnectPage() {
  const supabase = createClient();

  const [settings, setSettings] =
    useState<ConnectSettings>(defaultSettings);

  const [enquiryTypes, setEnquiryTypes] =
    useState<EnquiryType[]>([]);

  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [typeForm, setTypeForm] =
    useState(emptyType);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeEnquiry, setActiveEnquiry] =
    useState<Enquiry | null>(null);

  /* =======================================================
     LOAD
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
        enquiriesResponse,
      ] = await Promise.all([
        supabase
          .from("connect_settings")
          .select("*")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("enquiry_types")
          .select("*")
          .order("display_order", {
            ascending: true,
          }),

        supabase
          .from("enquiries")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (settingsResponse.error) {
        throw settingsResponse.error;
      }

      if (typesResponse.error) {
        throw typesResponse.error;
      }

      if (enquiriesResponse.error) {
        throw enquiriesResponse.error;
      }

      /*
       * IMPORTANT:
       * Normalize nullable database fields before
       * placing them into controlled React inputs.
       */

      setSettings(
        normalizeSettings(settingsResponse.data)
      );

      setEnquiryTypes(
        (typesResponse.data || []).map((item) => ({
          id: item.id,
          name: item.name ?? "",
          display_order:
            Number(item.display_order) || 0,
          is_visible:
            item.is_visible !== false,
        }))
      );

      setEnquiries(
        (enquiriesResponse.data || []).map((item) => ({
          id: item.id,
          name: item.name ?? "",
          email: item.email ?? "",
          phone: item.phone ?? null,
          type: item.type ?? "",
          message: item.message ?? "",
          status: item.status ?? "NEW",
          created_at:
            item.created_at ??
            new Date().toISOString(),
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load Connect."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     SETTINGS
     ======================================================= */

  function updateSetting(
    field: keyof ConnectSettings,
    value: string | boolean
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSuccess("");
  }

  async function saveSettings(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        primary_email:
          settings.primary_email.trim() || null,

        business_email:
          settings.business_email.trim() || null,

        phone:
          settings.phone.trim() || null,

        whatsapp:
          settings.whatsapp.trim() || null,

        instagram:
          settings.instagram.trim() || null,

        youtube:
          settings.youtube.trim() || null,

        x:
          settings.x.trim() || null,

        facebook:
          settings.facebook.trim() || null,

        linkedin:
          settings.linkedin.trim() || null,

        tiktok:
          settings.tiktok.trim() || null,

        github:
          settings.github.trim() || null,

        form_enabled:
          settings.form_enabled,
      };

      let response;

      if (settings.id) {
        response = await supabase
          .from("connect_settings")
          .update(payload)
          .eq("id", settings.id)
          .select()
          .single();
      } else {
        response = await supabase
          .from("connect_settings")
          .insert(payload)
          .select()
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      setSettings(
        normalizeSettings(response.data)
      );

      setSuccess(
        "Connect settings saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     ENQUIRY TYPES
     ======================================================= */

  async function addEnquiryType(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = typeForm.name.trim();

    if (!name) return;

    setError("");
    setSuccess("");

    try {
      const response = await supabase
        .from("enquiry_types")
        .insert({
          name,
          display_order:
            Number(typeForm.display_order) || 0,
          is_visible: true,
        })
        .select()
        .single();

      if (response.error) {
        throw response.error;
      }

      const newType: EnquiryType = {
        id: response.data.id,
        name: response.data.name ?? "",
        display_order:
          Number(response.data.display_order) || 0,
        is_visible:
          response.data.is_visible !== false,
      };

      setEnquiryTypes((current) =>
        [...current, newType].sort(
          (a, b) =>
            a.display_order -
            b.display_order
        )
      );

      setTypeForm(emptyType);

      setSuccess("Enquiry type added.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not add enquiry type."
      );
    }
  }

  async function toggleEnquiryType(
    type: EnquiryType
  ) {
    setError("");
    setSuccess("");

    const nextVisibility =
      !type.is_visible;

    const response = await supabase
      .from("enquiry_types")
      .update({
        is_visible: nextVisibility,
      })
      .eq("id", type.id);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setEnquiryTypes((current) =>
      current.map((item) =>
        item.id === type.id
          ? {
              ...item,
              is_visible: nextVisibility,
            }
          : item
      )
    );

    setSuccess(
      nextVisibility
        ? "Enquiry type enabled."
        : "Enquiry type hidden."
    );
  }

  async function deleteEnquiryType(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this enquiry type?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const response = await supabase
      .from("enquiry_types")
      .delete()
      .eq("id", id);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setEnquiryTypes((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    setSuccess("Enquiry type deleted.");
  }

  /* =======================================================
     ENQUIRIES
     ======================================================= */

  async function updateEnquiryStatus(
    enquiry: Enquiry,
    status: Enquiry["status"]
  ) {
    setError("");
    setSuccess("");

    const response = await supabase
      .from("enquiries")
      .update({
        status,
      })
      .eq("id", enquiry.id);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setEnquiries((current) =>
      current.map((item) =>
        item.id === enquiry.id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    setActiveEnquiry((current) =>
      current &&
      current.id === enquiry.id
        ? {
            ...current,
            status,
          }
        : current
    );

    setSuccess(
      `Enquiry marked ${status.toLowerCase()}.`
    );
  }

  async function archiveEnquiry(
    enquiry: Enquiry
  ) {
    await updateEnquiryStatus(
      enquiry,
      "ARCHIVED"
    );
  }

  async function deleteEnquiry(
    enquiry: Enquiry
  ) {
    if (
      !window.confirm(
        "Permanently delete this enquiry?"
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    const response = await supabase
      .from("enquiries")
      .delete()
      .eq("id", enquiry.id);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setEnquiries((current) =>
      current.filter(
        (item) => item.id !== enquiry.id
      )
    );

    setActiveEnquiry(null);

    setSuccess("Enquiry deleted.");
  }

  /* =======================================================
     STATS
     ======================================================= */

  const newCount = enquiries.filter(
    (item) => item.status === "NEW"
  ).length;

  const activeCount = enquiries.filter(
    (item) =>
      item.status !== "ARCHIVED"
  ).length;

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <main className="connect-page">
        <div className="connect-page__loading">
          Loading Connect...
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="connect-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="connect-header">

        <div>
          <span className="connect-eyebrow">
            AKNM STUDIO / CONNECT
          </span>

          <h1>
            Connect
          </h1>

          <p>
            Manage public contact information,
            social channels and incoming enquiries.
          </p>
        </div>

        <div className="connect-header__status">

          <span
            className={
              settings.form_enabled
                ? "is-active"
                : ""
            }
          />

          {settings.form_enabled
            ? "FORM ACTIVE"
            : "FORM DISABLED"}

        </div>

      </header>


      {/* =================================================
          MESSAGES
          ================================================= */}

      {error && (
        <div className="connect-message connect-message--error">
          {error}
        </div>
      )}

      {success && (
        <div className="connect-message connect-message--success">
          {success}
        </div>
      )}


      {/* =================================================
          OVERVIEW
          ================================================= */}

      <div className="connect-overview">

        <div>
          <span>
            INBOX
          </span>

          <strong>
            {activeCount}
          </strong>

          <small>
            ACTIVE
          </small>
        </div>

        <div>
          <span>
            NEW
          </span>

          <strong>
            {newCount}
          </strong>

          <small>
            NEED ATTENTION
          </small>
        </div>

        <div>
          <span>
            CATEGORIES
          </span>

          <strong>
            {enquiryTypes.length}
          </strong>

          <small>
            CONFIGURED
          </small>
        </div>

      </div>


      {/* =================================================
          SETTINGS
          ================================================= */}

      <form
        className="connect-settings"
        onSubmit={saveSettings}
      >

        {/* =================================================
            CONTACT
            ================================================= */}

        <section className="connect-card">

          <div className="connect-card__header">

            <span>
              CONTACT
            </span>

            <div>
              <h2>
                Direct channels
              </h2>

              <p>
                Information displayed publicly
                on the Contact page.
              </p>
            </div>

          </div>


          <div className="connect-grid">

            <label>
              <span>
                PRIMARY EMAIL
              </span>

              <input
                type="email"
                value={settings.primary_email}
                onChange={(event) =>
                  updateSetting(
                    "primary_email",
                    event.target.value
                  )
                }
                placeholder="hello@aknm.pro"
              />
            </label>


            <label>
              <span>
                BUSINESS EMAIL
              </span>

              <input
                type="email"
                value={settings.business_email}
                onChange={(event) =>
                  updateSetting(
                    "business_email",
                    event.target.value
                  )
                }
                placeholder="business@aknm.pro"
              />
            </label>


            <label>
              <span>
                PHONE NUMBER
              </span>

              <input
                type="tel"
                value={settings.phone}
                onChange={(event) =>
                  updateSetting(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+234..."
              />
            </label>


            <label>
              <span>
                WHATSAPP
              </span>

              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(event) =>
                  updateSetting(
                    "whatsapp",
                    event.target.value
                  )
                }
                placeholder="+234..."
              />
            </label>

          </div>

        </section>


        {/* =================================================
            SOCIAL
            ================================================= */}

        <section className="connect-card">

          <div className="connect-card__header">

            <span>
              SOCIAL
            </span>

            <div>
              <h2>
                Social channels
              </h2>

              <p>
                Add the public profiles that
                should appear on AKNM.PRO.
              </p>
            </div>

          </div>


          <div className="connect-grid">

            <label>
              <span>
                INSTAGRAM
              </span>

              <input
                type="url"
                value={settings.instagram}
                onChange={(event) =>
                  updateSetting(
                    "instagram",
                    event.target.value
                  )
                }
                placeholder="https://instagram.com/..."
              />
            </label>


            <label>
              <span>
                YOUTUBE
              </span>

              <input
                type="url"
                value={settings.youtube}
                onChange={(event) =>
                  updateSetting(
                    "youtube",
                    event.target.value
                  )
                }
                placeholder="https://youtube.com/..."
              />
            </label>


            <label>
              <span>
                X
              </span>

              <input
                type="url"
                value={settings.x}
                onChange={(event) =>
                  updateSetting(
                    "x",
                    event.target.value
                  )
                }
                placeholder="https://x.com/..."
              />
            </label>


            <label>
              <span>
                FACEBOOK
              </span>

              <input
                type="url"
                value={settings.facebook}
                onChange={(event) =>
                  updateSetting(
                    "facebook",
                    event.target.value
                  )
                }
                placeholder="https://facebook.com/..."
              />
            </label>


            <label>
              <span>
                LINKEDIN
              </span>

              <input
                type="url"
                value={settings.linkedin}
                onChange={(event) =>
                  updateSetting(
                    "linkedin",
                    event.target.value
                  )
                }
                placeholder="https://linkedin.com/in/..."
              />
            </label>


            <label>
              <span>
                TIKTOK
              </span>

              <input
                type="url"
                value={settings.tiktok}
                onChange={(event) =>
                  updateSetting(
                    "tiktok",
                    event.target.value
                  )
                }
                placeholder="https://tiktok.com/@..."
              />
            </label>


            <label>
              <span>
                GITHUB
              </span>

              <input
                type="url"
                value={settings.github}
                onChange={(event) =>
                  updateSetting(
                    "github",
                    event.target.value
                  )
                }
                placeholder="https://github.com/..."
              />
            </label>

          </div>

        </section>


        {/* =================================================
            FORM SETTINGS
            ================================================= */}

        <section className="connect-card">

          <div className="connect-card__header">

            <span>
              ENQUIRY FORM
            </span>

            <div>
              <h2>
                Public submissions
              </h2>

              <p>
                Control whether visitors can
                send enquiries.
              </p>
            </div>

          </div>


          <label className="connect-toggle">

            <input
              type="checkbox"
              checked={settings.form_enabled}
              onChange={(event) =>
                updateSetting(
                  "form_enabled",
                  event.target.checked
                )
              }
            />

            <div>
              <strong>
                Accept new enquiries
              </strong>

              <small>
                Visitors can submit the public
                Contact form.
              </small>
            </div>

          </label>

        </section>


        {/* =================================================
            SAVE
            ================================================= */}

        <div className="connect-actions">

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}

            {!saving && (
              <span>
                ↗
              </span>
            )}
          </button>

        </div>

      </form>


      {/* =================================================
          ENQUIRY TYPES
          ================================================= */}

      <section className="connect-card">

        <div className="connect-card__header">

          <span>
            CATEGORIES
          </span>

          <div>
            <h2>
              Enquiry types
            </h2>

            <p>
              Categories visitors can select
              when contacting you.
            </p>
          </div>

        </div>


        <form
          className="connect-type-form"
          onSubmit={addEnquiryType}
        >

          <input
            type="text"
            value={typeForm.name}
            onChange={(event) =>
              setTypeForm({
                ...typeForm,
                name: event.target.value,
              })
            }
            placeholder="New enquiry type"
          />

          <input
            type="number"
            min="0"
            value={typeForm.display_order}
            onChange={(event) =>
              setTypeForm({
                ...typeForm,
                display_order:
                  event.target.value,
              })
            }
            placeholder="Order"
          />

          <button type="submit">
            Add Type
          </button>

        </form>


        <div className="connect-types">

          {enquiryTypes.length === 0 ? (

            <div className="connect-empty">
              No enquiry types configured.
            </div>

          ) : (

            enquiryTypes.map((type) => (

              <div
                className="connect-type"
                key={type.id}
              >

                <div>

                  <strong>
                    {type.name}
                  </strong>

                  <small>
                    #
                    {String(
                      type.display_order
                    ).padStart(2, "0")}
                  </small>

                </div>


                <div className="connect-type__actions">

                  <button
                    type="button"
                    onClick={() =>
                      toggleEnquiryType(type)
                    }
                  >
                    {type.is_visible
                      ? "VISIBLE"
                      : "HIDDEN"}
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      deleteEnquiryType(
                        type.id
                      )
                    }
                  >
                    DELETE
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </section>


      {/* =================================================
          INBOX
          ================================================= */}

      <section className="connect-inbox">

        <div className="connect-inbox__header">

          <div>
            <span>
              INBOX
            </span>

            <h2>
              Enquiries
            </h2>
          </div>

          <strong>
            {newCount} NEW
          </strong>

        </div>


        {enquiries.length === 0 ? (

          <div className="connect-empty">
            No enquiries yet.
          </div>

        ) : (

          <div className="connect-enquiries">

            {enquiries.map((enquiry) => (

              <button
                type="button"
                className="connect-enquiry"
                key={enquiry.id}
                onClick={() =>
                  setActiveEnquiry(enquiry)
                }
              >

                <span className="connect-enquiry__number">

                  {enquiry.name
                    .slice(0, 1)
                    .toUpperCase() || "?"}

                </span>


                <span className="connect-enquiry__main">

                  <strong>
                    {enquiry.name}
                  </strong>

                  <small>
                    {enquiry.type}
                    {" · "}
                    {enquiry.email}
                  </small>

                </span>


                <span className="connect-enquiry__status">
                  {enquiry.status}
                </span>


                <span className="connect-enquiry__arrow">
                  ↗
                </span>

              </button>

            ))}

          </div>

        )}

      </section>


      {/* =================================================
          ENQUIRY MODAL
          ================================================= */}

      {activeEnquiry && (

        <div
          className="connect-modal"
          onClick={() =>
            setActiveEnquiry(null)
          }
        >

          <div
            className="connect-modal__panel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="connect-modal__header">

              <div>

                <span>
                  {activeEnquiry.type}
                </span>

                <h2>
                  {activeEnquiry.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setActiveEnquiry(null)
                }
              >
                ×
              </button>

            </div>


            <div className="connect-modal__meta">

              <a
                href={`mailto:${activeEnquiry.email}`}
              >
                {activeEnquiry.email}
              </a>

              {activeEnquiry.phone && (
                <span>
                  {activeEnquiry.phone}
                </span>
              )}

              <span>
                {new Date(
                  activeEnquiry.created_at
                ).toLocaleString()}
              </span>

            </div>


            <div className="connect-modal__message">
              {activeEnquiry.message}
            </div>


            <div className="connect-modal__actions">

              <button
                type="button"
                onClick={() =>
                  updateEnquiryStatus(
                    activeEnquiry,
                    "READ"
                  )
                }
              >
                Mark Read
              </button>


              <button
                type="button"
                onClick={() =>
                  updateEnquiryStatus(
                    activeEnquiry,
                    "REPLIED"
                  )
                }
              >
                Mark Replied
              </button>


              <button
                type="button"
                onClick={() =>
                  archiveEnquiry(
                    activeEnquiry
                  )
                }
              >
                Archive
              </button>


              <button
                type="button"
                className="is-danger"
                onClick={() =>
                  deleteEnquiry(
                    activeEnquiry
                  )
                }
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}