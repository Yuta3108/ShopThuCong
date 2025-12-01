import db from "../config/db.js";
import bcrypt from "bcryptjs";

export const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    "SELECT UserID, Email, Password, FullName, Phone, Address, Role, Status,Verified FROM users WHERE Email = ? LIMIT 1",
    [email]
  );
  return rows[0];
};
export const findUserById = async (id) => {
  const [rows] = await db.query("SELECT * FROM users WHERE UserID = ?", [id]);
  return rows[0];
};

export const createUser = async ({ email, password, fullName, phone, address, role }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    `INSERT INTO users (Email, Password, FullName, Phone, Address, Role, Status, CreatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
    [email, hashedPassword, fullName, phone, address, role || "user"]
  );
  return result.insertId;
};

export const getAllUsers = async () => {
  const [rows] = await db.query(`
    SELECT 
      UserID, Email, FullName, Phone, Address, Role, Status,
      DATE_FORMAT(CreatedAt, '%Y-%m-%d %H:%i:%s') AS CreatedAt,
      DATE_FORMAT(UpdatedAt, '%Y-%m-%d %H:%i:%s') AS UpdatedAt
    FROM users
    ORDER BY CreatedAt DESC
  `);
  return rows;
};
export const getUserById = async (id) => {
  const [rows] = await db.query(
    "SELECT UserID, Email, FullName, Phone, Address, Role, Status FROM users WHERE UserID = ? LIMIT 1",
    [id]
  );
  return rows[0];
};

export const updateUserInfo = async (id, { fullName, phone, address }) => {
  const [result] = await db.query(
    "UPDATE users SET FullName = ?, Phone = ?, Address = ?, UpdatedAt = NOW() WHERE UserID = ?",
    [fullName, phone, address, id]
  );
  return result.affectedRows;
};
export const deleteUserById = async (id) => {
  const [result] = await db.query("DELETE FROM users WHERE UserID = ?", [id]);
  return result.affectedRows;
};

export const updateUserStatus = async (id, status) => {
  const [result] = await db.query(
    "UPDATE users SET Status = ?, UpdatedAt = NOW() WHERE UserID = ?",
    [status, id]
  );
  return result.affectedRows;
};

export const verifyUserCredentials = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.Password);
  if (!isMatch) return null;

  const { Password, ...safeUser } = user;
  return safeUser;
};

export const updateUserPassword = async (id, hashedPassword) => {
  await db.query("UPDATE users SET Password = ? WHERE UserID = ?", [hashedPassword, id]);
  return true;
};