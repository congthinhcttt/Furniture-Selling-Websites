export interface Product {
  id: number;
  name: string;
  description?: string;
  shortDescription?: string;
  price: number;
  image?: string;
  material?: string;
  color?: string;
  warranty?: string;
  style?: string;
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
