import { expect, test } from "@playwright/test";
import { ApiError, createApiClient } from "../src/lib/api";
import { initialClaim } from "../src/lib/initial-state";

test("API client uses JSON chat payloads and preserves FastAPI errors", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const client = createApiClient("http://backend.test/", async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ answer: "Antwort", sources: [] });
  });
  const payload = { message: "Deckung?", claim: initialClaim, history: [], document_ids: [] };
  await expect(client.chat(payload)).resolves.toEqual({ answer: "Antwort", sources: [] });
  expect(calls[0].url).toBe("http://backend.test/api/chat");
  expect(calls[0].init?.method).toBe("POST");
  expect(JSON.parse(String(calls[0].init?.body))).toEqual(payload);
  expect(new Headers(calls[0].init?.headers).get("Content-Type")).toBe("application/json");

  const failing = createApiClient("http://backend.test", async () => Response.json({ detail: "Invalid claim" }, { status: 422 }));
  await expect(failing.chat(payload)).rejects.toBeInstanceOf(ApiError);
  await expect(failing.chat(payload)).rejects.toMatchObject({ status: 422, detail: { detail: "Invalid claim" } });
});

test("API client prepares multipart uploads and forwards abort signals", async () => {
  const controller = new AbortController();
  const file = new File(["example"], "example.pdf", { type: "application/pdf" });
  let received: RequestInit | undefined;
  const client = createApiClient("http://backend.test", async (_url, init) => {
    received = init;
    return Response.json({ document_id: "example", filename: "example.pdf" });
  });
  await client.upload(file, controller.signal);
  expect(received?.body).toBeInstanceOf(FormData);
  expect((received?.body as FormData).get("file")).toEqual(file);
  expect(new Headers(received?.headers).has("Content-Type")).toBe(false);
  controller.abort();
  expect(received?.signal?.aborted).toBe(true);
});

test("rejects malformed successful responses and invalid risk scores", async () => {
  const payload = { message: "Deckung?", claim: initialClaim, history: [], document_ids: [] };
  for (const body of [null, {}, { answer: "", sources: [] }, { answer: "OK", sources: [{}] }, { answer: "OK", sources: [], risk: { level: "low", score: 101, explanation: "invalid" } }, { answer: "OK", sources: [], status: "unknown" }]) {
    const client = createApiClient("http://backend.test", async () => Response.json(body));
    await expect(client.chat(payload)).rejects.toThrow("ungültige Antwort");
  }
  const client = createApiClient("http://backend.test", async () => new Response("<html>Error</html>"));
  await expect(client.chat(payload)).rejects.toThrow("ungültige Antwort");
  await expect(client.upload(new File(["pdf"], "test.pdf"))).rejects.toThrow("ungültige Antwort");
});

test("times out stalled requests", async () => {
  const client = createApiClient("http://backend.test", async (_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
  }), 10);
  await expect(client.chat({ message: "Deckung?", claim: initialClaim, history: [], document_ids: [] })).rejects.toMatchObject({ name: "TimeoutError" });
});
