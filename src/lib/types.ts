export type ClaimType = "water" | "theft" | "glass" | "liability";

export interface ClaimInput {
  customer_age: number;
  claim_amount: number;
  claim_type: ClaimType;
  policy_months: number;
  previous_claims: number;
  description: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  explanation: string;
}

export interface SourceCitation {
  id: string;
  document_name: string;
  page: number;
  section: string;
  text: string;
  quote: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SourceCitation[];
  status?: ChatStatus;
}

// UI models; api.ts maps them to the running FastAPI contract.
export type ChatStatus = "answered" | "insufficient_context" | "manual_review";

export interface ChatRequest {
  message: string;
  claim: ClaimInput;
}

export interface ChatResponse {
  answer: string;
  sources: SourceCitation[];
  risk?: RiskAssessment;
  status?: ChatStatus;
}

export interface UploadResponse {
  document_id: string;
  filename: string;
}

export interface MetricsResponse {
  faithfulness: number;
  answer_relevance: number;
}
