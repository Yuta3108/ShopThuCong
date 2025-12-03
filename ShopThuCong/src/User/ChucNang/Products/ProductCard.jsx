import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p, onQuickView }) {
  const isActive = p.IsActive === 1;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-[2px] transition-all duration-200 flex flex-col p-3 relative">
      {/* BADGE HẾT HÀNG */}
      {!isActive && (
        <span className="absolute top-2 left-2 bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md z-10 shadow">
          Hết hàng
        </span>
      )}

      {/* ẢNH */}
      <Link
        to={isActive ? `/chi-tiet/${p.ProductID}` : "#"}
        className={isActive ? "" : "pointer-events-none opacity-70"}
      >
        <div className="rounded-xl overflow-hidden mb-3 bg-slate-50">
          <img
            src={p.ImageURL}
            alt={p.ProductName}
            className="h-40 w-full object-cover transform group-hover:scale-[1.04] transition-transform duration-300"
          />
        </div>
      </Link>

      {/* TÊN */}
      <p className="font-medium text-slate-900 text-sm line-clamp-2 flex-grow">
        {p.ProductName}
      </p>

      {/* GIÁ */}
      <p className="text-rose-500 font-bold text-base mt-2">
        {Number(p.minPrice).toLocaleString()}₫
        {p.maxPrice > p.minPrice && (
          <>
            {" "}
            - {Number(p.maxPrice).toLocaleString()}₫
          </>
        )}
      </p>

      {/* NÚT → MỞ POPUP */}
      {isActive ? (
        <button
          onClick={() => onQuickView(p)}
          className="mt-3 w-full py-2.5 
             bg-white 
             border border-slate-200 
             text-slate-900 font-semibold text-sm
             rounded-xl 
             hover:bg-slate-50 hover:border-rose-400
             transition-all"
        >
          Thêm vào giỏ hàng
        </button>
      ) : (
        <button
          disabled
          className="mt-3 w-full py-2.5 
             bg-slate-200 text-slate-500 
             rounded-xl text-sm font-medium
             cursor-not-allowed"
        >
          Ngưng bán
        </button>
      )}
    </div>
  );
}
