import type { ChatRequest, ChatResponse, MetricsResponse, UploadResponse } from "@/lib/types";

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail: unknown) {
    super(`API-Anfrage fehlgeschlagen (HTTP ${status}).`);
    this.name = "ApiError";
  }
}

export class InvalidResponseError extends Error {
  constructor() { super("Das Backend hat eine ungültige Antwort geliefert. Bitte erneut versuchen."); }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 413) return "Die Datei ist für das Backend zu groß. Bitte eine kleinere PDF auswählen.";
    if (error.status === 415) return "Das Backend unterstützt diese Datei nicht. Bitte eine gültige PDF auswählen.";
    if (error.status === 422) return "Das Backend konnte die Angaben nicht verarbeiten. Bitte Eingaben und PDF prüfen.";
    if (error.status === 429) return "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.";
    if (error.status === 401 || error.status === 403) return "Der Zugriff auf das Backend wurde verweigert. Bitte die Zugangsberechtigung prüfen.";
    return "Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen oder die Backend-Konfiguration prüfen.";
  }
  if (error instanceof InvalidResponseError) return error.message;
  if (error instanceof Error && error.name === "TimeoutError") return "Das Backend antwortet zu langsam. Bitte erneut versuchen.";
  return "Das Backend ist nicht erreichbar. Bitte Verbindung und Backend-Adresse prüfen und erneut versuchen.";
}

const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

function parseChat(value: unknown): ChatResponse {
  if (!record(value) || !Array.isArray(value.sources)
    || (value.status !== undefined && !["answered", "insufficient_context", "manual_review"].includes(String(value.status)))
    || typeof value.answer !== "string"
    || ((!value.status || value.status === "answered") && !nonempty(value.answer))) throw new InvalidResponseError();
  for (const source of value.sources) {
    if (!record(source) || !nonempty(source.id) || !nonempty(source.document_name)
      || !Number.isInteger(source.page) || Number(source.page) < 1 || typeof source.section !== "string"
      || !nonempty(source.text) || typeof source.quote !== "string") throw new InvalidResponseError();
  }
  if (value.risk !== undefined) {
    const risk = value.risk;
    if (!record(risk) || !["low", "medium", "high"].includes(String(risk.level))
      || typeof risk.score !== "number" || !Number.isFinite(risk.score) || risk.score < 0 || risk.score > 100
      || typeof risk.explanation !== "string") throw new InvalidResponseError();
  }
  return value as unknown as ChatResponse;
}

export function createApiClient(
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  fetcher: typeof fetch = fetch,
  timeoutMs = 90_000,
) {
  const base = baseUrl.replace(/\/+$/, "");

  async function request(path: string, init?: RequestInit): Promise<unknown> {
    const timeout = AbortSignal.timeout(timeoutMs);
    const response = await fetcher(`${base}${path}`, {
      ...init,
      signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
      headers: { Accept: "application/json", ...init?.headers },
    });
    if (!response.ok) {
      const detail: unknown = await response.json().catch(() => null);
      throw new ApiError(response.status, detail);
    }
    try { return await response.json(); }
    catch {
      if (timeout.aborted) throw timeout.reason;
      if (init?.signal?.aborted) throw init.signal.reason;
      throw new InvalidResponseError();
    }
  }

  return {
    async chat(payload: ChatRequest, signal?: AbortSignal) {
      return parseChat(await request("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      }));
    },
    async upload(file: File, signal?: AbortSignal): Promise<UploadResponse> {
      const body = new FormData();
      body.append("file", file);
      const value = await request("/api/upload", { method: "POST", body, signal });
      if (!record(value) || !nonempty(value.document_id) || !nonempty(value.filename)) throw new InvalidResponseError();
      return { document_id: value.document_id, filename: value.filename };
    },
    async metrics(signal?: AbortSignal) {
      return await request("/api/metrics", { signal }) as MetricsResponse;
    },
  };
}
