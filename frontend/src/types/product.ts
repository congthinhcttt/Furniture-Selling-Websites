export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  color?: string;
  width: number;
  length: number;
  stockQuantity: number;

  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  color?: string;
  width: number;
  length: number;
  stockQuantity: number;
  categoryId?: number;
  categoryName?: string;
}
