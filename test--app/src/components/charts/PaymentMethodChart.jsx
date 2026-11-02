
import { formatMoney } from "../../utils/formatMoney";

const chartColors = [
    "#72b392",
    "#789ACB",
    "#D5A24C",
    "#A28BC7",
    "#D47F75",
    "#70A9A0",
    "#9A9A9A"
];

function PaymentMethodChart({ transactions, period, currency }) {
    const expenses = transactions.filter(
        (transaction) =>
            ["expense", "expenses"].includes(
                transaction.type?.toLowerCase()
            )
    );

    const methodTotals = expenses.reduce((result, transaction) => {
        const method =
            transaction.method || transaction.paymentMethod || "Other";

        result[method] =
            (result[method] || 0) + Number(transaction.amount || 0);

        return result;
    }, {});

    const sortedMethods = Object.entries(methodTotals)
        .sort((a, b) => b[1] - a[1]);

    const donutTotal = sortedMethods.reduce(
        (sum, item) => sum + item[1],
        0
    );

    const circumference = 2 * Math.PI * 55;

    let donutOffset = 0;

    return (
        <div className="card">
            <div className="card-title">
                <div>
                    <h2>Payment method share</h2>
                    <p>Where your payments come from</p>
                </div>

                <span className="pill">
                    {period === "all" ? "All time" : "Selected period"}
                </span>
            </div>

            <div className="payment-layout">
                <svg className="donut" viewBox="0 0 160 160">
                    {donutTotal > 0 ? (
                        <>
                            <circle
                                cx="80"
                                cy="80"
                                r="55"
                                fill="none"
                                stroke="#E8EEE9"
                                strokeWidth="22"
                            />

                            {sortedMethods.map(([method, amount], index) => {
                                const segment =
                                    (amount / donutTotal) * circumference;

                                const offset = donutOffset;
                                donutOffset += segment;

                                return (
                                    <circle
                                        key={method}
                                        cx="80"
                                        cy="80"
                                        r="55"
                                        fill="none"
                                        stroke={chartColors[index % chartColors.length]}
                                        strokeWidth="22"
                                        strokeDasharray={`${segment} ${circumference - segment}`}
                                        strokeDashoffset={-offset}
                                        transform="rotate(-90 80 80)"
                                    />
                                );
                            })}

                            <text
                                x="80"
                                y="76"
                                textAnchor="middle"
                                fontSize="10"
                                fill="currentColor"
                            >
                                Total spent
                            </text>

                            <text
                                x="80"
                                y="91"
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight="bold"
                                fill="currentColor"
                            >
                                {formatMoney(donutTotal, currency)}
                            </text>
                        </>
                    ) : (
                        <text
                            x="80"
                            y="84"
                            textAnchor="middle"
                            fontSize="12"
                            fill="currentColor"
                        >
                            No data
                        </text>
                    )}
                </svg>

                <div className="payment-legend">
                    {sortedMethods.map(([method, amount], index) => (
                        <div className="payment-row" key={method}>
                            <span className="name">
                                <i
                                    className="dot"
                                    style={{
                                        background: chartColors[index % chartColors.length]
                                    }}
                                />
                                {method}
                            </span>

                            <strong>
                                {donutTotal > 0
                                    ? `${((amount / donutTotal) * 100).toFixed(0)}%`
                                    : "0%"}
                            </strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PaymentMethodChart;
