import { Pencil, Trash2 } from "lucide-react";

// Format tiền chuẩn VND
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function VoucherTable({ loading, vouchers, onDelete, onEdit }) {
  if (loading)
    return <p className="text-center text-slate-500 py-10">Đang tải…</p>;

  return (
    <div className="overflow-x-auto rounded-2xl shadow-md border border-slate-200 bg-white">
      <table className="min-w-full text-[13px] text-slate-700">
        
        {/* HEADER */}
        <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm">
          <tr>
            <th className="p-3 text-center rounded-tl-2xl">ID</th>
            <th className="p-3 text-center">Mã</th>
            <th className="p-3 text-center">Loại</th>
            <th className="p-3 text-center">Giá trị</th>
            <th className="p-3 text-center">Tối thiểu</th>
            <th className="p-3 text-center">Lượt</th>
            <th className="p-3 text-center">Trạng thái</th>
            <th className="p-3 text-center rounded-tr-2xl">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {vouchers.map((v, index) => (
            <tr
              key={v.VoucherID}
              className={`
                transition-all border-b last:border-0
                ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                hover:bg-teal-50/60
              `}
            >
              <td className="p-3 text-center font-medium text-slate-800">
                {v.VoucherID}
              </td>

              <td className="p-3 text-center font-semibold text-slate-900 uppercase tracking-wide">
                {v.Code}
              </td>

              <td className="p-3 text-center uppercase font-medium">
                {v.Type}
              </td>

              {/* Giá trị */}
              <td className="p-3 text-center font-semibold text-emerald-700">
                {v.Type === "percent"
                  ? `${v.DiscountValue}%`
                  : `${formatMoney(v.DiscountValue)}₫`}
              </td>

              {/* Tối thiểu */}
              <td className="p-3 text-center text-slate-700">
                {formatMoney(v.MinOrder)}₫
              </td>

              {/* Lượt */}
              <td className="p-3 text-center text-slate-700">
                {v.Quantity}
              </td>

              {/* Trạng thái */}
              <td className="p-3 text-center">
                <span
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold shadow-sm
                    ${
                      v.Status
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-600 border border-red-200"
                    }
                  `}
                >
                  {v.Status ? "Hoạt động" : "Khoá"}
                </span>
              </td>

              {/* ACTION */}
              <td className="p-3">
                <div className="flex justify-center gap-3">

                  {/* EDIT */}
                  <button
                    onClick={() => onEdit(v)}
                    className="p-2 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                  >
                    <Pencil size={17} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => onDelete(v.VoucherID)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                  >
                    <Trash2 size={17} />
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
