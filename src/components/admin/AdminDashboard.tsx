'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CouponData {
  id: string;
  code: string;
  is_used: boolean;
  created_at: string;
  customer_name: string;
  customer_phone: string;
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      if (res.status === 401) {
        onLogout();
        return;
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'Error al cargar datos');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_used: !currentStatus }),
      });
      const json = await res.json();
      
      if (json.success) {
        // Update local state
        setData((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_used: !currentStatus } : item
          )
        );
      } else {
        alert('Error al actualizar: ' + json.error);
      }
    } catch (err) {
      alert('Error de red al actualizar');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLogout();
  };

  const filteredData = data.filter(
    (item) =>
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_phone.includes(searchTerm) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCoupons = data.length;
  const usedCoupons = data.filter((d) => d.is_used).length;
  const pendingCoupons = totalCoupons - usedCoupons;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-titi-stone-50">
        <div className="text-xl font-bold text-titi-stone-500 animate-pulse">Cargando panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-titi-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-titi-stone-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-titi-orange">
              <Image src="/img/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <h1 className="font-heading font-bold text-xl text-titi-stone-900">
              Admin Club Titi
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-titi-stone-500 hover:text-red-500 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center justify-center">
            <span className="text-titi-stone-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Registros</span>
            <span className="text-4xl font-bold text-titi-stone-900">{totalCoupons}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center justify-center">
            <span className="text-titi-stone-500 text-sm font-semibold uppercase tracking-wider mb-1">Cupones Pendientes</span>
            <span className="text-4xl font-bold text-titi-orange">{pendingCoupons}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center justify-center">
            <span className="text-titi-stone-500 text-sm font-semibold uppercase tracking-wider mb-1">Cupones Canjeados</span>
            <span className="text-4xl font-bold text-titi-green">{usedCoupons}</span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-titi-stone-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-titi-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors"
            />
          </div>
          <div className="text-sm text-titi-stone-500">
            Mostrando {filteredData.length} resultados
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-titi-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-titi-stone-50 border-b border-titi-stone-200">
                  <th className="px-6 py-4 font-semibold text-titi-stone-700 text-sm uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-titi-stone-700 text-sm uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-titi-stone-700 text-sm uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 font-semibold text-titi-stone-700 text-sm uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 font-semibold text-titi-stone-700 text-sm uppercase tracking-wider text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-titi-stone-100">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-titi-stone-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-titi-stone-500">
                        {new Date(item.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-titi-stone-900">
                        {item.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-titi-stone-600">
                        <a href={`https://wa.me/${item.customer_phone}`} target="_blank" rel="noopener noreferrer" className="hover:text-titi-green underline decoration-titi-green/30 underline-offset-2">
                          {item.customer_phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-md font-mono text-sm font-bold ${
                          item.is_used ? 'bg-titi-stone-100 text-titi-stone-400 line-through' : 'bg-titi-cream text-titi-orange border border-titi-orange/20'
                        }`}>
                          {item.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleCoupon(item.id, item.is_used)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            item.is_used
                              ? 'bg-titi-stone-100 text-titi-stone-500 hover:bg-titi-stone-200'
                              : 'bg-titi-green text-white hover:bg-titi-green-dark shadow-md shadow-titi-green/20 hover:-translate-y-0.5'
                          }`}
                        >
                          {item.is_used ? 'Deshacer (Habilitar)' : 'Marcar como Canjeado'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-titi-stone-500">
                      No se encontraron registros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
