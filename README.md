# Frontend: Enterprise Policy & Claims Assistant

Dieses Repository enthält das Frontend für den **Enterprise Policy & Claims Assistant**, entwickelt mit **Next.js (App Router)** und **Tailwind CSS**.

Es richtet sich an Versicherungssachbearbeiter und demonstriert, wie komplexe KI-Prozesse (RAG & Machine Learning) in einer benutzerfreundlichen, performanten UI zugänglich gemacht werden. Die Applikation visualisiert Datenflüsse und schafft durch transparente Quellenangaben Vertrauen in die KI-generierten Antworten.

---

## Fokus der Entwicklung & Bewertungskriterien

Bei der Überprüfung und Bewertung dieses Frontends liegt das Hauptaugenmerk auf moderner React-Architektur, Performance und sauberem Styling. Konkret wird auf Folgendes geachtet:

### 1. Next.js Architektur & Rendering

- **App Router (`app/` Directory):** Saubere Strukturierung der Routen und Nutzung der modernen Next.js Architektur.
- **Server vs. Client Components:** Gezielter Einsatz von React Server Components (RSC) für schnelles initiales Laden und SEO, während Interaktivität (wie das Chat-Interface) gezielt in Client Components (`"use client"`) ausgelagert wird.
- **Loading & Error UI:** Nutzung von `loading.tsx` für Skeleton-Screens während KI-Berechnungen und `error.tsx` für das Abfangen von API-Fehlern.

### 2. Styling mit Tailwind CSS

- **Utility-First Approach:** Konsequente Nutzung von Tailwind-Klassen anstelle von externen CSS-Dateien oder Inline-Styles.
- **Design System:** Sinnvolle Erweiterung der `tailwind.config.ts` (z.B. für eigene Markenfarben, Risk-Badges).
- **Responsiveness:** Konsequenter Mobile-First-Ansatz unter Nutzung der Tailwind-Breakpoints (`md:`, `lg:`, `xl:`), sodass das Dashboard auf allen Geräten funktioniert.

### 3. State Management & API-Integration

- **Datenfluss:** Effizientes Fetching der FastAPI-Backend-Daten. Verwaltung des asynchronen Chat-Verlaufs und der ML-Scores ohne unnötige Re-Renders.
- **Streaming-Support:** Die UI ist darauf ausgelegt, gestreamte LLM-Antworten (Token für Token) flüssig darzustellen.
- **Separation of Concerns:** Auslagerung komplexer Logik (z.B. API-Calls an das Python-Backend) in eigene Custom Hooks oder Service-Dateien.

### 4. UI/UX & Human-in-the-Loop

- **Source Citation Panel:** Zitate aus den PDFs werden nicht nur als Text dargestellt, sondern interaktiv hervorgehoben (Transparenz für den Sachbearbeiter).
- **Visuelles Feedback:** Klare farbliche Signale (Tailwind-Farben) für den ML-Risk-Score (Grün = Auto-Freigabe, Rot = Manuelle Prüfung).
- **Accessibility (a11y):** Korrekte Nutzung von semantischem HTML und ARIA-Labels für Screenreader.

---

## Lokales Setup

1. **Repository klonen und in den Frontend-Ordner wechseln:**
   ```bash
   cd frontend
   ```
