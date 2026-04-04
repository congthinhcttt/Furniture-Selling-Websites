import { useEffect, useMemo, useState } from "react";
import { FaArrowUp, FaComments, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";

type ChatMessage = {
  id: number;
  role: "bot" | "user";
  content: string;
};

const ZALO_PHONE = "0123456789";
const QUICK_QUESTIONS = [
  "Cửa hàng ở đâu?",
  "Có giao hàng không?",
  "Thanh toán thế nào?",
  "Bảo hành bao lâu?",
];

const BOT_WELCOME =
  "Xin chào, tôi có thể hỗ trợ các câu hỏi đơn giản về địa chỉ, giao hàng, thanh toán, bảo hành và liên hệ.";

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getBotReply(input: string) {
  const normalized = normalizeText(input);

  if (!normalized) {
    return "Bạn hãy nhập câu hỏi ngắn như: cửa hàng ở đâu, có giao hàng không, thanh toán thế nào.";
  }

  if (
    normalized.includes("xin chao") ||
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("chao")
  ) {
    return "Xin chào, bạn có thể hỏi về địa chỉ showroom, giao hàng, thanh toán, bảo hành hoặc liên hệ Zalo.";
  }

  if (
    normalized.includes("o dau") ||
    normalized.includes("dia chi") ||
    normalized.includes("cua hang") ||
    normalized.includes("showroom")
  ) {
    return "Showroom DOMORA hiện ở 123 Nguyễn Văn Cừ, TP. Hồ Chí Minh. Thời gian mở cửa: 08:00 - 21:00 mỗi ngày.";
  }

  if (
    normalized.includes("giao hang") ||
    normalized.includes("van chuyen") ||
    normalized.includes("ship") ||
    normalized.includes("delivery")
  ) {
    return "DOMORA có hỗ trợ giao hàng. Sau khi đặt hàng, nhân viên sẽ xác nhận đơn và thời gian giao phù hợp với khu vực của bạn.";
  }

  if (
    normalized.includes("thanh toan") ||
    normalized.includes("tra tien") ||
    normalized.includes("payment") ||
    normalized.includes("chuyen khoan")
  ) {
    return "Bạn có thể thanh toán khi đặt hàng theo hướng dẫn ở trang thanh toán. Nếu cần hỗ trợ nhanh, hãy liên hệ Zalo bên dưới.";
  }

  if (
    normalized.includes("bao hanh") ||
    normalized.includes("bao tri") ||
    normalized.includes("warranty")
  ) {
    return "Sản phẩm của DOMORA có chính sách bảo hành theo từng dòng sản phẩm. Bạn có thể để lại mã đơn hàng qua Zalo để được tư vấn chi tiết hơn.";
  }

  if (
    normalized.includes("lien he") ||
    normalized.includes("so dien thoai") ||
    normalized.includes("zalo") ||
    normalized.includes("hotline")
  ) {
    return `Bạn có thể liên hệ nhanh qua Zalo ${ZALO_PHONE} hoặc gọi số 0123 456 789 trong giờ làm việc 08:00 - 21:00.`;
  }

  return "Tôi mới hỗ trợ các câu hỏi đơn giản về địa chỉ, giao hàng, thanh toán, bảo hành và liên hệ. Bạn có thể thử hỏi ngắn gọn hơn.";
}

export default function FloatingSupport() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "bot", content: BOT_WELCOME },
  ]);

  const zaloLink = useMemo(() => `https://zalo.me/${ZALO_PHONE}`, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSendMessage = (input: string) => {
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    const botMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "bot",
      content: getBotReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, botMessage]);
    setQuestion("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(question);
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="floating-support">
        {showScrollTop && (
          <button
            type="button"
            className="floating-support__button floating-support__button--top"
            aria-label="Quay lại đầu trang"
            onClick={handleScrollTop}
          >
            <FaArrowUp />
          </button>
        )}

        <a
          href={zaloLink}
          target="_blank"
          rel="noreferrer"
          className="floating-support__button floating-support__button--zalo"
          aria-label="Liên hệ qua Zalo"
          title={`Zalo: ${ZALO_PHONE}`}
        >
          <SiZalo />
        </a>

        <button
          type="button"
          className="floating-support__button floating-support__button--chat"
          aria-label="Mở chatbot"
          onClick={() => setIsChatOpen((value) => !value)}
        >
          {isChatOpen ? <FaXmark /> : <FaComments />}
        </button>
      </div>

      {isChatOpen && (
        <div className="support-chatbot" role="dialog" aria-label="Chatbot hỗ trợ">
          <div className="support-chatbot__header">
            <div>
              <strong>DOMORA Assistant</strong>
              <p className="mb-0">Hỗ trợ câu hỏi đơn giản</p>
            </div>
            <button
              type="button"
              className="support-chatbot__close"
              aria-label="Đóng chatbot"
              onClick={() => setIsChatOpen(false)}
            >
              <FaXmark />
            </button>
          </div>

          <div className="support-chatbot__body">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`support-chatbot__message support-chatbot__message--${message.role}`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <div className="support-chatbot__quick">
            {QUICK_QUESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className="support-chatbot__quick-item"
                onClick={() => handleSendMessage(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form className="support-chatbot__form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={question}
              className="support-chatbot__input"
              placeholder="Nhập câu hỏi của bạn..."
              onChange={(event) => setQuestion(event.target.value)}
            />
            <button type="submit" className="support-chatbot__submit" aria-label="Gửi câu hỏi">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
