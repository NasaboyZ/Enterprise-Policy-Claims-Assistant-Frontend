import { expect, test, type Page } from "@playwright/test";

const source = { id: "coverage", document_name: "AVB.pdf", page: 12, section: "§ 4.2 · Leitungswasser", text: "Versichert sind Schäden durch Leitungswasser. Gebäude sind separat zu prüfen.", quote: "Versichert sind Schäden durch Leitungswasser." };
const answer = { answer: "Leitungswasserschäden sind versichert.", sources: [source], status: "answered", risk: { level: "low", score: 12, explanation: "Unauffälliger Score." } };
const pdf = { name: "Police.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nTest") };
const question = (page: Page) => page.getByRole("button", { name: "Ist der Wasserschaden gedeckt?", exact: true });

// All network responses here are contract fixtures, not a running AI backend.
test("validates claim inputs and sends the saved claim with chat history", async ({ page }) => {
  const payloads: Record<string, unknown>[] = [];
  await page.route("**/api/chat", async route => { payloads.push(route.request().postDataJSON()); await route.fulfill({ json: answer }); });
  await page.goto("/");
  await page.getByLabel("Kundenalter").fill("10");
  await page.getByRole("button", { name: "Daten übernehmen" }).click();
  await expect(page.getByLabel("Kundenalter")).toHaveJSProperty("validity", expect.objectContaining({ valid: false }));
  await page.getByLabel("Kundenalter").fill("42");
  await page.getByLabel("Schadenssumme CHF").fill("3750");
  await page.getByRole("button", { name: "Daten übernehmen" }).click();
  await expect(page.getByText("Schadensdaten für diese Sitzung übernommen.")).toBeVisible();
  await expect(page.locator(".case-summary")).toContainText("3’750");
  await question(page).click();
  await expect(page.getByRole("log")).toContainText(answer.answer);
  expect(payloads[0]).toMatchObject({ claim: { customer_age: 42, claim_amount: 3750 }, history: [], document_ids: [] });
  await page.getByRole("button", { name: "Wie hoch ist der Selbstbehalt?", exact: true }).click();
  await expect.poll(() => payloads.length).toBe(2);
  expect(payloads[1].history).toEqual([{ role: "user", content: "Ist der Wasserschaden gedeckt?" }, { role: "assistant", content: answer.answer }]);
});

test("renders backend sources and ML result, clears risk on claim change", async ({ page }, testInfo) => {
  await page.route("**/api/chat", route => route.fulfill({ json: answer }));
  await page.goto("/");
  await question(page).click();
  await page.getByRole("button", { name: /AVB.pdf/ }).click();
  await expect(page.locator(".document-page mark")).toHaveText(source.quote);
  await expect(page.locator(".risk-card")).toContainText("Geringes Risiko");
  await expect(page.locator(".risk-card")).toContainText("12");
  await page.screenshot({ path: testInfo.outputPath("workspace.png"), fullPage: true });
  await page.getByRole("button", { name: "Quelle schließen" }).click();
  await expect(page.getByRole("heading", { name: "Antworten mit Referenz" })).toBeVisible();
  await page.getByRole("button", { name: "Daten übernehmen" }).click();
  await expect(page.locator(".risk-card")).toContainText("Noch keine Bewertung");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("shows pending state, prevents duplicate submissions and supports keyboard input", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  let requests = 0;
  await page.route("**/api/chat", async route => { requests++; await gate; await route.fulfill({ json: answer }); });
  await page.goto("/");
  const input = page.getByLabel("Nachricht an den Schadenassistenten");
  await input.fill("  ");
  await expect(page.getByRole("button", { name: "Nachricht senden" })).toBeDisabled();
  await input.fill("Deckung?");
  await input.press("Shift+Enter");
  await expect(input).toHaveValue("Deckung?\n");
  await input.press("Enter");
  await expect(page.getByText("Antwort wird erstellt …")).toBeVisible();
  await expect(question(page)).toBeDisabled();
  await expect(page.getByRole("button", { name: "PDF auswählen" })).toBeDisabled();
  await input.fill("Nächste Frage");
  await input.press("Enter");
  await expect(input).toHaveValue("Nächste Frage");
  expect(requests).toBe(1);
  release();
  await expect(page.getByRole("log")).toContainText(answer.answer);
  await expect(page.getByText("Antwort wird erstellt …")).toHaveCount(0);
});

for (const failure of ["network", "server", "invalid"] as const) {
  test(`recovers from ${failure} failure without duplicating the user message`, async ({ page }) => {
    const payloads: unknown[] = [];
    await page.route("**/api/chat", async route => {
      payloads.push(route.request().postDataJSON());
      if (payloads.length > 1) return route.fulfill({ json: answer });
      if (failure === "network") return route.abort("failed");
      if (failure === "server") return route.fulfill({ status: 503, json: { detail: "private backend detail" } });
      return route.fulfill({ json: { answer: "Invalid", sources: null } });
    });
    await page.goto("/");
    await question(page).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).not.toContainText("private backend detail");
    await page.getByRole("button", { name: "Antwort erneut versuchen" }).click();
    await expect(page.getByRole("log")).toContainText(answer.answer);
    expect(payloads[1]).toEqual(payloads[0]);
    await expect(page.locator(".message-user")).toHaveCount(1);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });
}

