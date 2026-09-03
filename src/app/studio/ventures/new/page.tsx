"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import "./new-venture.css";

type VentureType =
  | "COMPANY"
  | "PRODUCT"
  | "BRAND"
  | "EXPERIMENT";

const ventureTypes: VentureType[] = [
  "COMPANY",
  "PRODUCT",
  "BRAND",
  "EXPERIMENT",
];

export default function NewVenturePage() {
  const router = useRouter();

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

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/studio/ventures",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            number: Number(form.number),
            type: form.type,
            name: form.name.trim(),
            slug: form.slug.trim(),
            description:
              form.description.trim() || null,
            status: form.status.trim(),
            year: form.year.trim() || null,
            href: form.href.trim() || null,
            featured: form.featured,
            is_visible: form.is_visible,
            display_order:
              Number(form.display_order) || 0,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Could not create venture."
        );
      }

      router.push("/studio/ventures");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create venture."
      );

      setSaving(false);
    }
  }

  return (
    <main className="new-venture-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="new-venture-header">

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
          AKNM STUDIO / VENTURES
        </span>

        <h1>New Venture</h1>

        <p>
          Add a company, product, brand or
          experiment to your ventures library.
        </p>

      </header>


      {/* =====================================================
          FORM
          ===================================================== */}

      <form
        className="new-venture-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            01 — IDENTITY
            =================================================== */}

        <section className="new-venture-section">

          <div className="new-venture-section-heading">

            <span>01</span>

            <div>
              <h2>Identity</h2>

              <p>
                Define the fundamental identity
                of this venture.
              </p>
            </div>

          </div>


          <div className="new-venture-fields">

            <div className="new-venture-two-columns">

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
                  {ventureTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </label>

            </div>


            {/* NAME */}

            <label>
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

            <label>
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

            <label>
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
            02 — STATUS
            =================================================== */}

        <section className="new-venture-section">

          <div className="new-venture-section-heading">

            <span>02</span>

            <div>
              <h2>Current State</h2>

              <p>
                Define the venture's current
                operational state and public link.
              </p>
            </div>

          </div>


          <div className="new-venture-fields">

            <div className="new-venture-two-columns">

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

            </div>


            {/* PUBLIC LINK */}

            <label>
              <span>PUBLIC LINK</span>

              <input
                type="url"
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
            03 — PUBLICATION
            =================================================== */}

        <section className="new-venture-section">

          <div className="new-venture-section-heading">

            <span>03</span>

            <div>
              <h2>Publication</h2>

              <p>
                Control how this venture appears
                across the public platform.
              </p>
            </div>

          </div>


          <div className="new-venture-fields">

            {/* FEATURED */}

            <div className="new-venture-toggle">

              <label className="new-venture-switch">

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

                <span className="new-venture-switch__track">

                  <span className="new-venture-switch__thumb" />

                </span>

              </label>


              <div>

                <strong>
                  Featured venture
                </strong>

                <p>
                  Highlight this venture on
                  the public Ventures page.
                </p>

              </div>

            </div>


            {/* VISIBILITY */}

            <div className="new-venture-toggle">

              <label className="new-venture-switch">

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

                <span className="new-venture-switch__track">

                  <span className="new-venture-switch__thumb" />

                </span>

              </label>


              <div>

                <strong>
                  Visible publicly
                </strong>

                <p>
                  Show this venture on the
                  public Ventures page.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            MESSAGE
            =================================================== */}

        {error && (
          <div className="new-venture-message new-venture-message--error">
            {error}
          </div>
        )}


        {/* ===================================================
            ACTIONS
            =================================================== */}

        <div className="new-venture-actions">

          <button
            type="button"
            className="new-venture-cancel"
            onClick={() =>
              router.push("/studio/ventures")
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="new-venture-create"
            disabled={saving}
          >
            {saving
              ? "Creating..."
              : "Create Venture"}

            {!saving && (
              <span>↗</span>
            )}
          </button>

        </div>

      </form>

    </main>
  );
}