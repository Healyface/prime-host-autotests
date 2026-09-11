import { test, expect } from '@playwright/test';
import { DomainPage } from '../pageobjects/DomainPage';
import { CartPage } from '../pageobjects/CartPage';
import { getRandomLetters } from '../utils/randomLetters';

test.describe('Multiple domains add to cart', { lock: 'shared-account' }, () => {
    test.beforeEach(async ({ page }) => {
        const cartPage = new CartPage(page);
        await cartPage.goto();
        await cartPage.clearCart();
    });

    test.afterEach(async ({ page }) => {
        const cartPage = new CartPage(page);
        try {
            await cartPage.goto();
            await cartPage.clearCart();
        } catch (error) {
            console.error('Cleanup (clearCart) failed:', error);
        }
    });

    test('search without TLD, add 3 available domains, verify total', async ({ page }) => {
        const domainPage = new DomainPage(page);
        const cartPage = new CartPage(page);
        const sld = `aqa${getRandomLetters(8).toLowerCase()}`;
        let addedDomains: { name: string; price: number }[] = [];

        await test.step('search domain', async () => {
            await domainPage.goto();
            await domainPage.searchDomain(sld);
        });

        await test.step('add 3 available domains', async () => {
            addedDomains = await domainPage.addNAvailableAndGetPrices(3);
        });

        await test.step('verify total', async () => {
            await cartPage.goto();
            await expect(cartPage.totalRow).toHaveCount(1);
            const totalPrice = await cartPage.getTotalPrice();
            const expectedTotal = addedDomains.reduce((sum, d) => sum + d.price, 0);
            expect(totalPrice).toBeCloseTo(expectedTotal, 2);
        });
    });
});