import db from "../config/db.js";

// ===== Xem danh sách tất cả user (chỉ admin) =====
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT UserID, Email, FullName, Phone, Address, Role, Status, CreatedAt FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error("Lỗi getAllUsers:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Xem thông tin user hiện tại =====
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; 

    // Nếu không phải admin và không phải chính mình => chặn
    if (req.user.role !== "admin" && userId !== parseInt(id)) {
      return res.status(403).json({ message: "Bạn không thể xem tài khoản người khác!" });
    }

    const [rows] = await db.query("SELECT UserID, Email, FullName, Phone, Address, Role, Status FROM users WHERE UserID = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(rows[0]);
  } catch (err) {
    console.error(" Lỗi getUserById:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Sửa thông tin user (chỉ user tự sửa mình) =====
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address } = req.body;
    const userId = req.user.id;

    // Chỉ cho phép sửa nếu là chính mình
    if (req.user.role !== "admin" && userId !== parseInt(id)) {
      return res.status(403).json({ message: "Bạn chỉ có thể sửa tài khoản của mình." });
    }

    const [result] = await db.query(
      "UPDATE users SET FullName = ?, Phone = ?, Address = ?, UpdatedAt = NOW() WHERE UserID = ?",
      [fullName, phone, address, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error("Lỗi updateUser:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Xoá user (chỉ user tự xoá mình) =====
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (req.user.role !== "admin" && userId !== parseInt(id)) {
      return res.status(403).json({ message: "Bạn chỉ có thể xoá tài khoản của mình." });
    }

    await db.query("DELETE FROM users WHERE UserID = ?", [id]);
    res.json({ message: "Xoá tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi deleteUser:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
// PUT /api/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    // Chỉ chấp nhận giá trị 0 hoặc 1
    if (Status !== 0 && Status !== 1) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    await db.query("UPDATE users SET Status = ? WHERE UserID = ?", [Status, id]);

    res.json({ message: "Cập nhật trạng thái người dùng thành công!" });
  } catch (err) {
    console.error("🔥 Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
