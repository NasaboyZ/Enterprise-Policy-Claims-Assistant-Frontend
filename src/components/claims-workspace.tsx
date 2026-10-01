"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { RiskAssessmentForm } from "@/components/risk-assessment-form";
import { RiskBadge } from "@/components/risk-badge";
import { SmartChat } from "@/components/smart-chat";
import { SourcePanel } from "@/components/source-panel";
import { initialClaim } from "@/lib/initial-state";
import { useClaimsChat } from "@/hooks/use-claims-chat";
import { DocumentUpload } from "@/components/document-upload";
import type { SourceCitation, UploadResponse } from "@/lib/types";

export function ClaimsWorkspace() {
  const [claim, setClaim] = useState(initialClaim);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [documents, setDocuments] = useState<UploadResponse[]>([]);
  const [uploading, setUploading] = useState(false);
  const chat = useClaimsChat();

  function sendMessage(content: string) {
    if (chat.pending || uploading) return;
    setSelectedSource(null);
    void chat.send({
      message: content,
      claim,
    });
  }

  function selectSource(source: SourceCitation) {
    setSelectedSource(source);
    if (window.matchMedia("(max-width: 1199px)").matches) {
      document.getElementById("source-panel")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">Zum Arbeitsbereich</a>
      <header className="app-header"><div className="brand"><span className="brand-symbol"><Icon name="shield" size={24} /></span><span>claim<span className="brand-light">wise</span><span className="brand-divider" /><span className="brand-subtitle">Insurance Intelligence</span></span></div><div className="header-right"><span className="workspace-label">Arbeitsbereich</span><span className="header-avatar" aria-label="Sachbearbeitung">SB</span></div></header>
      <main id="workspace" className="main-content">
        <div className="breadcrumb">Arbeitsbereich<Icon name="chevron" size={12} /><span>Schadenprüfung</span></div>
        <div className="page-heading"><div><div className="flex items-center gap-3"><h1>Schäden verstehen.<br className="mobile-break" /> Sicher entscheiden.</h1></div><p>Alle Angaben, Antworten und Belege. In einem Arbeitsbereich.</p></div><span className="demo-indicator"><span />Dokumentengestützte Prüfung</span></div>
        <div className="case-bar"><div className="flex items-center gap-3"><span className="case-icon"><Icon name="file" size={18} /></span><div><span className="case-title">Aktueller Schaden</span><span className="case-id">Diese Sitzung</span></div></div><div className="case-summary"><span>Schadenssumme</span><strong>{new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 2 }).format(claim.claim_amount)}</strong></div><span className="case-status">In Bearbeitung</span></div>
        <div className="workspace-grid">
          <section className="panel input-panel" aria-labelledby="claim-heading"><div className="panel-heading"><div className="flex items-center gap-3"><span className="icon-box"><Icon name="sliders" /></span><div><h2 id="claim-heading">Schadensdaten</h2><p>Der Ausgangspunkt Ihrer Prüfung</p></div></div></div><div className="input-content"><fieldset disabled={chat.pending}><RiskAssessmentForm initialValue={initialClaim} onSubmit={value => { setClaim(value); chat.clearRisk(); }} /></fieldset><DocumentUpload disabled={chat.pending} documents={documents} onBusyChange={setUploading} onUploaded={document => { setDocuments(previous => [...previous.filter(item => item.document_id !== document.document_id), document]); setSelectedSource(null); chat.clearRisk(); }} /><div className="risk-section"><RiskBadge assessment={chat.risk} /></div></div></section>
          <SmartChat messages={chat.messages} pending={chat.pending} disabled={chat.pending || uploading} error={chat.error} onRetry={chat.retry} onSend={sendMessage} onSourceSelect={selectSource} selectedSourceId={selectedSource?.id} />
          <SourcePanel source={selectedSource} onClose={() => setSelectedSource(null)} />
        </div>
        <footer className="page-footer"><span><Icon name="shield" size={14} />Fragen, übernommene Angaben und PDFs werden an das Backend übertragen</span><span>Integration & UX · Phase 3</span></footer>
      </main>
    </div>
  );
}
