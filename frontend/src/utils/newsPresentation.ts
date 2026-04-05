import type { NewsArticle } from "../types/news";

interface NewsHeroContent {
  kicker: string;
  title: string;
  description: string;
  eyebrow: string;
}

interface NewsArticlePresentation {
  topic: string;
  title: string;
  excerpt: string;
}

const PRESENTATION_BY_TITLE: Array<{
  match: string[];
  presentation: NewsArticlePresentation;
}> = [
  {
    match: ["giường", "tủ", "phòng nhỏ"],
    presentation: {
      topic: "Phòng ngủ gọn đẹp",
      title: "Cách chọn giường ngủ và tủ áo cho phòng nhỏ mà vẫn thoáng",
      excerpt:
        "Ưu tiên tỷ lệ gọn, bề mặt sáng và cấu trúc lưu trữ vừa đủ để phòng ngủ nhỏ vẫn nhẹ mắt, ngăn nắp và dễ thở.",
    },
  },
  {
    match: ["sofa", "bàn trà", "thảm"],
    presentation: {
      topic: "Phòng khách hài hòa",
      title: "Phối sofa, bàn trà và thảm để phòng khách hài hòa hơn",
      excerpt:
        "Chỉ cần cân đúng tỷ lệ và tiết chế màu sắc, khu vực tiếp khách sẽ trông liền mạch, ấm áp và có chiều sâu hơn.",
    },
  },
  {
    match: ["xu hướng", "2026", "căn hộ", "màu"],
    presentation: {
      topic: "Bảng màu hiện đại",
      title: "Những gam màu giúp căn hộ hiện đại trông ấm và dễ ở hơn",
      excerpt:
        "Be cát, nâu gỗ nhạt và xanh xám dịu là những nền màu khiến không gian hiện đại bớt lạnh mà vẫn giữ vẻ tinh gọn.",
    },
  },
];

export function getNewsHeroContent(): NewsHeroContent {
  return {
    kicker: "Tạp chí cảm hứng DOMORA",
    eyebrow: "Không gian sống được nuôi dưỡng từ những lựa chọn tinh tế",
    title: "Ý tưởng nội thất đẹp, chậm rãi và có chiều sâu hơn mỗi ngày",
    description:
      "Từ cách phối đồ cho phòng khách đến những gam màu giúp căn hộ thêm ấm, DOMORA chọn lọc các bài viết ngắn gọn, giàu cảm hứng và dễ ứng dụng cho không gian sống hiện đại.",
  };
}

export function getNewsImageUrlFallback() {
  return "https://via.placeholder.com/1200x800?text=Tin+t%E1%BB%A9c+DOMORA";
}

export function getNewsArticlePresentation(article: NewsArticle): NewsArticlePresentation {
  const normalizedTitle = `${article.topic} ${article.title}`.toLowerCase();
  const matched = PRESENTATION_BY_TITLE.find((item) =>
    item.match.every((token) => normalizedTitle.includes(token.toLowerCase()))
  );

  if (matched) {
    return matched.presentation;
  }

  const excerpt = buildNewsExcerpt(article.content);
  return {
    topic: article.topic || "Góc cảm hứng",
    title: article.title,
    excerpt,
  };
}

export function buildNewsExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "Những gợi ý ngắn gọn từ DOMORA để không gian sống trông tinh tế, cân bằng và dễ ứng dụng hơn.";
  }

  if (normalized.length <= 150) {
    return normalized;
  }

  return `${normalized.slice(0, 147).trimEnd()}...`;
}
