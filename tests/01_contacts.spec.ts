import { test, expect } from '../fixtures';
import { getRandomLetters } from '../utils/randomLetters';

test.describe('Contacts Management', { lock: 'shared-account' }, () => {
    test('CRUD contact', async ({ page, contactsPage, trackContactCleanup }) => {
        const timestamp = Date.now();
        const contactType = `Type${getRandomLetters(6)}`;
        const firstName = 'Fname';
        const updatedFirstName = 'FnameUpdated';
        const lastName = 'Lname';
        const email = `test.qa.${timestamp}@example.com`;
        const phone = '1234567';
        const comment = 'comment';

        trackContactCleanup(email);

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