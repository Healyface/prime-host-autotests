import { Locator, Page, expect } from '@playwright/test';
import { parsePrice } from '../utils/priceUtils';

export class CartPage {
    readonly page: Page;
    readonly totalRow: Locator;
    readonly checkoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.totalRow = page.locator('div', { hasText: /^TOTAL:\s*\$/ }).last();
        this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    }

    async goto(): Promise<void> {
        await this.page.goto('/cart');
    }

    async getTotalPrice(): Promise<number> {
        const text = await this.totalRow.innerText();
        return parsePrice(text);
    }

    private row(domainName: string): Locator {
        return this.page
            .locator('tr.va-data-table__table-tr')
            .filter({ hasText: domainName });
    }

    async removeItem(domainName: string): Promise<void> {
        const targetRow = this.row(domainName);
        await expect(targetRow).toHaveCount(1);
        await targetRow.getByRole('button').last().click();
        await expect(targetRow).toHaveCount(0);
    }

    async hasItem(domainName: string): Promise<boolean> {
        return this.row(domainName)
            .waitFor({ state: 'visible', timeout: 2000 })
            .then(() => true)
            .catch(() => false);
    }

    async clearCart(): Promise<void> {
        await Promise.race([
            this.page.getByText('Cart is empty').waitFor({ state: 'visible' }),
            this.page.getByRole('row', { name: /Register/ }).first().waitFor({ state: 'visible' }),
        ]).catch(() => { });

        const rows = this.page.getByRole('row', { name: /Register/ });
        let count = await rows.count();

        while (count > 0) {
            await rows.first().locator('button').click();
            await expect(rows).toHaveCount(count - 1, { timeout: 10000 });
            count = await rows.count();
        }
    }
}