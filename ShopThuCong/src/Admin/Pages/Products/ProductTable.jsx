
{/*File Bảng  Sản Phẩm */ }
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu…</p>;
  if (!products.length) return <p className="text-center text-gray-500 py-10">Không tìm thấy sản phẩm.</p>;

  return (
    <div className="overflow-x-auto rounded-xl bg-white border shadow-md">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-teal-400 to-teal-300 text-white">
            <th className="px-4 py-3 text-left">Ảnh</th>
            <th className="px-4 py-3 text-left">Mã SP</th>
            <th className="px-4 py-3 text-left">Tên sản phẩm</th>
            <th className="px-4 py-3 text-left">Danh mục</th>
            <th className="px-4 py-3 text-center">Giá thấp nhất</th>
            <th className="px-4 py-3 text-center">Trạng thái</th>
            <th className="px-4 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr key={`${p.ProductID}-${idx}`} className={`border-b ${idx % 2 ? "bg-gray-50" : "bg-white"} hover:bg-gray-50`}>
              <td className="px-4 py-3">
                <div className="w-12 h-12 rounded-md overflow-hidden border bg-gray-100">
                  {p.cover ? <img src={p.cover} alt="cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No img</div>}
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-700">{p.ProductID}</td>
              <td className="px-4 py-3">{p.ProductName}</td>
              <td className="px-4 py-3 text-gray-600">{p.CategoryName || "—"}</td>
              <td className="px-4 py-3 text-center text-teal-700 font-semibold">{p.minPrice ? p.minPrice.toLocaleString("vi-VN") + "₫" : "—"}</td>
              <td className="px-4 py-3 text-center">
                {p.IsActive ? <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Hoạt động</span> : <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">Ngừng bán</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <button onClick={() => onEdit(p.ProductID)} className="inline-flex items-center p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 mr-2" title="Sửa">
                  <Pencil size={18} />
                </button>
                <button onClick={() => onDelete(p.ProductID)} className="inline-flex items-center p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600" title="Xoá">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
