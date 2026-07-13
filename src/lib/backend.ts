const apiBaseUrl = "https://api.unser-besigheim.de";

export type ContactMessage = {
  email: string;
  message: string;
  name: string;
  organization?: string;
  website?: string;
};

export function isBackendConfigured() {
  return Boolean(apiBaseUrl);
}

export async function submitContactMessage(message: ContactMessage) {
  if (!apiBaseUrl) {
    throw new Error(
      "Das Kontaktformular ist noch nicht mit dem Backend verbunden."
    );
  }

  const response = await fetch(`${apiBaseUrl}/contact`, {
    body: JSON.stringify(message),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.message ?? "Die Nachricht konnte nicht gesendet werden."
    );
  }

  return response.json() as Promise<{ id: string }>;
}
