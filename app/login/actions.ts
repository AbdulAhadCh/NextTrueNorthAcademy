"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// What the login form shows after an action: an error (red) or a notice (green).
export type AuthState = {
  error?: string;
  notice?: string;
};

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

// Turn Supabase's technical messages into friendlier ones.
function friendlyError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "That email and password don't match. Please try again.";
  }
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the link.";
  }
  if (message.toLowerCase().includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return message;
}

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyError(error.message) };

  // Signed in: the session cookie is set, go to the portal.
  redirect("/dashboard");
}

export async function signUp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = readCredentials(formData);
  const fullName = String(formData.get("name") ?? "").trim();

  if (password.length < 8) {
    return { error: "Your password needs at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    // Saved on the user; the database trigger copies it into the profiles table.
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: friendlyError(error.message) };

  return { notice: "Almost there! Check your inbox and click the link to confirm your email." };
}

export async function requestPasswordReset(email: string): Promise<AuthState> {
  const trimmed = email.trim();
  if (!trimmed) return { error: "Enter your email address above first." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
  if (error) return { error: friendlyError(error.message) };

  return { notice: "If that email has an account, a reset link is on its way." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
