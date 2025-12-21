import express from "express";
import {
  ghnGetProvinces,
  ghnGetDistricts,
  ghnGetWards,
  ghnEstimateFee,
  ghnCreateOrder,
} from "./shippingController.js";

const router = express.Router();

// Master data
router.get("/ghn/provinces", ghnGetProvinces);
router.get("/ghn/districts", ghnGetDistricts); // ?province_id=
router.get("/ghn/wards", ghnGetWards);         // ?district_id=

// Fee + Create
router.post("/ghn/fee", ghnEstimateFee);
router.post("/ghn/create", ghnCreateOrder);

export default router;
