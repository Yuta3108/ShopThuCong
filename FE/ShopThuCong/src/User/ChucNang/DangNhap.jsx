import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";


function DangNhap() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`https://shopthucong.vercel.app/api/khachhang/dangnhap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matKhau: password }),
      });

      if (!response.ok) {
        setError("Sai tài khoản hoặc mật khẩu.");
        setPassword("");
        return;
      }

      const data = await response.json();
      if (data && data.email) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);
        if(data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        } 
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setError("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="bg-fixed bg-cover min-h-screen flex flex-col">
      <Header />
      {/* Form Container */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6 text-purple-700">
            Đăng Nhập
          </h2>

          {error && (
            <p className="text-red-600 mb-4 text-center text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-400 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <span className="text-xl select-none">
                    {showPassword ? "🙈" : "👁️"}
                    </span>
              </button>
            </div>
            <button type="QuenMK" className=" text-blue-800  font-semibold hover:opacity-90 transition-all " >Quên Mật khẩu </button>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-t from-purple-800 via-purple-500 to-purple-400 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Đăng Nhập
            </button>
          </form>

          {/* Social Login */}
          <div className="space-y-3 mt-8">
            <button className="flex items-center gap-3 justify-center shadow-md p-3 rounded-md bg-white border border-gray-200 w-full hover:bg-gray-50">
              <img
                src="./gg_icon.png"
                height={24}
                width={24}
                alt="Google Logo"
              />
              <span>Đăng nhập với Google</span>
            </button>
            <button className="flex items-center gap-3 justify-center shadow-md p-3 rounded-md bg-white border border-gray-200 w-full hover:bg-gray-50">
              <img
                src="./fb_icon.png"
                height={24}
                width={24}
                alt="Facebook Logo"
              />
              <span>Đăng nhập với Facebook</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-700">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-purple-700 font-medium hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DangNhap;
