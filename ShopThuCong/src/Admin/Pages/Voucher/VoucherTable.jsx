import { Pencil, Trash2 } from "lucide-react";

export default function VoucherTable({ loading, vouchers, onDelete, onEdit }) {
  if (loading)
    return <p className="text-center text-slate-500 py-10">Đang tải…</p>;

  return (
    <div className="overflow-x-auto rounded-2xl shadow border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-teal-600 text-white">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Mã</th>
            <th className="p-3">Loại</th>
            <th className="p-3">Giá trị</th>
            <th className="p-3">Tối thiểu</th>
            <th className="p-3">Lượt</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {vouchers.map((v, i) => (
            <tr
              key={v.VoucherID}
              className={`border-t ${
                i % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-teal-50 transition`}
            >
              <td className="p-3 text-center">{v.VoucherID}</td>
              <td className="p-3 text-center font-semibold">{v.Code}</td>
              <td className="p-3 text-center uppercase">{v.Type}</td>
              <td className="p-3 text-center">
                {v.Type === "percent"
                  ? `${v.DiscountValue}%`
                  : `${v.DiscountValue.toLocaleString()}₫`}
              </td>

              <td className="p-3 text-center">
                {v.MinOrder.toLocaleString()}₫
              </td>

              <td className="p-3 text-center">{v.Quantity}</td>

              <td className="p-3 text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    v.Status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {v.Status ? "Hoạt động" : "Khoá"}
                </span>
              </td>

              <td className="p-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(v)}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-700"
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => onDelete(v.VoucherID)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600"
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
  );
}
