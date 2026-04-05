const coreValues = [
  {
    title: "Ấm áp vừa đủ",
    description: "Chúng tôi ưu tiên những lựa chọn khiến căn nhà có cảm giác gần gũi, nhẹ nhàng và dễ sống lâu dài.",
  },
  {
    title: "Tinh tế trong công năng",
    description: "Thẩm mỹ không tách rời nhu cầu sử dụng. Một món nội thất đẹp phải đồng thời dễ dùng mỗi ngày.",
  },
  {
    title: "Bền vững theo thời gian",
    description: "DOMORA chọn ngôn ngữ thiết kế tiết chế để không gian vẫn giữ được vẻ hài hòa sau nhiều mùa sống.",
  },
];

const designPrinciples = [
  "Một căn nhà đẹp không cần quá nhiều đồ, chỉ cần những lựa chọn đúng.",
  "Màu sắc, vật liệu và tỷ lệ nên hỗ trợ nhau thay vì cạnh tranh.",
  "Không gian hiện đại vẫn có thể ấm nếu mọi chi tiết được chọn với sự tiết chế.",
];

export default function AboutPage() {
  return (
    <section className="info-page info-page-about">
      <div className="info-page-hero info-page-hero-about">
        <div className="container">
          <div className="info-about-hero-shell">
            <p className="info-page-kicker">Về DOMORA</p>
            <p className="info-about-hero-eyebrow">Nội thất cho nhịp sống hiện đại, nơi thẩm mỹ đi cùng công năng</p>
            <h1 className="info-page-title">Chúng tôi xây dựng DOMORA như một nơi chọn nội thất dễ tin và dễ sống cùng</h1>
            <p className="info-page-desc">
              DOMORA được hình thành từ một suy nghĩ đơn giản: nhà đẹp không cần phô trương. Chỉ cần những món nội
              thất đúng tỷ lệ, đúng chất liệu và phù hợp với cách mỗi người sống mỗi ngày.
            </p>
          </div>
        </div>
      </div>

      <div className="container info-page-section info-about-section">
        <div className="info-about-shell">
          <section className="info-about-story">
            <div className="info-about-story__lead">
              <span className="info-card-tag">Câu chuyện thương hiệu</span>
              <h2>DOMORA bắt đầu từ mong muốn làm cho việc chọn nội thất trở nên rõ ràng hơn</h2>
            </div>

            <div className="info-about-story__body">
              <p>
                Chúng tôi nhìn thấy rất nhiều người muốn chăm chút cho căn hộ hoặc nhà phố của mình, nhưng lại dễ rơi
                vào cảm giác quá tải giữa quá nhiều lựa chọn. DOMORA ra đời để đơn giản hóa điều đó bằng một hệ nội
                thất được chọn lọc kỹ, đủ đẹp để tạo cảm hứng và đủ thực tế để dùng lâu dài.
              </p>
              <p>
                Mỗi thiết kế tại DOMORA đều hướng đến sự hài hòa giữa hình thức và đời sống hằng ngày. Chúng tôi không
                theo đuổi cảm giác hào nhoáng ngắn hạn, mà ưu tiên những không gian gọn gàng, ấm áp và có chiều sâu
                vừa đủ để bạn thật sự muốn trở về mỗi ngày.
              </p>
            </div>
          </section>

          <section className="info-about-values">
            <div className="info-about-section-head">
              <div>
                <p className="info-page-kicker">Giá trị cốt lõi</p>
                <h2>Ba điều DOMORA luôn giữ lại trong mọi lựa chọn</h2>
              </div>
              <p>Đó là cách chúng tôi giữ cho thương hiệu có gu, có định hướng và vẫn gần với nhu cầu sống thật.</p>
            </div>

            <div className="info-about-values-grid">
              {coreValues.map((item) => (
                <article className="info-about-value-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="info-about-principles">
            <div className="info-about-principles__copy">
              <span className="info-card-tag">Triết lý thiết kế</span>
              <h2>Chúng tôi tin vào vẻ đẹp tiết chế, cân bằng và bền với thời gian</h2>
              <p>
                Một không gian sống dễ chịu thường không đến từ việc thêm thật nhiều chi tiết. Nó đến từ cách mọi món
                đồ đứng cạnh nhau vừa đủ, để ánh sáng, vật liệu và nhịp sinh hoạt có chỗ thở.
              </p>
            </div>

            <ul className="info-about-principles__list">
              {designPrinciples.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="info-about-experience">
            <span className="info-card-tag">Trải nghiệm DOMORA</span>
            <h2>Điều chúng tôi muốn mang lại không chỉ là một món nội thất, mà là cảm giác yên tâm khi lựa chọn</h2>
            <p>
              Từ website đến showroom, DOMORA cố gắng giữ mọi trải nghiệm đủ rõ ràng để bạn dễ hình dung, dễ so sánh
              và dễ quyết định hơn. Chúng tôi muốn việc chọn nội thất cho căn hộ hay nhà phố trở thành một quá trình
              nhẹ nhàng, có cảm hứng và đáng tin.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
