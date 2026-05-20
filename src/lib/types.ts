// =============================================
// Tipos de Las Empanadas de Titi
// =============================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  total_purchases: number;
  last_purchase_at: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  customer_id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'item';
  value: number;
  is_used: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'empanada' | 'canastita';
  image: string;
  featured?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'empanada' | 'canastita';
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pendiente' | 'cocina' | 'en_camino' | 'entregado';
  delivery_type: 'retiro' | 'envio';
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  // Joined from customers
  customer_name?: string;
  customer_phone?: string;
}
