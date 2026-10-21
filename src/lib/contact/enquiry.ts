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

/** The six practice areas, used wherever someone ticks areas of law. */
export const PRACTICE_AREAS = [
  "Commercial contracts",
  "Corporate",
  "Employment",
  "Intellectual Property",
  "Mergers and Acquisitions",
  "Data Protection and GDPR",
] as const;

export interface FollowUpQuestion {
  id: string;
  label: string;
  /** text: a short free-text answer (options unused). */
  type: "select" | "checkboxes" | "text";
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
        options: ["No", "Yes, we'd like extra support for them", "Not sure"],
      },
      {
        id: "support_level",
        label: "How much support do you think you need?",
        type: "select",
        width: "half",
        options: ["A few hours a month", "Regular, ongoing support", "Not sure yet"],
      },
      {
        id: "areas",
        label: "Which areas do you need help with most?",
        type: "checkboxes",
        options: PRACTICE_AREAS,
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
        options: ["Essential", "Growth", "Managed", "Not sure, please advise"],
      },
      {
        id: "current_owner",
        label: "Who looks after data protection today?",
        type: "select",
        width: "half",
        options: ["Nobody specifically", "Someone internally, alongside their main role", "An external provider", "Not sure"],
      },
      {
        id: "urgent",
        label: "Is there anything urgent?",
        type: "select",
        options: [
          "No, we want to get things in order",
          "A customer or investor is asking for evidence of compliance",
          "We've had a data breach or complaint",
          "We've received a subject access request",
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
        options: ["1 to 10", "11 to 25", "26 to 50", "More than 50"],
      },
      {
        id: "delivery",
        label: "How would you like it delivered?",
        type: "select",
        width: "half",
        options: ["Virtually", "In person at our offices", "Not sure yet"],
      },
      {
        id: "looking_for",
        label: "What are you looking for?",
        type: "select",
        options: ["A one-off session", "An annual programme", "Training as part of a vDPO subscription", "Not sure yet"],
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
          "Commercial lease",
          "Shareholders' agreement",
          "Buying, selling or investing",
          "Terms and contracts",
          "Settlement agreement",
          "Dispute or debt recovery",
          "Data breach response",
          "Something else",
        ],
      },
      {
        id: "deadline",
        label: "When do you need help by?",
        type: "select",
        width: "half",
        options: ["As soon as possible", "Within the next month", "No fixed deadline"],
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

/**
 * The marketing tick-box wording, exactly as shown. Stored with the
 * submission when ticked, so there's a record of what was agreed to.
 */
export const MARKETING_OPT_IN_WORDING =
  "I'd like to receive occasional news and insights from Iconos by email. You can unsubscribe at any time.";

export const EMPLOYEE_OPTIONS = ["1 to 10", "11 to 50", "51 to 250", "More than 250"] as const;

export const HEARD_ABOUT_OPTIONS = [
  "LinkedIn",
  "Recommendation or referral",
  "Search engine",
  "Event",
  "Our newsletter",
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

export type Answers = Record<string, string | string[]>;

/** Follow-up answers as accepted from the browser, keyed by question id. */
export const answersSchema = z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({});

/**
 * Hidden "website" field that people never see or fill in. Bots that fill
 * every field do; the server then quietly drops the submission.
 */
export const honeypotSchema = z.string().max(500).default("");

/**
 * Checks answers against their questions: no answers to questions that
 * weren't asked, choices only from the listed options, one choice for a
 * single-choice question, and short free text.
 */
export function checkAnswers(questions: readonly FollowUpQuestion[], answers: Answers, ctx: z.RefinementCtx): void {
  const known = new Set(questions.map((q) => q.id));
  for (const key of Object.keys(answers)) {
    if (!known.has(key)) ctx.addIssue({ code: "custom", path: ["answers", key], message: "Unexpected answer" });
  }
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined || answer === "") continue;
    if (q.type === "text") {
      if (typeof answer !== "string" || answer.length > 500) {
        ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Please keep this under 500 characters" });
      }
      continue;
    }
    if (q.type === "select" && Array.isArray(answer)) {
      ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Please choose one option" });
      continue;
    }
    const values = Array.isArray(answer) ? answer : [answer];
    if (!values.every((v) => q.options.includes(v))) {
      ctx.addIssue({ code: "custom", path: ["answers", q.id], message: "Please choose from the options" });
    }
  }
}

/** Answered questions as readable pairs, in question order, skipping blanks. */
export function describeQuestionAnswers(questions: readonly FollowUpQuestion[], answers: Answers): EnquiryDetail[] {
  const details: EnquiryDetail[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    const text = (Array.isArray(answer) ? answer.join(", ") : (answer ?? "")).trim();
    if (text) details.push({ question: q.label, answer: text });
  }
  return details;
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
    answers: answersSchema,
    message: z.string().trim().min(1, "Please tell us a little about what you need").max(5000),
    heardAbout: optionalChoice(HEARD_ABOUT_OPTIONS),
    privacyAgreed: z.literal(true, { message: "Please confirm you agree, so we can respond" }),
    marketingOptIn: z.boolean().default(false),
    turnstileToken: z.string().min(1, "Please complete the verification challenge"),
    website: honeypotSchema,
  })
  .superRefine((data, ctx) => {
    const service = getService(data.service);
    if (service) checkAnswers(service.questions, data.answers, ctx);
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
  return service ? describeQuestionAnswers(service.questions, values.answers) : [];
}
