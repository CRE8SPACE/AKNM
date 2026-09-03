"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo/Logo";

import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/studio");
    router.refresh();
  }

  return (
    <main className="login-page">

      <div className="login-page__background" />

      <section className="login-card">

        {/* =================================================
            LOGO
            ================================================= */}

        <div className="login-card__brand">
          <Logo />
        </div>


        {/* =================================================
            HEADING
            ================================================= */}

        <div className="login-card__heading">

          <span className="login-card__eyebrow">
            PRIVATE ACCESS
          </span>

          <h1>
            Welcome back.
          </h1>

          <p>
            Sign in to AKNM Studio.
          </p>

        </div>


        {/* =================================================
            LOGIN FORM
            ================================================= */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="login-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

          </div>


          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

          </div>


          {/* ERROR */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "Signing in..."
                : "Sign in"}
            </span>

            <span>
              ↗
            </span>
          </button>

        </form>


        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="login-card__footer">

          <span>
            AKNM.PRO
          </span>

          <span>
            PRIVATE STUDIO
          </span>

        </div>

      </section>

    </main>
  );
}