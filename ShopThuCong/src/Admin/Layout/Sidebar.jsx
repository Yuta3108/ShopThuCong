import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  LogOut,
  Package2Icon,
} from "lucide-react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setShowLogout(false);
    navigate("/");
  };

  const menu = [
    { name: "Tổng quan", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Sản phẩm", path: "/admin/products", icon: <ShoppingBag size={18} /> },
    { name: "Categories", path: "/admin/categories", icon: <Package size={18} /> },
    { name: "Đơn hàng", path: "/admin/order", icon: <Tag size={18} /> },
    { name: "Người dùng", path: "/admin/users", icon: <Users size={18} /> },
    { name: "Voucher", path: "/admin/voucher", icon: <Package2Icon size={18} /> },
  ];

  return (
    <>
      {/* MOBILE BUTTON */}
      <button
        onClick={() => toggleSidebar()}
        className="md:hidden fixed top-3 left-3 z-[9999] bg-white/90 backdrop-blur 
                   border border-slate-200 shadow-md rounded-xl p-2 active:scale-95 transition-all"
      >
        <LayoutDashboard size={20} />
      </button>

      {/* SIDEBAR */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 shadow-lg
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-5 flex flex-col h-full">
          {/* LOGO */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/LogoHinh.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <span className="font-semibold text-lg tracking-wide text-slate-800">
              Admin Panel
            </span>
          </div>

          {/* MENU */}
          <nav className="flex-1 space-y-1">
            {menu.map((item, i) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={i}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${
                      active
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                  onClick={() => toggleSidebar(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* LOGOUT */}
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 
                       hover:bg-slate-100 hover:text-slate-900 mt-4"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-72 text-center">
            <p className="font-semibold text-slate-700 mb-4">
              Đăng xuất khỏi hệ thống?
            </p>

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
              >
                Hủy
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
