import { Locator, Page, expect } from '@playwright/test';
import { parsePrice } from '../utils/priceUtils';

export class DomainPage {
    readonly page: Page;
    readonly domainSearchInput: Locator;
    readonly agreeButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.domainSearchInput = page.getByPlaceholder('Enter domain name or keyword');
        this.agreeButton = page.getByRole('button', { name: 'I AGREE, ADD DOMAIN TO CART' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/register-domain');
    }

    async searchDomain(domainName: string): Promise<void> {
        const priceResponsePromise = this.page.waitForResponse(
            (response) =>
                response.url().includes('price?chunk_seq=1') && response.status() === 200
        );

        await this.domainSearchInput.fill(domainName);
        await this.page.keyboard.press('Enter');
        await priceResponsePromise;
    }

    // контейнер, де є і точна назва домену, і кнопка "Add to cart"
    private resultRow(domainName: string): Locator {
        return this.page
            .getByRole('listitem')
            .filter({
                has: this.page.locator('.domain-name').getByText(domainName, { exact: true }),
            });
    }

    // Клік "Add to cart" та повернення ціни
    async addToCartAndGetPrice(domainName: string): Promise<number> {
    const row = this.resultRow(domainName);
    await row.waitFor({ state: 'visible' });

    const addButton = row.getByRole('button', { name: 'Add to cart', exact: true });
    const isAvailable = await addButton.isVisible().catch(() => false);
    if (!isAvailable) {
        throw new Error(`Домен ${domainName} недоступний для реєстрації (можливо, вже зайнятий).`);
    }

    const priceText = await row.locator('.text-sm.font-medium span').innerText();
    const price = parsePrice(priceText);

    const cartUpdatedPromise = this.page.waitForResponse(
        (response) => response.url().includes('cart-domain-registered-list') && response.status() === 200
    );

    await addButton.click();

    // обробка модалки (наприклад для .net)
    const modalAppeared = await this.agreeButton
        .waitFor({ state: 'visible', timeout: 2000 })
        .then(() => true)
        .catch(() => false);

    if (modalAppeared) {
        await this.agreeButton.click();
    }

    const cartResponse = await cartUpdatedPromise;
    const cartData = await cartResponse.json();
    expect(cartData.data.domains).toContain(domainName);

    return price;
}

    async addNAvailableAndGetPrices(n: number): Promise<{ name: string; price: number }[]> {
    const availableRows = this.page
        .getByRole('listitem')
        .filter({ has: this.page.getByRole('button', { name: 'Add to cart', exact: true }) });

    await expect(availableRows.first()).toBeVisible();

    const results: { name: string; price: number }[] = [];

    for (let i = 0; i < n; i++) {
        const row = availableRows.first();

        const nameText = await row.locator('.domain-name').innerText();
        const domainName = nameText.trim();

        const priceText = await row.locator('.text-sm.font-medium span').innerText();
        const price = parsePrice(priceText);

        const cartUpdatedPromise = this.page.waitForResponse(
            (response) => response.url().includes('cart-domain-registered-list') && response.status() === 200
        );

        await row.getByRole('button', { name: 'Add to cart', exact: true }).click();

        // обробка модалки (наприклад для .net)
        const modalAppeared = await this.agreeButton
            .waitFor({ state: 'visible', timeout: 2000 })
            .then(() => true)
            .catch(() => false);

        if (modalAppeared) {
            await this.agreeButton.click();
        }

        await cartUpdatedPromise;

        results.push({ name: domainName, price });
    }

    return results;
}
}