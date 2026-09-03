import { createClient } from "@/lib/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "120px 40px",
        background: "#000",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>
        Supabase Connection Test
      </h1>

      <p>
        User:
        {" "}
        {user?.email ?? "Not authenticated"}
      </p>

      {error && (
        <pre>
          {error.message}
        </pre>
      )}
    </main>
  );
}