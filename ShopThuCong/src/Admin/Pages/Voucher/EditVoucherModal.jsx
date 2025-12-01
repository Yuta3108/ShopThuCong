import React from "react";

export default function EditVoucherModal({ data, setData, onClose, onSubmit }) {
  const input = "border p-2 rounded w-full";

  const updateField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <form
        className="bg-white p-6 rounded-xl w-[460px]"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }}
      >
        <h2 className="text-lg font-bold mb-4">Sửa Voucher</h2>

        {/* Code */}
        <label>Mã voucher</label>
        <input
          className={input}
          value={data.Code}
          onChange={(e) => updateField("Code", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Type */}
          <div>
            <label>Loại</label>
            <select
              className={input}
              value={data.Type}
              onChange={(e) => updateField("Type", e.target.value)}
            >
              <option value="percent">Phần trăm</option>
              <option value="fixed">Số tiền</option>
            </select>
          </div>

          {/* DiscountValue */}
          <div>
            <label>Giá trị</label>
            <input
              type="number"
              className={input}
              value={data.DiscountValue}
              onChange={(e) => updateField("DiscountValue", Number(e.target.value))}
            />
          </div>

          {/* MinOrder */}
          <div>
            <label>Đơn tối thiểu</label>
            <input
              type="number"
              className={input}
              value={data.MinOrder}
              onChange={(e) => updateField("MinOrder", Number(e.target.value))}
            />
          </div>

          {/* MaxDiscount */}
          <div>
            <label>Giảm tối đa</label>
            <input
              type="number"
              disabled={data.Type === "fixed"}
              className={`${input} ${
                data.Type === "fixed" ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
              value={data.Type === "fixed" ? 0 : data.MaxDiscount}
              onChange={(e) =>
                updateField("MaxDiscount", Number(e.target.value))
              }
            />
          </div>

          {/* Quantity */}
          <div>
            <label>Lượt sử dụng</label>
            <input
              type="number"
              className={input}
              value={data.Quantity}
              onChange={(e) => updateField("Quantity", Number(e.target.value))}
            />
          </div>

          {/* Start */}
          <div>
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              className={input}
              value={data.StartDate}
              onChange={(e) => updateField("StartDate", e.target.value)}
            />
          </div>

          {/* End */}
          <div>
            <label>Ngày kết thúc</label>
            <input
              type="date"
              className={input}
              value={data.EndDate}
              onChange={(e) => updateField("EndDate", e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="col-span-2">
            <label>Trạng thái</label>
            <select
              className={input}
              value={data.Status}
              onChange={(e) => updateField("Status", Number(e.target.value))}
            >
              <option value={1}>Hoạt động</option>
              <option value={0}>Khoá</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Hủy
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
