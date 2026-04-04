import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Category } from "../../types/category";
import type { CategoryGroup } from "../../types/categoryGroup";

interface HeaderProps {
  categoryGroups?: CategoryGroup[];
  categories?: Category[];
  cartCount?: number;
}

const MENU_CLOSE_DELAY = 260;

export default function Header({
  categoryGroups = [],
  categories = [],
  cartCount = 0,
}: HeaderProps) {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const isAdmin = auth?.role === "ADMIN" || auth?.role === "ROLE_ADMIN";
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const closeTimerRef = useRef<number | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openProductMenu = () => {
    clearCloseTimer();
    if (!activeGroupId && categoryGroups.length > 0) {
      setActiveGroupId(categoryGroups[0].id);
    }
    setIsProductMenuOpen(true);
  };

  const scheduleCloseProductMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsProductMenuOpen(false);
      setActiveGroupId(categoryGroups[0]?.id ?? null);
      closeTimerRef.current = null;
    }, MENU_CLOSE_DELAY);
  };

  useEffect(() => {
    if (categoryGroups.length === 0) {
      setActiveGroupId(null);
      return;
    }

    setActiveGroupId((current) => {
      if (current && categoryGroups.some((group) => group.id === current)) {
        return current;
      }
      return categoryGroups[0].id;
    });
  }, [categoryGroups]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categoriesByGroup = categoryGroups.map((group) => ({
    ...group,
    items: categories.filter((category) => category.groupId === group.id),
  }));

  const activeGroup =
    categoriesByGroup.find((group) => group.id === activeGroupId) ?? categoriesByGroup[0] ?? null;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchKeyword.trim();
    setIsSearchOpen(false);
    navigate(keyword ? `/products?q=${encodeURIComponent(keyword)}` : "/products");
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light domora-navbar sticky-top">
        <div className="container py-2">
          <Link className="navbar-brand brand-logo" to="/">
            DOMORA
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#userNavbar"
            aria-controls="userNavbar"
            aria-expanded="false"
            aria-label="Bật tắt điều hướng"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="userNavbar">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3">
              <li className="nav-item">
                <Link className="nav-link nav-item-link" to="/">
                  Trang chủ
                </Link>
              </li>

              <li
                className={`nav-item product-dropdown position-relative ${isProductMenuOpen ? "open" : ""}`}
                onMouseEnter={openProductMenu}
                onMouseLeave={scheduleCloseProductMenu}
              >
                <Link className="nav-link nav-item-link product-dropdown-trigger" to="/products">
                  Sản phẩm
                  <i className={`bi bi-chevron-down product-dropdown-icon ${isProductMenuOpen ? "open" : ""}`}></i>
                </Link>

                {categoryGroups.length > 0 && (
                  <>
                    <div className="product-dropdown-bridge" aria-hidden="true"></div>
                    <div className="group-category-dropdown simple-group-dropdown">
                      <div className="simple-group-dropdown-panel">
                        <div className="simple-group-dropdown-groups">
                          {categoriesByGroup.map((group) => (
                            <div
                              key={group.id}
                              className={`simple-group-dropdown-item ${activeGroup?.id === group.id ? "active" : ""}`}
                              onMouseEnter={() => setActiveGroupId(group.id)}
                            >
                              <Link
                                className="simple-group-dropdown-link"
                                to={`/products?groupId=${group.id}`}
                                onClick={() => setIsProductMenuOpen(false)}
                              >
                                <span>{group.name}</span>
                              </Link>
                              <i className="bi bi-chevron-right"></i>
                            </div>
                          ))}
                        </div>

                        <div className="simple-group-dropdown-categories">
                          {activeGroup && activeGroup.items.length > 0 ? (
                            activeGroup.items.map((category) => (
                              <Link
                                key={category.id}
                                className="simple-group-category-item"
                                to={`/products?groupId=${activeGroup.id}&categoryIds=${category.id}`}
                                onClick={() => setIsProductMenuOpen(false)}
                              >
                                {category.name}
                              </Link>
                            ))
                          ) : (
                            <Link
                              className="simple-group-category-item empty"
                              to={activeGroup ? `/products?groupId=${activeGroup.id}` : "/products"}
                              onClick={() => setIsProductMenuOpen(false)}
                            >
                              Xem tất cả sản phẩm
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-item-link" to="/news">
                  Tin tức
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-item-link" to="/stores">
                  Cửa hàng
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-item-link" to="/about">
                  Về DOMORA
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 domora-actions">
              <div className={`header-search ${isSearchOpen ? "open" : ""}`} ref={searchBoxRef}>
                <form className="header-search-inline" onSubmit={handleSearchSubmit}>
                  <button
                    type="button"
                    className="header-search-trigger"
                    aria-label="Tìm kiếm"
                    onClick={() => setIsSearchOpen((value) => !value)}
                  >
                    <i className="bi bi-search"></i>
                  </button>

                  <input
                    ref={searchInputRef}
                    type="search"
                    className="header-search-input"
                    placeholder="Tìm sản phẩm bạn cần..."
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                  />
                  <button type="submit" className="header-search-submit">
                    Tìm
                  </button>
                </form>
              </div>

              <Link to="/cart" className="icon-btn position-relative" aria-label="Giỏ hàng">
                <i className="bi bi-bag"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              <div className="dropdown">
                <button className="icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-person"></i>
                </button>

                <ul className="dropdown-menu dropdown-menu-end domora-dropdown">
                  {!auth && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/login">
                          Đăng nhập
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/register">
                          Đăng ký
                        </Link>
                      </li>
                    </>
                  )}

                  {auth && (
                    <>
                      <li>
                        <span className="dropdown-item-text fw-bold text-dark">
                          Xin chào, {auth.fullName || auth.username}
                        </span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account/profile">
                          Thông tin cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account/orders">
                          Đơn hàng của tôi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account/addresses">
                          Địa chỉ của tôi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/account/reviews">
                          Đánh giá của tôi
                        </Link>
                      </li>

                      {isAdmin && (
                        <li>
                          <Link className="dropdown-item" to="/admin">
                            Quản trị
                          </Link>
                        </li>
                      )}

                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={logout}
                          className="dropdown-item text-danger border-0 bg-transparent w-100 text-start"
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
