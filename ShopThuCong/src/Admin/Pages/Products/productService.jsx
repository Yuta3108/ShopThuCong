
import Swal from "sweetalert2";
const API = "https://backend-eta-ivory-29.vercel.app/api";

const getAuthHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) return { Authorization: `Bearer ${user.token}` };
  } catch {}
  return {};
};

/** ================= PRODUCTS ================= */
export const saveProduct = async (prod, isEdit = false) => {
  const url = isEdit ? `${API}/products/${prod.ProductID}` : `${API}/products`;
  const method = isEdit ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(prod),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi API sản phẩm");
  return data;
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Không thể xoá sản phẩm");
};

/** ================= VARIANTS ================= */
export const saveVariant = async (ProductID, variant, isEdit = false) => {
  const url = isEdit
    ? `${API}/variants/${variant.VariantID}`
    : `${API}/variants/${ProductID}`;
  const method = isEdit ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(variant),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi API biến thể");
  return data;
};

export const deleteVariant = async (variantId) => {
  await fetch(`${API}/variants/${variantId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const uploadVariantImage = async (variantId, imgBase64) => {
  await fetch(`${API}/variants/${variantId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ image: imgBase64 }),
  });
};

export const deleteImage = async (imageId) => {
  await fetch(`${API}/variants/images/${imageId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

/** ================= ATTRIBUTES ================= */
export const createAttribute = async (AttributeName) => {
  await fetch(`${API}/attributes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ AttributeName }),
  });
};

export const updateAttribute = async (id, name) => {
  await fetch(`${API}/attributes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ AttributeName: name }),
  });
};

export const deleteAttribute = async (id) => {
  await fetch(`${API}/attributes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const createAttributeValue = async (AttributeID, Value) => {
  await fetch(`${API}/attribute-values`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ AttributeID, Value }),
  });
};

export const deleteAttributeValue = async (id) => {
  await fetch(`${API}/attribute-values/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};
