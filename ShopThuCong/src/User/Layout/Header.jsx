import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCartIcon, Search } from "lucide-react";
import axios from "axios";

export default function Header() {
  const [user, setUser] = useState(null);
  const API = "https://backend-eta-ivory-29.vercel.app/api";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${API}/categories`
        );
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

    // CART DB
    if (isDB && token) {
      try {
        const res = await axios.get(
          "${API}/cart",
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

    // CART LOCAL
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  useEffect(() => {
    if (user) updateCart();
  }, [user]);

  useEffect(() => {
    updateCart();
    window.addEventListener("updateCart", updateCart);
    return () => window.removeEventListener("updateCart", updateCart);
  }, []);
  // Tự động gợi ý khi nhập tìm kiếm
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await axios.get(
        `${API}/products`,
        {
          params: {
            q: keyword,
            pageSize: 5,
          },
        }
      );
      setSuggestions(res.data);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);
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
    <header className="sticky top-0 z-50">
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:py-3.5 relative">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 group whitespace-nowrap"
          >
            <img
              src="/LogoHinh.png"
              alt="Logo"
              className="w-10 h-10 rounded-2xl object-cover group-hover:scale-[1.05] transition-all"
            ></img>
            <div className="flex flex-col leading-tight">
              <span className="text-base md:text-lg font-semibold tracking-wide text-slate-900">
                ThenFong Store
              </span>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex space-x-7 items-center text-sm font-medium text-slate-700">
            <Link
              to="/"
              className="relative group px-1 py-0.5 hover:text-teal-600 transition"
            >
              Trang chủ
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full group-hover:w-full transition-all" />
            </Link>

            <div className="relative group cursor-pointer">
              <Link
                to="/san-pham"
                className="flex items-center gap-1 px-1 py-0.5 hover:text-teal-600 transition"
              >
                <span>Sản phẩm</span>
                <span className="text-[10px] mt-[1px]">▾</span>
              </Link>

              {/* MEGA DROPDOWN */}
              <div className="absolute left-0 top-full mt-3 bg-white/90 backdrop-blur-xl shadow-[0_22px_60px_rgba(15,23,42,0.18)] rounded-2xl border border-white/80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[260px] py-3 z-50">
                <p className="px-4 pb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Danh mục
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.CategoryID}
                    to={`/san-pham/${cat.Slug}`}
                    className=" px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50/80 hover:text-teal-700 transition flex justify-between items-center"
                  >
                    <span>{cat.CategoryName}</span>
                    <span className="text-[11px] text-slate-400">
                      Xem →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/lien-he"
              className="relative group px-1 py-0.5 hover:text-teal-600 transition"
            >
              Liên hệ
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full group-hover:w-full transition-all" />
            </Link>

            <Link
              to="/gioi-thieu"
              className="relative group px-1 py-0.5 hover:text-teal-600 transition"
            >
              Giới thiệu
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full group-hover:w-full transition-all" />
            </Link>
          </nav>

          {/* SEARCH + USER DESKTOP */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </span>
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSuggest(true);
                }}
                placeholder="Tìm sản phẩm..."
                className="border border-white/80 bg-white/70 backdrop-blur-xl rounded-full pl-9 pr-4 py-2 text-xs md:text-sm w-44 md:w-64 focus:outline-none focus:ring-2 focus:ring-teal-400/70 shadow-[0_8px_24px_rgba(15,23,42,0.08)] placeholder:text-slate-400"
              />
              {showSuggest && suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl z-50">
                  {suggestions.map((p) => (
                    <div
                      key={p.ProductID}
                      onClick={() => {
                        navigate(`/chi-tiet/${p.CategorySlug}/${p.ProductCode}`);
                        setShowSuggest(false);
                        setKeyword("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-teal-50 cursor-pointer"
                    >
                      {/* ẢNH */}
                      <img
                        src={p.ImageURL || "/no-image.png"}
                        alt={p.ProductName}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />

                      {/* TEXT */}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {p.ProductName}
                        </p>
                        <p className="text-xs text-slate-500">
                          Từ {p.minPrice?.toLocaleString()}₫
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link to="/cart" className="relative">
              <div className="relative w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-[0_12px_30px_rgba(15,23,42,0.16)] hover:-translate-y-[1px] transition">
                <ShoppingCartIcon className="w-5 h-5 text-teal-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-rose-500 to-orange-400 text-white text-[10px] font-semibold rounded-full px-1.5 py-[1px] shadow-[0_8px_18px_rgba(248,113,113,0.7)]">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 bg-white/80 border border-white/90 rounded-full pl-1.5 pr-3 py-1 shadow-[0_10px_26px_rgba(15,23,42,0.12)] hover:bg-white transition"
                >
                  <img
                    src="/LogoHinh.png"
                    alt="user avatar"
                    className="w-7 h-7 rounded-full border border-teal-200 object-cover"
                  />
                  <span className="text-[12px] text-slate-800 font-semibold max-w-[150px] truncate">
                    {user.email}
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="text-[12px] text-rose-500 hover:text-rose-600 font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[13px] text-slate-700 font-medium hover:text-teal-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-[13px] font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-400 px-4 py-1.5 rounded-full shadow-[0_12px_30px_rgba(45,212,191,0.6)] hover:translate-y-[1px] transition"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-800"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.2)] border-b border-white/80 animate-slideDown z-40">
          <nav className="flex flex-col text-sm font-medium text-slate-700">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 hover:text-teal-600"
            >
              Trang chủ
            </Link>

            {/* Dropdown mobile */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setIsProductOpen(!isProductOpen)}
                className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-50 hover:text-teal-600"
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
                <div className="bg-slate-50 text-[13px]">
                  {categories.map((cat) => (
                    <Link
                      key={cat.CategoryID}
                      to={`/san-pham/${cat.Slug}`}
                      className="block px-6 py-2 border-t border-slate-100 hover:bg-white hover:text-teal-600"
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
              className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 hover:text-teal-600"
            >
              Liên hệ
            </Link>

            <Link
              to="/gioi-thieu"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 hover:text-teal-600"
            >
              Giới thiệu
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center justify-between px-4 py-3 border-b border-slate-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-slate-700 font-medium">Giỏ hàng</span>
              <div className="relative">
                <ShoppingCartIcon className="w-6 h-6 text-teal-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-[1px]">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {/* USER MOBILE */}
            <div className="px-4 py-4 flex flex-col gap-3 bg-slate-50/80">
              {user ? (
                <>
                  <div
                    onClick={() => {
                      handleProfileClick();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-full shadow-sm"
                  >
                    <img
                      src="/LogoHinh.png"
                      alt="user"
                      className="w-8 h-8 rounded-full border border-teal-200"
                    />
                    <span className="text-xs text-slate-800 font-semibold truncate">
                      {user.email}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 rounded-full text-sm transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 rounded-full text-sm transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-center border border-teal-500 text-teal-600 hover:bg-teal-50 font-medium py-2 rounded-full text-sm transition"
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
