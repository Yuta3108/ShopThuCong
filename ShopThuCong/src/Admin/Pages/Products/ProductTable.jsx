import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

// Format tiền sạch đẹp
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  if (loading)
    return (
      <p className="text-center text-slate-500 py-10 text-sm sm:text-base">
        Đang tải dữ liệu…
      </p>
    );

  if (!products.length)
    return (
      <p className="text-center text-slate-500 py-10 text-sm sm:text-base">
        Không tìm thấy sản phẩm.
      </p>
    );

  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full">

      {/* ============= MOBILE CARD LIST ============= */}
      <div className="grid grid-cols-1 md:hidden gap-4 mb-6">
        {currentProducts.map((p, idx) => (
          <div
            key={p.ProductID}
            className="bg-white p-4 rounded-xl shadow border hover:shadow-md transition"
          >
            {/* IMAGE + TITLE */}
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 shadow-sm">
                {p.ImageURL ? (
                  <img
                    src={p.ImageURL}
                    alt="image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                    No img
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-sm">
                  {p.ProductName}
                </h3>
                <p className="text-xs text-slate-500">Mã: {p.ProductCode}</p>
                <p className="text-xs text-slate-500">
                  Danh mục: {p.CategoryName || "—"}
                </p>
              </div>
            </div>

            {/* PRICE + STATUS */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-teal-700 font-semibold text-sm">
                {p.minPrice ? formatMoney(p.minPrice) + "₫" : "—"}
              </span>

              {p.IsActive ? (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  Đang bán
                </span>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 shadow-sm">
                  Ngừng bán
                </span>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onEdit(p.ProductID)}
                className="flex-1 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 flex justify-center items-center gap-1"
              >
                <Pencil size={16} />
                Sửa
              </button>

              <button
                onClick={() => onDelete(p.ProductID)}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 flex justify-center items-center gap-1"
              >
                <Trash2 size={16} />
                Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============= DESKTOP TABLE ============= */}
      <div className="hidden md:block overflow-x-auto rounded-2xl bg-white border shadow-md">
        <table className="min-w-full text-[13px] text-slate-700">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm rounded-t-2xl">
              <th className="px-4 py-3 text-left rounded-tl-2xl">Ảnh</th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Mã SP</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Danh mục</th>
              <th className="px-4 py-3 text-center hidden sm:table-cell">
                Giá thấp nhất
              </th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center rounded-tr-2xl">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((p, idx) => (
              <tr
                key={p.ProductID}
                className={`border-b transition-all ${
                  idx % 2 ? "bg-slate-50" : "bg-white"
                } hover:bg-teal-50/60`}
              >
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100 shadow-sm">
                    {p.ImageURL ? (
                      <img
                        src={p.ImageURL}
                        alt="cover"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No img
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 font-semibold text-center text-slate-800">
                  {(currentPage - 1) * productsPerPage + idx + 1}
                </td>

                <td className="px-4 py-3 font-medium">{p.ProductCode}</td>

                <td className="px-4 py-3 font-medium">{p.ProductName}</td>

                <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                  {p.CategoryName || "—"}
                </td>

                <td className="px-4 py-3 text-center text-teal-700 font-semibold hidden sm:table-cell">
                  {p.minPrice ? formatMoney(p.minPrice) + "₫" : "—"}
                </td>

                <td className="px-4 py-3 text-center">
                  {p.IsActive ? (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200 shadow-sm">
                      Đang bán
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200 shadow-sm">
                      Ngừng bán
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(p.ProductID)}
                      className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition shadow-sm text-yellow-700"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(p.ProductID)}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition shadow-sm text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* ============= PAGINATION ============= */}
      <div className="flex justify-center items-center gap-2 py-4 select-none">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg border text-sm transition ${
            currentPage === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
              : "text-teal-600 border-teal-300 hover:bg-teal-50 hover:border-teal-400"
          }`}
        >
          ← Trước
        </button>

        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold transition ${
                currentPage === i + 1
                  ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg border text-sm transition ${
            currentPage === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
              : "text-teal-600 border-teal-300 hover:bg-teal-50 hover:border-teal-400"
          }`}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
