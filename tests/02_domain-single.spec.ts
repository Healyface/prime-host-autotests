import { test, expect } from '@playwright/test';
import { DomainPage } from '../pageobjects/DomainPage';
import { CartPage } from '../pageobjects/CartPage';
import { getRandomLetters } from '../utils/randomLetters';

const tlds = ['.com', '.net', '.org'];
const sld = `aqa${getRandomLetters(8).toLowerCase()}`;

test.describe('Single domain add to cart', { lock: 'shared-account' }, () => {
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

    for (const tld of tlds) {
        test(`search and add domain (${tld}) to cart, verify total`, async ({ page }) => {
            const domainPage = new DomainPage(page);
            const cartPage = new CartPage(page);
            const domainName = `${sld}${tld}`;

            let searchPrice: number;

            await test.step(`search and add ${domainName} to cart`, async () => {
                await domainPage.goto();
                await domainPage.searchDomain(domainName);
                searchPrice = await domainPage.addToCartAndGetPrice(domainName);
            });

            await test.step('verify total', async () => {
                await cartPage.goto();
                await expect(cartPage.totalRow).toHaveCount(1);
                const totalPrice = await cartPage.getTotalPrice();
                // console.log(`Search price: ${searchPrice}, Cart total: ${totalPrice}`);
                expect(totalPrice).toBeCloseTo(searchPrice, 2);
            });
        });
    }
});