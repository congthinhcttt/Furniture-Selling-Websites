export default function StorePage() {
  return (
    <section className="info-page">
      <div className="info-page-hero info-page-hero-store">
        <div className="container">
          <p className="info-page-kicker">Trải nghiệm trực tiếp</p>
          <h1 className="info-page-title">Cửa hàng</h1>
          <p className="info-page-desc">
            Ghé thăm không gian trải nghiệm của DOMORA để xem chất liệu, tỷ lệ sản phẩm và nhận tư
            vấn trực tiếp.
          </p>
        </div>
      </div>

      <div className="container info-page-section">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-4">
            <div className="info-card h-100">
              <h3>DOMORA Experience Hub</h3>
              <p>HUTECH E2, TP. Thủ Đức, TP. Hồ Chí Minh</p>
              <p>09:00 - 20:30 mỗi ngày</p>
              <p>
                Không gian trưng bày tập trung vào phòng khách, phòng ngủ, góc làm việc và các mẫu
                trang trí dễ ứng dụng cho căn hộ và nhà phố.
              </p>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="info-card h-100">
              <h3>Bản đồ cửa hàng</h3>
              <div className="store-map-wrap">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4276767170695!2d106.78212887583891!3d10.855040057737108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527006db97ff1%3A0x8ed7036831a229d3!2sHUTECH%20E%202!5e0!3m2!1svi!2s!4v1774641361046!5m2!1svi!2s"
                  width="600"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ cửa hàng DOMORA"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
