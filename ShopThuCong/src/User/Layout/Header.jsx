import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productPinned, setProductPinned] = useState(false);
  const [user, setUser] = useState(null);
  const wrapperRef = useRef(null);
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
    if (user.role === "admin") navigate("/admin/users");
    else navigate("/user");
  };

  // ✅ Dropdown đóng mở ngoài click
  useEffect(() => {
    const handleDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsProductOpen(false);
        setProductPinned(false);
      }
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, []);

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

          {/* Sản phẩm dropdown */}
          <div
            className="relative"
            ref={wrapperRef}
            onMouseEnter={() => setIsProductOpen(true)}
            onMouseLeave={() => !productPinned && setIsProductOpen(false)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProductPinned((prev) => {
                  const next = !prev;
                  setIsProductOpen(next);
                  return next;
                });
              }}
              className={`flex items-center gap-1 transition ${
                isProductOpen ? "text-teal-600" : "hover:text-teal-600"
              }`}
            >
              Sản phẩm ▾
            </button>

            {isProductOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg animate-fadeSlide z-50">
                {categories.map((item, i) => (
                  <Link
                    key={i}
                    to={item.link}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-teal-600 border-b border-gray-100 last:border-none"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/lien-he" className="hover:text-teal-600 transition">
            Liên hệ
          </Link>

          <Link to="/gioi-thieu" className="hover:text-teal-600 transition">
            Giới thiệu
          </Link>
        </nav>

        {/* Search + User */}
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
              {/* Avatar + Tên user */}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-full transition"
              >
                <img
                  src="/user-icon.png"
                  alt="user avatar"
                  className="w-7 h-7 rounded-full border border-teal-300"
                />
                <span className="text-gray-800 font-semibold text-sm">
                  {user.email || user.email || "User"}
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

        {/* Nút mobile */}
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setMobileMenu((p) => !p)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
