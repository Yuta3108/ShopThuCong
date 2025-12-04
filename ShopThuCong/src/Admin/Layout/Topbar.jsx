import React, { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 px-4 md:px-6 py-4">
      {/* FLOATING CARD */}
      <div
        className="
        max-w-6xl mx-auto
        bg-white/70 backdrop-blur-xl
        border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.05)]
        rounded-2xl px-5 py-3
        flex items-center justify-between
        transition-all
      "
      >
        {/* LEFT BRAND */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-900 tracking-tight">
            ThenFong Admin
          </span>
        </div>

        {/* RIGHT OPTIONS */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* SEARCH BAR */}
          <div
            className="
            hidden md:flex items-center
            bg-slate-100 hover:bg-slate-200
            px-3 py-2 rounded-2xl w-64
            transition shadow-inner active:scale-[0.98]
          "
          >
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          {/* NOTIFICATION */}
          <button
            className="
            relative hover:bg-slate-200/60
            p-2 rounded-xl transition shadow-sm active:scale-95
          "
          >
            <Bell size={20} className="text-slate-700" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full shadow" />
          </button>

          {/* USER MENU */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="
                flex items-center gap-2
                p-1.5 pr-2 rounded-xl
                hover:bg-slate-200/60 transition active:scale-95
              "
            >
              <img
                src="/logoavatar.png"
                className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-sm"
                alt="Avatar"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="font-semibold text-sm text-slate-900">
                  Admin
                </span>
                <span className="text-xs text-slate-500">Quản trị viên</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-slate-600 transition ${
                  openMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN */}
            {openMenu && (
              <div
                className="
                  absolute right-0 mt-2 w-44
                  bg-white/90 backdrop-blur-lg
                  border border-slate-200/70 shadow-xl
                  rounded-xl py-2 text-sm z-50
                  animate-fadeIn
                "
              >
                <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-lg transition">
                  Hồ sơ của tôi
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-lg transition">
                  Cài đặt
                </button>
                <div className="h-px bg-slate-200 my-1" />

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
