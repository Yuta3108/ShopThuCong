import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

export default function ResetPasswordModal({ open, onClose, onSubmit }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg relative animate-fadeIn">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold text-rose-500 text-center mb-5">
          Đặt lại mật khẩu
        </h2>

        <div className="space-y-4">

          {/* OLD PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative mt-1">
              <input
                type={showOld ? "text" : "password"}
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 pr-10 bg-slate-50 focus:ring-2 focus:ring-rose-300 outline-none"
                placeholder="Nhập mật khẩu hiện tại"
              />

              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-2.5 text-slate-500"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu mới
            </label>
            <div className="relative mt-1">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                
                className="w-full border rounded-lg px-4 py-2 pr-10 bg-slate-50 focus:ring-2 focus:ring-rose-300 outline-none"
                placeholder="Nhập mật khẩu mới"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-500"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

        </div>

        {/* Submit */}
        <button
          onClick={() => 
            {onSubmit(oldPass, newPass);
            setNewPass("");
            setOldPass("");
          }}
          className="w-full mt-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow"
        >
          Xác nhận thay đổi
        </button>
      </div>
    </div>
  );
}
