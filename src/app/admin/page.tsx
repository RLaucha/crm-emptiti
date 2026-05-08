'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si existe la cookie (muy básico, el backend valida de todos modos)
    const checkAuth = () => {
      const isAuth = document.cookie.includes('admin_token=authenticated');
      setIsAuthenticated(isAuth);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-titi-stone-50">
        <div className="text-xl font-bold text-titi-stone-500 animate-pulse">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminDashboard onLogout={() => setIsAuthenticated(false)} />
  ) : (
    <AdminLogin onSuccess={() => setIsAuthenticated(true)} />
  );
}
