"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { subscribeNewsletter } from "@/app/(public)/actions";

export function Newsletter() {
  const [state, action, pending] = useActionState(subscribeNewsletter, { ok: false, message: "" });
  return (
    <form action={action} className="w-full max-w-md">
      <div className="flex flex-col gap-2 rounded-3xl bg-white/8 p-1.5 ring-1 ring-white/15 focus-within:ring-gold/70 sm:flex-row sm:items-center sm:rounded-full">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          aria-label="Email address"
          className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-5 text-white outline-none placeholder:text-white/45"
        />
        <button type="submit" disabled={pending} className="btn btn-gold w-full !px-5 !py-3 sm:w-auto">
          {pending ? "Sending" : "Subscribe"} <ArrowRight className="size-4" />
        </button>
      </div>
      <p className={`mt-3 min-h-5 text-sm ${state.ok ? "text-gold" : "text-red-300"}`} aria-live="polite">
        {state.message}
      </p>
    </form>
  );
}
