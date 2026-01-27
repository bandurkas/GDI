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
