# Claimwise — Frontend

Next.js, React und TypeScript. Chat, PDF-Upload, Quellenansicht und ML-Modellwert sind an das FastAPI-Backend im Verzeichnis `../backend` angebunden.

## Starten

Backend nach `../backend/README.md` starten, anschließend:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend: **http://127.0.0.1:3000**. Die serverseitige Variable `API_BASE_URL` legt die FastAPI-Adresse fest (Standard `http://127.0.0.1:8000`, ohne `/api`). Nach Änderungen Next.js neu starten bzw. neu bauen. Der Browser verwendet relative `/api`-Adressen; Next.js leitet sie an FastAPI weiter. Dadurch ist keine CORS-Freigabe nötig und Zugriffe über eine Netzwerkadresse verwenden ebenfalls das Backend des Servers. `NEXT_PUBLIC_API_BASE_URL` wird nicht mehr verwendet. API-Schlüssel bleiben ausschließlich im Backend.

## Bedienung und aktueller Funktionsumfang

- Schadensdaten mit „Daten übernehmen“ speichern. Alter, Betrag und Schadenart werden für den ML-Check gesendet. Vertragsdauer, Vorschäden und Beschreibung sind derzeit nur lokale Eingaben; das Backend verarbeitet diese Felder noch nicht.
- Fragen per Enter oder Senden-Schaltfläche abschicken; Shift+Enter erzeugt einen Zeilenumbruch. Nachrichten bleiben im sichtbaren Sitzungsverlauf. Jede Frage wird eigenständig verarbeitet: Das Backend unterstützt noch keinen Gesprächsverlauf und keine Beschränkung auf einzelne hochgeladene Dokumente.
- Eine PDF pro Upload, maximal 10 MiB und 100 Seiten. Verschlüsselte, beschädigte und textlose PDFs werden abgewiesen. Dokumente erscheinen erst nach erfolgreicher Indexierung und stehen dann im gesamten Backend-Dokumentbestand zur Verfügung. Identische Dateien werden erkannt.
- Quellen öffnen den tatsächlichen Dokumentauszug mit Dateiname und Seite. Der ML-Score wird von 0–1 auf 0–100 umgerechnet; `manual_review` kommt vom Backend. Es gibt keine automatische Leistungsentscheidung.
- Fehlgeschlagene Anfragen lassen sich wiederholen, ohne Nutzernachrichten zu duplizieren. Bekannte Fehlercodes werden verständlich angezeigt; interne Fehlerdetails werden nicht ungefiltert ausgegeben. Anfragen haben ein Zeitlimit von 90 Sekunden.
- Neuladen löscht den lokalen Verlauf, jedoch keine Dokumente im Backend.

## HTTP-Anbindung

`src/lib/api.ts` übersetzt die Backend-Antworten in die UI-Datentypen:

- `POST /api/chat`: `{ "query": "Welcher Selbstbehalt gilt bei Leitungswasser?", "claim": { "customer_age": 38, "claim_amount": 2450, "claim_type": "water" } }`. Keine zusätzlichen Felder an den restriktiven AgentRequest senden.
- Chat-Antwort: `status`, `final_answer`, `ml_score`, `sources`, `error_code`. Quellen enthalten `source_id`, `filename`, `page`, `text` sowie Metadaten. Bei `manual_review` und `insufficient_context` erscheinen klare Hinweise.
- `POST /api/upload`: Multipart mit genau einem `file`. Nach Indexierung liefert FastAPI `status`, `filename`, `sha256`, `chunks`; SHA-256 dient lokal der Deduplizierung.
- `GET /api/metrics`: unveränderter Evaluationsbericht des Backends, vor der ersten Evaluation HTTP 404.

## Prüfungen

```bash
npm run typecheck
npm run lint
npm run build
npm test -- --workers=2
```

Playwright verwendet Port 3100 und einen separaten Build-Ordner `.next-test`, damit Tests den laufenden Entwicklungsserver nicht stören. Die Desktop- und Mobiltests prüfen Texteingabe, Versand auch ohne `crypto.randomUUID`, API-Format, Quellen, Fehler/Wiederholung und Uploads mit simulierten FastAPI-Antworten. Sie ersetzen keinen Live-Test des LLM-Anbieters.
