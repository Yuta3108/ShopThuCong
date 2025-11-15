import React, { useState } from "react";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

function LienHe() {
  const [formData, setFormData] = useState({
    hoTen: "",
    sdt: "",
    email: "",
    tieuDe: "",
    noiDung: "",
    maXacNhan: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Gửi liên hệ thành công!");
    setFormData({
      hoTen: "",
      sdt: "",
      email: "",
      tieuDe: "",
      noiDung: "",
      maXacNhan: "",
    });
  };

  return (
    <div className="bg-bg-test bg-cover bg-fixed min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-10 text-gray-800">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-10">
          LIÊN HỆ VỚI CHÚNG TÔI
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Thông tin công ty */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">
              Then Fong Store
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                📍 Địa chỉ: 180 Cao Lỗ, Phường Chánh Hưng, Tp. Hồ Chí Minh
              </li>
              <li>📞 Điện thoại: 0938217781</li>
              <li>✉️ Email: ThenFongStore@gmail.com</li>
            </ul>

            <div className="mt-6 border-t pt-4 text-left">
              <h3 className="text-lg font-semibold text-purple-700 mb-6">
                Vị trí của chúng tôi
              </h3>
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7839.927352538147!2d106.67872!3d10.737283!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f62a90e5dbd%3A0x674d5126513db295!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgU8OgaSBHw7Ju!5e0!3m2!1svi!2sus!4v1760000546057!5m2!1svi!2sus"
                width="100%"
                height="350"
                className="rounded-lg border"
                allowFullScreen
                loading="lazy">
              </iframe>
            </div>
          </div>

          {/* Form liên hệ */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-semibold text-purple-700 mb-6">
              Gửi Liên Hệ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="hoTen"
                placeholder="Họ và tên"
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />

              <input
                type="text"
                name="sdt"
                placeholder="Số điện thoại"
                value={formData.sdt}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />

              <input
                type="text"
                name="tieuDe"
                placeholder="Tiêu đề"
                value={formData.tieuDe}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />
                

              <textarea
                name="noiDung"
                placeholder="Nội dung"
                value={formData.noiDung}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-t from-purple-800 via-purple-500 to-purple-400 text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default LienHe;
