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
