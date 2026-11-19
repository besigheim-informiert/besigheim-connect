import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export type ContactSubmission = {
  createdAt: string;
  email: string;
  id: string;
  message: string;
  name: string;
  organization: string;
};

export type ContactNotificationConfig = {
  /** Verified SES sender, e.g. `kontakt@unser-besigheim.de`. */
  from: string;
  recipients: string[];
};

/**
 * Normalises a multi-line form message: keeps line breaks and blank lines between
 * paragraphs, but collapses runs of spaces/tabs and more than one blank line.
 */
export function cleanMessage(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength)
    .trimEnd();
}

export function contactNotificationConfigFromEnv(): ContactNotificationConfig | undefined {
  const from = process.env.CONTACT_NOTIFICATION_FROM?.trim();
  const recipients = (process.env.CONTACT_NOTIFICATION_RECIPIENTS ?? "")
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  if (!from || recipients.length === 0) {
    return undefined;
  }

  return { from, recipients };
}

export function buildContactNotification(submission: ContactSubmission, config: ContactNotificationConfig) {
  // Header values must not carry line breaks; the form fields are already length-limited.
  const singleLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();
  const name = singleLine(submission.name);
  const organization = singleLine(submission.organization);

  const lines = [
    "Neue Nachricht über das Kontaktformular auf unser-besigheim.de",
    "",
    `Name: ${name}`,
    `E-Mail: ${submission.email}`,
    ...(organization ? [`Verein/Organisation: ${organization}`] : []),
    `Eingegangen: ${submission.createdAt}`,
    `Anfrage-ID: ${submission.id}`,
    "",
    "Nachricht:",
    submission.message,
    "",
    "--",
    "Mit „Antworten“ geht die Antwort direkt an die absendende Person.",
  ];

  return new SendEmailCommand({
    Content: {
      Simple: {
        Body: { Text: { Charset: "UTF-8", Data: lines.join("\n") } },
        Subject: {
          Charset: "UTF-8",
          Data: `Kontaktformular: ${name}${organization ? ` (${organization})` : ""}`,
        },
      },
    },
    Destination: { ToAddresses: config.recipients },
    FromEmailAddress: config.from,
    ReplyToAddresses: [submission.email],
  });
}

let ses: SESv2Client | undefined;

export async function sendContactNotification(submission: ContactSubmission, config: ContactNotificationConfig) {
  ses ??= new SESv2Client({});
  await ses.send(buildContactNotification(submission, config));
}
