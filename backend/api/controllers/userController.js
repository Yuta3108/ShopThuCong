import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { findUserByEmail, createUser,findUserById,updateUserPassword } from "../models/userModel.js";
const resend = new Resend(process.env.RESEND_API_KEY);
// ===== JWT =====
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
    if (existed)
      return res.status(400).json({ message: "Email đã tồn tại." });

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
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ===== Đăng nhập =====
export const dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    const user = await findUserByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng." });

    if (user.Status === 0)
      return res.status(403).json({ message: "Tài khoản đã bị khóa." });

    const match = await bcrypt.compare(matKhau, user.Password);
    if (!match)
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng." });

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
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ===== Yêu cầu đặt lại mật khẩu =====
export const yeuCauDatLaiMatKhau = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Vui lòng nhập email." });

    // Luôn trả phản hồi để tránh lộ email hợp lệ
    res.json({
      message: "Nếu email hợp lệ, liên kết đặt lại mật khẩu đã được gửi.",
    });

    // Kiểm tra người dùng
    const [rows] = await db.query("SELECT * FROM users WHERE Email = ?", [
      email,
    ]);
    if (rows.length === 0) return;

    const user = rows[0];

    // Xóa token cũ nếu có
    await db.query(
      "UPDATE users SET resetToken = NULL, resetExpires = NULL WHERE Email = ?",
      [email]
    );

    // Tạo token mới (hết hạn sau 5 phút)
    const token = crypto.randomBytes(20).toString("hex");
    const expireTime = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE users SET resetToken = ?, resetExpires = ? WHERE Email = ?",
      [token, expireTime, email]
    );

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${token}`;

    // === Gửi email bằng Resend ===
    try {
      await resend.emails.send({
        from: "Then Fong Store <onboarding@resend.dev>",
        to: email,
        subject: "Đặt lại mật khẩu - Then Fong Store",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;">
            <h2>Xin chào ${user.FullName || "bạn"}!</h2>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại <b>Then Fong Store</b>.</p>
            <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
            <a href="${resetLink}" 
               style="display:inline-block;padding:10px 18px;background-color:#14b8a6;
               color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;margin:10px 0;">
               Đặt lại mật khẩu
            </a>
            <p><i>Liên kết này có hiệu lực trong 5 phút. Sau đó bạn có thể yêu cầu lại.</i></p>
          </div>
        `,
      });
      console.log("🔑 RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Đã nạp" : "MẤT!");

    } catch (mailError) {
      console.error("❌ Lỗi khi gửi email qua Resend:", mailError);
    }
  } catch (err) {
    console.error("🔥 Lỗi yêu cầu đặt lại mật khẩu:", err);
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
      return res.status(400).json({ message: "Mã Của bạn đã hết hạn." });

    const user = rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET Password = ?, resetToken = NULL, resetExpires = NULL WHERE UserID = ?",
      [hashed, user.UserID]
    );

    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đặt lại mật khẩu:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
// ===== Đổi mật khẩu =====
export const doiMatKhau = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới." });

    const user = await findUserById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const match = await bcrypt.compare(oldPassword, user.Password);
    if (!match)
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, hashed);

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "Lỗi máy chủ.", error: err.message });
  }
};
setInterval(async () => {
  try {
    await db.query("UPDATE users SET resetToken = NULL, resetExpires = NULL WHERE resetExpires < NOW()");
  } catch (err) {
    console.error("⚠️ Dọn token lỗi:", err);
  }
}, 6 * 60 * 1000);
