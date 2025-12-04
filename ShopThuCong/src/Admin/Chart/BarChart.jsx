import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function BarChart() {
  const data = {
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: [
      {
        label: "Visitors",
        data: [500, 640, 720, 590, 880, 760, 820, 900],
        backgroundColor: "#10b981",
        borderRadius: 8,
      },
    ],
  };

  return (
    <Bar
      data={data}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#475569" }, grid: { display: false } },
          y: { ticks: { color: "#475569" }, grid: { color: "#e5e7eb" } },
        },
      }}
    />
  );
}
