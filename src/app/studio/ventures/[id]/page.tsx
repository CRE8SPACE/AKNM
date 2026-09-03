"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import "./edit-venture.css";

type VentureType =
  | "COMPANY"
  | "PRODUCT"
  | "BRAND"
  | "EXPERIMENT";

type Venture = {
  id: string;
  number: number;
  type: VentureType;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  year: string | null;
  href: string | null;
  featured: boolean;
  is_visible: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const ventureTypes: VentureType[] = [
  "COMPANY",
  "PRODUCT",
  "BRAND",
  "EXPERIMENT",
];

export default function EditVenturePage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    number: "",
    type: "COMPANY" as VentureType,
    name: "",
    slug: "",
    description: "",
    status: "BUILDING",
    year: "",
    href: "",
    featured: false,
    is_visible: true,
    display_order: "0",
  });

  useEffect(() => {
    if (!id) return;

    async function loadVenture() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("ventures")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError(
          fetchError.message ||
            "Could not load venture."
        );

        setLoading(false);
        return;
      }

      const venture = data as Venture;

      setForm({
        number: String(venture.number ?? ""),
        type: venture.type,
        name: venture.name ?? "",
        slug: venture.slug ?? "",
        description:
          venture.description ?? "",
        status:
          venture.status ?? "BUILDING",
        year: venture.year ?? "",
        href: venture.href ?? "",
        featured:
          venture.featured ?? false,
        is_visible:
          venture.is_visible ?? true,
        display_order: String(
          venture.display_order ?? 0
        ),
      });

      setLoading(false);
    }

    loadVenture();
  }, [id]);

  function updateField(
    field: string,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError("Venture ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      number: Number(form.number),
      type: form.type,
      name: form.name.trim(),
      slug: form.slug.trim(),
      description:
        form.description.trim() || null,
      status:
        form.status.trim() || "BUILDING",
      year:
        form.year.trim() || null,
      href:
        form.href.trim() || null,
      featured: form.featured,
      is_visible: form.is_visible,
      display_order:
        Number(form.display_order) || 0,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("ventures")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      setError(
        updateError.message ||
          "Could not update venture."
      );

      setSaving(false);
      return;
    }

    router.push("/studio/ventures");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="new-venture-page">
        <section className="new-venture-header">
          <div>
            <span className="new-venture-eyebrow">
              AKNM STUDIO / VENTURES
            </span>

            <h1>Loading...</h1>

            <p>
              Loading venture information.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="new-venture-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="new-venture-header">

        <div>
          <button
            type="button"
            className="new-venture-back"
            onClick={() =>
              router.push("/studio/ventures")
            }
          >
            ← Back to Ventures
          </button>

          <span className="new-venture-eyebrow">
            AKNM STUDIO / VENTURES / EDIT
          </span>

          <h1>
            Edit Venture
          </h1>

          <p>
            Update the identity, status and
            public configuration of this venture.
          </p>
        </div>

      </section>


      {/* =====================================================
          FORM
          ===================================================== */}

      <form
        className="new-venture-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            IDENTITY
            =================================================== */}

        <section className="new-venture-card">

          <div className="new-venture-card__header">
            <span>IDENTITY</span>

            <h2>
              Venture information
            </h2>
          </div>


          <div className="new-venture-grid">

            {/* NUMBER */}

            <label>
              <span>NUMBER</span>

              <input
                type="number"
                min="1"
                required
                value={form.number}
                onChange={(e) =>
                  updateField(
                    "number",
                    e.target.value
                  )
                }
                placeholder="01"
              />
            </label>


            {/* TYPE */}

            <label>
              <span>TYPE</span>

              <select
                value={form.type}
                onChange={(e) =>
                  updateField(
                    "type",
                    e.target.value
                  )
                }
              >
                {ventureTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  )
                )}
              </select>
            </label>


            {/* NAME */}

            <label className="new-venture-field--wide">
              <span>NAME</span>

              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  handleNameChange(
                    e.target.value
                  )
                }
                placeholder="CRETESPACE"
              />
            </label>


            {/* SLUG */}

            <label className="new-venture-field--wide">
              <span>SLUG</span>

              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) =>
                  updateField(
                    "slug",
                    e.target.value
                  )
                }
                placeholder="cretespace"
              />
            </label>


            {/* DESCRIPTION */}

            <label className="new-venture-field--full">
              <span>DESCRIPTION</span>

              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe this venture..."
              />
            </label>

          </div>

        </section>


        {/* ===================================================
            STATUS
            =================================================== */}

        <section className="new-venture-card">

          <div className="new-venture-card__header">
            <span>STATUS</span>

            <h2>
              Current state
            </h2>
          </div>


          <div className="new-venture-grid">

            {/* STATUS */}

            <label>
              <span>STATUS</span>

              <input
                type="text"
                required
                value={form.status}
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value.toUpperCase()
                  )
                }
                placeholder="BUILDING"
              />
            </label>


            {/* YEAR */}

            <label>
              <span>YEAR</span>

              <input
                type="text"
                value={form.year}
                onChange={(e) =>
                  updateField(
                    "year",
                    e.target.value
                  )
                }
                placeholder="2026"
              />
            </label>


            {/* PUBLIC LINK */}

            <label className="new-venture-field--wide">
              <span>PUBLIC LINK</span>

              <input
                type="text"
                value={form.href}
                onChange={(e) =>
                  updateField(
                    "href",
                    e.target.value
                  )
                }
                placeholder="https://..."
              />
            </label>


            {/* DISPLAY ORDER */}

            <label>
              <span>DISPLAY ORDER</span>

              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) =>
                  updateField(
                    "display_order",
                    e.target.value
                  )
                }
              />
            </label>

          </div>

        </section>


        {/* ===================================================
            VISIBILITY
            =================================================== */}

        <section className="new-venture-card">

          <div className="new-venture-card__header">
            <span>PUBLICATION</span>

            <h2>
              Visibility
            </h2>
          </div>


          <div className="new-venture-options">

            {/* FEATURED */}

            <label className="new-venture-toggle">

              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  updateField(
                    "featured",
                    e.target.checked
                  )
                }
              />

              <div>
                <strong>
                  Featured venture
                </strong>

                <small>
                  Highlight this venture
                  publicly.
                </small>
              </div>

            </label>


            {/* VISIBILITY */}

            <label className="new-venture-toggle">

              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) =>
                  updateField(
                    "is_visible",
                    e.target.checked
                  )
                }
              />

              <div>
                <strong>
                  Visible publicly
                </strong>

                <small>
                  Show this venture on
                  the public Ventures page.
                </small>
              </div>

            </label>

          </div>

        </section>


        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (
          <div className="new-venture-error">
            {error}
          </div>
        )}


        {/* ===================================================
            ACTIONS
            =================================================== */}

        <div className="new-venture-actions">

          <button
            type="button"
            onClick={() =>
              router.push("/studio/ventures")
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}

            {!saving && (
              <span>↗</span>
            )}
          </button>

        </div>

      </form>

    </main>
  );
}