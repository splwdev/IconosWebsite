import { z } from "zod";
 
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  enquiryType: z.enum([
    "Managed Legal Services",
    "Virtual Data Protection Officer",
    "Ad Hoc Work",
    "General Enquiry",
  ]),
  message: z.string().min(1, "Please add a short message"),
  turnstileToken: z.string().min(1, "Please complete the verification challenge"),
});
 
export type ContactFormValues = z.infer<typeof contactFormSchema>;