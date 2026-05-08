'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-titi-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-titi-orange">
            <Image
              src="/img/logo.png"
              alt="Las Empanadas de Titi"
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-titi-stone-900 mb-8 font-heading">
          Panel de Administración
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-titi-stone-700 mb-2">
              Contraseña Maestra
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-titi-stone-200 focus:border-titi-orange focus:outline-none transition-colors"
              placeholder="Ingresá la contraseña"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-titi-stone-900 hover:bg-titi-stone-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}
