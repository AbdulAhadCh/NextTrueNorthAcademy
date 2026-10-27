"use client";

import Link from "next/link";
import { useActionState, useRef, useState, useTransition } from "react";
import AuthScene from "@/components/auth-scene";
import {
  requestPasswordReset,
  signIn,
  signUp,
  type AuthState,
} from "@/app/login/actions";

type AuthMode = "signin" | "signup";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="auth-social__google" viewBox="0 0 24 24">
      <path
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.96-.9 6.62-2.4l-3.24-2.52c-.9.6-2.03.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.41 13.92a6 6 0 0 1 0-3.84v-2.6H3.06a10 10 0 0 0 0 9.04l3.35-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.98 14.7 2 12 2a10 10 0 0 0-8.94 5.48l3.35 2.6C7.2 7.72 9.4 5.96 12 5.96Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="auth-social__apple"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M16.7 12.8c0-2.2 1.8-3.3 1.9-3.4a4.1 4.1 0 0 0-3.2-1.7c-1.4-.1-2.7.8-3.4.8s-1.8-.8-3-.8a4.4 4.4 0 0 0-3.7 2.2c-1.6 2.7-.4 6.6 1.1 8.8.8 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 3-.7s1.9.7 3 .7 2-.9 2.7-2.1a9.2 9.2 0 0 0 1.2-2.4 3.8 3.8 0 0 1-2.4-3.6ZM14.4 6.2A4 4 0 0 0 15.3 3a4.1 4.1 0 0 0-2.8 1.5 3.8 3.8 0 0 0-.9 3.1 3.4 3.4 0 0 0 2.8-1.4Z" />
    </svg>
  );
}

function AuthMark() {
  return (
    <svg
      aria-hidden="true"
      className="auth-brand__mark"
      fill="none"
      viewBox="0 0 32 32"
    >
      <path
        d="m16 2.5 3.4 9.1 9.1 4.4-9.1 3.4-3.4 9.1-3.4-9.1-9.1-3.4 9.1-4.4L16 2.5Z"
        fill="currentColor"
      />
      <circle cx="16" cy="16" r="3" fill="white" />
    </svg>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [message, setMessage] = useState("");
  const isSignUp = mode === "signup";

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
  }

  return (
    <main className="auth-page">
      <AuthScene />

      <section
        aria-labelledby="auth-title"
        className="auth-card"
        data-auth-card="true"
      >
        <Link aria-label="TrueNorth Academy home" className="auth-brand" href="/">
          <AuthMark />
          <span>TRUE NORTH</span>
        </Link>

        <header className="auth-card__heading">
          <h1 id="auth-title">{isSignUp ? "Create your account" : "Sign in to TrueNorth"}</h1>
          <p>
            {isSignUp
              ? "Start your PEBC preparation with TrueNorth Academy."
              : "Enter your credentials to access your PEBC candidate portal"}
          </p>
        </header>




        <EmailForm key={mode} mode={mode} socialMessage={message} />

        <p className="auth-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => switchMode(isSignUp ? "signin" : "signup")}
            type="button"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </section>

      <p className="auth-security">
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M10 2 3.5 4.5v4.8c0 4 2.8 6.8 6.5 8.7 3.7-1.9 6.5-4.7 6.5-8.7V4.5L10 2Z" />
          <path d="m7.5 10 1.7 1.7 3.5-3.5" />
        </svg>
        Secure access to your TrueNorth Academy portal
      </p>
    </main>
  );
}

/**
 * The email + password form. It gets a fresh copy (via `key={mode}`) whenever
 * the visitor switches between "Sign in" and "Sign up", so old messages clear.
 */
function EmailForm({ mode, socialMessage }: { mode: AuthMode; socialMessage: string }) {
  const isSignUp = mode === "signup";
  const formRef = useRef<HTMLFormElement>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // useActionState runs the server action on submit and gives us its result
  // (state), the function to put on the form (formAction) and a loading flag (pending).
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    isSignUp ? signUp : signIn,
    {},
  );

  const [resetState, setResetState] = useState<AuthState | null>(null);
  const [resetPending, startReset] = useTransition();

  function handleForgotPassword() {
    const email = formRef.current?.elements.namedItem("email") as HTMLInputElement | null;
    startReset(async () => {
      setResetState(await requestPasswordReset(email?.value ?? ""));
    });
  }

  // Show the most recent message: password-reset result, then form result, then social buttons.
  const shown = resetState ?? state;
  const error = shown.error ?? (shown.notice ? "" : socialMessage);
  const notice = shown.error ? "" : shown.notice;

  return (
    <form action={formAction} className="auth-form" ref={formRef}>
      {isSignUp ? (
        <label className="auth-field">
          <span>Name</span>
          <span className="auth-field__control">
            <input
              autoComplete="name"
              name="name"
              placeholder="Your name"
              required
            />
          </span>
        </label>
      ) : null}

      <label className="auth-field">
        <span>Email address</span>
        <span className="auth-field__control">
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <rect height="12" rx="2" width="16" x="2" y="4" />
            <path d="m3 6 7 5 7-5" />
          </svg>
          <input
            autoComplete="email"
            name="email"
            placeholder="name@example.com"
            required
            type="email"
          />
        </span>
      </label>

      <label className="auth-field">
        <span className="auth-field__label">
          Password
          {!isSignUp ? (
            <button
              className="auth-forgot"
              disabled={resetPending}
              onClick={handleForgotPassword}
              type="button"
            >
              {resetPending ? "Sending…" : "Forgot password?"}
            </button>
          ) : null}
        </span>
        <span className="auth-field__control">
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <rect height="9" rx="2" width="14" x="3" y="8" />
            <path d="M6 8V6a4 4 0 0 1 8 0v2m-4 4v2" />
          </svg>
          <input
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={8}
            name="password"
            placeholder="At least 8 characters"
            required
            type={passwordVisible ? "text" : "password"}
          />
          <button
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            className="auth-password-toggle"
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20">
              {passwordVisible ? (
                <>
                  <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
                  <circle cx="10" cy="10" r="2" />
                </>
              ) : (
                <>
                  <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
                  <circle cx="10" cy="10" r="2" />
                  <path d="m4 4 12 12" />
                </>
              )}
            </svg>
          </button>
        </span>
      </label>

      <button className="auth-submit" disabled={pending} type="submit">
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in to Portal"}
        <svg aria-hidden="true" viewBox="0 0 20 20">
          <path d="M3 10h13m-5-5 5 5-5 5" />
        </svg>
      </button>
      <p
        aria-live="polite"
        className={notice ? "auth-message auth-message--notice" : "auth-message"}
        role="status"
      >
        {notice || error}
      </p>
    </form>
  );
}