for (const status of ["insufficient_context", "manual_review"] as const) {
  test(`renders ${status} safely without unsupported answer or sources`, async ({ page }) => {
    await page.route("**/api/chat", route => route.fulfill({ json: { ...answer, status, answer: "Nicht belegte Behauptung" } }));
    await page.goto("/");
    await question(page).click();
    await expect(page.getByRole("log")).toContainText(status === "insufficient_context" ? "Keine belegte Antwort im Dokument gefunden" : "Manuelle Prüfung erforderlich");
    await expect(page.getByRole("log")).not.toContainText("Nicht belegte Behauptung");
    await expect(page.locator(".citation-button")).toHaveCount(0);
  });
}

test("uploads PDF as multipart, waits for indexing and scopes the next chat", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/upload", async route => {
    expect(route.request().headers()["content-type"]).toContain("multipart/form-data; boundary=");
    expect(route.request().postDataBuffer()?.toString()).toContain('name="file"; filename="Police.pdf"');
    await gate;
    await route.fulfill({ json: { document_id: "doc-1", filename: "Police.pdf" } });
  });
  let chatPayload: unknown;
  await page.route("**/api/chat", async route => { chatPayload = route.request().postDataJSON(); await route.fulfill({ json: answer }); });
  await page.goto("/");
  await page.getByLabel("PDF auswählen", { exact: true }).setInputFiles(pdf);
  await expect(page.getByText("PDF wird hochgeladen und indexiert …")).toBeVisible();
  await expect(question(page)).toBeDisabled();
  await expect(page.locator(".uploaded-documents")).toHaveCount(0);
  release();
  await expect(page.locator(".uploaded-documents")).toContainText("Police.pdf");
  await question(page).click();
  await expect(page.getByRole("log")).toContainText(answer.answer);
  expect(chatPayload).toMatchObject({ document_ids: ["doc-1"] });
});

test("validates uploads and retries a failed PDF drop", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/upload", route => {
    attempts++;
    return attempts === 1 ? route.fulfill({ status: 503 }) : route.fulfill({ json: { document_id: "doc-2", filename: "Drop.pdf" } });
  });
  await page.goto("/");
  const input = page.getByLabel("PDF auswählen", { exact: true });
  await input.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("text") });
  await expect(page.getByRole("alert")).toContainText("Bitte eine PDF-Datei auswählen");
  await input.setInputFiles({ ...pdf, buffer: Buffer.alloc(0) });
  await expect(page.getByRole("alert")).toContainText("zwischen 1 Byte und 20 MB");
  await input.setInputFiles({ ...pdf, buffer: Buffer.alloc(20 * 1024 * 1024 + 1) });
  await expect(page.getByRole("alert")).toContainText("zwischen 1 Byte und 20 MB");
  expect(attempts).toBe(0);
  const data = await page.evaluateHandle(() => { const transfer = new DataTransfer(); transfer.items.add(new File(["%PDF-1.4"], "Drop.pdf", { type: "application/pdf" })); return transfer; });
  await page.locator(".upload-dropzone").dispatchEvent("drop", { dataTransfer: data });
  await data.dispose();
  await expect(page.getByRole("alert")).toContainText("Anfrage ist fehlgeschlagen");
  await expect(page.locator(".uploaded-documents")).toHaveCount(0);
  await page.getByRole("button", { name: "Upload erneut versuchen" }).click();
  await expect(page.locator(".uploaded-documents")).toContainText("Drop.pdf");
  expect(attempts).toBe(2);
});
