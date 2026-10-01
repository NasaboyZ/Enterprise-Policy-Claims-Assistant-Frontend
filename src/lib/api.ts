import type { ChatRequest, ChatResponse, MetricsResponse, UploadResponse } from "@/lib/types";

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail: unknown) {
    super(`API-Anfrage fehlgeschlagen (HTTP ${status}).`);
    this.name = "ApiError";
  }
}

/** Prepared transport for phase 3. Demo components never call this client. */
export function createApiClient(
  baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  fetcher: typeof fetch = fetch,
) {
  const base = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${base}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
    if (!response.ok) {
      const detail: unknown = await response.json().catch(() => null);
      throw new ApiError(response.status, detail);
    }
    return response.json() as Promise<T>;
  }

  return {
    chat(payload: ChatRequest, signal?: AbortSignal) {
      return request<ChatResponse>("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });
    },
    upload(file: File, signal?: AbortSignal) {
      const body = new FormData();
      body.append("file", file);
      return request<UploadResponse>("/api/upload", { method: "POST", body, signal });
    },
    metrics(signal?: AbortSignal) {
      return request<MetricsResponse>("/api/metrics", { signal });
    },
  };
}
