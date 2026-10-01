## 🎨 Frontend Development Plan ( Next.js)

### Phase 1: Projekt-Setup & Layout

- [x] Neues Frontend-Projekt generieren (Next.js App Router mit TypeScript).
- [x] Styling-Framework einbinden (Tailwind CSS).
- [x] Grundlegendes 3-Spalten-Layout aufbauen (Eingabe, Chat, Dokumenten-Inspection).
- [x] API-Service aufsetzen, der die HTTP-Calls an das FastAPI-Backend bündelt (typisierter Fetch-Service; Anbindung in Phase 3).

### Phase 2: Core Components entwickeln

- [x] **Risk Assessment Form:** Formular zur Eingabe von strukturierten Schadensdaten (Alter, Summe etc.), um das ML-Modell zu füttern.
- [x] **Smart Chat UI:** Interaktives Chat-Fenster für die Kommunikation mit dem LLM-Agenten.
- [x] **Citation & Source Panel:** Dynamische Seitenleiste, die den Originaltext aus der PDF darstellt, wenn eine KI-Antwort darauf verweist.
- [x] **ML Risk Badge:** Farbige Status-Anzeige (🟢 Grün / 🟡 Gelb / 🔴 Rot), die das Ergebnis der ML-Betrugserkennung visualisiert.

> Phase 2 stellte zunächst eine bedienbare Demo bereit. Phase 3 ersetzt die Demo-Antworten und Risiko-Vorschau durch HTTP-Anfragen und Backend-Ergebnisse. Setup und Prüfkommandos stehen in `README.md`.

### Phase 3: Integration & UX-Polish

- [x] Chat-Komponente mit dem `POST /api/chat`-Endpoint verknüpfen und Antworten rendern.
- [x] Lade-Indikatoren (Spinner/Skeletons) und Error-States einbauen (z. B. wenn das Backend nicht erreichbar ist).
- [x] Drag-and-Drop-Komponente entwickeln und mit dem `POST /api/upload`-Endpoint verbinden.
- [x] Fallback-Handling implementieren (klare Fehlermeldung, wenn das LLM aufgrund von Guardrails keine Antwort im Dokument findet).

> Frontend-Implementierung mit simulierten HTTP-Antworten geprüft. Die REST-Endpunkte fehlen noch im benachbarten Backend; ein Live-Test mit FastAPI/LLM/PDF-Index steht aus. Der benötigte API-Vertrag einschließlich Guardrail-Status und Dokumentfilter ist in `README.md` dokumentiert.
