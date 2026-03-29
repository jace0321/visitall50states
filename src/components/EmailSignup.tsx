"use client";

import { useFormState } from "react-dom";
import { submitEmailSignup } from "@/app/actions/email-signup";
import SubmitButton from "@/components/SubmitButton";

const initialState: { error?: string; success?: string } = {};

export default function EmailSignup() {
  const [state, formAction] = useFormState(submitEmailSignup, initialState);

  return (
    <section className="py-24 px-6 bg-night text-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          Join the Journey
        </h2>
        <p className="text-white/60 text-lg mb-10">
          Get road trip tips, new state guides, and community updates. Free
          forever.
        </p>
        <form action={formAction} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-brand"
            required
          />
          <SubmitButton />
        </form>
        <div className="mt-4 min-h-6">
          {state?.error ? (
            <p className="text-sm text-red-300">{state.error}</p>
          ) : null}
          {state?.success ? (
            <p className="text-sm text-emerald-300">{state.success}</p>
          ) : null}
        </div>
        <p className="text-white/30 text-xs mt-2">
          No spam. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}
