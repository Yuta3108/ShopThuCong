import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "../config/db.js";
import nodemailer from "nodemailer";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateUserPassword,
} from "../models/userModel.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.UserID, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const dangKy = async (req, res) => {
  try {
    const { ho, ten, tenKhachHang, email, matKhau, sdt, diaChi, role } =
      req.body;

    const fullName =
      tenKhachHang || `${ho?.trim() || ""} ${ten?.trim() || ""}`.trim();

    if (!fullName || !email || !matKhau)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });

    const existed = await findUserByEmail(email);
    if (existed)
      return res.status(400).json({ message: "Email đã tồn tại." });

    const finalRole =
      role?.toLowerCase() === "admin" ? "admin" : "customer";

    await createUser({
      email,
      password: matKhau,
      fullName,
      phone: sdt,
      address: diaChi,
      role: finalRole,
    });

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

export const dangNhap = async (req, res) => {
  try {
    const { email, matKhau } = req.body;
    const user = await findUserByEmail(email);

    if (!user)
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });

    if (user.Status === 0)
      return res.status(403).json({ message: "Tài khoản đã bị khóa." });

    const match = await bcrypt.compare(matKhau, user.Password);
    if (!match)
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng." });

    const token = generateToken(user);

    res.json({
      id: user.UserID,
      email: user.Email,
      fullName: user.FullName,
      role: user.Role,
      token,
    });
  } catch {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

export const yeuCauDatLaiMatKhau = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Vui lòng nhập email." });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE Email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.json({
        message: "Nếu email hợp lệ, liên kết đặt lại mật khẩu đã được gửi.",
      });

    await db.query(
      "UPDATE users SET resetToken = NULL, resetExpires = NULL WHERE Email = ?",
      [email]
    );

    const token = crypto.randomBytes(20).toString("hex");
    const expireTime = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      "UPDATE users SET resetToken = ?, resetExpires = ? WHERE Email = ?",
      [token, expireTime, email]
    );

    const resetLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const user = rows[0];

    await transporter.sendMail({
      from: `"Then Fong Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Đặt lại mật khẩu - Then Fong Store",
      html: `
        <h2>Xin chào ${user.FullName || "bạn"}!</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
        <a href="${resetLink}"
           target="_blank"
           style="display:inline-block;padding:10px 18px;background-color:#14b8a6;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;margin:8px 0;">
           Đặt lại mật khẩu
        </a>
        <p>Liên kết này có hiệu lực trong 5 phút.</p>
      `,
    });

    res.json({
      message:
        "Liên kết đặt lại mật khẩu đã được gửi nếu email hợp lệ!",
    });
  } catch {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

export const datLaiMatKhau = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Thiếu token hoặc mật khẩu mới." });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE resetToken = ? AND resetExpires > NOW()",
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Mã đã hết hạn." });

    const user = rows[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET Password = ?, resetToken = NULL, resetExpires = NULL WHERE UserID = ?",
      [hashed, user.UserID]
    );

    res.json({ message: "Đặt lại mật khẩu thành công!" });
  } catch {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

export const doiMatKhau = async (req, res) => {
  try {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.",
      });

    const user = await findUserById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng." });

    const match = await bcrypt.compare(oldPassword, user.Password);
    if (!match)
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không đúng." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, hashed);

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi máy chủ.", error: err.message });
  }
};

setInterval(async () => {
  try {
    await db.query(
      "UPDATE users SET resetToken = NULL, resetExpires = NULL WHERE resetExpires < NOW()"
    );
  } catch {}
}, 6 * 60 * 1000);
