import React, { useEffect, useState } from "react";
import { Home, Users, Package, Menu, X, ParkingCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false); 
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/admin" },
    { name: "Người dùng", icon: <Users size={18} />, path: "/admin/users" },
    { name: "Sản phẩm", icon: <Package size={18} />, path: "/admin/Products" },
    { name: "Voucher", icon: <ParkingCircle size={18} />, path: "/admin/Voucher" },
  ];

  return (
    <>
      <aside className="hidden md:flex w-64 min-h-screen bg-gradient-to-b from-white via-mint-50 to-teal-50 p-5 flex-col justify-between shadow-lg border-r border-mint-100 animate-slideIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-teal-600 mb-6 tracking-wide text-center">
            Admin Dashboard
          </h1>
          {user && (
            <div className="flex flex-col items-center mb-8">
              <img
                src="/LogoHinh.png"
                alt="avatar"
                className="w-14 h-14 rounded-full border-2 border-teal-400 mb-2"
              />
              <p className="text-sm font-medium text-gray-700">
                {user.name || user.email || "Admin"}
              </p>
            </div>
          )}
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
        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} Then Fong Store
        </p>
      </aside>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 bg-white border border-gray-200 shadow-md rounded-lg p-2 text-gray-700 hover:text-teal-600 transition-all"
      >
        <Menu size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-64 h-full bg-white shadow-2xl border-r border-gray-100 p-5 flex flex-col justify-between animate-slideIn">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-teal-600">
                  Admin Panel
                </h1>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-600 hover:text-teal-600"
                >
                  <X size={22} />
                </button>
              </div>
              {user && (
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src="/LogoHinh.png"
                    alt="avatar"
                    className="w-10 h-10 rounded-full border border-teal-300"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {user.name || user.email || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">Quản trị viên</p>
                  </div>
                </div>
              )}
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setOpen(false)}
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
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </ul>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 mt-8 text-center bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
