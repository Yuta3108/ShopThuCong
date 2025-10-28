import React, { useEffect, useState } from "react";
import { Home, BarChart3, Settings, Users, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/admin" },
    { name: "User", icon: <Users size={18} />, path: "/admin/users" },
    { name: "Products", icon: <Package size={18} />, path: "/admin/Products" },
    { name: "Reports", icon: <BarChart3 size={18} />, path: "/admin/reports" },
    { name: "Settings", icon: <Settings size={18} />, path: "/admin/settings" },
  ];

  return (
    <div className="w-64 min-h-screen bg-gradient-to-b from-white via-mint-50 to-teal-50 p-5 flex flex-col justify-between shadow-lg border-r border-mint-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-600 mb-8 tracking-wide text-center">
          Admin Dashboard
        </h1>

        {/* Menu */}
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-mint-100 hover:text-teal-700"
                }`}
              >
                <span
                  className={`${
                    isActive ? "text-white" : "text-teal-500"
                  } transition-colors`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
