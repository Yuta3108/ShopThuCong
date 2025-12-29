import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

// ================= AXIOS CLIENT =================
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function LineChart({ refreshKey }) {
  const [chartData, setChartData] = useState(null);

  // ================= FETCH DATA =================
  const fetchRevenue = async () => {
    try {
      const res = await axiosClient.get("/orders/revenue-by-month");

      const labels = res.data.data.map((i) => {
        const [year, month] = i.month.split("-");
        return `Tháng ${month}/${year}`;
      });

      const values = res.data.data.map((i) => Number(i.revenue) || 0);

      setChartData({
        labels,
        datasets: [
          {
            label: "Doanh thu",
            data: values,
            borderColor: "#10b981",
            backgroundColor: "#10b98133",
            tension: 0.4,
            pointRadius: 4,
            pointBorderWidth: 2,
            fill: true,
          },
        ],
      });
    } catch (err) {
      console.error("Fetch revenue error:", err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [refreshKey]);

  if (!chartData) {
    return <p className="text-slate-400">Loading...</p>;
  }

  return (
    <Line
      data={chartData}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${new Intl.NumberFormat("vi-VN").format(ctx.raw)} ₫`,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#475569" },
            grid: { display: false },
          },
          y: {
            ticks: {
              color: "#475569",
              callback: (value) =>
                new Intl.NumberFormat("vi-VN").format(value),
            },
            grid: { color: "#e5e7eb" },
          },
        },
      }}
    />
  );
}
