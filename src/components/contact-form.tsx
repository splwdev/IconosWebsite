"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  submitContactForm,
  type ContactFormValues,
} from "@/app/(site)/contact/actions";
import { TurnstileWidget } from "./turnstile-widget";

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm placeholder:text-neutral-400 focus:border-brand-accent focus:outline-none";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { turnstileToken: "" },
  });

  function onSubmit(values: ContactFormValues) {
    setStatus("idle");
    startTransition(async () => {
      const result = await submitContactForm(values);
      if (result.ok) {
        setStatus("success");
        reset();
        setTurnstileToken("");
      } else {
        setStatus("error");
        setServerErrors(result.errors ?? []);
      }
    });
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl bg-emerald-50 p-8 text-center text-emerald-800"
      >
        <p className="font-semibold">Thanks — your enquiry has been sent.</p>
        <p className="mt-1 text-sm">We&apos;ll come back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">
            Name
          </label>
          <input id="name" placeholder="Name" className={inputClass} {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="company" className="sr-only">
            Company name
          </label>
          <input
            id="company"
            placeholder="Company name"
            className={inputClass}
            {...register("company")}
          />
          {errors.company && (
            <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            className={inputClass}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="sr-only">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Phone number"
            className={inputClass}
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="enquiryType" className="sr-only">
          What are you enquiring about?
        </label>
        <select id="enquiryType" className={inputClass} {...register("enquiryType")}>
          <option value="">What are you enquiring about?</option>
          <option value="Managed Legal Services">Managed Legal Services</option>
          <option value="Virtual Data Protection Officer">
            Virtual Data Protection Officer
          </option>
          <option value="Ad Hoc Work">Ad Hoc Work</option>
          <option value="General Enquiry">General Enquiry</option>
        </select>
        {errors.enquiryType && (
          <p className="mt-1 text-xs text-red-600">Please select an option</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          rows={4}
          placeholder="Message / brief details"
          className={inputClass}
          {...register("message")}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
      </div>

      <TurnstileWidget
        onVerify={(token) => {
          setTurnstileToken(token);
          setValue("turnstileToken", token);
        }}
        onExpire={() => {
          setTurnstileToken("");
          setValue("turnstileToken", "");
        }}
      />
      {errors.turnstileToken && (
        <p className="text-xs text-red-600">{errors.turnstileToken.message}</p>
      )}

      {status === "error" && serverErrors.length > 0 && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverErrors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !turnstileToken}
        className="w-full rounded-brand bg-brand-dark px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
