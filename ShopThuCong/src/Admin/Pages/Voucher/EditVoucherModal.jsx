import React from "react";

export default function EditVoucherModal({ data, setData, onClose, onSubmit }) {
  const input = "border p-2 rounded w-full";

  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-teal-600">Sửa Voucher</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Code */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Mã Voucher</label>
            <input
              className={input}
              required
              value={data.Code}
              onChange={(e) => handleChange("Code", e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Loại</label>
            <select
              className={input}
              value={data.Type}
              onChange={(e) => handleChange("Type", e.target.value)}
            >
              <option value="percent">Phần trăm</option>
              <option value="fixed">Số tiền</option>
            </select>
          </div>

          {/* DiscountValue */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Giá trị</label>
            <input
              type="number"
              className={input}
              required
              value={data.DiscountValue}
              onChange={(e) =>
                handleChange("DiscountValue", e.target.value)
              }
            />
          </div>

          {/* MinOrder */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Đơn tối thiểu</label>
            <input
              type="number"
              className={input}
              value={data.MinOrder}
              onChange={(e) =>
                handleChange("MinOrder", e.target.value)
              }
            />
          </div>

          {/* MaxDiscount */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Giảm tối đa</label>
            <input
              type={data.Type === "fixed" ? "text" : "number"}
              disabled={data.Type === "fixed"}
              className={`${input} ${
                data.Type === "fixed"
                  ? "bg-gray-100 cursor-not-allowed opacity-70"
                  : ""
              }`}
              value={data.MaxDiscount}
              onChange={(e) =>
                handleChange("MaxDiscount", e.target.value)
              }
            />
          </div>

          {/* Quantity */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Lượt sử dụng</label>
            <input
              type="number"
              className={input}
              value={data.Quantity}
              onChange={(e) =>
                handleChange("Quantity", e.target.value)
              }
            />
          </div>

          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Ngày bắt đầu</label>
            <input
              type="date"
              className={input}
              required
              value={data.StartDate?.slice(0, 10)}
              onChange={(e) =>
                handleChange("StartDate", e.target.value)
              }
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Ngày kết thúc</label>
            <input
              type="date"
              className={input}
              required
              value={data.EndDate?.slice(0, 10)}
              onChange={(e) =>
                handleChange("EndDate", e.target.value)
              }
            />
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              className={input}
              value={data.Status}
              onChange={(e) =>
                handleChange("Status", Number(e.target.value))
              }
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Khóa</option>
            </select>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
