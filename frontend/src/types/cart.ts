export interface CartItem {
  productId: number;
  productName: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  accountId: number;
  items: CartItem[];
  totalAmount: number;
}
