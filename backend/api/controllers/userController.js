import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ===== Đăng ký =====
export const dangKy = async (req, res) => {
  try {
    // Nhận cả kiểu dữ liệu từ frontend (tenKhachHang) và postman (ho, ten)
    const { ho, ten, tenKhachHang, email, matKhau, sdt, diaChi, role } = req.body;

    // Gộp tên nếu frontend gửi tách, còn không thì dùng tenKhachHang
    const fullName = tenKhachHang || `${ho?.trim() || ""} ${ten?.trim() || ""}`.trim();

    if (!fullName || !email || !matKhau) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const [exists] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const finalRole = role?.toLowerCase() === "admin" ? "admin" : "customer";

    await db.query(
      `INSERT INTO users (Email, Password, FullName, Phone, Address, Role, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, fullName, sdt, diaChi, finalRole, 1]
    );

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi trong đăng ký:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// ===== Đăng nhập =====
export const dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Email không tồn tại." });

    const user = rows[0];

    // 🚨 Nếu tài khoản bị khóa
    if (user.Status === 0) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin." });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(matKhau, user.Password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu." });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.UserID, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      id: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      role: user.Role,
      token,
    });
  } catch (err) {
    console.error("🔥 Lỗi trong đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
