"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { RiskAssessmentForm } from "@/components/risk-assessment-form";
import { RiskBadge } from "@/components/risk-badge";
import { SmartChat } from "@/components/smart-chat";
import { SourcePanel } from "@/components/source-panel";
import { demoRisks, getDemoReply, initialClaim, welcomeMessage } from "@/lib/demo";
import type { ChatMessage, RiskLevel, SourceCitation } from "@/lib/types";

export function ClaimsWorkspace() {
  const [claim, setClaim] = useState(initialClaim);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [selectedSource, setSelectedSource] = useState<SourceCitation | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | "">("");

  function sendMessage(content: string) {
    const reply = getDemoReply(content);
    setMessages((previous) => [...previous,
      { id: crypto.randomUUID(), role: "user", content, sources: [] },
      { id: crypto.randomUUID(), role: "assistant", ...reply },
    ]);
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
        <div className="page-heading"><div><div className="flex items-center gap-3"><h1>Schäden verstehen.<br className="mobile-break" /> Sicher entscheiden.</h1></div><p>Alle Angaben, Antworten und Belege. In einem Arbeitsbereich.</p></div><span className="demo-indicator"><span />Frontend-Demo</span></div>
        <div className="case-bar"><div className="flex items-center gap-3"><span className="case-icon"><Icon name="file" size={18} /></span><div><span className="case-title">Beispielschaden</span><span className="case-id">DEMO-2026-001</span></div></div><div className="case-summary"><span>Schadenssumme</span><strong>{new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 2 }).format(claim.claim_amount)}</strong></div><span className="case-status">In Bearbeitung</span></div>
        <div className="workspace-grid">
          <section className="panel input-panel" aria-labelledby="claim-heading"><div className="panel-heading"><div className="flex items-center gap-3"><span className="icon-box"><Icon name="sliders" /></span><div><h2 id="claim-heading">Schadensdaten</h2><p>Der Ausgangspunkt Ihrer Prüfung</p></div></div></div><div className="input-content"><RiskAssessmentForm initialValue={initialClaim} onSubmit={setClaim} /><div className="risk-section"><div className="field mb-4"><label htmlFor="demo-risk">Risiko-Vorschau <span>Demo</span></label><select id="demo-risk" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value as RiskLevel | "")}><option value="">Ergebnis auswählen</option><option value="low">Grün · Geringes Risiko</option><option value="medium">Gelb · Mittleres Risiko</option><option value="high">Rot · Hohes Risiko</option></select></div><RiskBadge assessment={riskLevel ? demoRisks[riskLevel] : null} /></div></div></section>
          <SmartChat messages={messages} onSend={sendMessage} onSourceSelect={selectSource} selectedSourceId={selectedSource?.id} />
          <SourcePanel source={selectedSource} onClose={() => setSelectedSource(null)} />
        </div>
        <footer className="page-footer"><span><Icon name="shield" size={14} />Lokale Demo · Keine Datenübertragung an ein Backend</span><span>Projekt-Setup & Core Components · Phase 1–2</span></footer>
      </main>
    </div>
  );
}
