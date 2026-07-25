/**
 * Sends contact-form notification emails via Microsoft Graph, using the
 * client-credentials (app-only) OAuth flow against a dedicated Azure AD app
 * registration — separate from the one used for staff SSO. See README for
 * setup, including the Exchange Online Application Access Policy that
 * restricts this app to only ever send as GRAPH_SENDER_MAILBOX, not any
 * mailbox in the tenant (the default scope for an app-only Mail.Send grant).
 */
 
interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
 
let cachedToken: CachedToken | null = null;
 
async function getGraphAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
 
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
 
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft Graph credentials are not configured");
  }
 
  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  );
 
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to acquire Graph token: ${response.status} ${body}`);
  }
 
  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}
 
export interface GraphMailInput {
  subject: string;
  text: string;
  toEmail: string;
  /** Optional CC list — omitted from the payload entirely if empty. */
  ccEmails?: string[];
  replyToEmail?: string;
  /**
   * Optional display name shown as the "from" name (e.g. "Iconos Group
   * Website"). The underlying address is always GRAPH_SENDER_MAILBOX —
   * Graph will reject any attempt to set a different address here when
   * using app-only auth, so only .name is actually variable.
   */
  fromDisplayName?: string;
}
 
/**
 * Sends via the mailbox in GRAPH_SENDER_MAILBOX. Returns false (rather than
 * throwing) on failure so the contact form can still succeed — the
 * submission is always stored in Supabase regardless of email outcome.
 */
export async function sendGraphMail(input: GraphMailInput): Promise<boolean> {
  const senderMailbox = process.env.GRAPH_SENDER_MAILBOX;
  if (!senderMailbox) {
    console.warn(
      "[graph-mail] GRAPH_SENDER_MAILBOX not set — email not sent. Submission is still stored in contact_submissions."
    );
    return false;
  }
 
  try {
    const token = await getGraphAccessToken();
 
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderMailbox)}/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: input.subject,
            body: { contentType: "Text", content: input.text },
            toRecipients: [{ emailAddress: { address: input.toEmail } }],
            ...(input.ccEmails && input.ccEmails.length > 0
              ? {
                  ccRecipients: input.ccEmails.map((address) => ({
                    emailAddress: { address },
                  })),
                }
              : {}),
            ...(input.replyToEmail
              ? { replyTo: [{ emailAddress: { address: input.replyToEmail } }] }
              : {}),
            ...(input.fromDisplayName
              ? {
                  from: {
                    emailAddress: { address: senderMailbox, name: input.fromDisplayName },
                  },
                }
              : {}),
          },
          saveToSentItems: true,
        }),
      }
    );
 
    if (!response.ok) {
      const body = await response.text();
      console.error(`[graph-mail] sendMail failed: ${response.status} ${body}`);
      return false;
    }
 
    return true;
  } catch (err) {
    console.error("[graph-mail] Unexpected error sending mail:", err);
    return false;
  }
}