"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitContactForm } from "@/app/(site)/contact/actions";
import {
  EMPLOYEE_OPTIONS,
  HEARD_ABOUT_OPTIONS,
  SERVICES,
  enquiryFormSchema,
  getService,
  type EnquiryFormInput,
  type FollowUpQuestion,
  type ServiceKey,
} from "@/lib/contact/enquiry";
import { TurnstileWidget } from "./turnstile-widget";
import {
  ChoiceCard,
  FieldError,
  Required,
  SelectChevron,
  fieldClass,
  invalidProps as invalid,
  labelClass,
  stepHeadingClass,
} from "./form-fields";

type Answers = Record<string, string | string[]>;

export function ContactForm({
  nonce,
  initialService,
  privacyHref = "/legal/privacy-policy",
  directEmail,
}: {
  nonce?: string;
  initialService: ServiceKey | null;
  privacyHref?: string;
  directEmail: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EnquiryFormInput>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      service: initialService ?? undefined,
      answers: {},
      privacyAgreed: false as unknown as true,
      marketingOptIn: false,
      turnstileToken: "",
    },
  });

  const selectedKey = watch("service") as ServiceKey | undefined;
  const selected = getService(selectedKey);

  // Keep the address in step with the choice, so the page can be shared or
  // refreshed without losing it (no navigation, no history entry).
  useEffect(() => {
    if (!selectedKey) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("service") === selectedKey) return;
    url.searchParams.set("service", selectedKey);
    window.history.replaceState(window.history.state, "", url);
  }, [selectedKey]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function chooseService(key: ServiceKey) {
    if (key === selectedKey) return;
    // Answers belong to one service; the server rejects any others.
    setAnswers({});
    setValue("answers", {});
    setValue("service", key, { shouldValidate: Boolean(errors.service) });
  }

  function setAnswer(questionId: string, value: string | string[]) {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    setValue("answers", next);
  }

  // The server re-validates everything with the same schema.
  function onSubmit(values: EnquiryFormInput) {
    setStatus("idle");
    setServerErrors([]);
    startTransition(async () => {
      const result = await submitContactForm(values);
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
        <p className="text-h3 font-semibold text-brand-dark">Thanks — your enquiry has been sent.</p>
        <p className="mt-3 text-body text-brand-dark/75">
          We&apos;ve emailed you a copy, and we&apos;ll be in touch soon.
        </p>
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
              Work email
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
          <label htmlFor="jobTitle" className={labelClass}>
            Job title
          </label>
          <input
            id="jobTitle"
            autoComplete="organization-title"
            placeholder="e.g. Managing Director, CFO, Head of Legal"
            className={fieldClass}
            {...register("jobTitle")}
          />
        </div>
      </fieldset>

      {/* 2. About your business */}
      <fieldset className="space-y-5">
        <legend className={`${stepHeadingClass} mb-5`}>2. About your business</legend>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className={labelClass}>
              Company name
              <Required />
            </label>
            <input
              id="company"
              autoComplete="organization"
              className={fieldClass}
              aria-describedby={errors.company ? "company-error" : undefined}
              {...invalid(Boolean(errors.company))}
              {...register("company")}
            />
            <FieldError id="company-error" message={errors.company?.message} />
          </div>
          <div>
            <label htmlFor="employees" className={labelClass}>
              Number of employees
            </label>
            <div className="relative">
              <select id="employees" className={`${fieldClass} appearance-none pr-10`} {...register("employees")}>
                <option value="">Please select</option>
                {EMPLOYEE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="sector" className={labelClass}>
            Sector
          </label>
          <input
            id="sector"
            placeholder="e.g. Software, professional services, property"
            className={fieldClass}
            {...register("sector")}
          />
        </div>
      </fieldset>

      {/* 3. How can we help? */}
      <fieldset aria-describedby={errors.service ? "service-error" : "service-hint"}>
        <legend className={stepHeadingClass}>
          3. How can we help?
          <Required />
        </legend>
        <p id="service-hint" className="mt-2 text-sm text-brand-dark/70">
          Choose the option that fits best. Not sure? That&apos;s fine, we&apos;ll help you work it out.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SERVICES.map((s, i) => (
            <ChoiceCard
              key={s.key}
              name="service"
              value={s.key}
              checked={selectedKey === s.key}
              onSelect={() => chooseService(s.key)}
              eyebrow={s.eyebrow}
              title={s.title}
              description={s.description}
              wide={i === SERVICES.length - 1}
            />
          ))}
        </div>
        <FieldError id="service-error" message={errors.service?.message} />

        {selected && selected.questions.length > 0 && (
          <div className="mt-6 rounded-2xl bg-brand-cream p-5 sm:p-7">
            <p className="text-base font-semibold text-brand-dark">{selected.questionsHeading}</p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {selected.questions.map((q) => (
                <FollowUp key={`${selected.key}-${q.id}`} question={q} value={answers[q.id]} onChange={setAnswer} />
              ))}
            </div>
          </div>
        )}
      </fieldset>

      {/* 4. Anything else? */}
      <fieldset className="space-y-6">
        <legend className={`${stepHeadingClass} mb-5`}>4. Anything else?</legend>
        <div>
          <label htmlFor="message" className={labelClass}>
            Tell us a little about what you need
            <Required />
          </label>
          <textarea
            id="message"
            rows={6}
            className={fieldClass}
            aria-describedby={errors.message ? "message-error message-hint" : "message-hint"}
            {...invalid(Boolean(errors.message))}
            {...register("message")}
          />
          <p id="message-hint" className="mt-1.5 text-xs text-brand-dark/60">
            A short overview is perfect. Please don&apos;t include confidential details at this stage, we&apos;ll ask
            for these once we&apos;ve spoken.
          </p>
          <FieldError id="message-error" message={errors.message?.message} />
        </div>
        <div>
          <label htmlFor="heardAbout" className={labelClass}>
            How did you hear about us?
          </label>
          <div className="relative">
            <select id="heardAbout" className={`${fieldClass} appearance-none pr-10`} {...register("heardAbout")}>
              <option value="">Please select</option>
              {HEARD_ABOUT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <SelectChevron />
          </div>
        </div>

        <div className="space-y-3">
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
          <label className="flex items-start gap-3 text-sm text-brand-dark">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-neutral-400"
              {...register("marketingOptIn")}
            />
            <span>I&apos;d like to receive occasional news and insights from Iconos by email. You can unsubscribe at any time.</span>
          </label>
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
            className="rounded-brand bg-brand-dark px-8 py-3.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send enquiry"}
          </button>
          <span className="text-xs text-brand-dark/60">* Required</span>
        </div>
      </div>
    </form>
  );
}

function FollowUp({
  question,
  value,
  onChange,
}: {
  question: FollowUpQuestion;
  value: string | string[] | undefined;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const id = `q-${question.id}`;
  const span = question.width === "half" ? "" : "sm:col-span-2";

  if (question.type === "checkboxes") {
    const checked = Array.isArray(value) ? value : [];
    return (
      <fieldset className={span}>
        <legend className={labelClass}>
          {question.label} <span className="font-normal text-brand-dark/60">(tick any)</span>
        </legend>
        <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-3">
          {question.options.map((option) => (
            <label key={option} className="flex items-center gap-2.5 text-sm text-brand-dark">
              <input
                type="checkbox"
                className="h-4 w-4 flex-shrink-0 rounded border-neutral-400"
                checked={checked.includes(option)}
                onChange={(e) =>
                  onChange(
                    question.id,
                    e.target.checked ? [...checked, option] : checked.filter((c) => c !== option)
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={span}>
      <label htmlFor={id} className={labelClass}>
        {question.label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`${fieldClass} appearance-none border-transparent pr-10`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(question.id, e.target.value)}
        >
          <option value="">Please select</option>
          {question.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}
