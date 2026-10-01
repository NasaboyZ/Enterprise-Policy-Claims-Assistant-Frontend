"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { apiErrorMessage, createApiClient } from "@/lib/api";
import { Icon } from "@/components/icon";
import type { UploadResponse } from "@/lib/types";

const api = createApiClient();
const maxBytes = 20 * 1024 * 1024;

export function DocumentUpload({ disabled, documents, onUploaded, onBusyChange }: {
  disabled: boolean;
  documents: UploadResponse[];
  onUploaded: (document: UploadResponse) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function upload(files: File[]) {
    if (disabled || controller.current) return;
    setError(null);
    setFile(null);
    if (files.length !== 1) { setError("Bitte genau eine PDF-Datei auswählen."); return; }
    const candidate = files[0];
    if (!/\.pdf$/i.test(candidate.name) || (candidate.type && candidate.type !== "application/pdf")) {
      setError("Bitte eine PDF-Datei auswählen."); return;
    }
    if (!candidate.size || candidate.size > maxBytes) {
      setError("Die PDF muss zwischen 1 Byte und 20 MB groß sein."); return;
    }
    setFile(candidate);
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    onBusyChange(true);
    try {
      const document = await api.upload(candidate, active.signal);
      if (!active.signal.aborted) { onUploaded(document); setFile(null); }
    } catch (error) {
      if (!active.signal.aborted) setError(apiErrorMessage(error));
    } finally {
      if (!active.signal.aborted) {
        controller.current = null;
        setBusy(false);
        onBusyChange(false);
      }
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files));
  }

  return (
    <section className="upload-section" aria-labelledby="upload-heading">
      <h3 id="upload-heading" className="eyebrow mb-3">VERSICHERUNGSDOKUMENTE</h3>
      <div className={`upload-dropzone ${dragging ? "is-dragging" : ""}`} onDrop={drop}
        onDragOver={event => { event.preventDefault(); if (!disabled && !busy) setDragging(true); }}
        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}>
        <Icon name="file" size={25} />
        <p>PDF hier ablegen oder auswählen</p>
        <input ref={input} type="file" accept=".pdf,application/pdf" className="sr-only" tabIndex={-1} aria-label="PDF auswählen" disabled={disabled || busy}
          onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (files.length) void upload(files); }} />
        <button type="button" className="suggestion-button" disabled={disabled || busy} onClick={() => input.current?.click()}>PDF auswählen</button>
        <p className="helper">Eine PDF pro Upload · maximal 20 MB</p>
      </div>
      {busy && <p className="request-status" role="status"><span className="spinner" />PDF wird hochgeladen und indexiert …</p>}
      {error && <div className="request-error" role="alert"><p>{error}</p>{file && <button type="button" className="suggestion-button mt-3" disabled={disabled || busy} onClick={() => void upload([file])}>Upload erneut versuchen</button>}</div>}
      <div aria-live="polite">{documents.length > 0 && <ul className="uploaded-documents">{documents.map(document => <li key={document.document_id}><Icon name="check" size={15} /><span>{document.filename}<small>Für Fragen verfügbar</small></span></li>)}</ul>}</div>
    </section>
  );
}
