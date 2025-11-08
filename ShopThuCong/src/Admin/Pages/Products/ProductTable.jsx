import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductTable({ products, loading, onEdit, onDelete, }) {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  if (loading)
    return (
      <p className="text-center text-gray-500 py-10 text-sm sm:text-base">
        Đang tải dữ liệu…
      </p>
    );
  if (!products.length)
    return (
      <p className="text-center text-gray-500 py-10 text-sm sm:text-base">
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
    <div className="w-full overflow-x-auto rounded-xl bg-white border shadow-md">
      <table className="min-w-full text-sm sm:text-base">
        <thead className="sticky top-0">
          <tr className="bg-gradient-to-r from-teal-400 to-teal-300 text-white text-sm sm:text-base">
            <th className="px-3 sm:px-4 py-3 text-left">Ảnh</th>
            <th className="px-3 sm:px-4 py-3 text-left">#</th>
            <th className="px-3 sm:px-4 py-3 text-left">SKU</th>
            <th className="px-3 sm:px-4 py-3 text-left">Tên sản phẩm</th>
            <th className="px-3 sm:px-4 py-3 text-left hidden md:table-cell">
              Danh mục
            </th>
            <th className="px-3 sm:px-4 py-3 text-center hidden sm:table-cell">
              Giá thấp nhất
            </th>
            <th className="px-3 sm:px-4 py-3 text-center">Trạng thái</th>
            <th className="px-3 sm:px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {currentProducts.map((p, idx) => (
            <tr
              key={`${p.ProductID}-${idx}`}
              className={`border-b ${
                idx % 2 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-50 transition`}
            >
              {/* Ảnh */}
              <td className="px-3 sm:px-4 py-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden border bg-gray-100">
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

              {/* STT */}
              <td className="px-3 sm:px-4 py-3 font-semibold text-gray-700 text-center">
                {(currentPage - 1) * productsPerPage + idx + 1}
              </td>

              {/* SKU */}
              <td className="px-3 sm:px-4 py-3 font-semibold text-gray-700">
                {p.SKU}
              </td>

              {/* Tên */}
              <td className="px-3 sm:px-4 py-3">{p.ProductName}</td>

              {/* Danh mục (ẩn mobile) */}
              <td className="px-3 sm:px-4 py-3 text-gray-600 hidden md:table-cell">
                {p.CategoryName || "—"}
              </td>

              {/* Giá */}
              <td className="px-3 sm:px-4 py-3 text-center text-teal-700 font-semibold hidden sm:table-cell">
                {p.minPrice
                  ? p.minPrice.toLocaleString("vi-VN") + "₫"
                  : "—"}
              </td>

              {/* Trạng thái */}
              <td className="px-3 sm:px-4 py-3 text-center">
                {p.IsActive ? (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Đang bán
                  </span>
                ) : (
                  <span className="px-2 sm:px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    Ngừng bán
                  </span>
                )}
              </td>

              {/* Thao tác */}
              <td className="px-3 sm:px-4 py-3 text-center">
                <div className="flex justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => onEdit(p.ProductID)}
                    className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                    title="Sửa"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(p.ProductID)}
                    className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                    title="Xoá"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-5 pb-5 select-none text-sm sm:text-base">
        {/* Nút Trước */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
            currentPage === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed bg-gray-100"
              : "text-teal-600 border-teal-300 hover:bg-teal-50 hover:border-teal-400"
          }`}
        >
          ← Trước
        </button>

        {/* Nút số trang */}
        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                currentPage === i + 1
                  ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Nút Sau */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
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
