import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// AXIOS CLIENT (GIỐNG MẤY FILE TRƯỚC)
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function BarChart({ title, type, refreshKey }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosClient.get(
          `/orders/revenue?type=${type}`
        );

        setChartData({
          labels: res.data.labels,
          datasets: [
            {
              data: res.data.values,
              backgroundColor: "#10b981",
              borderRadius: 8,
            },
          ],
        });
      } catch (err) {
        console.error("Fetch bar chart error:", err);
      }
    };

    fetchData();
  }, [type, refreshKey]);

  if (!chartData) {
    return <p className="text-slate-400">Loading...</p>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        Biểu đồ cột
      </p>

      <div className="flex-1 min-h-[240px]">
        <Bar
          data={chartData}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: { color: "#475569" },
                grid: { display: false },
              },
              y: {
                ticks: {
                  color: "#475569",
                  callback: (v) =>
                    new Intl.NumberFormat("vi-VN").format(v),
                },
                grid: { color: "#e5e7eb" },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
