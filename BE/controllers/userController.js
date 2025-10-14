import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

// Đăng ký
export const dangKy = (req, res) => {
  const { tenKhachHang, email, matKhau, sdt, diaChi, role } = req.body;

  const userRole = role || "khachhang"; // mặc định là khách hàng

  if (!tenKhachHang || !email || !matKhau) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });
  }

  const checkEmail = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmail, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi máy chủ." });
    if (result.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại." });
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const sql =
      "INSERT INTO users (tenKhachHang, email, matKhau, sdt, diaChi, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [tenKhachHang, email, hashedPassword, sdt, diaChi, userRole],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi khi tạo tài khoản." });
        return res.status(201).json({ message: "Đăng ký thành công!" });
      }
    );
  });
};

// Đăng nhập
export const dangNhap = (req, res) => {
  const { email, matKhau } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi máy chủ." });
    if (result.length === 0)
      return res.status(400).json({ message: "Email không tồn tại." });

    const user = result[0];
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu." });

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
  });
};
