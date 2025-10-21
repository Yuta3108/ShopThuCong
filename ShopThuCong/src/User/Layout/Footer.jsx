import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200 shadow-inner mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo và thông tin liên hệ */}
        <div className="relative group">
          <img
            src="/LogoHinh.png"
            alt="ThenFong Logo"
            className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-full border-2 border-amber-700 shadow-md"
          />
          <h2 className="text-lg font-semibold text-amber-700">
            ThenFong Store
          </h2>
          <p className="text-sm text-gray-600 text-center md:text-left leading-relaxed">
            180 Cao Lỗ, Phường 4, Quận 8, Thành Phố Hồ Chí Minh
          </p>
          <p className="text-sm text-gray-600 text-center md:text-left">
            Email:{" "}
            <a
              href="mailto:ThenFong@gmail.com"
              className="text-amber-700 hover:underline hover:text-amber-800 transition-colors"
            >
              ThenFong@gmail.com
            </a>
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm">
            {["Việt Nam", "Hỗ Trợ", "Liên Hệ", "Khiếu Nại"].map((item, i) => (
              <span
                key={i}
                className="text-gray-700 hover:text-amber-700 cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Thông tin công ty */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">
            Công Ty
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            {[
              "Giới Thiệu",
              "Tuyển Dụng",
              "Khuyến Mãi",
              "Điều Khoản Sử Dụng",
              "Chính Sách Bảo Mật",
            ].map((item, i) => (
              <li
                key={i}
                className="hover:text-amber-700 transition-colors cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Hợp tác và Follow us */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">
            Hợp Tác Với Chúng Tôi
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            {["Quảng Cáo", "Trung Tâm Đối Tác"].map((item, i) => (
              <li
                key={i}
                className="hover:text-amber-700 transition-colors cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <p className="font-semibold text-gray-800 mb-2">Follow Us:</p>
            <div className="flex justify-center md:justify-start gap-4">
              <a
                href="https://www.facebook.com/thanh.san.1422"
                aria-label="Facebook"
                className="hover:scale-110 transition-transform"
              >
                <img src="/fb_icon.png" alt="Facebook" className="w-7 h-7" />
              </a>
              <a
                href="https://www.tiktok.com/@thanhsannn"
                aria-label="TikTok"
                className="hover:scale-110 transition-transform"
              >
                <img src="/tiktok_icon.png" alt="tiktok" className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dòng cuối */}
      <div className="border-t border-gray-200 mt-6 py-4 text-center text-sm text-gray-500">
        © 2025 <span className="text-amber-700 font-semibold">ThenFong Store</span>. 
        Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
