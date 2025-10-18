// controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// ===== Đăng ký =====
export const dangKy = async (req, res) => {
  try {
    const { tenKhachHang, email, matKhau, sdt, diaChi, role } = req.body;
    const userRole = role || "khachhang";

    if (!tenKhachHang || !email || !matKhau) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // Kiểm tra email tồn tại
    const [exists] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }
    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const sql =
      "INSERT INTO users (tenKhachHang, email, matKhau, sdt, diaChi, role) VALUES (?, ?, ?, ?, ?, ?)";
    await db.query(sql, [tenKhachHang, email, hashedPassword, sdt, diaChi, userRole]);

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

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Email không tồn tại." });

    const user = rows[0];

    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch)
      return res.status(400).json({ message: "Sai mật khẩu." });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      id: user.id,
      email: user.email,
      tenKhachHang: user.tenKhachHang,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("🔥 Lỗi trong đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
