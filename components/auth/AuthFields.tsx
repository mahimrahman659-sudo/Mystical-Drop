"use client";

import { useId, useState, type ReactNode } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from "@/components/ui/icons";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  hint,
  required = false,
}: FieldProps) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}{" "}
        {required ? <span className="text-primary">*</span> : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className="field-input"
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1 text-label-sm text-on-surface-variant">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function AuthPasswordField({
  id: idProp,
  label,
  value,
  onChange,
  autoComplete,
  error,
  hint,
  required = false,
}: Omit<FieldProps, "type" | "id" | "placeholder"> & { id?: string }) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}{" "}
        {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className="field-input pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1 text-label-sm text-on-surface-variant">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function FormMessage({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-error/25 bg-error-container text-on-error-container"
      : tone === "success"
        ? "border-secondary/25 bg-secondary-container text-on-secondary-container"
        : "border-outline-variant/40 bg-surface-container-low text-on-surface-variant";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`rounded border px-3.5 py-3 text-body-sm leading-relaxed ${styles}`}
    >
      {children}
    </div>
  );
}

export function GoogleAuthButton({
  enabled,
  pending,
  onClick,
}: {
  enabled: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  const noteId = "google-auth-note";
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled || pending}
        aria-describedby={!enabled ? noteId : undefined}
        className="btn btn-outline w-full bg-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-55"
      >
        <GoogleIcon size={18} />
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {!enabled ? (
        <p id={noteId} className="mt-1.5 text-label-sm leading-4 text-on-surface-variant">
          Google sign-in is not configured on this server. Email and password
          sign-in remains available.
        </p>
      ) : null}
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-outline-variant/45" />
      <span className="text-label-sm uppercase tracking-widest text-on-surface-variant">
        or
      </span>
      <span className="h-px flex-1 bg-outline-variant/45" />
    </div>
  );
}

export function SubmitButton({
  pending,
  disabled = false,
  children,
  pendingLabel,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="btn btn-primary w-full py-3.5 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
