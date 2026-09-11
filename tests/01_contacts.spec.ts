import { test, expect } from '@playwright/test';
import { ContactsPage } from '../pageobjects/ContactsPage';
import { getRandomLetters } from '../utils/randomLetters';

test.describe('Contacts Management', { lock: 'shared-account' }, () => {
    let contactsPage: ContactsPage;
    let emailToCleanup: string | undefined;

    test.beforeEach(async ({ page }) => {
        contactsPage = new ContactsPage(page);
        await contactsPage.goto();
    });

    test.afterEach(async () => {
        if (!emailToCleanup) return;

        try {
            await contactsPage.goto();
            const contactRow = contactsPage.page.locator('tr').filter({ hasText: emailToCleanup });
            const stillExists = await contactRow.count() > 0;

            if (stillExists) {
                await contactsPage.deleteContact(emailToCleanup);
            }
        } catch (error) {
            console.error(`Cleanup failed for contact "${emailToCleanup}":`, error);
        } finally {
            emailToCleanup = undefined;
        }
    });

    test('CRUD contact', async ({ page }) => {
        const timestamp = Date.now();
        const contactType = `Type${getRandomLetters(6)}`;
        const firstName = 'Fname';
        const updatedFirstName = 'FnameUpdated';
        const lastName = 'Lname';
        const email = `test.qa.${timestamp}@example.com`;
        const phone = '1234567';
        const comment = 'comment';
        emailToCleanup = email;

        await test.step('create contact', async () => {
            await contactsPage.createContact(firstName, lastName, email, contactType, phone, comment);
            await expect(page.getByText(email)).toBeVisible();
        });

        await test.step('edit contact', async () => {
            await contactsPage.editContact(email, updatedFirstName, true);
            await contactsPage.clickEditForContact(email);
            await expect(contactsPage.firstNameInput).toHaveValue(updatedFirstName);
            await contactsPage.verifyCheckboxState(false);
        });

        await test.step('delete contact', async () => {
            await contactsPage.goto();
            await contactsPage.deleteContact(email);
            await expect(page.getByText(email)).not.toBeVisible();
        });
    });
});