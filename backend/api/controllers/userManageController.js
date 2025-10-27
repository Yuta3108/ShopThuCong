import {
  getAllUsers,
  getUserById,
  updateUserInfo,
  deleteUserById,
  updateUserStatus,
} from "../models/userModel.js";

// ===== Xem tất cả user (Admin) =====
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Lỗi getAllUsers:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Xem thông tin user =====
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (req.user.role !== "admin" && userId !== parseInt(id))
      return res.status(403).json({ message: "Bạn không thể xem tài khoản người khác!" });

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    console.error("Lỗi getUserById:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Cập nhật thông tin =====
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address } = req.body;

    if (req.user.role !== "admin" && req.user.id !== parseInt(id))
      return res.status(403).json({ message: "Bạn chỉ được sửa tài khoản của mình." });

    const updated = await updateUserInfo(id, { fullName, phone, address });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error("Lỗi updateUser:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Xóa user =====
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user.id !== parseInt(id))
      return res.status(403).json({ message: "Bạn chỉ được xóa tài khoản của mình." });

    await deleteUserById(id);
    res.json({ message: "Xoá tài khoản thành công!" });
  } catch (err) {
    console.error("Lỗi deleteUser:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// ===== Cập nhật trạng thái =====
export const updateUserStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    if (![0, 1].includes(Status))
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });

    await updateUserStatus(id, Status);
    res.json({ message: "Cập nhật trạng thái thành công!" });
  } catch (err) {
    console.error("Lỗi updateUserStatus:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
