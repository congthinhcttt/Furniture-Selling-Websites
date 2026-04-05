const INTERIOR_IMAGE_FALLBACK = "/images/products/fallback-interior.jpg";
const GROUP_IMAGE_FALLBACK = "/images/groups/fallback-group.jpg";

const PRODUCT_FILENAMES = new Set([
  "sofa.jpg",
  "sofa-vai-kem.jpg",
  "sofa-goc-xanh.jpg",
  "sofa-da-ghi.jpg",
  "ban-tra.jpg",
  "ban-tra-go.jpg",
  "ban-tra-kinh.jpg",
  "ban-tra-chan-sat.jpg",
  "ke-tivi-oc-cho.jpg",
  "ke-tivi-trang.jpg",
  "ghe-don-ni.jpg",
  "ghe-don-xam.jpg",
  "giuong-go-mdf.jpg",
  "giuong-co-dien.jpg",
  "tu-3-canh.jpg",
  "tu-cua-lua.jpg",
  "tab-go-nho.jpg",
  "tab-trang.jpg",
  "ban-an-4-ghe.jpg",
  "ban-an-6-ghe.jpg",
  "ghe-an-be.jpg",
  "ghe-an-den.jpg",
  "tu-bep-trang.jpg",
  "tu-bep-chu-l.jpg",
  "ban-lam-viec-go.jpg",
  "ban-lam-viec-hoc-tu.jpg",
  "ghe-xoay-luoi.jpg",
  "ghe-van-phong-cao-cap.jpg",
  "ke-sach-5-tang.jpg",
  "ke-sach-trang.jpg",
  "den-ban-vang.jpg",
  "den-cay-den.jpg",
  "tham-xam.jpg",
  "tham-kem.jpg",
  "guong-vang-dong.jpg",
  "guong-tron-den.jpg",
]);

const GROUP_FILENAMES = new Set([
  "living-room.jpg",
  "bedroom.jpg",
  "dining-room.jpg",
  "office.jpg",
  "decor.jpg",
]);

export function buildImageUrl(image?: string, fallback?: string) {
  if (!image) {
    return fallback || INTERIOR_IMAGE_FALLBACK;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/images/products/")) {
    return image;
  }
  if (image.startsWith("/images/groups/")) {
    return image;
  }

  const normalized = image.trim().toLowerCase();
  const filename = normalized.split("/").pop() || normalized;

  if (PRODUCT_FILENAMES.has(filename)) {
    return `/images/products/${filename}`;
  }
  if (GROUP_FILENAMES.has(filename)) {
    return `/images/groups/${filename}`;
  }

  return fallback || (filename.includes("room") ? GROUP_IMAGE_FALLBACK : INTERIOR_IMAGE_FALLBACK);
}
