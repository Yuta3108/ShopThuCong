import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"; 
import userManageRoutes from "./routes/userManageRoutes.js";
import categoryRoutes from "./routes/CategoryRoute.js";
import productRoutes from "./routes/productsRoute.js";
import attributesRoute from "./routes/attributesRoute.js";
import attributeValuesRoute from "./routes/attributeValuesRoute.js";
import variantAttributesRoute from "./routes/variantAttributesRoute.js";
import variantRoutes from "./routes/variantRoute.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.json());


app.use("/api", userRoutes);
app.use("/api/users", userManageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/attributes", attributesRoute);
app.use("/api/attribute-values", attributeValuesRoute);
app.use("/api/variant-attributes", variantAttributesRoute);
app.get("/", (req, res) => {
  res.send("Backend API đang chạy trên Vercel");
});

export default app;
