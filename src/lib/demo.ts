import type { ChatMessage, ClaimInput, RiskAssessment, RiskLevel, SourceCitation } from "@/lib/types";

export const initialClaim: ClaimInput = {
  customer_age: 38,
  claim_amount: 2450,
  claim_type: "water",
  policy_months: 36,
  previous_claims: 0,
  description: "Durch eine undichte Wasserleitung wurde der Parkettboden im Wohnzimmer beschädigt.",
};

export const demoSources: SourceCitation[] = [
  {
    id: "coverage",
    document_name: "Muster-AVB · Hausrat.pdf",
    page: 12,
    section: "§ 4.2 · Leitungswasserschäden",
    text: "Versichert sind Schäden an versicherten Sachen, die durch bestimmungswidrig austretendes Leitungswasser entstehen. Dazu zählen Schäden aus Zu- und Ableitungsrohren der Wasserversorgung sowie mit dem Rohrsystem verbundenen Einrichtungen. Der Versicherungsschutz setzt voraus, dass die betroffenen Sachen zum versicherten Hausrat gehören. Schäden am Gebäude sind gesondert zu prüfen.",
    quote: "Versichert sind Schäden an versicherten Sachen, die durch bestimmungswidrig austretendes Leitungswasser entstehen.",
  },
  {
    id: "deductible",
    document_name: "Muster-Police · Hausrat.pdf",
    page: 3,
    section: "Vertragsdetails · Selbstbehalt",
    text: "Für versicherte Leitungswasserschäden gilt ein Selbstbehalt von CHF 200 je Schadenereignis. Die vereinbarte Versicherungssumme beträgt CHF 75’000. Die endgültige Entschädigung richtet sich nach der Prüfung des Schadenumfangs und der vertraglichen Voraussetzungen.",
    quote: "Für versicherte Leitungswasserschäden gilt ein Selbstbehalt von CHF 200 je Schadenereignis.",
  },
];

export const demoRisks: Record<RiskLevel, RiskAssessment> = {
  low: { level: "low", score: 12, explanation: "Beispiel für ein unauffälliges Modellergebnis." },
  medium: { level: "medium", score: 48, explanation: "Beispiel für ein Ergebnis mit zusätzlichem Prüfbedarf." },
  high: { level: "high", score: 86, explanation: "Beispiel für ein Ergebnis zur manuellen Prüfung." },
};

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Guten Tag! Hier können Sie die Schadenprüfung ausprobieren. Stellen Sie eine Beispielfrage zur Deckung oder zum Selbstbehalt und öffnen Sie die zugehörige Textstelle direkt über den Quellenverweis.",
  sources: [],
};

export function getDemoReply(message: string): Pick<ChatMessage, "content" | "sources"> {
  if (/selbstbehalt|selbstbeteiligung/i.test(message)) {
    return {
      content: "Die Muster-Police nennt für versicherte Leitungswasserschäden einen Selbstbehalt von CHF 200 je Schadenereignis. Ob der konkrete Schaden gedeckt ist, muss separat geprüft werden.",
      sources: [demoSources[1]],
    };
  }
  if (/deckung|gedeckt|versichert|wasser/i.test(message)) {
    return {
      content: "In den Musterbedingungen sind Schäden durch bestimmungswidrig austretendes Leitungswasser grundsätzlich beschrieben. Die Deckung gilt für versicherten Hausrat. Bei einem fest verlegten Parkettboden wäre zunächst zu klären, ob die Gebäudeversicherung zuständig ist.",
      sources: [demoSources[0]],
    };
  }
  return {
    content: "Dies ist eine lokale Chat-Demo mit vorbereiteten Antworten. Probieren Sie „Ist der Wasserschaden gedeckt?“ oder „Wie hoch ist der Selbstbehalt?“. Freie KI-Antworten stehen nach der Backend-Anbindung zur Verfügung.",
    sources: [],
  };
}
