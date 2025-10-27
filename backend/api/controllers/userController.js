import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  createUser,
} from "../models/userModel.js";

// ===== Đăng ký =====
export const dangKy = async (req, res) => {
  try {
    const { ho, ten, tenKhachHang, email, matKhau, sdt, diaChi, role } = req.body;
    const fullName = tenKhachHang || `${ho?.trim() || ""} ${ten?.trim() || ""}`.trim();

    if (!fullName || !email || !matKhau)
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });

    const existed = await findUserByEmail(email);
    if (existed) return res.status(400).json({ message: "Email đã tồn tại." });

    const finalRole = role?.toLowerCase() === "admin" ? "admin" : "customer";
    await createUser({ email, password: matKhau, fullName, phone: sdt, address: diaChi, role: finalRole });

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// ===== Đăng nhập =====
export const dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Email không tồn tại." });

    if (user.Status === 0)
      return res.status(403).json({ message: "Tài khoản đã bị khóa." });

    const match = await bcrypt.compare(matKhau, user.Password);
    if (!match) return res.status(400).json({ message: "Sai mật khẩu." });

    const token = jwt.sign({ id: user.UserID, role: user.Role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      id: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      role: user.Role,
      token,
    });
  } catch (err) {
    console.error("🔥 Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
