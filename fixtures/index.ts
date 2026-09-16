import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { ContactsPage } from '../pageobjects/ContactsPage';
import { DomainPage } from '../pageobjects/DomainPage';
import { CartPage } from '../pageobjects/CartPage';

export type Fixtures = {
  loginPage: LoginPage;
  contactsPage: ContactsPage;
  domainPage: DomainPage;
  cartPage: CartPage;
  trackContactCleanup: (email: string) => void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  contactsPage: async ({ page }, use) => {
    const contactsPage = new ContactsPage(page);
    await contactsPage.goto();
    await use(contactsPage);
  },

  domainPage: async ({ page }, use) => {
    await use(new DomainPage(page));
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.clearCart();

    await use(cartPage);

    try {
      await cartPage.goto();
      await cartPage.clearCart();
    } catch (error) {
      console.error('Cleanup (clearCart) failed in fixture teardown:', error);
    }
  },

  trackContactCleanup: async ({ contactsPage }, use) => {
    const emailsToCleanup: string[] = [];
    await use((email: string) => {
      emailsToCleanup.push(email);
    });

    for (const email of emailsToCleanup) {
      try {
        await contactsPage.goto();
        const contactRow = contactsPage.page.locator('tr').filter({ hasText: email });
        const stillExists = (await contactRow.count()) > 0;

        if (stillExists) {
          await contactsPage.deleteContact(email);
        }
      } catch (error) {
        console.error(`Cleanup failed for contact "${email}" in fixture teardown:`, error);
      }
    }
  },
});

export { expect };
