import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  ...config,
  testDir: "./checks",
  projects: [{ name: "live", use: { ...config.projects?.[0].use, channel: "chrome" } }],
  workers: 1,
});
