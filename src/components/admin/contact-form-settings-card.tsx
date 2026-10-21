"use client";
 
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSettingsSchema,
  type ContactFormSettings,
} from "@/lib/settings/contact-form";
import { updateContactFormSettings } from "@/app/admin/(protected)/settings/actions";
 
const inputClass =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-accent focus:outline-none";
 
function ccEmailsToText(emails: string[]): string {
  return emails.join("\n");
}
 
function textToCcEmails(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((e) => e.trim())
    .filter(Boolean);
}
 
export function ContactFormSettingsCard({
  initialSettings,
  lastUpdatedAt,
}: {
  initialSettings: ContactFormSettings;
  lastUpdatedAt: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(lastUpdatedAt);
  const [ccText, setCcText] = useState(ccEmailsToText(initialSettings.cc_emails));
 
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormSettings>({
    resolver: zodResolver(contactFormSettingsSchema),
    defaultValues: initialSettings,
  });
 
  const sendAutoreply = watch("send_autoreply");
 
  function onSubmit(values: ContactFormSettings) {
    setStatus("idle");
    startTransition(async () => {
      const result = await updateContactFormSettings(values);
      if (result.ok) {
        setStatus("success");
        setSavedAt(new Date().toISOString());
      } else {
        setStatus("error");
        setServerErrors(result.errors ?? ["Something went wrong. Please try again."]);
      }
    });
  }
 
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Contact form</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Where public enquiries are delivered, the automatic confirmation reply sent to the
            enquirer, and the text around the form on the Contact page.
          </p>
        </div>
        {savedAt && (
          <p className="whitespace-nowrap text-xs text-neutral-400">
            Last saved {new Date(savedAt).toLocaleString("en-GB")}
          </p>
        )}
      </div>
 
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="recipient_email"
            className="mb-1 block text-sm font-medium text-brand-dark"
          >
            Recipient email
          </label>
          <input
            id="recipient_email"
            type="email"
            className={inputClass}
            {...register("recipient_email")}
          />
          {errors.recipient_email && (
            <p className="mt-1 text-xs text-red-600">{errors.recipient_email.message}</p>
          )}
        </div>
 
        <div>
          <label htmlFor="cc_emails" className="mb-1 block text-sm font-medium text-brand-dark">
            CC (optional)
          </label>
          <textarea
            id="cc_emails"
            rows={2}
            placeholder="One email per line, or comma-separated"
            className={inputClass}
            value={ccText}
            onChange={(e) => {
              setCcText(e.target.value);
              setValue("cc_emails", textToCcEmails(e.target.value), { shouldValidate: true });
            }}
          />
          {errors.cc_emails && (
            <p className="mt-1 text-xs text-red-600">{errors.cc_emails.message}</p>
          )}
        </div>
 
        <div>
          <label
            htmlFor="sender_display_name"
            className="mb-1 block text-sm font-medium text-brand-dark"
          >
            Sender display name
          </label>
          <input
            id="sender_display_name"
            className={inputClass}
            {...register("sender_display_name")}
          />
          <p className="mt-1 text-xs text-neutral-400">
            Shown as the &ldquo;from&rdquo; name on emails sent from enquiries@iconos-group.com.
          </p>
          {errors.sender_display_name && (
            <p className="mt-1 text-xs text-red-600">{errors.sender_display_name.message}</p>
          )}
        </div>
 
        <div className="flex items-center gap-3 border-t border-black/5 pt-5">
          <input
            id="send_autoreply"
            type="checkbox"
            className="h-4 w-4 rounded border-neutral-300"
            {...register("send_autoreply")}
          />
          <label htmlFor="send_autoreply" className="text-sm font-medium text-brand-dark">
            Send an automatic confirmation reply to the enquirer
          </label>
        </div>
 
        {sendAutoreply && (
          <div className="space-y-4 rounded-xl bg-brand-cream/40 p-4">
            <div>
              <label
                htmlFor="autoreply_subject"
                className="mb-1 block text-sm font-medium text-brand-dark"
              >
                Auto-reply subject
              </label>
              <input
                id="autoreply_subject"
                className={inputClass}
                {...register("autoreply_subject")}
              />
              {errors.autoreply_subject && (
                <p className="mt-1 text-xs text-red-600">{errors.autoreply_subject.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="autoreply_message"
                className="mb-1 block text-sm font-medium text-brand-dark"
              >
                Auto-reply message
              </label>
              <textarea
                id="autoreply_message"
                rows={4}
                className={inputClass}
                {...register("autoreply_message")}
              />
              {errors.autoreply_message && (
                <p className="mt-1 text-xs text-red-600">{errors.autoreply_message.message}</p>
              )}
            </div>
          </div>
        )}
 
        <div className="space-y-4 border-t border-black/5 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-brand-dark">Contact page</h3>
            <p className="mt-0.5 text-xs text-neutral-400">The text around the form on /contact.</p>
          </div>
          <div>
            <label htmlFor="page_intro" className="mb-1 block text-sm font-medium text-brand-dark">
              Intro under the heading
            </label>
            <textarea id="page_intro" rows={2} className={inputClass} {...register("page_intro")} />
            {errors.page_intro && <p className="mt-1 text-xs text-red-600">{errors.page_intro.message}</p>}
          </div>
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-medium text-brand-dark">&ldquo;What happens next&rdquo; steps</legend>
            {[0, 1, 2].map((i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[2rem_1fr_2fr] sm:items-start">
                <span className="pt-2.5 text-sm font-semibold text-neutral-400">{i + 1}.</span>
                <div>
                  <input
                    aria-label={`Step ${i + 1} title`}
                    placeholder="Title"
                    className={inputClass}
                    {...register(`next_steps.${i}.title` as const)}
                  />
                  {errors.next_steps?.[i]?.title && (
                    <p className="mt-1 text-xs text-red-600">{errors.next_steps[i]?.title?.message}</p>
                  )}
                </div>
                <div>
                  <input
                    aria-label={`Step ${i + 1} text`}
                    placeholder="Text"
                    className={inputClass}
                    {...register(`next_steps.${i}.body` as const)}
                  />
                  {errors.next_steps?.[i]?.body && (
                    <p className="mt-1 text-xs text-red-600">{errors.next_steps[i]?.body?.message}</p>
                  )}
                </div>
              </div>
            ))}
          </fieldset>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="direct_email" className="mb-1 block text-sm font-medium text-brand-dark">
                Direct email
              </label>
              <input id="direct_email" type="email" className={inputClass} {...register("direct_email")} />
              {errors.direct_email && <p className="mt-1 text-xs text-red-600">{errors.direct_email.message}</p>}
            </div>
            <div>
              <label htmlFor="direct_phone" className="mb-1 block text-sm font-medium text-brand-dark">
                Direct phone <span className="font-normal text-neutral-400">(blank to hide)</span>
              </label>
              <input id="direct_phone" type="tel" className={inputClass} {...register("direct_phone")} />
              {errors.direct_phone && <p className="mt-1 text-xs text-red-600">{errors.direct_phone.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-black/5 pt-5">
          <div>
            <h3 className="text-sm font-semibold text-brand-dark">Work With Us form</h3>
            <p className="mt-0.5 text-xs text-neutral-400">
              The text around the form on /work-with-us/get-in-touch. Enquiries go to the same recipients.
            </p>
          </div>
          <div>
            <label htmlFor="wwu_page_title" className="mb-1 block text-sm font-medium text-brand-dark">
              Heading
            </label>
            <input id="wwu_page_title" className={inputClass} {...register("wwu_page_title")} />
            {errors.wwu_page_title && <p className="mt-1 text-xs text-red-600">{errors.wwu_page_title.message}</p>}
          </div>
          <div>
            <label htmlFor="wwu_page_intro" className="mb-1 block text-sm font-medium text-brand-dark">
              Intro under the heading
            </label>
            <textarea id="wwu_page_intro" rows={2} className={inputClass} {...register("wwu_page_intro")} />
            {errors.wwu_page_intro && <p className="mt-1 text-xs text-red-600">{errors.wwu_page_intro.message}</p>}
          </div>
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-medium text-brand-dark">&ldquo;What happens next&rdquo; steps</legend>
            {[0, 1].map((i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[2rem_1fr_2fr] sm:items-start">
                <span className="pt-2.5 text-sm font-semibold text-neutral-400">{i + 1}.</span>
                <input
                  aria-label={`Work With Us step ${i + 1} title`}
                  placeholder="Title"
                  className={inputClass}
                  {...register(`wwu_next_steps.${i}.title` as const)}
                />
                <input
                  aria-label={`Work With Us step ${i + 1} text`}
                  placeholder="Text"
                  className={inputClass}
                  {...register(`wwu_next_steps.${i}.body` as const)}
                />
              </div>
            ))}
            {errors.wwu_next_steps && (
              <p className="text-xs text-red-600">Each step needs a title (up to 80 characters).</p>
            )}
          </fieldset>
          <div>
            <label htmlFor="wwu_help_text" className="mb-1 block text-sm font-medium text-brand-dark">
              &ldquo;Looking for legal support?&rdquo; text{" "}
              <span className="font-normal text-neutral-400">(links to the enquiry form)</span>
            </label>
            <textarea id="wwu_help_text" rows={2} className={inputClass} {...register("wwu_help_text")} />
          </div>
        </div>

        {status === "error" && serverErrors.length > 0 && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverErrors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
 
        {status === "success" && (
          <p role="status" className="text-sm font-medium text-emerald-700">
            Settings saved.
          </p>
        )}
 
        <button
          type="submit"
          disabled={isPending}
          className="rounded-brand bg-brand-dark px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}