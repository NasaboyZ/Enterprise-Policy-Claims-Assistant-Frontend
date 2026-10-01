import type { ChatMessage, ClaimInput } from "@/lib/types";

export const initialClaim: ClaimInput = {
  customer_age: 38,
  claim_amount: 2450,
  claim_type: "water",
  policy_months: 36,
  previous_claims: 0,
  description: "Durch eine undichte Wasserleitung wurde der Parkettboden im Wohnzimmer beschädigt.",
};

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Guten Tag! Laden Sie Ihre Versicherungsdokumente hoch und stellen Sie eine Frage zum Schaden. Quellenverweise öffnen die zugehörige Textstelle. Übernommene Schadensdaten werden mit Ihrer Frage an das Backend gesendet.",
  sources: [],
};
