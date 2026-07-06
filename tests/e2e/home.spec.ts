import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/RiotGraphs/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("tier list page loads", async ({ page }) => {
  await page.goto("/tier-list");
  await expect(page.getByRole("heading", { name: /tier list/i })).toBeVisible();
});
