import { z } from "zod";

/**
 * Contact form configuration, shared by the form (what to show) and the
 * server action (what to accept). Every answer is checked against these
 * lists server-side, so nothing but the listed options can be stored.
 *
 * Services can be pre-selected from a link: /contact?service=vdpo.
 */

export const SERVICE_KEYS = ["mls", "vdpo", "training", "adhoc", "not-sure"] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];

export interface FollowUpQuestion {
  id: string;
  label: string;
  type: "select" | "checkboxes";
  options: readonly string[];
  /** Grid width on desktop: "half" sits beside the next half-width question. */
  width?: "half" | "full";
}

export interface ServiceOption {
  key: ServiceKey;
  /** Stored in contact_submissions.enquiry_type and shown in admin and emails. */
  enquiryType: string;
  eyebrow: string;
  title: string;
  description: string;
  /** Heading for the follow-up panel; omitted when there are no questions. */
  questionsHeading?: string;
  questions: readonly FollowUpQuestion[];
}

export const SERVICES: readonly ServiceOption[] = [
  {
    key: "mls",
    enquiryType: "Managed Legal Services",
    eyebrow: "Subscription",
    title: "Managed Legal Services",
    description: "Your outsourced, embedded commercial legal team.",
    questionsHeading: "A couple of quick questions about Managed Legal Services",
    questions: [
      {
        id: "in_house_team",
        label: "Do you have an in-house legal team?",
        type: "select",
        width: "half",
        options: ["No", "Yes, one person", "Yes, a small team"],
      },
      {
        id: "support_level",
        label: "How much support do you think you need?",
        type: "select",
        width: "half",
        options: ["A few hours a month", "Around a day a week", "More than a day a week", "Not sure yet"],
      },
      {
        id: "areas",
        label: "Which areas do you need help with most?",
        type: "checkboxes",
        options: [
          "Commercial contracts",
          "Corporate",
          "Employment",
          "Intellectual Property",
          "Mergers and Acquisitions",
          "Data Protection and GDPR",
        ],
      },
    ],
  },
  {
    key: "vdpo",
    enquiryType: "Virtual Data Protection Officer",
    eyebrow: "Subscription",
    title: "Virtual DPO",
    description: "Practical data protection that supports growth.",
    questionsHeading: "A couple of quick questions about Virtual DPO",
    questions: [
      {
        id: "tier",
        label: "Which tier interests you?",
        type: "select",
        width: "half",
        options: ["Essential", "Growth", "Managed", "Not sure yet"],
      },
      {
        id: "current_owner",
        label: "Who looks after data protection today?",
        type: "select",
        width: "half",
        options: [
          "Nobody in particular",
          "Someone internally, alongside their main role",
          "A dedicated person or team",
          "An external provider",
        ],
      },
      {
        id: "urgent",
        label: "Is there anything urgent?",
        type: "select",
        options: [
          "No, nothing urgent",
          "A data breach or incident",
          "A subject access request",
          "A query from the ICO or a regulator",
          "A customer or contract deadline",
        ],
      },
    ],
  },
  {
    key: "training",
    enquiryType: "Data Protection Training",
    eyebrow: "No subscription needed",
    title: "Data protection training",
    description: "Training for your team, delivered virtually or in person.",
    questionsHeading: "A couple of quick questions about data protection training",
    questions: [
      {
        id: "attendees",
        label: "Roughly how many people need training?",
        type: "select",
        width: "half",
        options: ["1–10", "11–50", "51–150", "More than 150"],
      },
      {
        id: "delivery",
        label: "How would you like it delivered?",
        type: "select",
        width: "half",
        options: ["Virtually", "In person", "Either / not sure"],
      },
      {
        id: "looking_for",
        label: "What are you looking for?",
        type: "select",
        options: [
          "General data protection awareness",
          "Training for specific teams (e.g. HR, sales, marketing)",
          "A board or leadership briefing",
          "Not sure yet",
        ],
      },
    ],
  },
  {
    key: "adhoc",
    enquiryType: "Ad Hoc Work",
    eyebrow: "One-off",
    title: "Help with a specific matter",
    description: "Ad hoc support, usually at an agreed fixed fee.",
    questionsHeading: "A couple of quick questions about your matter",
    questions: [
      {
        id: "matter_type",
        label: "What type of matter is it?",
        type: "select",
        width: "half",
        options: [
          "Contract or terms and conditions",
          "Corporate or shareholder matter",
          "Commercial lease",
          "Buying, selling or investing",
          "Employment",
          "Intellectual Property",
          "Data protection",
          "Dispute or debt recovery",
          "Something else",
        ],
      },
      {
        id: "deadline",
        label: "When do you need help by?",
        type: "select",
        width: "half",
        options: ["As soon as possible", "Within two weeks", "Within a month", "No fixed deadline"],
      },
    ],
  },
  {
    key: "not-sure",
    enquiryType: "Not Sure Yet",
    eyebrow: "Not sure",
    title: "I'm not sure yet",
    description: "Tell us what's going on and we'll point you the right way.",
    questions: [],
  },
];

