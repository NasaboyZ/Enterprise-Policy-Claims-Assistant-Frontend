import type { RiskAssessment } from "@/lib/types";
import { Icon } from "@/components/icon";

const labels = { low: "Geringes Risiko", medium: "Mittleres Risiko", high: "Hohes Risiko" };

export function RiskBadge({ assessment }: { assessment: RiskAssessment | null }) {
  if (!assessment) {
    return <div className="risk-card" role="status"><p className="eyebrow">ML-RISIKOBEWERTUNG</p><p className="mt-3 font-semibold">Noch keine Bewertung</p><p className="helper mt-2">Eine Bewertung erscheint, sobald das Backend ein ML-Ergebnis zur Frage liefert.</p></div>;
  }

  return (
    <div className={`risk-card risk-${assessment.level}`} role="status">
     
      <div className="mt-4 flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-semibold"><span className="risk-dot" />{labels[assessment.level]}</span><Icon name="shield" /></div>
      <div className="mt-3 flex items-baseline gap-1"><span className="text-3xl font-semibold tracking-tight">{assessment.score}</span><span className="text-sm opacity-65">/ 100</span></div>
      <div className="risk-track mt-3" aria-hidden="true"><div style={{ width: `${assessment.score}%` }} /></div>
      <p className="mt-3 text-xs leading-relaxed opacity-80">{assessment.explanation}</p>
    </div>
  );
}
