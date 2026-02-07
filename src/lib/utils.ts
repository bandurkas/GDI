export const formatCurrency = (amountInCents: number) => {
    // Convert cents to whole units
    const units = amountInCents / 100;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(units);
};

export const formatUSD = (amountInCents: number) => {
    const IDR_TO_USD_RATE = 16000;
    // content is in cents, so we divide by 100 to get IDR units
    const amountIDR = amountInCents / 100;
    const amountUSD = amountIDR / IDR_TO_USD_RATE;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amountUSD);
};
