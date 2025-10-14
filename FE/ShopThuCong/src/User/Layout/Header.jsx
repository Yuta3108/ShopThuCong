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

  // Khi load Header -> đọc user trong localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Xử lý click ra ngoài dropdown
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

  const handleToggleProduct = (e) => {
    e.stopPropagation();
    setProductPinned((prev) => {
      const next = !prev;
      setIsProductOpen(next);
      return next;
    });
  };

  const handleMouseEnter = () => setIsProductOpen(true);
  const handleMouseLeave = () => !productPinned && setIsProductOpen(false);
  const handleItemClick = () =>
    setTimeout(() => {
      setIsProductOpen(false);
      setProductPinned(false);
    }, 120);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/auth");
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

        {/* Desktop menu */}
        <nav className="hidden md:flex space-x-8 items-center text-base font-medium text-gray-700">
          <Link to="/" className="hover:text-teal-600 transition">
            Trang chủ
          </Link>

          <div
            className="relative"
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleToggleProduct}
              aria-expanded={isProductOpen}
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
                    onClick={handleItemClick}
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

        {/* Search & user actions */}
        <div className="hidden md:flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border border-gray-300 rounded-full px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />

          <button className="text-gray-700 hover:text-teal-600 text-xl transition">
            🛒
          </button>

          {/* Nếu có user thì hiện tên + đăng xuất */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                Xin chào, {user.tenKhachHang || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 font-medium"
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

        {/* Nút menu mobile */}
        <button
          className="md:hidden text-gray-700 text-2xl"
          onClick={() => setMobileMenu((p) => !p)}
        >
          ☰
        </button>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-200 flex flex-col p-4 space-y-2 md:hidden animate-fadeSlide">
            <Link to="/" className="hover:text-teal-600 transition py-2">
              Trang chủ
            </Link>

            <div>
              <p className="font-medium text-gray-800 py-2">Sản phẩm</p>
              <div className="pl-3 border-l border-gray-200">
                {categories.map((item, i) => (
                  <Link
                    key={i}
                    to={item.link}
                    className="block py-1 text-sm text-gray-700 hover:text-teal-600"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/lien-he" className="hover:text-teal-600 transition py-2">
              Liên hệ
            </Link>
            <Link
              to="/gioi-thieu"
              className="hover:text-teal-600 transition py-2"
            >
              Giới thiệu
            </Link>

            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 text-center">
              {user ? (
                <>
                  <span className="text-gray-700 font-medium">
                    Xin chào, {user.tenKhachHang || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
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
          </div>
        )}
      </div>
    </header>
  );
}
