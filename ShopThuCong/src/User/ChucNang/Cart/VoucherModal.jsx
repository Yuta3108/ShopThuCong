import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function VoucherModal({ isOpen, onClose }) {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchVouchers = async () => {
      try {
        const res = await fetch(`${API}/vouchers`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const result = await res.json();
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
          ? result.data
          : [];

        // ONLY SHOW VOUCHERS STILL USABLE
        const available = list.filter(
          (v) =>
            v.Status === 1 &&
            Number(v.Quantity) > 0
        );

        setVouchers(available);
      } catch {
        setVouchers([]);
      }
    };

    fetchVouchers();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white w-[380px] rounded-2xl p-5 shadow-xl relative">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          🎟️ Chọn mã giảm giá
        </h3>

        <div className="max-h-[350px] overflow-y-auto space-y-3">
          {vouchers.length === 0 ? (
            <p className="text-center text-slate-500 text-sm">
              Không có voucher khả dụng.
            </p>
          ) : (
            vouchers.map((v) => (
              <div
                key={v.VoucherID}
                className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex justify-between items-start"
              >
                <div>
                  <p className="text-rose-600 font-bold text-sm">{v.Code}</p>

                  {v.Type === "percent" ? (
                    <p className="text-sm text-slate-700">
                      Giảm {v.DiscountValue}% (tối đa{" "}
                      {Number(v.MaxDiscount).toLocaleString()}₫)
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700">
                      Giảm {Number(v.DiscountValue).toLocaleString()}₫
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-1">
                    Đơn tối thiểu: {Number(v.MinOrder).toLocaleString()}₫
                  </p>
                </div>

                <button
                  onClick={() => {
                    localStorage.setItem("selectedVoucher", v.Code);

                    Swal.fire({
                      icon: "success",
                      title: "Đã áp dụng",
                      text: `Đã chọn mã ${v.Code}`,
                      timer: 1200,
                      showConfirmButton: false,
                    });

                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 transition"
                >
                  Áp dụng
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-slate-400 hover:text-rose-500 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
