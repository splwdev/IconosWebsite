export type EnquiryType =
  | "Managed Legal Services"
  | "Virtual Data Protection Officer"
  | "Ad Hoc Work"
  | "General Enquiry";
 
export interface ContactSubmission {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  enquiry_type: EnquiryType;
  message: string;
  turnstile_verified: boolean;
  email_sent: boolean;
  read_at: string | null;
  created_at: string;
}