export const formatMoney = (amount, currency = "MYR") => {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
};