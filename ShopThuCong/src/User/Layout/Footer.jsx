import React from "react";

const Footer = () => {
  return (
    
    <footer className="bg-[#F5F5F5] text-slate-800 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Logo + info */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/LogoHinh.png"
              alt="ThenFong Logo"
              className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-2xl border border-amber-300/80 shadow-[0_10px_30px_rgba(251,191,36,0.35)]"
            />
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-amber-700">
                ThenFong Store
              </h2>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                HANDCRAFTED WITH LOVE
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            180 Cao Lỗ, Phường 4, Quận 8, Thành Phố Hồ Chí Minh
          </p>
          <p className="text-sm text-slate-700 mt-2">
            Email:{" "}
            <a
              href="mailto:ThenFong@gmail.com"
              className="text-amber-700 hover:text-amber-800 hover:underline underline-offset-4 transition-colors"
            >
              ThenFong@gmail.com
            </a>
          </p>

          <div className="flex flex-wrap gap-3 mt-4 text-[13px]">
            {["Việt Nam", "Hỗ Trợ", "Liên Hệ", "Khiếu Nại"].map((item, i) => (
              <span
                key={i}
                className="text-slate-700/90 hover:text-amber-700 cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-lg font-semibold text-amber-700 mb-4">
            Công Ty
          </h3>
          <ul className="space-y-2 text-sm text-slate-700/95">
            {[
              "Giới Thiệu",
              "Tuyển Dụng",
              "Khuyến Mãi",
              "Điều Khoản Sử Dụng",
              "Chính Sách Bảo Mật",
            ].map((item, i) => (
              <li
                key={i}
                className="hover:text-amber-700 cursor-pointer transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Partner + Social */}
        <div>
          <h3 className="text-lg font-semibold text-amber-700 mb-4">
            Hợp Tác Với Chúng Tôi
          </h3>
          <ul className="space-y-2 text-sm text-slate-700/95">
            {["Quảng Cáo", "Trung Tâm Đối Tác"].map((item, i) => (
              <li
                key={i}
                className="hover:text-amber-700 cursor-pointer transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <p className="font-semibold text-slate-800 mb-3 text-sm">
              Follow Us
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { alt: "Facebook", src: "/fb_icon.png" },
                { alt: "TikTok", src: "/tiktok_icon.png" },
                { alt: "Instagram", src: "/instagram.png" },
                { alt: "Twitter", src: "/twitter_icon.png" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={social.alt}
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:border-amber-500 hover:shadow-md hover:-translate-y-[1px] transition-all"
                >
                  <img
                    src={social.src}
                    alt={social.alt}
                    className="w-5 h-5 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-slate-200 py-4 text-center text-xs md:text-sm text-slate-500">
        © 2025{" "}
        <span className="text-amber-700 font-semibold">ThenFong Store</span>.{" "}
        Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};

export default Footer;
