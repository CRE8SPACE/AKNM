"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import "./ventures.css";


/* =========================================================
   TYPES
   ========================================================= */

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


/* =========================================================
   CONSTANTS
   ========================================================= */

const ventureTypes: VentureType[] = [
  "COMPANY",
  "PRODUCT",
  "BRAND",
  "EXPERIMENT",
];


/* =========================================================
   PAGE
   ========================================================= */

export default function VenturesPage() {
  const supabase = createClient();

  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<"ALL" | VentureType>("ALL");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  /* =========================================================
     LOAD
     ========================================================= */

  async function loadVentures() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("ventures")
      .select("*")
      .order("display_order", {
        ascending: true,
      })
      .order("number", {
        ascending: true,
      });

    if (fetchError) {
      setError(
        fetchError.message ||
          "Could not load ventures."
      );

      setLoading(false);
      return;
    }

    setVentures(
      (data || []) as Venture[]
    );

    setLoading(false);
  }


  useEffect(() => {
    loadVentures();
  }, []);


  /* =========================================================
     FILTER
     ========================================================= */

  const filteredVentures = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return ventures.filter((venture) => {
      const matchesSearch =
        !query ||
        venture.name
          .toLowerCase()
          .includes(query) ||
        venture.slug
          .toLowerCase()
          .includes(query) ||
        venture.type
          .toLowerCase()
          .includes(query) ||
        venture.status
          .toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        venture.type === typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    ventures,
    search,
    typeFilter,
  ]);


  /* =========================================================
     COUNTS
     ========================================================= */

  const visibleCount = ventures.filter(
    (venture) =>
      venture.is_visible
  ).length;

  const featuredCount = ventures.filter(
    (venture) =>
      venture.featured
  ).length;


  /* =========================================================
     TOGGLE VISIBILITY
     ========================================================= */

  async function toggleVisibility(
    venture: Venture
  ) {
    if (busyId) return;

    setBusyId(venture.id);
    setError("");

    const nextValue =
      !venture.is_visible;

    const { error: updateError } =
      await supabase
        .from("ventures")
        .update({
          is_visible: nextValue,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", venture.id);

    if (updateError) {
      setError(
        updateError.message ||
          "Could not update visibility."
      );

      setBusyId(null);
      return;
    }

    setVentures((current) =>
      current.map((item) =>
        item.id === venture.id
          ? {
              ...item,
              is_visible:
                nextValue,
            }
          : item
      )
    );

    setBusyId(null);
  }


  /* =========================================================
     TOGGLE FEATURED
     ========================================================= */

  async function toggleFeatured(
    venture: Venture
  ) {
    if (busyId) return;

    setBusyId(venture.id);
    setError("");

    const nextValue =
      !venture.featured;

    const { error: updateError } =
      await supabase
        .from("ventures")
        .update({
          featured: nextValue,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", venture.id);

    if (updateError) {
      setError(
        updateError.message ||
          "Could not update featured state."
      );

      setBusyId(null);
      return;
    }

    setVentures((current) =>
      current.map((item) =>
        item.id === venture.id
          ? {
              ...item,
              featured:
                nextValue,
            }
          : item
      )
    );

    setBusyId(null);
  }


  /* =========================================================
     DELETE
     ========================================================= */

  async function deleteVenture(
    venture: Venture
  ) {
    if (deletingId) return;

    const confirmed =
      window.confirm(
        `Delete "${venture.name}"? This cannot be undone.`
      );

    if (!confirmed) return;

    setDeletingId(venture.id);
    setError("");

    const { error: deleteError } =
      await supabase
        .from("ventures")
        .delete()
        .eq("id", venture.id);

    if (deleteError) {
      setError(
        deleteError.message ||
          "Could not delete venture."
      );

      setDeletingId(null);
      return;
    }

    setVentures((current) =>
      current.filter(
        (item) =>
          item.id !== venture.id
      )
    );

    setDeletingId(null);
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="ventures-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <section className="ventures-header">

        <div className="ventures-header__main">

          <span className="ventures-eyebrow">
            AKNM STUDIO / VENTURES
          </span>

          <h1>Ventures</h1>

          <p>
            Manage the companies, products,
            brands and experiments that make
            up the AKNM ecosystem.
          </p>

        </div>

        <div className="ventures-header__actions">

          <button
            type="button"
            className="ventures-refresh"
            onClick={loadVentures}
            disabled={loading}
          >
            <span>↻</span>
            Refresh
          </button>

          <Link
            href="/studio/ventures/new"
            className="ventures-create"
          >
            <span>+</span>
            New Venture
          </Link>

        </div>

      </section>


      {/* =====================================================
          STATS
          ===================================================== */}

      <section className="ventures-stats">

        <div className="ventures-stat">
          <span>Total</span>
          <strong>
            {ventures.length
              .toString()
              .padStart(2, "0")}
          </strong>
        </div>

        <div className="ventures-stat">
          <span>Visible</span>
          <strong>
            {visibleCount
              .toString()
              .padStart(2, "0")}
          </strong>
        </div>

        <div className="ventures-stat">
          <span>Featured</span>
          <strong>
            {featuredCount
              .toString()
              .padStart(2, "0")}
          </strong>
        </div>

      </section>


      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="ventures-toolbar">

        <div className="ventures-search">

          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search ventures..."
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        <div className="ventures-filters">

          <button
            type="button"
            className={
              typeFilter === "ALL"
                ? "is-active"
                : ""
            }
            onClick={() =>
              setTypeFilter("ALL")
            }
          >
            All
          </button>

          {ventureTypes.map(
            (type) => (
              <button
                key={type}
                type="button"
                className={
                  typeFilter === type
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setTypeFilter(type)
                }
              >
                {type}
              </button>
            )
          )}

        </div>

      </section>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="ventures-message ventures-message--error">
          {error}
        </div>
      )}


      {/* =====================================================
          CONTENT
          ===================================================== */}

      <section className="ventures-content">

        {loading ? (
          <div className="ventures-empty">
            <span className="ventures-empty__mark">
              ...
            </span>

            <strong>
              Loading ventures
            </strong>

            <p>
              Fetching your ventures library.
            </p>
          </div>
        ) : filteredVentures.length === 0 ? (
          <div className="ventures-empty">

            <span className="ventures-empty__mark">
              —
            </span>

            <strong>
              {ventures.length === 0
                ? "No ventures yet"
                : "No matching ventures"}
            </strong>

            <p>
              {ventures.length === 0
                ? "Create your first venture to begin building the library."
                : "Try a different search or filter."}
            </p>

            {ventures.length === 0 && (
              <Link
                href="/studio/ventures/new"
                className="ventures-empty__action"
              >
                Create Venture
                <span>↗</span>
              </Link>
            )}

          </div>
        ) : (
          <div className="ventures-list">

            {/* TABLE HEADER */}

            <div className="ventures-list__header">

              <span>VENTURE</span>
              <span>TYPE</span>
              <span>STATUS</span>
              <span>YEAR</span>
              <span>PUBLIC</span>
              <span></span>

            </div>


            {/* ROWS */}

            {filteredVentures.map(
              (venture) => (
                <article
                  key={venture.id}
                  className="venture-row"
                >

                  {/* IDENTITY */}

                  <div className="venture-row__identity">

                    <span className="venture-row__number">
                      {String(
                        venture.number
                      ).padStart(2, "0")}
                    </span>

                    <div>

                      <strong>
                        {venture.name}
                      </strong>

                      <small>
                        /{venture.slug}
                      </small>

                    </div>

                  </div>


                  {/* TYPE */}

                  <div className="venture-row__type">
                    <span>
                      {venture.type}
                    </span>
                  </div>


                  {/* STATUS */}

                  <div className="venture-row__status">
                    <span
                      className={
                        venture.status
                          .toLowerCase() ===
                        "building"
                          ? "is-building"
                          : ""
                      }
                    >
                      <i />
                      {venture.status}
                    </span>
                  </div>


                  {/* YEAR */}

                  <div className="venture-row__year">
                    {venture.year || "—"}
                  </div>


                  {/* PUBLIC */}

                  <div className="venture-row__public">

                    <button
                      type="button"
                      className={
                        venture.featured
                          ? "is-featured"
                          : ""
                      }
                      onClick={() =>
                        toggleFeatured(
                          venture
                        )
                      }
                      disabled={
                        busyId ===
                        venture.id
                      }
                      title={
                        venture.featured
                          ? "Remove featured"
                          : "Make featured"
                      }
                    >
                      {venture.featured
                        ? "★"
                        : "☆"}
                    </button>

                    <button
                      type="button"
                      className={
                        venture.is_visible
                          ? "is-visible"
                          : ""
                      }
                      onClick={() =>
                        toggleVisibility(
                          venture
                        )
                      }
                      disabled={
                        busyId ===
                        venture.id
                      }
                      title={
                        venture.is_visible
                          ? "Hide venture"
                          : "Show venture"
                      }
                    >
                      {venture.is_visible
                        ? "●"
                        : "○"}
                    </button>

                  </div>


                  {/* ACTIONS */}

                  <div className="venture-row__actions">

                    <Link
                      href={`/studio/ventures/${venture.id}`}
                      className="venture-row__edit"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      className="venture-row__delete"
                      onClick={() =>
                        deleteVenture(
                          venture
                        )
                      }
                      disabled={
                        deletingId ===
                        venture.id
                      }
                    >
                      {deletingId ===
                      venture.id
                        ? "..."
                        : "Delete"}
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      {!loading &&
        filteredVentures.length > 0 && (
          <div className="ventures-footer">

            <span>
              Showing{" "}
              <strong>
                {filteredVentures.length}
              </strong>{" "}
              of{" "}
              <strong>
                {ventures.length}
              </strong>{" "}
              ventures
            </span>

            <span>
              AKNM STUDIO
            </span>

          </div>
        )}

    </main>
  );
}