import { Resend } from "resend";

import { getCategory } from "@/lib/catalogue/categories";
import { getResendApiKey } from "@/lib/config";
import { getCountry } from "@/lib/contact/countries";
import { SITE } from "@/lib/site";

/**
 * Email delivery contract for Contact Us submissions (spec #6 / ADR-0007).
 *
 * Submissions are emailed — never stored — to both fixed Safeway addresses.
 * Delivery uses Resend's server-side SDK with the verified `safewaytyre.com`
 * sender. The transport is injectable so the contract can be tested without
 * sending real mail. The `RESEND_API_KEY` is server-only and never reaches the
 * browser, logs or API responses.
 */

export type ContactSubmission = {
  formType: "query" | "feedback";
  name: string;
  /** ISO country code; rendered as the full country name in the email. */
  country: string;
  phone: string;
  /** Canonical category slugs; rendered as display names in the email. */
  categories?: readonly string[];
  message: string;
  /** Optional visitor email, used as Reply-To when present. */
  email?: string;
};

export type EmailMessage = {
  to: string[];
  from: string;
  subject: string;
  text: string;
  /** Set from the visitor's email when the form supplies one. */
  replyTo?: string;
};

export interface EmailTransport {
  sendMail(message: EmailMessage): Promise<void>;
}

/** The two fixed recipients every submission is sent to. */
export const CONTACT_RECIPIENTS: readonly string[] = [
  SITE.emails.director,
  SITE.emails.marketing,
];

/**
 * The verified sender for contact emails. `safewaytyre.com` is the domain
 * verified in Resend; change this only alongside the Resend domain.
 */
export const CONTACT_FROM = "Safeway Tyre Website <website@safewaytyre.com>";

/**
 * Strip CR/LF and control characters from a value before it is used in a mail
 * header. User input is only ever placed in the subject, but this keeps a
 * crafted name from injecting additional headers.
 */
export function sanitizeHeaderValue(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildContactEmail(submission: ContactSubmission): EmailMessage {
  const label = submission.formType === "query" ? "Inquiry" : "Feedback";
  // Relay the full country name and canonical category names, not internal codes.
  const country = getCountry(submission.country)?.name ?? submission.country;
  const categories = (submission.categories ?? []).map(
    (slug) => getCategory(slug)?.displayName ?? slug,
  );
  const lines = [
    `New ${label} from the Safeway Tyre website`,
    "",
    `Name: ${submission.name}`,
    `Country: ${country}`,
    `Phone: ${submission.phone}`,
    ...(submission.email ? [`Email: ${submission.email}`] : []),
    ...(categories.length > 0
      ? [`Categories: ${categories.join(", ")}`]
      : []),
    "",
    "Message:",
    submission.message,
  ];

  return {
    to: [...CONTACT_RECIPIENTS],
    from: CONTACT_FROM,
    subject: `Safeway Tyre — ${label} from ${sanitizeHeaderValue(submission.name)}`,
    text: lines.join("\n"),
    ...(submission.email ? { replyTo: submission.email } : {}),
  };
}

function createResendTransport(): EmailTransport {
  const resend = new Resend(getResendApiKey());

  return {
    async sendMail(message) {
      const { error } = await resend.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      });

      if (error) {
        throw new Error(`Resend rejected the email: ${error.message}`);
      }
    },
  };
}

export async function sendContactEmail(
  submission: ContactSubmission,
  deps: { transport?: EmailTransport } = {},
): Promise<void> {
  const transport = deps.transport ?? createResendTransport();
  await transport.sendMail(buildContactEmail(submission));
}
