"use client";

import { useEffect, useRef, useState } from "react";
import { apiErrorMessage, createApiClient } from "@/lib/api";
import { welcomeMessage } from "@/lib/initial-state";
import type { ChatMessage, ChatRequest, RiskAssessment } from "@/lib/types";

const api = createApiClient();

export function useClaimsChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<ChatRequest | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function send(payload: ChatRequest, retry = false) {
    if (controller.current) return;
    const active = new AbortController();
    controller.current = active;
    request.current = payload;
    setPending(true);
    setError(null);
    setRisk(null);
    if (!retry) setMessages(previous => [...previous, { id: crypto.randomUUID(), role: "user", content: payload.message, sources: [] }]);
    try {
      const response = await api.chat(payload, active.signal);
      if (active.signal.aborted) return;
      const status = response.status ?? "answered";
      const content = status === "insufficient_context"
        ? "Keine belegte Antwort im Dokument gefunden. Die vorhandenen Quellen reichen nicht aus. Bitte laden Sie ein passendes Dokument hoch oder formulieren Sie die Frage genauer."
        : status === "manual_review"
          ? "Manuelle Prüfung erforderlich. Es wurde keine Leistungsentscheidung getroffen. Bitte geben Sie den Schaden zur Prüfung an die Sachbearbeitung weiter."
          : response.answer;
      setMessages(previous => [...previous, { id: crypto.randomUUID(), role: "assistant", content, status, sources: status === "answered" ? response.sources : [] }]);
      setRisk(response.risk ?? null);
      request.current = null;
    } catch (error) {
      if (!active.signal.aborted) setError(apiErrorMessage(error));
    } finally {
      if (!active.signal.aborted) {
        controller.current = null;
        setPending(false);
      }
    }
  }

  return { messages, risk, pending, error, send,
    clearRisk: () => { setRisk(null); setError(null); request.current = null; },
    retry: () => { if (request.current) void send(request.current, true); },
  };
}
