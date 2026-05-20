'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import OrdersDashboard from '@/components/admin/OrdersDashboard';

export default function OrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const isAuth = document.cookie.includes('admin_token=authenticated');
    setIsAuthenticated(isAuth);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-titi-stone-50">
        <div className="text-xl font-bold text-titi-stone-500 animate-pulse">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <OrdersDashboard onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
  );
}
