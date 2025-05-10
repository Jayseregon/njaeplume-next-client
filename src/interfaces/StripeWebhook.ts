import { OrderStatus } from "@/generated/client";
import enMessages from "@/messages/en.json"; // Import for type definition

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

// Define the type for PaymentConfirmation messages based on the JSON structure
type PaymentConfirmationMessages = typeof enMessages.PaymentConfirmation;
// Define the type for Category messages
type CategoryMessages = typeof enMessages.ProductCard.category;
// Define the type for PaymentFailure messages
type PaymentFailureMessages = typeof enMessages.PaymentFailure;

export interface PaymentConfirmationProps {
  displayId: string;
  amount: number;
  createdAt: string | Date;
  items: EmailOrderItem[];
  customerName: string;
  downloadLink?: string;
  messages: PaymentConfirmationMessages;
  categoryMessages: CategoryMessages;
}

export interface FailedPaymentProps {
  customerName: string;
  messages: PaymentFailureMessages;
}
