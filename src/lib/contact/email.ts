import nodemailer from "nodemailer";

import { getCategory } from "@/lib/catalogue/categories";
import { getEmailTransportEnv } from "@/lib/config";
import { getCountry } from "@/lib/contact/countries";
import { SITE } from "@/lib/site";

/**
 * Email delivery contract for Contact Us submissions (spec #6 / ADR-0007).
 * Submissions are emailed — never stored — to both fixed Safeway addresses.
 * The transport is injectable so the contract can be tested without sending
 * real mail; the default transport is SMTP over the configured credentials.
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
};

export type EmailMessage = {
  to: string[];
  from: string;
  subject: string;
  text: string;
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

export function buildContactEmail(
  submission: ContactSubmission,
  from: string,
): EmailMessage {
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
    ...(categories.length > 0
      ? [`Categories: ${categories.join(", ")}`]
      : []),
    "",
    "Message:",
    submission.message,
  ];

  return {
    to: [...CONTACT_RECIPIENTS],
    from,
    subject: `Safeway Tyre — ${label} from ${sanitizeHeaderValue(submission.name)}`,
    text: lines.join("\n"),
  };
}

function createSmtpTransport(): EmailTransport {
  const { host, port, user, password } = getEmailTransportEnv();

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  return {
    async sendMail(message) {
      await transporter.sendMail(message);
    },
  };
}

export async function sendContactEmail(
  submission: ContactSubmission,
  deps: { transport?: EmailTransport; from?: string } = {},
): Promise<void> {
  const from = deps.from ?? getEmailTransportEnv().from;
  const transport = deps.transport ?? createSmtpTransport();
  await transport.sendMail(buildContactEmail(submission, from));
}
