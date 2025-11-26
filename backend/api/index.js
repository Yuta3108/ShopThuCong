import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; 
import userManageRoutes from "./routes/userManageRoutes.js";
import categoryRoutes from "./routes/CategoryRoute.js";
import productRoutes from "./routes/productsRoute.js";
import attributesRoutes from "./routes/attributesRoute.js";
import attributeValuesRoutes from "./routes/attributeValuesRoute.js";
import variantAttributesRoutes from "./routes/variantAttributesRoute.js";
import variantRoutes from "./routes/variantsRoute.js";
import voucherRoutes from "./routes/voucherRoute.js";
import cartRoutes from "./routes/cartRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
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
app.use("/api/cart", cartRoutes);
app.get("/", (req, res) => {
  res.send("Backend API đang chạy trên Vercel");
});

export default app;
