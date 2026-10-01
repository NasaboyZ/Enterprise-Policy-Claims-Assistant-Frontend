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

> Phase 2 ist als bedienbare Oberfläche mit gekennzeichneten Demodaten umgesetzt. Chat-Antworten und Dokumentauszüge sind synthetisch; Risikostufen dienen der Vorschau. Die echte LLM-/ML-/PDF-Anbindung folgt in Phase 3. Setup und Prüfkommandos stehen in `README.md`.

### Phase 3: Integration & UX-Polish

- [ ] Chat-Komponente mit dem `POST /api/chat`-Endpoint verknüpfen und Antworten rendern.
- [ ] Lade-Indikatoren (Spinner/Skeletons) und Error-States einbauen (z. B. wenn das Backend nicht erreichbar ist).
- [ ] Drag-and-Drop-Komponente entwickeln und mit dem `POST /api/upload`-Endpoint verbinden.
- [ ] Fallback-Handling implementieren (klare Fehlermeldung, wenn das LLM aufgrund von Guardrails keine Antwort im Dokument findet).
