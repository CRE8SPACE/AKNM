"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

import "./music-categories.css";


type MusicCategory = {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  created_at: string;
};


export default function MusicCategoriesPage() {

  const [categories, setCategories] =
    useState<MusicCategory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  const [name, setName] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");


  const [editingId, setEditingId] =
    useState<string | null>(null);


  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* =========================================================
     LOAD CATEGORIES
     ========================================================= */

  async function loadCategories() {

    setLoading(true);

    const supabase =
      createClient();

    const {
      data,
      error,
    } = await supabase
      .from("music_categories")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


    if (error) {

      console.error(
        "Music categories load error:",
        error
      );

      setError(
        error.message
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


  /* =========================================================
     SLUG
     ========================================================= */

  function generateSlug(
    value: string
  ) {

    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

  }


  function handleNameChange(
    value: string
  ) {

    setName(value);

    if (!editingId) {

      setSlug(
        generateSlug(value)
      );

    }

  }


  /* =========================================================
     RESET FORM
     ========================================================= */

  function resetForm() {

    setName("");

    setSlug("");

    setDescription("");

    setEditingId(null);

  }


  /* =========================================================
     SAVE CATEGORY
     ========================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (!name.trim()) {

      setError(
        "Please enter a category name."
      );

      return;

    }


    if (!slug.trim()) {

      setError(
        "Please enter a valid slug."
      );

      return;

    }


    if (saving) {

      return;

    }


    setSaving(true);

    const supabase =
      createClient();


    try {

      if (editingId) {

        const {
          error,
        } = await supabase
          .from("music_categories")
          .update({

            name:
              name.trim(),

            slug:
              slug.trim(),

            description:
              description.trim() ||
              null,

          })
          .eq(
            "id",
            editingId
          );


        if (error) {

          throw new Error(
            error.message
          );

        }


        setSuccess(
          "Category updated successfully."
        );

      } else {

        const {
          error,
        } = await supabase
          .from("music_categories")
          .insert({

            name:
              name.trim(),

            slug:
              slug.trim(),

            description:
              description.trim() ||
              null,

          });


        if (error) {

          if (
            error.code ===
            "23505"
          ) {

            throw new Error(
              "A category with this slug already exists."
            );

          }

          throw new Error(
            error.message
          );

        }


        setSuccess(
          "Category created successfully."
        );

      }


      resetForm();

      await loadCategories();


    } catch (err) {

      console.error(
        "Music category save error:",
        err
      );

      setError(

        err instanceof Error
          ? err.message
          : "Something went wrong."

      );

    } finally {

      setSaving(false);

    }

  }


  /* =========================================================
     EDIT CATEGORY
     ========================================================= */

  function handleEdit(
    category: MusicCategory
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
      category.description ||
      ""
    );


    setError("");

    setSuccess("");


    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  }


  /* =========================================================
     DELETE CATEGORY
     ========================================================= */

  async function handleDelete(
    category: MusicCategory
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

    setDeletingId(
      category.id
    );


    const supabase =
      createClient();


    try {

      const {
        count,
        error: releaseError,
      } = await supabase
        .from("music_releases")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "category_id",
          category.id
        );


      if (releaseError) {

        throw new Error(
          releaseError.message
        );

      }


      if (
        count &&
        count > 0
      ) {

        throw new Error(
          `"${category.name}" cannot be deleted because ${count} music release${count > 1 ? "s are" : " is"} using this category.`
        );

      }


      const {
        error,
      } = await supabase
        .from("music_categories")
        .delete()
        .eq(
          "id",
          category.id
        );


      if (error) {

        throw new Error(
          error.message
        );

      }


      setSuccess(
        "Category deleted successfully."
      );


      await loadCategories();


    } catch (err) {

      console.error(
        "Music category delete error:",
        err
      );

      setError(

        err instanceof Error
          ? err.message
          : "Could not delete category."

      );

    } finally {

      setDeletingId(null);

    }

  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <main className="music-categories-page">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="music-categories-header">

        <Link
          href="/studio/music"
          className="music-categories-header__back"
        >
          ← Back to Music
        </Link>


        <span className="music-categories-header__eyebrow">
          AKNM STUDIO / MUSIC
        </span>


        <h1>
          Categories.
        </h1>


        <p>
          Organize your music releases into
          categories such as singles, EPs
          and albums.
        </p>

      </header>



      {/* =====================================================
          LAYOUT
          ===================================================== */}

      <div className="music-categories-layout">


        {/* ===================================================
            CATEGORY FORM
            =================================================== */}

        <aside className="music-categories-form">

          <div className="music-categories-panel__heading">

            <span>
              CATEGORY EDITOR
            </span>

            <strong>

              {editingId
                ? "Edit category"
                : "New category"}

            </strong>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >


            <label className="music-categories-field">

              <span>
                CATEGORY NAME
              </span>

              <input
                type="text"
                value={name}
                placeholder="e.g. Single"
                disabled={saving}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value
                  )
                }
              />

            </label>


            <label className="music-categories-field">

              <span>
                SLUG
              </span>

              <input
                type="text"
                value={slug}
                placeholder="single"
                disabled={saving}
                onChange={(event) =>
                  setSlug(
                    generateSlug(
                      event.target.value
                    )
                  )
                }
              />

            </label>


            <label className="music-categories-field">

              <span>
                DESCRIPTION
              </span>

              <textarea
                value={description}
                placeholder="Describe this category..."
                rows={5}
                disabled={saving}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
              />

            </label>


            <div className="music-categories-form__actions">

              {editingId && (

                <button
                  type="button"
                  className="music-categories-cancel"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

              )}


              <button
                type="submit"
                className="music-categories-save"
                disabled={saving}
              >

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update category"
                    : "Create category"}

              </button>

            </div>

          </form>

        </aside>



        {/* ===================================================
            CATEGORY LIST
            =================================================== */}

        <section className="music-categories-list">


          <div className="music-categories-list__header">

            <div>

              <span>
                MUSIC LIBRARY
              </span>

              <h2>
                Your categories
              </h2>

            </div>


            <strong>

              {categories.length}

            </strong>

          </div>


          {loading ? (

            <div className="music-categories-loading">

              Loading categories...

            </div>

          ) : categories.length === 0 ? (

            <div className="music-categories-empty">

              <strong>
                No categories yet.
              </strong>

              <span>
                Create your first music category.
              </span>

            </div>

          ) : (

            <div className="music-categories-grid">

              {categories.map(
                (category) => (

                  <article
                    key={category.id}
                    className="music-category-card"
                  >

                    <div className="music-category-card__top">

                      <span>
                        CATEGORY
                      </span>

                      <code>
                        {category.slug}
                      </code>

                    </div>


                    <h3>
                      {category.name}
                    </h3>


                    <p>

                      {category.description ||
                        "No description provided."}

                    </p>


                    <footer>

                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(
                            category
                          )
                        }
                        disabled={
                          deletingId ===
                          category.id
                        }
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        className="music-category-card__delete"
                        onClick={() =>
                          handleDelete(
                            category
                          )
                        }
                        disabled={
                          deletingId ===
                          category.id
                        }
                      >

                        {deletingId ===
                        category.id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </footer>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </div>



      {/* =====================================================
          MESSAGES
          ===================================================== */}

      {error && (

        <div className="music-categories-message music-categories-message--error">

          {error}

        </div>

      )}


      {success && (

        <div className="music-categories-message music-categories-message--success">

          {success}

        </div>

      )}

    </main>

  );

}