export const EMPLOYEE_OPTIONS = ["1–9", "10–49", "50–149", "150–249", "250 or more"] as const;

export const HEARD_ABOUT_OPTIONS = [
  "Search engine",
  "LinkedIn",
  "Recommendation or referral",
  "Event or talk",
  "Blog or article",
  "Other",
] as const;

/** Every enquiry_type the database accepts, newest form first, then legacy. */
export const ENQUIRY_TYPES = [...SERVICES.map((s) => s.enquiryType), "General Enquiry"] as const;

export function getService(key: string | null | undefined): ServiceOption | undefined {
  return SERVICES.find((s) => s.key === key);
}

const PROGRAM_SERVICES: Record<string, ServiceKey> = {
  "subscription-model": "mls",
  "virtual-data-protection-officer": "vdpo",
  "ad-hoc-work": "adhoc",
};

/** Contact link for a How We Work program page, with its service pre-selected. */
export function contactHrefForProgram(slug: string): string {
  const key = PROGRAM_SERVICES[slug];
  return key ? `/contact?service=${key}` : "/contact";
}

/** Reads ?service= from a link; unknown or missing values mean nothing pre-selected. */
export function parseServiceParam(value: string | string[] | undefined): ServiceKey | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return getService(raw?.trim().toLowerCase())?.key ?? null;
}

const optionalChoice = (options: readonly string[]) =>
  z
    .string()
    .default("")
    .refine((v) => v === "" || options.includes(v), "Please choose one of the options");

export const enquiryFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    email: z.string().trim().email("Enter a valid email address").max(254),
    phone: z.string().trim().max(40).default(""),
    jobTitle: z.string().trim().max(120).default(""),
    company: z.string().trim().min(1, "Company name is required").max(200),
    employees: optionalChoice(EMPLOYEE_OPTIONS),
    sector: z.string().trim().max(120).default(""),
    service: z.enum(SERVICE_KEYS, { message: "Please choose how we can help" }),
    /** Follow-up answers keyed by question id; only the chosen service's are kept. */
    answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({}),
    message: z.string().trim().min(1, "Please tell us a little about what you need").max(5000),
    heardAbout: optionalChoice(HEARD_ABOUT_OPTIONS),
    privacyAgreed: z.literal(true, { message: "Please confirm you agree, so we can respond" }),
    marketingOptIn: z.boolean().default(false),
    turnstileToken: z.string().min(1, "Please complete the verification challenge"),
  })
  .superRefine((data, ctx) => {
    const service = getService(data.service);
    if (!service) return;
    const known = new Set(service.questions.map((q) => q.id));
    for (const key of Object.keys(data.answers)) {
      if (!known.has(key)) {
        ctx.addIssue({ code: "custom", path: ["answers", key], message: "Unexpected answer" });
      }
    }
    for (const q of service.questions) {
      const answer = data.answers[q.id];
      if (answer === undefined || answer === "") continue;
      const values = Array.isArray(answer) ? answer : [answer];
      if (q.type === "select" && Array.isArray(answer)) {
        ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Please choose one option" });
      } else if (!values.every((v) => q.options.includes(v))) {
        ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Please choose from the options" });
      }
    }
  });

export type EnquiryFormInput = z.input<typeof enquiryFormSchema>;
export type EnquiryFormValues = z.output<typeof enquiryFormSchema>;

export interface EnquiryDetail {
  question: string;
  answer: string;
}

/**
 * The chosen service's follow-up answers as readable question/answer
 * pairs, in question order, skipping unanswered ones. This is what's
 * stored (service_details) and emailed.
 */
export function describeAnswers(values: Pick<EnquiryFormValues, "service" | "answers">): EnquiryDetail[] {
  const service = getService(values.service);
  if (!service) return [];
  const details: EnquiryDetail[] = [];
  for (const q of service.questions) {
    const answer = values.answers[q.id];
    const text = Array.isArray(answer) ? answer.join(", ") : (answer ?? "");
    if (text) details.push({ question: q.label, answer: text });
  }
  return details;
}
