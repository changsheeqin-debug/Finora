
import { useEffect, useRef, useState } from "react";
import { formatMoney } from "../../utils/formatMoney";

const chartColors = [
    "#4D8565",
    "#789ACB",
    "#D5A24C",
    "#A28BC7",
    "#D47F75",
    "#70A9A0",
    "#9A9A9A"
];

function CategoryChart({ transactions, currency, period }) {
    const categoryTotals = transactions
        .filter(
            (transaction) =>
                ["expense", "expenses"].includes(
                    transaction.type?.toLowerCase()
                )
        )
        .reduce((result, transaction) => {
            const category = transaction.category;

            result[category] =
                (result[category] || 0) + Number(transaction.amount || 0);

            return result;
        }, {});

    const chartCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxAmount = Math.max(
        ...chartCategories.map((item) => item[1]),
        1
    );

    const chartRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(600);

    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            setChartWidth(entry.contentRect.width);
        });

        if (chartRef.current) {
            observer.observe(chartRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="card">
            <div className="card-title">
                <div>
                    <h2>Spending by category</h2>
                    <p>
                        {period === "all"
                            ? "All recorded expenses by category"
                            : "Expenses by category for selected month"}
                    </p>
                </div>
            </div>

            <div className="chart-wrap" ref={chartRef}>
                {chartCategories.length > 0 ? (
                <svg viewBox="0 0 600 230">
                    {chartCategories.map(([category, amount], index) => {
                        const y = 12 + index * 43;

                        const availableWidth = chartWidth - 210;
                        const maxBarWidth = Math.min(Math.max(availableWidth, 180), 320);
                        const barWidth = Math.max(
                            (amount / maxAmount) * maxBarWidth,
                            8
                        );

                        return (
                            <g key={category}>
                                <text
                                    x="0"
                                    y={y + 12}
                                    fontSize="12"
                                    fill="currentColor"
                                >
                                    {category.length > 25
                                        ? `${category.slice(0, 25)}…`
                                        : category}
                                </text>

                                <rect
                                    x="160"
                                    y={y}
                                    width={barWidth}
                                    height="19"
                                    rx="5"
                                    fill={chartColors[index % chartColors.length]}
                                />

                                <text
                                    x="585"
                                    y={y + 14}
                                    fontSize="11"
                                    fill="currentColor"
                                    textAnchor="end"
                                >
                                    {formatMoney(amount, currency)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                ) : (
                    <div className="empty">
                        No expense data available yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryChart;
