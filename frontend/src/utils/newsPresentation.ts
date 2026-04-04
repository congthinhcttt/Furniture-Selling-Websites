import type { NewsArticle } from "../types/news";

interface NewsPresentation {
  topic: string;
  title: string;
  excerpt: string;
  eyebrow: string;
}

const CURATED_PRESENTATIONS: NewsPresentation[] = [
  {
    eyebrow: "Nhật ký cảm hứng",
    topic: "Không gian sống",
    title: "Cách chọn giường ngủ và tủ áo cho phòng nhỏ mà vẫn thoáng",
    excerpt:
      "Một vài điều chỉnh về tỷ lệ, gam màu và kiểu cánh tủ có thể giúp phòng ngủ nhỏ trông nhẹ hơn, gọn hơn mà vẫn giữ được cảm giác ấm áp.",
  },
  {
    eyebrow: "Phối cảnh tinh tế",
    topic: "Phòng khách",
    title: "Phối sofa, bàn trà và thảm để phòng khách hài hòa hơn",
    excerpt:
      "Khi sofa, bàn trà và thảm được đặt đúng nhịp, phòng khách sẽ có chiều sâu hơn và tạo cảm giác chỉn chu mà không cần quá nhiều chi tiết.",
  },
  {
    eyebrow: "Chất liệu và sắc độ",
    topic: "Căn hộ hiện đại",
    title: "Những gam màu giúp căn hộ hiện đại trông ấm và dễ ở hơn",
    excerpt:
      "Các sắc be, nâu sáng, kem và xám ấm là nền tốt để căn hộ hiện đại bớt lạnh, đồng thời làm nổi bật vẻ đẹp của gỗ, vải và ánh sáng tự nhiên.",
  },
];

function clampExcerpt(value: string, maxLength = 150) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function getNewsPresentation(article: NewsArticle, index: number): NewsPresentation {
  const curated = CURATED_PRESENTATIONS[index];
  if (curated) {
    return curated;
  }

  return {
    eyebrow: article.topic || "Cảm hứng DOMORA",
    topic: article.topic || "Tin tức",
    title: article.title,
    excerpt: clampExcerpt(article.content),
  };
}
