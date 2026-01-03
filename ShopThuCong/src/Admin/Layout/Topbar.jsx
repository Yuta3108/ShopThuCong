import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

/* ================= AXIOS CLIENT ================= */
const axiosClient = axios.create({
  baseURL: "https://backend-eta-ivory-29.vercel.app/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Topbar() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);

  
  const [lastOrderId, setLastOrderId] = useState(null);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  /* LOGOUT  */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  /* CHECK NEW ORDER*/
  useEffect(() => {
    let mounted = true;

    const checkNewOrder = async () => {
      try {
        const res = await axiosClient.get("/orders/lastest");
        const currentId = res.data.orderId;

        if (!mounted || !currentId) return;

       
        if (lastOrderId === null) {
          setLastOrderId(currentId);
          return;
        }

        //  CÓ ĐƠN MỚI
        if (currentId > lastOrderId) {
          const diff = currentId - lastOrderId;

          setHasNewOrder(true);
          setNewOrderCount((prev) => prev + diff);

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Có đơn hàng mới đã được đặt!",
            text: `Có ${diff} đơn hàng mới`,
            showConfirmButton: false,
            timer: 3000,
          });

          setLastOrderId(currentId);
        }
      } catch (err) {
        console.error("Check new order error:", err);
      }
    };

    checkNewOrder();
    const interval = setInterval(checkNewOrder, 5000); // 5s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [lastOrderId]);

  return (
    <header className="sticky top-0 z-40 px-4 md:px-6 py-4">
      <div
        className="
          max-w-6xl mx-auto
          bg-white/70 backdrop-blur-xl
          border border-slate-200/70
          shadow-[0_4px_20px_rgba(0,0,0,0.05)]
          rounded-2xl px-5 py-3
          flex items-center justify-between
        "
      >
        {/* LEFT */}
        <span className="text-lg font-semibold text-slate-900">
          ThenFong Admin
        </span>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/*NOTIFICATION */}
          <button
            onClick={() => {
              setHasNewOrder(false);
              setNewOrderCount(0);
            }}
            className="
              relative hover:bg-slate-200/60
              p-2 rounded-xl transition
              active:scale-95
            "
          >
            <Bell size={20} className="text-slate-700" />

            {newOrderCount > 0 && (
              <span
                className="
                  absolute -top-1 -right-1
                  min-w-[18px] h-[18px]
                  px-1
                  bg-rose-500 text-white
                  text-[11px] font-bold
                  rounded-full
                  flex items-center justify-center
                  shadow
                "
              >
                {newOrderCount}
              </span>
            )}
          </button>

          {/* USER MENU */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="
                flex items-center gap-2
                p-1.5 pr-2 rounded-xl
                hover:bg-slate-200/60 transition
              "
            >
              <img
                src="/logoavatar.png"
                alt="Avatar"
                className="w-9 h-9 rounded-full border"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-sm">Admin</span>
                <span className="text-xs text-slate-500">Quản trị viên</span>
              </div>
              <ChevronDown
                size={18}
                className={`transition ${openMenu ? "rotate-180" : ""}`}
              />
            </button>

            {openMenu && (
              <div
                className="
                  absolute right-0 mt-2 w-44
                  bg-white/90 backdrop-blur-lg
                  border border-slate-200
                  shadow-xl rounded-xl py-2 text-sm
                "
              >
                <Link
                  to="/User"
                  className="block px-4 py-2 hover:bg-slate-100 rounded-lg"
                >
                  Hồ sơ của tôi
                </Link>

                <button className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-lg">
                  Cài đặt
                </button>

                <div className="h-px bg-slate-200 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg"
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
