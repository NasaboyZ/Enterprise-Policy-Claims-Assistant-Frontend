import { expect, test } from "@playwright/test";
import { ApiError, createApiClient } from "../src/lib/api";
import { initialClaim } from "../src/lib/demo";

test("API client uses JSON chat payloads and preserves FastAPI errors", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const client = createApiClient("http://backend.test/", async (url, init) => {
    calls.push({ url: String(url), init });
    return Response.json({ answer: "Antwort", sources: [] });
  });
  const payload = { message: "Deckung?", claim: initialClaim, history: [] };
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
  expect(received?.signal).toBe(controller.signal);
});
