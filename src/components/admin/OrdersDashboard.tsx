'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { supabaseRealtime } from '@/lib/supabase';
import { Order } from '@/lib/types';

type StatusFilter = 'todos' | 'pendiente' | 'cocina' | 'en_camino' | 'entregado';

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    emoji: '🟡',
    borderColor: 'border-l-titi-orange',
    badgeBg: 'bg-titi-orange/10 text-titi-orange',
    buttonLabel: '🔥 Pasar a Cocina',
    buttonBg: 'bg-titi-orange hover:bg-titi-orange-dark',
    nextStatus: 'cocina',
  },
  cocina: {
    label: 'En Cocina',
    emoji: '🔵',
    borderColor: 'border-l-titi-blue',
    badgeBg: 'bg-titi-blue/10 text-titi-blue',
    buttonLabel: '🚀 Enviar',
    buttonBg: 'bg-titi-blue hover:bg-titi-blue-dark',
    nextStatus: 'en_camino',
  },
  en_camino: {
    label: 'En Camino',
    emoji: '🟢',
    borderColor: 'border-l-titi-green',
    badgeBg: 'bg-titi-green/10 text-titi-green',
    buttonLabel: '✅ Marcar Entregado',
    buttonBg: 'bg-titi-green hover:bg-titi-green-dark',
    nextStatus: 'entregado',
  },
  entregado: {
    label: 'Entregado',
    emoji: '✅',
    borderColor: 'border-l-titi-stone-200',
    badgeBg: 'bg-titi-stone-100 text-titi-stone-500',
    buttonLabel: '',
    buttonBg: '',
    nextStatus: null,
  },
} as const;

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio notification not available');
  }
}

