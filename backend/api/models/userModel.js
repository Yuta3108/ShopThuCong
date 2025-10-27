import db from "../config/db.js";
import bcrypt from "bcryptjs";

// === Các truy vấn người dùng ===
export const findUserByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
  return rows[0];
};

export const createUser = async ({ email, password, fullName, phone, address, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    `INSERT INTO users (Email, Password, FullName, Phone, Address, Role, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [email, hashedPassword, fullName, phone, address, role, 1]
  );
  return result.insertId;
};

export const getAllUsers = async () => {
  const [rows] = await db.query(
    "SELECT UserID, Email, FullName, Phone, Address, Role, Status, CreatedAt FROM users"
  );
  return rows;
};

export const getUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT UserID, Email, FullName, Phone, Address, Role, Status FROM users WHERE UserID = ?",
    [id]
  );
  return rows[0];
};

export const updateUserInfo = async (id, { fullName, phone, address }) => {
  const [result] = await db.query(
    "UPDATE users SET FullName=?, Phone=?, Address=?, UpdatedAt=NOW() WHERE UserID=?",
    [fullName, phone, address, id]
  );
  return result.affectedRows;
};

export const deleteUserById = async (id) => {
  const [result] = await db.query("DELETE FROM users WHERE UserID = ?", [id]);
  return result.affectedRows;
};

export const updateUserStatus = async (id, status) => {
  const [result] = await db.query("UPDATE users SET Status=? WHERE UserID=?", [status, id]);
  return result.affectedRows;
};
