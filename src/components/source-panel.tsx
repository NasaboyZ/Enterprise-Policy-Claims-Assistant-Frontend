import { Icon } from "@/components/icon";
import type { SourceCitation } from "@/lib/types";

function SourceText({ source }: { source: SourceCitation }) {
  const index = source.text.indexOf(source.quote);
  if (!source.quote || index < 0) return <p>{source.text}</p>;
  return <p>{source.text.slice(0, index)}<mark>{source.quote}</mark>{source.text.slice(index + source.quote.length)}</p>;
}

export function SourcePanel({ source, onClose }: { source: SourceCitation | null; onClose: () => void }) {
  return (
    <aside className="panel source-panel" aria-labelledby="source-heading" id="source-panel">
      <div className="panel-heading"><div className="flex items-center gap-3"><span className="icon-box"><Icon name="file" /></span><div><h2 id="source-heading">Quellen & Belege</h2><p>Die Grundlage jeder Antwort</p></div></div>{source && <button type="button" onClick={onClose} className="icon-button" aria-label="Quelle schließen"><Icon name="close" size={17} /></button>}</div>
      <div className="source-content" aria-live="polite" aria-atomic="true">
        {source ? <>
          <div className="source-file"><Icon name="file" size={25} /><div className="min-w-0"><p className="text-sm font-semibold break-words">{source.document_name}</p><p className="helper mt-1">Dokumentquelle · Seite {source.page}</p></div></div>
          <div className="flex items-center justify-between mt-6 mb-4"><span className="eyebrow">DOKUMENTAUSZUG</span><span className="tiny-tag">S. {source.page}</span></div>
          <article className="document-page"><div className="document-rule" /><p className="document-brand">QUELLENAUSZUG</p><h3>{source.section}</h3><SourceText source={source} /><div className="document-footer"><span>Dokumentquelle</span><span>{source.page}</span></div></article>
          <p className="helper mt-4 flex items-start gap-2"><span className="highlight-dot" />Die zitierte Passage ist hervorgehoben.</p>
        </> : <div className="source-empty"><span className="empty-icon"><Icon name="file" size={32} /></span><h3>Antworten mit Referenz</h3><p>Öffnen Sie einen Quellenverweis im Chat. Hier erscheint die zugehörige Textstelle mit hervorgehobener Passage.</p><div className="empty-citation"><Icon name="file" size={14} />Dokument · Seite<Icon name="chevron" size={13} /></div></div>}
      </div>
      <div className="source-note"><Icon name="info" size={16} /><p>Die Auszüge stammen aus der Backend-Antwort. Prüfen Sie die zitierte Passage im Originaldokument.</p></div>
    </aside>
  );
}
