"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ demoAllowed, next = "/studio" }: { demoAllowed: boolean; next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(demoAllowed ? "demo@vedoy.no" : "");
  const [password, setPassword] = useState(demoAllowed ? "vedoydemo" : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Innlogging feilet.");
      router.push(next.startsWith("/studio") ? next : "/studio");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Innlogging feilet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        <span>E-post</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </label>
      <label>
        <span>Passord</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button--dark button--wide" disabled={loading}>{loading ? "Åpner Studio …" : "Åpne Vedøy Studio"}</button>
      {demoAllowed && <p className="login-form__hint">Demoen er ferdig utfylt. Endre konto og slå av demomodus før produksjon.</p>}
    </form>
  );
}
