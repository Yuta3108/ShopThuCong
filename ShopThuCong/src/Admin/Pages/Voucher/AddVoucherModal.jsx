import React, { useState } from "react";

export default function AddVoucherModal({ onClose, onSubmit }) {
  const [data, setData] = useState({
    Code: "",
    Type: "percent",
    DiscountValue: 0,
    MinOrder: 0,
    MaxDiscount: 0,
    Quantity: 100,
    StartDate: "",
    EndDate: "",
    Status: 1,
  });

  const input = "border p-2 rounded";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        className="bg-white p-6 rounded-xl w-[420px]"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Thêm Voucher</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Code */}
          <input
            className={input}
            placeholder="Mã"
            value={data.Code}
            onChange={(e) => setData({ ...data, Code: e.target.value })}
            required
          />

          {/* Type */}
          <select
            className={input}
            value={data.Type}
            onChange={(e) =>
              setData({
                ...data,
                Type: e.target.value,
                MaxDiscount:
                  e.target.value === "fixed" ? 0 : data.MaxDiscount,
              })
            }
          >
            <option value="percent">Phần trăm</option>
            <option value="fixed">Số tiền</option>
          </select>

          {/* DiscountValue */}
          <input
            className={input}
            type="number"
            placeholder="Giá trị"
            value={data.DiscountValue}
            onChange={(e) =>
              setData({ ...data, DiscountValue: e.target.value })
            }
            required
          />

          {/* MinOrder */}
          <input
            className={input}
            type="number"
            placeholder="Tối thiểu"
            value={data.MinOrder}
            onChange={(e) =>
              setData({ ...data, MinOrder: e.target.value })
            }
          />

          {/* MaxDiscount */}
          <input
            className={`${input} ${
              data.Type === "fixed" && "opacity-40 cursor-not-allowed bg-gray-100"
            }`}
            disabled={data.Type === "fixed"}
            type="number"
            placeholder="Giảm tối đa"
            value={data.MaxDiscount}
            onChange={(e) =>
              setData({ ...data, MaxDiscount: e.target.value })
            }
          />

          {/* Quantity */}
          <input
            className={input}
            type="number"
            placeholder="Lượt"
            value={data.Quantity}
            onChange={(e) =>
              setData({ ...data, Quantity: e.target.value })
            }
          />

          {/* StartDate */}
          <input
            className={input}
            type="date"
            value={data.StartDate}
            onChange={(e) =>
              setData({ ...data, StartDate: e.target.value })
            }
            required
          />

          {/* EndDate */}
          <input
            className={input}
            type="date"
            value={data.EndDate}
            onChange={(e) =>
              setData({ ...data, EndDate: e.target.value })
            }
            required
          />
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Hủy
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded">
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
