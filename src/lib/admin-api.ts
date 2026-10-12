/**
 * Client for the authenticated admin API (`/admin/*`).
 *
 * Every request carries the Clerk session token; the backend derives the
 * club from the token's active organisation, so the client never sends a
 * `vereinId` for its own data.
 */
import { useAuth } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { ContentType, Veranstaltung, Verein } from "@/shared/content-schema";
import { apiBaseUrl } from "@/lib/backend";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Field errors from validation, keyed by field name. */
    readonly details?: Record<string, string>,
  ) {
    super(message);
  }
}

export type Me = {
  userId: string;
  vereinId: string | null;
  rolle: string | null;
  kannBearbeiten: boolean;
  /** Active organisation is the platform itself - no club page, no events. */
  istPlattformOrg: boolean;
  istPlattformAdmin: boolean;
};

export type FreigabeEintrag = {
  id: string;
  type: string;
  titel: string;
  absender: string | null;
  betreff: string | null;
  createdAt: string;
  fehlendeFelder: string[];
};

export type FreigabeDetail = FreigabeEintrag & {
  status: string;
  document: Record<string, unknown>;
  hinweise: string | null;
  konfidenz: number | null;
};

type Method = "GET" | "POST" | "PUT" | "DELETE";

/** Bound `request` function that attaches the current session token. */
export function useAdminRequest() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(method: Method, path: string, body?: unknown): Promise<T> => {
      const token = await getToken();
      if (!token) {
        throw new ApiError(401, "Bitte melden Sie sich an.");
      }

      const response = await fetch(`${apiBaseUrl}/admin${path}`, {
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
          authorization: `Bearer ${token}`,
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        method,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new ApiError(
          response.status,
          payload?.message ?? "Die Anfrage ist fehlgeschlagen.",
          payload?.details,
        );
      }
      return payload as T;
    },
    [getToken],
  );
}

export function useMe(enabled = true) {
  const request = useAdminRequest();
  return useQuery({
    enabled,
    queryFn: () => request<Me>("GET", "/me"),
    queryKey: ["admin", "me"],
  });
}

/** The club's published data; `null` when the club has no content file yet. */
export function useVerein(enabled = true) {
  const request = useAdminRequest();
  return useQuery({
    enabled,
    queryFn: async () => {
      try {
        return await request<Verein>("GET", "/verein");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    queryKey: ["admin", "verein"],
  });
}

export function useVeranstaltungen(enabled = true) {
  const request = useAdminRequest();
  return useQuery({
    enabled,
    queryFn: () => request<Veranstaltung[]>("GET", "/veranstaltungen"),
    queryKey: ["admin", "veranstaltungen"],
  });
}

export function useVeranstaltung(id: string | undefined) {
  const request = useAdminRequest();
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => request<Veranstaltung>("GET", `/veranstaltungen/${id}`),
    queryKey: ["admin", "veranstaltungen", id],
  });
}

export function useSaveVerein() {
  const request = useAdminRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => request<Verein>("PUT", "/verein", values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "verein"] }),
  });
}

export function useSaveVeranstaltung(id: string | undefined) {
  const request = useAdminRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) =>
      id
        ? request<Veranstaltung>("PUT", `/veranstaltungen/${id}`, values)
        : request<Veranstaltung>("POST", "/veranstaltungen", values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "veranstaltungen"] }),
  });
}

export function useDeleteVeranstaltung() {
  const request = useAdminRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<{ id: string }>("DELETE", `/veranstaltungen/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "veranstaltungen"] }),
  });
}

export function useFreigabeListe(enabled: boolean) {
  const request = useAdminRequest();
  return useQuery({
    enabled,
    queryFn: () => request<FreigabeEintrag[]>("GET", "/freigabe"),
    queryKey: ["admin", "freigabe"],
  });
}

export function useFreigabeEintrag(id: string | undefined) {
  const request = useAdminRequest();
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => request<FreigabeDetail>("GET", `/freigabe/${id}`),
    queryKey: ["admin", "freigabe", id],
  });
}

type FreigabeAktion = "speichern" | "freigeben" | "ablehnen";

export function useFreigabeAktion(id: string) {
  const request = useAdminRequest();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      aktion: FreigabeAktion;
      type: ContentType;
      document: Record<string, unknown>;
      grund?: string;
    }) => {
      switch (input.aktion) {
        case "speichern":
          return request("PUT", `/freigabe/${id}`, { document: input.document, type: input.type });
        case "freigeben":
          return request("POST", `/freigabe/${id}/freigeben`, { document: input.document, type: input.type });
        case "ablehnen":
          return request("POST", `/freigabe/${id}/ablehnen`, { grund: input.grund ?? "" });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "freigabe"] }),
  });
}
