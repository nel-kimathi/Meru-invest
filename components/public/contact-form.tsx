"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { submitContact } from "@/app/(public)/actions";

const field =
  "peer h-14 w-full rounded-2xl border border-ink/12 bg-white px-5 pt-4 text-ink outline-none transition placeholder:text-transparent focus:border-brand focus:ring-4 focus:ring-brand/15";
const label =
  "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink/50 transition-all peer-focus:top-4 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold";

function Field({ id, name, text, type = "text", max }: { id: string; name: string; text: string; type?: string; max: number }) {
  return (
    <div className="relative">
      <input id={id} name={name} type={type} required maxLength={max} placeholder={text} className={field} />
      <label htmlFor={id} className={label}>{text}</label>
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, { ok: false, message: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="contact-name" name="name" text="Your name" max={100} />
        <Field id="contact-email" name="email" type="email" text="Email address" max={200} />
      </div>
      <Field id="contact-subject" name="subject" text="Subject" max={200} />
      <div className="relative">
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Message"
          className="peer w-full resize-none rounded-2xl border border-ink/12 bg-white px-5 pb-4 pt-8 text-ink outline-none transition placeholder:text-transparent focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
        <label htmlFor="contact-message" className="pointer-events-none absolute left-5 top-5 text-ink/50 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold">
          Message
        </label>
      </div>
      {/* Honeypot, hidden from humans */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button type="submit" disabled={pending} className="btn btn-forest">
          {pending ? "Sending" : "Send message"} <ArrowRight className="size-4" />
        </button>
        {state.message ? (
          <p className={`text-sm font-medium ${state.ok ? "text-brand" : "text-red-600"}`} aria-live="polite">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
