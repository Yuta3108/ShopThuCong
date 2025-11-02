import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import nodemailer from "nodemailer";
import { findUserByEmail, createUser } from "../models/userModel.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.UserID, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

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
    await createUser({
      email,
      password: matKhau,
      fullName,
      phone: sdt,
      address: diaChi,
      role: finalRole,
    });

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
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

    const token = generateToken(user);
    res.json({
      id: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      role: user.Role,
      token,
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

// ===== Yêu cầu đặt lại mật khẩu =====
export const yeuCauDatLaiMatKhau = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email." });

    const [rows] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });

    const token = crypto.randomBytes(20).toString("hex");
    const expireTime = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE users SET resetToken = ?, resetExpires = ? WHERE Email = ?",
      [token, expireTime, email]
    );

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Then Fong Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Đặt lại mật khẩu - Then Fong Store",
      html: `
        <h2>Xin chào!</h2>
        <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p><i>Liên kết này sẽ hết hạn sau 5 phút.</i></p>
      `,
    });

    console.log("📧 Link đặt lại mật khẩu:", resetLink);
    res.json({ message: "Liên kết đặt lại mật khẩu đã được gửi qua email." });
  } catch (err) {
    console.error("Lỗi yêu cầu đặt lại mật khẩu:", err);
    res.status(500).json({ message: "Không thể gửi email đặt lại mật khẩu." });
  }
};

// ===== Đặt lại mật khẩu =====
export const datLaiMatKhau = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới." });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW()",
      [token]
    );
    if (rows.length === 0)
      return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET Password = ?, resetToken = NULL, resetExpires = NULL WHERE UserID = ?",
      [hashed, rows[0].UserID]
    );

    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đặt lại mật khẩu:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
