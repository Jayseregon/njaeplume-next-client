import { OrderStatus } from "@/generated/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  zip_file_name: string;
  slug: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  downloadCount: number;
  downloadedAt?: string;
}

export interface Order {
  id: string;
  displayId: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  stripeCheckoutSessionId: string;
  stripeChargeId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// Types for email sending functions
export interface OrderEmailData {
  order: Order;
  customerEmail: string;
  customerName?: string;
}

export interface EmailOrderItem {
  product: {
    name: string;
    category: string;
    price: number;
  };
}

export interface PaymentConfirmationProps {
  displayId: string;
  amount: number;
  createdAt: string | Date;
  items: EmailOrderItem[];
  customerName: string;
  downloadLink?: string;
}

export interface FailedPaymentProps {
  customerName: string;
}
