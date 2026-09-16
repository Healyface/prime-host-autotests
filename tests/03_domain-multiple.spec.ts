import { test, expect } from '../fixtures';
import { getRandomLetters } from '../utils/randomLetters';

test.describe('Multiple domains add to cart', { lock: 'shared-account' }, () => {
    test('search without TLD, add 3 available domains, verify total', async ({ domainPage, cartPage }) => {
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