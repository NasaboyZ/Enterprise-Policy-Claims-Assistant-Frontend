# Claimwise Frontend

Next.js App Router, React, TypeScript und Tailwind CSS. Umsetzung von **Phase 1 und 2** aus `frontendplan.md`.

## Lokal starten

Voraussetzung: Node.js 20.9 oder neuer und npm.

```sh
npm ci
npm run dev
```

Die Anwendung läuft unter http://localhost:3000.

## Enthaltene Funktionen

- Responsiver Arbeitsbereich: Schadensdaten, Chat und Quellen; auf kleineren Bildschirmen untereinander.
- Schadensformular mit Pflichtfeldern und numerischen Grenzen. Übernommene Daten aktualisieren die Fallübersicht und bleiben im Arbeitsspeicher der Sitzung.
- Lokaler Demo-Chat mit Freitexteingabe, Beispielfragen und anklickbaren Quellen.
- Quellenpanel mit Seitenangabe, Dokumenttitel und hervorgehobener Textstelle.
- Risikoanzeige mit neutralem Ausgangszustand sowie auswählbaren grünen, gelben und roten Beispielen. Diese Vorschau ist unabhängig von den Formulareingaben und keine ML-Berechnung.
- Vorbereiteter, typisierter HTTP-Service für FastAPI.

Alle Antworten und Dokumenttexte sind ausdrücklich synthetische Demodaten. Es werden keine PDFs geladen und keine Backend-Anfragen ausgelöst. Neuladen setzt die Sitzung zurück.

## Struktur

```text
src/app/                         App-Einstieg, Layout und Styling
src/components/claims-workspace.tsx   Lokaler Sitzungszustand
src/components/risk-assessment-form.tsx
src/components/smart-chat.tsx
src/components/source-panel.tsx
src/components/risk-badge.tsx
src/lib/types.ts                 Vorläufige Datentypen
src/lib/api.ts                   Zentraler HTTP-Service
src/lib/demo.ts                  Isolierte Demo-Inhalte
tests/                          Browser- und HTTP-Service-Tests
```

## Vorbereitung für Phase 3

Bei Bedarf `.env.example` nach `.env.local` kopieren. `NEXT_PUBLIC_API_BASE_URL` bezeichnet die FastAPI-URL **ohne** `/api`, standardmässig `http://localhost:8000`.

Der Service `createApiClient()` stellt `chat()`, `upload()` und `metrics()` für die im Backend-Plan beschriebenen Endpunkte bereit. Er bündelt JSON-/Multipart-Anfragen, HTTP-Fehler und optionale Abort-Signale. `NEXT_PUBLIC_`-Variablen sind öffentlich; keine API-Schlüssel darin hinterlegen.

Die Request-/Response-Typen in `src/lib/types.ts` sind ein **vorläufiger Frontend-Vertrag**, da noch kein FastAPI-Schema vorliegt. Die Typisierung ersetzt keine Laufzeitvalidierung. Vor der Integration mit dem tatsächlichen OpenAPI-Schema abgleichen, Antwortvalidierung ergänzen und CORS bzw. einen Proxy konfigurieren. UI-Aufrufe, PDF-Upload, Lade-/Fehlerzustände und Guardrail-Behandlung gehören zu Phase 3 und sind noch offen.

## Prüfen

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Die Browser-Tests starten selbst einen lokalen Server auf Port 3100 und prüfen Desktop- und Mobilansicht, Formularvalidierung, Chat, Quellenwechsel und Risikozustände. HTTP-Tests verwenden simulierte Antworten.

Technische Referenzen: [Next.js Installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind mit Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
# Enterprise-Policy-Claims-Assistant-Frontend
