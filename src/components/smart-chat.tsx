"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import type { ChatMessage, SourceCitation } from "@/lib/types";

const suggestions = ["Ist der Wasserschaden gedeckt?", "Wie hoch ist der Selbstbehalt?"];

export function SmartChat({ messages, onSend, onSourceSelect, selectedSourceId, pending, disabled, error, onRetry }: {
  pending: boolean;
  disabled: boolean;
  error: string | null;
  onRetry: () => void;
  messages: ChatMessage[];
  onSend: (message: string) => void;
  onSourceSelect: (source: SourceCitation) => void;
  selectedSourceId?: string;
}) {
  const [draft, setDraft] = useState("");
  const scrollArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollArea.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, pending]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section className="panel chat-panel" aria-labelledby="chat-heading">
      <div className="panel-heading"><div className="flex items-center gap-3"><span className="icon-box"><Icon name="chat" /></span><div><h2 id="chat-heading">Schadenassistent</h2><p>Dokumente verstehen. Klarheit gewinnen.</p></div></div><span className="tiny-tag">KI</span></div>
      <div className="chat-messages" role="log" aria-label="Chatverlauf" aria-live="polite" ref={scrollArea}>
        <div className="conversation-date">SCHADENPRÜFUNG</div>
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className={`avatar ${message.role === "assistant" ? "avatar-ai" : ""}`}>{message.role === "assistant" ? <Icon name="sparkle" size={17} /> : "Sie"}</div>
            <div className="min-w-0 flex-1"><p className="message-author">{message.role === "assistant" ? "Schadenassistent" : "Sie"}{message.role === "assistant" && <span>KI</span>}</p><div className={`message-bubble ${message.status === "insufficient_context" || message.status === "manual_review" ? "message-notice" : ""}`}><p className="whitespace-pre-wrap">{message.content}</p>{message.sources.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{message.sources.map((source) => <button type="button" key={source.id} className="citation-button" aria-pressed={selectedSourceId === source.id} onClick={() => onSourceSelect(source)}><Icon name="file" size={14} />{source.document_name} · S. {source.page}<Icon name="chevron" size={12} /></button>)}</div>}</div></div>
          </div>
        ))}
        {pending && <p className="request-status" role="status"><span className="spinner" />Antwort wird erstellt …</p>}
      </div>
      <div className="chat-compose">
        {error && <div className="request-error mb-4" role="alert"><p>{error}</p><button type="button" className="suggestion-button mt-3" disabled={disabled} onClick={onRetry}>Antwort erneut versuchen</button></div>}
        <p className="eyebrow mb-3">BEISPIELFRAGEN</p>
        <div className="mb-4 flex flex-wrap gap-2">{suggestions.map((question) => <button type="button" key={question} className="suggestion-button" disabled={disabled} onClick={() => onSend(question)}>{question}<Icon name="arrow" size={13} /></button>)}</div>
        <form onSubmit={send} className="composer"><label htmlFor="chat-message" className="sr-only">Nachricht an den Schadenassistenten</label><textarea id="chat-message" rows={2} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Frage zum Schaden stellen …" /><div className="flex items-center justify-between gap-2"><span>Enter zum Senden · Shift + Enter für neue Zeile</span><button type="submit" className="send-button" aria-label="Nachricht senden" disabled={disabled || !draft.trim()}><Icon name="send" size={18} /></button></div></form>
        <p className="helper mt-3 text-center">Jede Frage wird einzeln im gesamten Dokumentbestand gesucht. KI-Antworten anhand der Quellen prüfen.</p>
      </div>
    </section>
  );
}
