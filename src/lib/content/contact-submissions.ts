import type { EnquiryDetail } from "@/lib/contact/enquiry";

export type EnquiryType =
  | "Managed Legal Services"
  | "Virtual Data Protection Officer"
  | "Data Protection Training"
  | "Ad Hoc Work"
  | "Not Sure Yet"
  | "Consultant Lawyer"
  | "Referral Partner"
  | "Work With Us (Other)"
  | "General Enquiry";
 
export interface ContactSubmission {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  job_title: string;
  linkedin_url: string;
  company_size: string;
  sector: string;
  enquiry_type: EnquiryType;
  service_details: EnquiryDetail[];
  message: string;
  heard_about: string;
  privacy_agreed: boolean;
  marketing_opt_in: boolean;
  turnstile_verified: boolean;
  email_sent: boolean;
  read_at: string | null;
  created_at: string;
}