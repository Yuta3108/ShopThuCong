import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function LineChart() {
  const data = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: [
      {
        label: "Sales",
        data: [100, 150, 400, 350, 500, 420, 460, 600],
        borderColor: "#10b981",
        backgroundColor: "#10b98133",
        tension: 0.45,
        pointRadius: 4,
        pointBorderWidth: 2,
      },
    ],
  };

  return (
    <Line
      data={data}
      options={{
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#475569" }, grid: { display: false } },
          y: { ticks: { color: "#475569" }, grid: { color: "#e5e7eb" } },
        },
      }}
    />
  );
}
