import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import KPIcard from "../ChucNang/KPIcard";
import LineChart from "../ChucNang/LineChart";
import BarChart from "../ChucNang/BarChart";

export default function DashBoard() {
    const navigate = useNavigate();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== "admin") {
        navigate("/");
        }
    }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPIcard title="Today's Money" value="$53k" badge="+55% than last week" />
          <KPIcard title="Today's Users" value="2,300" badge="+3% than last month" />
          <KPIcard title="New Clients" value="3,462" badge="-2% than yesterday" />
          <KPIcard title="Sales" value="$103,430" badge="+5% than yesterday" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg"><BarChart /></div>
          <div className="bg-gray-800 p-4 rounded-lg"><LineChart /></div>
          <div className="bg-gray-800 p-4 rounded-lg"><LineChart /></div>
        </div>
      </div>
    </div>
  );
}
