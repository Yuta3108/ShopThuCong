import axios from "axios";
import Swal from "sweetalert2";

const API = "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Gắn token tự động nếu có
axiosClient.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.error("Không lấy được token:", err);
  }
  return config;
});

//  Xử lý lỗi chung
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      "Lỗi không xác định khi gọi API";

    Swal.fire({
      icon: "error",
      title: "Lỗi API",
      text: message,
    });
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(err);
  }
);

// =================  PRODUCTS =================
export const saveProduct = async (prod, isEdit = false) => {
  const url = isEdit ? `/products/${prod.ProductID}` : `/products`;
  const method = isEdit ? "put" : "post";
  const { data } = await axiosClient[method](url, prod);
  return data;
};

export const deleteProduct = async (id) => {
  await axiosClient.delete(`/products/${id}`);
};

// =================  VARIANTS =================
export const saveVariant = async (ProductID, variant, isEdit = false) => {
  const url = isEdit
    ? `/variants/${variant.VariantID}`
    : `/variants/${ProductID}`;
  const method = isEdit ? "put" : "post";
  const { data } = await axiosClient[method](url, variant);
  return data;
};

export const deleteVariant = async (variantId) => {
  await axiosClient.delete(`/variants/${variantId}`);
};

export const uploadVariantImage = async (variantId, imgBase64) => {
  await axiosClient.post(`/variants/${variantId}/images`, { image: imgBase64 });
};

export const deleteImage = async (imageId) => {
  await axiosClient.delete(`/variants/images/${imageId}`);
};

// =================  ATTRIBUTES =================
export const createAttribute = async (AttributeName) => {
  await axiosClient.post(`/attributes`, { AttributeName });
};

export const updateAttribute = async (id, name) => {
  await axiosClient.put(`/attributes/${id}`, { AttributeName: name });
};

export const deleteAttribute = async (id) => {
  await axiosClient.delete(`/attributes/${id}`);
};

export const createAttributeValue = async (AttributeID, Value) => {
  await axiosClient.post(`/attribute-values`, { AttributeID, Value });
};

export const deleteAttributeValue = async (id) => {
  await axiosClient.delete(`/attribute-values/${id}`);
};
