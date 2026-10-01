"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import type { ClaimInput, ClaimType } from "@/lib/types";

export function RiskAssessmentForm({ initialValue, onSubmit }: { initialValue: ClaimInput; onSubmit: (claim: ClaimInput) => void }) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      customer_age: Number(data.get("customer_age")),
      claim_amount: Number(data.get("claim_amount")),
      claim_type: data.get("claim_type") as ClaimType,
      policy_months: Number(data.get("policy_months")),
      previous_claims: Number(data.get("previous_claims")),
      description: String(data.get("description") ?? "").trim(),
    });
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} onChange={() => setSaved(false)} className="space-y-5">
      <div className="field"><label htmlFor="claim-type">Schadenart</label><select id="claim-type" name="claim_type" defaultValue={initialValue.claim_type}><option value="water">Leitungswasser</option><option value="theft">Diebstahl</option><option value="glass">Glasbruch</option><option value="liability">Haftpflicht</option></select></div>
      <div className="field"><label htmlFor="claim-amount">Schadenssumme <span>CHF</span></label><input id="claim-amount" name="claim_amount" type="number" required min="0.01" max="10000000" step="0.01" defaultValue={initialValue.claim_amount} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="field"><label htmlFor="customer-age">Kundenalter</label><input id="customer-age" name="customer_age" type="number" required min="18" max="120" step="1" defaultValue={initialValue.customer_age} /></div>
        <div className="field"><label htmlFor="previous-claims">Vorschäden</label><input id="previous-claims" name="previous_claims" type="number" required min="0" max="100" step="1" defaultValue={initialValue.previous_claims} /></div>
      </div>
      <div className="field"><label htmlFor="policy-months">Vertragsdauer <span>Monate</span></label><input id="policy-months" name="policy_months" type="number" required min="0" max="1200" step="1" defaultValue={initialValue.policy_months} /></div>
      <div className="field"><label htmlFor="description">Schadenbeschreibung</label><textarea id="description" name="description" rows={4} maxLength={2000} defaultValue={initialValue.description} placeholder="Was ist passiert?" /></div>
      <button type="submit" className="primary-button w-full justify-center">{saved ? <Icon name="check" size={17} /> : <Icon name="arrow" size={17} />}Daten übernehmen</button>
      <p className="helper min-h-8" role="status">{saved ? "Schadensdaten für diese Sitzung übernommen." : "Die Angaben bleiben lokal in dieser Sitzung."}</p>
    </form>
  );
}
