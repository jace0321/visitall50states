"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-8 py-4 bg-amber-brand hover:bg-amber-deep text-night font-bold rounded-full transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
    >
      {pending ? "Joining..." : "Subscribe"}
    </button>
  );
}
