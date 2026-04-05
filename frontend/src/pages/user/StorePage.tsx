const GOOGLE_MAPS_URL =
  "https://maps.google.com/?q=HUTECH+E2+Thu+Duc+Ho+Chi+Minh+City";

export default function StorePage() {
  return (
    <section className="info-page info-page-store">
      <div className="info-page-hero info-page-hero-store">
        <div className="container">
          <div className="info-store-hero-shell">
            <p className="info-page-kicker">Showroom DOMORA</p>
            <p className="info-store-hero-eyebrow">Chạm vào chất liệu, nhìn rõ tỷ lệ và cảm nhận không gian trước khi chọn</p>
            <h1 className="info-page-title">Một showroom đủ yên để bạn hình dung căn nhà tương lai</h1>
            <p className="info-page-desc">
              Ghé DOMORA để xem trực tiếp sofa, giường ngủ, bàn trà và các bảng màu hoàn thiện. Đây là nơi bạn có
              thể so sánh chất liệu, cảm nhận kích thước thật và chọn giải pháp phù hợp cho căn hộ hoặc nhà phố.
            </p>
          </div>
        </div>
      </div>

      <div className="container info-page-section info-store-section">
        <div className="info-store-shell">
          <section className="info-store-overview">
            <div className="info-store-overview__intro">
              <span className="info-card-tag">Không gian trải nghiệm</span>
              <h2>DOMORA Experience Hub</h2>
              <p>
                Không chỉ là nơi xem sản phẩm, showroom được bố trí như một căn nhà thu nhỏ để bạn dễ hình dung cách
                phối nội thất trong không gian sống thật. Từng khu vực đều ưu tiên ánh sáng, khoảng thở và sự cân bằng
                giữa chất liệu, màu sắc và công năng.
              </p>
            </div>

            <div className="info-store-overview__details">
              <article className="info-store-detail-card">
                <span className="info-store-detail-card__label">Địa chỉ</span>
                <strong>HUTECH E2, TP. Thủ Đức, TP. Hồ Chí Minh</strong>
                <p>Dễ ghé qua để xem trực tiếp các thiết kế dành cho căn hộ hiện đại và nhà phố gọn đẹp.</p>
              </article>

              <article className="info-store-detail-card">
                <span className="info-store-detail-card__label">Giờ mở cửa</span>
                <strong>09:00 - 20:30 mỗi ngày</strong>
                <p>Khung giờ linh hoạt để bạn ghé xem sau giờ làm hoặc dành thời gian cuối tuần cho việc chọn nội thất.</p>
              </article>

              <article className="info-store-detail-card">
                <span className="info-store-detail-card__label">Phù hợp cho</span>
                <strong>Khách cần xem thật trước khi quyết định</strong>
                <p>Đặc biệt phù hợp khi bạn muốn so màu, kiểm tra tỷ lệ sản phẩm và cảm nhận bề mặt vật liệu.</p>
              </article>
            </div>
          </section>

          <section className="info-store-experience">
            <div className="info-store-section-head">
              <div>
                <p className="info-page-kicker">Trải nghiệm tại showroom</p>
                <h2>Xem, chạm và so sánh mọi thứ trong bối cảnh thật</h2>
              </div>
              <p>
                Từ phòng khách đến phòng ngủ, mọi sắp đặt đều hướng đến việc giúp bạn dễ hình dung hơn trước khi đặt
                nội thất cho ngôi nhà của mình.
              </p>
            </div>

            <div className="info-store-experience-grid">
              <article className="info-store-experience-card">
                <h3>Xem chất liệu ngoài đời thực</h3>
                <p>Kiểm tra vân gỗ, màu vải, độ hoàn thiện bề mặt và cảm giác chạm tay thay vì chỉ xem qua màn hình.</p>
              </article>

              <article className="info-store-experience-card">
                <h3>Cảm nhận đúng tỷ lệ sản phẩm</h3>
                <p>Quan sát kích thước sofa, bàn trà, giường ngủ hay tủ áo trong tương quan thật để chọn món phù hợp.</p>
              </article>

              <article className="info-store-experience-card">
                <h3>So bảng màu cho căn hộ và nhà phố</h3>
                <p>Đối chiếu các tông gỗ, vải và màu hoàn thiện để tìm ra phối hợp hài hòa, ấm và dễ ứng dụng lâu dài.</p>
              </article>
            </div>
          </section>

          <section className="info-store-map-panel">
            <div className="info-store-map-copy">
              <span className="info-card-tag">Đường đến showroom</span>
              <h2>Ghé xem trực tiếp trước khi chốt phương án nội thất</h2>
              <p>
                Nếu bạn đang hoàn thiện căn hộ hoặc nhà phố, một buổi ghé showroom sẽ giúp việc ra quyết định rõ ràng
                hơn rất nhiều. Bạn có thể xem bố cục sản phẩm, cảm nhận màu sắc dưới ánh sáng thật và trao đổi trực
                tiếp với đội ngũ DOMORA.
              </p>
              <div className="info-store-map-actions">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-domora"
                >
                  Chỉ đường đến showroom
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-domora-outline"
                >
                  Xem trên Google Maps
                </a>
              </div>
            </div>

            <div className="info-store-map-frame">
              <div className="store-map-wrap">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4276767170695!2d106.78212887583891!3d10.855040057737108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527006db97ff1%3A0x8ed7036831a229d3!2sHUTECH%20E%202!5e0!3m2!1svi!2s!4v1774641361046!5m2!1svi!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ showroom DOMORA"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
