import { z } from "zod";

/**
 * Work With Us form (/work-with-us/get-in-touch): consultant lawyers,
 * referral partners and anything else. Stored in contact_submissions
 * alongside client enquiries, distinguished by enquiry_type.
 *
 * The interest can be pre-selected from a link: ?interest=referral.
 */

export const INTEREST_KEYS = ["consultant", "referral", "other"] as const;
export type InterestKey = (typeof INTEREST_KEYS)[number];

export interface InterestOption {
  key: InterestKey;
  /** Stored in contact_submissions.enquiry_type. */
  enquiryType: string;
  title: string;
  description: string;
}

export const INTERESTS: readonly InterestOption[] = [
  {
    key: "consultant",
    enquiryType: "Consultant Lawyer",
    title: "Consultant lawyer",
    description: "Join our network of experienced, qualified lawyers.",
  },
  {
    key: "referral",
    enquiryType: "Referral Partner",
    title: "Referral partner",
    description: "Introduce your clients to practical, commercial legal support.",
  },
  {
    key: "other",
    enquiryType: "Work With Us (Other)",
    title: "Something else",
    description: "Tell us what you have in mind.",
  },
];

export const WORK_WITH_US_ENQUIRY_TYPES = INTERESTS.map((i) => i.enquiryType);

export function getInterest(key: string | null | undefined): InterestOption | undefined {
  return INTERESTS.find((i) => i.key === key);
}

/** Reads ?interest= from a link; unknown or missing values mean nothing pre-selected. */
export function parseInterestParam(value: string | string[] | undefined): InterestKey | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return getInterest(raw?.trim().toLowerCase())?.key ?? null;
}

/** Blank, or a LinkedIn profile/company address over https. */
export function isLinkedInUrl(value: string): boolean {
  if (value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)linkedin\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export const workWithUsFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z.string().trim().max(40).default(""),
  company: z.string().trim().max(200).default(""),
  linkedin: z
    .string()
    .trim()
    .max(300)
    .default("")
    .refine(isLinkedInUrl, "Enter a LinkedIn address, e.g. https://www.linkedin.com/in/your-name"),
  interest: z.enum(INTEREST_KEYS, { message: "Please choose how you'd like to work with us" }),
  message: z
    .string()
    .trim()
    .min(1, "Please tell us a little about your experience and how you'd like to work with us")
    .max(5000),
  privacyAgreed: z.literal(true, { message: "Please confirm you agree, so we can respond" }),
  turnstileToken: z.string().min(1, "Please complete the verification challenge"),
});

export type WorkWithUsFormInput = z.input<typeof workWithUsFormSchema>;
export type WorkWithUsFormValues = z.output<typeof workWithUsFormSchema>;
