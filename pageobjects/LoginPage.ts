import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByLabel('email');
        this.passwordInput = page.getByLabel('password');
        this.loginButton = page.locator('form').getByRole('button', { name: 'Login' })
    }

    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }
}