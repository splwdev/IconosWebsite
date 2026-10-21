"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitWorkWithUsForm } from "@/app/(site)/work-with-us/get-in-touch/actions";
import {
  INTERESTS,
  workWithUsFormSchema,
  type InterestKey,
  type WorkWithUsFormInput,
} from "@/lib/contact/work-with-us";
import { TurnstileWidget } from "./turnstile-widget";
import {
  ChoiceCard,
  FieldError,
  Required,
  fieldClass,
  invalidProps as invalid,
  labelClass,
  stepHeadingClass,
} from "./form-fields";

export function WorkWithUsForm({
  nonce,
  initialInterest,
  directEmail,
  privacyHref = "/legal/privacy-policy",
}: {
  nonce?: string;
  initialInterest: InterestKey | null;
  directEmail: string;
  privacyHref?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WorkWithUsFormInput>({
    resolver: zodResolver(workWithUsFormSchema),
    defaultValues: {
      interest: initialInterest ?? undefined,
      privacyAgreed: false as unknown as true,
      turnstileToken: "",
    },
  });

  const interest = watch("interest") as InterestKey | undefined;

  useEffect(() => {
    if (!interest) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("interest") === interest) return;
    url.searchParams.set("interest", interest);
    window.history.replaceState(window.history.state, "", url);
  }, [interest]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  // The server re-validates everything with the same schema.
  function onSubmit(values: WorkWithUsFormInput) {
    setStatus("idle");
    setServerErrors([]);
    startTransition(async () => {
      const result = await submitWorkWithUsForm(values);
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setServerErrors(result.errors ?? ["Something went wrong. Please try again."]);
      }
    });
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl bg-brand-cream p-8 text-center outline-none sm:p-12"
      >
        <p className="text-h3 font-semibold text-brand-dark">Thanks — your message has been sent.</p>
        <p className="mt-3 text-body text-brand-dark/75">We&apos;ll read it and be in touch if there&apos;s a good fit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12">
      {/* 1. About you */}
      <fieldset className="space-y-5">
        <legend className={`${stepHeadingClass} mb-5`}>1. About you</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First name
              <Required />
            </label>
            <input
              id="firstName"
              autoComplete="given-name"
              className={fieldClass}
              aria-describedby={errors.firstName ? "firstName-error" : undefined}
              {...invalid(Boolean(errors.firstName))}
              {...register("firstName")}
            />
            <FieldError id="firstName-error" message={errors.firstName?.message} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last name
              <Required />
            </label>
            <input
              id="lastName"
              autoComplete="family-name"
              className={fieldClass}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              {...invalid(Boolean(errors.lastName))}
              {...register("lastName")}
            />
            <FieldError id="lastName-error" message={errors.lastName?.message} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
              <Required />
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClass}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...invalid(Boolean(errors.email))}
              {...register("email")}
            />
            <FieldError id="email-error" message={errors.email?.message} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input id="phone" type="tel" autoComplete="tel" className={fieldClass} {...register("phone")} />
          </div>
        </div>
        <div>
          <label htmlFor="company" className={labelClass}>
            Firm or company <span className="font-normal text-brand-dark/60">(if applicable)</span>
          </label>
          <input id="company" autoComplete="organization" className={fieldClass} {...register("company")} />
        </div>
        <div>
          <label htmlFor="linkedin" className={labelClass}>
            LinkedIn profile
          </label>
          <input
            id="linkedin"
            type="url"
            inputMode="url"
            placeholder="https://www.linkedin.com/in/..."
            className={fieldClass}
            aria-describedby={errors.linkedin ? "linkedin-error" : undefined}
            {...invalid(Boolean(errors.linkedin))}
            {...register("linkedin")}
          />
          <FieldError id="linkedin-error" message={errors.linkedin?.message} />
        </div>
      </fieldset>

      {/* 2. How would you like to work with us? */}
      <fieldset aria-describedby={errors.interest ? "interest-error" : undefined}>
        <legend className={stepHeadingClass}>
          2. How would you like to work with us?
          <Required />
        </legend>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INTERESTS.map((option, i) => (
            <ChoiceCard
              key={option.key}
              name="interest"
              value={option.key}
              checked={interest === option.key}
              onSelect={() => setValue("interest", option.key, { shouldValidate: Boolean(errors.interest) })}
              title={option.title}
              description={option.description}
              wide={i === INTERESTS.length - 1}
            />
          ))}
        </div>
        <FieldError id="interest-error" message={errors.interest?.message} />
      </fieldset>

      {/* 3. Tell us a little more */}
      <fieldset className="space-y-6">
        <legend className={`${stepHeadingClass} mb-5`}>3. Tell us a little more</legend>
        <div>
          <label htmlFor="message" className={labelClass}>
            Tell us about your experience and how you&apos;d like to work with Iconos
            <Required />
          </label>
          <textarea
            id="message"
            rows={6}
            className={fieldClass}
            aria-describedby={errors.message ? "message-error" : undefined}
            {...invalid(Boolean(errors.message))}
            {...register("message")}
          />
          <FieldError id="message-error" message={errors.message?.message} />
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm text-brand-dark">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-neutral-400"
              aria-describedby={errors.privacyAgreed ? "privacy-error" : undefined}
              {...invalid(Boolean(errors.privacyAgreed))}
              {...register("privacyAgreed")}
            />
            <span>
              I agree to Iconos Group using my details to respond to this enquiry, as explained in our{" "}
              <Link href={privacyHref} className="font-semibold underline underline-offset-2">
                Privacy Policy
              </Link>
              .<Required />
            </span>
          </label>
          <FieldError id="privacy-error" message={errors.privacyAgreed?.message} />
        </div>
      </fieldset>

      <div className="space-y-4">
        <TurnstileWidget
          nonce={nonce}
          onVerify={(token) => {
            setTurnstileToken(token);
            setValue("turnstileToken", token);
          }}
          onExpire={() => {
            setTurnstileToken("");
            setValue("turnstileToken", "");
          }}
        />
        <FieldError id="turnstile-error" message={errors.turnstileToken?.message} />

        {status === "error" && serverErrors.length > 0 && (
          <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverErrors.map((e) => (
              <p key={e}>{e}</p>
            ))}
            <p className="mt-1">
              You can also email us at{" "}
              <a href={`mailto:${directEmail}`} className="font-semibold underline">
                {directEmail}
              </a>
              .
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending || !turnstileToken}
            className="rounded-brand bg-brand-dark px-10 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send"}
          </button>
          <span className="text-xs text-brand-dark/60">* Required</span>
        </div>
      </div>
    </form>
  );
}
