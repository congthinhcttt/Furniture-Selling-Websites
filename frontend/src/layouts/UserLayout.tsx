import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { getMyCart } from "../api/cartApi";
import { getCategories, getCategoryGroups } from "../api/categoryApi";
import Footer from "../components/common/Footer";
import FloatingSupport from "../components/common/FloatingSupport";
import Header from "../components/common/Header";
import { useAuth } from "../hooks/useAuth";
import type { Category } from "../types/category";
import type { CategoryGroup } from "../types/categoryGroup";

export default function UserLayout() {
  const { auth } = useAuth();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [groupData, categoryData] = await Promise.all([
          getCategoryGroups(),
          getCategories(),
        ]);

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

  return (
    <>
      <Header categoryGroups={categoryGroups} categories={categories} cartCount={cartCount} />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingSupport />
    </>
  );
}
