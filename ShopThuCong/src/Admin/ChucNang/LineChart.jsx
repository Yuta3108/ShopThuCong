import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function LineChart() {
  const data = {
    labels: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
      {
        label: "Sales",
        data: [100, 150, 400, 350, 500, 420, 460, 380, 600],
        borderColor: "#10b981",
        backgroundColor: "#10b98130",
        tension: 0.4,
      },
    ],
  };
  return (
    <div>
      <h4 className="text-sm text-gray-300 mb-2">Sales Trend</h4>
      <Line data={data} options={{ responsive: true, plugins: { legend: { display: false }}}} />
    </div>
  );
}
