import { afterEach, describe, expect, it, vi } from "vitest";
import { buildContactNotification, contactNotificationConfigFromEnv } from "./contact-notification";

const config = { from: "kontakt@unser-besigheim.de", recipients: ["team@example.de"] };
const submission = {
  createdAt: "2026-11-19T10:00:00.000Z",
  email: "anna@example.de",
  id: "abc-123",
  message: "Wir möchten unseren Verein eintragen.",
  name: "Anna Muster",
  organization: "TSV Besigheim",
};

describe("buildContactNotification", () => {
  it("sends to the configured recipients and replies to the submitter", () => {
    const { input } = buildContactNotification(submission, config);

    expect(input.FromEmailAddress).toBe("kontakt@unser-besigheim.de");
    expect(input.Destination?.ToAddresses).toEqual(["team@example.de"]);
    expect(input.ReplyToAddresses).toEqual(["anna@example.de"]);
    expect(input.Content?.Simple?.Subject?.Data).toBe("Kontaktformular: Anna Muster (TSV Besigheim)");

    const body = input.Content?.Simple?.Body?.Text?.Data ?? "";
    expect(body).toContain("Wir möchten unseren Verein eintragen.");
    expect(body).toContain("Verein/Organisation: TSV Besigheim");
    expect(body).toContain("Anfrage-ID: abc-123");
  });

  it("leaves the organisation out when none was given", () => {
    const { input } = buildContactNotification({ ...submission, organization: "" }, config);

    expect(input.Content?.Simple?.Subject?.Data).toBe("Kontaktformular: Anna Muster");
    expect(input.Content?.Simple?.Body?.Text?.Data).not.toContain("Verein/Organisation");
  });

  it("keeps line breaks out of the subject", () => {
    const { input } = buildContactNotification({ ...submission, name: "Anna\r\nBcc: x@evil.test" }, config);

    expect(input.Content?.Simple?.Subject?.Data).not.toMatch(/[\r\n]/);
  });
});

describe("contactNotificationConfigFromEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads sender and comma-separated recipients", () => {
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "kontakt@unser-besigheim.de");
    vi.stubEnv("CONTACT_NOTIFICATION_RECIPIENTS", "a@example.de, b@example.de,");

    expect(contactNotificationConfigFromEnv()).toEqual({
      from: "kontakt@unser-besigheim.de",
      recipients: ["a@example.de", "b@example.de"],
    });
  });

  it("is undefined without recipients", () => {
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "kontakt@unser-besigheim.de");
    vi.stubEnv("CONTACT_NOTIFICATION_RECIPIENTS", "");

    expect(contactNotificationConfigFromEnv()).toBeUndefined();
  });
});
