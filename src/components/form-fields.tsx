/** Shared styling and small pieces for the public enquiry forms. */

export const fieldClass =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-brand-dark placeholder:text-neutral-400 " +
  "focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-dark/15 aria-[invalid=true]:border-red-500";
export const labelClass = "mb-1.5 block text-sm font-medium text-brand-dark";
export const stepHeadingClass = "text-xs font-bold uppercase tracking-[0.14em] text-brand-dark";

/** Spread onto an input to mark it invalid for assistive tech and styling. */
export function invalidProps(hasError: boolean) {
  return hasError ? { "aria-invalid": true as const } : {};
}

export function Required() {
  return (
    <span aria-hidden="true" className="text-brand-dark">
      {" "}
      *
    </span>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600">
      {message}
    </p>
  );
}

export function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/60"
    >
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** Radio card used for "How can we help?" / "How would you like to work with us?". */
export function ChoiceCard({
  name,
  value,
  checked,
  onSelect,
  eyebrow,
  title,
  description,
  wide = false,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  eyebrow?: string;
  title: string;
  description: string;
  wide?: boolean;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col rounded-2xl border p-5 transition-colors focus-within:ring-2 focus-within:ring-brand-dark focus-within:ring-offset-2 ${
        wide ? "sm:col-span-2" : ""
      } ${
        checked
          ? "border-brand-dark bg-brand-dark text-white"
          : "border-neutral-300 bg-white text-brand-dark hover:border-brand-dark/50"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
      {eyebrow && (
        <span
          className={`mb-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] ${
            checked ? "text-white/70" : "text-brand-dark/60"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <span className="text-base font-semibold">{title}</span>
      <span className={`mt-1 text-sm ${checked ? "text-white/80" : "text-brand-dark/70"}`}>{description}</span>
    </label>
  );
}

/**
 * Spam trap: a field people never see (off-screen, skipped by keyboard and
 * screen readers). Bots that fill every field fill this one too.
 */
export function HoneypotField({ register }: { register: () => object }) {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...register()} />
      </label>
    </div>
  );
}
