import { test as setup, expect } from '../fixtures';

const authFile = 'playwright/.auth/storage-state.json';

setup('authenticate user', async ({ page, loginPage }) => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing required USER_EMAIL and/or USER_PASSWORD. " +
      "Check the .env file (create it from .env.example if you haven't already)."
    );
  }

  await page.goto('/login');
  await loginPage.login(email, password);

  await page.waitForURL('**/domains');
  await page.context().storageState({ path: authFile });
});