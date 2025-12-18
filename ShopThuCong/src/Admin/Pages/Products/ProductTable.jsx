import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

//  FORMAT MONEY 
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

//  CHECK XOÁ 30 PHÚT 
const canDeleteProduct = (createdAt) => {
  if (!createdAt) return false;

  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMinutes = (now - created) / (1000 * 60);

  return diffMinutes <= 30;
};

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
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="w-full">
      {/*  MOBILE CARD LIST  */}
      <div className="grid grid-cols-1 md:hidden gap-4 mb-6">
        {currentProducts.map((p) => {
          const allowDelete = canDeleteProduct(p.CreatedAt);

          return (
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
                  <p className="text-xs text-slate-500">
                    Mã: {p.ProductCode}
                  </p>
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
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-200">
                    Đang bán
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-200">
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
                  disabled={!allowDelete}
                  onClick={() => allowDelete && onDelete(p.ProductID)}
                  title={
                    allowDelete
                      ? "Xoá sản phẩm"
                      : "Không thể xoá sau 30 phút kể từ khi tạo"
                  }
                  className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1
                    ${
                      allowDelete
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                >
                  <Trash2 size={16} />
                  Xoá
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/*  DESKTOP TABLE  */}
      <div className="hidden md:block overflow-x-auto rounded-2xl bg-white border shadow-md">
        <table className="min-w-full text-[13px] text-slate-700">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm">
              <th className="px-4 py-3 text-left">Ảnh</th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Mã SP</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-center">Giá thấp nhất</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {currentProducts.map((p, idx) => {
              const allowDelete = canDeleteProduct(p.CreatedAt);

              return (
                <tr
                  key={p.ProductID}
                  className={`border-b ${
                    idx % 2 ? "bg-slate-50" : "bg-white"
                  } hover:bg-teal-50/60`}
                >
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-100">
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

                  <td className="px-4 py-3 font-semibold text-center">
                    {(currentPage - 1) * productsPerPage + idx + 1}
                  </td>

                  <td className="px-4 py-3">{p.ProductCode}</td>
                  <td className="px-4 py-3">{p.ProductName}</td>
                  <td className="px-4 py-3">{p.CategoryName || "—"}</td>

                  <td className="px-4 py-3 text-center text-teal-700 font-semibold">
                    {p.minPrice ? formatMoney(p.minPrice) + "₫" : "—"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {p.IsActive ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Đang bán
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Ngừng bán
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(p.ProductID)}
                        className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        disabled={!allowDelete}
                        onClick={() => allowDelete && onDelete(p.ProductID)}
                        title={
                          allowDelete
                            ? "Xoá sản phẩm"
                            : "Không thể xoá sau 30 phút kể từ khi tạo"
                        }
                        className={`p-2 rounded-lg
                          ${
                            allowDelete
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }
                        `}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/*  PAGINATION  */}
      <div className="flex justify-center items-center gap-2 py-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-lg border text-sm"
        >
          ← Trước
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`w-8 h-8 rounded-lg border text-sm ${
              currentPage === i + 1
                ? "bg-teal-500 text-white"
                : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-lg border text-sm"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
