import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p, addToCart }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition relative flex flex-col p-3">

      {/* BADGE HẾT HÀNG */}
      {p.IsActive === 0 && (
        <span className="absolute top-2 left-2 bg-gray-900 text-white text-[11px] px-2 py-1 rounded-md z-10 shadow">
          Hết hàng
        </span>
      )}

      {/* ẢNH */}
      <Link
        to={p.IsActive === 1 ? `/chi-tiet/${p.ProductID}` : "#"}
        className={`${p.IsActive === 0 ? "pointer-events-none opacity-60" : ""}`}
      >
        <img
          src={p.ImageURL}
          className="rounded-md h-40 w-full object-cover mb-3 group-hover:scale-105 transition duration-300"
        />
      </Link>

      {/* TÊN */}
      <p className="font-medium text-gray-800 text-sm line-clamp-2 flex-grow">
        {p.ProductName}
      </p>

      {/* GIÁ */}
      <p className="text-pink-600 font-bold text-base mt-2">
        {Number(p.minPrice).toLocaleString()}₫
        {p.maxPrice > p.minPrice && (
          <> - {Number(p.maxPrice).toLocaleString()}₫</>
        )}
      </p>

      {/* NÚT GIỎ HÀNG — ĐẶT DƯỚI CÙNG */}
      {p.IsActive === 1 ? (
        <button
          onClick={() => addToCart(p)}
          className="mt-auto w-full py-2.5 
             bg-white 
             border border-gray-300 
             text-gray-800 font-semibold text-sm
             rounded-lg 
             hover:bg-gray-100 hover:border-gray-400
             transition-all"
        >
          Thêm vào giỏ hàng
        </button>
      ) : (
        <button
          disabled
          className="mt-auto w-full py-2.5 
             bg-gray-200 text-gray-500 
             rounded-lg text-sm font-medium
             cursor-not-allowed"
        >
          Ngưng bán
        </button>
      )}
    </div>
  );
}
