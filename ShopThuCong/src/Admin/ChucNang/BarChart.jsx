import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function BarChart() {
  const data = {
    labels: ["M","T","W","T","F","S","S"],
    datasets: [
      {
        label: "Website Views",
        data: [45, 20, 12, 18, 40, 32, 36],
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  };
  return (
    <div>
      <h4 className="text-sm text-black mb-2">Website Views</h4>
      <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false }}}} />
    </div>
  );
}
