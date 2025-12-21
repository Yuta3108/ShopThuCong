import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; 
import userManageRoutes from "./routes/userManageRoutes.js";
import categoryRoutes from "./routes/CategoryRoutes.js";
import productRoutes from "./routes/productsRoutes.js";
import attributesRoutes from "./routes/attributesRoutes.js";
import attributeValuesRoutes from "./routes/attributeValuesRoutes.js";
import variantAttributesRoutes from "./routes/variantAttributesRoutes.js";
import variantRoutes from "./routes/variantsRoutes.js";
import voucherRoutes from "./routes/voucherRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"
import zaloPayRoutes from "./ZaloPay/zaloPayRoutes.js";
import shippingRoutes from "./GHN/shippingRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes);
app.use("/api/users", userManageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/attributes", attributesRoutes);
app.use("/api/attribute-values", attributeValuesRoutes);
app.use("/api/variant-attributes", variantAttributesRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", zaloPayRoutes);
app.use("/api/shipping", shippingRoutes);
app.get("/", (req, res) => {
  res.send("Backend API đang chạy trên Vercel");
});

export default app;
