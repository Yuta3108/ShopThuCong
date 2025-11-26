import { Cart } from "../models/CartModel.js";
import { CartItem } from "../models/CartItemModel.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) return res.json({ items: [] });

    const cartId = cartRows[0].CartID;
    const [items] = await CartItem.getCartItems(cartId);

    res.json({ items });
  } catch {
    res.status(500).json({ message: "Lỗi server khi lấy giỏ hàng." });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { variantId, quantity = 1 } = req.body;
    const userId = req.user.id;

    if (!variantId) return res.status(400).json({ message: "Thiếu VariantID" });

    let [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) {
      await Cart.createCart(userId);
      [cartRows] = await Cart.getCartByUserId(userId);
    }

    const cartId = cartRows[0].CartID;
    const [existArr] = await CartItem.findItem(cartId, variantId);
    const exist = existArr[0];

    if (exist) {
      await CartItem.updateQuantity(exist.CartItemID, exist.Quantity + quantity);
    } else {
      await CartItem.addItem(cartId, variantId, quantity);
    }

    res.json({ message: "Đã thêm vào giỏ hàng!" });
  } catch {
    res.status(500).json({ message: "Lỗi server khi thêm giỏ hàng." });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    await CartItem.deleteItem(req.params.id);
    res.json({ message: "Đã xoá item khỏi giỏ hàng" });
  } catch {
    res.status(500).json({ message: "Lỗi server khi xoá item." });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    await CartItem.updateQuantity(req.params.id, req.body.quantity);
    res.json({ message: "Đã cập nhật" });
  } catch {
    res.status(500).json({ message: "Lỗi server khi cập nhật số lượng." });
  }
};

export const mergeCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    let [cartRows] = await Cart.getCartByUserId(userId);
    if (!cartRows.length) {
      await Cart.createCart(userId);
      [cartRows] = await Cart.getCartByUserId(userId);
    }

    const cartId = cartRows[0].CartID;

    for (const item of items) {
      const [existArr] = await CartItem.findItem(cartId, item.VariantID);
      if (!existArr[0]) {
        await CartItem.addItem(cartId, item.VariantID, item.quantity);
      }
    }

    res.json({ message: "Merge giỏ hàng thành công!" });
  } catch {
    res.status(500).json({ message: "Merge giỏ hàng thất bại." });
  }
};
