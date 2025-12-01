import { Pencil, Trash2 } from "lucide-react";

export default function VoucherTable({ loading, vouchers, onDelete, onEdit }) {
    if (loading) return <p className="text-center py-10">Đang tải…</p>;

    return (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full text-sm">
                <thead className="bg-teal-500 text-white">
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
                    {vouchers.map((v) => (
                        <tr key={v.VoucherID} className="border-t hover:bg-teal-50">
                            <td className="p-3 text-center">{v.VoucherID}</td>
                            <td className="p-3 text-center">{v.Code}</td>
                            <td className="p-3 text-center">{v.Type}</td>
                            <td className="p-3 text-center">
                                {v.Type === "percent"
                                    ? `${v.DiscountValue}%`
                                    : `${v.DiscountValue.toLocaleString()}₫`}
                            </td>
                            <td className="p-3 text-center">{v.MinOrder.toLocaleString()}₫</td>
                            <td className="p-3 text-center">{v.Quantity}</td>

                            <td className="p-3 text-center">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    v.Status ? "bg-green-100 text-green-700" :
                                               "bg-red-100 text-red-700"
                                }`}>
                                    {v.Status ? "Hoạt động" : "Khóa"}
                                </span>
                            </td>

                            <td className="p-3 flex justify-center gap-2">
                                <button onClick={() => onEdit(v)} className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => onDelete(v.VoucherID)} className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600">
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
