const values = [
  "Thiết kế cân bằng giữa thẩm mỹ, công năng và cảm giác sống thực tế.",
  "Chọn lọc bảng màu và chất liệu dễ phối trong nhiều kiểu không gian.",
  "Tạo trải nghiệm mua sắm rõ ràng, dễ hình dung và dễ ứng dụng.",
];

export default function AboutPage() {
  return (
    <section className="info-page">
      <div className="info-page-hero info-page-hero-about">
        <div className="container">
          <p className="info-page-kicker">Về thương hiệu</p>
          <h1 className="info-page-title">Về DOMORA</h1>
          <p className="info-page-desc">
            DOMORA theo đuổi tinh thần nội thất ấm, gọn và bền vững, nơi từng thiết kế đều phục vụ
            trực tiếp cho trải nghiệm sống hằng ngày.
          </p>
        </div>
      </div>

      <div className="container info-page-section">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-7">
            <div className="info-card info-card-large h-100">
              <h2>Câu chuyện thương hiệu</h2>
              <p>
                Chúng tôi xây dựng DOMORA như một không gian chọn lựa nội thất dễ tiếp cận, nơi
                khách hàng có thể tìm thấy các giải pháp cho phòng khách, phòng ngủ, phòng ăn và
                góc làm việc mà không phải đánh đổi giữa tính thẩm mỹ và tính ứng dụng.
              </p>
              <p>
                Mỗi bộ sưu tập đều được định hình theo nhu cầu sống thực tế: màu sắc dễ phối, tỷ lệ
                phù hợp với nhà phố và căn hộ, cùng trải nghiệm mua sắm rõ ràng từ danh mục cho đến
                trang chi tiết sản phẩm.
              </p>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="info-card h-100">
              <h2>Giá trị cốt lõi</h2>
              <ul className="info-list">
                {values.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
