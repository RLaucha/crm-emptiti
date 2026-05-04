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
