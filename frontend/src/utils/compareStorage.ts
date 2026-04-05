const COMPARE_STORAGE_KEY = "compareProducts";
const MAX_COMPARE_PRODUCTS = 4;

function parseCompareIds(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  } catch {
    return [];
  }
}

function saveCompareIds(productIds: number[]) {
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(productIds));
  window.dispatchEvent(new Event("compare-updated"));
}

export function getCompareProductIds() {
  return parseCompareIds(localStorage.getItem(COMPARE_STORAGE_KEY));
}

export function isInCompare(productId: number) {
  return getCompareProductIds().includes(productId);
}

export function getCompareCount() {
  return getCompareProductIds().length;
}

export function addProductToCompare(productId: number) {
  const productIds = getCompareProductIds();

  if (productIds.includes(productId)) {
    throw new Error("Sản phẩm này đã có trong danh sách so sánh");
  }

  if (productIds.length >= MAX_COMPARE_PRODUCTS) {
    throw new Error("Chỉ được so sánh tối đa 4 sản phẩm");
  }

  const nextIds = [...productIds, productId];
  saveCompareIds(nextIds);
  return nextIds;
}

export function removeProductFromCompare(productId: number) {
  const nextIds = getCompareProductIds().filter((id) => id !== productId);
  saveCompareIds(nextIds);
  return nextIds;
}

export function clearCompareProducts() {
  saveCompareIds([]);
}

export function toggleCompareProduct(productId: number) {
  if (isInCompare(productId)) {
    return {
      productIds: removeProductFromCompare(productId),
      added: false,
      message: "Đã xóa sản phẩm khỏi danh sách so sánh",
    };
  }

  return {
    productIds: addProductToCompare(productId),
    added: true,
    message: "Đã thêm sản phẩm vào danh sách so sánh",
  };
}

export { COMPARE_STORAGE_KEY, MAX_COMPARE_PRODUCTS };
