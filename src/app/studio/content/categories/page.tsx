"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

import "./categories.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export default function CategoriesPage() {
  const supabase = createClient();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("0");

  const [isActive, setIsActive] =
    useState(true);


  /* =====================================================
     LOAD
     ===================================================== */

  async function loadCategories() {
    setLoading(true);
    setError("");

    const {
      data,
      error: fetchError,
    } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      });

    if (fetchError) {
      setError(
        fetchError.message
      );
    } else {
      setCategories(
        data ?? []
      );
    }

    setLoading(false);
  }


  useEffect(() => {
    loadCategories();
  }, []);


  /* =====================================================
     SLUG
     ===================================================== */

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^\w\s-]/g,
        ""
      )
      .replace(
        /[\s_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");
  }


  /* =====================================================
     NAME CHANGE
     ===================================================== */

  function handleNameChange(
    value: string
  ) {
    setName(value);

    if (!editingId) {
      setSlug(
        createSlug(value)
      );
    }
  }


  /* =====================================================
     RESET
     ===================================================== */

  function resetForm() {
    setEditingId(null);

    setName("");

    setSlug("");

    setDescription("");

    setSortOrder("0");

    setIsActive(true);

    setError("");

    setSuccess("");
  }


  /* =====================================================
     EDIT
     ===================================================== */

  function handleEdit(
    category: Category
  ) {
    setEditingId(
      category.id
    );

    setName(
      category.name
    );

    setSlug(
      category.slug
    );

    setDescription(
      category.description ?? ""
    );

    setSortOrder(
      String(
        category.sort_order
      )
    );

    setIsActive(
      category.is_active
    );

    setError("");

    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  /* =====================================================
     SAVE
     ===================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);

    setError("");

    setSuccess("");


    try {
      const cleanName =
        name.trim();

      const cleanSlug =
        slug.trim() ||
        createSlug(
          cleanName
        );

      const cleanDescription =
        description.trim();


      if (!cleanName) {
        throw new Error(
          "Category name is required."
        );
      }

      if (!cleanSlug) {
        throw new Error(
          "Category slug is required."
        );
      }


      const payload = {
        name:
          cleanName,

        slug:
          cleanSlug,

        description:
          cleanDescription ||
          null,

        sort_order:
          Number(
            sortOrder
          ) || 0,

        is_active:
          isActive,
      };


      /* =================================================
         UPDATE
         ================================================= */

      if (editingId) {

        const {
          error:
            updateError,
        } = await supabase
          .from("categories")
          .update(payload)
          .eq(
            "id",
            editingId
          );

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }

        setSuccess(
          "Category updated successfully."
        );

      }

      /* =================================================
         CREATE
         ================================================= */

      else {

        const {
          error:
            insertError,
        } = await supabase
          .from("categories")
          .insert(
            payload
          );

        if (insertError) {
          throw new Error(
            insertError.message
          );
        }

        setSuccess(
          "Category created successfully."
        );
      }


      resetForm();

      await loadCategories();

    } catch (submitError) {

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong."
      );

    } finally {

      setSaving(false);

    }
  }


  /* =====================================================
     DELETE
     ===================================================== */

  async function handleDelete(
    category: Category
  ) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");

    setSuccess("");


    const {
      error:
        deleteError,
    } = await supabase
      .from("categories")
      .delete()
      .eq(
        "id",
        category.id
      );

    if (deleteError) {

      /*
       * Posts reference categories with
       * ON DELETE SET NULL, so deleting a
       * category will not delete posts.
       */

      setError(
        deleteError.message
      );

      return;
    }

    setSuccess(
      "Category deleted successfully."
    );

    await loadCategories();
  }


  return (
    <main className="categories-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <header className="categories-header">

        <div>

          <Link
            href="/studio/content"
            className="categories-header__back"
          >
            ← Content
          </Link>

          <span className="categories-header__eyebrow">
            ORGANIZATION
          </span>

          <h1>
            Categories
          </h1>

          <p>
            Organize your AKNM content
            into clear editorial spaces.
          </p>

        </div>

      </header>


      {/* =================================================
          FEEDBACK
          ================================================= */}

      {error && (
        <div className="categories-message categories-message--error">
          {error}
        </div>
      )}

      {success && (
        <div className="categories-message categories-message--success">
          {success}
        </div>
      )}


      {/* =================================================
          CREATE / EDIT
          ================================================= */}

      <section className="category-editor">

        <div className="category-editor__header">

          <div>

            <span>
              {editingId
                ? "EDIT CATEGORY"
                : "NEW CATEGORY"}
            </span>

            <h2>
              {editingId
                ? "Update category"
                : "Create a category"}
            </h2>

          </div>

          {editingId && (
            <button
              type="button"
              className="category-cancel"
              onClick={
                resetForm
              }
            >
              Cancel
            </button>
          )}

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="category-form"
        >

          <div className="category-form__field">

            <label htmlFor="category-name">
              NAME
            </label>

            <input
              id="category-name"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value
                )
              }
              placeholder="e.g. Business"
              required
            />

          </div>


          <div className="category-form__field">

            <label htmlFor="category-slug">
              SLUG
            </label>

            <input
              id="category-slug"
              value={slug}
              onChange={(event) =>
                setSlug(
                  createSlug(
                    event.target.value
                  )
                )
              }
              placeholder="business"
              required
            />

          </div>


          <div className="category-form__field category-form__field--wide">

            <label htmlFor="category-description">
              DESCRIPTION
            </label>

            <textarea
              id="category-description"
              value={
                description
              }
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="What belongs in this category?"
              rows={4}
            />

          </div>


          <div className="category-form__field">

            <label htmlFor="category-order">
              ORDER
            </label>

            <input
              id="category-order"
              type="number"
              value={
                sortOrder
              }
              onChange={(event) =>
                setSortOrder(
                  event.target.value
                )
              }
              min="0"
            />

          </div>


          <label className="category-active">

            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={(event) =>
                setIsActive(
                  event.target.checked
                )
              }
            />

            <span>
              Active category
            </span>

          </label>


          <div className="category-form__actions">

            <button
              type="submit"
              disabled={
                saving
              }
              className="category-save"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Category"
                : "Create Category"}

              <span>
                ↗
              </span>
            </button>

          </div>

        </form>

      </section>


      {/* =================================================
          CATEGORY LIST
          ================================================= */}

      <section className="category-library">

        <div className="category-library__header">

          <div>

            <span>
              YOUR CATEGORIES
            </span>

            <h2>
              Editorial structure
            </h2>

          </div>

          <span className="category-count">
            {categories.length}{" "}
            {categories.length === 1
              ? "CATEGORY"
              : "CATEGORIES"}
          </span>

        </div>


        {loading ? (

          <div className="category-empty">
            Loading categories...
          </div>

        ) : categories.length === 0 ? (

          <div className="category-empty">

            <div className="category-empty__icon">
              +
            </div>

            <h3>
              No categories yet.
            </h3>

            <p>
              Create your first category
              above to start organizing
              your AKNM content.
            </p>

          </div>

        ) : (

          <div className="category-list">

            {categories.map(
              (category) => (

                <article
                  key={
                    category.id
                  }
                  className={`
                    category-item
                    ${
                      !category.is_active
                        ? "is-inactive"
                        : ""
                    }
                  `}
                >

                  <div className="category-item__order">
                    {String(
                      category.sort_order
                    ).padStart(
                      2,
                      "0"
                    )}
                  </div>


                  <div className="category-item__main">

                    <h3>
                      {category.name}
                    </h3>

                    <span>
                      /{category.slug}
                    </span>

                    {category.description && (
                      <p>
                        {
                          category.description
                        }
                      </p>
                    )}

                  </div>


                  <div
                    className={`
                      category-item__status
                      ${
                        category.is_active
                          ? "is-active"
                          : ""
                      }
                    `}
                  >
                    {category.is_active
                      ? "Active"
                      : "Inactive"}
                  </div>


                  <div className="category-item__actions">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          category
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="is-danger"
                      onClick={() =>
                        handleDelete(
                          category
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}