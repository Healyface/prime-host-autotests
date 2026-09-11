import { Locator, Page, expect } from '@playwright/test';

export class ContactsPage {
    readonly page: Page;
    readonly addContactButton: Locator;
    readonly contactTypeInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly emailInput: Locator;
    readonly phonePrefixDropdown: Locator;
    readonly countryUkraineOption: Locator;
    readonly phoneNumberInput: Locator;
    readonly commentInput: Locator;
    readonly supportCheckbox: Locator;
    readonly promoCheckbox: Locator;
    readonly productCheckbox: Locator;
    readonly financialCheckbox: Locator;
    readonly createButton: Locator;
    readonly saveButton: Locator;
    readonly confirmDeleteButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addContactButton = page.getByRole('button', { name: '+ Add New Contact' });
        this.contactTypeInput = page.locator('div.relative', { hasText: 'Contact type/NAME' }).locator('input');
        this.firstNameInput = page.locator('div.relative', { hasText: 'FIRST NAME' }).locator('input');
        this.lastNameInput = page.locator('div.relative', { hasText: 'LAST NAME' }).locator('input');
        this.emailInput = page.locator('div.relative', { hasText: 'EMAIL' }).locator('input');
        this.phonePrefixDropdown = page.locator('.vue-country-select, .dropdown-flag');
        this.countryUkraineOption = page.locator('li[data-iso="ua"]');
        this.phoneNumberInput = page.locator('div.relative', { hasText: 'PHONE NUMBER' }).locator('input');
        this.commentInput = page.locator('div.relative', { hasText: 'Comment (optional)' }).locator('input');
        this.supportCheckbox = page.getByRole('checkbox', { name: /support requests/i });
        this.promoCheckbox = page.getByRole('checkbox', { name: /promotional emails/i });
        this.productCheckbox = page.getByRole('checkbox', { name: /product emails/i });
        this.financialCheckbox = page.getByRole('checkbox', { name: /financial emails/i });
        this.createButton = page.getByRole('button', { name: 'Create' });
        this.saveButton = page.getByRole('button', { name: 'Save' });
        this.confirmDeleteButton = page.getByRole('button', { name: 'OK' });
    }

    async goto() {
        await this.page.goto('/contacts');
        await this.page.waitForURL('**/contacts');
    }

    async createContact(firstName: string, lastName: string, email: string, contactType: string, phone: string, comment: string) {
        await this.addContactButton.click();
        await this.contactTypeInput.fill(contactType);
        await this.firstNameInput.fill(firstName);
        await this.lastNameInput.fill(lastName);
        await this.emailInput.fill(email);

        await this.phonePrefixDropdown.click();
        await this.countryUkraineOption.click();
        await this.phoneNumberInput.fill(phone);
        await this.commentInput.fill(comment);

        await this.supportCheckbox.setChecked(true, { force: true });
        await this.promoCheckbox.setChecked(true, { force: true });
        await this.productCheckbox.setChecked(true, { force: true });
        await this.financialCheckbox.setChecked(true, { force: true });

        await this.createButton.click();

        await this.page.waitForURL('**/contacts');
    }

    getContactRow(email: string): Locator {
        return this.page.locator('tr', { hasText: email });
    }

    async clickEditForContact(email: string) {
        const row = this.getContactRow(email);
        const editButton = row.locator('button').first();

        await editButton.waitFor({ state: 'visible', timeout: 5000 });
        await editButton.click();

        await expect(this.firstNameInput).not.toHaveValue('', { timeout: 10000 });
    }

    async editContact(email: string, updatedFirstName: string, uncheckPromotional: boolean = false) {
        await this.clickEditForContact(email);

        await this.firstNameInput.click();
        await this.firstNameInput.press('Control+A');
        await this.firstNameInput.press('Backspace');
        await this.firstNameInput.fill(updatedFirstName);

        await expect(this.firstNameInput).toHaveValue(updatedFirstName);

        if (uncheckPromotional && await this.promoCheckbox.isChecked()) {
            await this.page.getByText('Send promotional emails', { exact: false }).click();
        }

        await Promise.all([
            this.page.waitForResponse(resp =>
                /\/contacts/.test(resp.url()) &&
                ['PUT', 'PATCH', 'POST'].includes(resp.request().method())
            ),
            this.saveButton.click(),
        ]);
        await this.page.waitForURL('**/contacts');
    }

    async clickDeleteForContact(email: string) {
        const row = this.getContactRow(email);
        await row.getByRole('button').last().click();
    }

    async deleteContact(email: string) {
        const row = this.getContactRow(email);
        const deleteButton = row.locator('button').last();
        await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
        await this.clickDeleteForContact(email);
        await this.confirmDeleteButton.click();
    }

    async verifyCheckboxState(isPromoChecked: boolean) {
        if (isPromoChecked) {
            await expect(this.promoCheckbox).toBeChecked();
        } else {
            await expect(this.promoCheckbox).not.toBeChecked();
        }
    }
}