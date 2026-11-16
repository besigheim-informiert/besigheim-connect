import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminDeps } from "./admin";
import type { AuthContext } from "./auth";

const send = vi.fn();

vi.mock("@aws-sdk/client-ssm", () => ({
  GetParameterCommand: class {
    constructor(readonly input: unknown) {}
  },
  SSMClient: class {
    send = send;
  },
}));

vi.mock("./auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth")>();
  return {
    ...actual,
    verifySessionToken: vi.fn(async () => ({ orgRole: "admin", orgSlug: "tsv-besigheim", userId: "user_1" }) as AuthContext),
  };
});

const config = { branch: "main", repo: "owner/repo", tokenParameterName: "/besigheim-connect/github-token" };
const fetchMock = vi.fn();

/** Fresh module per test: the token cache is module state. */
async function loadGithub() {
  vi.resetModules();
  return import("./github");
}

function parameterNotFound() {
  return Object.assign(new Error("UnknownError"), { name: "ParameterNotFound" });
}

function token(value: string) {
  return { Parameter: { Value: value } };
}

describe("GitHub token handling", () => {
  beforeEach(() => {
    send.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a missing parameter as a token error", async () => {
    send.mockRejectedValue(parameterNotFound());
    const { GithubTokenError, readRecord } = await loadGithub();

    const error = await readRecord(config, "verein", "tsv").catch((e) => e);

    expect(error).toBeInstanceOf(GithubTokenError);
    expect(error.reason).toBe("missing");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports an empty parameter as a token error", async () => {
    send.mockResolvedValue(token("  "));
    const { GithubTokenError, readRecord } = await loadGithub();

    await expect(readRecord(config, "verein", "tsv")).rejects.toBeInstanceOf(GithubTokenError);
  });

  it("picks up a parameter created after a failed request without a cold start", async () => {
    send.mockRejectedValueOnce(parameterNotFound()).mockResolvedValue(token("ghp_new"));
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    const { readRecord } = await loadGithub();

    await expect(readRecord(config, "verein", "tsv")).rejects.toThrow();
    await expect(readRecord(config, "verein", "tsv")).resolves.toBeUndefined();

    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe("Bearer ghp_new");
  });

  it("reports a rejected token and reads it again on the next request", async () => {
    send.mockResolvedValueOnce(token("ghp_old")).mockResolvedValueOnce(token("ghp_renewed"));
    fetchMock
      .mockResolvedValueOnce(new Response('{"message":"Bad credentials"}', { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }));
    const { GithubTokenError, readRecord } = await loadGithub();

    const error = await readRecord(config, "verein", "tsv").catch((e) => e);
    expect(error).toBeInstanceOf(GithubTokenError);
    expect(error.reason).toBe("rejected");

    await expect(readRecord(config, "verein", "tsv")).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.authorization).toBe("Bearer ghp_renewed");
  });

  it("keeps other SSM errors as they are", async () => {
    send.mockRejectedValue(Object.assign(new Error("denied"), { name: "AccessDeniedException" }));
    const { GithubTokenError, readRecord } = await loadGithub();

    const error = await readRecord(config, "verein", "tsv").catch((e) => e);

    expect(error).not.toBeInstanceOf(GithubTokenError);
    expect(error.name).toBe("AccessDeniedException");
  });

  it("makes the admin API answer 503 with a German hint instead of 500", async () => {
    send.mockRejectedValue(parameterNotFound());
    vi.spyOn(console, "error").mockImplementation(() => {});
    await loadGithub();
    const { handleAdminRequest } = await import("./admin");

    const result = await handleAdminRequest(
      {
        headers: { authorization: "Bearer token" },
        rawPath: "/admin/engagement",
        requestContext: { http: { method: "GET" } },
      } as unknown as APIGatewayProxyEventV2,
      { auth: {}, github: config, ingestedTableName: "t", siteAdminOrgSlug: "unser-besigheim" } as unknown as AdminDeps,
    );

    expect(result.statusCode).toBe(503);
    expect(JSON.parse(String(result.body)).message).toMatch(/nicht eingerichtet/);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("GitHub token missing"));
  });
});
