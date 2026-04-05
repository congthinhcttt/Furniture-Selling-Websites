import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowUp, FaComments, FaPaperPlane, FaSpinner, FaXmark } from "react-icons/fa6";
import { SiZalo } from "react-icons/si";
import { askChatbot, getChatbotQuickQuestions } from "../../api/chatbotApi";
import { getApiErrorMessage } from "../../api/authApi";
import type { ChatbotProductItem, ChatbotResponseData } from "../../types/chatbot";
import { buildImageUrl } from "../../utils/image";

type ChatMessage = {
  id: number;
  role: "bot" | "user";
  content: string;
  type?: ChatbotResponseData["type"];
  products?: ChatbotProductItem[];
  suggestions?: string[];
};

const ZALO_PHONE = "0123456789";
const FALLBACK_QUESTIONS = [
  "Sofa nào phù hợp phòng khách nhỏ?",
  "Có bàn ăn dưới 5 triệu không?",
  "Tôi muốn nội thất màu kem",
  "Chính sách giao hàng thế nào?",
];

const BOT_WELCOME =
  "Xin chào, tôi là trợ lý tư vấn của DOMORA. Bạn có thể hỏi về sản phẩm nội thất, giao hàng, thanh toán, bảo hành hoặc liên hệ hỗ trợ.";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")} đ`;
}

function createBotMessage(data: ChatbotResponseData): ChatMessage {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    role: "bot",
    content: data.reply,
    type: data.type,
    products: data.products || [],
    suggestions: data.suggestions || [],
  };
}

export default function FloatingSupport() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<string[]>(FALLBACK_QUESTIONS);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "bot", content: BOT_WELCOME, suggestions: FALLBACK_QUESTIONS },
  ]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const fetchQuickQuestions = async () => {
      try {
        const items = await getChatbotQuickQuestions();
        if (items.length > 0) {
          setQuickQuestions(items);
          setMessages((current) =>
            current.map((message, index) =>
              index === 0 ? { ...message, suggestions: items } : message
            )
          );
        }
      } catch {
        setQuickQuestions(FALLBACK_QUESTIONS);
      }
    };

    void fetchQuickQuestions();
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAsk = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askChatbot({ message: trimmed });
      setMessages((current) => [...current, createBotMessage(response)]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 2,
          role: "bot",
          type: "ERROR",
          content:
            getApiErrorMessage(
              error,
              "Tôi đang gặp chút trục trặc khi phản hồi. Bạn có thể thử lại sau hoặc mô tả ngắn gọn hơn."
            ) || "Tôi đang gặp chút trục trặc khi phản hồi.",
          suggestions: FALLBACK_QUESTIONS,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleAsk(question);
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
              <p className="mb-0">Tư vấn nội thất và hỗ trợ nhanh</p>
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

          <div className="support-chatbot__body" ref={bodyRef}>
            {messages.map((message) => (
              <div key={message.id} className="support-chatbot__message-wrap">
                <div
                  className={`support-chatbot__message support-chatbot__message--${message.role} ${
                    message.type ? `support-chatbot__message--${message.type.toLowerCase()}` : ""
                  }`}
                >
                  {message.content}
                </div>

                {message.products && message.products.length > 0 && (
                  <div className="support-chatbot__products">
                    {message.products.map((product) => (
                      <a
                        key={product.id}
                        href={product.detailUrl}
                        className="support-chatbot__product-card"
                      >
                        <img
                          src={buildImageUrl(
                            product.image,
                            "https://via.placeholder.com/160x120?text=DOMORA"
                          )}
                          alt={product.name}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <span>{formatPrice(product.price)}</span>
                          <p>{product.shortDescription || "Thiết kế phù hợp không gian hiện đại."}</p>
                          <em>Xem chi tiết</em>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="support-chatbot__suggestions">
                    {message.suggestions.map((item) => (
                      <button
                        key={`${message.id}-${item}`}
                        type="button"
                        className="support-chatbot__suggestion-item"
                        onClick={() => void handleAsk(item)}
                        disabled={loading}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="support-chatbot__loading">
                <FaSpinner className="support-chatbot__loading-icon" />
                <span>DOMORA đang tìm câu trả lời phù hợp...</span>
              </div>
            )}
          </div>

          <div className="support-chatbot__quick">
            {quickQuestions.map((item) => (
              <button
                key={item}
                type="button"
                className="support-chatbot__quick-item"
                onClick={() => void handleAsk(item)}
                disabled={loading}
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
              placeholder="Nhập câu hỏi về nội thất của bạn..."
              onChange={(event) => setQuestion(event.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="support-chatbot__submit"
              aria-label="Gửi câu hỏi"
              disabled={loading}
            >
              {loading ? <FaSpinner className="support-chatbot__submit-loading" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
