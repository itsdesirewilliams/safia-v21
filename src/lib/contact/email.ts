import nodemailer from "nodemailer";

import { getEmailTransportEnv } from "@/lib/config";
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
  country: string;
  phone: string;
  category?: string;
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

export function buildContactEmail(
  submission: ContactSubmission,
  from: string,
): EmailMessage {
  const label = submission.formType === "query" ? "Query" : "Feedback";
  const lines = [
    `New ${label} from the Safeway Tyre website`,
    "",
    `Name: ${submission.name}`,
    `Country: ${submission.country}`,
    `Phone: ${submission.phone}`,
    ...(submission.category ? [`Category: ${submission.category}`] : []),
    "",
    "Message:",
    submission.message,
  ];

  return {
    to: [...CONTACT_RECIPIENTS],
    from,
    subject: `Safeway Tyre — ${label} from ${submission.name}`,
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
