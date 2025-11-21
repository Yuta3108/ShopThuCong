import { Cart } from "../models/CartModel.js";
import { CartItem } from "../models/CartItemModel.js";
import db from "../config/db.js";

// ================================
//  LẤY GIỎ HÀNG USER
// ================================
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let [cartRows] = await Cart.getCartByUserId(userId);

    if (!cartRows.length) {
      return res.json({ items: [] });
    }

    const cartId = cartRows[0].CartID;

    const [items] = await CartItem.getCartItems(cartId);

    res.json({ items });
  } catch (err) {
    console.log("GET CART ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng." });
  }
};

// ================================
//  THÊM VÀO GIỎ HÀNG
// ================================
export const addToCart = async (req, res) => {
  try {
    const { variantId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!variantId)
      return res.status(400).json({ message: "Thiếu VariantID" });

    // Lấy cart theo user
    let [cartRows] = await Cart.getCartByUserId(userId);

    // Nếu chưa có → tạo mới
    if (!cartRows.length) {
      await Cart.createCart(userId);
      [cartRows] = await Cart.getCartByUserId(userId);
    }

    const cartId = cartRows[0].CartID;

    // Kiểm tra item tồn tại chưa
    const [existArr] = await CartItem.findItem(cartId, variantId);
    const exist = existArr[0];

    if (exist) {
      await CartItem.updateQuantity(
        exist.CartItemID,
        exist.Quantity + quantity
      );
    } else {
      await CartItem.addItem(cartId, variantId, quantity);
    }

    res.json({ message: "Đã thêm vào giỏ hàng!" });
  } catch (err) {
    console.log("ADD CART ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi thêm giỏ hàng." });
  }
};

// ================================
//  XOÁ ITEM
// ================================
export const removeCartItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    await CartItem.deleteItem(itemId);

    res.json({ message: "Đã xoá item khỏi giỏ hàng" });
  } catch (err) {
    console.error("REMOVE CART ITEM ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi xoá item." });
  }
};

// ================================
//  CẬP NHẬT SỐ LƯỢNG
// ================================
export const updateQuantity = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body;

    await CartItem.updateQuantity(itemId, quantity);

    res.json({ message: "Đã cập nhật" });
  } catch (err) {
    console.log("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật số lượng." });
  }
};

// ================================
//  MERGE LOCAL CART → SERVER CART
// ================================
export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Thiếu items." });
    }

    let [cartRows] = await Cart.getCartByUserId(userId);

    if (!cartRows.length) {
      await Cart.createCart(userId);
      [cartRows] = await Cart.getCartByUserId(userId);
    }

    const cartId = cartRows[0].CartID;

    for (const item of items) {
      const [existArr] = await CartItem.findItem(cartId, item.VariantID);
      const exist = existArr[0];

      if (exist) {
        await CartItem.updateQuantity(
          exist.CartItemID,
          exist.Quantity + item.quantity
        );
      } else {
        await CartItem.addItem(cartId, item.VariantID, item.quantity);
      }
    }

    res.json({ message: "Merge giỏ hàng thành công!" });
  } catch (err) {
    console.log("MERGE CART ERROR:", err);
    res.status(500).json({ message: "Merge giỏ hàng thất bại." });
  }
};
