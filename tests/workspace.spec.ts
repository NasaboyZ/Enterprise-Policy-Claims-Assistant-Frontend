import { expect, test } from "@playwright/test";

test("validates claim inputs and updates the local case summary", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Kundenalter").fill("10");
  await page.getByRole("button", { name: "Daten übernehmen" }).click();
  await expect(page.getByLabel("Kundenalter")).toHaveJSProperty("validity", expect.objectContaining({ valid: false }));
  await expect(page.getByText("Schadensdaten für diese Sitzung übernommen.")).toHaveCount(0);
  await page.getByLabel("Kundenalter").fill("42");
  await page.getByLabel("Schadenssumme CHF").fill("3750");
  await page.getByRole("button", { name: "Daten übernehmen" }).click();
  await expect(page.getByText("Schadensdaten für diese Sitzung übernommen.")).toBeVisible();
  await expect(page.locator(".case-summary")).toContainText("3’750");
});

test("demo chat opens and switches source excerpts, then closes the panel", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Antworten mit Referenz" })).toBeVisible();
  await page.getByRole("button", { name: "Ist der Wasserschaden gedeckt?", exact: true }).click();
  await page.getByRole("button", { name: /Muster-AVB/ }).click();
  await expect(page.locator(".document-page mark")).toContainText("Leitungswasser");
  await expect(page.locator(".document-page")).toContainText("§ 4.2");
  await page.getByRole("button", { name: "Wie hoch ist der Selbstbehalt?", exact: true }).click();
  await page.getByRole("button", { name: /Muster-Police/ }).click();
  await expect(page.locator(".document-page mark")).toContainText("CHF 200");
  await expect(page.locator(".document-page")).toContainText("Selbstbehalt");
  await page.screenshot({ path: testInfo.outputPath("workspace.png"), fullPage: true });
  await page.getByRole("button", { name: "Quelle schließen" }).click();
  await expect(page.getByRole("heading", { name: "Antworten mit Referenz" })).toBeVisible();
});

test("chat supports keyboard sending and all risk previews without backend calls", async ({ page }) => {
  const backendRequests: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/api/")) backendRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Nachricht senden" })).toBeDisabled();
  const input = page.getByLabel("Nachricht an den Schadenassistenten");
  await input.fill("  ");
  await expect(page.getByRole("button", { name: "Nachricht senden" })).toBeDisabled();
  await input.fill("Hallo");
  await input.press("Shift+Enter");
  await expect(input).toHaveValue("Hallo\n");
  await input.press("Enter");
  await expect(input).toHaveValue("");
  await expect(page.getByRole("log")).toContainText("Dies ist eine lokale Chat-Demo");
  for (const [value, label] of [["low", "Geringes Risiko"], ["medium", "Mittleres Risiko"], ["high", "Hohes Risiko"]]) {
    await page.getByLabel("Risiko-Vorschau").selectOption(value);
    await expect(page.locator(".risk-card")).toContainText(label);
    await expect(page.locator(".risk-card")).toContainText("Kein berechnetes ML-Ergebnis");
  }
  expect(backendRequests).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
