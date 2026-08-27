"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4"
      style={{ backgroundColor: "#F9F0E2" }}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{
          backgroundColor: "#fff",
          border: "1px solid rgba(74,11,11,0.1)",
          borderRadius: "4px",
        }}
      >
        <h1
          className="t-display text-center mb-2"
          style={{ fontSize: "1.5rem", color: "#4A0B0B" }}
        >
          ADMIN
        </h1>
        <p
          className="t-caption text-center mb-8"
          style={{ color: "#756E6B", letterSpacing: "0.1em" }}
        >
          UMANANDA PERCEPTIONS
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              className="t-caption block mb-2"
              style={{ color: "#4A0B0B", letterSpacing: "0.05em" }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 t-p2 outline-none"
              style={{
                border: "1px solid rgba(74,11,11,0.15)",
                color: "#4A0B0B",
                backgroundColor: "#F9F0E2",
              }}
            />
          </div>

          <div className="mb-6">
            <label
              className="t-caption block mb-2"
              style={{ color: "#4A0B0B", letterSpacing: "0.05em" }}
            >
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 t-p2 outline-none"
              style={{
                border: "1px solid rgba(74,11,11,0.15)",
                color: "#4A0B0B",
                backgroundColor: "#F9F0E2",
              }}
            />
          </div>

          {error && (
            <p className="t-caption mb-4" style={{ color: "#FF423F" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 t-nav transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "#4A0B0B",
              color: "#F9F0E2",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <p className="t-caption text-center mt-6" style={{ color: "#756E6B" }}>
          <Link
            href="/"
            className="underline"
            style={{ color: "#756E6B" }}
          >
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