export default function OrdersDashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('todos');
  const [currentTime, setCurrentTime] = useState(new Date());

  const newOrderRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialLoad = useRef(true);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders);
      } else {
        setError(json.error || 'Error al cargar pedidos');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [onLogout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    if (!supabaseRealtime) return;

    const channel = supabaseRealtime
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          // Re-fetch to get customer data joined
          fetchOrders().then(() => {
            if (!isInitialLoad.current) {
              playNotificationSound();
            }
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as any;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updated.id ? { ...o, status: updated.status } : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      if (supabaseRealtime) {
        supabaseRealtime.removeChannel(channel);
      }
    };
  }, [fetchOrders]);

  // GSAP animation for new orders
  const animateNewOrder = useCallback((el: HTMLDivElement | null, orderId: string) => {
    if (!el) return;

    // Only animate if not initial load
    if (isInitialLoad.current) {
      newOrderRefs.current.set(orderId, el);
      return;
    }

    // Check if we already animated this
    if (newOrderRefs.current.has(orderId)) return;
    newOrderRefs.current.set(orderId, el);

    gsap.from(el, {
      y: -60,
      opacity: 0,
      scale: 0.9,
      duration: 0.7,
      ease: 'bounce.out',
    });

    gsap.to(el, {
      backgroundColor: '#FFF7ED',
      repeat: 5,
      yoyo: true,
      duration: 0.4,
      ease: 'power1.inOut',
      delay: 0.7,
    });
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        alert('Error al actualizar: ' + json.error);
      }
      // Realtime UPDATE event will refresh the card
    } catch (err) {
      alert('Error de red al actualizar');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLogout();
  };

  // Stats
  const stats = {
    pendiente: orders.filter((o) => o.status === 'pendiente').length,
    cocina: orders.filter((o) => o.status === 'cocina').length,
    en_camino: orders.filter((o) => o.status === 'en_camino').length,
    entregado: orders.filter((o) => o.status === 'entregado').length,
  };

  const filteredOrders =
    activeFilter === 'todos'
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-titi-stone-50">
        <div className="text-xl font-bold text-titi-stone-500 animate-pulse">
          Cargando comandas...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-titi-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-titi-stone-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-titi-orange">
              <Image src="/img/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-titi-stone-900">
                Comandas del Día
              </h1>
              <p className="text-xs text-titi-stone-500">
                {currentTime.toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-heading font-bold text-titi-stone-900 tabular-nums hidden sm:block">
              {currentTime.toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
            <a
              href="/admin"
              className="text-sm font-semibold text-titi-orange hover:text-titi-orange-dark transition-colors hidden sm:block"
            >
              Ver Cupones
            </a>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-titi-stone-500 hover:text-red-500 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center">
            <span className="text-titi-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              🟡 Pendientes
            </span>
            <span className="text-3xl font-bold text-titi-orange">{stats.pendiente}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center">
            <span className="text-titi-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              🔵 En Cocina
            </span>
            <span className="text-3xl font-bold text-titi-blue">{stats.cocina}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center">
            <span className="text-titi-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              🚀 En Camino
            </span>
            <span className="text-3xl font-bold text-titi-green">{stats.en_camino}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-titi-stone-100 flex flex-col items-center">
            <span className="text-titi-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
              ✅ Entregados
            </span>
            <span className="text-3xl font-bold text-titi-stone-500">{stats.entregado}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-titi-stone-100 mb-6 overflow-x-auto">
          <div className="flex min-w-max">
            {(['todos', 'pendiente', 'cocina', 'en_camino', 'entregado'] as StatusFilter[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                    activeFilter === tab
                      ? 'border-titi-orange text-titi-orange'
                      : 'border-transparent text-titi-stone-500 hover:text-titi-stone-700'
                  }`}
                >
                  {tab === 'todos'
                    ? `Todos (${orders.length})`
                    : `${STATUS_CONFIG[tab].emoji} ${STATUS_CONFIG[tab].label} (${stats[tab]})`}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-titi-stone-100 p-12 text-center">
            <div className="text-5xl mb-4">🥟</div>
            <p className="text-lg font-bold text-titi-stone-900">No hay pedidos</p>
            <p className="text-titi-stone-500 mt-1">
              {activeFilter === 'todos'
                ? 'Los pedidos aparecerán acá en tiempo real.'
                : `No hay pedidos con estado "${STATUS_CONFIG[activeFilter as keyof typeof STATUS_CONFIG]?.label || activeFilter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const orderNum = order.id.slice(-4).toUpperCase();
              const orderTime = new Date(order.created_at).toLocaleTimeString('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  ref={(el) => {
                    if (el) animateNewOrder(el, order.id);
                  }}
                  className={`bg-white rounded-2xl shadow-sm border border-titi-stone-100 border-l-4 ${config.borderColor} overflow-hidden transition-opacity ${
                    order.status === 'entregado' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-titi-stone-900">
                        #{orderNum}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badgeBg}`}>
                        {config.label}
                      </span>
                    </div>
                    <span className="text-sm text-titi-stone-500 font-medium">{orderTime}</span>
                  </div>

                  {/* Customer */}
                  <div className="px-5 pb-3 border-b border-titi-stone-100">
                    <p className="font-semibold text-titi-stone-900">{order.customer_name}</p>
                    <a
                      href={`https://wa.me/${order.customer_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-titi-stone-500 hover:text-titi-green underline decoration-titi-green/30 underline-offset-2"
                    >
                      {order.customer_phone}
                    </a>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-3">
                    <ul className="space-y-1.5">
                      {(order.items as any[]).map((item: any, i: number) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="text-titi-stone-700">
                            <span className="font-bold text-titi-stone-900">{item.quantity}x</span>{' '}
                            {item.name}
                          </span>
                          <span className="text-titi-stone-500 font-medium">
                            ${(item.price * item.quantity).toLocaleString('es-AR')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Total + Delivery */}
                  <div className="px-5 py-3 bg-titi-stone-50 border-t border-titi-stone-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-titi-stone-500">Total</span>
                      <span className="text-xl font-bold text-titi-stone-900">
                        ${Number(order.total_amount).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="text-sm text-titi-stone-600">
                      {order.delivery_type === 'retiro' ? (
                        <span>🏠 Retiro en local</span>
                      ) : (
                        <span>🛵 Envío: {order.delivery_address}</span>
                      )}
                    </div>
                    {order.notes && (
                      <div className="mt-2 text-sm text-titi-stone-500 italic flex items-start gap-1.5">
                        <span>📝</span>
                        <span>{order.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {config.nextStatus && (
                    <div className="px-5 py-3 border-t border-titi-stone-100">
                      <button
                        onClick={() => handleUpdateStatus(order.id, config.nextStatus!)}
                        className={`w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-md ${config.buttonBg}`}
                      >
                        {config.buttonLabel}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
