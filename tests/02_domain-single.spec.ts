import { test, expect } from '../fixtures';
import { getRandomLetters } from '../utils/randomLetters';

const tlds = ['.com', '.net', '.org'];
const sld = `aqa${getRandomLetters(8).toLowerCase()}`;

test.describe('Single domain add to cart', { lock: 'shared-account' }, () => {
    for (const tld of tlds) {
        test(`search and add domain (${tld}) to cart, verify total`, async ({ domainPage, cartPage }) => {
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
                expect(totalPrice).toBeCloseTo(searchPrice, 2);
            });
        });
    }
});