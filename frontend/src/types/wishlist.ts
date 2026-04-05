export interface WishlistItem {
  productId: number;
  productName: string;
  price: number;
  image?: string;
  shortDescription?: string;
  categoryName?: string;
  createdAt: string;
  inWishlist: boolean;
}

export interface WishlistCheckResponse {
  productId: number;
  inWishlist: boolean;
}

export interface WishlistCountResponse {
  count: number;
}
