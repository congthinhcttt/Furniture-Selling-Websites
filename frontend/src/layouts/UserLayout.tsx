import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getMyCart } from "../api/cartApi";
import { getCategories, getCategoryGroups } from "../api/categoryApi";
import { getWishlistCount } from "../api/wishlistApi";
import Footer from "../components/common/Footer";
import FloatingSupport from "../components/common/FloatingSupport";
import Header from "../components/common/Header";
import { useAuth } from "../hooks/useAuth";
import type { Category } from "../types/category";
import type { CategoryGroup } from "../types/categoryGroup";
import { getCompareCount } from "../utils/compareStorage";

export default function UserLayout() {
  const { auth } = useAuth();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [compareCount, setCompareCount] = useState(getCompareCount());

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [groupData, categoryData] = await Promise.all([getCategoryGroups(), getCategories()]);
        setCategoryGroups(groupData);
        setCategories(categoryData);
      } catch (error) {
        console.error("Failed to load catalog data", error);
      }
    };

    void fetchCatalog();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!auth?.token) {
        setCartCount(0);
        return;
      }

      try {
        const cart = await getMyCart();
        setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };

    void fetchCart();

    const handleCartUpdated = () => {
      void fetchCart();
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, [auth]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!auth?.token) {
        setWishlistCount(0);
        return;
      }

      try {
        setWishlistCount(await getWishlistCount());
      } catch {
        setWishlistCount(0);
      }
    };

    void fetchWishlist();

    const handleWishlistUpdated = () => {
      void fetchWishlist();
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdated);
    };
  }, [auth]);

  useEffect(() => {
    const syncCompareCount = () => {
      setCompareCount(getCompareCount());
    };

    syncCompareCount();
    window.addEventListener("compare-updated", syncCompareCount);

    return () => {
      window.removeEventListener("compare-updated", syncCompareCount);
    };
  }, []);

  return (
    <>
      <Header
        categoryGroups={categoryGroups}
        categories={categories}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        compareCount={compareCount}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingSupport />
    </>
  );
}
