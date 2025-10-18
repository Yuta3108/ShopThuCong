import React, { useEffect, useState } from "react";
import { Home, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Sidebar() {
  const [user, setUser] = useState(null);
const navigate = useNavigate();
  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="w-64 min-h-screen bg-white text-gray-200 p-4 flex flex-col justify-between shadow-md">
      {/* Phần menu */}
      <div>
        <h1 className="text-xl font-bold mb-6 text-black">Admin DashBoard</h1>
        <ul className="space-y-3">
          <li className="flex items-center gap-3  cursor-pointer text-black">
            <Home size={18}/> Dashboard
          </li>
          <li className="flex items-center gap-3  cursor-pointer text-black">
            <BarChart3 size={18}/> Reports
          </li>
          <li className="flex items-center gap-3  cursor-pointer text-black">
            <Settings size={18}/> Settings
          </li>
        </ul>
      </div>
    </div>
  );
}
