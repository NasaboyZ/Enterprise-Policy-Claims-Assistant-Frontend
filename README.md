# Enterprise Policy & Claims Assistant — Frontend

Next.js App Router, React, TypeScript und Tailwind CSS. Der Arbeitsbereich verbindet Schadensdaten, Chat mit Quellenverweisen, PDF-Upload und ML-Risikobewertung in einer responsiven Oberfläche.

## Starten

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`. `NEXT_PUBLIC_API_BASE_URL` legt die vom Browser erreichbare Backend-Adresse fest (Standard: `http://localhost:8000`, ohne `/api`). Sie wird beim Build eingebettet; nach Änderungen Entwicklungsserver neu starten bzw. neu bauen. Keine API-Schlüssel in öffentliche Umgebungsvariablen schreiben.

**Integrationsstand:** Die Frontend-Funktionen der Phasen 1–3 sind implementiert. Im benachbarten Backend sind `app/main.py` und die REST-Endpunkte noch nicht vorhanden. Bis sie den folgenden Vertrag implementieren, zeigt die Oberfläche bei Anfragen einen Verbindungsfehler. Die automatisierten Tests verwenden simulierte HTTP-Antworten; ein Live-Test mit FastAPI, Index und LLM steht noch aus.

Das Backend muss die Frontend-Origin via CORS zulassen, einschließlich `POST`, `OPTIONS` und `Content-Type`. Für Produktion eine passende HTTPS-Backend-Adresse konfigurieren. Es gibt keinen automatischen Wechsel auf Demodaten.

## Bedienung

- Schadensdaten bearbeiten und mit „Daten übernehmen“ für die nächste Frage speichern. Die Anfangswerte sind Beispielangaben und müssen an den tatsächlichen Schaden angepasst werden.
- PDFs per Dateiauswahl oder Drag-and-drop hochladen. Eine Datei pro Upload, maximal 20 MiB, nicht leer. Die serverseitige Prüfung des tatsächlichen Dateiformats bleibt erforderlich.
- Ein Dokument erscheint erst nach erfolgreichem Upload und abgeschlossener Indexierung als verfügbar. Seine ID wird mit nachfolgenden Fragen gesendet.
- Fragen per Enter oder Schaltfläche senden; Shift+Enter erzeugt einen Zeilenumbruch. Während Uploads und Chat-Anfragen werden konkurrierende Aktionen gesperrt.
- Quellenverweise öffnen den gelieferten Dokumentauszug. Ein optionales ML-Ergebnis ersetzt den leeren Risikostatus; geänderte Schadensdaten oder neue Dokumente löschen die bisherige Bewertung.
- Technische Fehler lassen sich erneut versuchen. Chat-Wiederholungen verwenden dieselbe Anfrage und erzeugen keine zweite Nutzernachricht. Jede HTTP-Anfrage hat ein Zeitlimit von 90 Sekunden; beim Verlassen wird sie abgebrochen. Ein Abbruch garantiert keinen Abbruch der serverseitigen Verarbeitung.
- Zustand und Dokument-IDs bleiben nur im Arbeitsspeicher dieser Sitzung. Das Neuladen löscht den lokalen Verlauf, aber keine Dateien im Backend.

## HTTP-Vertrag für die REST-Schicht

Der typisierte Client steht in `src/lib/api.ts`, die Datentypen in `src/lib/types.ts`. JSON-Antworten werden vor der Darstellung validiert. Fehler liefern einen nicht erfolgreichen HTTP-Status, optional mit FastAPI-`detail`; interne Fehlerdetails werden nicht ungefiltert angezeigt.

### `POST /api/chat`

Request (`application/json`):

```json
{
  "message": "Ist der Wasserschaden gedeckt?",
  "claim": {
    "customer_age": 38,
    "claim_amount": 2450,
    "claim_type": "water",
    "policy_months": 36,
    "previous_claims": 0,
    "description": "Wasserleitung undicht."
  },
  "history": [],
  "document_ids": ["doc-1"]
}
```

