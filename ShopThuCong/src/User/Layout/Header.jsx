import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCartIcon } from "lucide-react";
import axios from "axios";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://backend-eta-ivory-29.vercel.app/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi load categories:", err);
      }
    };
    fetchCategories();
  }, []);
  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);
  // Hàm update giỏ hàng chung (local + DB)
  const updateCart = async () => {
    const isDB = localStorage.getItem("cartMode") === "db";
    const token = localStorage.getItem("token");
    // Nếu dùng CART DB
    if (isDB && token) {
      try {
        const res = await axios.get(
          "https://backend-eta-ivory-29.vercel.app/api/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const items = res.data.items || [];
        const total = items.reduce((sum, item) => sum + item.Quantity, 0);
        setCartCount(total);
        return;
      } catch (err) {
        console.log("Lỗi load cart từ DB:", err);
      }
    }
    // Nếu dùng CART LOCAL
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };
  // Sync cart khi login
  useEffect(() => {
    if (user) updateCart();
  }, [user]);
  useEffect(() => {
    updateCart(); 
    window.addEventListener("updateCart", updateCart);
    return () => window.removeEventListener("updateCart", updateCart);
  }, []);
  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cartMode");
    setUser(null);
    navigate("/login");
  };
  const handleProfileClick = () => {
    if (user?.role === "admin") navigate("/admin");
    else navigate("/user");
  };
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 relative">

        {/* LOGO */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-extrabold tracking-wider text-teal-600 whitespace-nowrap"
        >
          Then Fong Store
        </Link>

        {/* MENU DESKTOP */}
        <nav className="hidden md:flex space-x-8 items-center text-base font-medium text-gray-700">
          <Link to="/" className="hover:text-teal-600 transition">
            Trang chủ
          </Link>
          <div className="relative group cursor-pointer">
            <Link to="/san-pham" className="hover:text-teal-600 transition">Sản phẩm</Link>

            <div className="absolute left-0 top-full mt-2 bg-white shadow-lg rounded-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[240px] py-2 z-50">
              {categories.map((cat) => (
                <Link
                  key={cat.CategoryID}
                  to={`/san-pham/${cat.Slug}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition"
                >
                  {cat.CategoryName}
                </Link>
              ))}
            </div>
          </div>

          <Link to="/lien-he" className="hover:text-teal-600 transition">
            Liên hệ
          </Link>
          <Link to="/gioi-thieu" className="hover:text-teal-600 transition">
            Giới thiệu
          </Link>
        </nav>

        {/* SEARCH + USER ) */}
        <div className="hidden md:flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            className="border border-gray-300 rounded-full px-4 py-2 text-sm w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          />

          <Link to="/cart" className="relative">
            <ShoppingCartIcon className="w-7 h-7 text-teal-600" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">
                {cartCount}
              </span>
            )}
          </Link>

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
                to="/login"
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

        {/* NÚT MOBILE */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-700"
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200 animate-slideDown z-40">
          <nav className="flex flex-col text-gray-700 font-medium">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-gray-100 hover:text-teal-600"
            >
              Trang chủ
            </Link>

            {/* DROPDOWN MOBILE */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="w-full flex justify-between items-center px-4 py-3 hover:text-teal-600 transition"
              >
                <span>Sản phẩm</span>
                <span
                  className={`transform transition-transform ${isProductOpen ? "rotate-180" : ""
                    }`}
                >
                  ▾
                </span>
              </button>

              {isProductOpen && (
                <div className="bg-gray-50 text-sm">
                  {categories.map((cat) => (
                    <Link
                      key={cat.CategoryID}
                      to={`/san-pham/${cat.Slug}`}
                      className="block px-6 py-2 hover:bg-gray-100 hover:text-teal-600 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {cat.CategoryName}
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
            <Link
              to="/cart"
              className="relative flex items-center justify-between px-4 py-3 border-b border-gray-100"
            >
              <span className="text-gray-700 font-medium">Giỏ hàng</span>

              <div className="relative">
                <ShoppingCartIcon className="w-7 h-7 text-teal-600" />

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>
            {/* USER MOBILE */}
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
                    to="/login"
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
