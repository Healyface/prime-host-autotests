import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';

const authFile = 'playwright/.auth/storage-state.json';

setup('authenticate user', async ({ page }) => {
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Відсутні обов'язкові USER_EMAIL та/або USER_PASSWORD. " +
      'Перевірте файл .env (створіть його з .env.example, якщо ще не створено).'
    );
  }

  const loginPage = new LoginPage(page);

  await page.goto('/login');
  await loginPage.login(email, password);

  await page.waitForURL('**/domains');
  await page.context().storageState({ path: authFile });
});