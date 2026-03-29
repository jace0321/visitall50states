"use server";

import { supabase } from "@/lib/supabase";

interface SignupState {
  error?: string;
  success?: string;
}

export async function submitEmailSignup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = formData.get("email");

  if (typeof email !== "string") {
    return { error: "Please enter a valid email address." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await supabase
    .from("email_signups")
    .insert({ email: normalizedEmail });

  if (error) {
    if (error.code === "23505") {
      return { success: "You’re already on the list." };
    }

    return { error: "Something went wrong. Try again in a minute." };
  }

  return { success: "You’re in. Road trip updates are on the way." };
}
