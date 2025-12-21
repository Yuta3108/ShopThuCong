import axios from "axios";

const baseURL = process.env.GHN_BASE_URL;
const token = process.env.GHN_TOKEN;
const shopId = process.env.GHN_SHOP_ID;

if (!baseURL || !token || !shopId) {
  console.warn("[GHN] Missing env: GHN_BASE_URL / GHN_TOKEN / GHN_SHOP_ID");
}

const ghn = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Token: token,
    ShopId: String(shopId),
  },
});

// Helper: chuẩn hoá lỗi GHN cho dễ debug
function parseGhnError(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;
  return {
    status: status ?? 500,
    message:
      data?.message ||
      data?.code_message_value ||
      err?.message ||
      "GHN error",
    raw: data ?? null,
  };
}

/** GET /master-data/province */
export async function getProvinces() {
  try {
    const res = await ghn.get("/master-data/province");
    return res.data;
  } catch (err) {
    throw parseGhnError(err);
  }
}

/** GET /master-data/district?province_id= */
export async function getDistricts(provinceId) {
  try {
    const res = await ghn.get("/master-data/district", {
      params: { province_id: provinceId },
    });
    return res.data;
  } catch (err) {
    throw parseGhnError(err);
  }
}

/** GET /master-data/ward?district_id= */
export async function getWards(districtId) {
  try {
    const res = await ghn.get("/master-data/ward", {
      params: { district_id: districtId },
    });
    return res.data;
  } catch (err) {
    throw parseGhnError(err);
  }
}

/**
 * POST /v2/shipping-order/fee
 * service_type_id: 2 (nhanh) / 1 (thường) tuỳ GHN
 */
export async function estimateFee({
  to_district_id,
  to_ward_code,
  weight,
  length,
  width,
  height,
  service_type_id,
  insurance_value,
  cod_amount,
}) {
  try {
    const payload = {
      service_type_id,
      from_district_id: Number(process.env.GHN_FROM_DISTRICT),
      from_ward_code: String(process.env.GHN_FROM_WARD),

      to_district_id,
      to_ward_code,

      weight,
      length,
      width,
      height,

      insurance_value,
      cod_amount,
    };

    // Xoá field undefined/null để GHN khỏi bắt bẻ
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === "")
        delete payload[k];
    });

    const res = await ghn.post("/v2/shipping-order/fee", payload);
    return res.data;
  } catch (err) {
    throw parseGhnError(err);
  }
}

/** POST /v2/shipping-order/create */
export async function createShippingOrder({
  to_name,
  to_phone,
  to_address,
  to_district_id,
  to_ward_code,

  items,
  cod_amount,
  service_type_id,
  required_note = "KHONGCHOXEMHANG",

  weight,
  length,
  width,
  height,

  insurance_value,
  note = "Don hang tu he thong",
  payment_type_id = 2,
}) {
  try {
    const payload = {
      payment_type_id,
      required_note,
      note,

      from_name: process.env.SHOP_FROM_NAME,
      from_phone: process.env.SHOP_FROM_PHONE,
      from_address: process.env.SHOP_FROM_ADDRESS,
      from_district_id: Number(process.env.GHN_FROM_DISTRICT),
      from_ward_code: String(process.env.GHN_FROM_WARD),

      to_name,
      to_phone,
      to_address,
      to_district_id,
      to_ward_code,

      weight,
      length,
      width,
      height,

      cod_amount,
      service_type_id,
      insurance_value,

      items,
    };

    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === "")
        delete payload[k];
    });

    const res = await ghn.post("/v2/shipping-order/create", payload);
    return res.data;
  } catch (err) {
    throw parseGhnError(err);
  }
}
