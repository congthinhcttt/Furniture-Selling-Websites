import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/common.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/floating-support.css";
import "./styles/home.css";
import "./styles/info-pages.css";
import "./styles/auth.css";
import "./styles/account.css";
import "./styles/admin.css";
import "./styles/cart.css";
import "./styles/compare.css";
import "./styles/promotion.css";
import "./styles/wishlist.css";
import "./styles/products.css";
import "./styles/product-detail.css";
import "./styles/review.css";
import "./styles/delivery-tracking.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
