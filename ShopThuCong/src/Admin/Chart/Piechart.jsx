import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

const STATUS_LABEL = {
  completed: "Hoàn thành",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  cancelled: "Đã huỷ",
  pending: "Chờ xử lý",
};
const STATUS_COLOR = {
  completed: "#22c55e",
  processing: "#fbbf24",
  shipping: "#3b82f6",
  pending: "#6366f1",
  cancelled: "#ef4444",
};
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function PieChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {

    const fetchStatistic = async () => {
      try {
        const res = await axiosClient.get(
          "/orders/statistic-by-status"
        );

        const labels = res.data.data.map(
      (i) => STATUS_LABEL[i.Status] || i.Status
      );
        const values = res.data.data.map(i => i.Total);

        const colors = res.data.data.map(
          i => STATUS_COLOR[i.Status] || "#94a3b8"
        );

        setChartData({
          labels,
          datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
        });
      } catch (err) {
        console.error("Fetch statistic error:", err);
      }
    };
    
    fetchStatistic();
    const interval = setInterval(() => {
    fetchStatistic();
  }, 5000); 

  return () => clearInterval(interval);
  }, []);
  
  if (!chartData) {
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <div className="h-full">
      <Pie
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#475569",
              },
            },
          },
        }}
      />
    </div>
  );
}
