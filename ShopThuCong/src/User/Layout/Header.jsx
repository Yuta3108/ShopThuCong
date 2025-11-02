import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: "Dụng Cụ Đan Móc", link: "/san-pham/dung-cu-dan-moc" },
    { name: "Phụ Kiện Làm Túi Xách", link: "/san-pham/phu-kien-tui-xach" },
    { name: "Phụ Liệu Trang Trí", link: "/san-pham/phu-lieu-trang-tri" },
    { name: "Phụ Liệu Làm Thú Bông", link: "/san-pham/phu-lieu-thu-bong" },
    { name: "Combo Tiết Kiệm", link: "/san-pham/combo" },
  ];

  // ✅ Load user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
  };

  const handleProfileClick = () => {
    if (user?.role === "admin") navigate("/admin");
    else navigate("/user");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 relative">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-extrabold tracking-wider text-teal-600 whitespace-nowrap"
        >
          Then Fong Store
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex space-x-8 items-center text-base font-medium text-gray-700">
          <Link to="/" className="hover:text-teal-600 transition">
            Trang chủ
          </Link>
          <Link to="/sanpham" className="hover:text-teal-600 transition">
            Sản phẩm
          </Link>
          <Link to="/lien-he" className="hover:text-teal-600 transition">
            Liên hệ
          </Link>
          <Link to="/gioi-thieu" className="hover:text-teal-600 transition">
            Giới thiệu
          </Link>
        </nav>

        {/* Search + User desktop */}
        <div className="hidden md:flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border border-gray-300 rounded-full px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />
          <button className="text-gray-700 hover:text-teal-600 text-xl transition">
            🛒
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full transition"
              >
                <img
                  src="/LogoHinh.png"
                  alt="user avatar"
                  className="w-7 h-7 rounded-full border border-teal-300"
                />
                <span className="text-gray-800 font-semibold text-sm">
                  {user.email}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 font-medium text-sm"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-gray-700 font-medium hover:text-teal-600 transition"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="text-gray-700 font-medium hover:text-teal-600 transition"
              >
                Đăng Ký
              </Link>
            </>
          )}
        </div>

        {/* Nút 3 gạch mobile */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-700"
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menu xổ xuống mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200 animate-slideDown">
          <nav className="flex flex-col text-gray-700 font-medium">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-gray-100 hover:text-teal-600"
            >
              Trang chủ
            </Link>

            {/* ✅ Dropdown sản phẩm mobile */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="w-full flex justify-between items-center px-4 py-3 hover:text-teal-600 transition"
              >
                <span>Sản phẩm</span>
                <span
                  className={`transform transition-transform ${
                    isProductOpen ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              </button>

              {isProductOpen && (
                <div className="bg-gray-50 text-sm">
                  {categories.map((item, i) => (
                    <Link
                      key={i}
                      to={item.link}
                      className="block px-6 py-2 text-gray-700 hover:bg-gray-100 hover:text-teal-600 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/lien-he"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-gray-100 hover:text-teal-600"
            >
              Liên hệ
            </Link>

            <Link
              to="/gioi-thieu"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-gray-100 hover:text-teal-600"
            >
              Giới thiệu
            </Link>

            {/* Khu user mobile */}
            <div className="px-4 py-4 flex flex-col items-center gap-3 border-t border-gray-100 bg-gray-50">
              {user ? (
                <>
                  <div
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 bg-white border border-teal-200 px-3 py-2 rounded-full shadow-sm"
                  >
                    <img
                      src="/LogoHinh.png"
                      alt="user"
                      className="w-8 h-8 rounded-full border border-teal-300"
                    />
                    <span className="text-gray-800 text-sm font-semibold">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-full transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium py-2 rounded-full transition"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
