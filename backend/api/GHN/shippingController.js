import {
  getProvinces,
  getDistricts,
  getWards,
  estimateFee,
  createShippingOrder,
} from "./ghnService.js";

// Master data
export const ghnGetProvinces = async (req, res) => {
  try {
    const data = await getProvinces();
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

export const ghnGetDistricts = async (req, res) => {
  try {
    const { province_id } = req.query;
    if (!province_id) return res.status(400).json({ message: "Missing province_id" });

    const data = await getDistricts(province_id);
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

export const ghnGetWards = async (req, res) => {
  try {
    const { district_id } = req.query;
    if (!district_id) return res.status(400).json({ message: "Missing district_id" });

    const data = await getWards(district_id);
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

// Fee
export const ghnEstimateFee = async (req, res) => {
  try {
    const {
      to_district_id,
      to_ward_code,
      weight,
      length,
      width,
      height,
      service_id,
      insurance_value,
      cod_amount,
    } = req.body;

    if (!to_district_id || !to_ward_code) {
      return res.status(400).json({ message: "Missing to_district_id / to_ward_code" });
    }

    const data = await estimateFee({
      to_district_id: Number(to_district_id),
      to_ward_code: String(to_ward_code),
      weight: Number(weight || 500),
      length: Number(length || 20),
      width: Number(width || 15),
      height: Number(height || 10),
      service_id: Number(service_id),
      insurance_value: insurance_value ? Number(insurance_value) : undefined,
      cod_amount: cod_amount ? Number(cod_amount) : undefined,
    });

    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};

// Create shipping order (GHN)
export const ghnCreateOrder = async (req, res) => {
  try {
    const payload = req.body;

    // validate tối thiểu
    const required = ["to_name", "to_phone", "to_address", "to_district_id", "to_ward_code", "items"];
    for (const k of required) {
      if (!payload?.[k]) {
        return res.status(400).json({ message: `Missing ${k}` });
      }
    }

    const data = await createShippingOrder({
      to_name: payload.to_name,
      to_phone: payload.to_phone,
      to_address: payload.to_address,
      to_district_id: Number(payload.to_district_id),
      to_ward_code: String(payload.to_ward_code),

      items: payload.items,
      cod_amount: payload.cod_amount ? Number(payload.cod_amount) : 0,
      service_id: Number(payload.service_id || 53321),
      required_note: payload.required_note || "KHONGCHOXEMHANG",

      weight: Number(payload.weight || 500),
      length: Number(payload.length || 20),
      width: Number(payload.width || 15),
      height: Number(payload.height || 10),

      insurance_value: payload.insurance_value ? Number(payload.insurance_value) : undefined,
      note: payload.note,
      payment_type_id: payload.payment_type_id ? Number(payload.payment_type_id) : 2,
    });

    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json(err);
  }
};
