

export function parsePrice(rawText: string): number {
    const matches = rawText.match(/\$\s?[\d.,]+/g);
    if (!matches || matches.length === 0) {
        throw new Error(`Failed to extract price from: "${rawText}"`);
    }
    const lastMatch = matches[matches.length - 1];
    const cleaned = lastMatch.replace(/[^\d.,]/g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    if (isNaN(value)) {
        throw new Error(`Failed to extract price from: "${lastMatch}"`);
    }
    return value;
}