`history` enthält vorherige `{ "role": "user" | "assistant", "content": "…" }`-Nachrichten, ohne Begrüßung und ohne die aktuelle Frage. `document_ids: []` bedeutet Suche im bestehenden Dokumentbestand; bei IDs muss das Backend die Suche auf diese Dokumente begrenzen. Schadenarten: `water`, `theft`, `glass`, `liability`.

Response:

```json
{
  "status": "answered",
  "answer": "Die Bedingungen beschreiben Leitungswasserschäden.",
  "sources": [{
    "id": "source-1",
    "document_name": "AVB.pdf",
    "page": 12,
    "section": "Leitungswasserschäden",
    "text": "Versichert sind Schäden durch Leitungswasser.",
    "quote": "Schäden durch Leitungswasser"
  }],
  "risk": { "level": "low", "score": 12, "explanation": "Unauffälliges Modellergebnis." }
}
```

- `status`: `answered` (Standard, falls ausgelassen), `insufficient_context` oder `manual_review`. Die letzten beiden zeigen feste, klare Hinweise anstelle einer unbelegten Antwort; Quellen werden dabei nicht dargestellt. Fehlende Quellen allein werden nicht als Guardrail-Signal interpretiert.
- `answer`: Text, bei `answered` nicht leer. `sources`: Array, ggf. leer. Seiten sind 1-basiert; Quellen-IDs müssen innerhalb einer Antwort eindeutig sein. `quote` und `section` dürfen leer sein. Nur tatsächlich im Auszug vorkommende Zitate werden hervorgehoben.
- `risk`: optional, bei fehlender Bewertung weglassen. `level`: `low`, `medium`, `high`; `score`: Zahl von 0 bis 100. Risikogrenzen bestimmt das Backend. Das Frontend trifft keine Leistungsentscheidung.

Der vorhandene lokale Python-Agent ist **kein HTTP-Endpunkt** und hat einen anderen Vertrag (`query`, reduzierte `claim`-Felder; Ergebnis mit `final_answer`, `ml_score` und eigenen Quellenfeldern). Die zukünftige REST-Schicht muss diese Felder explizit abbilden, Schadenarten auf die Modellkategorien abstimmen, Verlauf und Dokumentfilter unterstützen, Scores auf 0–100 umrechnen und Agent-Status `error` als HTTP-Fehler ausgeben. Zusätzliche Frontend-Schadensfelder dürfen nicht ungeprüft an das restriktive `AgentRequest` weitergereicht werden.

### `POST /api/upload`

Multipart-Formular mit genau einem Feld `file` (PDF). Erfolgreiche Antwort **nach abgeschlossener Indexierung**:

```json
{ "document_id": "doc-1", "filename": "Police.pdf" }
```

Die ID bezeichnet das für die Suche verfügbare Dokument. Wiederholte Uploads sollte das Backend deduplizieren. Empfohlene Fehlerstatus: `413` für Größenlimit, `415` für Dateiformat, `422` für ungültige Inhalte, `429` für Ratenlimit, `5xx` für Verarbeitungsausfälle. Der Client setzt den Multipart-Boundary automatisch.

## Prüfungen

```bash
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm test -- --workers=2
```

Alternativ mit installiertem Chrome: `PLAYWRIGHT_CHANNEL=chrome npm test -- --workers=2`.

Playwright startet den Entwicklungsserver auf `127.0.0.1:3100`. Die Suite deckt Desktop und Mobilansicht ab: Formularvalidierung, Payload und Verlauf, Quellen, Risikostatus, Tastaturbedienung, Ladezustände, Wiederholung nach Netzwerk-/HTTP-/Formatfehlern, Guardrails, PDF-Auswahl und Drag-and-drop, Größenprüfung sowie Dokument-IDs. Client-Tests prüfen außerdem Multipart, Abbruchweiterleitung und Timeout.

Das Chat-Protokoll liefert vollständige JSON-Antworten, kein Token-Streaming. Lade- und Fehlerzustände liegen direkt bei den asynchronen Client-Aktionen; Routen-`loading.tsx`/`error.tsx` würden diese Ereignishandler nicht abdecken.
